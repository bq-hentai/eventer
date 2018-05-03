/**
 * Eventer 0.1.0 | hentai
 */

;(function(global, undefined) {

	"use strict";

	// avoid mutiple load Eventer
	if (global.Eventer)
		return ;

	// cache
	var oProto = Object.prototype;
	var aProto = Array.prototype;
	var slice = aProto.slice;

	// version No.
	var version = '0.1';

	// `all` event name
	var ALL_EVENT = '__ALL__';

	// noop func
	var noop = function() { };

	var Eventer = global.Eventer = function() {
		// common events cache
		this.events = { };
	};

	var proto = Eventer.prototype;

	// save version in prototype
	proto.version = version;

	// bind events
	proto.bind = proto.on = function(name, cb) {
		// no check now, user should confirm correct params

		// callback list
		var list = this.events[name] || (this.events[name] = [ ]);

		// push callback to list
		list.push(cb);

		// return this to achive chain opr
		return this;
	}

	// unbind events
	proto.unbind = proto.off = function(name, cb) {
		// if name and cb are both undefined, remove all events
		if (!(name || cb))
			this.events = { };

		var list = this.events[name];
		if (list) {
			if (cb) {
				for (var i = list.length - 1; i >= 0; --i) {
					if (list[i] === cb)
						list.splice(i, 1);
				}
			}
			else
				// if cb is undefined, delete all events bound to this name
				delete this.events[name];
		}

		return this;
	}

	// internal function
	// trigger event `name`
	// commonly use like this => trigger.apply(this, arguments);
	var trigger = function(isAll, name) {
		name = isAll ? ALL_EVENT : name;

		var eventer = this;
		if (!(this instanceof Eventer))
			throw new Error('bad context [this] is not instanceof Eventer.');

		var list = this.events[name];
		var fn = null;

		if (list) {
			// extra arguments
			var args = slice.call(arguments, 2);
			// copy to prevent modification
			list = slice.call(list);
			// execute events
			while((fn = list.shift())) {
				fn.apply(null, args);
			}
		}
	}

	// remove certain event binding(maybe bound by `all` or `after`)
	var removeCertainEventInAll = function(cb) {
		var list = this.events[ALL_EVENT];
		if (list) {
			for (var i = list.length; i >= 0; --i) {
				if (list[i] === cb) {
					list.splice(i, 1);
					break;
				}
			}
		}
	}

	// trigger event
	proto.trigger = proto.emit = function(name) {
		var both = 2;
		var evtName = null;
		var args = slice.call(arguments);
		// args passed to trigger
		var passArgs = null;

		while (both --) {
			// prevent modification
			passArgs = slice.call(args);
			passArgs.unshift(!both);

			trigger.apply(this, passArgs);
		}

		return this;
	}

	// after several times and trigger this event and cb is alternative
	// no complete
	proto.after = function(name, times, cb) {
		var _this = this;

		cb = cb ? cb : noop;
		var list = this.events[name];
		var args = slice.call(arguments);
		// fired data
		var data = [ ];
		var iterator = 0;
		// if times < 1, trigger event `name`
		if (times < 1) {	
			cb.apply(null, data);

			return this;
		}

		var afterCb = function() {
			// event name that triggered now
			var args = slice.call(arguments);
			var evtName = args[0];

			if (evtName === name) {
				++ iterator;
				data.push(args[1]);
			}

			if (times === iterator) {
				cb.apply(null, data);

				removeCertainEventInAll.call(_this, afterCb);
			}
		}

		this.bind(ALL_EVENT, afterCb);
	}

	// create once binding
	proto.once = function(name, cb) {
		var _this = this;
		var list = this.events[name] || (this.events[name] = [ ]);

		var onceCb = function() {
			cb.apply(_this, arguments);
			// _this.unbind(arguments.callee); strict model is not permitted
			_this.unbind(name);
		};

		list.push(onceCb);
		// or => this.bind(name, onceCb);

		return this;
	}

	// `all` method
	// callback should be called after serveral event are all triggered
	// and the params to callback should be the result of the param passed
	proto._all = function(tailing) {
		var _this = this;

		var argsLength = arguments.length;
		// events
		var evtNames = slice.call(arguments, 1, -1);
		var evtLength = evtNames.length;
		// callback
		var cb = arguments[argsLength - 1];
		// fired data
		var data = [ ];
		// iterator
		// used to judge whether trigger this `event`
		var iterator = 0;

		var allCb = function() {
			// event name that triggered now
			var args = slice.call(arguments);
			var evtName = args[0];

			for (var i = evtLength - 1; i >= 0; --i) {
				if (evtName === evtNames[i]) {
					++ iterator;
					if (data[i]) {
						if (Array.isArray(data[i]))
							data[i] = data[i].push(args[1]);
						else {
							var tmp = data[i];
							data[i] = [ ];
							data[i].push(tmp);
							data[i].push(args[1]);
						}
					}
					else
						data[i] = args[1];

					break;
				}
			}

			if (evtLength <= iterator) {
				// data[i] maybe undefined or other possible value
				cb.apply(null, data);
				if (! tailing) {
					removeCertainEventInAll.call(_this, allCb);
					return ;
				}
			}
		}

		this.bind(ALL_EVENT, allCb);
	}

	proto.all = function() {
		var args = [false].concat(slice.call(arguments));

		return proto._all.apply(this, args);
	}

	// `tail` method
	// not like `all`, for tailing, after `all` triggered, if some of the events in param list is triggered
	// the callback will execute with the latest data
	proto.tail = function() {
		var args = [true].concat(slice.call(arguments));

		return proto._all.apply(this, args);
	}
	// `any` method
	// if any of the events fired, callback will be invoked
	proto.any = function() {
		var _this = this;

		var argsLength = arguments.length;
		// events
		var evtNames = slice.call(arguments, 0, -1);
		var evtLength = evtNames.length;
		// callback
		var cb = arguments[argsLength - 1];
		// fired data
		// not like `all` or `after`, use { name: [ ] } to save data
		var data = { };

		var anyCb = function() {
			// event name that triggered now
			var args = slice.call(arguments);
			var evtName = args[0];

			for (var i = evtLength - 1; i >= 0; --i) {
				if (evtName === evtNames[i]) {
					var evtData = data[evtName] || (data[evtName] = [ ]);
					
					evtData.push(args[1]);
					cb.call(null, data);
				}
			}
		}

		this.bind(ALL_EVENT, anyCb);
	}

})(window);
