var test = require('tap').test;
var taak = require('../taak.js')();

var ln, wanted, found;

/**
 * Fn creates a function from the argument.
 * - If the argument is a Function, returns it.
 * - If the argument is a string, treats it a lambda expression.
 * - If the argument is a number or boolean, creates a constant function.
 *
 * Functions created from strings are cached.  Subsequent calls to fn
 * with the same string will return the same function.
 *
 * @example
 *     fn('x -> x+1')         //=> function(x) {return x+1}
 *     fn('x -> y -> x*y')
 *     //=> function(x) {return (function(y) {return x*y})}
 *     fn('x,y -> x*y')       //=> function(x,y) {return x*y}
 *     fn('x y -> x*y')       //=> x,y -> x*y
 *     fn('x,y,z -> (x+y)/z') //=> x,y,z -> (x+y)/z
 *     fn('x')                //=> x -> x
 *     fn('x+y')              //=> function(x,y) {return x+y}
 *     fn('y-x')              //=> x,y -> y-x
 *     fn('_+1')              //=> x -> x + 1
 *     fn('*2')               //=> x -> x * 2
 *     fn('2*')               //=> x -> 2 * x
 *     fn('%2 === 0')         //=> x -> x % 2 === 0
 *     fn('/')                //=> x,y -> x / y
 *     fn('-')                //=> x -> -x
 *     fn(0)                  //=> function(x) { return 0 }
 *     fn(true)               //=> function(x) { return true }
 */


test('testing ... ', function (t) {
	found = null;
	t.deepEqual(null, found);
	t.end();
});
