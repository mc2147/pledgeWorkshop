'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js ES6-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:


function $Promise (executor) {
	this._value;
	this._state = 'pending';
	this.resolved = false;
	this._handlerGroups = [];
	if (typeof executor != 'function') {
		throw new TypeError(
			"executor " + " cannot be null for " + " function"
		)
		// .catch(e) {
		// 	console.log(e);
		// };
	}
	// this.executor = executor;	
	executor(
		this._internalResolve.bind(this), 
		this._internalReject.bind(this));
}

$Promise.prototype._internalResolve = function( data ) {
	if (this._state == 'pending') {
		this._value = data;		
		this._state = 'fulfilled';
	}
	while (this._handlerGroups.length) {
		this._handlerGroups[0].successCb(this._value);
		this._handlerGroups.shift();
	}
	// this.executor();
}

$Promise.prototype._internalReject = function(data) {
	if (this._state == 'pending') {
		this._value = data;		
		this._state = 'rejected';
	}
	for (var i = 0; i < this._handlerGroups.length; i++) {
		this._handlerGroups[i].errorCb(this._value);
	}
}

$Promise.prototype.then = function(success, error) {
	// var L = this._handlerGroups.length;
	var successInput = success;
	var errorInput = error;
	if (typeof success != 'function') {
		successInput = false;
	}	
	else if (this._state === 'fulfilled') {
		success(this._value);		
	}
	if (typeof error != 'function') {
		errorInput = false;
	} else if(this._state === 'rejected'){
		error(this._value)
	}
	this._handlerGroups.push({
		successCb: successInput,
		errorCb: errorInput
	});	
}

$Promise.prototype.catch = function (func) {
	this.then(null, func);
}



/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = $Promise;

So in a Node-based project we could write things like this:

var Promise = require('pledge');
…
var promise = new Promise(function (resolve, reject) { … });
--------------------------------------------------------*/
