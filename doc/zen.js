// ZEN.JS
(function () {
    "use strict";

    var zen = {};
    var END = {};
    var EMPTY = {};
    var STOP = {};

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
        if (likeArray(a) && likeArray(b)) {
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


    zen.extend = function (target) {
        slice(arguments, 1).forEach(function (source) {
            for (var prop in source) {
                target[prop] = source[prop];
            }
        });
        return target;
    };

    /**
     * Returns true if the argument is an array like object.
     */
    zen.isLikeArray = function (obj) {
        return obj &&
            typeof obj === 'object' &&
            isFinite(obj.length) &&
            obj.length >= 0 &&
            obj.length < 4294967296 &&
            obj.length === Math.floor(obj.length);
    };

    /**
     * Returns the class of the argument.
     */
    zen.classOf = function (obj) {
        return typeof obj === 'object' ?
            Object.prototype.toString(obj).slice(8, -1) : '';
    };

    /**
     * Make creates a new object with a specified prototype.  If additional
     * arguments are given, copy the enumerable properties from the arguments
     * to the new object.
     */
    zen.make = function (prototype) {
        var that = Object.create(prototype);
        for (var i = 1; i < arguments.length; i++) {
            zen.extend(that, arguments[i]);
        }
        return that;
    };

    /**
     * Given a function returns a new function with the first n parameters
     * bound.
     *
     * @example:
     *     function add(x,y) { return x+y }
     *
     *     var g = zen.partial(add, 2);
     *     g(1); //=> 3
     *     g(3); //=> 5
     */
    zen.partial = function (f) {
        var args = slice(arguments, 1);
        return function () {
            return f.apply(this, args.concat(slice(arguments)));
        };
    };

    /**
     * Creates a curried function.
     *
     * @example:
     *     var g = zen.curry(function(a,b,c) { return a+b+c });
     *     g(1)(2)(3); //=> 6
     *     g(1)(2,3); //=> 6
     */
    function curry(f, arity) {
        arity = arity || f.length;
        return function () {
            if (arguments.length < arity) {
                return curry(zen.partial.apply(this, [f].concat(slice(arguments))), arity - arguments.length);
            } else {
                return f.apply(this, arguments);
            }
        };
    }

    zen.curry = curry;

    /**
     * identity(x) //=> x
     */
    zen.identity = function (x) {
        return x;
    };

    /**
     * not(x) //=> !x
     */
    zen.not = function (x) {
        return !x;
    };

    /**
     * negate(x) => -x
     */
    zen.negate = function (x) {
        return -x;
    };

    /**
     * recip(x) => 1/x
     */
    zen.recip = function (x) {
        return 1 / x;
    };

    /**
     * add(a,b) => a + b
     */
    zen.add = curry(function (a, b) {
        return a + b;
    });

    /**
     * sub(a,b) => a - b
     */
    zen.sub = curry(function (a, b) {
        return a - b;
    });

    /**
     * mul(a,b) => a * b
     */
    zen.mul = curry(function (a, b) {
        return a * b;
    });

    /**
     * div(a,b) => a / b
     */
    zen.div = curry(function (a, b) {
        return a / b;
    });

    /**
     * mod(a,b) => a % b
     */
    zen.mod = curry(function (a, b) {
        return a % b;
    });

    /**
     * index(a,b) => a[b]
     */
    zen.index = curry(function (a, b) {
        return a[b];
    });

    /**
     * Converts an array of arrays to an array of their elements.
     *
     * @example
     *     flatten([ [1,2], [], [3] ])  // => [1,2,3]
     *     flatten([ [1], [[2]], [3] ]) // => [1, [2], 3]
     */
    zen.flatten = function (array) {
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

    zen.compose = function () {
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

    /**
     *
     * @example:
     *     zen.dot("name")({ "name" : "Bob" }); //=> "Bob"
     */
    zen.dot = function (name) {
        return function (obj) {
            return obj[name];
        };
    };

    /**
     *
     * @example:
     *     var p = {name: "Bob", age: 29, gender: "M"};
     *     zen.pick("name", "age")(p); //=> ["Bob", 29]
     */
    zen.pick = function () {
        var names = slice(arguments);
        return function (obj) {
            var a = [], len = names.length, i;
            for (i = 0; i < len; i++) {
                a[i] = obj[names[i]];
            }
            return a;
        };
    };

    /**
     * Logical negation.
     * @example:
     *     zen.invert(zen.eq(0))(1); //=> true
     */
    zen.invert = function (f) {
        return function (x) {
            return !f(x);
        };
    };

    zen.eq = curry(isEqual);

    zen.const = function (c) {
        return function (x) {
            return c;
        };
    };

    zen.inc = function (c) {
        return function (x) {
            return x + c;
        };
    };

    zen.scale = function (c) {
        return function (x) {
            return x * c;
        };
    };

    zen.step = function (c) {
        return function (x) {
            return x < c ? 0 : 1;
        };
    };

    zen.shift = function (c) {
        return function (f) {
            return function (x) {
                f(x + c);
            };
        };
    };

    zen.conjoin = function () {
        var fns = slice(arguments);
        return function (x) {
            var result = true, len = fns.length, i;
            for (i = 0; i < len && result; i++) {
                result = result && fns[i](x);
            }
            return result;
        };
    };

    zen.disjoin = function () {
        var fns = slice(arguments);
        return function (x) {
            var result = false, len = fns.length, i;
            for (i = 0; i < len && !result; i++) {
                result = result || fns[i](x);
            }
            return result;
        };
    };

    /**
     * Given a binary function returns a new function with the order of
     * the arguments reversed.
     * @example:
     *     function div (a,b) { return a/b; }
     *     flip(div)(2,6); //=> 3
     */
    zen.flip = function (f) {
        return function (x,y) {
            return f(y,x);
        };
    };

    // LAMBDA FUNCTIONS
    var fncache = {};

    function parse(expr) {
        var body = expr, params = [], fragments, i, n, len, left, right, temp, vars, v;

        expr = expr.trim();

        fragments = expr.split(/\s*->\s*/m);
        if (fragments.length > 1) {
            n = fragments.length - 1;
            body = fragments[n];
            for (n -= 1; n > 0; n -= 1) {
                params = fragments[n].split(/\s*,\s*|\s+/m);
                body = '(function(' + params + '){return (' + body + ')})';
            }
            params = fragments[n].split(/\s*,\s*|\s+/m);
        } else if (expr.match(/\b_\b/)) {
            params = '_';
        } else if (expr === '-') {
            params = '_';
            body = '-_';
        } else {
            left = expr.match(/^(?:[+\-*\/%&|\^\.=<>]|!=)/m);
            right = expr.match(/[+\-*\/%&|\^\.=<>!]$/m);
            if (left) {
                params.push('$1');
                body = '$1' + body;
            }
            if (right) {
                params.push('$2');
                body = body + '$2';
            }
            if (!left && !right) {
                temp = expr.replace(/(?:\b[A-Z]|\.[a-zA-Z_$])[a-zA-Z_$\d]*|[a-zA-Z_$][a-zA-Z_$\d]*\s*:|this|arguments|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, '');
                vars = temp.match(/([a-z_$][a-z_$\d]*)/gi) || [];
                vars.sort();
                len = vars.length;
                for (i = 0; i < len; i++) {
                    v = vars[i];
                    if (params.length === 0 || params[params.length - 1] !== v) {
                        params.push(v);
                    }
                }
            }
        }
        return { "params": params, "body": body };
    }

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

    function fn(arg) {
        var t = typeof arg, e, f;
        if (t === 'function') {
            f = arg;
        } else if (t === 'number' || t === 'boolean') {
            f = function (x) {
                return x;
            };
        } else if (t === 'string') {
            f = fncache[arg];
            if (typeof f !== 'function') {
                e = parse(arg);
                f = new Function(e.params, 'return ' + e.body);
                fncache[arg] = f;
            }
        }
        return f;
    }

    zen.fn = fn;
    zen.fn.parse = parse;

    // LIST
    var proto_list = {};

    function wrap(array) {
        return Object.create(proto_list, { _array: { value: array } });
    }

    /**
     * Creates a list.
     *
     *    list()         //=> empty list
     *    list(1)        //=> 1
     *    list(1,2,3)    //=> 1,2,3
     *    list([1,2,3])  //=> 1,2,3
     *
     */
    function list() {
        var that;
        if (arguments.length !== 1) {
            that = Object.create(proto_list);
            that._array = slice(arguments);
        } else {
            var arg = arguments[0];
            if (zen.isLikeArray(arg)) {
                that = wrap(slice(arg));
            } else {
                that = Object.create(proto_list);
                that._array = [ arg ];
            }
        }
        return that;
    }

    /**
     * Size returns the number of elements in the list.
     */
    proto_list.size = function () {
        return this._array.length;
    };

    /**
     * Returns the smallest value in the list.
     */
    proto_list.min = function () {
        var out = this._array[0];
        this._array.forEach(function(x) { if (x < out) out = x; });
        return out;
    };

    /**
     * Returns the greatest value in the list.
     */
    proto_list.max = function () {
        var out = this._array[0];
        this._array.forEach(function(x) { if (x > out) out = x; });
        return out;
    };

    /**
     * Returns the lowest index where value is found or -1 if value is not in
     * the list.
     */
    proto_list.indexOf = function (value, from) {
        return this._array.indexOf(value, from);
    };

    /**
     * Returns the highest index where value is found or -1 if value is not in
     * the list.
     */
    // TODO: This needs fixing, error was pickup up in unit testing. 
    proto_list.lastIndexOf = function (value, from) {
        if (typeof from === 'undefined') {
            return this._array.lastIndexOf(value);
        } else {
            return this._array.lastIndexOf(value, from);
        }
    };

    /**
     * Map creates a new list by applying the argument function f to each
     * element of this list.
     *
     * @param f
     *
     * @example
     *    list(1,2,3).map(function(x) { return 2*x; }) //=> list(2,4,6)
     */
    proto_list.map = function (f) {
        return wrap(this._array.map(f));
    };

    /**
     * Map creates a new list with all elements of this._array for which
     * the filtering function returns true.
     *
     * @param f
     *
     * @example
     *    list(1,2,3).filter(function(x) { return x > 1; }) //=> list(2,3)
     */
    proto_list.filter = function (f) {
        return wrap(this._array.filter(f));
    };

    /**
     * Drop returns a copy of the list without the first n elements.
     *
     * @param n
     *
     * @example
     *    list(1,2,3,4,5).drop(3) //=> list(4,5)
     */
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

    zen.list = list;

    // STREAM
    var proto_stream = { isStream: true };
    var proto_stream_array = Object.create(proto_stream);
    var proto_stream_filter = Object.create(proto_stream);
    var proto_stream_map = Object.create(proto_stream);
    var proto_stream_map2 = Object.create(proto_stream);
    var proto_stream_drop = Object.create(proto_stream);
    var proto_stream_take = Object.create(proto_stream);
    var proto_stream_slice = Object.create(proto_stream);
    var proto_stream_splice = Object.create(proto_stream);
    var proto_stream_get = Object.create(proto_stream);
    var proto_stream_seq = Object.create(proto_stream);
    var proto_stream_iter = Object.create(proto_stream);
    var proto_stream_function = Object.create(proto_stream);
    var proto_stream_lines = Object.create(proto_stream);
    var proto_stream_tick = Object.create(proto_stream);
    var proto_stream_append = Object.create(proto_stream);
    var proto_stream_prefix = Object.create(proto_stream);
    var proto_stream_concat = Object.create(proto_stream);

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
    function stream() {
        var that;
        if (arguments.length !== 1) {
            that = fromArray(arguments);
        } else {
            var arg = arguments[0];
            if (arg.isStream) {
                that = arg;
            } else if (arg.isList) {
                that = fromList(arg);
            } else if (typeof arg === 'function') {
                that = Object.create(proto_stream_function);
                that.g = arg;
            } else if (zen.isLikeArray(arg)) {
                that = fromArray(arg);
            } else {
                that = Object.create(proto_stream_array);
                that._array = [ arg ];
            }
        }
        return that;
    }

    proto_stream.map = function (f) {
        var that = Object.create(proto_stream_map);
        that.source = this;
        that.transform = f;
        return that;
    };

    proto_stream.map2 = function (f) {
        var that = Object.create(proto_stream_map2);
        that.source = this;
        that.transform = f;
        return that;
    };

    proto_stream.filter = function (f) {
        var that = Object.create(proto_stream_filter);
        that.source = this;
        that.filterFn = f;
        return that;
    };

    proto_stream.drop = function (n) {
        var that = Object.create(proto_stream_drop);
        that.source = this;
        that.n = n;
        return that;
    };

    proto_stream.take = function (n) {
        var that = Object.create(proto_stream_take);
        that.source = this;
        that.n = n;
        return that;
    };

    proto_stream.slice = function (n, m) {
        var that = Object.create(proto_stream_slice);
        that.source = this;
        that.n = n;
        that.m = m;
        return that;
    };

    proto_stream.splice = function (offset, count, items) {
        var that = Object.create(proto_stream_slice);
        that.source = this;
        that.offset = offset;
        that.count = count;
        that.items = items;
        return that;
    };

    /**
     * Creates a new stream with an item appended to the end.
     */
    proto_stream.append = function (item) {
        var that = Object.create(proto_stream_append);
        that.source = this;
        that.item = item;
        return that;
    };

    /**
     * Creates a new stream with an item added to the front.
     */
    proto_stream.prefix = function (item) {
        var that = Object.create(proto_stream_prefix);
        that.source = this;
        that.item = item;
        return that;
    };

    /**
     * Creates a new stream with another stream appended to the end.
     */
    proto_stream.concat = function (seq) {
        var that = Object.create(proto_stream_concat);
        that.source = this;
        that.source2 = seq;
        return that;
    };

    proto_stream.fold = function (init, f) {
        var out = init;
        this.each(function (x) {
            out = f(out, x);
        });
        return out;
    };

    proto_stream.all = function (p) {
        this.each(function (x) {
            if (!p(x)) {
                return false;
            }
        });
        return true;
    };

    proto_stream.any = function (p) {
        this.each(function (x) {
            if (p(x)) {
                return true;
            }
        });
        return false;
    };

    proto_stream.head = function () {
        var value;
        this.each(function (x) {
            value = x;
            return STOP;
        });
        return value;
    };

    proto_stream.get = function (n) {
        var value;
        this.each(function (x) {
            if (n <= 0) {
                value = x;
                return STOP;
            } else {
                n -= 1;
            }
        });
        return value;
    };

    proto_stream.toArray = function () {
        var a = [];
        this.each(function (e) {
            a.push(e);
        });
        return a;
    };

    /**
     * Creates a stream of javascript values from a stream of json strings.
     *
     * @example:
     *     stream('1 "abc" [1] {"a":true} ').fromJson();
     *     //=> stream(1, "abc", [1], {a:true});
     */
    proto_stream.fromJson = function () {
        return Object.create(proto_fromjson, {
            source: { value: this }
        });
    }

    /**
     * Creates a stream of json strings from a stream of javascript values.
     *
     * @example:
     *     stream(1, "abc", [1], {a:true}).toJson();
     *     //=> stream('1', '"abc"', '[1]', '{"a":true}')
     */
    proto_stream.toJson = function () {
        return Object.create(proto_tojson, {
            source: { value: this }
        });
    }

    proto_stream_array.each = function (f) {
        var array = this._array, len = array.length, i;
        for (i = 0; i < len; i++) {
            if (f(array[i], i) === STOP) {
                return;
            }
        }
    };

    proto_stream_array.get = function (n) {
        return this._array[n];
    };

    proto_stream_function.each = function(f) {
        var g = this.g;
        while (true) {
            if (f(g()) === STOP) {
                return STOP;
            }
        }
    };

    proto_stream_map.each = function (f) {
        var transform = this.transform;
        this.source.each(function (x) {
            return f(transform(x));
        });
    };

    proto_stream_map2.each = function (f) {
        var transform = this.transform;
        var a;
        this.source.each(function (x) {
            if (typeof a === 'undefined') {
                a = x;
            } else {
                var y = x;
                x = a;
                a = y;
                return f(transform(x, y));
            }
        });
    };

    proto_stream_filter.each = function (f) {
        var filterFn = this.filterFn;
        this.source.each(function (x) {
            if (filterFn(x)) {
                return f(x);
            }
        });
    };

    proto_stream_drop.each = function (f) {
        var n = this.n;
        this.source.each(function (x) {
            if (n > 0) {
                n -= 1;
            } else {
                return f(x);
            }
        });
    };

    proto_stream_take.each = function (f) {
        var n = this.n;
        this.source.each(function (x) {
            if (n <= 0) {
                return STOP;
            }
            n -= 1;
            return f(x);
        });
    };

    proto_stream_slice.each = function (f) {
        var n = this.n;
        var m = this.m;
        var i = 0;
        this.source.each(function (x) {
            if (i < m) {
                if (i >= n) {
                    if (f(x) === STOP) {
                        return STOP;
                    }
                }
                i++;
            }
        });
    };

    proto_stream_splice.each = function (f) {
        var offset = this.offset;
        var count = this.count;
        var items = this.items;
        var i = 0;
        this.source.each(function (x) {
            if (i < offset) {
                if (f(x) === STOP) {
                    return STOP;
                }
            } else if (i < offset + count) {
                if (f(items[i - offset]) === STOP) {
                    return STOP;
                }
            } else  {
                if (f(x) === STOP) {
                    return STOP;
                }
            }
            i++;
        });
    };

    proto_stream_append.each = function (f) {
        this.source.each(function (x) {
            if (f(x) === STOP) {
                return STOP;
            }
        });
        return f(x);
    };

    proto_stream_prefix.each = function (f) {
        if (f(this.item) === STOP) {
            return STOP;
        }
        this.source.each(function (x) {
            if (f(x) === STOP) {
                return STOP;
            }
        });
    };

    proto_stream_concat.each = function (f) {
        this.source.each(function (x) {
            if (f(x) === STOP) {
                return STOP;
            }
        });
        this.source2.each(function (x) {
            if (f(x) === STOP) {
                return STOP;
            }
        });
    };

    proto_stream_seq.each = function (f) {
        var inc = this.step, value;
        for (value = this.seed; ; value += inc) {
            if (f(value) === STOP) {
                return STOP;
            }
        }
    };

    proto_stream_iter.each = function (f) {
        var value = this.seed, next = this.step;
        while (true) {
            if (f(value) === STOP) {
                return STOP;
            }
            value = next(value);
        }
    };

    proto_stream.lines = function () {
        var that = Object.create(proto_stream_lines);
        that.source = this;
        return that;
    };

    // Make lines from stream of strings.
    proto_stream_lines.each = function (f) {
        var strings = [];
        this.source.each(function (string) {
            var old_index = 0;
            var new_index = 0;
            var line;
            while (true) {
                new_index = string.indexOf('\n', old_index);
                if (new_index === -1) {
                    strings.push(string.slice(old_index));
                    break;
                } else {
                    var s = string.slice(old_index, new_index);
                    if (strings.length === 0) {
                        line = s;
                    } else {
                        strings.push(s);
                        line = strings.join('');
                        strings.length = 0;
                    }
                    old_index = new_index + 1;
                    if (f(line) === STOP) {
                        return STOP;
                    }
                }
            }
        });
    };

/*
    // TREES
    zen.tree = function(value, nodes) {
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

    var set_interval, clear_interval;
    if (typeof window === 'undefined') {
        if (typeof setInterval === 'function') {
            set_interval = setInterval;
        }
        if (typeof clearInterval === 'function') {
            clear_interval = clearInterval;
        }
    } else {
        set_interval = window.setInterval;
        clear_interval = window.clearInterval;
    }

    proto_stream_tick.each = function (f) {
        var g = this.gen;
        var interval_id = set_interval(function() {
            if (f(g()) === STOP) {
                clear_interval(interval_id);
                return STOP;
            }
        }, this.msecs);
    };

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
    function from(seed, step) {
        var that = Object.create(
            typeof step === 'function' ? proto_stream_iter : proto_stream_seq
        );
        that.seed = seed || 0;
        that.step = step || 1;
        return that;
    }

    /**
     * Creates a stream from an array.
     */
    function fromArray(a) {
        var that = Object.create(proto_stream_array);
        that._array = a;
        return that;
    }

    /**
     * Creates a stream from a list.
     */
    function fromList(l) {
        return fromArray(l.toArray());
    }

    /**
     * Creates a stream which yields a value periodically.
     *
     * @example:
     *     // prints a random number every second
     *     zen.tick(1000, Math.random).each(console.log);
     */
    function tick(msecs, g) {
        var that = Object.create(proto_stream_tick);
        that.msecs = msecs;
        that.gen = g;
        return that;
    }

    /**
     * Makes a stream from a list.
     */
    function listToStream() {
        return fromList(this);
    }

    stream.fromArray = fromArray;
    stream.fromList = fromList;
    stream.from = from;
    zen.stream = stream;
    zen.tick = tick;
    proto_list.toStream = listToStream;

    // JSON
    var proto_tojson = Object.create(proto_stream);
    var proto_fromjson = Object.create(proto_stream);

    proto_tojson.each = function(f) {
        this.source.each(function(value) {
            return f(JSON.stringify(value));
        });
    };

    function lexeme(type, value) {
        return { type: type, value: value};
    }

    lexeme.again = lexeme("again", "");
    lexeme.empty = lexeme("empty", "");
    lexeme.end =   lexeme("end", "");

    var proto_json_lexer = {};

    function json_lexer(source) {
        var self = Object.create(proto_json_lexer);
        self.source = source;
        self.buf = "";
        self.start = 0;
        self.current = 0;
        self.string = '';
        return self;
    }

    proto_json_lexer.nextChar = function() {
        var c = EMPTY;

        if (this.current < this.buf.length) {
            c = this.buf[this.current];
            this.current += 1;
        } else if (this.ended) {
            c = END;
        }
        return c;
    };

    proto_json_lexer.skip = function(pred) {
        var c = this.nextChar();
        while (pred(c)) {
            c = this.nextChar();
        }
        if (this.current === this.buf.length) {
            this.start = this.current;
        } else {
            this.start = this.current - 1;
        }
        return c;
    };

    proto_json_lexer.acceptWhile = function(pred) {
        var c = this.nextChar();
        while (pred(c)) {
            c = this.nextChar();
        }
        return c;
    };

    proto_json_lexer.each = function(f) {
        var self = this;
        this.state = lex_init;

        function lex_init() {
            var out = lexeme.again;
            var c = this.skip(isWhiteSpace);
        
            if (c === END) {
                out = lexeme.end;
            } else if (c === EMPTY) {
                out = lexeme.empty;
            } else if (c === '"') {
                this.start = this.current;
                this.state = lex_str1;
            } else if (isDigit(c)) {
                this.state = lex_num1;
            } else if (c === '-') {
                this.state = lex_num2;
            } else if (c === '.') {
                this.state = lex_num3;
            } else if (c === '{' /*}*/) {
                out = lexeme('{', '{' /*}}*/);
            } else if (c === /*{*/ '}') {
                out = lexeme(/*{{*/ '}', '}');
            } else if (c === '[') {
                out = lexeme('[', '[');
            } else if (c === ']') {
                out = lexeme(']', ']');
            } else if (c === ':') {
                out = lexeme(':', ':');
            } else if (c === ',') {
                out = lexeme(',', ',');
            } else if (isIdStartChar(c)) {
                this.state = id1;
            } else {
                this.state = lex_error;
            }
        
            return out;
        }
        
        function lex_error() {
            return lexeme('error', 'unknown error');
        }
        
        function lex_num1() {
            var out = lexeme.again;
            var c = this.acceptWhile(isDigit);
            if (c === EMPTY) {
                out = lexeme.empty;
            } else if (c === '.') {
                this.state = lex_num4;
            } else if (c === 'e' || c === 'E') {
                this.state = lex_num5;
            } else {
                this.state = lex_init;
                this.current -= 1;
                out = lexeme('number', this.buf.slice(this.start, this.current));
            }
            
            return out;
        }
        
        function lex_num2() {
            var out = lexeme.again;
            var c = this.nextChar();
            if (c === EMPTY) {
                out = lexeme.empty;
            } else if (c === '.') {
                this.state = lex_num3;
            } else if (isDigit(c)) {
                this.state = lex_num1;
            } else {
                out = lexeme('error', 'Bad number');
            }
            return out;
        }
        
        function lex_num3() {
            var out = lexeme.again;
            var c = this.nextChar();
            if (c === EMPTY) {
                out = lexeme.empty;
            } else if (isDigit(c)) {
                this.state = lex_num4;
            } else {
                out = lexeme('error', 'Bad number');
            }
            return out;
        }
        
        function lex_num4() {
            var out = lexeme.again;
            var c = this.acceptWhile(isDigit);
            if (c === EMPTY) {
                out = lexeme.empty;
            } else if (c === 'e' || c === 'E') {
                this.state = lex_num5;
            } else {
                this.state = lex_init;
                this.current -= 1;
                out = lexeme('number', this.buf.slice(this.start, this.current));
            }
            return out;
        }
        
        function lex_num5() {
            var out = lexeme.again;
            var c = this.nextChar();
            if (c === EMPTY) {
                out = lexeme.empty;
            } else if (c === '+' || c === '-') {
                this.state = lex_num6;
            } else if (isDigit(c)) {
                this.state = lex_num7;
            } else {
                out = lexeme('error', 'Bad number');
            }
            return out;
        }
        
        function lex_num6() {
            var out = lexeme.again;
            var c = this.nextChar();
            if (c === EMPTY) {
                out = lexeme.empty;
            } else if (isDigit(c)) {
                this.state = lex_num7;
            } else {
                out = lexeme('error', 'Bad number');
            }
            return out;
        }
        
        function lex_num7() {
            var out = lexeme.again;
            var c = this.acceptWhile(isDigit);
            if (c === EMPTY) {
                out = lexeme.empty;
            } else {
                this.state = lex_init;
                this.current -= 1;
                out = lexeme('number', this.buf.slice(this.start, this.current));
            }
            return out;
        }
        
        function lex_str1() {
            var out = lexeme.again;
            var begin = this.current;
            var c = this.acceptWhile(isJsonStringChar);
            if (begin < this.current - 1) {
                this.string += this.buf.slice(begin, this.current - 1);
            }
            if (c === EMPTY) {
                out = lexme.empty;
            } else if (c === '"') {
                out = lexeme('string', this.string);
                this.string = '';
                this.state = lex_init;
            } else if (c === '\\') {
                this.state = lex_str2;
            }
            return out;
        }
        
        function lex_str2() {
            var out = lexeme.again;
            var c = this.nextChar();
            if (c === 'u') {
                this.state = lex_str3;
            } else if ("\"\\/bfnrt".indexOf(c) >= 0) {
                this.string += unescape(c);
                this.state = lex_str1;
            } else {
                out = lexeme('error', 'Bad escape character: ' + c + '.');
                this.state = lex_error;
            }
            return out;
        }
        
        function lex_str3() {
            var out = lexeme.again;
            if (this.current + 4 < this.buf.length) {
                var code = this.buf.slice(this.current, this.current+4)
                this.current += 4;
                if (isHexDigit(code[0]) &&
                    isHexDigit(code[1]) &&
                    isHexDigit(code[2]) &&
                    isHexDigit(code[3])) {
                    this.string += String.fromCharCode(parseInt(code, 16));
                    this.state = lex_str1;
                } else {
                    out = lexeme('error', 'Bad unicode escape: ' + code + '.');
                    this.state = lex_error;
                }
            } else if (this.ended) {
                out = lexeme('error', 'Bad unicode escape: ' + code + '.');
                state = lex_error;
            }
            return out;
        }

        function id1() {
            var out = lexeme.again;
            var c = this.acceptWhile(isIdChar);
            if (c === EMPTY) {
                out = lexeme.empty;
            } else {
                this.state = lex_init;
                this.current -= 1;
                out = lexeme('id', this.buf.slice(this.start, this.current));
            }
            return out;
        }

        self.source.each(function(string) {
            if (string === END) {
                self.ended = true;
            } else {
                if (self.start >= self.buf.length) {
                    self.buf = string;
                } else {
                    self.buf = self.buf.slice(self.start) + string;
                }
                self.current = Math.max(0, self.current - self.start);
                self.start = 0;
            }
    
            while (true) {
                var item = self.state.call(self);
                if (item.type === 'again') continue;
                if (item.type === 'empty') break;
                if (item.type === 'end') break;
                if (item.type === 'error') break;
                if (f(item) === STOP) {
                    return STOP;
                }
            }
        });
    };


    proto_fromjson.each = function (f) {
        var self = this;
        var stack = [];
        var state = S0;
        var symbols = json_lexer(self.source);
    
        symbols.each(function(sym) {
            var out = state(sym);
            if (typeof out !== 'undefined') {
                return f(out);
            }
        });
    
        function S0(sym) {
            var t = sym.type;
            var out;
            if (t === '{' /*}*/) {
                stack.push({});
                state = obj1;
            } else if (t === '[') {
                stack.push([]);
            } else if (t === ']') {
                if (stack.length === 0) {
                    state = error; // unexpected ] 
                } else {
                    var top = stack.pop();
                    if (top instanceof Array) {
                        return resolve(top);
                    } else {
                        state = error; // unexpected ]
                    }
                }
            } else if (t === 'string') {
                out = sym.value;
            } else if (t === 'number') {
                out = Number(sym.value);
            } else if (t === 'id') {
                if (sym.value === 'true') {
                    out = true;
                } else if (sym.value === 'false') {
                    out = false;
                } else if (sym.value === 'null') {
                    out = null;
                } else {
                    console.log("unknown symbol: '" + sym.value + "'");
                    state = error;
                }
            } else {
                state = error;
            }
    
            if (typeof out !== 'undefined') {
                return resolve(out);
            }
            return out;
        }
    
        function arr1(sym) {
            if (sym.type === ',') {
                state = S0;
            } else if (sym.type === ']') {
                return resolve(stack.pop());
            }
        }
    
        function obj1(sym) {
            if (sym.type === 'string') {
                stack.push(sym.value);
                state = obj2;
            } else if (sym.type === /*{*/ '}') {
                return resolve(stack.pop());
            } else {
                state = error;
            }
        }
    
        function obj2(sym) {
            if (sym.type === ':') {
                state = S0;
            } else {
                state = error;
            }
        }
    
        function obj3(sym) {
            if (sym.type === ',') {
                state = obj1;
            } else if (sym.type === /*{*/ '}') {
                return resolve(stack.pop());
            }
        }

        function error(sym) {
        }
    
        function resolve(value) {
            var result;
            if (stack.length === 0) {
                result = value;
                state = S0;
            } else {
                var top = stack[stack.length - 1];
                if (typeof top === 'string') {
                    stack.pop();
                    /* stuff the value into object on top of stack */
                    stack[stack.length - 1][top] = value;
                    state = obj3;
                } else if (top instanceof Array) {
                    /* stuff the value into array on top of stack */
                    top.push(value);
                    state = arr1;
                } else {
                    state = arr1;
                }
            }
            return result;
        }
    };

    function json(source) {
        return Object.create(proto_fromjson, {
            source: { value: source }
        });
    }


    // DOM FUNCTIONS

    var proto_dom = Object.create(proto_stream),
        proto_dom_node = Object.create(proto_dom),
        proto_dom_seq = Object.create(proto_dom),
        proto_dom_parent = Object.create(proto_dom),
        proto_dom_children = Object.create(proto_dom),
        proto_dom_id = Object.create(proto_dom),
        proto_dom_tag = Object.create(proto_dom),
        proto_dom_find = Object.create(proto_dom),
        proto_dom_html = Object.create(proto_dom),
        proto_dom_attr = Object.create(proto_dom),
        proto_dom_addclass = Object.create(proto_dom),
        proto_dom_removeclass = Object.create(proto_dom),
        proto_dom_toggleclass = Object.create(proto_dom),
        proto_dom_hide = Object.create(proto_dom),
        proto_dom_show = Object.create(proto_dom),
        ROOT = Object.create(proto_dom);

    function dom() {
        var that, arg;

        if (arguments.length === 0) {
            that = ROOT;
        } else if (arguments.length === 1) {
            arg = arguments[0];
            if (typeof arg === 'string') {
                that = Object.create(dom_find);
                that.source = ROOT;
                that.selector = arg;
            } else if (arg instanceof Node) {
                that = Object.create(dom_node);
                that.node = arg;
            } else if (arg instanceof NodeList) {
                that = Object.create(dom_seq);
                that.nodes = slice(arg);
            } else {
                throw "Bad argument to zen.dom().";
            }
        }
        return that;
    }

    dom.id = function (id) {
        var that = Object.create(dom_id);
        that.source = ROOT;
        that.id = id;
        return that;
    };

    proto_dom.id = function (id) {
        var that = Object.create(dom_id);
        that.source = this;
        that.id = id;
        return that;
    };

    proto_dom_id.each = function (f) {
        this.source.each(function (node) {
            if (f(node.getElementById(this.id)) === STOP) {
                return STOP;
            }
        });
    };

    dom.tag = function (name) {
        var that = Object.create(dom_tag);
        that.source = ROOT;
        that.name = name;
        return that;
    };

    proto_dom.tag = function (name) {
        var that = Object.create(dom_tag);
        that.source = this;
        that.name = name;
    };

    proto_dom_tag.each = function (f) {
        this.source.each(function (node) {
            var elems = node.getElementsByTagName(this.name);
            for (var i = 0; i < elems.length; i++) {
                if (f(elems[i]) === STOP) {
                    return STOP;
                }
            }
        });
    };

    ROOT.each = function (f) {
        f(document);
    };

    ROOT.get = ROOT.head = function () {
        return document;
    };

    proto_dom.children = function () {
        var that = Object.create(proto_dom_children);
        that.source = this;
        return that;
    };

    proto_dom_children.each = function (f) {
        this.source.each(function (node) {
            var children = node.children;
            for (var i = 0; i < children.length; i++) {
                if (f(children[i]) === STOP) {
                    return STOP;
                }
            }
        });
    };

    proto_dom.parent = function () {
        var that = Object.create(proto_dom_parent);
        that.source = this;
        return that;
    };

    proto_dom_parent.each = function (f) {
        this.source.each(function (node) {
            if (node.parentNode) {
                if (f(node.parentNode) === STOP) {
                    return STOP;
                }
            }
        });
    };

    proto_dom.find = function (selector) {
        var that = Object.create(proto_dom_find);
        that.source = this;
        that.selector = selector;
        return that;
    };

    proto_dom_find.each = function (f) {
        this.source.each(function (node) {
            var nodes = node.querySelectorAll(this.selector);
            for (var i = 0; i < nodes.length; i++) {
                node = nodes[i];
                if (f(node) === STOP) {
                    return STOP;
                }
            }
        });
    };

    proto_dom.html = function (markup) {
        var that = Object.create(proto_dom_html);
        that.source = this;
        that.markup = markup;
        return that;
    };

    proto_dom_html.each = function (f) {
        var markup = this.markup;
        this.source.each(function (node) {
            if (f(node) === STOP) {
                return STOP;
            }
            node.innerHTML = markup;
        });
    };

    proto_dom.attr = function (name, value) {
        var that = Object.create(proto_dom_attr);
        that.source = this;
        that.name = name;
        that.value = value;
        return that;
    };

    proto_dom_attr.each = function (f) {
        var name = this.name, value = this.value;
        this.source.each(function (node) {
            if (f(node) === STOP) {
                return STOP;
            }
            node.setAttribute(name, value);
        });
    };

    proto_dom.addClass = function (name) {
        var that = Object.create(proto_dom_addclass);
        that.source = this;
        that.name = name;
        return that;
    };

    proto_dom_addclass.each = function (f) {
        var name = this.name, value = this.value;
        var re = new RegExp('\\b' + name + '\\b');
        this.source.each(function (node) {
            if (f(node) === STOP) {
                return STOP;
            }
            var old = node.getAttribute('class');
            if (!old) {
                node.setAttribute('class', name);
            } else if (old.search(re) === -1) {
                node.setAttribute('class', old + ' ' + name);
            }
        });
    };

    proto_dom.removeClass = function (name) {
        var that = Object.create(proto_dom_removeclass);
        that.source = this;
        that.name = name;
        return that;
    };

    proto_dom_removeclass.each = function (f) {
        var name = this.name, value = this.value;
        var re = new RegExp('\\s*\\b' + name + '\\b\\s*', 'g');
        this.source.each(function (node) {
            if (f(node) === STOP) {
                return STOP;
            }
            var old = node.getAttribute('class');
            if (!old && old.search(re) !== -1) {
                node.setAttribute('class', old.replace(re, ''));
            }
        });
    };

    proto_dom.hide = function () {
        var that = Object.create(proto_dom_hide);
        that.source = this;
        return that;
    };

    proto_dom_hide.each = function (f) {
        this.source.each(function (node) {
            if (f(node) === STOP) {
                return STOP;
            }
            node.style.display = 'none';
        });
    };

    proto_dom.show = function (code) {
        var that = Object.create(proto_dom_show);
        that.source = this;
        that.code = code;
        return that;
    };

    proto_dom_show.each = function (f) {
        var code = this.code || 'block';
        this.source.each(function (node) {
            if (f(node) === STOP) {
                return STOP;
            }
            node.style.display = code;
        });
    };

    zen.dom = dom;

    // HTTP

    var proto_http = Object.create(proto_stream);

    zen.http = function(url, opts) {
        var that = Object.create(proto_http);
        that.url = url;
        that.opts = opts || {};
        return that;
    };

    zen.http.makeQuery = function(obj) {
        var str = "";
        if (obj && typeof(obj) === "object") {
            for (var name in obj) {
                if (obj.hasOwnProperty(name)) {
                    var value = encodeURIComponent("" + obj[name]).replace(/%20/g, "+");
                    if (str.length > 0) str += "&";
                    str += name + "=" + value;
                }
            }
        }
        return str;
    };

    proto_http.each = function (f) {
        console.log("http.each");
        var req = new XMLHttpRequest();
        var url = this.url;
        var method = getOrElse(this.opts, "method", "GET").toUpperCase();
        var user = getOrElse(this.opts, "user", "");
        var password = getOrElse(this.opts, "password", "");
        var async = true;
        var headers = getOrElse(this.opts, "headers", []);
        var data = getOrElse(this.opts, "data", "");
        var last_index = 0;
        var stopped = false;

        req.onprogress = function () {
            console.log("req.onprogress");
            console.log("last_index: " + last_index);
            if (stopped !== STOP) {
                var index = req.responseText.length;
                if (last_index < index) {
                    var stopped = f(req.responseText.slice(last_index));
                    last_index = index;
                    if (stopped === STOP) {
                        req.abort();
                    }
                }
            }
        }

        req.onload = function () {
            if (stopped !== STOP) {
                var index = req.responseText.length;
                if (last_index < index) {
                    var stopped = f(req.responseText.slice(last_index));
                    last_index = index;
                    if (stopped === STOP) {
                        req.abort();
                    }
                }
            }
        }

        req.open(method, url, async, user, password);
        for (var i in headers) {
            var header = headers[i];
            req.setRequestHeader(header[0], header[1]);
        }
        req.send(data);
    };

    // WEBSOCKET

    var proto_ws = Object.create(proto_stream);

    zen.ws = function(url, opts) {
        var that = Object.create(proto_ws);
        that.url = url;
        that.opts = opts || {};
        return that;
    };

    proto_ws.each = function(f) {
        var protocols = this.opts["protocols"];
        var ws = new WebSocket(this.url, protocols); 
        this.socket = ws;

        ws.onmessage = function (event) {
            if (f(event.data) === STOP) {
                ws.close();
            }
        };
    };

    /**
     * Send data to the server.
     *
     * @example:
     * socket.send("hello");
     * 
     */
    proto_ws.send = function(data) {
        this.socket.send(data);
    };

    /**
     * Send data to the server as JSON.
     *
     * @example:
     * socket.sendJson({ id: 123, msg: "hello" });
     * 
     */
    proto_ws.sendJson = function(data) {
        this.socket.send(JSON.stringify(data));
    };

    /**
     * Send data from a stream to the server.
     *
     * @example:
     * socket.sendStream(zen.from(0).toJson());
     * 
     */
    proto_ws.sendStream = function(s) {
        var socket = this.socket;
        s.each(function(x) {
            socket.send(data);
        });
    };

    /**
     * Close the web socket.
     *
     * @example:
     * socket.close();
     * 
     */
    proto_ws.close = function() {
        this.socket.close();
    };

    // EXPORT

    if (typeof exports === 'undefined') {
        this.zen = zen;
    } else {
        zen.extend(exports, zen);
    }

}).call(this);
