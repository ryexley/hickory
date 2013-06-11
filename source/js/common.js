requirejs.config({
	baseUrl: "/js",
	paths: {
		jquery: "components/jquery/jquery",
		underscore: "components/underscore/underscore",
		knockout: "components/knockout/build/output/knockout-latest",
		knockoutAmd: "components/knockout-amd-helpers/build/knockout-amd-helpers",
		postal: "components/postaljs/lib/postal",
		core: "app/core",
		circular: "app/circular",
		text: "components/requirejs-text/text",
		templates: "../templates",
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
		}
	}
});

(function () {

	define(["knockout", "knockoutAmd"], function (ko, koAmd) {
		ko.amdTemplateEngine.defaultSuffix = ".html";
	});

}());
