// TAAK.JS
(function () {
    "use strict";

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


////// DOM FUNCTIONS //////////////////////////////////////////////////////////

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
                throw "Bad argument to taak.dom().";
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

    taak.dom = dom;


////// HTTP ////////////////////////////////////////////////////////////////////

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

    // EXPORT

    if (typeof exports === 'undefined') {
        this.taak = taak;
    } else {
        taak.extend(exports, taak);
    }

}).call(this);
