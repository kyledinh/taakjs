var test = require('tap').test;
var taak = require('../taak.js')();

var ls, st, wanted, found;

/**
 * Creates a stream.
 *
 *    stream()         //=> empty sequence
 *    stream(1)        //=> 1
 *    stream(1,2,3)    //=> 1,2,3
 *    stream([1,2,3])  //=> 1,2,3
 *
 * When the single argument is a generator function, creates a sequence
 * from repeated invocation of the function.  For example:
 *     var g = (function () {
 *         var a = 0, b = 1;
 *         return function() {
 *             var t = b;
 *             b = a + b;
 *             a = t;
 *             return a;
 *         }
 *     })();
 *     stream(g)       //=> 1,1,2,3,5,8,...
 */

test('testing ... ', function (t) {
	found = null;
	t.deepEqual(null, found);
	t.end();
});
