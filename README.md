# Hickory

Hickory is a BaseViewModel JavaScript module implementation that attempts to streamline and simplify the definition and creation of modules that would otherwise contain lots of redundant, boilerplate code for common functionality. It attempts to abstract away much of the functionality common to many of the modules I create in order to reduce boilerplate code. It provides the following common functionality:

* [A clean, simple and consistent means of defining and creating an instance of a module (constructor)](#module-definition-and-creation)
* [KnockoutJS observable property definitions](#knockoutjs-observable-property-definitions)
* [Simplified AJAX call/callback definition and execution](#ajax-command-and-query-definition-and-execution)
* [Simplified PostalJS message publication and subscription definition](#messaging---defining-messages-and-subscriptions)

And provides the following (I think) useful [functions](#functions):

* `initialize` [documentation](#initialize)
* `loadData` [documentation](#loaddata)
* `parse` [documentation](#parse)
* `serialize` [documentation](#serialize)
* `raw` [documentation](#raw)
* `bind` [documentation](#bind)
* `pushAll` extension to KnockoutJS ObservableArray [documentation](#pushall)
* `buildCollection` [documentation](#buildcollection)

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
	transmission: "", // ko.observable()
	basePrice: "", // ko.observable()
	options: [], // ko.observableArray()
	totalPrice: "computeTotalPrice" // ko.computed(this.computeTotalPrice, this)
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

## Messaging - defining messages and subscriptions

One of the final major goals of the BaseViewModel was to simplify and consolidate the definition of messages (and publishing those messages, e.g. `postal.publish()`) and subscriptions (e.g. `postal.subscribe()`) with PostalJS. The BaseViewModel modules is extended with [the Messenger mixin](https://github.com/ryexley/cedar), which accomplishes this goal for us. Here's how you would define messages and subscriptions on an object that extends BaseViewModel:

```javascript
// it is important to note that you *must* define a channelName on your object
// in order for messaging and subscriptions to work properly
channelName: "Vehicle",

messages: {
	vehicleInitialized: "initialized",
	vehicleDataLoaded: "data.loaded"
},

subscriptions: {
	onRecallNotification: "Manufacturer vehicle.notify.recall"
}
```

OK, so this just simply defines a message that our object might want to publish at some point, and a subscription for messages that we want to handle. This is the actual implementation of triggering that message, and handling that message subscription:

```javascript
onGetVehicleDataComplete: function (data) {
	this.loadData(data); // we'll talk more about this function in a little bit...its awesome
	this.trigger("vehicleDataLoaded"); // optionally, we could pass some data (anything you want/need to be attached as the data payload with this message) as a second parameter to this `trigger` call
},

onRecallNotification: function (data, envelope) {
	// do something with the data published with this message...
}
```

## Functions
The BaseViewModel provides the following common functionality to all modules that extend it:

### initialize
The `initialize` function, if you define it on your object (it is optional) will be executed each time an instance of your object is created. It acts as the constructor function for your object. It can also, optionally, accept an `options` parameter. Here are two examples of how you might use the initialize function:

```javascript
// this example makes an `ajax` call to fetch vehicle data when an instance of the object is created
initialize: function (options) {
	this.getVehicleData();
	this.trigger("vehicleInitialized", { vin: this.vin() });
}

// this example assumes that the data for the vehicle has already been fetched, and passes the data in to the function and loads it
initialize: function (options) {
	this.loadData(options);
	this.trigger("vehicleInitialized", { vin: this.vin() });
}
```

### loadData
The `loadData` function can be used to simplify the loading of data (the setting of properties) on your object with data. It is a convention based function, and attempts to set the values of properties on your object that match the names of properties on the object passed to it. If the data that you wish to load in to your object does not match the properties on your object, you can use the `parse` function (see below) to transform it into the form that you need. Here are two examples:

```javascript
// passing this object to `loadData` will set the corresponding properties on your object
var data = {
	vin: 1234567890,
	make: "Toyota",
	model: "Tacoma",
	year: "2003",
	color: "Silver"
};

this.loadData(data);

// passing the following data, without having a parse function defined on your object, would not set any properties...you would need to define a parse function to transform it in order for it to successfully set any properties on your object
var data = {
	VehicleIdNumber: 1234567890,
	VehicleMake: "Toyota",
	VehicleModel: "Tacoma",
	Year: "2003",
	Color: "Silver"
};

this.loadData(data);
```

### parse
The `parse` function can be used if/when you need to transform data that is passed to the `loadData` function so that the properties of the object that `loadData` uses match the properties defined on your object. Here is an example using the data object defined in the example above:

```javascript
parse: function (raw) {
	return {
		vin: raw.VehicleIdNumber,
		make: raw.VehicleMake,
		model: raw.VehicleModel,
		year: raw.Year,
		color: raw.Color
	};
}
```

### serialize
The `serialize` function wraps [the KnockoutJS `toJSON` function](http://knockoutjs.com/documentation/json-data.html). It optionally takes an object as a parameter. If an object is passed to it, it will return a JSON serialized (strinfified) version of the given object. If it is called _without_ a parameter, it will return a JSON serialized (stringified) version of your object:

```javascript
// the equivalent of calling `ko.toJSON(this.options());`
this.serialize(this.options); // <- returns a JSON.stringified version of the `options` property of your object

// the equivalent of calling `ko.toJSON(this);`
this.serialize(); // <- returns a JSON.stringified version of the instance of `Car`
```

### raw
The `raw` function wraps [the KnockoutJS `toJS` function](http://knockoutjs.com/documentation/json-data.html), and simply returns an unwrapped version of the instance of your object (no Knockout observables).

```javascript
// the equivalent of calling `ko.toJS(this);`
this.raw(); // <- returns an unwrapped version of your object
```

### bind
The `bind` function is a simple helper function for the KnockoutJS `applyBindings` function, that performs data binding an object to the given DOM element on a page, which will activate KnockoutJS bindings within the given DOM element, with the context of the given object. For example, if you wanted to bind an instance of a `Car` object to a DOM element with an id of `car-details`, you would do so like this:

```javascript
var car = new Car({ vin: 1234567890987654321 });
car.bind(car, document.getElementById("car-details"));
```

### pushAll
The `pushAll` function is an extension of the KnockoutJS `observableArray` object, that takes an array of objects, and an option type constructor. The function iterates over the given array of objects, and if a constructor is passed, it will create a new instance of the constructor type by using the `new` keyword and passing the current item to the constructor, and then adds the resulting item to the target `observableArray`. If no constructor is passed, the current item in the array is added to the target `observableArray` as is.

```javascript
// lets assume the an array of options for a vehicle is fetched from a server, and
// that we have an additional viewModel type defined for options, i.e.
//		var Option = BaseViewModel.extend({ ... });
// We can populate the options property on our Car object with the array of options
// returned from the server as a collection of Option objects like this:

this.options.pushAll(optionData, Option);
```

### buildCollection
The `buildCollection` function is very similar to the `pushAll` function described above (the code is nearly identical), but it can be run standalone, as opposed to being executed as a method of the KnockoutJS `observableArray`. This can be useful if/when you need to build a collection of objects from data, say, in a parse method, to create a collection of objects of a given type prior to running the `loadData` function.

```javascript
// by itself...
this.buildCollection(optionData, Option);

// in the `parse` function to support `loadData`
parse: function (raw) {
	return {
		// ...
		options: this.buildCollection(raw.Options, Option)
	};
}
```

## Putting it all together
So after all of that, here's is what the entire viewModel definition for a Car object might look like, all put together:

```javascript
var Car = BaseViewModel.extend({
	channelName: "Vehicle",

	defaults: {
		vin: "",
		make: "",
		model: "",
		year: "",
		color: "",
		transmission: "",
		basePrice: "",
		options: [],
		totalPrice: "computeTotalPrice"
	},

	messages: {
		vehicleInitialized: "initialized",
		vehicleDataLoaded: "data.loaded"
	},

	subscriptions: {
		onRecallNotification: "Manufacturer vehicle.notify.recall"
	},

	commands: {
		logMaintenance: {
			url: "http://toyota.com/vehicle/maintenance/log",
			type: "post",
			data: "buildLogMaintenanceParams",
			done: "onLogMaintenanceComplete"
		}
	},

	queries: {
		getVehicleData: {
			url: "http://toyota.com/vehicle",
			data: function () {
				return {
					vin: this.vin()
				};
			},
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

	initialize: function (options) {
		// lets assume that we're given a vin number when an instance is created...
		this.vin(options.vin);
		// now that the vin property is set, we have what we need to fetch the details for this vehicle
		this.getVehicleData();
		this.trigger("vehicleInitialized", { vin: this.vin() });
	},

	parse: function (raw) {
		// let's assume here that the data returned from the server doesn't match up with the properties on our object here, so we need to parse it
		var parsed = {
			vin: raw.VehicleIdNumber,
			make: raw.VehicleMake,
			model: raw.VehicleModel,
			year: raw.Year,
			color: raw.Color,
			options: this.buildCollection(raw.ModelOptions, Option)
		};

		return parsed;
	},

	computeTotalPrice: function () {
		var totalPrice = this.basePrice();

		_.each(this.options(), function (item) {
			totalPrice += item.price();
		});

		return totalPrice;
	},

	logMaintenance: function () {
		this.execute(this.commands.logMaintenance);
	},

	getVehicleData: function () {
		this.execute(this.queries.getVehicleData);
	},

	getMaintenanceLog: function () {
		this.execute(this.queries.getMaintenanceLog)
			.done(this.onGetMaintenanceLogComplete);
	},

	buildLogMaintenanceParams: function () {
		var params = {
			vin: this.vin(),
			maintenanceType: "Oil Change"
		};

		return params;
	},

	onLogMaintenanceComplete: function (data) {
		// do something with the results from the server (data)...
	},

	onGetVehicleDataComplete: function (data) {
		this.loadData(data);
	},

	onGetMaintenanceLogComplete: function (data) {
		// do something with the returned maintenance log data...
	},

	onGetVehicleDataComplete: function (data) {
		this.loadData(data);
		this.trigger("vehicleDataLoaded");
	},

	onRecallNotification: function (data, envelope) {
		// do something with the data published with this message...
	}
});
```

----

So there ya go. Simple enough...right?

<img src="http://i.cloudup.com/IAVyk1qYvL.gif" alt="simple...right?" title="simple...right?"/>
