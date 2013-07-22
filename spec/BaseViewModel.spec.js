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
		var Note;
		var Team;
		var _testViewModel;
		var mockAjaxCall;

		beforeEach(function () {
			TestViewModel = BaseViewModel.extend({
				defaults: {
					id: "",
					name: "",
					description: "",
					notes: [],
					teams: [],
					internalName: "computeInternalName",
					twoPlusTwoEqualsFour: function () { return 2 + 2; }
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
					},
					query3: {
						url: "http://example.com/query-3",
						data: "query3Data",
						done: "query3Done"
					},
					query4: {
						url: "http://example.com/query-4",
						data: function () {
							return {
								foo: "query-4-foo",
								bar: "query-4-bar"
							};
						},
						done: "query4Done"
					},
					query5: {
						url: "http://example.com/query-5",
						data: {
							foo: "query-5-foo",
							bar: "query-5-bar"
						},
						done: "query5Done"
					},
					query6: {
						url: "http://example.com/query-6",
						data: "getQuery6Data",
						done: "query6Done"
					}
				},

				computeInternalName: function () {
					return this.id() + "-" + this.name();
				},

				query3Data: function () {
					return {
						foo: "query-3-foo",
						bar: "query-3-bar"
					};
				},

				getQuery6Data: function () {
					return {
						Id: this.id(),
						Name: this.name(),
						Notes: this.notes()
					};
				},

				executeQuery1: function () {
					this.execute(this.queries.query1).resolve();
				},

				executeQuery2: function () {
					this.execute(this.queries.query2)
						.done(this.query2Done)
						.resolve();
				},

				executeQuery3: function () {
					this.execute(this.queries.query3).resolve();
				},

				executeQuery4: function () {
					this.execute(this.queries.query4).resolve();
				},

				executeQuery5: function () {
					this.execute(this.queries.query5).resolve();
				},

				executeQuery6: function () {
					this.execute(this.queries.query6).resolve();
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

				query2Done: sinon.spy(),

				query3Done: sinon.spy(),

				query4Done: sinon.spy(),

				query5Done: sinon.spy(),

				query6Done: sinon.spy()
			});

			Note = function (text) {
				this.date = new Date();
				this.note = text;
			};

			Team = BaseViewModel.extend({
				defaults: {
					team: "",
					mascot: ""
				},

				initialize: function (data) {
					this.loadData(data);
				},

				parse: function (raw) {
					return {
						team: raw.Team,
						mascot: raw.Mascot
					};
				}
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

			it("should return a the current object when serialize is called with no arguments", function () {
				_testViewModel.notes(["foo", "bar"]);
				var serialized = _testViewModel.serialize();
				expect(_.isString(serialized)).to.be.true;
				var objectified = JSON.parse(serialized);
				expect(_.isObject(objectified)).to.be.true;
				expect(objectified.notes.length).to.equal(2);
			});

			it("should return a serialized version of the given object when serialize is called with an argument", function () {
				var target = {
					foo: "target-foo",
					bar: "target-bar"
				};

				var serialized = _testViewModel.serialize(target);
				expect(_.isString(serialized)).to.be.true;
				var objectified = JSON.parse(serialized);
				expect(_.isObject(objectified)).to.be.true;
				expect(objectified.foo).to.equal("target-foo");
				expect(objectified.bar).to.equal("target-bar");
			});

			it("should return an unwrapped version of the current object when raw is called", function () {
				var result = _testViewModel.raw();
				expect(ko.isObservable(result.id)).to.be.false;
				expect(ko.isObservable(result.name)).to.be.false;
				expect(ko.isObservable(result.description)).to.be.false;
				expect(ko.isObservable(result.notes)).to.be.false;
			});

		});

		describe("defaults", function () {

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

			it("should setup default properties defined as arrays to function as expected", function () {
				expect(_testViewModel.notes.push).to.exist;
				_testViewModel.notes.push("Test note");
				expect(_testViewModel.notes.slice(-1)[0]).to.equal("Test note");
			});

			it("should setup default properties defined as anonymous functions to be knockout computed observables", function () {
				expect(ko.isComputed(_testViewModel.twoPlusTwoEqualsFour)).to.be.true;
			});

			it("should setup default values that equal function names as knockout computed observables", function () {
				expect(ko.isComputed(_testViewModel.internalName)).to.be.true;
			});

			it("should setup anonymous functions defined as knockout computed properties that function as expected", function () {
				var prop = _testViewModel.twoPlusTwoEqualsFour();
				expect(prop).to.equal(4);
			});

			it("should setup predefined functions defined as knockout computed properties that function as expected", function () {
				var manuallyComputed = _testViewModel.id() + "-" + _testViewModel.name();
				var computedProperty = _testViewModel.internalName();
				expect(computedProperty).to.equal(manuallyComputed);
			});

		});

		describe("commands", function () {

			it("should configure commands", function () {
				expect(_testViewModel._commands).to.exist;
			});

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

			it("should configure queries", function () {
				expect(_testViewModel._queries).to.exist;
			});

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

			it("should accept and use static data as a data parameter", function () {
				_testViewModel.executeQuery5();
				var callData = mockAjaxCall.lastCall.args[0].data;
				expect(callData.foo).to.equal("query-5-foo");
				expect(callData.bar).to.equal("query-5-bar");
			});

			it("should accept and execute a predefined function as the data parameter", function () {
				_testViewModel.executeQuery3();
				var callData = mockAjaxCall.lastCall.args[0].data;
				expect(callData.foo).to.equal("query-3-foo");
				expect(callData.bar).to.equal("query-3-bar");
			});

			it("should accept and execute an anonymous function as a data parameter", function () {
				_testViewModel.executeQuery4();
				var callData = mockAjaxCall.lastCall.args[0].data;
				expect(callData.foo).to.equal("query-4-foo");
				expect(callData.bar).to.equal("query-4-bar");
			});

			it("should accept data parameters that reference and resolve observable properties on the object", function () {
				_testViewModel.id(7);
				_testViewModel.name("Matty Mullins");
				_testViewModel.notes(["foo", "bar"]);
				_testViewModel.executeQuery6();
				var callData = mockAjaxCall.lastCall.args[0].data;
				expect(callData.Id).to.equal(7);
				expect(callData.Name).to.equal("Matty Mullins");
				expect(callData.Notes).to.be.an("Array");
				expect(callData.Notes[0]).to.equal("foo");
				expect(callData.Notes[1]).to.equal("bar");
			});

		});

		describe("data", function () {

			it("should allow for loading data from an object", function () {
				expect(_testViewModel.loadData).to.exist;
			});

			it("should load data from a given object", function () {
				_testViewModel.loadData({
					id: 4,
					name: "Test ViewModel",
					description: "This is a test ViewModel that extends BaseViewModel for testing"
				});

				expect(_testViewModel.id()).to.equal(4);
				expect(_testViewModel.name()).to.equal("Test ViewModel");
				expect(_testViewModel.description()).to.equal("This is a test ViewModel that extends BaseViewModel for testing");
			});

			it("should support support parsing data prior to load", function () {
				_testViewModel.parse = function (raw) {
					var parsed = {
						id: raw.Id,
						name: raw.Name,
						description: raw.Description
					};

					return parsed;
				};

				_testViewModel.loadData({
					Id: 4,
					Name: "Test ViewModel",
					Description: "This is a test ViewModel that extends BaseViewModel for testing"
				});

				expect(_testViewModel.id()).to.equal(4);
				expect(_testViewModel.name()).to.equal("Test ViewModel");
				expect(_testViewModel.description()).to.equal("This is a test ViewModel that extends BaseViewModel for testing");
			});

			it("should support pushAll collection creation when array data is passed to an observableArray property", function () {
				var notesData = [
					"Note 1",
					"Note 2",
					"Note 3",
					"Note 4"
				];

				_testViewModel.notes.pushAll(notesData, Note);

				expect(_testViewModel.notes().length).to.equal(4);
				_.each(_testViewModel.notes(), function (note) {
					expect(note).to.be.an.instanceOf(Note);
					expect(note.date).to.be.an.instanceOf(Date);
					expect(note.note.length > 0).to.be.true;
				});

				var teamsData = [
					{ Team: "Tennessee", Mascot: "Volunteers" },
					{ Team: "Oregon State", Mascot: "Beavers" },
					{ Team: "Oregon", Mascot: "Ducks" },
					{ Team: "Ohio State", Mascot: "Buckeyes" }
				];

				_testViewModel.teams.pushAll(teamsData, Team);
				expect(_testViewModel.teams().length).to.equal(4);
				_.each(_testViewModel.teams(), function (team) {
					expect(team).to.be.an.instanceOf(Team);
					expect(team.team().length > 0).to.be.true;
					expect(team.mascot().length > 0).to.be.true;
				});
			});

		});
	});

});
