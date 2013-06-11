define([
	"app/baseViewModelTesting/CustomViewModel"
], function (CustomViewModel) {

	var sampleData = {
		foo: "This is",
		bar: "just a",
		baz: "test"
	};

	var vm = new CustomViewModel(sampleData);
	console.log(vm);

});
