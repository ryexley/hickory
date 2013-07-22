// TODO: New functionality to add:
// * Add a method for automatically loading data into collections, via: http://jsfiddle.net/digitalbush/DH5UT/
// * Add functionality similar to Backbone's "set" and "parse" functions
// * Add functionality to support persistence to localStorage and/or sessionStorage

// dependencies
define([
	"jquery",       /* http://jquery.com/ */
	"underscore",   /* http://underscorejs.org/ */
	"knockout",     /* http://knockoutjs.com/ */
	"knockoutAmd",  /* https://github.com/rniemeyer/knockout-amd-helpers */
	"postal",       /* https://github.com/postaljs/postal.js */
	"messenger",    /* ./messenger.js */
	"events",       /* ./events.js */
	"extend"        /* ./extend.js */
], function ($, _, ko, koAmd, postal, messenger, events, extend) {

	"use strict";

	// extends Knockout.observableArray for easy collection creation
	// pass it an array of data, and a type constructor function and
	// it will set the observableArray property to an array of objects
	// of the given type initialized with the data in each element of
	// the given array of data
	ko.observableArray.fn.pushAll = function (items, ctor) {
		if (ctor) {
			items = items.map(function (item) {
				return new ctor(item);
			});
		}

		var args = [this.peek().length, 0].concat(items);
		this.splice.apply(this, args);
	};

	/**
		Allow other ViewModels to extend a BaseViewModel
		Parameters set in the `default` option get setup as Knockout observables
		To use a BaseViewModel...

			var MyViewModel = BaseViewModel.extend({
				defaults: {
					foo: '',
					bar: [],
					bam: function ()
				},
				someFunc: function () {},
				initialize: function () {
					this.bind(this, $("#someElement")[0]);
				}
			});

			var instanceOfMyViewModel = new MyViewModel({
				foo: 'bar'
			});

	**/

	var BaseViewModel = function (options) {
		options = options || {};
		this._setup(options);
		this.initialize.call(this, options);
	};

	/**
		See messenger.js for documentation and implementation details
		Extend this module with the functionality defined in the messenger module.
	**/
	_.extend(BaseViewModel.prototype, messenger, events);

	_.extend(BaseViewModel.prototype, {

		templatePath: "templates",

		/**
			The values defined on this object will be setup as `ko.observable`, `ko.observableArray` or `ko.computed`
		**/
		defaults: {},

		/**
			Named data manipulation commands. The data on this object should define parameters for data manipulation.
			Currently, this should represent jQuery ajax call command options for PUT|POST|DELETE verbs.
			Example:
				{
					setActive: {
						url: <theUrl>,
						type: "PUT",
						data: <data>,
						done: this.setActiveComplete // <- this is a function defined on the ViewModel to handle the successful completion of this command
					},
					createNew: {
						url: <createNewUrl>,
						type: "POST",
						data: <data>,
						done: this.createNewComplete // <- anonymous functions are acceptable, but not recommended
					}
				}

			Can be used in the context of using the execute function below as follows:

				this.execute(this.commands.setActive);
		**/
		commands: {},

		/**
			Named data query comamnds. The data on this object should define parameters for fetching data from
			a server. Similar to the commands object above, the data here defines simply the URLs and any
			data/parameters necessary for fetching data from the server.
			Example:

				{
					getAll: {
						url: <urlToGetAllObjects>
					},
					get: {
						url: <urlToGetObjectFrom>,
						data: { id: 12345 }
					},
					getFiltered: {
						url: <filteredDataUrl>,
						data: { color: "red" }
					}
				}

			Can be used in the context of using the execute function below as follows:

				this.execute(this.queries.getFiltered);
		**/
		queries: {},

		/**
			This function is intended to be overridden by inheriting modules
		**/
		initialize: function () {},

		/**
			This function is intended to be private, and it sets up the default values and configures messaging
		**/
		_setup: function (options) {
			var self = this;

			// Initialize Knockout observable properties
			_.each(self.defaults, function (value, prop) {
				if (_.isFunction(value)) {
					self[prop] = ko.computed(self.defaults[prop], self);
				} else if (_.isFunction(self[value])) {
					self[prop] = ko.computed(self[value], self);
				} else {
					self[prop] = _.isArray(value) ?
						// Use an existing observable, or o=copy the options or default array
						(ko.isObservable(options[prop]) ?
							options[prop] :
							ko.observableArray((options[prop] || value).slice(0))) :
						// Use an existing observable, or use the options value or default value
						(ko.isObservable(options[prop]) ?
							options[prop] :
							ko.observable(options[prop] || value));
				}
			});

			self._commands = {};
			_.each(self.commands, function (commandData, commandName) {
				var command = {};
				_.each(commandData, function (value, key) {
					if (key !== "refMap") {
						command[key] = self._executeOptions[key](value, self);
					}
				});

				self._commands[commandName] = command;
				self.commands[commandName]["refMap"] = { type: "_commands", name: commandName };
			});

			self._queries = {};
			_.each(self.queries, function (queryData, queryName) {
				var query = {};
				_.each(queryData, function (value, key) {
					if (key !== "refMap") {
						query[key] = self._executeOptions[key](value, self);
					}
				});

				self._queries[queryName] = query;
				self.queries[queryName]["refMap"] = { type: "_queries", name: queryName };
			});

			this.configureMessaging();

			// ko.amdTemplateEngine.defaultPath = this.templatePath;
			if (this.templatePath !== "templates" && ko.amdTemplateEngine.defaultPath === "templates") {
				ko.amdTemplateEngine.defaultPath = this.templatePath;
			}
		},

		// TODO: revisit this...not sure if I'm doing this right or not
		/* jshint unused:false */
		_executeOptions: {
			url: function (target, context) {
				return target;
			},

			type: function (target, context) {
				return target;
			},

			data: function (target, context) {
				// return target;
				if (context[target]) {
					return context[target];
				} else {
					return target;
				}
			},

			done: function (target, context) {
				return context[target];
			},

			fail: function (target, context) {
				return context[target];
			}
		},
		/* jshint unused:true */

		bind: function (bindings, el) {
			ko.applyBindings(bindings, el);
		},

		serialize: function (target) {
			if (target) {
				return ko.toJSON(target);
			} else {
				return ko.toJSON(this);
			}
		},

		raw: function () {
			return ko.toJS(this);
		},

		execute: function (params) {
			var self = this;
			var data;
			params = this[params.refMap.type][params.refMap.name];

			if (_.isFunction(params.data)) {
				data = params.data.call(params.context || self);
			} else {
				data = params.data;
			}

			var request = $.ajax({
				url: params.url,
				type: params.type || "get",
				data: data || {},
				contentType: params.contentType || "application/json; charset=utf-8",
				context: params.context || self
			});

			if (params.done) {
				request.done(params.done.bind(params.context || self));
			}

			if (params.fail) {
				request.fail(params.fail.bind(params.context || self));
			}

			if (params.always) {
				request.always(params.always.bind(params.context || self));
			}

			return request;
		},

		loadData: function (data) {
			var self = this;

			if (this.parse) {
				data = this.parse(data);
			}

			_.each(data, function (value, key) {
				if (self[key]) {
					self[key](value);
				}
			});
		},

		buildCollection : function (items, ctor) {
			var collection = [];

			if (ctor) {
				items = items.map(function (item) {
					return new ctor(item);
				});
			}

			var args = [collection.length, 0].concat(items);
			collection.splice.apply(collection, args);

			return collection;
		}

	});

	/**
		See extend.js for details.
		This function is intended for use in creating other ViewModel constructors
		to extend this BaseViewModel module.
		Example:

			var MyCustomeViewModel = BaseViewModel.extend({ // ... });
	**/
	BaseViewModel.extend = extend;

	return BaseViewModel;

});
