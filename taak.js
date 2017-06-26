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


// LAMBDA FUNCTIONS ////
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

    taak.fn = fn;
    taak.fn.parse = parse;

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

    proto_list.take = function (n) {
        return wrap(this._array.slice(0, n));
    };

    proto_list.fold = function (init, f) {
        return this._array.reduce(f, init);
    };

    proto_list.all = function (p) {
        return this._array.every(p);
    };

    proto_list.any = function (p) {
        return this._array.some(p);
    };

    proto_list.head = function () {
        return this._array[0];
    };

    proto_list.get = function (n) {
        return this._array[n];
    };

    proto_list.reverse = function () {
        return wrap(this._array.reverse());
    };

    proto_list.toArray = function () {
        return this._array.slice();
    };

    proto_list.each = function (f) {
        this._array.forEach(f);
    };

    proto_list.toString = function () {
        return "list(" + this._array.join(", ") + ")";
    };

    // export list
    taak.list = list;

////// STREAM /////////////////////////////////////////////////////////////////
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
            } else if (taak.isLikeArray(arg)) {
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
     *     taak.tick(1000, Math.random).each(console.log);
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
    taak.stream = stream;
    taak.tick = tick;
    proto_list.toStream = listToStream;


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
