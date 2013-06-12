// dependencies
define([
  "jquery", /* http://jquery.com/ */
  "underscore", /* http://underscorejs.org/ */
  "knockout", /* http://knockoutjs.com/ */
  "knockoutAmd", /* https://github.com/rniemeyer/knockout-amd-helpers */
  "postal", /* https://github.com/postaljs/postal.js */
  "core/messenger", /* ./messenger.js */
  "core/events", /* ./events.js */
  "core/extend" /* ./extend.js */
], function ($, _, ko, koAmd, postal, messenger, events, extend) {

  "use strict";

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
          command[key] = self._executeOptions[key](value, self);
        });

        self._commands[commandName] = command;
        self.commands[commandName] = { type: "_commands", name: commandName };
      });

      self._queries = {};
      _.each(self.queries, function (queryData, queryName) {
        var query = {};
        _.each(queryData, function (value, key) {
          query[key] = self._executeOptions[key](value, self);
        });

        self._queries[queryName] = query;
        self.queries[queryName] = { type: "_queries", name: queryName };
      });

      this.configureMessaging();
      ko.amdTemplateEngine.defaultPath = this.templatePath;
    },

    // TODO: revisit this...not sure if I'm doing this right or not
    _executeOptions: {
      url: function (target, context) {
        return target;
      },

      done: function (target, context) {
        return context[target];
      }
    },

    bind: function (bindings, el) {
      ko.applyBindings(bindings, el);
    },

    serialize: function () {
      return ko.toJSON(this);
    },

    execute: function (params) {
      var self = this;
      params = this[params.type][params.name];

      var request = $.ajax({
        url: params.url,
        type: params.type || "get",
        data: params.data || {},
        contentType: params.contentType || "application/json; charset=utf-8",
        context: params.context || self
      })
      .done(function (data) {
        if (params.done) {
          params.done.call(params.context || self, data);
        }
      })
      .fail(function (data) {
        if (params.fail) {
          params.fail.call(params.context || self, data);
        }
      })
      .always(function (data) {
        if (params.always) {
          params.always.call(params.context || self, data);
        }
      });

      return request;
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
