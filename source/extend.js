define([
	"underscore"
], function (_) {

	"use strict";

	return function (protoProps, staticProps) {
		var parent = this;
		var Surrogate;
		var child;

		if (protoProps && _.has(protoProps, "constructor")) {
			child = protoProps.constructor;
		} else {
			child = function () {
				return parent.apply(this, arguments);
			};
		}

		_.extend(child, parent, staticProps);

		Surrogate = function () {
			this.constructor = child;
		};

		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate();

		if (protoProps) {
			_.extend(child.prototype, protoProps);
		}

		child.__super__ = parent.prototype;

		if (protoProps.name) {
			child.prototype.toString = function () {
				return protoProps.name;
			};
		}

		return child;
	};

});
