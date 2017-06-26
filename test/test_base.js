var test = require('tap').test;
var taak = require('../taak.js')();
var arr, obj, wanted, found;

// MODIFIER FUNCTIONS ////

/**
 * identity(x) //=> x
 */
test('testing identity() ', function (t) {
	wanted = 6;
	found = taak.identity(wanted); //=> 6
	t.deepEqual(wanted, found);
	t.end();
});

/**
 * not(x) //=> !x
 */
test('testing not() ', function (t) {
	wanted = 6;
	found = taak.not(wanted);
	t.deepEqual(false, found);
	t.end();
});

/**
 * negate(x) => -x
 */
test('testing negate() ', function (t) {
	wanted = -6;
	found = taak.negate(6);
	t.deepEqual(wanted, found);
	t.end();
});

/**
 * recip(x) => 1/x
 */
test('testing recip() ', function (t) {
	wanted = (1/6);
	found = taak.recip(6);
	t.deepEqual(wanted, found);
	t.end();
});

/**
 * add(a,b) => a + b
 */
test('testing add() ', function (t) {
	wanted = 9;
	found = taak.add(6, 3);
	t.deepEqual(wanted, found);
	t.end();
});

/**
 * sub(a,b) => a - b
 */
test('testing sub() ', function (t) {
	wanted = 6;
	found = taak.sub(9, 3);
	t.deepEqual(wanted, found);
	t.end();
});

/**
 * mul(a,b) => a * b
 */
test('testing mul() ', function (t) {
	wanted = 21;
	found = taak.mul(7, 3);
	t.deepEqual(wanted, found);
	t.end();
});

/**
 * div(a,b) => a / b
 */
test('testing div() ', function (t) {
	wanted = 7;
	found = taak.div(21, 3);
	t.deepEqual(wanted, found);
	t.end();
});

/**
 * mod(a,b) => a % b
 */
test('testing mod() ', function (t) {
	wanted = 3;
	found = taak.mod(3, 22);
	t.deepEqual(wanted, found);
	t.end();
});

// BASE METHODS ////

/**
 * Creates a curried function.
 *     var g = taak.curry(function(a,b,c) { return a+b+c });
 *     g(1)(2)(3); //=> 6
 *     g(1)(2,3); //=> 6
 */
test('testing curry() ', function (t) {
	var g = taak.curry(function(a,b,c) { return a+b+c });
	wanted = 6;
	found = g(1)(2)(3); //=> 6
	t.deepEqual(wanted, found);
	g(1)(2,3); //=> 6
	t.deepEqual(wanted, found);
	t.end();
});

/**
 * Append an object to a target object
 *     var obj = {a: "alfa"};
 *     var new_obj = taak.extend(obj, {b: "beta"});
 *     new_obj === {a: "alfa", b: "beta"};
 */
test('testing extend() ', function (t) {
	var alfa = {a: "alfa"};
	var beta = {b: "beta"};
	wanted = {a: "alfa", b: "beta"};
	t.deepEqual(wanted, taak.extend(alfa, beta));
	t.end();
});


/**
 * Returns true if the argument is an array like object.
 */
test('testing isLikeArray() ', function (t) {
	found = taak.isLikeArray([1,3,6]);
	t.deepEqual(true, found);
	found = taak.isLikeArray({ a: "alpha", b: "beta"});
	t.deepEqual(false, found);
	found = taak.isLikeArray(12);
	t.deepEqual(false, found);
	t.end();
});

/**
 * Returns the class of the argument.
 */
 // Check with Wong
 /*
test('testing classOf() ', function (t) {
	wanted = 'number';
	found = taak.classOf(23);
	t.deepEqual(wanted, found);
	t.deepEqual('string', taak.classOf('fred'));
	t.deepEqual('object', taak.classOf({id:3}));
	t.deepEqual('object', taak.classOf([1,2,3]));
	t.end();
});
*/


/**
 * Make creates a new object with a specified prototype.  If additional
 * arguments are given, copy the enumerable properties from the arguments
 * to the new object.
 */
/*
test('testing make() ', function (t) {
	t.deepEqual(wanted, found);
	t.end();
});
*/

/**
 * Given a function returns a new function with the first n parameters
 * bound.
 *
 * @example:
 *     function add(x,y) { return x+y }
 *
 *     var g = taak.partial(add, 2);
 *     g(1); //=> 3
 *     g(3); //=> 5
 */
test('testing partial() ', function (t) {
	function add(x,y) { return x+y }
	var g = taak.partial(add, 2);
	wanted = 4;
	t.deepEqual(wanted, g(2));
	wanted = 9;
	t.deepEqual(wanted, g(7));
	t.end();
});

/**
 * index(a,b) => a[b]
 */
test('testing index() ', function (t) {
	wanted = "two";
	arr = [{a: "a"},1,"two",3];
	t.deepEqual(wanted, taak.index(arr,2));
	obj = {a: "a"};
	t.deepEqual(obj, taak.index(arr,0));
	t.deepEqual(arr[3], taak.index(arr,3));
	t.end();
});


/**
 * Converts an array of arrays to an array of their elements.
 *
 * @example
 *     flatten([ [1,2], [], [3] ])  // => [1,2,3]
 *     flatten([ [1], [[2]], [3] ]) // => [1, [2], 3]
 */
test('testing flatten() ', function (t) {
	t.deepEqual([1,2,3], taak.flatten([ [1,2], [], [3] ]));
	t.deepEqual([1, [2], 3], taak.flatten([ [1], [[2]], [3] ]));
	t.end();
});

/**
 * Uses arguments of functions to create one function
 *
 * var func = taak.compose(zeta, beta, alpha);
 * func(x) => alpha() -> beta() -> zeta();
 */
test('testing compose() ', function (t) {
	var square = function (n) { return n * n };
	var add5 = function (n) { return n + 5 };
	var neg  = function (n) { return n * -1 };
	var combo = taak.compose(neg, square, add5);
	t.deepEqual(-225, combo(10));
	t.deepEqual(-25, combo(0));
	t.deepEqual(-49, combo(2));
	t.end();
});


/**
 *
 * @example:
 *     taak.dot("name")({ "name" : "Bob" }); //=> "Bob"
 */
test('testing dot() ', function (t) {
	wanted = "Bob";
	found = taak.dot("name")({ "name" : "Bob" });
	t.deepEqual(wanted, found);
	found = taak.dot("name")({ name : "Bob" });
	t.deepEqual(wanted, found);
	// This function only looks at first level key-values
	found = taak.dot("name")({ id : 894, person: { name : "Bob" }});
	t.notDeepEqual(wanted, found);
	t.end();
});

/**
 *
 * @example:
 *     var p = {name: "Bob", age: 29, gender: "M"};
 *     taak.pick("name", "age")(p); //=> ["Bob", 29]
 */
test('testing pick() ', function (t) {
	obj = {name: "Bob", age: 29, gender: "M"};
	wanted = ["Bob", 29];
	found = taak.pick("name", "age")(obj);
	t.deepEqual(wanted, found);
	found = taak.pick("gender", "name")(obj);
	t.deepEqual(["M", "Bob"], found);
	// Object must contain the requested key
	found = taak.pick("name", "age", "height")(obj);
	t.notDeepEqual(wanted, found);
	t.end();
});

/**
 * Logical negation.
 * @example:
 *     taak.invert(taak.eq(0))(1); //=> true
 */

test('testing invert() ', function (t) {
	var a = function () { return true };
	var b = taak.invert(a);
	t.deepEqual(true, a());
	t.deepEqual(false, b());
	t.end();
});

test('testing eq() ', function (t) {
	t.deepEqual(true, taak.eq(123,123));
	t.deepEqual(true, taak.eq({a: "alfa"}, {a: "alfa"}));
	t.deepEqual(false, taak.eq([1,2],[1,3]));
	t.end();
});

/**
 * Sets a function to return a constant
 */

test('testing const() ', function (t) {
	var sys = {};
	sys.alpha = taak.const("ALPHA");
	t.deepEqual("ALPHA", sys.alpha());
	//t.deepEqual(wanted, found);
	t.end();
});

/*
 * Create a function with a fixed incrementor
 */
test('testing inc() ', function (t) {
	var incBy2 = taak.inc(2);
	var incBy10 = taak.inc(10);
	t.deepEqual(8, incBy2(6));
	t.deepEqual(44, incBy10(34));
	//t.deepEqual(wanted, found);
	t.end();
});

/*
 * Create a function with a fixed multipler
 */
test('testing scale() ', function (t) {
	var times3 = taak.scale(3);
	var timesNeg2 = taak.scale(-2);
	t.deepEqual(21, times3(7));
	t.deepEqual(-22, timesNeg2(11));
	t.end();
});

/*
 * Creates a function that will return a 1 when a step value is met or above
 * and returns a 0 when the value is below the step value
 */
test('testing step() ', function (t) {
	var step7 = taak.step(7);
	t.deepEqual(0, step7(4));
	t.deepEqual(0, step7(6));
	t.deepEqual(1, step7(7));
	t.deepEqual(1, step7(34));
	t.end();
});

/*
 * Ask Wong
 *
test('testing shift() ', function (t) {
	var dub = function (x) { return 2 * x };
	var shift3 = taak.shift(dub);
	t.deepEqual(26, shift3(10));
	t.deepEqual(11, shift3(2.5));
	t.end();
});
*/

/*
 * Joins all a series of Boolean functions to check all are true
 */

test('testing conjoin() ', function (t) {
	var lessThan100 = function (n) { return n < 100 };
	var moreThan20 = function (n) { return n > 20 };
	var notNegative = function (n) { return n > -1 };
	var passable = taak.conjoin(lessThan100,moreThan20,notNegative);
	t.deepEqual(true, passable(42));
	t.deepEqual(false, passable(12));
	t.end();
});


/*
 * Joins a series of Boolean functions to check all are false
 */
test('testing disjoin() ', function (t) {
	var moreThan100 = function (n) { return n > 100 };
	var lessThan20 = function (n) { return n < 20 };
	var isInteger = function (n) { return Number.isInteger(n) };
	var passable = taak.disjoin(moreThan100, lessThan20, isInteger);
	t.deepEqual(false, passable(42.778));
	t.deepEqual(true, passable(12));
	t.end();
});


/**
 * Given a binary function returns a new function with the order of
 * the arguments reversed.
 * @example:
 *     function div (a,b) { return a/b; }
 *     flip(div)(2,6); //=> 3
 */
test('testing flip() ', function (t) {
	var div = function (a, b) { return a / b };
	var flipdiv = taak.flip(div);
	t.deepEqual(20, div(100, 5));
	t.deepEqual(0.05, flipdiv(100, 5));
	t.end();
});
