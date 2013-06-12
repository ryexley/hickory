define([
	"jquery",
	"knockout",
	"chai",
	"mockjax",
	"core/BaseViewModel"
], function ($, ko, chai, mockjax, BaseViewModel) {

	var expect = chai.expect;
	var should = chai.should;

	describe("BaseViewModel", function () {

		var TestViewModel;
		var _testViewModel;

		beforeEach(function () {
			TestViewModel = BaseViewModel.extend({
				// Test variables
				ajaxCallbacks: [],
				// END Test variables

				channelName: "testChannel",

				defaults: {
					id: "",
					name: "",
					description: "",
					notes: []
				},

				commands: {
				},

				queries: {
					ajaxTest1: {
						url: "/baseviewmodel/test1",
						done: "ajaxTest1Complete"
					}
				},

				initialize: function () {},

				ajaxTest1: function () {
					this.execute(this.queries.ajaxTest1);
				},

				ajaxTest1Complete: function (data) {
					this.ajaxCallbacks.push("onTest1Complete");
				}
			});

			_testViewModel = new TestViewModel({});
		});

		it("should initialize default properties", function () {
			expect(_testViewModel.id).to.exist;
			expect(_testViewModel.name).to.exist;
			expect(_testViewModel.description).to.exist;
			expect(_testViewModel.notes).to.exist;
		});

		it("default properties should be observable", function () {
			expect(ko.isObservable(_testViewModel.id)).to.be.true;
			expect(ko.isObservable(_testViewModel.name)).to.be.true;
			expect(ko.isObservable(_testViewModel.description)).to.be.true;
			expect(ko.isObservable(_testViewModel.notes)).to.be.true;
		});

		it("should have queries defined", function () {
			expect(_testViewModel._queries).to.exist;
		});

	});

});
