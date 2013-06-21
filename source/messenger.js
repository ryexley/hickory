/*
	This is a postal.js messaging mixin that simplifies the definition of
	message publishing and subscriptions on any object it is mixed in to.

	NOTE: ** Remember to call configureMessaging() in the ctor of the target object **

	Supports the defintion of the following objects on the target:
		messages: {
			// Event: channel topic
			sampleEvent: "sampleChannel sample.topic"
		},
		subscriptions: {
			// Callback: channel topic
			"sampleCallback": "sampleChannel sample.topic"
		}
	Firing `sampleEvent` would be accomplished with the following:
		this.trigger("sampleEvent", [optional payload: {}]);

	All subscription handlers will be passed two parameters: `data` and
	`envelope`, and should be setup as follows:
		sampleCallback: function (data, envelope) { ... }
*/

define([
	"underscore",
	"postal"
], function (_, postal) {

	function setupChannel(obj) {
		obj.channel = postal.channel(obj.namespace || obj.channelName);
	}

	var Messenger = {

		_ensureChannel: function () {
			if (!this.channel) {
				setupChannel(this);
			}
		},

		publish: function (topic, data) {
			this._ensureChannel();
			return this.channel.publish.call(this.channel, { topic: topic, data: data || {} });
		},

		subscribe: function () {
			this._ensureChannel();
			var subscription = this.channel.subscribe.apply(this.channel, arguments);
			if (!this.messaging.subscriptions) {
				this.messaging.subscriptions = {};
			}

			this.messaging.subscriptions[subscription] = subscription;
			return subscription.withContext(this);
		},

		configureMessaging: function () {
			this.messaging = this.messaging || {};
			this.setupSubscriptions();
			this.setupMessages();
		},

		clearMessages: function () {
			if (this.messaging.messages) {
				_.each(this.messaging.messages, function (message) {
					_.each(message, function (m) {
						while (m.length) {
							m.pop();
						}
					});
				});
			}

			this.messaging.messages = {};
		},

		setupMessages: function () {
			this.clearMessages();
			if (!_.isEmpty(this.messages)) {
				_.each(this.messages, function (message, evnt) {
					var _message = message;

					if (!this.messaging.messages[evnt]) {
						this.messaging.messages[evnt] = {};
					}

					if (!_.isObject(message)) {
						_message = {};
						_message[message] = _.identity;
					}

					_.each(_message, function (accessor, m) {
						var meta = m.split(" ");
						var channel = meta[0];
						var topic = meta[1];
						var listener = function () {
							var args = Array.prototype.slice.call(arguments, 0);
							var data = accessor.apply(this, args);
							postal.publish({
								channel: channel,
								topic: topic,
								data: data || {}
							});
						};

						this.on(evnt, listener, this);
						this.messaging.messages[evnt][m] = _.bind(function () {
							this.off(evnt, listener);
						}, this);
					}, this);
				}, this);
			}
		},

		clearSubscriptions: function () {
			if (this.messaging.subscriptions) {
				_.each(this.messaging.subscriptions, function (subscription) {
					subscription.unsubscribe();
				});
			}

			this.messaging.subscriptions = {};
		},

		setupSubscriptions: function () {
			this.clearSubscriptions();
			if (!_.isEmpty(this.subscriptions)) {
				_.each(this.subscriptions, function (subscription, handler) {
					subscription = _.isArray(subscription) ? subscription : [subscription];
					_.each(subscription, function (s) {
						var meta = s.split(" ");
						var channel = meta[1] ? meta[0] : this.channelName;
						var topic = meta[1] || meta[0];

						if (this[handler]) {
							this.messaging.subscriptions[subscription] = postal.subscribe({
								channel: channel,
								topic: topic,
								callback: this[handler]
							}).withContext(this);
						}
					}, this);
				}, this);
			}
		},

		channel: null
	};

	return Messenger;

});
