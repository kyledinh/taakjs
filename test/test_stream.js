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
	var slic = st.slice(0,3);
	//console.log("slic : ", slic);
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

/**
 * Creates a new stream with an item appended to the end.
 */
test('testing append() ', function (t) {
	st = taak.stream("apple","berry","capers");
	var st2 = st.append("dill");
	console.log("st  : ",st.toArray());
	console.log("st2 : ",st2.toArray());
	t.deepEqual(["apple","berry","capers","dill"], st2.toArray());

	st = taak.stream(1,2,3);
	t.deepEqual([1,2,3,5], st.append(5).toArray());
	t.end();
});

/**
 * Creates a new stream with an item added to the front.
 */
test('testing prefix() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

/**
 * Creates a new stream with another stream appended to the end.
 */
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

/**
 * Creates a stream of javascript values from a stream of json strings.
 *
 * @example:
 *     stream('1 "abc" [1] {"a":true} ').fromJson();
 *     //=> stream(1, "abc", [1], {a:true});
 */
test('testing fromJson() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

/**
 * Creates a stream of json strings from a stream of javascript values.
 *
 * @example:
 *     stream(1, "abc", [1], {a:true}).toJson();
 *     //=> stream('1', '"abc"', '[1]', '{"a":true}')
 */
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

/**
 * Creates a sequence beginning with a seed and subsequent values computed
 * by applying a step function to the previous value. If step is a number,
 * the next number is the step added to the previous one.  If the step is
 * not specified a default value of 1 is used.
 *
 * @example
 *     from(1, function(x) { return 2*x });  // => 1,2,4,8,16, ...
 *     from(100, -2);      // => 100,98,96,94,...
 *     from();             // => 0,1,2,3,4,...
 *
 * @param {number} seed=0
 * @param {number|function} step=1
 */
test('testing stream.from() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

/**
 * Creates a stream from an array.
 */
test('testing stream.fromArray() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

/**
 * Creates a stream from a list.
 */
test('testing stream.fromList() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

/**
 * Creates a stream which yields a value periodically.
 *
 * @example:
 *     // prints a random number every second
 *     taak.tick(1000, Math.random).each(console.log);
 */
test('testing taak.tick() ', function (t) {
	t.deepEqual(null, found);
	t.end();
});

/**
 * Makes a stream from a list.
 */
test('testing list.listToStream() ', function (t) {
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
