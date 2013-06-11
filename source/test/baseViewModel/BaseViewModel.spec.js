define([
	"knockout",
	"core/BaseViewModel"
], function (ko, BaseViewModel) {

	describe("BaseViewModel", function () {

		var TestViewModel;
		var testVm;

		beforeEach(function () {
			TestViewModel = BaseViewModel.extend({
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

				},

				initialize: function () {
					this.trigger("initialized");
				}
			});

			testVm = new TestViewModel({});
		});

		it("should initialize default properties", function () {
			expect(testVm.id).toBeDefined();
			expect(testVm.name).toBeDefined();
			expect(testVm.description).toBeDefined();
			expect(testVm.notes).toBeDefined();
		});

		it("default properties should be observable", function () {
			expect(ko.isObservable(testVm.id)).toBeTruthy();
			expect(ko.isObservable(testVm.name)).toBeTruthy();
			expect(ko.isObservable(testVm.description)).toBeTruthy();
			expect(ko.isObservable(testVm.notes)).toBeTruthy();
		});

		it("should support postal messaging", function () {
			expect(testVm.messaging).toBeDefined();
		});

	});

});
