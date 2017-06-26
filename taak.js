/*
 * Written by Trung Dinh
 * Refactored & Updated by Kyle Dinh, 2017.
 * https://github.com/kyledinh/taakjs
 */
var APP = APP || {};

APP.Taak = function (mode) {

	var taak = {};
	var END = {};
	var EMPTY = {};
	var STOP = {};

// LOGGER ////

	var LOG_LEVEL = (typeof mode !== 'undefined') ? mode : null;
    var logger = function () {
        if (LOG_LEVEL === 'DEBUG' || LOG_LEVEL === 'INFO' ||
            APP.LOG_LEVEL === 'DEBUG' || APP.LOG_LEVEL === 'INFO') {
            var i, msg = "";
            for (i = 0; i < arguments.length; i++) { msg += arguments[i]; }
            console.log(LOG_LEVEL, msg);
        }
    };

// PRIVATE UTIL FUNCTIONS ////

	function slice(obj) {
        return Array.prototype.slice.apply(
            obj, Array.prototype.slice.call(arguments, 1)
        );
    }

    function getOrElse(obj, key, defaultValue) {
        var value = obj[key];
        return value !== undefined ? value : defaultValue;
    }

    function isWhiteSpace(c) {
        return c == ' ' || c == '\t' || c == '\n' || c == '\r' || c == '\v';
    }

    function isDigit(c) {
        return '0' <= c && c <= '9';
    }

    function isHexDigit(c) {
        return isDigit(c) || ('a' <= c && c <= 'f') || ('A' <= c && c <= 'F');
    }

    function isLetter(c) {
        return ('a' <= c && c <= 'z\uffff') || ('A' <= c && c <= 'Z\uffff');
    }

    function isIdStartChar(c) {
        return isLetter(c) || c === '_' || c === '$';
    }

    function isIdChar(c) {
        return isLetter(c) || isDigit(c) || c === '_' || c === '$';
    }

    function isCtrlChar(c) {
        return c <= '\u001f' || ('\u007f' <= c && c <= '\u009f');
    }

    function isJsonStringChar(c) {
        return c !== '\\' && c !== '"' && c > '\u001f' &&
            (c < '\u007f' || c > '\u009f');
    }

    function unescape(c) {
        if (c === '"') {
            return '"';
        } else if (c === '\\') {
            return '\\';
        } else if (c === '/') {
            return '/';
        } else if (c === 'b') {
            return '\b';
        } else if (c === 'f') {
            return '\f';
        } else if (c === 'n') {
            return '\n';
        } else if (c === 'r') {
            return '\r';
        } else if (c === 't') {
            return '\t';
        }
    }

    function isEqual(a, b) {
        if (typeof a !== typeof b) {
            return false;
        }
        if (typeof a === 'function') {
            return a === b;
        }
        if (typeof a === 'string') {
            return a === b;
        }
        if (typeof a === 'number') {
            return a === b;
        }
        if (typeof a.equals === 'function') {
            return a.equals(b);
        }
        if (isLikeArray(a) && isLikeArray(b)) {
            if (a.length !== b.length) {
                return false;
            }
            for (var i = 0; i < a.length; i++) {
                if (!isEqual(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        }

        for (var p in a) {
            if (!isEqual(a[p], b[p])) {
                return false;
            }
        }
        return true;
    }

	isLikeArray = function (obj) {
        return obj &&
            typeof obj === 'object' &&
            isFinite(obj.length) &&
            obj.length >= 0 &&
            obj.length < 4294967296 &&
            obj.length === Math.floor(obj.length);
    };

	taak.isLikeArray = isLikeArray;

	function curry (f, arity) {
		arity = arity || f.length;
		return function () {
			if (arguments.length < arity) {
				return curry(taak.partial.apply(this, [f].concat(slice(arguments))), arity - arguments.length);
			} else {
				return f.apply(this, arguments);
			}
		};
	}

	taak.curry = curry;

// MODIFIER METHODS ////

    taak.identity = function (x) {
        return x;
    };

    taak.not = function (x) {
        return !x;
    };

    taak.negate = function (x) {
        return -x;
    };

    taak.recip = function (x) {
        return 1 / x;
    };

    taak.add = curry(function (a, b) {
        return a + b;
    });

    taak.sub = curry(function (a, b) {
        return a - b;
    });

    taak.mul = curry(function (a, b) {
        return a * b;
    });

    taak.div = curry(function (a, b) {
        return a / b;
    });

    taak.mod = curry(function (a, b) {
        return a % b;
    });

// TAAK BASE METHODS ////

	taak.extend = function (target) {
	    slice(arguments, 1).forEach(function (source) {
	        for (var prop in source) {
	            target[prop] = source[prop];
	        }
	    });
	    return target;
	};

    taak.classOf = function (obj) {
        return typeof obj === 'object' ?
            Object.prototype.toString(obj).slice(8, -1) : '';
    };

    taak.make = function (prototype) {
        var that = Object.create(prototype);
        for (var i = 1; i < arguments.length; i++) {
            taak.extend(that, arguments[i]);
        }
        return that;
    };

    taak.partial = function (f) {
        var args = slice(arguments, 1);
        return function () {
            return f.apply(this, args.concat(slice(arguments)));
        };
    };

    taak.index = curry(function (a, b) {
        return a[b];
    });

    taak.flatten = function (array) {
        var result = [], len = array.length, n = 0, i, j, a, l;
        for (i = 0; i < len; i++) {
            a = array[i];
            l = a.length;
            for (j = 0; j < l; j += 1) {
                result[n] = a[j];
                n += 1;
            }
        }
        return result;
    };

	// Ask Wong, should this be reversed? to combo = arg0 -> arg1 ->argn
	// currently: combo = arg3 -> arg2 -> arg1 -> arg0
    taak.compose = function () {
        var fns = arguments;
        return function (x) {
            var value = x,
                n = fns.length;
            while (n--) {
                value = fns[n](value);
            }
            return value;
        };
    };

    taak.dot = function (name) {
        return function (obj) {
            return obj[name];
        };
    };

    taak.pick = function () {
        var names = slice(arguments);
        return function (obj) {
            var a = [], len = names.length, i;
            for (i = 0; i < len; i++) {
                a[i] = obj[names[i]];
            }
            return a;
        };
    };

    taak.invert = function (f) {
        return function (x) {
            return !f(x);
        };
    };

    taak.eq = curry(isEqual);

    taak.const = function (c) {
        return function (x) {
            return c;
        };
    };

    taak.inc = function (c) {
        return function (x) {
            return x + c;
        };
    };

    taak.scale = function (c) {
        return function (x) {
            return x * c;
        };
    };

    taak.step = function (c) {
        return function (x) {
            return x < c ? 0 : 1;
        };
    };

    taak.shift = function (c) {
        return function (f) {
            return function (x) {
                f(x + c);
            };
        };
    };

	taak.anyjoin = function () {
        var fns = slice(arguments);
        return function (x) {
            var result = false, len = fns.length, i;
            for (i = 0; i < len && !result; i++) {
                if (fns[i](x) === true) {
					return true;
				}
            }
            return result;
        };
    };

    taak.conjoin = function () {
        var fns = slice(arguments);
        return function (x) {
            var result = true, len = fns.length, i;
            for (i = 0; i < len && result; i++) {
                result = result && fns[i](x);
            }
            return result;
        };
    };

    taak.disjoin = function () {
        var fns = slice(arguments);
        return function (x) {
            var result = false, len = fns.length, i;
            for (i = 0; i < len && !result; i++) {
                result = result || fns[i](x);
            }
            return result;
        };
    };

    taak.flip = function (f) {
        return function (x,y) {
            return f(y,x);
        };
    };

// LIST ////
    var proto_list = {};

    function wrap(array) {
        return Object.create(proto_list, { _array: { value: array } });
    }

    function list() {
        var that;
        if (arguments.length !== 1) {
            that = Object.create(proto_list);
            that._array = slice(arguments);
        } else {
            var arg = arguments[0];
            if (taak.isLikeArray(arg)) {
                that = wrap(slice(arg));
            } else {
                that = Object.create(proto_list);
                that._array = [ arg ];
            }
        }
        return that;
    }

    proto_list.size = function () {
        return this._array.length;
    };

    proto_list.min = function () {
        var out = this._array[0];
        this._array.forEach(function(x) { if (x < out) out = x; });
        return out;
    };

    proto_list.max = function () {
        var out = this._array[0];
        this._array.forEach(function(x) { if (x > out) out = x; });
        return out;
    };

    proto_list.indexOf = function (value, from) {
		if (typeof from === 'undefined') {
        	return this._array.indexOf(value);
		} else {
			return this._array.indexOf(value, from);
		}
    };

    proto_list.lastIndexOf = function (value, from) {
        if (typeof from === 'undefined') {
            return this._array.lastIndexOf(value);
        } else {
            return this._array.lastIndexOf(value, from);
        }
    };

    proto_list.map = function (f) {
        return wrap(this._array.map(f));
    };

    proto_list.filter = function (f) {
        return wrap(this._array.filter(f));
    };

    proto_list.drop = function (n) {
        return wrap(this._array.slice(n));
    };

    /**
     * Take returns a list of the first n elements.
     *
     * @param n
     *
     * @example
     *    list(1,2,3,4,5).take(3) //=> list(1,2,3)
     *    list(1,2).take(4) //=> list(1,2)
     */
    proto_list.take = function (n) {
        return wrap(this._array.slice(0, n));
    };

    /**
     * Fold starts with an initial value of an accumulator and successively
     * combines it with elements of this list using a binary function.
     *
     * list(1,2,3).fold(0, f) //=> f(f(f(0, 1), 2), 3)
     *
     * @example
     *    list(1,2,3,4).fold(1, function(a,b) { return a*b; }) //=> 24
     */
    proto_list.fold = function (init, f) {
        return this._array.reduce(f, init);
    };

    /**
     * Returns true if p(x) is true for all x in the list.
     *
     * @example
     *    function even(x) { return x % 2 === 0; }
     *
     *    list(2,4,6).all(even);  // true
     */
    proto_list.all = function (p) {
        return this._array.every(p);
    };

    /**
     * Returns true if p(x) is true for any x in the list.
     *
     * @example
     *    function even(x) { return x % 2 === 0; }
     *
     *    list(1,3,5).all(even);  // false
     *    list(1,3,6).all(even);  // true
     */
    proto_list.any = function (p) {
        return this._array.some(p);
    };

    /**
     * Head returns the first element of the list.
     *
     * @example
     *    list(1,2,3,4).head() //=> 1
     */
    proto_list.head = function () {
        return this._array[0];
    };

    /**
     * Get returns the nth element of the list.
     *
     * @param n
     *
     * @example
     *    list(1,2,3,4).get(0) //=> 1
     *    list(1,2,3,4).get(1) //=> 2
     */
    proto_list.get = function (n) {
        return this._array[n];
    };

    /**
     * Creates a reversed copy of this list.
     *
     * @example
     *    list(1,2,3,4).reverse() //=> list(4,3,2,1)
     */
    proto_list.reverse = function () {
        return wrap(this._array.reverse());
    };

    /**
     * ToArray returns a JavaScript array containing elements of this list.
     *
     * @param n
     *
     * @example
     *    list(1,2,3,4).toArray()  //=> [1,2,3,4]
     */
    proto_list.toArray = function () {
        return this._array.slice();
    };

    /**
     * Each invoke a function for each element of the list.
     *
     * @param f
     *
     * @example
     *    list(1,2,3,4).each(function(n) { console.log(n); })
     */
    proto_list.each = function (f) {
        this._array.forEach(f);
    };

    proto_list.toString = function () {
        return "list(" + this._array.join(", ") + ")";
    };

    // export list
    taak.list = list;


	// PUBLIC ////
	return taak;
};

if (typeof module !== 'undefined') {
	module.exports = function (mode) {
		for (var i = 0; i < arguments.length; i++) {
			console.log("ARGS : ",arguments[i]);
		}
		return (typeof mode === 'undefined') ? new APP.Taak('PROD') : new APP.Taak(mode);
	};
}
