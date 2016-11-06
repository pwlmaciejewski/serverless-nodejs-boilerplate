import { expect } from 'chai';
import moment from 'moment';
import sinon from 'sinon';
import { getWorkingDays, getContactSlots, workingHours } from '../working_hours_helper';
import src, { requestContact } from '../lambda_src';

describe.only('requestContact', function() {
	const validInput = {
		name: 'Foo Bar',
		phone: '01 86 26 44 44',
		day: getWorkingDays(1).first().get('value')
	};
	const daySlots = getContactSlots(validInput.day);
	validInput.hour = daySlots.first().get('value');

	beforeEach(function() {
		this.sendEmailStub = sinon.stub();
		this.sendEmailStub.returns(Promise.resolve());
		src.__Rewire__('sendEmail', this.sendEmailStub);
	});

	afterEach(function() {
		src.__ResetDependency__('sendEmail');
	});

	describe('input validation', function() {
		it('should return no error on valid input', function(done) {
			requestContact(validInput, {}, err => {
				expect(err).to.not.be.ok;
				done();
			});
		});

		it('should return error on empty name', function(done) {
			requestContact({ 
				...validInput, 
				name: '    '
			}, {}, err => {
				expect(err.message).to.equal('[ValidationError] Missing name');
				done();
			});
		});

		it('should return error on empty short name', function(done) {
			requestContact({ 
				...validInput, 
				name: 'fo'
			}, {}, err => {
				expect(err.message).to.equal('[ValidationError] Name too short');
				done();
			});
		});

		it('should return error on malformed phone number', function(done) {
			requestContact({ 
				...validInput, 
				phone: validInput.phone.slice(2)
			}, {}, err => {
				expect(err.message).to.equal('[ValidationError] Invalid phone');
				done();
			});
		});

		it('should return error on random string phone number', function(done) {
			requestContact({ 
				...validInput, 
				phone: 'abcdef'
			}, {}, err => {
				expect(err.message).to.equal('[ValidationError] Invalid phone');
				done();
			});
		});

		it('should return error on empty day', function(done) {
			requestContact({ 
				...validInput, 
				day: '    '
			}, {}, err => {
				expect(err.message).to.equal('[ValidationError] Missing day');
				done();
			});
		});

		it('should return error on weekend day', function(done) {
			requestContact({ 
				...validInput, 
				day: moment().add(1, 'week').isoWeekday(7).format('YYYY-MM-DD')
			}, {}, err => {
				expect(err.message).to.equal('[ValidationError] Invalid day');
				done();
			});
		});

		it('should return error on past day', function(done) {
			requestContact({ 
				...validInput, 
				day: moment().subtract(1, 'week').isoWeekday(1).format('YYYY-MM-DD')
			}, {}, err => {
				expect(err.message).to.equal('[ValidationError] Invalid day');
				done();
			});
		});

		it('should return error on empty hour', function(done) {
			requestContact({ 
				...validInput, 
				hour: '    '
			}, {}, err => {
				expect(err.message).to.equal('[ValidationError] Missing hour');
				done();
			});
		});
	});

	describe('email sending', function() {
		beforeEach(function(done) {
			requestContact(validInput, {}, err => {
				this.error = err;
				done();
			});
		});

		it('should pass correct name', function() {
			expect(this.sendEmailStub.getCall(0).args[0]).to.equal(validInput.name);
		});

		it('should pass correct phone', function() {
			expect(this.sendEmailStub.getCall(0).args[1]).to.equal(validInput.phone);
		});

		it('should pass correct date object', function() {
			expect(this.sendEmailStub.getCall(0).args[2].format('YYYY-MM-DD')).to.equal(validInput.day);
		});

		it('should pass correct hours', function() {
			expect(this.sendEmailStub.getCall(0).args[3]).to.equal(daySlots.first().get('h1'));
		});

		it('should pass correct hours', function() {
			expect(this.sendEmailStub.getCall(0).args[4]).to.equal(daySlots.first().get('h2'));
		});
	});

	describe('email sending error', function() {
		beforeEach(function(done) {
			this.stub = sinon.stub();
			this.stub.returns(Promise.reject(new Error('Unknown error')));
			src.__Rewire__('sendEmail', this.stub);
			requestContact(validInput, {}, err => {
				this.error = err;
				done();
			});
		});

		afterEach(function() {
			src.__ResetDependency__('sendEmail');
		});

		it('should pass email sending error', function() {
			expect(this.error.message).to.equal('Unknown error');
		});
	});
});