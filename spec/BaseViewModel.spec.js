define([
	"knockout",
	"chai",
	"BaseViewModel"
], function (ko, chai, BaseViewModel) {

	var expect = chai.expect;
	var should = chai.should;

	describe("BaseViewModel", function () {
		var TestViewModel;
		var _testViewModel;

		beforeEach(function () {
			TestViewModel = BaseViewModel.extend({
				defaults: {
					id: "",
					name: "",
					description: "",
					notes: []
				},

				commands: {
					testCommand1: {
						url: "http://example.com",
						data: {}
					}
				},

				queries: {
					testQuery1: {
						url: "http://example.com"
					}
				}
			});

			_testViewModel = new TestViewModel();
		});

		it("should have default properties defined", function () {
			expect(_testViewModel.id).to.exist;
			expect(_testViewModel.name).to.exist;
			expect(_testViewModel.description).to.exist;
			expect(_testViewModel.notes).to.exist;
		});

		it("default properties should be knockout observable", function () {
			expect(ko.isObservable(_testViewModel.id)).to.be.true;
			expect(ko.isObservable(_testViewModel.name)).to.be.true;
			expect(ko.isObservable(_testViewModel.description)).to.be.true;
			expect(ko.isObservable(_testViewModel.notes)).to.be.true;
		});

		it("should configure messaging", function () {
			expect(_testViewModel.messaging).to.exist;
		});

		it("should configure commands", function () {
			expect(_testViewModel._commands).to.exist;
		});

		it("should configure queries", function () {
			expect(_testViewModel._queries).to.exist;
		});
	});

});
