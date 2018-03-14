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
	this.executor = executor;	
	executor(
		this._internalResolve.bind(this), 
		this._internalReject.bind(this));
}

$Promise.prototype._internalResolve = function( data ) {
	console.log(data);
	if (this._state == 'pending') {
		this._value = data;		
		this._state = 'fulfilled';
	}
	while (this._handlerGroups.length) {
		var pB = this._handlerGroups[0].downstreamPromise;
		if (!this._handlerGroups[0].successCb) {
			this._handlerGroups.shift();			
			pB._internalResolve(this._value);
		}
		else {
			console.log("39");
			try {
				var successInput = this
				._handlerGroups[0].successCb(this._value);					
			} catch (error) {
				pB._internalReject(error);
			}
			console.log("40");
			this._handlerGroups.shift();
			if(successInput instanceof $Promise){
				console.log("HERE", this);
				successInput.then(pB._internalResolve(successInput).bind(pB), pB._internalReject(successInput).bind(pB));
			} else {
			 pB._internalResolve(successInput);
			}
		} 
	}
}

$Promise.prototype._internalReject = function(data) {
	if (this._state == 'pending') {
		this._value = data;		
		this._state = 'rejected';
	}
	while (this._handlerGroups.length) {
		var pB = this._handlerGroups[0].downstreamPromise;
		if (!this._handlerGroups[0].errorCb) {
			pB._internalReject(this._value);
			this._handlerGroups.shift();			
		}
		else {
			try {
				var errorInput = this._handlerGroups[0]
				.errorCb(this._value);
			} catch (error) {
				pB._internalReject(error);
			}
			this._handlerGroups.shift();
			pB._internalResolve(errorInput);
		} 
	}
	// for (var i = 0; i < this._handlerGroups.length; i++) {
	// 	this._handlerGroups[i].errorCb(this._value);
	// }
}

$Promise.prototype.then = function(success, error) {
	// var L = this._handlerGroups.length;
	console.log("line 70 test");
	console.log(success);
	var successInput = success;
	var errorInput = error;
	if (typeof success != 'function') {
		successInput = false;
		console.log("line 76");		
	}	
	else if (this._state === 'fulfilled') {
		console.log("line 78");		
		success(this._value);				
	}
	if (typeof error != 'function') {
		errorInput = false;
		console.log("line 85");		
	} else if(this._state === 'rejected'){
		error(this._value)
		console.log("line 88");		
	}
	this._handlerGroups.push({
		successCb: successInput,
		errorCb: errorInput,
		downstreamPromise: 
		new $Promise(this.executor),
	});	
	return this._handlerGroups[0].downstreamPromise;
}

$Promise.prototype.catch = function (func) {
	return this.then(null, func);
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
