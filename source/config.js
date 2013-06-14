requirejs.config({
	baseUrl: "/source",
	paths: {
		json: "components/json2/json2",
		jquery: "components/jquery/jquery",
		underscore: "components/underscore/underscore",
		knockout: "components/knockout/build/output/knockout-latest",
		knockoutAmd: "components/knockout-amd-helpers/build/knockout-amd-helpers",
		postal: "components/postaljs/lib/postal",
		text: "components/requirejs-text/text",
		chai: "components/chai/chai",
		spec: "../spec"
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
