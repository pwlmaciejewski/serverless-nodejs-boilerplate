import moment from 'moment';
import { isLength } from 'validator';
import { isWorkingDay, getContactSlots } from './working_hours_helper';
import sendgrid from 'sendgrid';
import config from './config';
import { PhoneNumberUtil } from 'google-libphonenumber';

class ValidationError extends Error {
	constructor(message, code) {
		super(`[ValidationError] ${ message }`);
		this.code = code || `validation/${ message.toLowerCase().split(' ').join('-') }`;
		this.name = this.code;
	}
}

export function requestContact(event, context, callback) {
	let { name = '', phone = '', day = '', hour = '' } = event;
	name = name.trim();
	phone = phone.trim();
	day = day.trim();
	hour = hour.trim();
	if (!name) return callback(new ValidationError('Missing name'));
	if (!isLength(name, { min: 3 })) return callback(new ValidationError('Name too short'));
	if (!phone) return callback(new ValidationError('Missing phone'));
	const phoneUtil = PhoneNumberUtil.getInstance();
	let number;
	try {
		number = phoneUtil.parseAndKeepRawInput(phone, 'FR');		
	} catch(err) {
		return callback(new ValidationError('Invalid phone'));	
	}
	if (!phoneUtil.isValidNumber(number)) return callback(new ValidationError('Invalid phone'));
	if (!day) return callback(new ValidationError('Missing day'));
	const dayDate = moment(day, 'YYYY-MM-DD');
	if (!dayDate.isValid()) return callback(new ValidationError('Invalid day'));
	if (dayDate.isBefore(moment(), 'day')) return callback(new ValidationError('Invalid day'));
	if (!isWorkingDay(dayDate)) return callback(new ValidationError('Invalid day'));
	if (!hour) return callback(new ValidationError('Missing hour'));
	const slots = getContactSlots(dayDate);
	const slot = slots.get(hour);
	if (!slot) return callback(new ValidationError('Invalid hour'));
	sendEmail(name, phone, dayDate, slot.get('h1'), slot.get('h2'))
		.then(() => callback())
		.catch(err => callback(err));
}

export function sendEmail(name, phone, day, hour1, hour2) {
	return new Promise((resolve, reject) => {
		const sg = sendgrid(config.sendgrid.apiKey);
		const helper = sendgrid.mail;
		const fromEmail = new helper.Email(config.email.from);
		const subject = config.email.subject;
		const toEmail = new helper.Email(config.email.to);
		const content = new helper.Content('text/plain', `
			User ${ name } ${ phone } requested contact
			on ${ day.format('dddd DD MMMM') } between ${ hour1 }h and ${ hour2 }h.
		`);
		const mail = new helper.Mail(fromEmail, subject, toEmail, content);
		const request = sg.emptyRequest({
			method: 'POST',
			path: '/v3/mail/send',
			body: mail.toJSON()
		});
		sg.API(request, (err, res) => {
			if (err) return reject(err);
			resolve();
		});
	});
}