define([
	"knockout",
	"core/BaseViewModel"
], function (ko, BaseViewModel) {

	describe("BaseViewModel", function () {

		var TestViewModel;
		var _testViewModel;

		beforeEach(function () {
			TestViewModel = BaseViewModel.extend({
				// BEGIN test variables: these properties exist for the purpose of testing only
				messagesPublished: [],
				messagesHandled: [],
				// END test variables

				channelName: "testChannel",

				defaults: {
					id: "",
					name: "",
					description: "",
					notes: []
				},

				messages: {
					"initialized": "testChannel initialized"
				},

				subscriptions: {
					"onInitialized": "initialized"
				},

				initialize: function () {
					this.trigger("initialized");
				},

				onInitialized: function (data, envelope) {
					this.messagesHandled.push("onInitialized");
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

		it("should support postal messaging", function () {
			expect(_testViewModel.messaging).toBeDefined();
		});

		it("should publish an \"initialized\" message on construction", function () {
			spyOn(_testViewModel, "onInitialized");
			expect(_testViewModel.onInitialized).toHaveBeenCalled();
			expect(_testViewModel.messagesHandled[0]).toEqual("onInitialized");
		});

	});

});
