# Hickory

Hickory is a BaseViewModel JavaScript module implementation that attempts to streamline and simplify the definition and creation of modules that would otherwise contain lots of redundant, boilerplate code for common functionality. It attempts to abstract away much of the functionality common to many of the modules I create in order to reduce boilerplate code. It provides the following common functionality:

* [A clean, simple and consistent means of defining and creating an instance of a module (constructor)](#module-definition-and-creation)
* [KnockoutJS observable property definitions](#knockoutjs-observable-property-definitions)
* [Simplified AJAX call/callback definition and execution](#ajax-command-and-query-definition-and-execution)
* Simplified PostalJS message publication and subscription definition

And provides the following (I think) useful utility/helper functions:

* `initialize`
* `loadData`
* `parse`
* `serialize`
* `raw`
* `bind`
* `pushAll` extension to KnockoutJS ObservableArray
* `buildCollection`

Notice that I mention [KnockoutJS](http://knockoutjs.com/) and [PostalJS](https://github.com/postaljs/postal.js) specifically. Hickory was inspired by and created for a client project that makes heavy use of these two libraries, so it is tightly coupled to and dependent on them. It's also based on [jQuery](http://jquery.com/)'s Ajax implementation as well. If you're not using those libraries, it probaby won't be very useful to you.

#### The Goal

The goal of this simple, single-file module is to streamline the definition of modules that extend it, and make them easy to understand, debug and maintain.

Here's how you use it...

## Module definition and creation

To define a new module that is based on `BaseViewModel`, you simply extend it, and then create a new instance of it, as follows:

```javascript
// define it...
var Car = BaseViewModel.extend({
	// your awesome code goes here...
});

// create a new instance of it
var toyotaTacoma = new Car();
```

Notice the use of the `extend` function on the BaseViewModel. This borrows heavily from the same implementation of module definition in [Backbone.js](http://backbonejs.org/).

## KnockoutJS observable property definitions

One of the main goals of creating this module was to eliminate the boilerplate of defining properties as `ko.observable`, `ko.observableArray` or `ko.computed` all over the place, _**and**_ to keep all of the observable property definitions in one place. So, for the properties on your viewModel that you want to be Knockout Observable, you would define those properties like this:

```javascript
// this object should be defined on your viewModel definition, inside the "extend" function
defaults: {
	vin: "",
	make: "", // ko.observable()
	model: "", // ko.observable()
	year: "", // ko.observable()
	color: "", // ko.observable()
	transimission: "", // ko.observable()
	options: [], // ko.observableArray()
	price: "calculatePrice" // ko.computed(this.calculatePrice, this)
}
```

Considering the goal, you obviously don't need the comments, they are just to illustrate what each of those properties will get translated to in instances of your viewModel object. To understand how to initialize/load data into those properties, see the documentation for the `initialize` and `loadData` functions below.

## Ajax command and query definition and execution

Another of the major goals of the BaseViewModel implementation is to eliminate the boilerplate of `$.ajax({ ... })` calls all over the place. The BaseViewModel provides a clean, consistent model for defining command (`POST`, `PUT`, `DELETE`) and query (`GET`) objects, and executing them with ease.

### Defining commands

```javascript
commands: {
	logMaintenance: {
		url: "http://toyota.com/vehicle/maintenance/log",
		type: "post",
		data: "buildLogMaintenanceParams",
		done: "onLogMaintenanceComplete"
	}
},

buildLogMaintenanceParams: function () {
	var params = {
		vin: this.vin(),
		maintenanceType: "Oil Change"
	};

	return params;
},

onLogMaintenanceComplete: function (data) {
	// do something with the results returned from the server...
}
```

### Defining queries

```javascript
queries: {
	getVehicleData: {
		url: "http://toyota.com/vehicle",
		done: "onGetVehicleDataComplete"
	},

	getMaintenanceLog: {
		url: "http://toyota.com/vehicle/maintenance/log",
		data: function () {
			return {
				vin: this.vin()
			};
		}
	}
},

onGetVehicleDataComplete: function (data) {
	this.loadData(data); // we'll talk more about this function in a little bit...its awesome
}

onGetMaintenanceLogComplete: function (data) {
	// do something with the returned maintenance log data...
}
```

OK, that's all good...now what do I do with this stuff? Well, that's the easy part...here's how you execute Ajax calls with these command and query definitions:

```javascript
logMaintenance: function () {
	this.execute(this.commands.logMaintenance); // yup, it really is that simple
},

getVehicleData: function () {
	this.execute(this.queries.getVehicleData);
},

getMaintenanceLog: function () {
	this.execute(this.queries.getMaintenanceLog)
		.done(this.onGetMaintenanceLogComplete);
}
```

I think the key takeaway from this would be to note that you have options for how you define/attach callback functions to the execution of your commands and queries. You can either define the function on the command/query object itself, or as you might have noticed, the execute function returns the Ajax call object (an instance of [a jquery `Deferred` object](http://api.jquery.com/category/deferred-object/)), to which you can chain callback functions, as you can see in the `getMaintenanceLog` function call example above.

# DRAFT

This document is incomplete...

```javascript
// TODO: Finish documentation...
```

Simple...right?

<img src="http://i.cloudup.com/IAVyk1qYvL.gif" alt="simple...right?" title="simple...right?"/>
