define([
	"jquery",
	"knockout",
	"core/BaseViewModel",
	"mockjax"
], function ($, ko, BaseViewModel) {

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
			expect(_testViewModel.id).toBeDefined();
			expect(_testViewModel.name).toBeDefined();
			expect(_testViewModel.description).toBeDefined();
			expect(_testViewModel.notes).toBeDefined();
		});

		it("default properties should be observable", function () {
			expect(ko.isObservable(_testViewModel.id)).toBeTruthy();
			expect(ko.isObservable(_testViewModel.name)).toBeTruthy();
			expect(ko.isObservable(_testViewModel.description)).toBeTruthy();
			expect(ko.isObservable(_testViewModel.notes)).toBeTruthy();
		});

		it("should handle ajax callbacks", function () {
			$.mockjax({
				url: "/baseviewmodel/test1",
				responseText: { message: "Test 1 ajax call complete" }
			});

			spyOn(_testViewModel, "ajaxTest1Complete");
			_testViewModel.ajaxTest1();
			expect(_testViewModel.ajaxTest1Complete).toHaveBeenCalled();
		});

	});

});
