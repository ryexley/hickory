requirejs.config({
	baseUrl: "/js",
	paths: {
		json: "components/json2/json2",
		jquery: "components/jquery/jquery",
		underscore: "components/underscore/underscore",
		knockout: "components/knockout/build/output/knockout-latest",
		knockoutAmd: "components/knockout-amd-helpers/build/knockout-amd-helpers",
		postal: "components/postaljs/lib/postal",
		mockjax: "components/jquery-mockjax/jquery.mockjax",
		core: "app/core",
		text: "components/requirejs-text/text",
		templates: "../templates",
		chai: "components/chai/chai",
		specs: "../test"
	},
	shim: {
		jquery: {
			exports: "$"
		},
		underscore: {
			deps: ["jquery"],
			exports: "_"
		},
		knockout: {
			exports: "knockout"
		},
		mockjax: {
			deps: ["jquery"]
		}
	}
});

(function () {

	define(["json", "knockout", "knockoutAmd"], function (json, ko, koAmd) {
		ko.amdTemplateEngine.defaultSuffix = ".html";
	});

}());
