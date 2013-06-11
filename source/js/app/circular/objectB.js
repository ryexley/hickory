define([
	"underscore",
	"circular/objectA"
], function (_, A) {

	var ObjectB = function () {
	};

	_.extend(ObjectB.prototype, {
		createA: function () {
			this.a = new A();
		}
	});

	return ObjectB;

});
