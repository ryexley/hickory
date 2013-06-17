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
		chai: "../node_modules/chai/chai",
		sinon: "../node_modules/sinon/pkg/sinon-1.7.2",
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
		},
		sinon: {
			exports: "sinon"
		}
	}
});
