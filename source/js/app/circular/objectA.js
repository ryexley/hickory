define([
	"underscore",
	"circular/objectB"
], function (_, B) {

	var ObjectA = function () {
	};

	_.extend(ObjectA.prototype, {
		createB: function () {
			this.b = new B();
		}
	});

	return ObjectA;

});
