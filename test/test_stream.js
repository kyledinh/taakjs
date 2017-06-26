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

test('testing stream ', function (t) {
	st = taak.stream(1,2,3);
	t.deepEqual([1,2,3], st.toArray());
	t.deepEqual(2, st.get(1));
	t.end();
});

test('testing map() ', function (t) {
	st = taak.stream(1,2,3);
	t.deepEqual([2,4,6], st.map(taak.fn('x -> 2*x')).toArray());
	t.end();
});

/*
test('testing map2() ', function (t) {
	st = taak.stream(1,2,3);
	t.deepEqual([2,3,4], st.map(taak.fn('x -> x + 1')).toArray());
	t.end();
});
*/

test('testing filter() ', function (t) {
	st = taak.stream(1,2,3,4,5,6);
	t.deepEqual([2,4,6], st.filter(taak.fn('%2 === 0')).toArray());
	t.end();
});

test('testing drop() ', function (t) {
	st = taak.stream(1,2,3,4,5,6);
	t.deepEqual([2,3,4,5,6], st.drop(1).toArray());
	t.deepEqual([4,5,6], st.drop(3).toArray());
	t.end();
});

test('testing take() ', function (t) {
	st = taak.stream(1,2,3,4,5,6);
	t.deepEqual([1], st.take(1).toArray());
	t.deepEqual([1,2,3], st.take(3).toArray());
	t.end();
});

/*
 * slice(a, b) a is index of first cut until b index
 */
test('testing slice() ', function (t) {
	st = taak.stream(1,2,3,4,5,6);
	t.deepEqual([1], st.slice(0,1).toArray());
	t.deepEqual([3,4], st.slice(2,4).toArray());
	t.end();
});

/*
test('testing splice() ', function (t) {
	st = taak.stream(1,2,3,4,5,6);
	t.deepEqual([1,2,99,3,4,5,6], st.splice(2,1,99).toArray());
	t.deepEqual([3,4], st.splice(2,4).toArray());
	t.end();
});
*/


test('testing append() ', function (t) {

	t.end();
});


test('testing prefix() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing concat() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing fold() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing all() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing any() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing head() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing get() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing toArray() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing fromJson() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing toJson() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing proto_stream_array.each() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing proto_stream_array.get() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing proto_stream_function.each() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing proto_stream_map.each() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing proto_stream_map2.each() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing proto_stream_filter.each() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing proto_stream_drop.each() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing proto_stream_take.each() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing proto_stream_slice.each() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing proto_stream_splice.each() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing proto_stream_append.each() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing proto_stream_prefix.each() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing proto_stream_array.concat() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing proto_stream_seq.each() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing proto_stream_iter.each() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing proto_stream.lines() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing proto_stream_lines.each() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

test('testing proto_stream_tick.each() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

/*
    // TREES
    taak.tree = function(value, nodes) {
        var that = Object.create(proto_stream_tree);
        that.value = value;
        that.nodes = nodes;
        return that;
    };

    proto_stream_tree.map = function (f) {
        var that = Object.create(proto_stream_tree_map);
        that.source = this;
        that.mapFn = f;
        return that;
    };

    proto_stream_tree_map.inorder = function () {
        var that = Object.create(proto_stream_tree_inorder);
        that.source = this;
        return that;
    };

    proto_stream_tree_inorder.each = function (f) {
    }
*/
