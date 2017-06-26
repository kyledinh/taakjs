var test = require('tap').test;
var taak = require('../taak.js')();

//If we list all the natural numbers below 10 that are multiples of 3 or 5, we get 3, 5, 6 and 9. The sum of these multiples is 23.
//Find the sum of all the multiples of 3 or 5 below 1000.

var euler_1 = function (limit) {
    var i, total = 0;
    for (i=0; i < limit; i++) {
        if ((i % 3) === 0) {
            total += i;
        } else if ((i % 5) === 0) {
            total += i;
        }
    }
    console.log("total ", total);
    return total;
}

test('testing ... ', function (t) {
	found = null;
	t.deepEqual(233168, euler_1(1000));
	t.end();
});

var euler_1_taak = function (a, b, limit) {
    var isMod = function (x) {
        return function (y) {
            return (y % x) === 0;
        }
    }
    var i, total = 0;
    var passable = taak.anyjoin(isMod(a), isMod(b));
    for (i=0; i < limit; i++) {
        if (passable(i)) {
            total += i;
        }
    }
    console.log("total ", total);
    return total;
};

test('testing functionally  ', function (t) {
	found = null;
	t.deepEqual(233168, euler_1_taak(3, 5, 1000));
	t.end();
});
