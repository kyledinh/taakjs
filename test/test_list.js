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
