# Hickory

Hickory is a BaseViewModel JavaScript module implementation that attempts to streamline and simplify the definition and craation of modules that would otherwise contain lots of redundant, boilerplate code for common functionality. It attempts to abstract away much of the functionality common to many of the modules I create in order to reduce boilerplate code. It provides the following common functionality:

* [A clean, simple and consistent means of defining and creating an instance of a module (constructor)](#module-definition-and-creation)
* KnockoutJS observable property definitions
* Simplified AJAX call/callback definition and execution
* Simplified PostalJS message publication and subscription definition

And provides the following (I think) useful utility/helper functions:

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

# DRAFT

This document is incomplete...

```javascript
// TODO: Finish documentation...
```


![simple...right?](http://i.cloudup.com/IAVyk1qYvL.gif)
