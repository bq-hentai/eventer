/**
 * Eventer 0.2.0 | hentai
 * Solve the problem that when use `after` | `tail`, we can't unbind this.
 * Use an increased ID to identify such event bind
 * To achive this, I choose when use `after` | `tail`, user can get an id, but meanwhile, USER CANNOT CHAIN OPRATIONS when use `after` | `tail` | etc.
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

  // type
  var isType = function(type) {
    return function(obj) {
      return { }.toString.call(obj) === '[object ' + type + ']';
    }
  }
  var isObject = isType('Object');
  var isString = isType('String');
  var isFunction = isType('Function');
  var isArray = Array.isArray || isType('Array');

  // version No.
  var version = '0.2';

  // base id used to identify `all` event
  var baseId = 0;

  var getId = function() {
    return ++ baseId;
  }

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

  // bind common events
  proto.bind = proto.on = function(name, cb) {
    // no check now, user should confirm correct params

    // if callback is not a function, do nothing but return this
    if (! isFunction(cb))
      return this;

    // callback list
    var list = this.events[name] || (this.events[name] = [ ]);

    // push callback to list
    list.push(cb);

    // return this to achive chain opr
    return this;
  }

  // internal function, used to bind `all` event
  var bindForAll = function(cb) {
    // for `all`, use { } instead of [ ]
    var list = this.events[ALL_EVENT] || (this.events[ALL_EVENT] = { });

    var id = getId();
    list[id] = cb;

    // return id which is used to unbind this event binding
    // cannot find a better way to let user get this id, so use `return id` instead of `return this`
    // of course, use cannot use cb to unbindForAll, if user do so, I choose to unbind 233.
    return id;
  }

  // unbind `all` event
  // by id
  proto.unbindForAllById = function(id) {
    var list = this.events[ALL_EVENT];

    if (list) {
      delete list[id];
    }
  }
  // by callback
  proto.unbindForAllByCb = function(cb) {
    var list = this.events[ALL_EVENT];

    if (list) {
      for (var prop in list) {
        if (list[prop] === cb) {
          delete list[prop];
        }
      }
    }
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
    name = isAll ? ALL_EVENT : name ;

    if (!(this instanceof Eventer))
      throw new Error('bad context [this] is not instanceof Eventer.');

    if (isAll) {
      triggerForAll.apply(this, arguments);
      return ;
    }

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

  // internal function, trigger for `all` type
  var triggerForAll = function() {
    var list = this.events[ALL_EVENT];
    var fn = null;

    if (list) {
      var args = slice.call(arguments, 1);
      for (var prop in list) {
        fn = list[prop];
        if (fn && isFunction(fn)) {
          fn.apply(null, args);
        }
      }
    }
  }

  // remove certain event binding(maybe bound by `all` or `after`)
  var removeCertainEventInAll = function(cb) {
    var list = this.events[ALL_EVENT];
    if (list) {
      for (var key in list) {
        if (list[key] === cb) {
          delete list[key];
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

  // after several times and invoke callback
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

    var id = null;

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

        _this.unbindForAllById.call(_this, id);
      }
    }

    return (id = bindForAll.call(this, afterCb));
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

  // internal function, `all` method assist
  // callback should be called after serveral event are all triggered
  // and the params to callback should be the result of the param passed
  var allAssist = function(tailing) {
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

    var id = null;

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
          _this.unbindForAllById.call(_this, id);
          return ;
        }
      }
    }

    return (id = bindForAll.call(this, allCb));
  }

  proto.all = function() {
    var args = [false].concat(slice.call(arguments));

    return allAssist.apply(this, args);
  }

  // `tail` method
  // not like `all`, for tailing, after `all` triggered, if some of the events in param list is triggered
  // the callback will execute with the latest data
  proto.tail = function() {
    var args = [true].concat(slice.call(arguments));

    return allAssist.apply(this, args);
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

    return bindForAll.call(this, anyCb);
  }

})(window);
