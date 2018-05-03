/**
 * Eventer Test Ver 0.2.0 | hentai
 */

window.onload = function() {

	// log | warn | info | error
	var log = console.log.bind(console);
	var warn = console.warn.bind(console);
	var info = console.info.bind(console);
	var error = console.error.bind(console);
	var testStr = '';
	if (testStr && testStr === 'Eventer') {
		// Eventer instance
		var evt = new Eventer();
		var cb = function() {
			info('this is cb', arguments);
		}
		var cb2 = function() {
			info('this is cb2 with arguments', arguments);
		}

		log('bind event `cnt` with callback cb');
		evt.on('cnt', cb);

		log('trigger `cnt`');
		evt.emit('cnt');

		log('bind event `cnt` with callback cb2');
		evt.on('cnt', cb2);

		log('trigger `cnt`');
		evt.emit('cnt');

		log('unbind event `cnt` cb');
		evt.off('cnt', cb);

		log('trigger `cnt`');
		evt.emit('cnt', 'print this args');

		log('unbind event `cnt` cb');
		evt.off('cnt');

		log('trigger `cnt` and the result must be empty');
		evt.emit('cnt');

		log('bind event `cnt` with callback cb');
		evt.once('cnt', cb);

		log('trigger `cnt`');
		evt.emit('cnt', 'print this args');

		log('trigger `cnt` and the result must be empty');
		evt.emit('cnt');

		log('`all` function test start');
		var allEvt = new Eventer();
		allEvt.all('a', 'b', function(a, b) {
			info('a result: ', a);
			info('b result: ', b);
		})

		allEvt.emit('a', 'this is a result');
		allEvt.emit('b', 'this is b result');

		info('now `allEvt` is: ', allEvt);

		log('`all` function test end');

		log('`__ALL__` event bind test...');
		var fakeAllEvt = new Eventer();
		fakeAllEvt.on('__ALL__', function() {
			info('`__ALL__` event bind success and the result is: ', arguments);
		});
		fakeAllEvt.emit('__ALL__', 'this is `__ALL__` event result');
		info('now `fakeAllEvt` is: ', fakeAllEvt);
		fakeAllEvt.off('__ALL__');
		log('`__ALL__` event with `once` test')
		fakeAllEvt.once('__ALL__', function() {
			info('`__ALL__` event bind once success and the result is: ', arguments);
		})
		fakeAllEvt.emit('__ALL__', 'once test success');
		info('now `fakeAllEvt` is: ', fakeAllEvt);
		log('`__ALL` event bind test end');

		log('`after` function test start');
		var aftEvt = new Eventer();
		aftEvt.after('a', 5, function() {
			info('this is `after` callback result: ', arguments);
		})

		aftEvt.emit('a', 'this is a result - 1');
		aftEvt.emit('a', 'this is a result - 2');
		aftEvt.emit('a', 'this is a result - 3');
		aftEvt.emit('a', 'this is a result - 4');
		aftEvt.emit('a', 'this is a result - 5');

		info('now `aftEvt` is: ', aftEvt);
		log('`after` function test end');

		log('`any` function test start');
		var anyEvt = new Eventer();
		anyEvt.any('a', 'b', function() {
			info('this is `any` callback result: ', arguments);
		});

		anyEvt.emit('a', 'this is a result');
		anyEvt.emit('b', 'this is b result');
		anyEvt.emit('a', 'this is a result - 2');
		anyEvt.emit('b', 'this is b result - 2');

		info('now `anyEvt` is: ', anyEvt);
		log('`after` function test end');

		log('`tail` function test start');
		var tailEvt = new Eventer();
		tailEvt.tail('a', 'b', function(a, b) {
			info('a result: ', a);
			info('b result: ', b);
		})

		tailEvt.emit('a', 'this is a result');
		tailEvt.emit('b', 'this is b result');

		info('now `tailEvt` is: ', tailEvt);
		log('one event emits now and callback will be invoked');
		tailEvt.emit('a', 'this is a result - 2');
		info('now `tailEvt` is: ', tailEvt);

		log('`tail` function test end');

		log('test chain oprations: ');
		var chainEvt = new Eventer();
		chainEvt.on('chain-evt-1', function() {
			info('chain-evt-1 triggered with arguments: ', arguments);
		}).on('chain-evt-1', function() {
			info('chain-evt-1 triggered and this is the second callback with arguments: ', arguments);
		}).on('chain-evt-2', function() {
			info('chain-evt-2 triggered with arguments: ', arguments);
		});
		chainEvt.emit('chain-evt-1', 'chain-evt-1 args').emit('chain-evt-2', 'chain-evt-2 args').off('chain-evt-2').off('chain-evt-1');
		info('now `chainEvt` is: ', chainEvt);
		log('chain oprations test end');

		log('test unbind for `tail` | `after` | `any` | etc');
		var unbindAll = new Eventer();
		log('sub test => `tail`')
		var unbindAllId = unbindAll.tail('a', 'b', function(a, b) {
			info('a result is: ', a);
			info('b result is: ', b);
		});
		unbindAll.emit('a', 'this is a result').emit('b', 'this is b result');
		log('unbinding......');
		unbindAll.unbindForAllById(unbindAllId);
		info('now `unbindAll` is: ', unbindAll);
		log('sub test => `after`');
		var unbindAllId2 = unbindAll.after('a', 2, function(result) {
			info('result is: ', result);
		});
		unbindAll.emit('a', 'this is a result').emit('a', 'this is a result - second time');
		log('unbinding......');
		unbindAll.unbindForAllById(unbindAllId2);
		info('now `unbindAll` is: ', unbindAll);
		log('sub test => `any`');
		var unbindAllId4 = unbindAll.any('a', 'b', function(result) {
			info('result is: ', result);
		});
		unbindAll.emit('a', 'this is a result').emit('b', 'this is b result').emit('a', 'this is a result - second time');
		log('unbinding......');
		unbindAll.unbindForAllById(unbindAllId4);
		info('now `unbindAll` is: ', unbindAll);
		log('unbind for `tail` | `after` | `any` | etc end');

		return ;
	}

	/* learn to use Q.js */

	/* simulate Ajax */
	var simulateAjax = function(cb) {
		var args = Array.prototype.slice.call(arguments, 1);
		setTimeout(function() {
			cb.apply(null, args);
		});
	}

	// simple callback for resolver
	var simpleCb = function() {
		// just for effect = =
		this.call(this, arguments);
	}

	// set long stack support
	Q.longStackSupport = true;

	// set global error listener
	Q.onerror = function(err) {
		warn(err);
	}

	// use constructor
	var promise = Q.Promise(function(resolve, reject) {
		simulateAjax(simpleCb.bind(resolve), 'first arg', 'second arg', 'third arg', 'fourth arg', 'fifth arg');
	});
	var promise2 = Q.promise(function(resolve) {
		simulateAjax(simpleCb.bind(resolve), 'anthoer promise');
	});

	// use promise
	promise.then(function(val) {
		info(val);

		return 'foo';
	}).then(function(val) {
		info('promise.then.then result: ', val);

		return 'bar';
	}).done(function(val) {
		info('done with val: ', val);

		return Q.reject(new Error('test done onFulfilled function throw error'))
	}, function(reason) {
		warn(reason);
	});

	var resolver = Q.resolve('synchornous value like this string');
	var rejecter = Q.reject(new Error('error like this'));

	// use then
	resolver.then(function(val) {
		var tmp;
		info(val);
		// test throw
		throw new Error(val);
		// return (tmp = Q.resolve('another value resolved'));
		return Q.reject(new Error('error like this - 1'));
	}).then(function(val) {
		info(val);
		return Q.reject(new Error('error like this'));
	}).catch(function(err) {
		warn(err);
		// wonnot effect
		return Q.reject(new Error('catch handler throw an error'));
	});

	// an object with `then` but obj.then is not a function
	var objWithNoFuncThen = {
		'name': 'then is not a func',
		'then': 'haha, I am then'
	};
	// an object with a function `then`
	var objWithFuncThen = {
		'name': 'this is a func then',
		'then': function(resolve, reject) {
			info('func then');
			resolve('func then resolved');
		}
	};

	Q.resolve(objWithNoFuncThen).then(function(val) {
		var tmp;
		info(val);
		return (tmp = Q.resolve(objWithFuncThen));
	}).then(function(val) {
		info(val);
		return 'foo';
	}).catch(function(err) {
		warn(err);
	})

	// resolve self => TypeError
	var resolveSelf = Q.resolve('self');
	resolveSelf.then(function(val) {
		info(val);
		return resolveSelf;
	}).then(function(val) {
		info(val);
	}).catch(function(err) {
		warn(err);
	});

	// test `all`
	var rejectOne = Q.reject(new Error('hey I reject'));
	Q.all([promise, promise2]).done(function(vals) {
		info('1- `all` methods return values: ', vals);
	});
	// with `state` returned
	Q.allSettled([promise, rejectOne, promise2]).done(function(vals) {
		info('1- `allSettled` methods return values: ', vals);
	});
	// use `spread`
	Q.all([promise, promise2]).spread(function(first, second) {
		info('2- `all` methods return values: ', first, second);
		return '`spread` return value';
	}).done(function(val) {
		info(val);
	}, function(reason) {
		warn('`done` reason: ', reason);
	});
	Q.all([promise, rejectOne, promise2]).spread(function(first, second) {
		info('4- `all` methods return values: ', first, second);
	}).done(function(val) {
		info(val);
	}, function(reason) {
		warn('`done` reason: ', reason);
	});
	Q.allSettled([promise, rejectOne, promise2]).spread(function(first, second, third) {
		info('2- `allSettled` methods return values: ', first, second, third);
	}).done();

	// test `notify` and corresponding `onProgress`
	Q.Promise(function(resolve, reject, notify) {
		// use setTimeout to make sure async
		// if not, when execute to `then` method, the `notify` has executed
		setTimeout(function() {
			notify('notify-1');
			notify('notify-2');
			notify('notify-3');
			notify('notify-4');
			notify('notify-5');
			resolve('hey I resolved');
		});
	}).then(function(val) {
		info('test `notify` and `onProgress` resolve result: ', val);
	}, function(reason) {
		info('test `notify` and `onProgress` reject result: ', reason);
	}, function(chunk) {
		info('[[progressing]]: ', chunk);
	}).done();
}
