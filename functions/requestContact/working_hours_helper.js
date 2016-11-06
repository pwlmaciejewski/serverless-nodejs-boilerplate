import { FR as FRBankHolidays } from 'bankholiday';
import moment from 'moment';
import { fromJS, Map } from 'immutable';

export const workingHours = {
	start: 9,
	end: 19,
	slot: 2
};

const bankHolidays = FRBankHolidays
	.findAll(moment().year() + 1)
	.concat(FRBankHolidays.findAll(moment().year() + 1));

export const isBankHoliday = date => bankHolidays.indexOf(date.format('YYYY-MM-DD')) !== -1;

export const isWeekend = date => date.isoWeekday() > 5;

export const isWorkingDay = date => !(isWeekend(date) || isBankHoliday(date));

export const getWorkingDays = (num = 7) => {
	const { end, slot } = workingHours;
	let days = new Map();
	for (let offset = 0; days.size < num; offset++) {
		const date = moment().add(offset, 'days');
		if (!isWorkingDay(date)) continue;
		if (offset === 0 && moment().hour() >= end - slot) continue;
		const value = date.format('YYYY-MM-DD');
		days = days.set(value, fromJS({
			value,
			offset,
			date			
		}));
	}
	return days;
};

export const getContactSlots = date => {
	const { start, end, slot } = workingHours;
	let hours = new Map();
	for (let h1 = start, h2 = start + slot; h1 < end; h1 += slot, h2 += slot) {
		if (moment().isSame(date, 'day') && h1 <= moment().hour()) continue;
		const value = `${ h1 }-${ h2 }`;
		hours = hours.set(value, fromJS({ value, h1, h2 }));
	}
	return hours;
};