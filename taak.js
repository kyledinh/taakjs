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

	taak.list = list;

	// STREAM ////
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

	proto_stream.append = function (item) {
		var that = Object.create(proto_stream_append);
		that.source = this;
		var n = Object.keys(that.source._array).length;
		that.source._array[n] = item;
		that.item = item;
		logger("==== that ", that);
		return that;
	};

	proto_stream.prefix = function (item) {
		var that = Object.create(proto_stream_prefix);
		that.source = this;
		that.item = item;
		return that;
	};

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

	proto_stream.fromJson = function () {
		return Object.create(proto_fromjson, {
			source: { value: this }
		});
	}

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

	/* TODO: review */
	proto_stream_append.each = function (f) {
		var items = this.source._array;
		Object.keys(items).forEach(function(key) {
			logger(key, items[key]);
			return f(items[key]);
		});
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

	function from(seed, step) {
		var that = Object.create(
			typeof step === 'function' ? proto_stream_iter : proto_stream_seq
		);
		that.seed = seed || 0;
		that.step = step || 1;
		return that;
	}

	function fromArray(a) {
		var that = Object.create(proto_stream_array);
		that._array = a;
		return that;
	}

	function fromList(l) {
		return fromArray(l.toArray());
	}

	function tick(msecs, g) {
		var that = Object.create(proto_stream_tick);
		that.msecs = msecs;
		that.gen = g;
		return that;
	}

	function listToStream() {
		return fromList(this);
	}

	stream.fromArray = fromArray;
	stream.fromList = fromList;
	stream.from = from;
	taak.stream = stream;
	taak.tick = tick;
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

	// DOM FUNCTIONS ////

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
				that = Object.create(proto_dom_find);
				that.source = ROOT;
				that.selector = arg;
			} else if (arg instanceof Node) {
				that = Object.create(proto_dom_node);
				that.node = arg;
			} else if (arg instanceof NodeList) {
				that = Object.create(proto_dom_seq);
				that.nodes = slice(arg);
			} else {
				throw "Bad argument to taak.dom().";
			}
		}
		return that;
	}

	dom.id = function (id) {
		var that = Object.create(proto_dom_id);
		that.source = ROOT;
		that.id = id;
		return that;
	};

	proto_dom.id = function (id) {
		var that = Object.create(proto_dom_id);
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
		var that = Object.create(proto_dom_tag);
		that.source = ROOT;
		that.name = name;
		return that;
	};

	proto_dom.tag = function (name) {
		var that = Object.create(proto_dom_tag);
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

	taak.dom = dom;

	// HTTP ////

	var proto_http = Object.create(proto_stream);

	taak.http = function(url, opts) {
		var that = Object.create(proto_http);
		that.url = url;
		that.opts = opts || {};
		return that;
	};

	taak.http.makeQuery = function(obj) {
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

	taak.ws = function(url, opts) {
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
	* socket.sendStream(taak.from(0).toJson());
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
