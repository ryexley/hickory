// TODO: things to test: https://gist.github.com/rniemeyer/c13fd3fb67215125e43f

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
					command1: {
						url: "http://example.com/command-1",
						type: "post",
						data: { foo: "command-1-foo", bar: "command-1-bar" },
						done: "command1Done"
					},
					command2: {
						url: "http://example.com/command-2",
						type: "put",
						data: { foo: "command-2-foo", bar: "command-2-bar" }
					}
				},

				queries: {
					query1: {
						url: "http://example.com/query-1",
						done: "query1Done",
						fail: "query1Fail"
					},
					query2: {
						url: "http://example.com/query-2"
					}
				},

				executeQuery1: function () {
					this.execute(this.queries.query1).resolve();
				},

				executeQuery2: function () {
					this.execute(this.queries.query2)
						.done(this.query2Done)
						.resolve();
				},

				executeCommand1: function () {
					this.execute(this.commands.command1).resolve();
				},

				executeCommand2: function () {
					this.execute(this.commands.command2)
						.done(this.command2Done)
						.resolve();
				},

				command1Done: sinon.spy(),

				command2Done: sinon.spy(),

				query1Done: sinon.spy(),

				query1Fail: sinon.spy(),

				query2Done: sinon.spy()
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
				_testViewModel.executeCommand1();
				expect(_testViewModel.command1Done.called).to.be.true;
			});

			it("should execute predefined commands with the correct options", function () {
				_testViewModel.executeCommand1();
				expect(mockAjaxCall.lastCall.args[0].type).to.equal("post");
				expect(mockAjaxCall.lastCall.args[0].url).to.equal("http://example.com/command-1");
				expect(mockAjaxCall.lastCall.args[0].data.foo).to.equal("command-1-foo");
				expect(mockAjaxCall.lastCall.args[0].data.bar).to.equal("command-1-bar");
			});

			it("should allow chained callbacks on execution", function () {
				_testViewModel.executeCommand2();
				expect(_testViewModel.command2Done.called).to.be.true;
			});

		});

		describe("queries", function () {

			it("should be able to execute a predefined query", function () {
				_testViewModel.executeQuery1();
				expect(_testViewModel.query1Done.called).to.be.true;
			});

			it("should execute predefined queries with the correct options", function () {
				_testViewModel.executeQuery1();
				expect(mockAjaxCall.lastCall.args[0].type).to.equal("get");
				expect(mockAjaxCall.lastCall.args[0].url).to.equal("http://example.com/query-1");
			});

			it("should execute predefined queries with the proper context", function () {
				_testViewModel.executeQuery1();
				expect(_testViewModel.query1Done.lastCall.thisValue).to.equal(_testViewModel);
			});

			it("should execute predefined fail callbacks when execute fails", function () {
				_testViewModel.execute(_testViewModel.queries.query1).reject();
				expect(_testViewModel.query1Fail.called).to.be.true;
			});

			it("should execute chained callbacks on execution", function () {
				_testViewModel.executeQuery2();
				expect(_testViewModel.query2Done.called).to.be.true;
			});

		});
	});

});
