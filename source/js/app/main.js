define([
	"jquery",
	"underscore",
	"knockout"
], function ($, _, ko) {

	var App = function () {
		this.init();
	};

	_.extend(App.prototype, {
		init: function () {
			console.log("Application initialized...");
		},

		message: "Just the basics for now...",
		tmpl: "price"
	});

	window.app = ko.applyBindings(new App());

});
