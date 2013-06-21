define([
	"jquery",
	"knockout",
	"chai",
	"sinon",
	"BaseViewModel"
], function ($, ko, chai, sinon, BaseViewModel) {

	var assert = chai.assert;
	var expect = chai.expect;
	var should = chai.should;

	describe("BaseViewModel", function () {
		var TestViewModel;
		var _testViewModel;
		var mockAjaxCall;

		beforeEach(function () {
			TestViewModel = BaseViewModel.extend({
				defaults: {
					id: "",
					name: "",
					description: "",
					notes: []
				},

				commands: {
					testCommand1: {
						url: "http://example.com/command-1",
						type: "post",
						data: { foo: "command-1-foo", bar: "command-1-bar" },
						done: "testCommand1Done"
					},
					testCommand2: {
						url: "http://example.com/test-2",
						type: "put",
						data: { foo: "command-2-foo", bar: "command-2-bar" }
					}
				},

				queries: {
					testQuery1: {
						url: "http://example.com",
						done: "executeAjaxQueryComplete"
					}
				},

				executeAjaxQuery1: function () {
					this.execute(this.queries.testQuery1).resolve();
				},

				executeTestCommand1: function () {
					this.execute(this.commands.testCommand1).resolve();
				},

				executeTestCommand2: function () {
					this.execute(this.commands.testCommand2)
						.done(this.testCommand2Done);
				},

				testCommand1Done: sinon.spy(),

				testCommand2Done: sinon.spy(),

				executeAjaxQueryComplete: sinon.spy()
			});

			_testViewModel = new TestViewModel();

			mockAjaxCall = sinon.stub($, "ajax", function () { return $.Deferred(); });
		});

		afterEach(function () {
			mockAjaxCall.restore();
		});

		describe("instances", function () {

			it("should extend messenger mixin", function () {
				expect(_testViewModel.messaging).to.exist;
				expect(_testViewModel.publish).to.exist;
				expect(_testViewModel.subscribe).to.exist;
			});

			it("should extend events mixin", function () {
				expect(_testViewModel.on).to.exist;
				expect(_testViewModel.off).to.exist;
				expect(_testViewModel.once).to.exist;
				expect(_testViewModel.trigger).to.exist;
				expect(_testViewModel.stopListening).to.exist;
			});

		});

		describe("_setup", function () {

			it("should define default properties", function () {
				expect(_testViewModel.id).to.exist;
				expect(_testViewModel.name).to.exist;
				expect(_testViewModel.description).to.exist;
				expect(_testViewModel.notes).to.exist;
			});

			it("should setup default properties as knockout observable", function () {
				expect(ko.isObservable(_testViewModel.id)).to.be.true;
				expect(ko.isObservable(_testViewModel.name)).to.be.true;
				expect(ko.isObservable(_testViewModel.description)).to.be.true;
				expect(ko.isObservable(_testViewModel.notes)).to.be.true;
			});

			it("should configure commands", function () {
				expect(_testViewModel._commands).to.exist;
			});

			it("should configure queries", function () {
				expect(_testViewModel._queries).to.exist;
			});

		});

		describe("commands", function () {

			it("should execute a predefined command", function () {
				_testViewModel.executeTestCommand1();
				expect(_testViewModel.testCommand1Done.called).to.be.true;
			});

			it("should execute predefined commands with the correct options", function () {
				_testViewModel.executeTestCommand1();
				expect(mockAjaxCall.lastCall.args[0].type).to.equal("post");
				expect(mockAjaxCall.lastCall.args[0].url).to.equal("http://example.com/command-1");
				expect(mockAjaxCall.lastCall.args[0].data.foo).to.equal("command-1-foo");
				expect(mockAjaxCall.lastCall.args[0].data.bar).to.equal("command-1-bar");
			});

			it("should allow chained callbacks on execution", function () {
				_testViewModel.executeTestCommand2();
				expect(_testViewModel.testCommand2Done.called).to.be.true;
			});

		});

		describe("queries", function () {

			it("should be able to execute a predefined query", function () {
				_testViewModel.executeAjaxQuery1();
				expect(_testViewModel.executeAjaxQueryComplete.called).to.be.true;
			});

			it("should execute predefined queries with the correct options", function () {
				_testViewModel.executeAjaxQuery1();
				expect(mockAjaxCall.lastCall.args[0].type).to.equal("get");
				expect(mockAjaxCall.lastCall.args[0].url).to.equal("http://example.com");
			});

			it("should execute predefined queries with the proper context", function () {
				_testViewModel.executeAjaxQuery1();
				expect(_testViewModel.executeAjaxQueryComplete.lastCall.thisValue).to.equal(_testViewModel);
			});

		});
	});

});
