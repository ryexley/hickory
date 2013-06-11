define([
  "core/BaseViewModel"
], function (BaseViewModel) {

  var ExampleViewModel = BaseViewModel.extend({

    // This will be the channel that messages published from this object will be publushed on, and
    // will be the default channel for subscriptions if/when a channel is not defined on a subscription
    channelName: "exampleChannel",

    // This is where we define the bindable, KO/observable properties on the object
    defaults: {
      id: "", // <- ko.observable()
      internalName: "", // <- ko.observable()
      things: [], // <- ko.observableArray()
      thingOne: function () { this.computeThingOne(); } // <- ko.computed(this.computeThingOne, this)
    },

    initialize: function (options) {
      this.load();
    },

    commands: {
      addNewThings: {
        url: window._resources["addNewThingsUrl"],
        type: "post",
        data: this.getNewThings(),
        done: this.addNewThingsComplete
      },
      save: {
        url: window._resources["saveMe"],
        type: "put",
        data: this.serialize(),
        done: this.saveComplete
      }
    },

    queries: {
      load: {
        url: window._resources["loadMe"],
        done: this.loadComplete
      }
    },

    subscriptions: {
      // subscribes to all messages on the media.removed topic, in the exampleMediaChannel channel, and run handleMediaRemoved
      "handleMediaRemoved": "exampleMedialChannel media.removed"
    },

    messages: {
      saveComplete: "exampleChannel save.complete", // triggered in the saveComplete function
      loaded: "exampleChannel example.loaded" //  triggered in the load function
    },

    computeThingOne: function () {
      return "Thing Two";
    },

    load: function () {
      this.execute(this.queries.load);
    },

    loadComplete: function (data) {
      this.id(data.id);
      this.internalName(data.internalName);
      this.things(data.things);
      this.trigger("loaded");
    },

    save: function () {
      this.execute(this.commands.save);
    },

    saveComplete: function (data) {
      // Show a success notification
      this.trigger("saveComplete", data);
    },

    addNewThings: function () {
      this.execute(this.commands.addNewThings);
    },

    getNewThings: function () {
      return ["Thing Three", "Thing Four"];
    },

    getNewThingsComplete: function (data) {
      // Update this.things...
    },

    handleMediaRemoved: function (data, envelope) {
      // Someone removed some media associated with this ViewModel...we need to do something
    }

  });

  return ExampleViewModel;

});
