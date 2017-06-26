var test = require('tap').test;
var taak = require('../taak.js')();

var ls, wanted, found;

/**
 * Creates a list.
 *
 *    list()         //=> empty list
 *    list(1)        //=> 1
 *    list(1,2,3)    //=> 1,2,3
 *    list([1,2,3])  //=> 1,2,3
 *
 */

/**
 * Size returns the number of elements in the list.
 */
test('testing size() ', function (t) {
	ls = taak.list(1,2,3);
	t.deepEqual(3, ls.size());
	t.end();
});

/**
 * Returns the smallest value in the list.
 */
test('testing min() ', function (t) {
	ls = taak.list(10,2,3);
	t.deepEqual(2, ls.min());
	t.end();
});

/**
 * Returns the greatest value in the list.
 */
test('testing max() ', function (t) {
	ls = taak.list(10,2,3);
	t.deepEqual(10, ls.max());
	t.end();
});

/**
 * Returns the lowest index where value is found or -1 if value is not in
 * the list.
 */
test('testing indexOf() ', function (t) {
	ls = taak.list(7,2,99,1,13,45,7);
	t.deepEqual(2, ls.indexOf(99, 0));
	t.deepEqual(6, ls.indexOf(7, 4));   // skips to index 4, then search
	t.deepEqual(-1, ls.indexOf(44, 0));
	t.end();
});

/**
 * Returns the highest index where value is found or -1 if value is not in
 * the list.
 */
test('testing lastIndexOf() ', function (t) {
	ls = taak.list(7,2,99,1,13,45,7);
	t.deepEqual(2, ls.lastIndexOf(99));
	t.deepEqual(6, ls.lastIndexOf(7));
	t.deepEqual(0, ls.lastIndexOf(7,5));   // skips to index 5 and higher, then search
	t.deepEqual(-1, ls.lastIndexOf(44, 0));
	t.end();
});

/**
 * Map creates a new list by applying the argument function f to each
 * element of this list.
 *
 * @param f
 *
 * @example
 *    list(1,2,3).map(function(x) { return 2*x; }) //=> list(2,4,6)
 */
test('testing map() ', function (t) {
	var doubleMe = function (x) { return 2 * x };
	ls = taak.list(1,2,3).map( doubleMe );
	t.deepEqual(6, taak.list(2,4,6).max());
	t.deepEqual(6, ls.max());
	t.end();
});

/**
 * Filter creates a new list with all elements of this._array for which
 * the filtering function returns true.
 *
 * @param f
 *
 * @example
 *    list(1,2,3).filter(function(x) { return x > 1; }) //=> list(2,3)
 */
test('testing filter() ', function (t) {
	var even = function (x) { return (x % 2) === 0; };
	ls = taak.list(1,2,3,4,5).filter( even );
	t.deepEqual(2, ls.size());
	t.deepEqual(4, ls.max());
	t.end();
});

/**
 * Drop returns a copy of the list without the first n elements.
 *
 * @param n
 *
 * @example
 *    list(1,2,3,4,5).drop(3) //=> list(4,5)
 */
test('testing drop() ', function (t) {
	ls = taak.list(1,2,3,4,5);
	t.deepEqual(4, ls.drop(1).size());
	t.deepEqual(2, ls.drop(3).size());
	t.deepEqual(3, ls.drop(2).min());
	t.end();
});

/**
 * Take returns a list of the first n elements.
 *
 * @param n
 *
 * @example
 *    list(1,2,3,4,5).take(3) //=> list(1,2,3)
 *    list(1,2).take(4) //=> list(1,2)
 */
test('testing take() ', function (t) {
	ls = taak.list(1,2,3,4,5);
	t.deepEqual(2, ls.take(2).size());
	t.deepEqual(1, ls.take(3).min());
	t.deepEqual(4, ls.take(4).max());
	t.end();
});

/**
 * Fold starts with an initial value of an accumulator and successively
 * combines it with elements of this list using a binary function.
 *
 * list(1,2,3).fold(0, f) //=> f(f(f(0, 1), 2), 3)
 *
 * @example
 *    list(1,2,3,4).fold(1, function(a,b) { return a*b; }) //=> 24
 */
test('testing fold() ', function (t) {
	ls = taak.list(1,2,3,4,5);
	t.deepEqual(15, ls.fold(0, function(a,b) { return a + b; } ));
	t.deepEqual(120, ls.fold(1, function(a,b) { return a * b; } ));
	t.end();
});

/**
 * Returns true if p(x) is true for all x in the list.
 *
 * @example
 *    function even(x) { return x % 2 === 0; }
 *
 *    list(2,4,6).all(even);  // true
 */
test('testing all() ', function (t) {
	function even(x) { return x % 2 === 0; }
	t.deepEqual(true, taak.list(2,4,6).all(even));
	t.deepEqual(false, taak.list(2,4,6,7).all(even));
	t.end();
});

/**
 * Returns true if p(x) is true for any x in the list.
 *
 * @example
 *    function even(x) { return x % 2 === 0; }
 *
 *    list(1,3,5).any(even);  // false
 *    list(1,3,6).any(even);  // true
 */
test('testing any() ', function (t) {
	function even(x) { return x % 2 === 0; }
	t.deepEqual(true, taak.list(1,4,5).any(even));
	t.deepEqual(false, taak.list(1,5,7).any(even));
	t.end();
});

/**
 * Head returns the first element of the list.
 *
 * @example
 *    list(1,2,3,4).head() //=> 1
 */
test('testing head() ', function (t) {
	t.deepEqual(1, taak.list(1,4,5).head());
	t.deepEqual(5, taak.list(5,7,3,2).head());
	t.end();
});

/**
 * Get returns the nth element of the list.
 *
 * @param n
 *
 * @example
 *    list(1,2,3,4).get(0) //=> 1
 *    list(1,2,3,4).get(1) //=> 2
 */
test('testing get() ', function (t) {
	t.deepEqual(1, taak.list(1,4,5).get(0));
	t.deepEqual(4, taak.list(1,4,5).get(1));
	t.deepEqual(3, taak.list(5,7,3,2).get(2));
	t.end();
});

/**
 * Creates a reversed copy of this list.
 *
 * @example
 *    list(1,2,3,4).reverse() //=> list(4,3,2,1)
 */
test('testing reverse() ', function (t) {
	t.deepEqual(5, taak.list(1,4,5).reverse().get(0));
	t.deepEqual(3, taak.list(5,7,3,2).reverse().get(1));
	t.end();
});

/**
 * ToArray returns a JavaScript array containing elements of this list.
 *
 * @param n
 *
 * @example
 *    list(1,2,3,4).toArray()  //=> [1,2,3,4]
 */
test('testing toArray() ', function (t) {
	t.deepEqual([1,4,5], taak.list(1,4,5).toArray());
	t.deepEqual([5,7,3,2], taak.list(5,7,3,2).toArray());
	t.end();
});

/**
 * Each invoke a function for each element of the list.
 *
 * @param f
 *
 * @example
 *    list(1,2,3,4).each(function(n) { console.log(n); })
 */
test('testing each() ', function (t) {
	var counter = 0;
	taak.list(1,22,25,44,55).each(function () { counter += 1; });
	t.deepEqual(5, counter);
	t.end();
});

test('testing toString() ', function (t) {
	t.deepEqual("list(1, 4, 5)", taak.list(1,4,5).toString());
	t.deepEqual("list(5, 7, 3, 2)", taak.list(5,7,3,2).toString());
	t.end();
});
