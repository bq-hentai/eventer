/**
 * `Eventer` test | Hentai
 * Use Mocha and Chai
 */

var expect = chai.expect;

// some abbrs.
var TYPES = ['log', 'info', 'warn', 'error'];

var log = console.log.bind(console);
var info = console.info.bind(console);
var warn = console.warn.bind(console);
var error = console.error.bind(console);

// utils
var slice = Array.prototype.slice;

// a simple callback
var cb = function() {
    info(arguments);
}

// test suits
describe('Test `.on` && `.emit` && `.off`', function() {
    it('after `.on`, `evt.events` will have a prop named `evt_name` and the value `evt.events["evt_name"]` should be existing and is Array', function(done) {
        var evt = new Eventer();
        evt.on('some-event', cb);
        var evts = evt.events['some-event'];

        expect(evts).to.be.a('array');
        expect(evts[0]).to.be.deep.equal(cb);

        done();
    });
    it('after `.emit`, `cb` should be called', function(done) {
        var evt = new Eventer();
        var invoke = false;
        var passedArg = 'this is passedArg and should be equal to calledRes after called';
        var calledRes = null;
        var calledArg;
        var callback = function() {
            calledArg = arguments;
            invoke = true;
            calledRes = slice.call(arguments)[1];
        }
        evt.on('some-event', callback).emit('some-event', 'just for placeholder', passedArg);
        
        expect(calledArg).to.be.arguments;
        expect(invoke).to.be.true;
        expect(calledRes).to.be.equal(passedArg);
        done();
    });
    it('after `.on .off`, `evt.events` will not have a prop named `evt_name`', function(done) {
        var evt = new Eventer();
        evt.on('some-event', cb).off('some-event');
        var evts = evt.events['some-event'];

        expect(evts).to.be.undefined;

        done();
    });
});

// test once
describe('Test `.once`', function() {
    it('after `.emit` `evt_name`, for the `.once` binding evt, `evt.events` will not have a prop named `evt_name`', function(done) {
        var evt = new Eventer();
        evt.once('some-event', cb);
        evt.emit('some-event');
        var evts = evt.events['some-event'];

        expect(evts).to.be.undefined;
        done();
    });
});

// test after
describe('Test `.after`', function() {
    it('after emitted `some-event` several times, `.after` callback should be invoked and after that, `evt.events[id]` should be undefined', function(done) {
        var evt = new Eventer();
        var passArgArr = [['1', '2'], '2'];
        var argArr = [ ];
        var invoked = false;
        var callbackInvokedTime = 0;

        var callback = function() {
            ++ callbackInvokedTime;
        }
        var aftCallback = function() {
            argArr.push(slice.call(arguments));
            invoked = !invoked;
        }
        evt.on('some-event', callback);
        var id = evt.after('some-event', 2, aftCallback);
        evt.emit('some-event', passArgArr[0]).emit('some-event', passArgArr[1]).emit('some-event').emit('some-event');
        var evts = evt.events['__ALL__'];

        expect(callbackInvokedTime).to.be.equal(4);
        expect(argArr[0][0][0]).to.be.equal(passArgArr[0][0]);
        expect(argArr[0][0][1]).to.be.equal(passArgArr[0][1]);
        expect(argArr[0][1]).to.be.equal(passArgArr[1]);

        expect(evts[id]).to.be.undefined;
        expect(invoked).to.be.true;

        done();
    });
});

// test `all`
describe('Test `.all`', function() {
    it('after emitted `all_events`, `.all` callback should be invoked and after that, `evt.events[id]` should be undefined', function(done) {
        var evt = new Eventer();
        var passArgArr = [['1', '2'], '2'];
        var argArr = [ ];
        var invoked = false;
        var callbackInvokedTime = 0;

        var callback = function() {
            ++ callbackInvokedTime;
        }
        var allCallback = function() {
            argArr.push(slice.call(arguments));
            invoked = !invoked;
        }
        evt.on('some-event', callback).on('some-event-2', callback);
        var id = evt.all('some-event', 'some-event-2', allCallback);
        evt.emit('some-event',  passArgArr[0]).emit('some-event-2', passArgArr[1]);
        var evts = evt.events['__ALL__'];

        expect(callbackInvokedTime).to.be.equal(2);
        expect(argArr[0][0][0]).to.be.equal(passArgArr[0][0]);
        expect(argArr[0][0][1]).to.be.equal(passArgArr[0][1]);
        expect(argArr[0][1]).to.be.equal(passArgArr[1]);

        expect(evts[id]).to.be.undefined;
        expect(invoked).to.be.true;

        done();
    });
});

// test `tail` | `any` | etc
