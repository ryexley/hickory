define([
	"core/BaseViewModel"
], function (BaseViewModel) {

	var TestCustomViewModel = BaseViewModel.extend({
		defaults: {
			one: "",
			two: "",
			three: "",
			thingOne: function () { return this.computeThingOne(); }
		},

		initialize: function (options) {
			this.one(options.foo);
			this.two(options.bar);
			this.three(options.baz);

			this.bind(this, $("#main")[0]);
		},

		computeThingOne: function () {
			return "Thing Two";
		}
	});

	return TestCustomViewModel;

});
