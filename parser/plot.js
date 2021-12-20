(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))
},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expression = void 0;
const type_1 = require("../system/type");
const node_1 = require("./node");
class expression extends node_1.node {
    get_dominant_type(first_type, second_type) {
        return type_1.type_tbl[first_type][second_type];
    }
}
exports.expression = expression;

},{"../system/type":56,"./node":7}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instruction = void 0;
const node_1 = require("./node");
class instruction extends node_1.node {
}
exports.instruction = instruction;

},{"./node":7}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.literal = void 0;
const node_1 = require("./node");
class literal extends node_1.node {
    get_string_value(str) {
        let result = str;
        if (str.endsWith('"'))
            result = str.replace(/\"/g, "");
        if (str.endsWith("'"))
            result = str.replace(/\'/g, "");
        result = result.replace(/\\t/g, '  ');
        result = result.replace(/\\n/g, '\n');
        result = result.replace(/\\r/g, '\n');
        return result;
    }
}
exports.literal = literal;

},{"./node":7}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.node = void 0;
class node {
    constructor(line, column) {
        this.line = line;
        this.column = column;
    }
}
exports.node = node;

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arithmetic_binary = exports.arithmetic_binary_type = void 0;
const expression_1 = require("../abstract/expression");
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
var arithmetic_binary_type;
(function (arithmetic_binary_type) {
    arithmetic_binary_type[arithmetic_binary_type["PLUS"] = 0] = "PLUS";
    arithmetic_binary_type[arithmetic_binary_type["MINUS"] = 1] = "MINUS";
    arithmetic_binary_type[arithmetic_binary_type["TIMES"] = 2] = "TIMES";
    arithmetic_binary_type[arithmetic_binary_type["DIV"] = 3] = "DIV";
    arithmetic_binary_type[arithmetic_binary_type["POWER"] = 4] = "POWER";
    arithmetic_binary_type[arithmetic_binary_type["MOD"] = 5] = "MOD";
})(arithmetic_binary_type = exports.arithmetic_binary_type || (exports.arithmetic_binary_type = {}));
class arithmetic_binary extends expression_1.expression {
    constructor(left, right, type, line, column) {
        super(line, column);
        this.left = left;
        this.right = right;
        this.type = type;
    }
    translate(environment) {
        const left_data = this.left.translate(environment);
        let leftTemp = console_1._3dCode.actualTemp;
        const right_data = this.right.translate(environment);
        let rightTemp = console_1._3dCode.actualTemp;
        const dominant_type = this.get_dominant_type(left_data, right_data);
        switch (this.type) {
            case arithmetic_binary_type.PLUS:
                switch (dominant_type) {
                    case type_1.type.STRING:
                        if (left_data === type_1.type.INTEGER || left_data === type_1.type.FLOAT) {
                            console_1._3dCode.actualTemp++;
                            const savedEnvironment = console_1._3dCode.actualTemp;
                            console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP;//Save environment\n';
                            console_1._3dCode.output += 'SP = 14;//Set IntToString environment\n';
                            console_1._3dCode.actualTemp++;
                            console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = ' + 'SP + 1;//Set number position\n';
                            console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + leftTemp + ';//Save number\n';
                            console_1._3dCode.actualTemp++;
                            console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = HP;//Save start position of new string\n';
                            leftTemp = console_1._3dCode.actualTemp;
                            console_1._3dCode.output += 'intToString();//Call function\n';
                            console_1._3dCode.actualTemp++;
                            const resultTemp = console_1._3dCode.actualTemp;
                            console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 0;//Set return position\n';
                            console_1._3dCode.actualTemp++;
                            console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + resultTemp + '];//Get return value\n';
                            console_1._3dCode.output += 'SP = T' + savedEnvironment + ';//Recover environment\n';
                        }
                        else if (right_data === type_1.type.INTEGER || right_data === type_1.type.FLOAT) {
                            console_1._3dCode.actualTemp++;
                            const savedEnvironment = console_1._3dCode.actualTemp;
                            console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP;//Save environment\n';
                            console_1._3dCode.output += 'SP = 14;//Set IntToString environment\n';
                            console_1._3dCode.actualTemp++;
                            console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = ' + 'SP + 1;//Set number position\n';
                            console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + rightTemp + ';//Save number\n';
                            console_1._3dCode.actualTemp++;
                            console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = HP;//Save start position of new string\n';
                            rightTemp = console_1._3dCode.actualTemp;
                            console_1._3dCode.output += 'intToString();//Call function\n';
                            console_1._3dCode.actualTemp++;
                            const resultTemp = console_1._3dCode.actualTemp;
                            console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 0;//Set return position\n';
                            console_1._3dCode.actualTemp++;
                            console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + resultTemp + '];//Get return value\n';
                            console_1._3dCode.output += 'SP = T' + savedEnvironment + ';//Recover environment\n';
                        }
                        console_1._3dCode.actualTemp++;
                        const savedEnvironment = console_1._3dCode.actualTemp;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP;//Save environment\n';
                        console_1._3dCode.output += 'SP = 0;//Set IntToString environment\n';
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = ' + 'SP + 1;//Set string1 position\n';
                        console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + leftTemp + ';//Save string1\n';
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = ' + 'SP + 2;//Set string2 position\n';
                        console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + rightTemp + ';//Save string2\n';
                        console_1._3dCode.output += 'StringConcat();//Call function\n';
                        console_1._3dCode.actualTemp++;
                        const resultTemp = console_1._3dCode.actualTemp;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 0;//Set return position\n';
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + resultTemp + '];//Get return value\n';
                        console_1._3dCode.output += 'SP = T' + savedEnvironment + ';//Recover environment\n';
                        return type_1.type.STRING;
                    case type_1.type.INTEGER:
                    case type_1.type.FLOAT:
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = T' + leftTemp + ' + T' + rightTemp + ';\n';
                        return dominant_type;
                    default:
                }
                break;
            case arithmetic_binary_type.MINUS:
                switch (dominant_type) {
                    case type_1.type.INTEGER:
                    case type_1.type.FLOAT:
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = T' + leftTemp + ' - T' + rightTemp + ';\n';
                        return dominant_type;
                    default:
                }
                break;
            case arithmetic_binary_type.TIMES:
                switch (dominant_type) {
                    case type_1.type.INTEGER:
                    case type_1.type.FLOAT:
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = T' + leftTemp + ' * T' + rightTemp + ';\n';
                        return dominant_type;
                    default:
                }
                break;
            case arithmetic_binary_type.POWER:
                switch (dominant_type) {
                    case type_1.type.INTEGER:
                        console_1._3dCode.actualTemp++;
                        const savedEnvironment = console_1._3dCode.actualTemp;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP;//Save environment\n';
                        console_1._3dCode.output += 'SP = 11;//Set NumberPower environment\n';
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = ' + 'SP + 1;//Set base position\n';
                        console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + leftTemp + ';//Save base\n';
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = ' + 'SP + 2;//Set exponent position\n';
                        console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + rightTemp + ';//Save exponent\n';
                        console_1._3dCode.output += 'NumberPower();//Call function\n';
                        console_1._3dCode.actualTemp++;
                        const resultTemp = console_1._3dCode.actualTemp;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 0;//Set return position\n';
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + resultTemp + '];//Get return value\n';
                        console_1._3dCode.output += 'SP = T' + savedEnvironment + ';//Recover environment\n';
                        return type_1.type.INTEGER;
                    default:
                }
                break;
            case arithmetic_binary_type.MOD:
                switch (dominant_type) {
                    case type_1.type.INTEGER:
                    case type_1.type.FLOAT:
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = (int)T' + leftTemp + ' % (int)T' + rightTemp + ';\n';
                        return type_1.type.FLOAT;
                    default:
                }
                break;
            case arithmetic_binary_type.DIV:
                switch (dominant_type) {
                    case type_1.type.INTEGER:
                    case type_1.type.FLOAT:
                        console_1._3dCode.actualTag++;
                        const trueTag = console_1._3dCode.actualTag;
                        console_1._3dCode.actualTag++;
                        const falseTag = console_1._3dCode.actualTag;
                        console_1._3dCode.actualTag++;
                        const exitTag = console_1._3dCode.actualTag;
                        console_1._3dCode.output += 'if(T' + rightTemp + ' == 0) goto L' + trueTag + ';//Check if division by 0\n';
                        console_1._3dCode.output += 'goto L' + falseTag + ';\n';
                        console_1._3dCode.output += 'L' + trueTag + '://True tagn\n';
                        console_1._3dCode.output += 'DivisionBy0();//Call division by 0 error\n';
                        console_1._3dCode.output += 'goto L' + exitTag + ';\n';
                        console_1._3dCode.output += 'L' + falseTag + '://False tag, operate division\n';
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = T' + leftTemp + ' / T' + rightTemp + ';\n';
                        console_1._3dCode.output += 'goto L' + exitTag + ';\n';
                        console_1._3dCode.output += 'L' + exitTag + ':\n';
                        return type_1.type.FLOAT;
                    default:
                }
                break;
        }
        // Default
        return type_1.type.NULL;
    }
    execute(environment) {
        const left_data = this.left.execute(environment);
        const right_data = this.right.execute(environment);
        const dominant_type = this.get_dominant_type(left_data.type, right_data.type);
        switch (this.type) {
            case arithmetic_binary_type.PLUS:
                switch (dominant_type) {
                    case type_1.type.STRING:
                        return { value: (left_data.value.toString() + right_data.value.toString()), type: type_1.type.STRING };
                    case type_1.type.INTEGER:
                        left_data.value = (left_data.type == type_1.type.CHAR) ? left_data.value.charCodeAt(0) : left_data.value;
                        right_data.value = (right_data.type == type_1.type.CHAR) ? right_data.value.charCodeAt(0) : right_data.value;
                        return { value: (left_data.value + right_data.value), type: type_1.type.INTEGER };
                    case type_1.type.FLOAT:
                        left_data.value = (left_data.type == type_1.type.CHAR) ? left_data.value.charCodeAt(0) : left_data.value;
                        right_data.value = (right_data.type == type_1.type.CHAR) ? right_data.value.charCodeAt(0) : right_data.value;
                        return { value: (left_data.value + right_data.value), type: type_1.type.FLOAT };
                    default:
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar: ' + left_data.type + ' + ' + right_data.type));
                }
                break;
            case arithmetic_binary_type.MINUS:
                switch (dominant_type) {
                    case type_1.type.INTEGER:
                        return { value: (left_data.value - right_data.value), type: type_1.type.INTEGER };
                    case type_1.type.FLOAT:
                        return { value: (left_data.value - right_data.value), type: type_1.type.FLOAT };
                    default:
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar: ' + left_data.type + ' - ' + right_data.type));
                }
                break;
            case arithmetic_binary_type.TIMES:
                switch (dominant_type) {
                    case type_1.type.INTEGER:
                        return { value: (left_data.value * right_data.value), type: type_1.type.INTEGER };
                    case type_1.type.FLOAT:
                        return { value: (left_data.value * right_data.value), type: type_1.type.FLOAT };
                    default:
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar: ' + left_data.type + ' * ' + right_data.type));
                }
                break;
            case arithmetic_binary_type.POWER:
                switch (dominant_type) {
                    case type_1.type.INTEGER:
                        return { value: (Math.pow(left_data.value, right_data.value)), type: type_1.type.INTEGER };
                    default:
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar: ' + left_data.type + ' ** ' + right_data.type));
                }
                break;
            case arithmetic_binary_type.MOD:
                switch (dominant_type) {
                    case type_1.type.INTEGER:
                        return { value: (left_data.value % right_data.value), type: type_1.type.INTEGER };
                    case type_1.type.FLOAT:
                        return { value: (left_data.value % right_data.value), type: type_1.type.FLOAT };
                    default:
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar: ' + left_data.type + ' % ' + right_data.type));
                }
                break;
            case arithmetic_binary_type.DIV:
                switch (dominant_type) {
                    case type_1.type.INTEGER:
                        if (right_data.value == 0) {
                            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, "No se puede dividir entre 0"));
                            break;
                        }
                        else
                            return { value: (left_data.value / right_data.value), type: type_1.type.INTEGER };
                    case type_1.type.FLOAT:
                        if (right_data.value == 0) {
                            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, "No se puede dividir entre 0"));
                            break;
                        }
                        else
                            return { value: (left_data.value / right_data.value), type: type_1.type.FLOAT };
                    default:
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar: ' + left_data.type + ' / ' + right_data.type));
                }
                break;
        }
        // Default
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Aritmetica (" + arithmetic_binary_type[this.type] + ")\"];";
        const this_count = count;
        const child_list = [this.left, this.right];
        for (const instr of child_list) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports.arithmetic_binary = arithmetic_binary;

},{"../abstract/expression":4,"../system/console":53,"../system/error":55,"../system/type":56}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arithmetic_unary = exports.arithmetic_unary_type = void 0;
const expression_1 = require("../abstract/expression");
const console_1 = require("../system/console");
const error_1 = require("../system/error");
const type_1 = require("../system/type");
var arithmetic_unary_type;
(function (arithmetic_unary_type) {
    arithmetic_unary_type[arithmetic_unary_type["SQRT"] = 0] = "SQRT";
    arithmetic_unary_type[arithmetic_unary_type["SIN"] = 1] = "SIN";
    arithmetic_unary_type[arithmetic_unary_type["COS"] = 2] = "COS";
    arithmetic_unary_type[arithmetic_unary_type["TAN"] = 3] = "TAN";
    arithmetic_unary_type[arithmetic_unary_type["LOG10"] = 4] = "LOG10";
})(arithmetic_unary_type = exports.arithmetic_unary_type || (exports.arithmetic_unary_type = {}));
class arithmetic_unary extends expression_1.expression {
    constructor(expr, type, line, column) {
        super(line, column);
        this.expr = expr;
        this.type = type;
    }
    translate(environment) {
        const exprType = this.expr.translate(environment);
        const exprTemp = console_1._3dCode.actualTemp;
        switch (this.type) {
            case arithmetic_unary_type.SQRT:
                switch (exprType) {
                    case type_1.type.INTEGER:
                    case type_1.type.FLOAT:
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = sqrt(T' + exprTemp + ');//Get sqrt\n';
                        return type_1.type.FLOAT;
                    default:
                }
                break;
            case arithmetic_unary_type.COS:
                switch (exprType) {
                    case type_1.type.INTEGER:
                    case type_1.type.FLOAT:
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = cos(T' + exprTemp + ');//Get cos\n';
                        return type_1.type.FLOAT;
                    default:
                }
                break;
            case arithmetic_unary_type.SIN:
                switch (exprType) {
                    case type_1.type.INTEGER:
                    case type_1.type.FLOAT:
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = sin(T' + exprTemp + ');//Get sin\n';
                        return type_1.type.FLOAT;
                    default:
                }
                break;
            case arithmetic_unary_type.TAN:
                switch (exprType) {
                    case type_1.type.INTEGER:
                    case type_1.type.FLOAT:
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = tan(T' + exprTemp + ');//Get tan\n';
                        return type_1.type.FLOAT;
                    default:
                }
                break;
            case arithmetic_unary_type.LOG10:
                switch (exprType) {
                    case type_1.type.INTEGER:
                    case type_1.type.FLOAT:
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = log10(T' + exprTemp + ');//Get log10\n';
                        return type_1.type.FLOAT;
                    default:
                }
                break;
        }
        // Default
        return type_1.type.NULL;
    }
    execute(environment) {
        const expr_data = this.expr.execute(environment);
        switch (this.type) {
            case arithmetic_unary_type.SQRT:
                switch (expr_data.type) {
                    case type_1.type.INTEGER:
                    case type_1.type.FLOAT:
                        return { value: (Math.sqrt(expr_data.value)), type: type_1.type.FLOAT };
                    default:
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar sqrt para: ' + expr_data.value));
                }
                break;
            case arithmetic_unary_type.COS:
                switch (expr_data.type) {
                    case type_1.type.INTEGER:
                    case type_1.type.FLOAT:
                        return { value: (Math.cos(expr_data.value)), type: type_1.type.FLOAT };
                    default:
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar cos para: ' + expr_data.value));
                }
                break;
            case arithmetic_unary_type.SIN:
                switch (expr_data.type) {
                    case type_1.type.INTEGER:
                    case type_1.type.FLOAT:
                        return { value: (Math.sin(expr_data.value)), type: type_1.type.FLOAT };
                    default:
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar sin para: ' + expr_data.value));
                }
                break;
            case arithmetic_unary_type.TAN:
                switch (expr_data.type) {
                    case type_1.type.INTEGER:
                    case type_1.type.FLOAT:
                        return { value: (Math.tan(expr_data.value)), type: type_1.type.FLOAT };
                    default:
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar tan para: ' + expr_data.value));
                }
                break;
            case arithmetic_unary_type.LOG10:
                switch (expr_data.type) {
                    case type_1.type.INTEGER:
                    case type_1.type.FLOAT:
                        return { value: (Math.log10(expr_data.value)), type: type_1.type.FLOAT };
                    default:
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar log10 para: ' + expr_data.value));
                }
                break;
        }
        // Default
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Aritmetica (" + arithmetic_unary_type[this.type] + ")\"];";
        const this_count = count;
        const child_list = [this.expr];
        for (const instr of child_list) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports.arithmetic_unary = arithmetic_unary;

},{"../abstract/expression":4,"../system/console":53,"../system/error":55,"../system/type":56}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.array_range = void 0;
const expression_1 = require("../abstract/expression");
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const literal_1 = require("../abstract/literal");
class array_range extends expression_1.expression {
    constructor(left, right, line, column) {
        super(line, column);
        this.left = left;
        this.right = right;
    }
    translate(environment) {
        throw new Error("Method not implemented.");
    }
    execute(environment) {
        const left_data = (typeof this.left != 'string') ? this.left.execute(environment) : { type: type_1.type.STRING, value: this.left };
        const right_data = (typeof this.right != 'string') ? this.right.execute(environment) : { type: type_1.type.STRING, value: this.right };
        if (left_data.type != type_1.type.INTEGER && left_data.value != 'begin') {
            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Inicio de rango no valido: ' + left_data.value));
            return { value: null, type: type_1.type.NULL };
        }
        if (right_data.type != type_1.type.INTEGER && right_data.value != 'end') {
            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Fin de rango no valido: ' + right_data.value));
            return { value: null, type: type_1.type.NULL };
        }
        if (left_data.type == type_1.type.INTEGER && right_data.type == type_1.type.INTEGER && left_data.value >= right_data.value) {
            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Inicio del rango tiene que ser mayor que el final'));
            return { value: null, type: type_1.type.NULL };
        }
        // Default
        return { value: [left_data.value, right_data.value], type: type_1.type.INTEGER };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Rango de Array\"];";
        const this_count = count;
        const child_list = [this.left, this.right];
        for (const instr of child_list) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                if (instr instanceof expression_1.expression || instr instanceof literal_1.literal) {
                    result += instr.plot(Number(count + "1"));
                }
                else {
                    result += "node" + Number(count + "1") + "[label=\"(" + this.line + "," + this.column + ") " + instr + "\"];";
                }
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports.array_range = array_range;

},{"../abstract/expression":4,"../abstract/literal":6,"../system/error":55,"../system/type":56}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logic = exports.logic_type = void 0;
const expression_1 = require("../abstract/expression");
const console_1 = require("../system/console");
const type_1 = require("../system/type");
var logic_type;
(function (logic_type) {
    logic_type[logic_type["AND"] = 0] = "AND";
    logic_type[logic_type["OR"] = 1] = "OR";
    logic_type[logic_type["NOT"] = 2] = "NOT";
})(logic_type = exports.logic_type || (exports.logic_type = {}));
class logic extends expression_1.expression {
    constructor(left, right, type, line, column) {
        super(line, column);
        this.left = left;
        this.right = right;
        this.type = type;
    }
    translate(environment) {
        const leftType = this.left.translate(environment);
        const leftTemp = console_1._3dCode.actualTemp;
        const rightType = this.right.translate(environment);
        const rightTemp = console_1._3dCode.actualTemp;
        console_1._3dCode.actualTag++;
        const trueTag = console_1._3dCode.actualTag;
        console_1._3dCode.actualTag++;
        const falseTag = console_1._3dCode.actualTag;
        console_1._3dCode.actualTag++;
        const exitTag = console_1._3dCode.actualTag;
        switch (this.type) {
            case logic_type.AND:
                if (leftType === type_1.type.BOOLEAN && rightType == type_1.type.BOOLEAN) {
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'if(T' + leftTemp + ' == 0) goto L' + trueTag + ';//Expression is false\n';
                    console_1._3dCode.output += 'if(T' + rightTemp + ' == 0) goto L' + trueTag + ';//Expression is false\n';
                    console_1._3dCode.output += 'goto L' + falseTag + ';//Expression is true\n';
                    console_1._3dCode.output += 'L' + trueTag + ':\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = 0;//Set value to 0 (false)\n';
                    console_1._3dCode.output += 'goto L' + exitTag + ';\n';
                    console_1._3dCode.output += 'L' + falseTag + ':\n';
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = 1;//Set value to 1 (true)\n';
                    console_1._3dCode.output += 'goto L' + exitTag + ';\n';
                    console_1._3dCode.output += 'L' + exitTag + ':\n';
                }
                return type_1.type.BOOLEAN;
            case logic_type.OR:
                if (leftType === type_1.type.BOOLEAN && rightType == type_1.type.BOOLEAN) {
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'if(T' + leftTemp + ' == 1) goto L' + trueTag + ';//Expression is true\n';
                    console_1._3dCode.output += 'if(T' + rightTemp + ' == 1) goto L' + trueTag + ';//Expression is true\n';
                    console_1._3dCode.output += 'goto L' + falseTag + ';//Expression is true\n';
                    console_1._3dCode.output += 'L' + trueTag + ':\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = 1;//Set value to 1 (true)\n';
                    console_1._3dCode.output += 'goto L' + exitTag + ';\n';
                    console_1._3dCode.output += 'L' + falseTag + ':\n';
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = 0;//Set value to 0 (false)\n';
                    console_1._3dCode.output += 'goto L' + exitTag + ';\n';
                    console_1._3dCode.output += 'L' + exitTag + ':\n';
                }
                return type_1.type.BOOLEAN;
            default:
                return type_1.type.INTEGER;
        }
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Logica (" + logic_type[this.type] + ")\"];";
        const this_count = count;
        const child_list = [this.left, this.right];
        for (const instr of child_list) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
    execute(environment) {
        const left_data = this.left.execute(environment);
        const right_data = this.right.execute(environment);
        switch (this.type) {
            case logic_type.AND:
                return { value: (left_data.value && right_data.value), type: type_1.type.BOOLEAN };
            case logic_type.OR:
                return { value: (left_data.value || right_data.value), type: type_1.type.BOOLEAN };
            default:
                return { value: 0, type: type_1.type.INTEGER };
        }
    }
}
exports.logic = logic;

},{"../abstract/expression":4,"../system/console":53,"../system/type":56}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parameter = void 0;
const expression_1 = require("../abstract/expression");
const type_1 = require("../system/type");
class parameter extends expression_1.expression {
    constructor(native_type, id, line, column) {
        super(line, column);
        this.native_type = native_type;
        this.id = id;
    }
    translate(environment) {
        throw new Error("Method not implemented.");
    }
    execute(environment) {
        return { value: this.id, type: this.native_type };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Parametro (" + this.id + "," + type_1.type[this.native_type] + ")\"];";
        return result;
    }
}
exports.parameter = parameter;

},{"../abstract/expression":4,"../system/type":56}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relational = exports.relational_type = void 0;
const expression_1 = require("../abstract/expression");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
var relational_type;
(function (relational_type) {
    relational_type[relational_type["EQUAL"] = 0] = "EQUAL";
    relational_type[relational_type["NOTEQUAL"] = 1] = "NOTEQUAL";
    relational_type[relational_type["LESS"] = 2] = "LESS";
    relational_type[relational_type["LESSOREQUAL"] = 3] = "LESSOREQUAL";
    relational_type[relational_type["GREATER"] = 4] = "GREATER";
    relational_type[relational_type["GREATEROREQUAL"] = 5] = "GREATEROREQUAL";
})(relational_type = exports.relational_type || (exports.relational_type = {}));
class relational extends expression_1.expression {
    constructor(left, right, type, line, column) {
        super(line, column);
        this.left = left;
        this.right = right;
        this.type = type;
    }
    translate(environment) {
        const leftType = this.left.translate(environment);
        const leftTemp = console_1._3dCode.actualTemp;
        const rightType = this.right.translate(environment);
        const rightTemp = console_1._3dCode.actualTemp;
        switch (this.type) {
            case relational_type.EQUAL:
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = T' + leftTemp + ' == T' + rightTemp + ';\n';
                return type_1.type.BOOLEAN;
            case relational_type.NOTEQUAL:
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = T' + leftTemp + ' != T' + rightTemp + ';\n';
                return type_1.type.BOOLEAN;
            case relational_type.GREATER:
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = T' + leftTemp + ' > T' + rightTemp + ';\n';
                return type_1.type.BOOLEAN;
            case relational_type.GREATEROREQUAL:
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = T' + leftTemp + ' >= T' + rightTemp + ';\n';
                return type_1.type.BOOLEAN;
            case relational_type.LESS:
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = T' + leftTemp + ' < T' + rightTemp + ';\n';
                return type_1.type.BOOLEAN;
            case relational_type.LESSOREQUAL:
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = T' + leftTemp + ' <= T' + rightTemp + ';\n';
                return type_1.type.BOOLEAN;
            default:
                return type_1.type.INTEGER;
        }
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Relacional (" + relational_type[this.type] + ")\"];";
        const this_count = count;
        const child_list = [this.left, this.right];
        for (const instr of child_list) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
    execute(environment) {
        const left_data = this.left.execute(environment);
        const right_data = this.right.execute(environment);
        switch (this.type) {
            case relational_type.EQUAL:
                return { value: (left_data.value == right_data.value), type: type_1.type.BOOLEAN };
            case relational_type.NOTEQUAL:
                return { value: (left_data.value != right_data.value), type: type_1.type.BOOLEAN };
            case relational_type.GREATER:
                return { value: (left_data.value > right_data.value), type: type_1.type.BOOLEAN };
            case relational_type.GREATEROREQUAL:
                return { value: (left_data.value >= right_data.value), type: type_1.type.BOOLEAN };
            case relational_type.LESS:
                return { value: (left_data.value < right_data.value), type: type_1.type.BOOLEAN };
            case relational_type.LESSOREQUAL:
                return { value: (left_data.value <= right_data.value), type: type_1.type.BOOLEAN };
            default:
                return { value: 0, type: type_1.type.INTEGER };
        }
    }
}
exports.relational = relational;

},{"../abstract/expression":4,"../system/console":53,"../system/type":56}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.string_binary = exports.string_binary_type = void 0;
const expression_1 = require("../abstract/expression");
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
var string_binary_type;
(function (string_binary_type) {
    string_binary_type[string_binary_type["CONCAT"] = 0] = "CONCAT";
    string_binary_type[string_binary_type["REPEAT"] = 1] = "REPEAT";
    string_binary_type[string_binary_type["POSITION"] = 2] = "POSITION";
})(string_binary_type = exports.string_binary_type || (exports.string_binary_type = {}));
class string_binary extends expression_1.expression {
    constructor(left, right, type, line, column) {
        super(line, column);
        this.left = left;
        this.right = right;
        this.type = type;
    }
    translate(environment) {
        const leftType = this.left.translate(environment);
        const leftTemp = console_1._3dCode.actualTemp;
        const rightType = this.right.translate(environment);
        const rightTemp = console_1._3dCode.actualTemp;
        switch (this.type) {
            case string_binary_type.CONCAT:
                if (leftType == type_1.type.STRING && rightType == type_1.type.STRING) {
                    console_1._3dCode.actualTemp++;
                    const savedEnvironment = console_1._3dCode.actualTemp;
                    console_1._3dCode.output += 'T' + savedEnvironment + ' = SP;//Save environment\n';
                    console_1._3dCode.output += 'SP = 0;//Set StringConcat environment\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 1;//Set first String position\n';
                    console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + leftTemp + ';//Save string\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 2;//Set second String position\n';
                    console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + rightTemp + ';//Save position\n';
                    console_1._3dCode.output += 'StringConcat();//Call function\n';
                    console_1._3dCode.actualTemp++;
                    const resultTemp = console_1._3dCode.actualTemp;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 0;//Set return position\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + resultTemp + '];//Get return value\n';
                    console_1._3dCode.output += 'SP = T' + savedEnvironment + ';//Recover environment\n';
                    return type_1.type.STRING;
                }
                else {
                }
                break;
            case string_binary_type.REPEAT:
                if (leftType == type_1.type.STRING && rightType == type_1.type.INTEGER) {
                    console_1._3dCode.actualTemp++;
                    const savedEnvironment = console_1._3dCode.actualTemp;
                    console_1._3dCode.output += 'T' + savedEnvironment + ' = SP;//Save environment\n';
                    console_1._3dCode.output += 'SP = 8;//Set StringConcat environment\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 1;//Set first String position\n';
                    console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + leftTemp + ';//Save string\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 2;//Set second String position\n';
                    console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + rightTemp + ';//Save position\n';
                    console_1._3dCode.output += 'StringTimes();//Call function\n';
                    console_1._3dCode.actualTemp++;
                    const resultTemp = console_1._3dCode.actualTemp;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 0;//Set return position\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + resultTemp + '];//Get return value\n';
                    console_1._3dCode.output += 'SP = T' + savedEnvironment + ';//Recover environment\n';
                    return type_1.type.STRING;
                }
                else {
                }
                break;
            case string_binary_type.POSITION:
                if (leftType == type_1.type.STRING && rightType == type_1.type.INTEGER) {
                    console_1._3dCode.actualTemp++;
                    const savedEnvironment = console_1._3dCode.actualTemp;
                    console_1._3dCode.output += 'T' + savedEnvironment + ' = SP;//Save environment\n';
                    console_1._3dCode.output += 'SP = 20;//Set StringPosition environment\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 1;//Set String position\n';
                    console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + leftTemp + ';//Save string\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 2;//Set String position\n';
                    console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + rightTemp + ';//Save position\n';
                    console_1._3dCode.output += 'StringPosition();//Call function\n';
                    console_1._3dCode.actualTemp++;
                    const resultTemp = console_1._3dCode.actualTemp;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 0;//Set return position\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + resultTemp + '];//Get return value\n';
                    console_1._3dCode.output += 'SP = T' + savedEnvironment + ';//Recover environment\n';
                    return type_1.type.STRING;
                }
                else {
                }
                break;
        }
        // Default
        return type_1.type.NULL;
    }
    execute(environment) {
        const left_data = this.left.execute(environment);
        const right_data = this.right.execute(environment);
        switch (this.type) {
            case string_binary_type.CONCAT:
                if (left_data.type == type_1.type.STRING && right_data.type == type_1.type.STRING) {
                    return { value: (left_data.value.toString() + right_data.value.toString()), type: type_1.type.STRING };
                }
                else {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar: ' + left_data.value + ' & ' + right_data.value));
                }
                break;
            case string_binary_type.REPEAT:
                if (left_data.type == type_1.type.STRING && right_data.type == type_1.type.INTEGER) {
                    let return_value = "";
                    for (let index = 0; index < right_data.value; index++) {
                        return_value += left_data.value;
                    }
                    return { value: return_value, type: type_1.type.STRING };
                }
                else {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar: ' + left_data.value + ' ^ ' + right_data.value));
                }
                break;
            case string_binary_type.POSITION:
                if (left_data.type == type_1.type.STRING && right_data.type == type_1.type.INTEGER) {
                    let string_value = left_data.value.toString();
                    try {
                        return { value: string_value.charAt(right_data.value), type: type_1.type.STRING };
                    }
                    catch (err) {
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar: ' + left_data.value + ' caracterOfPosition ' + right_data.value));
                    }
                }
                else {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar: ' + left_data.value + ' caracterOfPosition ' + right_data.value));
                }
                break;
        }
        // Default
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") String binario (" + string_binary_type[this.type] + ")\"];";
        const this_count = count;
        const child_list = [this.left, this.right];
        for (const instr of child_list) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports.string_binary = string_binary;

},{"../abstract/expression":4,"../system/console":53,"../system/error":55,"../system/type":56}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.string_ternary = exports.string_ternary_type = void 0;
const expression_1 = require("../abstract/expression");
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
var string_ternary_type;
(function (string_ternary_type) {
    string_ternary_type[string_ternary_type["SUBSTRING"] = 0] = "SUBSTRING";
})(string_ternary_type = exports.string_ternary_type || (exports.string_ternary_type = {}));
class string_ternary extends expression_1.expression {
    constructor(first, second, third, type, line, column) {
        super(line, column);
        this.first = first;
        this.second = second;
        this.third = third;
        this.type = type;
    }
    translate(environment) {
        const firstType = this.first.translate(environment);
        const firstTemp = console_1._3dCode.actualTemp;
        const secondType = this.second.translate(environment);
        const secondTemp = console_1._3dCode.actualTemp;
        const thirdType = this.third.translate(environment);
        const thirdTemp = console_1._3dCode.actualTemp;
        switch (this.type) {
            case string_ternary_type.SUBSTRING:
                if (firstType == type_1.type.STRING && secondType == type_1.type.INTEGER && thirdType == type_1.type.INTEGER) {
                    console_1._3dCode.actualTemp++;
                    const savedEnvironment = console_1._3dCode.actualTemp;
                    console_1._3dCode.output += 'T' + savedEnvironment + ' = SP;//Save environment\n';
                    console_1._3dCode.output += 'SP = 23;//Set StringExtract environment\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 1;//Set string position\n';
                    console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + firstTemp + ';//Save string\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 2;//Set start position\n';
                    console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + secondTemp + ';//Save start position\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 3;//Set end position\n';
                    console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + thirdTemp + ';//Save end position\n';
                    console_1._3dCode.output += 'StringExtract();//Call function\n';
                    console_1._3dCode.actualTemp++;
                    const resultTemp = console_1._3dCode.actualTemp;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 0;//Set return position\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + resultTemp + '];//Get return value\n';
                    console_1._3dCode.output += 'SP = T' + savedEnvironment + ';//Recover environment\n';
                    return type_1.type.STRING;
                }
                else {
                }
                break;
        }
        // Default
        return type_1.type.NULL;
    }
    execute(environment) {
        const first_data = this.first.execute(environment);
        const second_data = this.second.execute(environment);
        const third_data = this.third.execute(environment);
        switch (this.type) {
            case string_ternary_type.SUBSTRING:
                if (first_data.type == type_1.type.STRING && second_data.type == type_1.type.INTEGER && third_data.type == type_1.type.INTEGER) {
                    let string_return = first_data.value.toString();
                    return { value: string_return.substr(second_data.value, third_data.value), type: type_1.type.STRING };
                }
                else {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar substring ' + first_data.value + ' & ' + second_data.value + ' & ' + third_data.value));
                }
                break;
        }
        // Default
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") String ternario (" + string_ternary_type[this.type] + ")\"];";
        const this_count = count;
        const child_list = [this.first, this.second, this.third];
        for (const instr of child_list) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports.string_ternary = string_ternary;

},{"../abstract/expression":4,"../system/console":53,"../system/error":55,"../system/type":56}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.string_unary = exports.string_unary_type = void 0;
const expression_1 = require("../abstract/expression");
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const _array_1 = require("../literal/_array");
var string_unary_type;
(function (string_unary_type) {
    string_unary_type[string_unary_type["LENGTH"] = 0] = "LENGTH";
    string_unary_type[string_unary_type["UPPERCASE"] = 1] = "UPPERCASE";
    string_unary_type[string_unary_type["LOWERCASE"] = 2] = "LOWERCASE";
})(string_unary_type = exports.string_unary_type || (exports.string_unary_type = {}));
class string_unary extends expression_1.expression {
    constructor(expr, type, line, column) {
        super(line, column);
        this.expr = expr;
        this.type = type;
    }
    translate(environment) {
        const exprType = this.expr.translate(environment);
        const leftTemp = console_1._3dCode.actualTemp;
        switch (this.type) {
            case string_unary_type.LENGTH:
                switch (exprType) {
                    case type_1.type.STRING:
                        console_1._3dCode.actualTemp++;
                        const savedEnvironment = console_1._3dCode.actualTemp;
                        console_1._3dCode.output += 'T' + savedEnvironment + ' = SP;//Save environment\n';
                        console_1._3dCode.output += 'SP = 18;//Set StringConcat environment\n';
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 1;//Set first String position\n';
                        console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + leftTemp + ';//Save string\n';
                        console_1._3dCode.output += 'StringLength();//Call function\n';
                        console_1._3dCode.actualTemp++;
                        const resultTemp = console_1._3dCode.actualTemp;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 0;//Set return position\n';
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + resultTemp + '];//Get return value\n';
                        console_1._3dCode.output += 'SP = T' + savedEnvironment + ';//Recover environment\n';
                        return type_1.type.INTEGER;
                    default:
                }
                break;
            case string_unary_type.UPPERCASE:
                switch (exprType) {
                    case type_1.type.STRING:
                        console_1._3dCode.actualTemp++;
                        const savedEnvironment = console_1._3dCode.actualTemp;
                        console_1._3dCode.output += 'T' + savedEnvironment + ' = SP;//Save environment\n';
                        console_1._3dCode.output += 'SP = 6;//Set StringConcat environment\n';
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 1;//Set first String position\n';
                        console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + leftTemp + ';//Save string\n';
                        console_1._3dCode.output += 'StringUpperCase();//Call function\n';
                        console_1._3dCode.actualTemp++;
                        const resultTemp = console_1._3dCode.actualTemp;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 0;//Set return position\n';
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + resultTemp + '];//Get return value\n';
                        console_1._3dCode.output += 'SP = T' + savedEnvironment + ';//Recover environment\n';
                        return type_1.type.STRING;
                    default:
                }
                break;
            case string_unary_type.LOWERCASE:
                switch (exprType) {
                    case type_1.type.STRING:
                        console_1._3dCode.actualTemp++;
                        const savedEnvironment = console_1._3dCode.actualTemp;
                        console_1._3dCode.output += 'T' + savedEnvironment + ' = SP;//Save environment\n';
                        console_1._3dCode.output += 'SP = 4;//Set StringConcat environment\n';
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 1;//Set first String position\n';
                        console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + leftTemp + ';//Save string\n';
                        console_1._3dCode.output += 'StringLowerCase();//Call function\n';
                        console_1._3dCode.actualTemp++;
                        const resultTemp = console_1._3dCode.actualTemp;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 0;//Set return position\n';
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + resultTemp + '];//Get return value\n';
                        console_1._3dCode.output += 'SP = T' + savedEnvironment + ';//Recover environment\n';
                        return type_1.type.STRING;
                    default:
                }
                break;
        }
        // Default
        return type_1.type.NULL;
    }
    execute(environment) {
        const expr_data = this.expr.execute(environment);
        switch (this.type) {
            case string_unary_type.LENGTH:
                switch (expr_data.type) {
                    case type_1.type.STRING:
                        let string_value = expr_data.value.toString();
                        //Posible error en el return, deberia de retornar INTEGER. Comprobar
                        return { value: string_value.length, type: type_1.type.STRING };
                    default:
                        if (expr_data.value instanceof _array_1._array) {
                            return { value: expr_data.value.body.length, type: type_1.type.INTEGER };
                        }
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar length para: ' + expr_data.value));
                }
                break;
            case string_unary_type.UPPERCASE:
                switch (expr_data.type) {
                    case type_1.type.STRING:
                        let string_value = expr_data.value.toString();
                        return { value: string_value.toUpperCase(), type: type_1.type.STRING };
                    default:
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar uppercase para: ' + expr_data.value));
                }
                break;
            case string_unary_type.LOWERCASE:
                switch (expr_data.type) {
                    case type_1.type.STRING:
                        let string_value = expr_data.value.toString();
                        return { value: string_value.toLowerCase(), type: type_1.type.STRING };
                    default:
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar lowercase para: ' + expr_data.value));
                }
                break;
        }
        // Default
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") String unario (" + string_unary_type[this.type] + ")\"];";
        const this_count = count;
        const child_list = [this.expr];
        for (const instr of child_list) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports.string_unary = string_unary;

},{"../abstract/expression":4,"../literal/_array":46,"../system/console":53,"../system/error":55,"../system/type":56}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ternary = void 0;
const expression_1 = require("../abstract/expression");
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
class ternary extends expression_1.expression {
    constructor(first, second, third, line, column) {
        super(line, column);
        this.first = first;
        this.second = second;
        this.third = third;
    }
    translate(environment) {
        const conditionType = this.first.translate(environment);
        const conditionTemp = console_1._3dCode.actualTemp;
        const trueType = this.second.translate(environment);
        const trueTemp = console_1._3dCode.actualTemp;
        const falseType = this.third.translate(environment);
        const falseTemp = console_1._3dCode.actualTemp;
        console_1._3dCode.actualTag++;
        const trueTag = console_1._3dCode.actualTag;
        console_1._3dCode.actualTag++;
        const falseTag = console_1._3dCode.actualTag;
        console_1._3dCode.actualTag++;
        const exitTag = console_1._3dCode.actualTag;
        if (conditionType == type_1.type.BOOLEAN) {
            console_1._3dCode.actualTemp++;
            console_1._3dCode.output += 'if(T' + conditionTemp + ' == 1) goto L' + trueTag + ';//Return true value\n';
            console_1._3dCode.output += 'goto L' + falseTag + ';//Return false value\n';
            console_1._3dCode.output += 'L' + trueTag + ':\n';
            console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = T' + trueTemp + ';//Set true value\n';
            console_1._3dCode.output += 'goto L' + exitTag + ';\n';
            console_1._3dCode.output += 'L' + falseTag + ':\n';
            console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = T' + falseTemp + ';//Set true value\n';
            console_1._3dCode.output += 'goto L' + exitTag + ';\n';
            console_1._3dCode.output += 'L' + exitTag + ':\n';
            return trueType;
        }
        else {
        }
        // Default
        return type_1.type.NULL;
    }
    execute(environment) {
        const first_data = this.first.execute(environment);
        const second_data = this.second.execute(environment);
        const third_data = this.third.execute(environment);
        if (first_data.type == type_1.type.BOOLEAN) {
            return { value: (first_data.value) ? second_data.value : third_data.value, type: (first_data.value) ? second_data.type : third_data.type };
        }
        else {
            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar opreacion ternaria: ' + first_data.value + ' & ' + second_data.value + ' & ' + third_data.value));
        }
        // Default
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Ternaria\"];";
        const this_count = count;
        const child_list = [this.first, this.second, this.third];
        for (const instr of child_list) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports.ternary = ternary;

},{"../abstract/expression":4,"../system/console":53,"../system/error":55,"../system/type":56}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unary = exports.unary_type = void 0;
const expression_1 = require("../abstract/expression");
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
var unary_type;
(function (unary_type) {
    unary_type[unary_type["ARITHMETIC"] = 0] = "ARITHMETIC";
    unary_type[unary_type["LOGIC"] = 1] = "LOGIC";
})(unary_type = exports.unary_type || (exports.unary_type = {}));
class unary extends expression_1.expression {
    constructor(expr, type, line, column) {
        super(line, column);
        this.expr = expr;
        this.type = type;
    }
    translate(environment) {
        const exprType = this.expr.translate(environment);
        const exprTemp = console_1._3dCode.actualTemp;
        switch (this.type) {
            case unary_type.ARITHMETIC:
                switch (exprType) {
                    case type_1.type.INTEGER:
                    case type_1.type.FLOAT:
                        console_1._3dCode.output += 'T' + exprTemp + ' = T' + exprTemp + ' * -1;\n';
                        return exprType;
                    default:
                }
                break;
            case unary_type.LOGIC:
                console_1._3dCode.actualTag++;
                const trueTag = console_1._3dCode.actualTag;
                console_1._3dCode.actualTag++;
                const falseTag = console_1._3dCode.actualTag;
                console_1._3dCode.actualTag++;
                const exitTag = console_1._3dCode.actualTag;
                switch (exprType) {
                    case type_1.type.BOOLEAN:
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'if(T' + exprTemp + ' == 0) goto L' + trueTag + ';//Expression is false\n';
                        console_1._3dCode.output += 'goto L' + falseTag + ';//Expression is true\n';
                        console_1._3dCode.output += 'L' + trueTag + ':\n';
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = 1;//Set value to 1 (true)\n';
                        console_1._3dCode.output += 'goto L' + exitTag + ';\n';
                        console_1._3dCode.output += 'L' + falseTag + ':\n';
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = 0;//Set value to 0 (false)\n';
                        console_1._3dCode.output += 'goto L' + exitTag + ';\n';
                        console_1._3dCode.output += 'L' + exitTag + ':\n';
                        return type_1.type.BOOLEAN;
                    default:
                }
                break;
        }
        // Default
        return type_1.type.NULL;
    }
    execute(environment) {
        const expr_data = this.expr.execute(environment);
        switch (this.type) {
            case unary_type.ARITHMETIC:
                switch (expr_data.type) {
                    case type_1.type.INTEGER:
                    case type_1.type.FLOAT:
                        return { value: (Number(expr_data.value) * -1), type: expr_data.type };
                    default:
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar - para: ' + expr_data.value));
                }
                break;
            case unary_type.LOGIC:
                switch (expr_data.type) {
                    case type_1.type.BOOLEAN:
                        return { value: !expr_data.value, type: type_1.type.BOOLEAN };
                    default:
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar ! para: ' + expr_data.value));
                }
                break;
        }
        // Default
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Unaria\"];";
        const this_count = count;
        const child_list = [this.expr];
        for (const instr of child_list) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports.unary = unary;

},{"../abstract/expression":4,"../system/console":53,"../system/error":55,"../system/type":56}],19:[function(require,module,exports){
(function (process){(function (){
/* parser generated by jison 0.4.18 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var main_grammar = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,9],$V1=[1,10],$V2=[1,12],$V3=[1,13],$V4=[1,14],$V5=[1,15],$V6=[1,16],$V7=[1,17],$V8=[2,5,8,27,28,29,30,31,32],$V9=[1,22],$Va=[2,26],$Vb=[1,28],$Vc=[21,49,52],$Vd=[1,31],$Ve=[17,23],$Vf=[2,19],$Vg=[1,35],$Vh=[1,34],$Vi=[1,42],$Vj=[1,60],$Vk=[1,54],$Vl=[1,62],$Vm=[1,63],$Vn=[1,64],$Vo=[1,65],$Vp=[1,61],$Vq=[1,45],$Vr=[1,46],$Vs=[1,47],$Vt=[1,48],$Vu=[1,49],$Vv=[1,50],$Vw=[1,58],$Vx=[1,66],$Vy=[1,67],$Vz=[1,68],$VA=[1,69],$VB=[1,70],$VC=[1,71],$VD=[1,76],$VE=[1,93],$VF=[1,80],$VG=[1,81],$VH=[1,82],$VI=[1,83],$VJ=[1,84],$VK=[1,85],$VL=[1,86],$VM=[1,87],$VN=[1,88],$VO=[1,89],$VP=[1,90],$VQ=[1,91],$VR=[1,92],$VS=[1,94],$VT=[1,95],$VU=[1,96],$VV=[11,17,23,49,53,77,82,83,84,85,86,93,94,95,96,97,98,99,100,104,105,108],$VW=[2,122],$VX=[2,123],$VY=[2,126],$VZ=[1,105],$V_=[1,106],$V$=[1,103],$V01=[2,129],$V11=[1,107],$V21=[1,134],$V31=[1,121],$V41=[1,128],$V51=[1,129],$V61=[1,130],$V71=[1,141],$V81=[1,142],$V91=[1,139],$Va1=[1,137],$Vb1=[1,138],$Vc1=[1,136],$Vd1=[1,135],$Ve1=[11,14,23],$Vf1=[1,149],$Vg1=[2,128],$Vh1=[1,180],$Vi1=[1,186],$Vj1=[2,8,10,14,21,27,28,29,30,31,32,43,44,45,59,60,63,64,65,66,69,71,72,73,76,78,79,83,87,88,89,90,91,92,113,115,116,117,118,119,120],$Vk1=[49,82,83,84,85,86,93,94,95,96,97,98,99,100,104,105,108],$Vl1=[1,197],$Vm1=[1,195],$Vn1=[1,196],$Vo1=[11,17,23,49,53,77,82,83,93,94,95,96,97,98,99,100,104,105,108],$Vp1=[11,17,23,49,53,77,93,94,95,96,97,98,99,100,104,105,108],$Vq1=[11,17,23,49,53,77,95,96,99,100,104,105,108],$Vr1=[11,17,23,49,53,77,104,105],$Vs1=[1,243],$Vt1=[11,23,53],$Vu1=[11,17],$Vv1=[1,252],$Vw1=[23,53],$Vx1=[11,17,23,25,49,52,53,77,82,83,84,85,86,93,94,95,96,97,98,99,100,104,105,108],$Vy1=[17,23,53],$Vz1=[1,314],$VA1=[1,315],$VB1=[14,76,78],$VC1=[1,331];
var parser = {trace: function trace () { },
yy: {},
symbols_: {"error":2,"pr_init":3,"pr_globals":4,"EOF":5,"pr_global":6,"pr_main":7,"tk_void":8,"tk_main":9,"tk_par_o":10,"tk_par_c":11,"tk_cbra_o":12,"pr_instructions":13,"tk_cbra_c":14,"pr_declaration_function":15,"pr_declaration_list":16,"tk_semicolon":17,"pr_declaration_struct":18,"pr_declaration_array":19,"pr_type":20,"tk_id":21,"pr_params":22,"tk_comma":23,"pr_declaration_item":24,"tk_equal":25,"pr_expr":26,"tk_struct":27,"tk_integer_type":28,"tk_double_type":29,"tk_string_type":30,"tk_boolean_type":31,"tk_char_type":32,"pr_instruction":33,"pr_if":34,"pr_switch":35,"pr_while":36,"pr_do":37,"pr_for":38,"pr_expression_list":39,"pr_unary_instruction":40,"pr_assignation":41,"pr_call":42,"tk_break":43,"tk_continue":44,"tk_return":45,"pr_print":46,"pr_native_function":47,"pr_array_native_function":48,"tk_dot":49,"tk_push":50,"tk_pop":51,"tk_bra_o":52,"tk_bra_c":53,"pr_array":54,"tk_hash":55,"pr_array_list":56,"tk_double_plus":57,"tk_double_minus":58,"tk_print":59,"tk_println":60,"tk_parse":61,"pr_native_function_option":62,"tk_to_int":63,"tk_to_double":64,"tk_string_func":65,"tk_typeof":66,"pr_index_list":67,"pr_access":68,"tk_for":69,"tk_in":70,"tk_while":71,"tk_do":72,"tk_switch":73,"pr_cases":74,"pr_case":75,"tk_case":76,"tk_colon":77,"tk_default":78,"tk_if":79,"pr_else":80,"tk_else":81,"tk_plus":82,"tk_minus":83,"tk_times":84,"tk_division":85,"tk_mod":86,"tk_power":87,"tk_sqrt":88,"tk_sin":89,"tk_cos":90,"tk_tan":91,"tk_log10":92,"tk_less_equal":93,"tk_greater_equal":94,"tk_double_equal":95,"tk_not_equal":96,"tk_greater":97,"tk_less":98,"tk_and":99,"tk_or":100,"tk_length":101,"tk_uppercase":102,"tk_lowercase":103,"tk_concat":104,"tk_repeat":105,"tk_position":106,"tk_substring":107,"tk_ternary":108,"pr_unary":109,"pr_array_range":110,"tk_begin":111,"tk_end":112,"tk_not":113,"pr_native":114,"tk_float":115,"tk_string":116,"tk_null":117,"tk_char":118,"tk_int":119,"tk_bool":120,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",8:"tk_void",9:"tk_main",10:"tk_par_o",11:"tk_par_c",12:"tk_cbra_o",14:"tk_cbra_c",17:"tk_semicolon",21:"tk_id",23:"tk_comma",25:"tk_equal",27:"tk_struct",28:"tk_integer_type",29:"tk_double_type",30:"tk_string_type",31:"tk_boolean_type",32:"tk_char_type",43:"tk_break",44:"tk_continue",45:"tk_return",49:"tk_dot",50:"tk_push",51:"tk_pop",52:"tk_bra_o",53:"tk_bra_c",55:"tk_hash",57:"tk_double_plus",58:"tk_double_minus",59:"tk_print",60:"tk_println",61:"tk_parse",63:"tk_to_int",64:"tk_to_double",65:"tk_string_func",66:"tk_typeof",69:"tk_for",70:"tk_in",71:"tk_while",72:"tk_do",73:"tk_switch",76:"tk_case",77:"tk_colon",78:"tk_default",79:"tk_if",81:"tk_else",82:"tk_plus",83:"tk_minus",84:"tk_times",85:"tk_division",86:"tk_mod",87:"tk_power",88:"tk_sqrt",89:"tk_sin",90:"tk_cos",91:"tk_tan",92:"tk_log10",93:"tk_less_equal",94:"tk_greater_equal",95:"tk_double_equal",96:"tk_not_equal",97:"tk_greater",98:"tk_less",99:"tk_and",100:"tk_or",101:"tk_length",102:"tk_uppercase",103:"tk_lowercase",104:"tk_concat",105:"tk_repeat",106:"tk_position",107:"tk_substring",108:"tk_ternary",111:"tk_begin",112:"tk_end",113:"tk_not",115:"tk_float",116:"tk_string",117:"tk_null",118:"tk_char",119:"tk_int",120:"tk_bool"},
productions_: [0,[3,2],[4,2],[4,2],[4,1],[4,1],[7,7],[6,1],[6,2],[6,2],[6,2],[6,1],[15,8],[15,7],[22,4],[22,2],[16,3],[16,2],[24,3],[24,1],[18,5],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[13,2],[13,1],[33,1],[33,1],[33,1],[33,1],[33,1],[33,8],[33,2],[33,2],[33,2],[33,2],[33,2],[33,2],[33,2],[33,2],[33,3],[33,2],[33,2],[33,2],[33,2],[33,1],[48,6],[48,5],[19,4],[19,4],[19,6],[19,6],[19,7],[19,7],[56,3],[56,1],[54,3],[54,3],[40,2],[40,2],[46,4],[46,4],[47,6],[47,4],[62,1],[62,1],[62,1],[62,1],[41,3],[41,4],[68,3],[68,4],[68,1],[68,3],[42,4],[42,3],[39,3],[39,1],[38,11],[38,11],[38,9],[36,7],[37,9],[35,7],[74,2],[74,1],[75,4],[75,3],[34,8],[34,7],[80,4],[80,2],[26,3],[26,3],[26,3],[26,3],[26,3],[26,6],[26,4],[26,4],[26,4],[26,4],[26,4],[26,3],[26,3],[26,3],[26,3],[26,3],[26,3],[26,3],[26,3],[26,5],[26,5],[26,5],[26,3],[26,3],[26,6],[26,8],[26,5],[26,1],[26,1],[26,1],[26,3],[26,1],[26,2],[26,2],[26,1],[67,4],[67,3],[110,1],[110,3],[110,3],[110,3],[109,2],[109,1],[109,3],[109,2],[114,1],[114,1],[114,1],[114,1],[114,1],[114,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:

        return $$[$0-1]
    
break;
case 2: case 3: case 27: case 87:

        $$[$0-1].push($$[$0])
        this.$ = $$[$0-1]
    
break;
case 4: case 5: case 28: case 58: case 80: case 88:

        this.$ = [$$[$0]]
    
break;
case 6:

        this.$ = new main($$[$0-1], _$[$0-6].first_line,_$[$0-6].first_column);
    
break;
case 7: case 29: case 30: case 31: case 32: case 33:
this.$ = $$[$0]
break;
case 8: case 9: case 10: case 35: case 36: case 37: case 38: case 39: case 40: case 45: case 46: case 47:
this.$ = $$[$0-1]
break;
case 11: case 48:

        error_arr.push(new error(_$[$0].first_line, _$[$0].first_column, error_type.SINTACTICO, yytext));  
    
break;
case 12:

        this.$ = new declaration_function($$[$0-7], $$[$0-6], $$[$0-4], $$[$0-1], _$[$0-7].first_line,_$[$0-7].first_column);
    
break;
case 13:

        this.$ = new declaration_function($$[$0-6], $$[$0-5], [], $$[$0-1], _$[$0-6].first_line,_$[$0-6].first_column);
    
break;
case 14:

        $$[$0-3].push(new parameter($$[$0-1], $$[$0], _$[$0-3].first_line,_$[$0-3].first_column))
        this.$ = $$[$0-3]
    
break;
case 15:

        this.$ = [new parameter($$[$0-1], $$[$0], _$[$0-1].first_line,_$[$0-1].first_column)]
    
break;
case 16:

        $$[$0-2].add_to_list($$[$0])
        this.$ = $$[$0-2]
    
break;
case 17:

        this.$ = new declaration_list($$[$0-1], [$$[$0]], _$[$0-1].first_line,_$[$0-1].first_column)
    
break;
case 18:

        this.$ = new declaration_item($$[$0-2], $$[$0], _$[$0-2].first_line,_$[$0-2].first_column);
    
break;
case 19:

        this.$ = new declaration_item($$[$0], null, _$[$0].first_line,_$[$0].first_column);
    
break;
case 20:

        this.$ = new declaration_struct($$[$0-3], $$[$0-1], _$[$0-4].first_line,_$[$0-4].first_column);
    
break;
case 21:
this.$ = type.INTEGER
break;
case 22:
this.$ = type.FLOAT
break;
case 23:
this.$ = type.STRING
break;
case 24:
this.$ = type.BOOLEAN
break;
case 25:
this.$ = type.CHAR
break;
case 26:
this.$ = type.VOID
break;
case 34:

        this.$ = new declaration_struct_item([$$[$0-7],$$[$0-4]], $$[$0-6], $$[$0-2], _$[$0-7].first_line,_$[$0-7].first_column);
    
break;
case 41:
 
        this.$ = new _break($$[$0], _$[$0-1].first_line,_$[$0-1].first_column);
    
break;
case 42:
 
        this.$ = new _continue($$[$0], _$[$0-1].first_line,_$[$0-1].first_column);
    
break;
case 43:
 
        this.$ = new _return($$[$0-1], _$[$0-2].first_line,_$[$0-2].first_column);
    
break;
case 44:

        this.$ = new _return(null, _$[$0-1].first_line, _$[$0-1].first_column);
    
break;
case 49:

        this.$ = new array_native_function($$[$0-5], $$[$0-3], $$[$0-1], _$[$0-5].first_line,_$[$0-5].first_column);
    
break;
case 50:

        this.$ = new array_native_function($$[$0-4], $$[$0-2], null, _$[$0-4].first_line,_$[$0-4].first_column);
    
break;
case 51:

        this.$ = new declaration_array($$[$0-3], $$[$0-2], null, _$[$0-3].first_line,_$[$0-3].first_column);
    
break;
case 52:

        this.$ = new declaration_array($$[$0-3], $$[$0], null, _$[$0-3].first_line,_$[$0-3].first_column);
    
break;
case 53:

        this.$ = new declaration_array($$[$0-5], $$[$0-4], $$[$0], _$[$0-5].first_line,_$[$0-5].first_column);
    
break;
case 54:

        this.$ = new declaration_array($$[$0-5], $$[$0-2], $$[$0], _$[$0-5].first_line,_$[$0-5].first_column);
    
break;
case 55:

        this.$ = new declaration_array($$[$0-6], $$[$0-5], $$[$0], _$[$0-6].first_line,_$[$0-6].first_column);
    
break;
case 56:

        this.$ = new declaration_array($$[$0-6], $$[$0-3], $$[$0], _$[$0-6].first_line,_$[$0-6].first_column);
    
break;
case 57: case 79:

        $$[$0-2].push($$[$0])
        this.$ = $$[$0-2]
    
break;
case 59: case 60:

        this.$ = new _array($$[$0-1], _$[$0-2].first_line,_$[$0-2].first_column);
    
break;
case 61:
 
        this.$ = new unary_instruction($$[$0-1], unary_instruction_type.INCREMENT, _$[$0-1].first_line,_$[$0-1].first_column);
    
break;
case 62:
 
        this.$ = new unary_instruction($$[$0-1], unary_instruction_type.DECREMENT, _$[$0-1].first_line,_$[$0-1].first_column);
    
break;
case 63:
 
        this.$ = new print($$[$0-1], print_type.PRINT, _$[$0-3].first_line,_$[$0-3].first_column);
    
break;
case 64:
 
        this.$ = new print($$[$0-1], print_type.PRINTLN, _$[$0-3].first_line,_$[$0-3].first_column);
    
break;
case 65:
 
        this.$ = new native_parse($$[$0-5], $$[$0-1], _$[$0-5].first_line,_$[$0-5].first_column);
    
break;
case 66:
 
        this.$ = new native_function($$[$0-3], $$[$0-1], _$[$0-3].first_line,_$[$0-3].first_column);
    
break;
case 67: case 68: case 69: case 70:
 
        this.$ = $$[$0]
    
break;
case 71:

        this.$ = new assignation_unary($$[$0-2], $$[$0], _$[$0-2].first_line,_$[$0-2].first_column);
    
break;
case 72:

        this.$ = new assignation_array($$[$0-3], $$[$0-2], $$[$0], _$[$0-3].first_line, _$[$0-3].first_column);
    
break;
case 77:

        this.$ = new call($$[$0-3], $$[$0-1], _$[$0-3].first_line,_$[$0-3].first_column);
    
break;
case 78:

        this.$ = new call($$[$0-2], [], _$[$0-2].first_line,_$[$0-2].first_column);
    
break;
case 81: case 82:

        this.$ = new _for($$[$0-8], $$[$0-6], $$[$0-4], $$[$0-1], _$[$0-10].first_line,_$[$0-10].first_column);
    
break;
case 83:

        this.$ = new _forin($$[$0-6], $$[$0-4], $$[$0-1], _$[$0-8].first_line, _$[$0-8].first_column);
    
break;
case 84:

        this.$ = new _while($$[$0-4], $$[$0-1], _while_type.NORMAL, _$[$0-6].first_line,_$[$0-6].first_column);
    
break;
case 85:

        this.$ = new _while($$[$0-2], $$[$0-6], _while_type.DO, _$[$0-8].first_line,_$[$0-8].first_column);
    
break;
case 86:

        this.$ = new _switch($$[$0-4], $$[$0-1], _$[$0-6].first_line,_$[$0-6].first_column);
    
break;
case 89:

        this.$ = new _case($$[$0-2], $$[$0], _case_type.CASE, _$[$0-3].first_line,_$[$0-3].first_column);
    
break;
case 90:

        this.$ = new _case(null, $$[$0], _case_type.DEFAULT, _$[$0-2].first_line,_$[$0-2].first_column);
    
break;
case 91:

        this.$ = new _if($$[$0-5], $$[$0-2], $$[$0], _$[$0-7].first_line,_$[$0-7].first_column);
    
break;
case 92:

        this.$ = new _if($$[$0-4], $$[$0-1], null, _$[$0-6].first_line,_$[$0-6].first_column);
    
break;
case 93: case 138:

        this.$ = $$[$0-1]
    
break;
case 94: case 122: case 123: case 124: case 129: case 132: case 137:

        this.$ = $$[$0]
    
break;
case 95:

        this.$ = new arithmetic_binary($$[$0-2], $$[$0], arithmetic_binary_type.PLUS, _$[$0-2].first_line,_$[$0-2].first_column);
    
break;
case 96:

        this.$ = new arithmetic_binary($$[$0-2], $$[$0], arithmetic_binary_type.MINUS, _$[$0-2].first_line,_$[$0-2].first_column);
    
break;
case 97:
 
        this.$ = new arithmetic_binary($$[$0-2], $$[$0], arithmetic_binary_type.TIMES, _$[$0-2].first_line,_$[$0-2].first_column);
    
break;
case 98:

        this.$ = new arithmetic_binary($$[$0-2], $$[$0], arithmetic_binary_type.DIV, _$[$0-2].first_line,_$[$0-2].first_column);
    
break;
case 99:

        this.$ = new arithmetic_binary($$[$0-2], $$[$0], arithmetic_binary_type.MOD, _$[$0-2].first_line,_$[$0-2].first_column);
    
break;
case 100:

        this.$ = new arithmetic_binary($$[$0-3], $$[$0-1], arithmetic_binary_type.POWER, _$[$0-5].first_line,_$[$0-5].first_column);
    
break;
case 101:

        this.$ = new arithmetic_unary($$[$0-1], arithmetic_unary_type.SQRT, _$[$0-3].first_line,_$[$0-3].first_column);
    
break;
case 102:

        this.$ = new arithmetic_unary($$[$0-1], arithmetic_unary_type.SIN, _$[$0-3].first_line,_$[$0-3].first_column);
    
break;
case 103:

        this.$ = new arithmetic_unary($$[$0-1], arithmetic_unary_type.COS, _$[$0-3].first_line,_$[$0-3].first_column);
    
break;
case 104:

        this.$ = new arithmetic_unary($$[$0-1], arithmetic_unary_type.TAN, _$[$0-3].first_line,_$[$0-3].first_column);
    
break;
case 105:

        this.$ = new arithmetic_unary($$[$0-1], arithmetic_unary_type.LOG10, _$[$0-3].first_line,_$[$0-3].first_column);
    
break;
case 106:

        this.$ = new relational($$[$0-2], $$[$0],relational_type.LESSOREQUAL ,_$[$0-2].first_line, _$[$0-2].first_column);
    
break;
case 107:

        this.$ = new relational($$[$0-2], $$[$0],relational_type.GREATEROREQUAL ,_$[$0-2].first_line, _$[$0-2].first_column);
    
break;
case 108:

        this.$ = new relational($$[$0-2], $$[$0],relational_type.EQUAL ,_$[$0-2].first_line, _$[$0-2].first_column);
    
break;
case 109:

        this.$ = new relational($$[$0-2], $$[$0],relational_type.NOTEQUAL ,_$[$0-2].first_line, _$[$0-2].first_column);
    
break;
case 110:

        this.$ = new relational($$[$0-2], $$[$0],relational_type.GREATER ,_$[$0-2].first_line, _$[$0-2].first_column);
    
break;
case 111:

        this.$ = new relational($$[$0-2], $$[$0],relational_type.LESS, _$[$0-2].first_line, _$[$0-2].first_column);
    
break;
case 112:

        this.$ = new logic($$[$0-2], $$[$0],logic_type.AND ,_$[$0-2].first_line, _$[$0-2].first_column);
    
break;
case 113:

        this.$ = new logic($$[$0-2], $$[$0],logic_type.OR ,_$[$0-2].first_line, _$[$0-2].first_column);
    
break;
case 114:

        this.$ = new string_unary($$[$0-4],string_unary_type.LENGTH ,_$[$0-4].first_line, _$[$0-4].first_column);
    
break;
case 115:

        this.$ = new string_unary($$[$0-4],string_unary_type.UPPERCASE ,_$[$0-4].first_line, _$[$0-4].first_column);
    
break;
case 116:

        this.$ = new string_unary($$[$0-4],string_unary_type.LOWERCASE ,_$[$0-4].first_line, _$[$0-4].first_column);
    
break;
case 117:

        this.$ = new string_binary($$[$0-2], $$[$0],string_binary_type.CONCAT ,_$[$0-2].first_line, _$[$0-2].first_column);
    
break;
case 118:

        this.$ = new string_binary($$[$0-2], $$[$0],string_binary_type.REPEAT ,_$[$0-2].first_line, _$[$0-2].first_column);
    
break;
case 119:

        this.$ = new string_binary($$[$0-5], $$[$0-1],string_binary_type.POSITION ,_$[$0-5].first_line, _$[$0-5].first_column);
    
break;
case 120:

        this.$ = new string_ternary($$[$0-7], $$[$0-3], $$[$0-1], string_ternary_type.SUBSTRING ,_$[$0-7].first_line, _$[$0-7].first_column);
    
break;
case 121:

        this.$ = new ternary($$[$0-4], $$[$0-2], $$[$0], _$[$0-4].first_line, _$[$0-4].first_column);
    
break;
case 125:
 
        this.$ = new struct_access($$[$0-2], $$[$0], variable_id_type.NORMAL, _$[$0-2].first_line, _$[$0-2].first_column);
    
break;
case 126:
 
        this.$ = new variable_id($$[$0], variable_id_type.NORMAL, _$[$0].first_line, _$[$0].first_column);
    
break;
case 127:
 
        this.$ = new variable_id($$[$0-1], variable_id_type.REFERENCE, _$[$0-1].first_line, _$[$0-1].first_column);
    
break;
case 128:

        this.$ = new array_access($$[$0-1], $$[$0], _$[$0-1].first_line, _$[$0-1].first_column);
    
break;
case 130:

        $$[$0-3].push($$[$0-1])
        this.$ = $$[$0-3]
    
break;
case 131:

        this.$ = [$$[$0-1]]
    
break;
case 133: case 134: case 135:

        this.$ = new array_range($$[$0-2], $$[$0], _$[$0-2].first_line, _$[$0-2].first_column);
    
break;
case 136:

        this.$ = new unary($$[$0], unary_type.LOGIC ,_$[$0-1].first_line, _$[$0-1].first_column);
    
break;
case 139:

        this.$ = new unary($$[$0], unary_type.ARITHMETIC, _$[$0-1].first_line,_$[$0-1].first_column);
    
break;
case 140:

        this.$ = new native($$[$0], type.FLOAT ,_$[$0].first_line, _$[$0].first_column);
    
break;
case 141:

        this.$ = new native($$[$0], type.STRING ,_$[$0].first_line, _$[$0].first_column);
    
break;
case 142:

        this.$ = new native($$[$0], type.NULL ,_$[$0].first_line, _$[$0].first_column);
    
break;
case 143:

        this.$ = new native($$[$0], type.CHAR ,_$[$0].first_line, _$[$0].first_column);
    
break;
case 144:

        this.$ = new native($$[$0], type.INTEGER ,_$[$0].first_line, _$[$0].first_column);
    
break;
case 145:

        this.$ = new native($$[$0], type.BOOLEAN ,_$[$0].first_line, _$[$0].first_column);
    
break;
}
},
table: [{2:$V0,3:1,4:2,6:3,7:4,8:$V1,15:5,16:6,18:7,19:8,20:11,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7},{1:[3]},{2:$V0,5:[1,18],6:19,7:20,8:$V1,15:5,16:6,18:7,19:8,20:11,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7},o($V8,[2,4]),o($V8,[2,5]),o($V8,[2,7]),{17:[1,21],23:$V9},{17:[1,23]},{17:[1,24]},o($V8,[2,11]),o([21,52],$Va,{9:[1,25]}),{21:[1,26],24:27,52:$Vb},{21:[1,29]},o($Vc,[2,21]),o($Vc,[2,22]),o($Vc,[2,23]),o($Vc,[2,24]),o($Vc,[2,25]),{1:[2,1]},o($V8,[2,2]),o($V8,[2,3]),o($V8,[2,8]),{21:$Vd,24:30},o($V8,[2,9]),o($V8,[2,10]),{10:[1,32]},o($Ve,$Vf,{10:[1,33],25:$Vg,52:$Vh}),o($Ve,[2,17]),{53:[1,36]},{12:[1,37]},o($Ve,[2,16]),o($Ve,$Vf,{25:$Vg}),{11:[1,38]},{8:$Vi,11:[1,40],20:41,22:39,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7},{53:[1,43]},{8:$Vi,10:$Vj,20:56,21:$Vk,26:44,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{21:[1,72]},{8:$Vi,20:41,22:73,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7},{12:[1,74]},{11:[1,75],23:$VD},{12:[1,77]},{21:[1,78]},o($Vc,$Va),{17:[2,51],25:[1,79]},o($Ve,[2,18],{49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU}),{10:[1,97]},{10:[1,98]},{10:[1,99]},{10:[1,100]},{10:[1,101]},{10:[1,102]},o($VV,$VW),o($VV,$VX),o($VV,[2,124]),o($VV,$VY,{67:104,10:$VZ,52:$V_,55:$V$}),o($VV,$V01),{49:$V11},{10:[1,108]},{8:$Vi,10:$Vj,20:56,21:$Vk,26:109,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($VV,[2,137]),{8:$Vi,10:$Vj,20:56,21:$Vk,26:110,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:111,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{10:[2,67]},{10:[2,68]},{10:[2,69]},{10:[2,70]},o($VV,[2,140]),o($VV,[2,141]),o($VV,[2,142]),o($VV,[2,143]),o($VV,[2,144]),o($VV,[2,145]),{17:[2,52],25:[1,112]},{14:[1,113],23:$VD},{2:$V21,8:$Vi,10:$Vj,13:114,16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:115,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{12:[1,144]},{8:$Vi,20:145,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7},{2:$V21,8:$Vi,10:$Vj,13:146,16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:115,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($Ve1,[2,15]),{52:$Vf1,54:147,55:[1,148]},{8:$Vi,10:$Vj,20:56,21:$Vk,26:150,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:151,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:152,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:153,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:154,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:155,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:156,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:157,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:158,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:159,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:160,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:161,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:162,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{21:[1,168],50:[1,169],51:[1,170],101:[1,163],102:[1,164],103:[1,165],106:[1,166],107:[1,167]},{8:$Vi,10:$Vj,20:56,21:$Vk,26:171,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:172,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:173,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:174,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:175,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:176,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:177,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:178,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:179,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($VV,[2,127]),o($VV,$Vg1,{52:$Vh1}),{8:$Vi,10:$Vj,11:[1,182],20:56,21:$Vk,26:183,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,39:181,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:185,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,110:184,111:$Vi1,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{61:[1,187]},{8:$Vi,10:$Vj,20:56,21:$Vk,26:188,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($VV,[2,136]),{11:[1,189],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},o($VV,[2,139]),{52:$Vf1,54:190,55:[1,191]},{17:[2,20]},{2:$V21,8:$Vi,10:$Vj,14:[1,192],16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:193,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($Vj1,[2,28]),o($Vj1,[2,29]),o($Vj1,[2,30]),o($Vj1,[2,31]),o($Vj1,[2,32]),o($Vj1,[2,33]),o($Vk1,$VY,{67:198,10:$VZ,21:[1,194],25:$Vl1,52:$V_,55:$V$,57:$Vm1,58:$Vn1}),{17:[1,199]},{17:[1,200]},o($Vk1,$VX,{17:[1,201]}),{17:[1,202],23:$V9},{17:[1,203]},{17:[1,204]},{17:[1,205]},{17:[1,206]},{8:$Vi,10:$Vj,17:[1,208],20:56,21:$Vk,26:207,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{17:[1,209]},o($Vk1,$VW,{17:[1,210]}),o($Vk1,$V01,{17:[1,211]}),o($Vj1,[2,48]),{10:[1,212]},{10:[1,213]},{10:[1,214]},{12:[1,215]},{10:[1,216]},{21:[1,217],24:27,49:$V11,52:$Vb},{10:[1,218]},{10:[1,219]},{49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{2:$V21,8:$Vi,10:$Vj,13:220,16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:115,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{21:[1,221]},{2:$V21,8:$Vi,10:$Vj,14:[1,222],16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:193,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{17:[2,53]},{8:$Vi,10:$Vj,20:56,21:$Vk,26:223,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:183,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,39:224,42:52,47:51,48:55,52:$Vf1,54:226,56:225,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($Vo1,[2,95],{84:$VH,85:$VI,86:$VJ}),o($Vo1,[2,96],{84:$VH,85:$VI,86:$VJ}),o($VV,[2,97]),o($VV,[2,98]),o($VV,[2,99]),o($Vp1,[2,106],{82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ}),o($Vp1,[2,107],{82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ}),o($Vq1,[2,108],{82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,97:$VO,98:$VP}),o($Vq1,[2,109],{82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,97:$VO,98:$VP}),o($Vp1,[2,110],{82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ}),o($Vp1,[2,111],{82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ}),o([11,17,23,49,53,77,99,100,104,105,108],[2,112],{82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP}),o([11,17,23,49,53,77,100,104,105,108],[2,113],{82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ}),{10:[1,227]},{10:[1,228]},{10:[1,229]},{10:[1,230]},{10:[1,231]},o($VV,[2,125]),{10:[1,232]},{10:[1,233]},o($Vr1,[2,117],{82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,108:$VU}),o($Vr1,[2,118],{82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,108:$VU}),{49:$VE,77:[1,234],82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{23:[1,235],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{11:[1,236],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{11:[1,237],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{11:[1,238],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{11:[1,239],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{11:[1,240],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{8:$Vi,10:$Vj,20:56,21:$Vk,26:185,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,110:241,111:$Vi1,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{11:[1,242],23:$Vs1},o($VV,[2,78]),o($Vt1,[2,80],{49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU}),{53:[1,244]},{49:$VE,53:[2,132],77:[1,245],82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{77:[1,246]},{10:[1,247]},{11:[1,248],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},o($VV,[2,138]),{17:[2,54]},{8:$Vi,10:$Vj,20:56,21:$Vk,26:249,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($V8,[2,6]),o($Vj1,[2,27]),{25:[1,250]},o($Vu1,[2,61]),o($Vu1,[2,62]),{8:$Vi,10:$Vj,20:56,21:$Vk,26:251,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($Vk1,$Vg1,{25:$Vv1,52:$Vh1}),o($Vj1,[2,35]),o($Vj1,[2,36]),o($Vj1,[2,37]),o($Vj1,[2,38]),o($Vj1,[2,39]),o($Vj1,[2,40]),o($Vj1,[2,41]),o($Vj1,[2,42]),{17:[1,253],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},o($Vj1,[2,44]),o($Vj1,[2,45]),o($Vj1,[2,46]),o($Vj1,[2,47]),{8:$Vi,10:$Vj,20:56,21:$Vk,26:254,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:255,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:256,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{2:$V21,8:$Vi,10:$Vj,13:257,16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:115,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,16:258,20:261,21:[1,260],28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,41:259},o($Ve,$Vf,{25:$Vg,52:$Vh}),{8:$Vi,10:$Vj,20:56,21:$Vk,26:183,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,39:262,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:183,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,39:263,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{2:$V21,8:$Vi,10:$Vj,14:[1,264],16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:193,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($Ve1,[2,14]),o($V8,[2,13]),{17:[2,55],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{23:$Vs1,53:[1,265]},{23:[1,267],53:[1,266]},o($Vw1,[2,58]),{11:[1,268]},{11:[1,269]},{11:[1,270]},{8:$Vi,10:$Vj,20:56,21:$Vk,26:271,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:272,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:273,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{11:[1,274]},{8:$Vi,10:$Vj,20:56,21:$Vk,26:275,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:276,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($VV,[2,101]),o($VV,[2,102]),o($VV,[2,103]),o($VV,[2,104]),o($VV,[2,105]),{53:[1,277]},o($VV,[2,77]),{8:$Vi,10:$Vj,20:56,21:$Vk,26:278,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($Vx1,[2,131]),{8:$Vi,10:$Vj,20:56,21:$Vk,26:280,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,112:[1,279],113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:281,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:282,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($VV,[2,66]),{17:[2,56],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{21:[1,283]},{17:[2,71],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{8:$Vi,10:$Vj,20:56,21:$Vk,26:284,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($Vj1,[2,43]),{11:[1,285],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{11:[1,286],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{11:[1,287],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{2:$V21,8:$Vi,10:$Vj,14:[1,288],16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:193,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{17:[1,289],23:$V9},{17:[1,290]},{25:$Vl1,52:$V_,67:292,70:[1,291]},{21:$Vd,24:27},{11:[1,293],23:$Vs1},{11:[1,294],23:$Vs1},o($V8,[2,12]),o($Vy1,[2,59]),o($Vy1,[2,60]),{52:$Vf1,54:295},o($VV,[2,114]),o($VV,[2,115]),o($VV,[2,116]),{11:[1,296],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{23:[1,297],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{11:[1,298],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},o($VV,[2,50]),o([11,17,23,49,53,77,104,105,108],[2,121],{82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR}),{11:[1,299],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},o($Vx1,[2,130]),o($Vt1,[2,79],{49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU}),{53:[2,134]},{49:$VE,53:[2,135],82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{49:$VE,53:[2,133],82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{11:[1,300],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{10:[1,301]},{17:[2,72],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{12:[1,302]},{12:[1,303]},{12:[1,304]},{71:[1,305]},{8:$Vi,10:$Vj,20:56,21:$Vk,26:306,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:307,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:308,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{25:$Vv1,52:$Vh1},{17:[2,63]},{17:[2,64]},o($Vw1,[2,57]),o($VV,[2,119]),{8:$Vi,10:$Vj,20:56,21:$Vk,26:309,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($VV,[2,49]),o($VV,[2,100]),o($VV,[2,65]),{8:$Vi,10:$Vj,20:56,21:$Vk,26:183,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,39:310,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{2:$V21,8:$Vi,10:$Vj,13:311,16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:115,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{74:312,75:313,76:$Vz1,78:$VA1},{2:$V21,8:$Vi,10:$Vj,13:316,16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:115,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{10:[1,317]},{17:[1,318],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{17:[1,319],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{11:[1,320],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{11:[1,321],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{11:[1,322],23:$Vs1},{2:$V21,8:$Vi,10:$Vj,14:[1,323],16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:193,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{14:[1,324],75:325,76:$Vz1,78:$VA1},o($VB1,[2,88]),{8:$Vi,10:$Vj,20:56,21:$Vk,26:326,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{77:[1,327]},{2:$V21,8:$Vi,10:$Vj,14:[1,328],16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:193,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{8:$Vi,10:$Vj,20:56,21:$Vk,26:329,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,42:52,47:51,48:55,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{21:$VC1,40:330},{21:$VC1,40:332},{12:[1,333]},o($VV,[2,120]),{17:[1,334]},o($Vj1,[2,92],{80:335,81:[1,336]}),o($Vj1,[2,86]),o($VB1,[2,87]),{49:$VE,77:[1,337],82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{2:$V21,8:$Vi,10:$Vj,13:338,16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:115,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($Vj1,[2,84]),{11:[1,339],49:$VE,82:$VF,83:$VG,84:$VH,85:$VI,86:$VJ,93:$VK,94:$VL,95:$VM,96:$VN,97:$VO,98:$VP,99:$VQ,100:$VR,104:$VS,105:$VT,108:$VU},{11:[1,340]},{57:$Vm1,58:$Vn1},{11:[1,341]},{2:$V21,8:$Vi,10:$Vj,13:342,16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:115,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($Vj1,[2,34]),o($Vj1,[2,91]),{12:[1,343],34:344,79:$Vd1},{2:$V21,8:$Vi,10:$Vj,13:345,16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:115,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($VB1,[2,90],{109:53,62:57,114:59,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,16:125,18:126,19:127,46:131,47:132,48:133,20:140,26:143,33:193,2:$V21,8:$Vi,10:$Vj,21:$V31,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,43:$V41,44:$V51,45:$V61,59:$V71,60:$V81,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,113:$Vw,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC}),{17:[1,346]},{12:[1,347]},{12:[1,348]},{2:$V21,8:$Vi,10:$Vj,14:[1,349],16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:193,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{2:$V21,8:$Vi,10:$Vj,13:350,16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:115,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($Vj1,[2,94]),o($VB1,[2,89],{109:53,62:57,114:59,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,16:125,18:126,19:127,46:131,47:132,48:133,20:140,26:143,33:193,2:$V21,8:$Vi,10:$Vj,21:$V31,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,43:$V41,44:$V51,45:$V61,59:$V71,60:$V81,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,113:$Vw,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC}),o($Vj1,[2,85]),{2:$V21,8:$Vi,10:$Vj,13:351,16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:115,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{2:$V21,8:$Vi,10:$Vj,13:352,16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:115,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($Vj1,[2,83]),{2:$V21,8:$Vi,10:$Vj,14:[1,353],16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:193,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{2:$V21,8:$Vi,10:$Vj,14:[1,354],16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:193,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},{2:$V21,8:$Vi,10:$Vj,14:[1,355],16:125,18:126,19:127,20:140,21:$V31,26:143,27:$V2,28:$V3,29:$V4,30:$V5,31:$V6,32:$V7,33:193,34:116,35:117,36:118,37:119,38:120,40:122,41:123,42:124,43:$V41,44:$V51,45:$V61,46:131,47:132,48:133,59:$V71,60:$V81,62:57,63:$Vl,64:$Vm,65:$Vn,66:$Vo,69:$V91,71:$Va1,72:$Vb1,73:$Vc1,79:$Vd1,83:$Vp,87:$Vq,88:$Vr,89:$Vs,90:$Vt,91:$Vu,92:$Vv,109:53,113:$Vw,114:59,115:$Vx,116:$Vy,117:$Vz,118:$VA,119:$VB,120:$VC},o($Vj1,[2,93]),o($Vj1,[2,81]),o($Vj1,[2,82])],
defaultActions: {18:[2,1],62:[2,67],63:[2,68],64:[2,69],65:[2,70],113:[2,20],147:[2,53],190:[2,54],279:[2,134],293:[2,63],294:[2,64]},
parseError: function parseError (str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        var error = new Error(str);
        error.hash = hash;
        throw error;
    }
},
parse: function parse (input) {
    var self = this,
        stack = [0],
        tstack = [], // token stack
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    var args = lstack.slice.call(arguments, 1);

    //this.reductionCount = this.shiftCount = 0;

    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    // copy state
    for (var k in this.yy) {
      if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
        sharedState.yy[k] = this.yy[k];
      }
    }

    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);

    var ranges = lexer.options && lexer.options.ranges;

    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }

    function popStack (n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

_token_stack:
    var lex = function () {
        var token;
        token = lexer.lex() || EOF;
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length - 1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

_handle_error:
        // handle parse error
        if (typeof action === 'undefined' || !action.length || !action[0]) {
            var error_rule_depth;
            var errStr = '';

            // Return the rule stack depth where the nearest error rule can be found.
            // Return FALSE when no error recovery rule was found.
            function locateNearestErrorRecoveryRule(state) {
                var stack_probe = stack.length - 1;
                var depth = 0;

                // try to recover from error
                for(;;) {
                    // check for error recovery rule in this state
                    if ((TERROR.toString()) in table[state]) {
                        return depth;
                    }
                    if (state === 0 || stack_probe < 2) {
                        return false; // No suitable error recovery rule available.
                    }
                    stack_probe -= 2; // popStack(1): [symbol, action]
                    state = stack[stack_probe];
                    ++depth;
                }
            }

            if (!recovering) {
                // first see if there's any chance at hitting an error recovery rule:
                error_rule_depth = locateNearestErrorRecoveryRule(state);

                // Report error
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push("'"+this.terminals_[p]+"'");
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + (this.terminals_[symbol] || symbol)+ "'";
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == EOF ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected,
                    recoverable: (error_rule_depth !== false)
                });
            } else if (preErrorSymbol !== EOF) {
                error_rule_depth = locateNearestErrorRecoveryRule(state);
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol === EOF || preErrorSymbol === EOF) {
                    throw new Error(errStr || 'Parsing halted while starting to recover from another error.');
                }

                // discard current lookahead and grab another
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            if (error_rule_depth === false) {
                throw new Error(errStr || 'Parsing halted. No suitable error recovery rule available.');
            }
            popStack(error_rule_depth);

            preErrorSymbol = (symbol == TERROR ? null : symbol); // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {
            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(lexer.yytext);
                lstack.push(lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = lexer.yyleng;
                    yytext = lexer.yytext;
                    yylineno = lexer.yylineno;
                    yyloc = lexer.yylloc;
                    if (recovering > 0) {
                        recovering--;
                    }
                } else {
                    // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2:
                // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                if (ranges) {
                  yyval._$.range = [lstack[lstack.length-(len||1)].range[0], lstack[lstack.length-1].range[1]];
                }
                r = this.performAction.apply(yyval, [yytext, yyleng, yylineno, sharedState.yy, action[1], vstack, lstack].concat(args));

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3:
                // accept
                return true;
        }

    }

    return true;
}};

    const {type} = require("../system/type") ;
    const { error, error_arr, error_type }= require("../system/error");

    const {arithmetic_binary, arithmetic_binary_type} = require('../expression/arithmetic_binary');
    const {arithmetic_unary, arithmetic_unary_type} = require('../expression/arithmetic_unary');
    const {relational, relational_type} = require('../expression/relational');
    const {logic, logic_type} = require('../expression/logic');
    const {unary, unary_type} = require('../expression/unary');
    const {ternary} = require('../expression/ternary');
    const {string_unary, string_unary_type} = require('../expression/string_unary');
    const {string_binary, string_binary_type} = require('../expression/string_binary');
    const {string_ternary, string_ternary_type} = require('../expression/string_ternary');
    const {parameter} = require('../expression/parameter');
    const {array_range} = require('../expression/array_range');

    
    const {print, print_type} = require('../instruction/print');
    const {declaration_list} = require('../instruction/declaration_list');
    const {declaration_item} = require('../instruction/declaration_item');
    const {assignation_unary} = require('../instruction/assignation_unary');
    const {native_parse} = require('../instruction/native_parse');
    const {native_function} = require('../instruction/native_function');
    const {declaration_function} = require('../instruction/declaration_function');
    const {main} = require('../instruction/main');
    const {call} = require('../instruction/call');
    const {_return} = require('../instruction/_return');
    const {_if} = require('../instruction/_if');
    const {_switch} = require('../instruction/_switch');
    const {_case, _case_type} = require('../instruction/_case');
    const {_break} = require('../instruction/_break');
    const {_continue} = require('../instruction/_continue');
    const {_while, _while_type} = require('../instruction/_while');
    const {unary_instruction, unary_instruction_type} = require('../instruction/unary_instruction');
    const {_for} = require('../instruction/_for');
    const {_forin} = require('../instruction/_forin');
    const {declaration_array} = require('../instruction/declaration_array');
    const {declaration_struct} = require('../instruction/declaration_struct');
    const {declaration_struct_item} = require('../instruction/declaration_struct_item');
    const {array_access} = require('../instruction/array_access');
    const {struct_access} = require('../instruction/struct_access');
    const {array_native_function} = require('../instruction/array_native_function');
    const {assignation_array} = require('../instruction/assignation_array');


    const {native} = require('../literal/native');
    const {variable_id, variable_id_type} = require('../literal/variable_id');
    const {_array} = require('../literal/_array');
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function(match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex () {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin (condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState () {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules () {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState (n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState (condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {"case-sensitive":true},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* Skip Whitespace */
break;
case 1:/* Skip tabs */
break;
case 2:/* Skip return */
break;
case 3:/* Comments */
break;
case 4:/* Multiline Comments */
break;
case 5:return 106
break;
case 6:return 107
break;
case 7:return 101
break;
case 8:return 102
break;
case 9:return 103
break;
case 10:return 117
break;
case 11:return 120
break;
case 12:return 120
break;
case 13:return 87
break;
case 14:return 88
break;
case 15:return 89
break;
case 16:return 90
break;
case 17:return 91
break;
case 18:return 92
break;
case 19:return 28
break;
case 20:return 29
break;
case 21:return 32
break;
case 22:return 31
break;
case 23:return 30
break;
case 24:return 79
break;
case 25:return 81
break;
case 26:return 73
break;
case 27:return 76
break;
case 28:return 78
break;
case 29:return 43
break;
case 30:return 44
break;
case 31:return 71
break;
case 32:return 72
break;
case 33:return 69
break;
case 34:return 8
break;
case 35:return 9
break;
case 36:return 60
break;
case 37:return 59
break;
case 38:return 45
break;
case 39:return 27
break;
case 40:return 61
break;
case 41:return 63
break;
case 42:return 64
break;
case 43:return 65
break;
case 44:return 66
break;
case 45:return 43
break;
case 46:return 44
break;
case 47:return 70
break;
case 48:return 111
break;
case 49:return 112
break;
case 50:return 50
break;
case 51:return 51
break;
case 52:return 117
break;
case 53:return 115
break;
case 54:return 119
break;
case 55:return 116
break;
case 56:return 118
break;
case 57:return 21
break;
case 58:return 84
break;
case 59:return 85
break;
case 60:return 57
break;
case 61:return 58
break;
case 62:return 82
break;
case 63:return 83
break;
case 64:return 86
break;
case 65:return 93
break;
case 66:return 94
break;
case 67:return 98
break;
case 68:return 97
break;
case 69:return 95
break;
case 70:return 96
break;
case 71:return 100
break;
case 72:return 99
break;
case 73:return 104
break;
case 74:return 113
break;
case 75:return 25
break;
case 76:return 10
break;
case 77:return 11 
break;
case 78:return 12
break;
case 79:return 14
break;
case 80:return 52
break;
case 81:return 53
break;
case 82:return 23
break;
case 83:return 105
break;
case 84:return 49
break;
case 85:return 108
break;
case 86:return 77
break;
case 87:return 17
break;
case 88:return 55
break;
case 89:return 5
break;
case 90:error_arr.push(new error(yy_.yylloc.first_line, yy_.yylloc.first_column, error_type.LEXICO,'Valor inesperado ' + yy_.yytext));  
break;
}
},
rules: [/^(?:\s+)/,/^(?:\t)/,/^(?:\r)/,/^(?:\/\/.*)/,/^(?:[/][*][^*]*[*]+([^/*][^*]*[*]+)*[/])/,/^(?:caracterOfPosition\b)/,/^(?:subString\b)/,/^(?:length\b)/,/^(?:toUppercase\b)/,/^(?:toLowercase\b)/,/^(?:null\b)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:pow\b)/,/^(?:sqrt\b)/,/^(?:sin\b)/,/^(?:cos\b)/,/^(?:tan\b)/,/^(?:log10\b)/,/^(?:int\b)/,/^(?:double\b)/,/^(?:char\b)/,/^(?:boolean\b)/,/^(?:String\b)/,/^(?:if\b)/,/^(?:else\b)/,/^(?:switch\b)/,/^(?:case\b)/,/^(?:default\b)/,/^(?:break\b)/,/^(?:continue\b)/,/^(?:while\b)/,/^(?:do\b)/,/^(?:for\b)/,/^(?:void\b)/,/^(?:main\b)/,/^(?:println\b)/,/^(?:print\b)/,/^(?:return\b)/,/^(?:struct\b)/,/^(?:parse\b)/,/^(?:toInt\b)/,/^(?:toDouble\b)/,/^(?:string\b)/,/^(?:typeof\b)/,/^(?:break\b)/,/^(?:continue\b)/,/^(?:in\b)/,/^(?:begin\b)/,/^(?:end\b)/,/^(?:push\b)/,/^(?:pop\b)/,/^(?:null\b)/,/^(?:([0-9]+(\.[0-9]+)))/,/^(?:([0-9]+))/,/^(?:(([\"][^"]*[\"])))/,/^(?:(([\'][^\']{1}[\'])))/,/^(?:(([a-zA-Z_])[a-zA-Z0-9_ñÑ]*))/,/^(?:\*)/,/^(?:\/)/,/^(?:\+\+)/,/^(?:--)/,/^(?:\+)/,/^(?:-)/,/^(?:%)/,/^(?:<=)/,/^(?:>=)/,/^(?:<)/,/^(?:>)/,/^(?:==)/,/^(?:!=)/,/^(?:\|\|)/,/^(?:&&)/,/^(?:&)/,/^(?:!)/,/^(?:=)/,/^(?:\()/,/^(?:\))/,/^(?:\{)/,/^(?:\})/,/^(?:\[)/,/^(?:\])/,/^(?:,)/,/^(?:\^)/,/^(?:\.)/,/^(?:\?)/,/^(?::)/,/^(?:;)/,/^(?:#)/,/^(?:$)/,/^(?:.)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = main_grammar;
exports.Parser = main_grammar.Parser;
exports.parse = function () { return main_grammar.parse.apply(main_grammar, arguments); };
exports.main = function commonjsMain (args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
}).call(this)}).call(this,require('_process'))
},{"../expression/arithmetic_binary":8,"../expression/arithmetic_unary":9,"../expression/array_range":10,"../expression/logic":11,"../expression/parameter":12,"../expression/relational":13,"../expression/string_binary":14,"../expression/string_ternary":15,"../expression/string_unary":16,"../expression/ternary":17,"../expression/unary":18,"../instruction/_break":20,"../instruction/_case":21,"../instruction/_continue":22,"../instruction/_for":23,"../instruction/_forin":24,"../instruction/_if":25,"../instruction/_return":26,"../instruction/_switch":27,"../instruction/_while":28,"../instruction/array_access":29,"../instruction/array_native_function":30,"../instruction/assignation_array":31,"../instruction/assignation_unary":32,"../instruction/call":33,"../instruction/declaration_array":34,"../instruction/declaration_function":35,"../instruction/declaration_item":36,"../instruction/declaration_list":37,"../instruction/declaration_struct":38,"../instruction/declaration_struct_item":39,"../instruction/main":40,"../instruction/native_function":41,"../instruction/native_parse":42,"../instruction/print":43,"../instruction/struct_access":44,"../instruction/unary_instruction":45,"../literal/_array":46,"../literal/native":48,"../literal/variable_id":50,"../system/error":55,"../system/type":56,"_process":3,"fs":1,"path":2}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._break = void 0;
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const instruction_1 = require("../abstract/instruction");
class _break extends instruction_1.instruction {
    translate(environment) {
        console_1._3dCode.output += "goto L" + console_1._3dCode.breakTag + ";\n";
        return type_1.type.NULL;
    }
    constructor(line, column) {
        super(line, column);
    }
    execute(environment) {
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Break\"];";
        return result;
    }
}
exports._break = _break;

},{"../abstract/instruction":5,"../system/console":53,"../system/type":56}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._case = exports._case_type = void 0;
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const instruction_1 = require("../abstract/instruction");
const _return_1 = require("./_return");
const _break_1 = require("./_break");
var _case_type;
(function (_case_type) {
    _case_type[_case_type["CASE"] = 0] = "CASE";
    _case_type[_case_type["DEFAULT"] = 1] = "DEFAULT";
})(_case_type = exports._case_type || (exports._case_type = {}));
class _case extends instruction_1.instruction {
    constructor(case_value, code, type, line, column) {
        super(line, column);
        this.case_value = case_value;
        this.code = code;
        this.type = type;
    }
    translate(environment) {
        if (this.type == _case_type.CASE) {
            if (this.case_value != null) {
                this.case_value.translate(environment);
                const conditionTemp = console_1._3dCode.actualTemp;
                console_1._3dCode.actualTag++;
                let lTrue = console_1._3dCode.actualTag;
                console_1._3dCode.output += 'if(T' + conditionTemp + ' == T' + console_1._3dCode.switchEvaluation + ') goto L' + lTrue + ';\n';
                console_1._3dCode.actualTag++;
                let lFalse = console_1._3dCode.actualTag;
                console_1._3dCode.output += "goto L" + lFalse + ";\n";
                console_1._3dCode.actualTag++;
                let salida = console_1._3dCode.actualTag;
                console_1._3dCode.output += "L" + lTrue + ":\n";
                for (const instr of this.code) {
                    try {
                        instr.translate(environment);
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
                console_1._3dCode.output += "goto L" + salida + ";\n";
                console_1._3dCode.output += "L" + salida + ":\n";
                console_1._3dCode.output += "L" + lFalse + ":\n";
            }
        }
        else {
            console_1._3dCode.actualTag++;
            let salida = console_1._3dCode.actualTag;
            for (const instr of this.code) {
                try {
                    instr.translate(environment);
                }
                catch (error) {
                    console.log(error);
                }
            }
            console_1._3dCode.output += "goto L" + salida + ";\n";
            console_1._3dCode.output += "L" + salida + ":\n";
        }
        return type_1.type.NULL;
    }
    get_value() {
        return this.case_value;
    }
    execute(environment) {
        for (const instr of this.code) {
            const instr_data = instr.execute(environment);
            if (instr_data instanceof _break_1._break) {
                break;
            }
            else if (instr_data instanceof _return_1._return) {
                return instr_data;
            }
        }
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Case (" + _case_type[this.type] + ")\"];";
        const this_count = count;
        if (this.case_value != null) {
            const child_list = [this.case_value];
            for (const instr of child_list) {
                try {
                    result += "node" + this_count + " -> " + "node" + count + "1;";
                    result += instr.plot(Number(count + "1"));
                    count++;
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
        for (const instr of this.code) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports._case = _case;

},{"../abstract/instruction":5,"../system/console":53,"../system/type":56,"./_break":20,"./_return":26}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._continue = void 0;
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const instruction_1 = require("../abstract/instruction");
class _continue extends instruction_1.instruction {
    translate(environment) {
        console_1._3dCode.output += "goto L" + console_1._3dCode.continueTag + ";\n";
        return type_1.type.NULL;
    }
    constructor(line, column) {
        super(line, column);
    }
    execute(environment) {
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Continue\"];";
        return result;
    }
}
exports._continue = _continue;

},{"../abstract/instruction":5,"../system/console":53,"../system/type":56}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._for = void 0;
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const instruction_1 = require("../abstract/instruction");
const _return_1 = require("./_return");
const _break_1 = require("./_break");
const _continue_1 = require("./_continue");
const assignation_unary_1 = require("./assignation_unary");
const declaration_list_1 = require("./declaration_list");
class _for extends instruction_1.instruction {
    constructor(initialization, condition, unary, code, line, column) {
        super(line, column);
        this.initialization = initialization;
        this.condition = condition;
        this.unary = unary;
        this.code = code;
    }
    translate(environment) {
        console_1._3dCode.actualTag++;
        let inicio = console_1._3dCode.actualTag;
        console_1._3dCode.actualTag++;
        let final = console_1._3dCode.actualTag;
        console_1._3dCode.actualTag++;
        let continueTag = console_1._3dCode.actualTag;
        this.initialization.translate(environment);
        console_1._3dCode.output += 'L' + inicio + ':\n';
        this.condition.translate(environment);
        let conditionTemp = console_1._3dCode.actualTemp;
        console_1._3dCode.output += 'if(T' + conditionTemp + ' == 0) goto L' + final + ';\n';
        let tempContinue = console_1._3dCode.continueTag;
        console_1._3dCode.continueTag = continueTag;
        let tempBreak = console_1._3dCode.breakTag;
        console_1._3dCode.breakTag = final;
        for (const instruction of this.code) {
            instruction.translate(environment);
        }
        console_1._3dCode.breakTag = tempBreak;
        console_1._3dCode.continueTag = tempContinue;
        console_1._3dCode.output += 'L' + continueTag + ':\n';
        this.unary.translate(environment);
        console_1._3dCode.output += "goto L" + inicio + ";\n";
        console_1._3dCode.output += "L" + final + ":\n";
        return type_1.type.NULL;
    }
    execute(environment) {
        if (this.initialization instanceof assignation_unary_1.assignation_unary
            || this.initialization instanceof declaration_list_1.declaration_list) {
            this.initialization.execute(environment);
        }
        else {
            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'La inicializacion del for tiene que ser una declaracion o asignacion'));
            // Default
            return { value: null, type: type_1.type.NULL };
        }
        let condition_data = this.condition.execute(environment);
        if (condition_data.type != type_1.type.BOOLEAN) {
            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'La condicion tiene que ser de tipo booleana'));
            // Default
            return { value: null, type: type_1.type.NULL };
        }
        while (condition_data.value == true) {
            for (const instruction of this.code) {
                let instruction_data = instruction.execute(environment);
                if (instruction instanceof _return_1._return) {
                    return instruction_data;
                }
                else if (instruction instanceof _break_1._break) {
                    break;
                }
                else if (instruction instanceof _continue_1._continue) {
                    continue;
                }
            }
            this.unary.execute(environment);
            condition_data = this.condition.execute(environment);
            if (condition_data.type != type_1.type.BOOLEAN) {
                error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'La condicion tiene que ser de tipo booleana'));
                // Default
                return { value: null, type: type_1.type.NULL };
            }
        }
        // Default
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") For\"];";
        const this_count = count;
        const child_list = [this.initialization, this.condition, this.unary];
        for (const instr of child_list) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports._for = _for;

},{"../abstract/instruction":5,"../system/console":53,"../system/error":55,"../system/type":56,"./_break":20,"./_continue":22,"./_return":26,"./assignation_unary":32,"./declaration_list":37}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._forin = void 0;
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const instruction_1 = require("../abstract/instruction");
const array_access_1 = require("./array_access");
const _array_1 = require("../literal/_array");
class _forin extends instruction_1.instruction {
    constructor(id, operator, code, line, column) {
        super(line, column);
        this.id = id;
        this.operator = operator;
        this.code = code;
    }
    translate(environment) {
        if (this.operator instanceof array_access_1.array_access) {
        }
        else {
            let operatorType;
            let operatorTemp;
            operatorType = this.operator.translate(environment);
            operatorTemp = console_1._3dCode.actualTemp;
            environment.save_variable(this.id, { value: null, type: operatorType }, console_1._3dCode.absolutePos, console_1._3dCode.relativePos, 1);
            console_1._3dCode.absolutePos++;
            console_1._3dCode.relativePos++;
            if (operatorType == type_1.type.STRING) {
                let relativePos = console_1._3dCode.relativePos;
                console_1._3dCode.actualTemp++;
                let caracter = console_1._3dCode.actualTemp;
                console_1._3dCode.actualTag++;
                let inicio = console_1._3dCode.actualTag;
                console_1._3dCode.actualTag++;
                let final = console_1._3dCode.actualTag;
                console_1._3dCode.actualTag++;
                let continueTag = console_1._3dCode.actualTag;
                console_1._3dCode.output += 'L' + inicio + ':\n';
                console_1._3dCode.output += 'T' + caracter + ' = HEAP[(int)T' + operatorTemp + '];//Get character\n';
                console_1._3dCode.output += 'if(T' + caracter + ' == 36) goto L' + final + ';\n';
                console_1._3dCode.actualTemp++;
                let inicioString = console_1._3dCode.actualTemp;
                console_1._3dCode.output += 'T' + inicioString + ' = HP;//Save new start\n';
                console_1._3dCode.output += 'HEAP[(int)HP] = T' + caracter + ';//Save character\n';
                console_1._3dCode.output += 'HP = HP + 1;\n';
                console_1._3dCode.output += 'HEAP[(int)HP] = 36;//Save end of string\n';
                console_1._3dCode.output += 'HP = HP + 1;\n';
                relativePos = environment.get_relative_recursive(this.id, environment);
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + ' + relativePos + ';\n';
                console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + inicioString + ';//Update value for variable ' + this.id + '\n';
                let tempContinue = console_1._3dCode.continueTag;
                console_1._3dCode.continueTag = continueTag;
                let tempBreak = console_1._3dCode.breakTag;
                console_1._3dCode.breakTag = final;
                for (const instruction of this.code) {
                    instruction.translate(environment);
                }
                console_1._3dCode.breakTag = tempBreak;
                console_1._3dCode.continueTag = tempContinue;
                console_1._3dCode.output += 'L' + continueTag + ':\n';
                console_1._3dCode.output += 'T' + operatorTemp + ' = T' + operatorTemp + ' + 1;//Update position\n';
                console_1._3dCode.output += "goto L" + inicio + ";\n";
                console_1._3dCode.output += "L" + final + ":\n";
            }
            else {
                let size;
                let return_data = environment.get_variable_recursive(this.id, environment);
                if (return_data.value instanceof _array_1._array) {
                    size = return_data.value.getTotalItems();
                }
                console.log(return_data);
                let relative = environment.get_relative_recursive(this.id, environment);
                let relativePos = console_1._3dCode.relativePos;
                console_1._3dCode.actualTemp++;
                let contador = console_1._3dCode.actualTemp;
                console_1._3dCode.actualTag++;
                let inicio = console_1._3dCode.actualTag;
                console_1._3dCode.actualTag++;
                let final = console_1._3dCode.actualTag;
                console_1._3dCode.actualTag++;
                let continueTag = console_1._3dCode.actualTag;
                console_1._3dCode.output += 'L' + inicio + ':\n';
                console_1._3dCode.output += 'if(T' + contador + ' == ' + size + ') goto L' + final + ';\n';
                console_1._3dCode.actualTemp++;
                let iterador = console_1._3dCode.actualTemp;
                console_1._3dCode.output += 'T' + iterador + ' = SP + ' + relative + ';//Set array start\n';
                console_1._3dCode.output += 'T' + iterador + ' = T' + iterador + ' + T' + contador + ';//Set position\n';
                relativePos = environment.get_relative_recursive(this.id, environment);
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + iterador + '];\n';
                console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + console_1._3dCode.actualTemp + ';//Update value for index\n';
                let tempContinue = console_1._3dCode.continueTag;
                console_1._3dCode.continueTag = continueTag;
                let tempBreak = console_1._3dCode.breakTag;
                console_1._3dCode.breakTag = final;
                for (const instruction of this.code) {
                    instruction.translate(environment);
                }
                console_1._3dCode.breakTag = tempBreak;
                console_1._3dCode.continueTag = tempContinue;
                console_1._3dCode.output += 'L' + continueTag + ':\n';
                console_1._3dCode.output += 'T' + contador + ' = T' + contador + ' + 1;//Update position\n';
                console_1._3dCode.output += "goto L" + inicio + ";\n";
                console_1._3dCode.output += "L" + final + ":\n";
            }
        }
        return type_1.type.NULL;
    }
    execute(environment) {
        throw new Error("Method not implemented.");
    }
    plot(count) {
        throw new Error("Method not implemented.");
    }
}
exports._forin = _forin;

},{"../abstract/instruction":5,"../literal/_array":46,"../system/console":53,"../system/type":56,"./array_access":29}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._if = void 0;
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const instruction_1 = require("../abstract/instruction");
const _return_1 = require("./_return");
class _if extends instruction_1.instruction {
    constructor(condition, code, else_statement, line, column) {
        super(line, column);
        this.condition = condition;
        this.code = code;
        this.else_statement = else_statement;
    }
    translate(environment) {
        this.condition.translate(environment);
        const conditionTemp = console_1._3dCode.actualTemp;
        console_1._3dCode.actualTag++;
        let lTrue = console_1._3dCode.actualTag;
        console_1._3dCode.output += "if(T" + conditionTemp + ") goto L" + lTrue + ";\n";
        console_1._3dCode.actualTag++;
        let lFalse = console_1._3dCode.actualTag;
        console_1._3dCode.output += "goto L" + lFalse + ";\n";
        console_1._3dCode.actualTag++;
        let salida = console_1._3dCode.actualTag;
        console_1._3dCode.output += "L" + lTrue + ":\n";
        for (const instr of this.code) {
            try {
                instr.translate(environment);
            }
            catch (error) {
                console.log(error);
            }
        }
        console_1._3dCode.output += "goto L" + salida + ";\n";
        console_1._3dCode.output += "L" + lFalse + ":\n";
        if (this.else_statement != null)
            if (this.else_statement instanceof instruction_1.instruction) {
                this.else_statement.translate(environment);
            }
            else if (this.else_statement instanceof Array) {
                for (const instr of this.else_statement) {
                    try {
                        instr.translate(environment);
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
            }
        console_1._3dCode.output += "L" + salida + ":\n";
        return type_1.type.NULL;
    }
    execute(environment) {
        const condition = this.condition.execute(environment);
        // first check that the condition is a boolean
        if (condition.type != type_1.type.BOOLEAN) {
            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'La condicion del if tiene que ser booleana'));
        }
        // if the condition is true execute the set of instructions
        if (condition.value == true) {
            for (const instr of this.code) {
                try {
                    const element_data = instr.execute(environment);
                    if (instr instanceof _return_1._return) {
                        return element_data;
                    }
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
        else {
            // else if is another if
            if (this.else_statement instanceof instruction_1.instruction) {
                return this.else_statement.execute(environment);
            }
            // Else without condition is just a set of instructions 
            else if (this.else_statement instanceof Array) {
                for (const instr of this.else_statement) {
                    try {
                        const element_data = instr.execute(environment);
                        if (instr instanceof _return_1._return) {
                            return element_data;
                        }
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
            }
        }
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") For\"];";
        const this_count = count;
        const child_list = [this.condition];
        const arr_list = [this.code];
        if (this.else_statement instanceof instruction_1.instruction) {
            child_list.push(this.else_statement);
        }
        else {
            arr_list.push(this.else_statement);
        }
        for (const instr of child_list) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        for (const instr_arr of arr_list) {
            for (const instr of instr_arr) {
                try {
                    result += "node" + this_count + " -> " + "node" + count + "1;";
                    result += instr.plot(Number(count + "1"));
                    count++;
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
        return result;
    }
}
exports._if = _if;

},{"../abstract/instruction":5,"../system/console":53,"../system/error":55,"../system/type":56,"./_return":26}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._return = void 0;
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const instruction_1 = require("../abstract/instruction");
class _return extends instruction_1.instruction {
    constructor(return_value, line, column) {
        super(line, column);
        this.return_value = return_value;
    }
    translate(environment) {
        if (this.return_value != null) {
            let returnType = this.return_value.translate(environment);
            let returnTemp = console_1._3dCode.actualTemp;
            console_1._3dCode.actualTemp++;
            console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 0;//Set return position\n';
            console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + returnTemp + ';//Save return value\n';
            console_1._3dCode.output += 'return;\n';
            return returnType;
        }
        return type_1.type.NULL;
    }
    execute(environment) {
        return this.return_value.execute(environment);
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Return\"];";
        const this_count = count;
        const child_list = [this.return_value];
        for (const instr of child_list) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports._return = _return;

},{"../abstract/instruction":5,"../system/console":53,"../system/type":56}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._switch = void 0;
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const instruction_1 = require("../abstract/instruction");
const _case_1 = require("./_case");
class _switch extends instruction_1.instruction {
    constructor(switch_value, case_list, line, column) {
        super(line, column);
        this.switch_value = switch_value;
        this.case_list = case_list;
    }
    translate(environment) {
        this.switch_value.translate(environment);
        console_1._3dCode.switchEvaluation = console_1._3dCode.actualTemp;
        console_1._3dCode.actualTag++;
        let salida = console_1._3dCode.actualTag;
        console_1._3dCode.breakTag = salida;
        for (const case_instr of this.case_list) {
            case_instr.translate(environment);
        }
        console_1._3dCode.output += "L" + salida + ":\n";
        return type_1.type.NULL;
    }
    execute(environment) {
        const switch_value_data = this.switch_value.execute(environment);
        // comprobar tipos de los case
        for (const case_instr of this.case_list) {
            if (case_instr.type == _case_1._case_type.CASE) {
                let case_value_data = case_instr.get_value();
                if (case_value_data != null) {
                    if (case_value_data.type != switch_value_data.type) {
                        error_1.error_arr.push(new error_1.error(case_instr.line, case_instr.column, error_1.error_type.SEMANTICO, 'El case tiene tipo distinto al switch'));
                    }
                }
            }
        }
        // ejecutar los case
        let default_case;
        for (const case_instr of this.case_list) {
            // Guardar el default por si ningun case es verdadero
            if (case_instr.type == _case_1._case_type.DEFAULT) {
                default_case = case_instr;
            }
            else {
                let case_value_data = case_instr.get_value();
                if (case_value_data != null) {
                    case_value_data = case_value_data.execute(environment);
                    if (case_value_data.value == switch_value_data.value) {
                        return case_instr.execute(environment);
                    }
                }
            }
        }
        return default_case ? default_case.execute(environment) : { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Switch\"];";
        const this_count = count;
        const child_list = [this.switch_value];
        for (const instr of child_list) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        for (const instr of this.case_list) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports._switch = _switch;

},{"../abstract/instruction":5,"../system/console":53,"../system/error":55,"../system/type":56,"./_case":21}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._while = exports._while_type = void 0;
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const instruction_1 = require("../abstract/instruction");
const _return_1 = require("./_return");
const _break_1 = require("./_break");
const _continue_1 = require("./_continue");
var _while_type;
(function (_while_type) {
    _while_type[_while_type["NORMAL"] = 0] = "NORMAL";
    _while_type[_while_type["DO"] = 1] = "DO";
})(_while_type = exports._while_type || (exports._while_type = {}));
class _while extends instruction_1.instruction {
    constructor(condition, code, type, line, column) {
        super(line, column);
        this.condition = condition;
        this.code = code;
        this.type = type;
    }
    translate(environment) {
        console_1._3dCode.actualTag++;
        let startTag;
        let conditionType;
        let conditionTemp;
        let final;
        let tempBreak;
        let tempContinue;
        switch (this.type) {
            case _while_type.NORMAL:
                console_1._3dCode.actualTag++;
                startTag = console_1._3dCode.actualTag;
                console_1._3dCode.output += "L" + startTag + ":\n";
                conditionType = this.condition.translate(environment);
                conditionTemp = console_1._3dCode.actualTemp;
                console_1._3dCode.actualTag++;
                let inicio = console_1._3dCode.actualTag;
                console_1._3dCode.actualTag++;
                final = console_1._3dCode.actualTag;
                console_1._3dCode.output += "if(T" + conditionTemp + " == 1) goto L" + inicio + ";\n";
                console_1._3dCode.output += "goto L" + final + ";\n";
                console_1._3dCode.output += "L" + inicio + ":\n";
                tempContinue = console_1._3dCode.continueTag;
                console_1._3dCode.continueTag = startTag;
                tempBreak = console_1._3dCode.breakTag;
                console_1._3dCode.breakTag = final;
                for (const instruction of this.code) {
                    instruction.translate(environment);
                }
                console_1._3dCode.breakTag = tempBreak;
                console_1._3dCode.continueTag = tempContinue;
                console_1._3dCode.output += "goto L" + startTag + ";\n";
                console_1._3dCode.output += "L" + final + ":\n";
                break;
            case _while_type.DO:
                console_1._3dCode.actualTag++;
                startTag = console_1._3dCode.actualTag;
                console_1._3dCode.output += "L" + startTag + ":\n";
                console_1._3dCode.actualTag++;
                final = console_1._3dCode.actualTag;
                tempContinue = console_1._3dCode.continueTag;
                console_1._3dCode.continueTag = startTag;
                tempBreak = console_1._3dCode.breakTag;
                console_1._3dCode.breakTag = final;
                for (const instruction of this.code) {
                    instruction.translate(environment);
                }
                console_1._3dCode.breakTag = tempBreak;
                console_1._3dCode.continueTag = tempContinue;
                conditionType = this.condition.translate(environment);
                conditionTemp = console_1._3dCode.actualTemp;
                console_1._3dCode.output += "if(T" + conditionTemp + " == 1) goto L" + startTag + ";\n";
                console_1._3dCode.output += "L" + final + ":\n";
                break;
        }
        // Default
        return type_1.type.NULL;
    }
    execute(environment) {
        let condition_data = this.condition.execute(environment);
        if (condition_data.type != type_1.type.BOOLEAN) {
            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'La condicion tiene que ser de tipo booleana'));
            // Default
            return { value: null, type: type_1.type.NULL };
        }
        switch (this.type) {
            case _while_type.NORMAL:
                while (condition_data.value == true) {
                    for (const instruction of this.code) {
                        let instruction_data = instruction.execute(environment);
                        if (instruction instanceof _return_1._return) {
                            return instruction_data;
                        }
                        else if (instruction instanceof _break_1._break) {
                            break;
                        }
                        else if (instruction instanceof _continue_1._continue) {
                            continue;
                        }
                    }
                    condition_data = this.condition.execute(environment);
                    if (condition_data.type != type_1.type.BOOLEAN) {
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'La condicion tiene que ser de tipo booleana'));
                    }
                }
                break;
            case _while_type.DO:
                do {
                    for (const instruction of this.code) {
                        let instruction_data = instruction.execute(environment);
                        if (instruction instanceof _return_1._return) {
                            return instruction_data;
                        }
                        else if (instruction instanceof _break_1._break) {
                            break;
                        }
                        else if (instruction instanceof _continue_1._continue) {
                            continue;
                        }
                    }
                    condition_data = this.condition.execute(environment);
                    if (condition_data.type != type_1.type.BOOLEAN) {
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'La condicion tiene que ser de tipo booleana'));
                    }
                } while (condition_data.value == true);
                break;
        }
        // Default
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") While (" + _while_type[this.type] + ")\"];";
        const this_count = count;
        const child_list = [this.condition];
        for (const instr of child_list) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        for (const instr of this.code) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports._while = _while;

},{"../abstract/instruction":5,"../system/console":53,"../system/error":55,"../system/type":56,"./_break":20,"./_continue":22,"./_return":26}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.array_access = void 0;
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const instruction_1 = require("../abstract/instruction");
const _array_1 = require("../literal/_array");
class array_access extends instruction_1.instruction {
    constructor(id, dimensions, line, column) {
        super(line, column);
        this.id = id;
        this.dimensions = dimensions;
    }
    translate(environment) {
        let return_data = environment.get_variable_recursive(this.id, environment);
        let tempList = [];
        if (return_data.type != type_1.type.UNDEFINED) {
            if (return_data.value instanceof _array_1._array) {
                for (let dimension of this.dimensions) {
                    dimension.translate(environment);
                    tempList.push(console_1._3dCode.actualTemp);
                }
                console_1._3dCode.actualTemp++;
                let uno = console_1._3dCode.actualTemp;
                console_1._3dCode.actualTemp++;
                let dos = console_1._3dCode.actualTemp;
                for (let i = 0; i < tempList.length; i++) {
                    if (i == 0)
                        console_1._3dCode.output += 'T' + uno + ' = T' + tempList[i] + ';\n';
                    else {
                        console_1._3dCode.output += 'T' + dos + ' = T' + uno + ' * ' + return_data.value.dimensionSize.get(i) + ';\n';
                        console_1._3dCode.output += 'T' + uno + ' = T' + dos + ' + T' + tempList[i] + ';\n';
                    }
                }
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + ' + environment.get_relative_recursive(this.id, environment) + ';//Set array initial position\n';
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = T' + console_1._3dCode.actualTemp + ' + T' + uno + ';//Add index\n';
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + console_1._3dCode.actualTemp + '];//Get value\n';
                return return_data.type;
            }
            else {
            }
        }
        else {
        }
        return type_1.type.NULL;
    }
    execute(environment) {
        let return_data = environment.get_variable(this.id);
        if (return_data.type != type_1.type.UNDEFINED) {
            if (return_data.value instanceof _array_1._array) {
                if (this.dimensions.length == 0) {
                    return return_data;
                }
                // validate that the array have the correct dimensions
                if (!return_data.value.check_dimensions_number(this.dimensions)) {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Numero de dimensiones no validas para el array'));
                    return { value: null, type: type_1.type.NULL };
                }
                // and each have the correct length
                if (!return_data.value.check_dimensions_length(this.dimensions, environment)) {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Index no valido'));
                    return { value: null, type: type_1.type.NULL };
                }
                let returned = return_data.value.get(this.dimensions, environment);
                // Get the type from the symbols table
                if (returned.type == type_1.type.UNDEFINED) {
                    returned.type = return_data.type;
                }
                return returned;
            }
            else {
                error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Variable no es un array: ' + this.id));
            }
        }
        else {
            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Variable no definida: ' + this.id));
        }
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") While (" + this.id + ")\"];";
        const this_count = count;
        for (const instr of this.dimensions) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports.array_access = array_access;

},{"../abstract/instruction":5,"../literal/_array":46,"../system/console":53,"../system/error":55,"../system/type":56}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.array_native_function = void 0;
const type_1 = require("../system/type");
const instruction_1 = require("../abstract/instruction");
const error_1 = require("../system/error");
const _array_1 = require("../literal/_array");
class array_native_function extends instruction_1.instruction {
    constructor(id, option, parameter, line, column) {
        super(line, column);
        this.id = id;
        this.option = option;
        this.parameter = parameter;
    }
    translate(environment) {
        throw new Error("Method not implemented.");
    }
    execute(environment) {
        const return_data = this.id.execute(environment);
        if (!(return_data.value instanceof _array_1._array)) {
            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Variable no es un array'));
            return { value: null, type: type_1.type.NULL };
        }
        switch (this.option) {
            case "pop":
                let return_value = return_data.value.body.pop();
                if (return_value instanceof _array_1._array) {
                    return { value: return_value, type: return_data.type };
                }
                else if (return_value != null) {
                    return return_value.execute(environment);
                }
            case "push":
                if (this.parameter == null) {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'El push no puede venir vacio'));
                    return { value: null, type: type_1.type.NULL };
                }
                const parameter_data = this.parameter.execute(environment);
                if (parameter_data.type != return_data.type) {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'El parametro tiene que ser del mismo tipo de dato que el array'));
                    return { value: null, type: type_1.type.NULL };
                }
                return_data.value.body.push(this.parameter);
                return { value: parameter_data.value, type: parameter_data.type };
        }
        // Default
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") While (" + this.id + "," + this.option + ")\"];";
        const this_count = count;
        const child_list = [this.parameter];
        for (const instr of child_list) {
            if (instr != null) {
                try {
                    result += "node" + this_count + " -> " + "node" + count + "1;";
                    result += instr.plot(Number(count + "1"));
                    count++;
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
        return result;
    }
}
exports.array_native_function = array_native_function;

},{"../abstract/instruction":5,"../literal/_array":46,"../system/error":55,"../system/type":56}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignation_array = void 0;
const instruction_1 = require("../abstract/instruction");
const _array_1 = require("../literal/_array");
const console_1 = require("../system/console");
const error_1 = require("../system/error");
const type_1 = require("../system/type");
class assignation_array extends instruction_1.instruction {
    constructor(id, dimensions, expr, line, column) {
        super(line, column);
        this.id = id;
        this.dimensions = dimensions;
        this.expr = expr;
    }
    translate(environment) {
        let return_data = environment.get_variable_recursive(this.id, environment);
        this.expr.translate(environment);
        let exprTemp = console_1._3dCode.actualTemp;
        let tempList = [];
        if (return_data.type != type_1.type.UNDEFINED) {
            if (return_data.value instanceof _array_1._array) {
                for (let dimension of this.dimensions) {
                    dimension.translate(environment);
                    tempList.push(console_1._3dCode.actualTemp);
                }
                console_1._3dCode.actualTemp++;
                let uno = console_1._3dCode.actualTemp;
                console_1._3dCode.actualTemp++;
                let dos = console_1._3dCode.actualTemp;
                for (let i = 0; i < tempList.length; i++) {
                    if (i == 0)
                        console_1._3dCode.output += 'T' + uno + ' = T' + tempList[i] + ';\n';
                    else {
                        console_1._3dCode.output += 'T' + dos + ' = T' + uno + ' * ' + return_data.value.dimensionSize.get(i) + ';\n';
                        console_1._3dCode.output += 'T' + uno + ' = T' + dos + ' + T' + tempList[i] + ';\n';
                    }
                }
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + ' + environment.get_relative_recursive(this.id, environment) + ';//Set array initial position\n';
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = T' + console_1._3dCode.actualTemp + ' + T' + uno + ';//Add index\n';
                console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + ']' + ' = T' + exprTemp + ';//Get value\n';
            }
            else {
            }
        }
        else {
        }
        return type_1.type.NULL;
    }
    execute(environment) {
        const expr_data = this.expr.execute(environment);
        // validate that exists
        let saved_variable = environment.get_variable(this.id);
        if (saved_variable.type != type_1.type.UNDEFINED) {
            // 
            if (saved_variable.value instanceof _array_1._array) {
                if (this.dimensions.length == 0) {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Numero de dimensiones no validas para el array'));
                }
                // validate that the array have the correct dimensions
                if (!saved_variable.value.check_dimensions_number(this.dimensions)) {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Numero de dimensiones no validas para el array'));
                    return { value: null, type: type_1.type.NULL };
                }
                // and each have the correct length
                if (!saved_variable.value.check_dimensions_length(this.dimensions, environment)) {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Index no valido'));
                    return { value: null, type: type_1.type.NULL };
                }
                // validate the type
                if (saved_variable.type == expr_data.type) {
                    // change the data in the array
                    if (!saved_variable.value.assign_value(this.dimensions, environment, this.expr)) {
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Error al asignar valor al array'));
                    }
                }
                else {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Tipo diferente, no se puede asignar'));
                }
            }
        }
        else {
            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Variable no inicializada'));
        }
        // Default
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Assignacion de Array\"];";
        const this_count = count;
        const child_list = [this.expr];
        for (const instr of child_list) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        for (const instr of this.dimensions) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports.assignation_array = assignation_array;

},{"../abstract/instruction":5,"../literal/_array":46,"../system/console":53,"../system/error":55,"../system/type":56}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignation_unary = void 0;
const instruction_1 = require("../abstract/instruction");
const console_1 = require("../system/console");
const error_1 = require("../system/error");
const type_1 = require("../system/type");
class assignation_unary extends instruction_1.instruction {
    constructor(id, expr, line, column) {
        super(line, column);
        this.id = id;
        this.expr = expr;
    }
    translate(environment) {
        const exprType = this.expr.translate(environment);
        let exprTemp = console_1._3dCode.actualTemp;
        // validate that exists
        let saved_variable = environment.get_variable_recursive(this.id, environment);
        let relativePos = environment.get_relative_recursive(this.id, environment);
        if (saved_variable.type != type_1.type.UNDEFINED) {
            // validate the type
            if (saved_variable.type == exprType) {
                // assign the value
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + ' + relativePos + ';\n';
                console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + exprTemp + ';//Update value for variable ' + this.id + '\n';
            }
            else {
            }
        }
        else {
        }
        // Default
        return type_1.type.NULL;
    }
    execute(environment) {
        const expr_data = this.expr.execute(environment);
        // validate that exists
        let saved_variable = environment.get_variable(this.id);
        if (saved_variable.type != type_1.type.UNDEFINED) {
            // validate the type
            if (saved_variable.type == expr_data.type) {
                // assign the value
                let absolutePos = 0;
                let relativePos = 0;
                let size = 0;
                environment.save_variable(this.id, expr_data, absolutePos, relativePos, size);
            }
            else {
                error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Tipo diferente, no se puede asignar'));
            }
        }
        else {
            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Variable no inicializada'));
        }
        // Default
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Assignacion Unaria (" + this.id + ")\"];";
        const this_count = count;
        const child_list = [this.expr];
        for (const instr of child_list) {
            if (instr != null) {
                try {
                    result += "node" + this_count + " -> " + "node" + count + "1;";
                    result += instr.plot(Number(count + "1"));
                    count++;
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
        return result;
    }
}
exports.assignation_unary = assignation_unary;

},{"../abstract/instruction":5,"../system/console":53,"../system/error":55,"../system/type":56}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.call = void 0;
const environment_1 = require("../system/environment");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const instruction_1 = require("../abstract/instruction");
const error_1 = require("../system/error");
const _return_1 = require("./_return");
class call extends instruction_1.instruction {
    constructor(id, parameters, line, column) {
        super(line, column);
        this.id = id;
        this.parameters = parameters;
    }
    translate(environment) {
        // the new environment to execute
        // Obtain the function
        let function_to_execute = environment.get_function_recursive(this.id, environment);
        let functionType = environment.get_variable_recursive(this.id, environment);
        let parameterTemp;
        console_1._3dCode.actualTemp++;
        let positionTemp = console_1._3dCode.actualTemp;
        let valueTemps = [];
        for (let index = 0; index < this.parameters.length; index++) {
            const call_parameter = this.parameters[index];
            call_parameter.translate(environment);
            parameterTemp = console_1._3dCode.actualTemp;
            valueTemps.push(parameterTemp);
        }
        console_1._3dCode.output += 'SP = SP + ' + console_1._3dCode.relativePos + ';//Set SP at the end\n';
        for (let index = 0; index < this.parameters.length; index++) {
            console_1._3dCode.output += 'T' + positionTemp + ' = SP + ' + (index + 1) + ';\n';
            console_1._3dCode.output += 'STACK[(int)T' + positionTemp + '] = T' + valueTemps[index] + ';//Save parameter\n';
        }
        console_1._3dCode.output += this.id + '();//Call function ' + this.id + '\n';
        console_1._3dCode.actualTemp++;
        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 0;//Set return position\n';
        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + console_1._3dCode.actualTemp + '];//Get return value\n';
        console_1._3dCode.output += 'SP = SP - ' + console_1._3dCode.relativePos + ';//Get SP back\n';
        console.log(functionType.type);
        return type_1.type.INTEGER;
    }
    execute(current_environment) {
        // the new environment to execute
        const new_environment = new environment_1.environment(current_environment);
        // Obtain the function
        let function_to_execute = current_environment.get_function(this.id);
        if (function_to_execute != null) {
            // check the type of the parameters to save them in a new environment
            if (this.parameters.length == function_to_execute.parameters.length) {
                for (let index = 0; index < this.parameters.length; index++) {
                    const call_parameter = this.parameters[index];
                    const call_parameter_data = call_parameter.execute(current_environment);
                    if (call_parameter_data.type == function_to_execute.parameters[index].native_type) {
                        new_environment.save_variable(function_to_execute.parameters[index].id, call_parameter_data, 0, 0, 0);
                    }
                    else {
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Tipo de parametro incorrecto'));
                    }
                }
                // execute the code in the new environmet
                let return_data = { value: null, type: type_1.type.NULL };
                function_to_execute.code.forEach(instr => {
                    if (instr instanceof _return_1._return) {
                        return_data = instr.execute(new_environment);
                        return;
                    }
                    else {
                        instr.execute(new_environment);
                    }
                });
                // If the type is different to void check the return
                if ((function_to_execute.native_type != type_1.type.VOID && function_to_execute.native_type != return_data.type)
                    || (function_to_execute.native_type == type_1.type.VOID && type_1.type.NULL != return_data.type)) {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Return de tipo incorrecto'));
                }
                else {
                    return return_data;
                }
            }
            else {
                error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Numero de parametros incorrecto'));
            }
        }
        else {
            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'La funcion no existe: ' + this.id));
        }
        // Default
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Llamada (" + this.id + ")\"];";
        const this_count = count;
        for (const instr of this.parameters) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports.call = call;

},{"../abstract/instruction":5,"../system/console":53,"../system/environment":54,"../system/error":55,"../system/type":56,"./_return":26}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.declaration_array = void 0;
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const instruction_1 = require("../abstract/instruction");
const _array_1 = require("../literal/_array");
const variable_id_1 = require("../literal/variable_id");
class declaration_array extends instruction_1.instruction {
    constructor(type, variable_id, value, line, column) {
        super(line, column);
        this.type = type;
        this.variable_id = variable_id;
        this.value = value;
    }
    translate(environment) {
        if (this.value == null) {
            if (environment.get_variable_recursive(this.variable_id, environment).type != type_1.type.UNDEFINED) {
            }
            else {
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += '//Array ' + this.variable_id + ' will be stored in stack, start position: ' + console_1._3dCode.relativePos + ' of this context\n';
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + ' + console_1._3dCode.relativePos + ';\n';
                console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = 0;\n';
                //Size is 0 because its just declaration without assignation of values
                environment.save_variable(this.variable_id, { value: this.value, type: this.type }, console_1._3dCode.absolutePos, console_1._3dCode.relativePos, 0);
                console_1._3dCode.absolutePos++;
                console_1._3dCode.relativePos++;
            }
        }
        else if (this.value instanceof _array_1._array) {
            console_1._3dCode.output += '//Array ' + this.variable_id + ' will be stored in stack, start position: ' + console_1._3dCode.relativePos + ' of this context\n';
            environment.save_variable(this.variable_id, { value: this.value, type: this.type }, console_1._3dCode.absolutePos, console_1._3dCode.relativePos, this.value.body.length);
            this.value.translateElements(environment, 0);
        }
        else if (this.value instanceof variable_id_1.variable_id) {
        }
        // Default
        return type_1.type.NULL;
    }
    execute(environment) {
        // if is undefined save the variable with the type declared
        if (this.value == null) {
            // Save the variable 
            if (environment.get_variable(this.variable_id).type != type_1.type.UNDEFINED) {
                error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Variable ya inicializada: ' + this.variable_id));
            }
            else {
                environment.save_variable(this.variable_id, { value: this.value, type: this.type }, 0, 0, 0);
            }
        }
        // if the save variable has an expression check types
        else if (this.value instanceof _array_1._array) {
            // Checking both types
            let checked = this.value.checkType(this.type, environment);
            // if checked type save the variable
            if (!checked) {
                error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede iniciar con distinto tipo de dato para: ' + this.variable_id));
            }
            else {
                // Save the variable 
                if (environment.get_variable(this.variable_id).type != type_1.type.UNDEFINED) {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Variable ya inicializada: ' + this.variable_id));
                }
                else {
                    environment.save_variable(this.variable_id, { value: this.value, type: this.type }, 0, 0, 0);
                }
            }
        }
        // copying one array to another
        else if (this.value instanceof variable_id_1.variable_id) {
            let obtained_array_data = this.value.execute(environment);
            if (obtained_array_data.value instanceof _array_1._array) {
                let checked = obtained_array_data.value.checkType(this.type, environment);
                // if checked type copy the array
                if (!checked) {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede iniciar con distinto tipo de dato para: ' + this.variable_id));
                }
                else {
                    // Save the variable 
                    if (environment.get_variable(this.variable_id).type != type_1.type.UNDEFINED) {
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Variable ya inicializada: ' + this.variable_id));
                    }
                    else {
                        // copy the entire object
                        const new_array = obtained_array_data.value;
                        environment.save_variable(this.variable_id, { value: new_array, type: this.type }, 0, 0, 0);
                    }
                }
            }
            else {
                error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede copiar si no es un array'));
            }
        }
        // Default
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Declaracion de Array (" + this.variable_id + "," + type_1.type[this.type] + ")\"];";
        const this_count = count;
        const child_list = [this.value];
        for (const instr of child_list) {
            if (instr != null) {
                try {
                    result += "node" + this_count + " -> " + "node" + count + "1;";
                    result += instr.plot(Number(count + "1"));
                    count++;
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
        return result;
    }
}
exports.declaration_array = declaration_array;

},{"../abstract/instruction":5,"../literal/_array":46,"../literal/variable_id":50,"../system/console":53,"../system/error":55,"../system/type":56}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.declaration_function = void 0;
const environment_1 = require("../system/environment");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const instruction_1 = require("../abstract/instruction");
const _return_1 = require("./_return");
class declaration_function extends instruction_1.instruction {
    constructor(native_type, id, parameters, code, line, column) {
        super(line, column);
        this.native_type = native_type;
        this.id = id;
        this.parameters = parameters;
        this.code = code;
        this.functionEnvironment = new environment_1.environment(null);
    }
    translate(env) {
        let return_data;
        let paramName;
        this.functionEnvironment = new environment_1.environment(env);
        const savedPreviousCode = console_1._3dCode.output;
        console_1._3dCode.output = '';
        switch (this.native_type) {
            case type_1.type.INTEGER:
            case type_1.type.STRING:
            case type_1.type.CHAR:
            case type_1.type.BOOLEAN:
            case type_1.type.FLOAT:
            default:
                console_1._3dCode.output += 'void ' + this.id + '(){\n';
                break;
        }
        let size = 0;
        console_1._3dCode.actualTemp++;
        const savedRelative = console_1._3dCode.relativePos;
        console_1._3dCode.relativePos = 0;
        env.save_variable(this.id, { value: null, type: this.native_type }, console_1._3dCode.absolutePos, console_1._3dCode.absolutePos, size);
        this.functionEnvironment.save_variable('return', { value: null, type: this.native_type }, console_1._3dCode.absolutePos, console_1._3dCode.relativePos, 1);
        console_1._3dCode.relativePos++;
        console_1._3dCode.absolutePos++;
        size++;
        this.parameters.forEach(param => {
            return_data = param.execute(this.functionEnvironment);
            paramName = return_data.value;
            this.functionEnvironment.save_variable(paramName, return_data, console_1._3dCode.absolutePos, console_1._3dCode.relativePos, 1);
            console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + ' + console_1._3dCode.relativePos + ';//Setting position for parameter ' + paramName + '\n';
            console_1._3dCode.relativePos++;
            console_1._3dCode.absolutePos++;
            size++;
        });
        this.code.forEach(instr => {
            if (instr instanceof _return_1._return) {
                return_data = instr.translate(this.functionEnvironment);
                return;
            }
            else {
                instr.translate(this.functionEnvironment);
            }
        });
        console_1._3dCode.relativePos = savedRelative;
        console_1._3dCode.output += 'return;\n';
        console_1._3dCode.output += '}\n\n';
        console_1._3dCode.functionsCode += console_1._3dCode.output;
        console_1._3dCode.output = savedPreviousCode;
        return type_1.type.NULL;
    }
    execute(environment) {
        environment.save_function(this.id, this, 0, 0, 0);
        // Default
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Declaracion de Funcion (" + this.id + "," + type_1.type[this.native_type] + ")\"];";
        const this_count = count;
        const arr_list = [this.parameters, this.code];
        for (const instr_arr of arr_list) {
            for (const instr of instr_arr) {
                try {
                    result += "node" + this_count + " -> " + "node" + count + "1;";
                    result += instr.plot(Number(count + "1"));
                    count++;
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
        return result;
    }
}
exports.declaration_function = declaration_function;

},{"../abstract/instruction":5,"../system/console":53,"../system/environment":54,"../system/type":56,"./_return":26}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.declaration_item = void 0;
const expression_1 = require("../abstract/expression");
const type_1 = require("../system/type");
const literal_1 = require("../abstract/literal");
const instruction_1 = require("../abstract/instruction");
class declaration_item extends instruction_1.instruction {
    constructor(variable_id, value, line, column) {
        super(line, column);
        this.variable_id = variable_id;
        this.value = value;
    }
    translate(environment) {
        if (this.value != null) {
            let valueType = this.value.translate(environment);
            return valueType;
        }
        else {
        }
        return type_1.type.NULL;
    }
    execute(environment) {
        // If value is different to null then we need to operate the expresion
        let value_data = { value: null, type: type_1.type.NULL };
        if (this.value instanceof expression_1.expression || this.value instanceof literal_1.literal) {
            value_data = this.value.execute(environment);
        }
        return value_data;
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Declaracion de Item (" + this.variable_id + ")\"];";
        const this_count = count;
        const child_list = [this.value];
        for (const instr of child_list) {
            if (instr != null) {
                try {
                    result += "node" + this_count + " -> " + "node" + count + "1;";
                    result += instr.plot(Number(count + "1"));
                    count++;
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
        return result;
    }
}
exports.declaration_item = declaration_item;

},{"../abstract/expression":4,"../abstract/instruction":5,"../abstract/literal":6,"../system/type":56}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.declaration_list = void 0;
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const instruction_1 = require("../abstract/instruction");
class declaration_list extends instruction_1.instruction {
    constructor(native_type, declare_list, line, column) {
        super(line, column);
        this.native_type = native_type;
        this.declare_list = declare_list;
    }
    translate(environment) {
        let tData = { value: null, type: type_1.type.NULL };
        this.declare_list.forEach(item => {
            let itemType = item.translate(environment);
            let itemTemp = console_1._3dCode.actualTemp;
            tData.type = itemType;
            if (itemType == type_1.type.NULL) {
                if (environment.get_variable(item.variable_id).value != null) {
                }
                else {
                    if (environment.previous == null) {
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = ' + console_1._3dCode.relativePos + ';\n';
                        console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = 0;//Save variable ' + item.variable_id + '\n';
                        environment.save_variable(item.variable_id, { value: tData.value, type: this.native_type }, console_1._3dCode.absolutePos, console_1._3dCode.relativePos, 1);
                        console_1._3dCode.absolutePos++;
                        console_1._3dCode.relativePos++;
                    }
                    else {
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + ' + console_1._3dCode.relativePos + ';\n';
                        console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = 0;//Save variable ' + item.variable_id + '\n';
                        environment.save_variable(item.variable_id, { value: tData.value, type: this.native_type }, console_1._3dCode.absolutePos, console_1._3dCode.relativePos, 1);
                        console_1._3dCode.absolutePos++;
                        console_1._3dCode.relativePos++;
                    }
                }
                return this.native_type;
            }
            else {
                let checked = false;
                if (itemType == this.native_type) {
                    checked = true;
                }
                if (!checked) {
                }
                else {
                    if (environment.get_variable(item.variable_id).value != null) {
                    }
                    else {
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + ' + console_1._3dCode.relativePos + ';\n';
                        console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + itemTemp + ';//Save variable ' + item.variable_id + '\n';
                        environment.save_variable(item.variable_id, tData, console_1._3dCode.absolutePos, console_1._3dCode.relativePos, 1);
                        console_1._3dCode.absolutePos++;
                        console_1._3dCode.relativePos++;
                    }
                }
            }
        });
        // Default
        return type_1.type.NULL;
    }
    add_to_list(item) {
        this.declare_list.push(item);
    }
    execute(environment) {
        this.declare_list.forEach(item => {
            let item_data = item.execute(environment);
            // if is equal null save the variable with the type declared
            if (item_data.type == type_1.type.NULL) {
                // Save the variable 
                if (environment.get_variable(item.variable_id).type != type_1.type.UNDEFINED) {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Variable ya inicializada: ' + item.variable_id));
                }
                else {
                    environment.save_variable(item.variable_id, item_data, console_1._console.absolutePos, console_1._console.relativePos, 1);
                    console_1._console.absolutePos++;
                    console_1._console.relativePos++;
                }
                return;
            }
            // if the save variable has an expression check types
            else {
                // Checking both types
                let checked = false;
                if (item_data.type == this.native_type) {
                    checked = true;
                }
                // if checked type save the variable
                if (!checked) {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede iniciar con distinto tipo de dato para: ' + item.variable_id));
                }
                else {
                    // Save the variable 
                    if (environment.get_variable(item.variable_id).type != type_1.type.UNDEFINED) {
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Variable ya inicializada: ' + item.variable_id));
                    }
                    else {
                        environment.save_variable(item.variable_id, item_data, console_1._console.absolutePos, console_1._console.relativePos, 1);
                        console_1._console.absolutePos++;
                        console_1._console.relativePos++;
                    }
                }
            }
        });
        // Default
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Lista de Declaraciones (" + type_1.type[this.native_type] + ")\"];";
        const this_count = count;
        const arr_list = [this.declare_list];
        for (const instr_arr of arr_list) {
            for (const instr of instr_arr) {
                try {
                    result += "node" + this_count + " -> " + "node" + count + "1;";
                    result += instr.plot(Number(count + "1"));
                    count++;
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
        return result;
    }
}
exports.declaration_list = declaration_list;

},{"../abstract/instruction":5,"../system/console":53,"../system/error":55,"../system/type":56}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.declaration_struct = void 0;
const expression_1 = require("../abstract/expression");
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const literal_1 = require("../abstract/literal");
const instruction_1 = require("../abstract/instruction");
const _struct_1 = require("../literal/_struct");
class declaration_struct extends instruction_1.instruction {
    constructor(variable_id, value, line, column) {
        super(line, column);
        this.variable_id = variable_id;
        this.value = value;
    }
    translate(environment) {
        if (this.value instanceof expression_1.expression || this.value instanceof literal_1.literal) {
            let valueType = this.value.translate(environment);
            return valueType;
        }
        else {
        }
        return type_1.type.NULL;
    }
    execute(environment) {
        // Save the variable 
        if (environment.get_variable(this.variable_id).type != type_1.type.UNDEFINED) {
            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Variable ya inicializada: ' + this.variable_id));
        }
        else {
            environment.save_variable(this.variable_id, { value: new _struct_1._struct(this.value, this.line, this.column), type: type_1.type.STRUCT }, 0, 0, 0);
        }
        // Default
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Lista de Declaraciones (" + this.variable_id + ")\"];";
        const this_count = count;
        const arr_list = [this.value];
        for (const instr_arr of arr_list) {
            for (const instr of instr_arr) {
                try {
                    result += "node" + this_count + " -> " + "node" + count + "1;";
                    result += instr.plot(Number(count + "1"));
                    count++;
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
        return result;
    }
}
exports.declaration_struct = declaration_struct;

},{"../abstract/expression":4,"../abstract/instruction":5,"../abstract/literal":6,"../literal/_struct":47,"../system/error":55,"../system/type":56}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.declaration_struct_item = void 0;
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const instruction_1 = require("../abstract/instruction");
const _struct_1 = require("../literal/_struct");
const struct_item_1 = require("../literal/struct_item");
class declaration_struct_item extends instruction_1.instruction {
    constructor(struct_id_array, variable_id, parameters, line, column) {
        super(line, column);
        this.struct_id_array = struct_id_array;
        this.variable_id = variable_id;
        this.parameters = parameters;
    }
    translate(environment) {
        return type_1.type.NULL;
    }
    execute(environment) {
        // check the struct types
        if (this.struct_id_array[0] != this.struct_id_array[1]) {
            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede inicializar con diferente tipo de struct'));
            return { value: null, type: type_1.type.NULL };
        }
        // obtain struct definition
        let struct_definition = environment.get_variable(this.struct_id_array[0]);
        if (struct_definition.type != type_1.type.STRUCT) {
            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Struct no definido'));
            return { value: null, type: type_1.type.NULL };
        }
        // verify that have the correct number and correct type of parameter
        if (struct_definition.value instanceof _struct_1._struct) {
            // validate that the array have the correct number of parameters
            if (!struct_definition.value.check_length(this.parameters)) {
                error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Numero de parametros no validas para el array'));
                return { value: null, type: type_1.type.NULL };
            }
            // and each have the correct types
            if (!struct_definition.value.check_types(this.parameters, environment)) {
                error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Parametro de tipo no valido'));
                return { value: null, type: type_1.type.NULL };
            }
            // Save the variable 
            if (environment.get_variable(this.variable_id).type != type_1.type.UNDEFINED) {
                error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Variable ya inicializada: ' + this.variable_id));
                return { value: null, type: type_1.type.NULL };
            }
            else {
                environment.save_variable(this.variable_id, { value: new struct_item_1.struct_item(this.parameters, this.struct_id_array[0], this.line, this.column), type: type_1.type.STRUCT_ITEM }, 0, 0, 0);
            }
        }
        // create a new variable with this type of struct
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Lista de Declaraciones (" + this.variable_id + ")\"];";
        const this_count = count;
        for (const str of this.struct_id_array) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += "node" + Number(count + "1") + "[label=\"(" + this.line + "," + this.column + ") Declaracion (" + str + ")\"];";
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        const arr_list = [this.parameters];
        for (const instr_arr of arr_list) {
            for (const instr of instr_arr) {
                try {
                    result += "node" + this_count + " -> " + "node" + count + "1;";
                    result += instr.plot(Number(count + "1"));
                    count++;
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
        return result;
    }
}
exports.declaration_struct_item = declaration_struct_item;

},{"../abstract/instruction":5,"../literal/_struct":47,"../literal/struct_item":49,"../system/error":55,"../system/type":56}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const environment_1 = require("../system/environment");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const instruction_1 = require("../abstract/instruction");
class main extends instruction_1.instruction {
    constructor(code, line, column) {
        super(line, column);
        this.code = code;
    }
    translate(current_environment) {
        console_1._3dCode.output = 'void main(){\n' + 'SP = ' + console_1._3dCode.absolutePos + ';\n' + 'mainStart = ' + console_1._3dCode.absolutePos + ';\n' + console_1._3dCode.output;
        let main_environment = new environment_1.environment(current_environment);
        this.code.forEach(element => {
            element.translate(main_environment);
        });
        console_1._3dCode.output += 'return;\n';
        console_1._3dCode.output += '}\n';
        return type_1.type.NULL;
    }
    execute(environment) {
        this.code.forEach(element => {
            element.execute(environment);
        });
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Main\"];";
        const this_count = count;
        for (const instr of this.code) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports.main = main;

},{"../abstract/instruction":5,"../system/console":53,"../system/environment":54,"../system/type":56}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.native_function = void 0;
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const instruction_1 = require("../abstract/instruction");
class native_function extends instruction_1.instruction {
    constructor(option, value, line, column) {
        super(line, column);
        this.option = option;
        this.value = value;
    }
    translate(environment) {
        let dataType = this.value.translate(environment);
        const dataTemp = console_1._3dCode.actualTemp;
        let savedEnvironment = 0;
        let resultTemp = 0;
        let numero = 0;
        let entero = 0;
        let flotante = 0;
        switch (this.option) {
            case "toInt":
                if (dataType == type_1.type.FLOAT) {
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = (int)T' + dataTemp + ';//Change value to int\n';
                    return type_1.type.INTEGER;
                }
                else if (dataType == type_1.type.STRING) {
                    console_1._3dCode.actualTemp++;
                    savedEnvironment = console_1._3dCode.actualTemp;
                    console_1._3dCode.output += 'T' + savedEnvironment + ' = SP;//Save environment\n';
                    console_1._3dCode.output += 'SP = 29;//Set StringToInt environment\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 1;//Set string position\n';
                    console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + dataTemp + ';//Save string\n';
                    console_1._3dCode.output += 'StringToInt();//Call function\n';
                    console_1._3dCode.actualTemp++;
                    resultTemp = console_1._3dCode.actualTemp;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 0;//Set return position\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + resultTemp + '];//Get return value\n';
                    console_1._3dCode.output += 'SP = T' + savedEnvironment + ';//Recover environment\n';
                    return type_1.type.INTEGER;
                }
            case "toDouble":
                if (dataType == type_1.type.INTEGER) {
                    return type_1.type.FLOAT;
                }
                else if (dataType == type_1.type.STRING) {
                    console_1._3dCode.actualTemp++;
                    savedEnvironment = console_1._3dCode.actualTemp;
                    console_1._3dCode.output += 'T' + savedEnvironment + ' = SP;//Save environment\n';
                    console_1._3dCode.output += 'SP = 29;//Set StringToInt environment\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 1;//Set string position\n';
                    console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + dataTemp + ';//Save string\n';
                    console_1._3dCode.output += 'StringToFloat();//Call function\n';
                    console_1._3dCode.actualTemp++;
                    resultTemp = console_1._3dCode.actualTemp;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 0;//Set return position\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + resultTemp + '];//Get return value\n';
                    console_1._3dCode.output += 'SP = T' + savedEnvironment + ';//Recover environment\n';
                    return type_1.type.FLOAT;
                }
            case "string":
                console_1._3dCode.actualTemp++;
                savedEnvironment = console_1._3dCode.actualTemp;
                if (dataType == type_1.type.FLOAT) {
                    console_1._3dCode.actualTemp++;
                    numero = console_1._3dCode.actualTemp;
                    console_1._3dCode.actualTemp++;
                    entero = console_1._3dCode.actualTemp;
                    console_1._3dCode.actualTemp++;
                    flotante = console_1._3dCode.actualTemp;
                    console_1._3dCode.output += 'T' + numero + ' = T' + dataTemp + ';//Get value\n';
                    console_1._3dCode.output += 'T' + entero + ' = (int)T' + numero + ';//Get integer part\n';
                    console_1._3dCode.output += 'T' + flotante + ' = T' + numero + ' - T' + entero + ';//Get float part\n';
                    console_1._3dCode.output += 'T' + flotante + ' = T' + flotante + ' * 100000000;//Get float as integer\n';
                    console_1._3dCode.output += 'T' + savedEnvironment + ' = SP;//Save environment\n';
                    console_1._3dCode.output += 'SP = 33;//Set floatToString environment\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 1;//Set integer part position\n';
                    console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + entero + ';//Save integer part\n';
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 2;//Set float part position\n';
                    console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + flotante + ';//Save float part\n';
                    console_1._3dCode.output += 'floatToString();//Call function\n';
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 0;//Set return position\n';
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + console_1._3dCode.actualTemp + '];//Get return value\n';
                    console_1._3dCode.output += 'SP = T' + savedEnvironment + ';//Get environment back\n';
                    return type_1.type.STRING;
                }
                else if (dataType == type_1.type.INTEGER) {
                    console_1._3dCode.actualTemp++;
                    numero = console_1._3dCode.actualTemp;
                    console_1._3dCode.output += 'T' + numero + ' = T' + dataTemp + ';//Get value\n';
                    console_1._3dCode.output += 'T' + savedEnvironment + ' = SP;//Save environment\n';
                    console_1._3dCode.output += 'SP = 14;//Set intToString environment\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 1;//Set position\n';
                    console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + numero + ';//Save value\n';
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = HP;//Save start position of string\n';
                    console_1._3dCode.output += 'intToString();//Call function\n';
                    console_1._3dCode.output += 'SP = T' + savedEnvironment + ';//Get environment back\n';
                    return type_1.type.STRING;
                }
                else if (dataType == type_1.type.CHAR) {
                    return type_1.type.CHAR;
                }
                return type_1.type.STRING;
            case "typeof":
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + savedEnvironment + ' = SP;//Save environment\n';
                console_1._3dCode.output += 'SP = 27;//Set StringConcat environment\n';
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 1;//Set number position\n';
                switch (dataType) {
                    case type_1.type.STRING:
                        console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = 0;//Save number\n';
                        break;
                    case type_1.type.INTEGER:
                        console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = 1;//Save number\n';
                        break;
                    case type_1.type.FLOAT:
                        console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = 2;//Save number\n';
                        break;
                    case type_1.type.CHAR:
                        console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = 3;//Save number\n';
                        break;
                    case type_1.type.BOOLEAN:
                        console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = 4;//Save number\n';
                        break;
                    case type_1.type.NULL:
                        console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = 6;//Save number\n';
                        break;
                    default:
                        console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = 5;//Save number\n';
                        break;
                }
                console_1._3dCode.output += 'getTypeOf();//Call function\n';
                console_1._3dCode.actualTemp++;
                resultTemp = console_1._3dCode.actualTemp;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 0;//Set return position\n';
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + resultTemp + '];//Get return value\n';
                console_1._3dCode.output += 'SP = T' + savedEnvironment + ';//Recover environment\n';
                return type_1.type.STRING;
        }
        return type_1.type.NULL;
    }
    execute(environment) {
        let value_data = this.value.execute(environment);
        switch (this.option) {
            case "toInt":
                try {
                    return { value: parseInt(value_data.value), type: type_1.type.INTEGER };
                }
                catch (e) {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede parsear a int el valor ' + value_data.value));
                }
            case "toDouble":
                try {
                    return { value: parseFloat(value_data.value), type: type_1.type.FLOAT };
                }
                catch (e) {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede parsear a double el valor ' + value_data.value));
                }
            case "string":
                try {
                    return { value: String(value_data.value), type: type_1.type.STRING };
                }
                catch (e) {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede parsear a string el valor ' + value_data.value));
                }
            case "typeof":
                return { value: type_1.type[value_data.type], type: type_1.type.STRING };
        }
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Funcion Nativa (" + this.option + ")\"];";
        const this_count = count;
        const child_list = [this.value];
        for (const instr of child_list) {
            if (instr != null) {
                try {
                    result += "node" + this_count + " -> " + "node" + count + "1;";
                    result += instr.plot(Number(count + "1"));
                    count++;
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
        return result;
    }
}
exports.native_function = native_function;

},{"../abstract/instruction":5,"../system/console":53,"../system/error":55,"../system/type":56}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.native_parse = void 0;
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const instruction_1 = require("../abstract/instruction");
class native_parse extends instruction_1.instruction {
    constructor(native_type, value, line, column) {
        super(line, column);
        this.native_type = native_type;
        this.value = value;
    }
    translate(environment) {
        const dataType = this.value.translate(environment);
        const dataTemp = console_1._3dCode.actualTemp;
        let savedEnvironment = 0;
        let resultTemp = 0;
        switch (this.native_type) {
            case type_1.type.INTEGER:
                console_1._3dCode.actualTemp++;
                savedEnvironment = console_1._3dCode.actualTemp;
                console_1._3dCode.output += 'T' + savedEnvironment + ' = SP;//Save environment\n';
                console_1._3dCode.output += 'SP = 29;//Set StringToInt environment\n';
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 1;//Set string position\n';
                console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + dataTemp + ';//Save string\n';
                console_1._3dCode.output += 'StringToInt();//Call function\n';
                console_1._3dCode.actualTemp++;
                resultTemp = console_1._3dCode.actualTemp;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 0;//Set return position\n';
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + resultTemp + '];//Get return value\n';
                console_1._3dCode.output += 'SP = T' + savedEnvironment + ';//Recover environment\n';
                return type_1.type.INTEGER;
            case type_1.type.FLOAT:
                console_1._3dCode.actualTemp++;
                savedEnvironment = console_1._3dCode.actualTemp;
                console_1._3dCode.output += 'T' + savedEnvironment + ' = SP;//Save environment\n';
                console_1._3dCode.output += 'SP = 29;//Set StringToInt environment\n';
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 1;//Set string position\n';
                console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + dataTemp + ';//Save string\n';
                console_1._3dCode.output += 'StringToFloat();//Call function\n';
                console_1._3dCode.actualTemp++;
                resultTemp = console_1._3dCode.actualTemp;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + 0;//Set return position\n';
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + resultTemp + '];//Get return value\n';
                console_1._3dCode.output += 'SP = T' + savedEnvironment + ';//Recover environment\n';
                return type_1.type.FLOAT;
            case type_1.type.BOOLEAN:
                console_1._3dCode.actualTag++;
                const trueTag = console_1._3dCode.actualTag;
                console_1._3dCode.actualTag++;
                const falseTag = console_1._3dCode.actualTag;
                console_1._3dCode.actualTag++;
                const exitTag = console_1._3dCode.actualTag;
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + '= HEAP[(int)T' + dataTemp + '];//Get character\n';
                console_1._3dCode.output += 'if(T' + console_1._3dCode.actualTemp + ' == 48) goto L' + trueTag + ';//Check if 0\n';
                console_1._3dCode.output += 'goto L' + falseTag + ';\n';
                console_1._3dCode.output += 'L' + trueTag + '://True tag\n';
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = 0;\n';
                console_1._3dCode.output += 'goto L' + exitTag + ';\n';
                console_1._3dCode.output += 'L' + falseTag + '://False tag\n';
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = 1;\n';
                console_1._3dCode.output += 'goto L' + exitTag + ';\n';
                console_1._3dCode.output += 'L' + exitTag + ':\n';
                return type_1.type.BOOLEAN;
        }
        return type_1.type.NULL;
    }
    execute(environment) {
        let value_data = this.value.execute(environment);
        switch (this.native_type) {
            case type_1.type.INTEGER:
                try {
                    return { value: parseInt(value_data.value), type: type_1.type.INTEGER };
                }
                catch (e) {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede parsear a int el valor ' + value_data.value));
                }
            case type_1.type.FLOAT:
                try {
                    return { value: parseFloat(value_data.value), type: type_1.type.FLOAT };
                }
                catch (e) {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede parsear a double el valor ' + value_data.value));
                }
            case type_1.type.BOOLEAN:
                try {
                    return { value: Boolean(value_data.value), type: type_1.type.BOOLEAN };
                }
                catch (e) {
                    error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede parsear a boolean el valor ' + value_data.value));
                }
        }
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Parse (" + type_1.type[this.native_type] + ")\"];";
        const this_count = count;
        const child_list = [this.value];
        for (const instr of child_list) {
            if (instr != null) {
                try {
                    result += "node" + this_count + " -> " + "node" + count + "1;";
                    result += instr.plot(Number(count + "1"));
                    count++;
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
        return result;
    }
}
exports.native_parse = native_parse;

},{"../abstract/instruction":5,"../system/console":53,"../system/error":55,"../system/type":56}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.print = exports.print_type = void 0;
const instruction_1 = require("../abstract/instruction");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const _array_1 = require("../literal/_array");
const struct_item_1 = require("../literal/struct_item");
var print_type;
(function (print_type) {
    print_type[print_type["PRINT"] = 0] = "PRINT";
    print_type[print_type["PRINTLN"] = 1] = "PRINTLN";
})(print_type = exports.print_type || (exports.print_type = {}));
class print extends instruction_1.instruction {
    constructor(expresions, type, line, column) {
        super(line, column);
        this.expresions = expresions;
        this.type = type;
    }
    translate(environment) {
        this.expresions.forEach(element => {
            const elementType = element.translate(environment);
            switch (elementType) {
                case type_1.type.BOOLEAN:
                    console_1._3dCode.actualTag++;
                    const trueTag = console_1._3dCode.actualTag;
                    console_1._3dCode.actualTag++;
                    const falseTag = console_1._3dCode.actualTag;
                    console_1._3dCode.actualTag++;
                    const exitTag = console_1._3dCode.actualTag;
                    console_1._3dCode.output += 'if(T' + console_1._3dCode.actualTemp + ' == 0) goto L' + trueTag + ';//Check if False\n';
                    console_1._3dCode.output += 'goto L' + falseTag + ';\n';
                    console_1._3dCode.output += 'L' + trueTag + '://True tag\n';
                    console_1._3dCode.output += 'printf("%c", 70);//Print F\n';
                    console_1._3dCode.output += 'printf("%c", 97);//Print a\n';
                    console_1._3dCode.output += 'printf("%c", 108);//Print l\n';
                    console_1._3dCode.output += 'printf("%c", 115);//Print s\n';
                    console_1._3dCode.output += 'printf("%c", 101);//Print e\n';
                    console_1._3dCode.output += 'goto L' + exitTag + ';\n';
                    console_1._3dCode.output += 'L' + falseTag + '://True tag\n';
                    console_1._3dCode.output += 'printf("%c", 84);//Print T\n';
                    console_1._3dCode.output += 'printf("%c", 114);//Print r\n';
                    console_1._3dCode.output += 'printf("%c", 117);//Print u\n';
                    console_1._3dCode.output += 'printf("%c", 101);//Print e\n';
                    console_1._3dCode.output += 'goto L' + exitTag + ';\n';
                    console_1._3dCode.output += 'L' + exitTag + ':\n';
                    break;
                case type_1.type.CHAR:
                case type_1.type.STRING:
                    const elementTemp = console_1._3dCode.actualTemp;
                    console_1._3dCode.actualTemp++;
                    const savedEnvironment = console_1._3dCode.actualTemp;
                    console_1._3dCode.output += 'T' + savedEnvironment + ' = SP;//Save environment\n';
                    console_1._3dCode.output += 'SP = 3;//Set StringPrint environment\n';
                    console_1._3dCode.actualTemp++;
                    console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = ' + 'SP + 0;//Set string position\n';
                    console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + elementTemp + ';//Save string\n';
                    console_1._3dCode.output += 'StringPrint();//Call function\n';
                    console_1._3dCode.output += 'SP = T' + savedEnvironment + ';//Recover environment\n';
                    break;
                case type_1.type.INTEGER:
                    console_1._3dCode.output += 'printf("%d", (int)T' + console_1._3dCode.actualTemp + ');//Print integer\n';
                    break;
                case type_1.type.FLOAT:
                    console_1._3dCode.output += 'printf("%f", T' + console_1._3dCode.actualTemp + ');//Print float\n';
                    break;
                default:
                    break;
            }
        });
        switch (this.type) {
            case print_type.PRINTLN:
                console_1._3dCode.output += 'printf("%c", 10);//Print new line\n';
                break;
        }
        return type_1.type.NULL;
    }
    execute(environment) {
        this.expresions.forEach(element => {
            const expr_data = element.execute(environment);
            let print_str = expr_data.value;
            // if is an array or a struct convert to string first 
            if (expr_data.value instanceof _array_1._array || expr_data.value instanceof struct_item_1.struct_item) {
                print_str = expr_data.value.to_string(environment);
            }
            switch (this.type) {
                case print_type.PRINT:
                    console_1._console.output += print_str;
                    break;
                case print_type.PRINTLN:
                    console_1._console.output += print_str + "\n";
                    break;
            }
        });
        // Default
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Print (" + print_type[this.type] + ")\"];";
        const this_count = count;
        const arr_list = [this.expresions];
        for (const instr_arr of arr_list) {
            for (const instr of instr_arr) {
                try {
                    result += "node" + this_count + " -> " + "node" + count + "1;";
                    result += instr.plot(Number(count + "1"));
                    count++;
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
        return result;
    }
}
exports.print = print;

},{"../abstract/instruction":5,"../literal/_array":46,"../literal/struct_item":49,"../system/console":53,"../system/type":56}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.struct_access = void 0;
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const instruction_1 = require("../abstract/instruction");
const struct_item_1 = require("../literal/struct_item");
class struct_access extends instruction_1.instruction {
    constructor(id, property, line, column) {
        super(line, column);
        this.id = id;
        this.property = property;
    }
    translate(environment) {
        return type_1.type.NULL;
    }
    execute(environment) {
        const struct_data = this.id.execute(environment);
        if (struct_data.value instanceof struct_item_1.struct_item) {
            let returned_object = struct_data.value.get_value(this.property, environment);
            if (returned_object != null) {
                return returned_object.execute(environment);
            }
            else {
                error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Propiedad no existente en el struct'));
                return { value: null, type: type_1.type.NULL };
            }
        }
        else {
            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'La variable no es un struct'));
            return { value: null, type: type_1.type.NULL };
        }
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Struct Property (" + this.property + ")\"];";
        const this_count = count;
        const child_list = [this.id];
        for (const instr of child_list) {
            if (instr != null) {
                try {
                    result += "node" + this_count + " -> " + "node" + count + "1;";
                    result += instr.plot(Number(count + "1"));
                    count++;
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
        return result;
    }
}
exports.struct_access = struct_access;

},{"../abstract/instruction":5,"../literal/struct_item":49,"../system/error":55,"../system/type":56}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unary_instruction = exports.unary_instruction_type = void 0;
const expression_1 = require("../abstract/expression");
const error_1 = require("../system/error");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
var unary_instruction_type;
(function (unary_instruction_type) {
    unary_instruction_type[unary_instruction_type["INCREMENT"] = 0] = "INCREMENT";
    unary_instruction_type[unary_instruction_type["DECREMENT"] = 1] = "DECREMENT";
})(unary_instruction_type = exports.unary_instruction_type || (exports.unary_instruction_type = {}));
class unary_instruction extends expression_1.expression {
    constructor(variable_id, type, line, column) {
        super(line, column);
        this.variable_id = variable_id;
        this.type = type;
    }
    translate(environment) {
        const variable_data = environment.get_variable(this.variable_id);
        if (variable_data.type == type_1.type.NULL) {
            return type_1.type.NULL;
        }
        let absolutePos = environment.get_absolute_recursive(this.variable_id, environment);
        let relative = environment.get_relative_recursive(this.variable_id, environment);
        switch (this.type) {
            case unary_instruction_type.INCREMENT:
                switch (variable_data.type) {
                    case type_1.type.INTEGER:
                        let posVariable = console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + posVariable + ' = SP + ' + relative + ';\n';
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + posVariable + '];//Get value of variable ' + this.variable_id + '\n';
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = T' + console_1._3dCode.actualTemp + ' + 1;\n';
                        console_1._3dCode.output += 'STACK[(int)T' + posVariable + '] = T' + console_1._3dCode.actualTemp + ';//Update value of variable ' + this.variable_id + '\n';
                        break;
                    default:
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar ++ para: ' + variable_data.value));
                }
                break;
            case unary_instruction_type.DECREMENT:
                switch (variable_data.type) {
                    case type_1.type.INTEGER:
                        let posVariable = console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + posVariable + ' = SP + ' + relative + ';\n';
                        console_1._3dCode.actualTemp++;
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + posVariable + '];//Get value of variable ' + this.variable_id + '\n';
                        console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = T' + console_1._3dCode.actualTemp + ' - 1;\n';
                        console_1._3dCode.output += 'STACK[(int)T' + posVariable + '] = T' + console_1._3dCode.actualTemp + ';//Update value of variable ' + this.variable_id + '\n';
                        break;
                    default:
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar -- para: ' + variable_data.value));
                }
                break;
        }
        // Default
        return type_1.type.NULL;
    }
    execute(environment) {
        const variable_data = environment.get_variable(this.variable_id);
        if (variable_data.type == type_1.type.NULL) {
            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Variable no existente'));
            return { value: null, type: type_1.type.NULL };
        }
        switch (this.type) {
            case unary_instruction_type.INCREMENT:
                switch (variable_data.type) {
                    case type_1.type.INTEGER:
                        variable_data.value++;
                        break;
                    default:
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar ++ para: ' + variable_data.value));
                }
                break;
            case unary_instruction_type.DECREMENT:
                switch (variable_data.type) {
                    case type_1.type.INTEGER:
                        variable_data.value--;
                        break;
                    default:
                        error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'No se puede operar -- para: ' + variable_data.value));
                }
                break;
        }
        // Default
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Continue (" + this.variable_id + "," + unary_instruction_type[this.type] + ")\"];";
        return result;
    }
}
exports.unary_instruction = unary_instruction;

},{"../abstract/expression":4,"../system/console":53,"../system/error":55,"../system/type":56}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._array = void 0;
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const literal_1 = require("../abstract/literal");
const array_range_1 = require("../expression/array_range");
class _array extends literal_1.literal {
    constructor(body, line, column) {
        super(line, column);
        this.body = body;
        this.dimensionSize = new Map();
    }
    translate(environment) {
        // Default
        return type_1.type.NULL;
    }
    assign_value(dimensions, environment, expr) {
        let body_pointer = this.body;
        let dimensions_index = 0;
        let dimension_data = { type: type_1.type.UNDEFINED, value: null };
        while (dimensions_index < dimensions.length) {
            dimension_data = dimensions[dimensions_index].execute(environment);
            if (dimension_data.value instanceof Array) {
                return false;
            }
            else if (body_pointer[0] instanceof _array) {
                let item = body_pointer[dimension_data.value];
                if (item instanceof _array) {
                    body_pointer = item.body;
                }
                else {
                    return false;
                }
                dimensions_index++;
            }
            else {
                dimensions_index++;
            }
        }
        if (dimension_data.type != type_1.type.UNDEFINED) {
            body_pointer[dimension_data.value] = expr;
        }
        return true;
    }
    check_dimensions_number(dimensions) {
        let checked = false;
        let body_pointer = this.body;
        let dimensions_counter = 1;
        let dimensions_index = 0;
        while (dimensions_index < dimensions.length) {
            if (dimensions[dimensions_index] instanceof array_range_1.array_range) {
                dimensions_counter++;
                dimensions_index++;
            }
            else if (body_pointer[0] instanceof _array) {
                body_pointer = body_pointer[0].body;
                dimensions_counter++;
                dimensions_index++;
            }
            else {
                dimensions_index++;
            }
        }
        if (dimensions_index <= dimensions_counter) {
            checked = true;
        }
        return checked;
    }
    check_dimensions_length(dimensions, environment) {
        let body_pointer = this.body;
        let dimensions_index = 0;
        while (dimensions_index < dimensions.length) {
            let dimension_data = dimensions[dimensions_index].execute(environment);
            if (dimension_data.value instanceof Array) {
                let first_index = (dimension_data.value[0] == "begin") ? 0 : dimension_data.value[0];
                let last_index = (dimension_data.value[1] == "end") ? (body_pointer.length - 1) : dimension_data.value[1];
                if (first_index < 0 || last_index >= body_pointer.length) {
                    return false;
                }
                body_pointer = body_pointer.slice(first_index, last_index + 1);
                dimensions_index++;
            }
            else if (body_pointer[0] instanceof _array) {
                if (dimension_data.value < 0 || dimension_data.value >= body_pointer.length) {
                    return false;
                }
                body_pointer = body_pointer[0].body;
                dimensions_index++;
            }
            else {
                if (dimension_data.value < 0 || dimension_data.value >= body_pointer.length) {
                    return false;
                }
                dimensions_index++;
            }
        }
        return true;
    }
    get(dimensions, environment) {
        // get first data 
        let dimension_data = dimensions[0].execute(environment);
        dimensions.shift();
        // if the dimension is a range obtain by range
        if (dimension_data.value instanceof Array) {
            let first_index = (dimension_data.value[0] == "begin") ? 0 : dimension_data.value[0];
            let last_index = (dimension_data.value[1] == "end") ? (this.body.length - 1) : dimension_data.value[1];
            let arr_return = new _array(this.body.slice(first_index, last_index + 1), this.line, this.column);
            if (dimensions.length > 0) {
                return arr_return.get(dimensions, environment);
            }
            else {
                return { type: type_1.type.UNDEFINED, value: arr_return };
            }
        }
        else {
            // iterate trought the array and return the value
            let item = this.body[dimension_data.value];
            if (item instanceof _array && dimensions.length > 0) {
                return item.get(dimensions, environment);
            }
            else {
                return item.execute(environment);
            }
        }
    }
    checkType(type, environment) {
        let return_bool = true;
        for (const item of this.body) {
            if (item instanceof _array) {
                return_bool = item.checkType(type, environment);
                // if one of all elements have another type return false
                if (!return_bool)
                    return false;
            }
            else {
                return_bool = (item.execute(environment).type == type);
                // if one of all elements have another type return false
                if (!return_bool)
                    return false;
            }
        }
        return return_bool;
    }
    translateElements(environment, dimension) {
        let contador = 0;
        for (const item of this.body) {
            if (item instanceof _array) {
                item.translateElements(environment, dimension + 1);
                item.dimensionSize.forEach((values, keys) => {
                    if (this.dimensionSize.has(keys)) {
                        let dimSize = this.dimensionSize.get(keys);
                        if (dimSize < values) {
                            this.dimensionSize.set(keys, values);
                        }
                    }
                    else {
                        this.dimensionSize.set(keys, values);
                    }
                });
            }
            else {
                item.translate(environment);
                let itemTemp = console_1._3dCode.actualTemp;
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + ' + console_1._3dCode.relativePos + ';\n';
                console_1._3dCode.output += 'STACK[(int)T' + console_1._3dCode.actualTemp + '] = T' + itemTemp + ';//Save value in array, index ' + contador + '\n';
                console_1._3dCode.absolutePos++;
                console_1._3dCode.relativePos++;
            }
            contador++;
        }
        if (this.dimensionSize.has(dimension)) {
            let dimSize = this.dimensionSize.get(dimension);
            if (dimSize < dimension) {
                this.dimensionSize.set(dimension, contador);
            }
        }
        else {
            this.dimensionSize.set(dimension, contador);
        }
    }
    getTotalItems() {
        let retorno = 0;
        this.dimensionSize.forEach((values, keys) => {
            let dimSize = this.dimensionSize.get(keys);
            retorno += dimSize;
        });
        return retorno;
    }
    to_string(environment) {
        let result_str = "[";
        for (const item of this.body) {
            if (item instanceof _array) {
                result_str += item.to_string(environment) + ",";
            }
            else {
                result_str += item.execute(environment).value + ",";
            }
        }
        // remove comma
        result_str = result_str.substring(0, result_str.length - 1);
        return result_str + "]";
    }
    execute(environment) {
        // Default
        return { value: this, type: type_1.type.UNDEFINED };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Array\"];";
        const this_count = count;
        for (const instr of this.body) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports._array = _array;

},{"../abstract/literal":6,"../expression/array_range":10,"../system/console":53,"../system/type":56}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._struct = void 0;
const type_1 = require("../system/type");
const literal_1 = require("../abstract/literal");
class _struct extends literal_1.literal {
    constructor(body, line, column) {
        super(line, column);
        this.body = body;
    }
    translate(environment) {
        // Default
        return type_1.type.NULL;
    }
    check_length(parameters) {
        return (parameters.length == this.body.length);
    }
    check_types(parameters, environment) {
        for (let index = 0; index < this.body.length; index++) {
            const declared_parameter_data = this.body[index].execute(environment);
            const obtained_parameter_data = parameters[index].execute(environment);
            if (declared_parameter_data.type != obtained_parameter_data.type) {
                return false;
            }
        }
        return true;
    }
    execute(environment) {
        // Default
        return { value: this, type: type_1.type.UNDEFINED };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Struct\"];";
        const this_count = count;
        for (const instr of this.body) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports._struct = _struct;

},{"../abstract/literal":6,"../system/type":56}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.native = void 0;
const literal_1 = require("../abstract/literal");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
class native extends literal_1.literal {
    constructor(value, type, line, column) {
        super(line, column);
        this.value = value;
        this.type = type;
    }
    translate(environment) {
        switch (this.type) {
            case type_1.type.INTEGER:
            case type_1.type.FLOAT:
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = ' + this.value + ';\n';
                break;
            case type_1.type.STRING:
            case type_1.type.CHAR:
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = HP;//Save start position\n';
                let content = this.get_string_value(this.value);
                for (let i = 0; i < content.length; i++) {
                    console_1._3dCode.output += 'HEAP[(int)HP] = ' + content.charAt(i).charCodeAt(0) + ';//Save character ' + content.charAt(i) + ' in heap\n';
                    console_1._3dCode.output += 'HP = HP + 1;//Increase HP\n';
                }
                console_1._3dCode.output += 'HEAP[(int)HP] = 36;//Save end of string in heap\n';
                console_1._3dCode.output += 'HP = HP + 1;//Increase HP\n';
                break;
            case type_1.type.NULL:
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' =  -1;\n';
                break;
            case type_1.type.BOOLEAN:
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += (this.value === 'false') ? 'T' + console_1._3dCode.actualTemp + ' = 0;\n' : 'T' + console_1._3dCode.actualTemp + ' = 1;\n';
                break;
            default:
                console.log(this.value);
                return type_1.type.STRING;
        }
        return this.type;
    }
    execute(environment) {
        switch (this.type) {
            case type_1.type.INTEGER:
                return { value: Number(this.value), type: type_1.type.INTEGER };
            case type_1.type.FLOAT:
                return { value: Number(this.value), type: type_1.type.FLOAT };
            case type_1.type.STRING:
                return { value: this.get_string_value(this.value), type: type_1.type.STRING };
            case type_1.type.CHAR:
                return { value: this.get_string_value(this.value), type: type_1.type.CHAR };
            case type_1.type.NULL:
                return { value: null, type: type_1.type.NULL };
            case type_1.type.BOOLEAN:
                return { value: (this.value === 'false') ? false : true, type: type_1.type.BOOLEAN };
            default:
                return { value: this.value, type: type_1.type.STRING };
        }
    }
    plot(count) {
        let plot_val = this.value;
        switch (this.type) {
            case type_1.type.INTEGER:
                plot_val = Number(this.value);
            case type_1.type.FLOAT:
                plot_val = Number(this.value);
            case type_1.type.STRING:
                plot_val = this.get_string_value(this.value);
            case type_1.type.CHAR:
                plot_val = this.get_string_value(this.value);
            case type_1.type.NULL:
                plot_val = "NULL";
            case type_1.type.BOOLEAN:
                plot_val = (this.value === 'false') ? false : true;
        }
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Nativo (" + plot_val + "," + type_1.type[this.type] + ")\"];";
        return result;
    }
}
exports.native = native;

},{"../abstract/literal":6,"../system/console":53,"../system/type":56}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.struct_item = void 0;
const type_1 = require("../system/type");
const literal_1 = require("../abstract/literal");
const _struct_1 = require("./_struct");
class struct_item extends literal_1.literal {
    constructor(body, parent_struct_id, line, column) {
        super(line, column);
        this.body = body;
        this.parent_struct_id = parent_struct_id;
    }
    translate(environment) {
        // Default
        return type_1.type.NULL;
    }
    get_value(property, environment) {
        let parent_struct = environment.get_variable_recursive(this.parent_struct_id, environment).value;
        if (parent_struct instanceof _struct_1._struct) {
            const parameters = parent_struct.body;
            for (let index = 0; index < this.body.length; index++) {
                const obtained_parameter_data = parameters[index].execute(environment);
                if (obtained_parameter_data.value == property) {
                    return this.body[index];
                }
            }
        }
        return null;
    }
    to_string(environment) {
        let param_list = "";
        this.body.forEach(element => {
            let element_data = element.execute(environment);
            param_list += element_data.value + ", ";
        });
        param_list = param_list.slice(0, param_list.length - 2);
        return this.parent_struct_id + "(" + param_list + ")";
    }
    execute(environment) {
        // Default
        return { value: this, type: type_1.type.UNDEFINED };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Struct Item (" + this.parent_struct_id + ")\"];";
        const this_count = count;
        for (const instr of this.body) {
            try {
                result += "node" + this_count + " -> " + "node" + count + "1;";
                result += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    }
}
exports.struct_item = struct_item;

},{"../abstract/literal":6,"../system/type":56,"./_struct":47}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.variable_id = exports.variable_id_type = void 0;
const literal_1 = require("../abstract/literal");
const type_1 = require("../system/type");
const console_1 = require("../system/console");
const error_1 = require("../system/error");
const _symbol_1 = require("../system/_symbol");
var variable_id_type;
(function (variable_id_type) {
    variable_id_type[variable_id_type["NORMAL"] = 0] = "NORMAL";
    variable_id_type[variable_id_type["REFERENCE"] = 1] = "REFERENCE";
})(variable_id_type = exports.variable_id_type || (exports.variable_id_type = {}));
class variable_id extends literal_1.literal {
    constructor(id, type, line, column) {
        super(line, column);
        this.id = id;
        this.type = type;
    }
    translate(environment) {
        let return_data = environment.get_variable_recursive(this.id, environment);
        let absolute = environment.get_absolute_recursive(this.id, environment);
        let relative = environment.get_relative_recursive(this.id, environment);
        let symScope = environment.get_scope_recursive(this.id, environment);
        if (return_data.type != type_1.type.NULL) {
            if (symScope == _symbol_1.scope.GLOBAL) {
                console_1._3dCode.actualTemp++;
                let posVar = console_1._3dCode.actualTemp;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = mainStart + ' + relative + ';\n';
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + posVar + '];//Getting value of variable ' + this.id + '\n';
            }
            else {
                console_1._3dCode.actualTemp++;
                let posVar = console_1._3dCode.actualTemp;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = SP + ' + relative + ';\n';
                console_1._3dCode.actualTemp++;
                console_1._3dCode.output += 'T' + console_1._3dCode.actualTemp + ' = STACK[(int)T' + posVar + '];//Getting value of variable ' + this.id + '\n';
            }
            return return_data.type;
        }
        else {
        }
        return type_1.type.NULL;
    }
    execute(environment) {
        let return_data = environment.get_variable(this.id);
        if (return_data.type != type_1.type.UNDEFINED) {
            return return_data;
        }
        else {
            error_1.error_arr.push(new error_1.error(this.line, this.column, error_1.error_type.SEMANTICO, 'Variable no definida: ' + this.id));
        }
        return { value: null, type: type_1.type.NULL };
    }
    plot(count) {
        let result = "node" + count + "[label=\"(" + this.line + "," + this.column + ") Nativo (" + this.id + "," + variable_id_type[this.type] + ")\"];";
        return result;
    }
}
exports.variable_id = variable_id;

},{"../abstract/literal":6,"../system/_symbol":52,"../system/console":53,"../system/error":55,"../system/type":56}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser = require("./grammar/main_grammar");
const environment_1 = require("./system/environment");
const console_1 = require("./system/console");
const error_1 = require("./system/error");
window.plot = function (input) {
    console_1._console.clean();
    try {
        const ast = parser.parse(input);
        const main_environment = new environment_1.environment(null);
        console.log("ast", ast);
        let count = 1;
        let dot_string = "digraph G { node" + count + "[label=\"AST\"];";
        for (const instr of ast) {
            try {
                dot_string += "node" + count + " -> " + "node" + count + "1;";
                dot_string += instr.plot(Number(count + "1"));
                count++;
            }
            catch (error) {
                console.log(error);
            }
        }
        return dot_string + "}";
    }
    catch (error) {
        console.log(error);
    }
    if (error_1.error_arr.length > 0) {
        console.log(error_1.error_arr);
        return "$error$";
    }
    return console_1._console.output;
};

},{"./grammar/main_grammar":19,"./system/console":53,"./system/environment":54,"./system/error":55}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._symbol = exports.scope = void 0;
const declaration_function_1 = require("../instruction/declaration_function");
const struct_item_1 = require("../literal/struct_item");
const _array_1 = require("../literal/_array");
const _struct_1 = require("../literal/_struct");
const type_1 = require("./type");
var scope;
(function (scope) {
    scope[scope["GLOBAL"] = 0] = "GLOBAL";
    scope[scope["LOCAL"] = 1] = "LOCAL";
})(scope = exports.scope || (exports.scope = {}));
class _symbol {
    constructor(id, data, scope, absolute, relative, size) {
        this.id = id;
        this.data = data;
        this.scope = scope;
        this.absolute = absolute;
        this.relative = relative;
        this.size = size;
    }
    get_html() {
        let result = "";
        if (this.data instanceof declaration_function_1.declaration_function) {
            result += "<td>Funcion</td>" + "<td>" + this.id + "</td>" + "<td>Funcion</td>" + "<td>" + scope[this.scope] + "</td>";
        }
        else if (this.data.value instanceof _array_1._array) {
            result += "<td>Objeto</td>" + "<td>" + this.id + "</td>" + "<td>Arreglo</td>" + "<td>" + scope[this.scope] + "</td>";
        }
        else if (this.data.value instanceof _struct_1._struct) {
            result += "<td>Definicion</td>" + "<td>" + this.id + "</td>" + "<td>Estructura</td>" + "<td>" + scope[this.scope] + "</td>";
        }
        else if (this.data.value instanceof struct_item_1.struct_item) {
            result += "<td>Objeto</td>" + "<td>" + this.id + "</td>" + "<td>Estructura</td>" + "<td>" + scope[this.scope] + "</td>";
        }
        else
            result += "<td>" + this.data.value + "</td>" + "<td>" + this.id + "</td>" + "<td>" + type_1.type[this.data.type] + "</td>" + "<td>" + scope[this.scope] + "</td>";
        return result;
    }
}
exports._symbol = _symbol;

},{"../instruction/declaration_function":35,"../literal/_array":46,"../literal/_struct":47,"../literal/struct_item":49,"./type":56}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._3dCode = exports._console = void 0;
class console {
    constructor() {
        this.output = "";
        this.symbols = new Map();
        this.stack = new Array;
        this.heap = new Array;
        this.actualTemp = 5;
        this.actualTag = 0;
        this.breakTag = 0;
        this.continueTag = 0;
        this.absolutePos = 36; //Initial value 36 because of default functions
        this.relativePos = 0;
        this.switchEvaluation = 0;
        this.finalCode = "";
        this.functionsCode = "";
    }
    saveInHeap(index, id) {
        this.heap[index] = id;
    }
    saveInStack(index, id) {
        this.stack[index] = id;
    }
    clean() {
        this.output = "";
        this.symbols = new Map();
        this.stack = [];
        this.heap = [];
        this.actualTemp = 5;
        this.actualTag = 0;
        this.breakTag = 0;
        this.continueTag = 0;
        this.absolutePos = 36;
        this.relativePos = 0;
        this.switchEvaluation = 0;
        this.finalCode = "";
        this.functionsCode = "";
    }
}
exports._console = new console();
exports._3dCode = new console();

},{}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environment = void 0;
const type_1 = require("./type");
const _symbol_1 = require("./_symbol");
class environment {
    constructor(previous) {
        this.previous = previous;
        this.previous = previous;
        this.symbol_map = new Map();
        this.function_map = new Map();
    }
    get_html() {
        let result = '<div class="table-wrapper-scroll-y my-custom-scrollbar">';
        result += '<table class="table table-hover">\n';
        result += '<thead>\n<tr>\n<th scope="col">#</th>\n';
        result += '<th scope="col">Valor</th>\n';
        result += '<th scope="col">ID</th>\n';
        result += '<th scope="col">Tipo</th>\n';
        result += '<th scope="col">Ambito</th>\n';
        result += '</tr>\n';
        result += '</thead>\n';
        result += '<tbody>\n';
        let count = 1;
        this.symbol_map.forEach(element => {
            result += '<tr>\n';
            result += '<th scope="row">' + count + '</th>\n';
            result += element.get_html();
            result += '</tr>\n';
            count++;
        });
        this.function_map.forEach(element => {
            result += '<tr>\n';
            result += '<th scope="row">' + count + '</th>\n';
            result += element.get_html();
            result += '</tr>\n';
            count++;
        });
        result += '</tbody>\n';
        return result += '</table></div>';
    }
    save_function(id, new_function, absolute, relative, size) {
        let symbol_type = _symbol_1.scope.LOCAL;
        if (this.previous == null) {
            symbol_type = _symbol_1.scope.GLOBAL;
        }
        this.function_map.set(id, new _symbol_1._symbol(id, new_function, symbol_type, absolute, relative, size));
    }
    get_function(id) {
        let symbol_item = this.function_map.get(id);
        if (symbol_item instanceof _symbol_1._symbol) {
            let return_function = symbol_item.data;
            return return_function;
        }
        return null;
    }
    save_variable(id, data, absolute, relative, size) {
        let symbol_type = _symbol_1.scope.LOCAL;
        if (this.previous == null) {
            symbol_type = _symbol_1.scope.GLOBAL;
        }
        this.symbol_map.set(id, new _symbol_1._symbol(id, data, symbol_type, absolute, relative, size));
    }
    get_variable(id) {
        let symbol_item = this.symbol_map.get(id);
        if (symbol_item instanceof _symbol_1._symbol) {
            let return_data = symbol_item.data;
            return return_data;
        }
        return { value: null, type: type_1.type.UNDEFINED };
    }
    get_function_recursive(id, environment) {
        /*let symbol_item = this.symbol_map.get(id)
        if (symbol_item instanceof _symbol) {
            return symbol_item
        }
        return null*/
        if (environment.symbol_map.has(id)) {
            let symbol_item = environment.symbol_map.get(id);
            if (symbol_item instanceof _symbol_1._symbol) {
                return symbol_item;
            }
        }
        if (environment.previous != null) {
            return this.get_function_recursive(id, environment.previous);
        }
        return null;
    }
    get_scope_recursive(id, environment) {
        /*let symbol_item = this.symbol_map.get(id)
        if (symbol_item instanceof _symbol) {
            return symbol_item
        }
        return null*/
        if (environment.symbol_map.has(id)) {
            let symbol_item = environment.symbol_map.get(id);
            if (symbol_item instanceof _symbol_1._symbol) {
                return symbol_item.scope;
            }
        }
        if (environment.previous != null) {
            return this.get_scope_recursive(id, environment.previous);
        }
        return null;
    }
    get_variable_recursive(id, environment) {
        if (environment.symbol_map.has(id)) {
            let symbol_item = environment.symbol_map.get(id);
            if (symbol_item instanceof _symbol_1._symbol) {
                let return_data = symbol_item.data;
                return return_data;
            }
        }
        if (environment.previous != null) {
            return this.get_variable_recursive(id, environment.previous);
        }
        return { value: null, type: type_1.type.UNDEFINED };
    }
    get_absolute_recursive(id, environment) {
        /*let symbol_item = this.symbol_map.get(id)
        if (symbol_item instanceof _symbol) {
            return symbol_item.absolute
        }
        return -1*/
        if (environment.symbol_map.has(id)) {
            let symbol_item = environment.symbol_map.get(id);
            if (symbol_item instanceof _symbol_1._symbol) {
                return symbol_item.absolute;
            }
        }
        if (environment.previous != null) {
            return this.get_absolute_recursive(id, environment.previous);
        }
        return -1;
    }
    get_size_recursive(id, environment) {
        /*let symbol_item = this.symbol_map.get(id)
        if (symbol_item instanceof _symbol) {
            return symbol_item.size
        }
        return -1*/
        if (environment.symbol_map.has(id)) {
            let symbol_item = environment.symbol_map.get(id);
            if (symbol_item instanceof _symbol_1._symbol) {
                return symbol_item.size;
            }
        }
        if (environment.previous != null) {
            return this.get_size_recursive(id, environment.previous);
        }
        return -1;
    }
    get_relative_recursive(id, environment) {
        /*let symbol_item = this.symbol_map.get(id)
        if (symbol_item instanceof _symbol) {
            return symbol_item.relative
        }
        return -1*/
        if (environment.symbol_map.has(id)) {
            let symbol_item = environment.symbol_map.get(id);
            if (symbol_item instanceof _symbol_1._symbol) {
                return symbol_item.relative;
            }
        }
        if (environment.previous != null) {
            return this.get_relative_recursive(id, environment.previous);
        }
        return -1;
    }
}
exports.environment = environment;

},{"./_symbol":52,"./type":56}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error_arr = exports.error_type = exports.error = void 0;
class error {
    constructor(line, column, type, message) {
        this.line = line;
        this.column = column;
        this.type = type;
        this.message = message;
    }
    html() {
        let result = "<td>" + error_type[this.type] + "</td>";
        result += "<td>" + this.message + "</td>";
        result += "<td>" + this.line + "</td>";
        result += "<td>" + this.column + "</td>";
        return result;
    }
}
exports.error = error;
var error_type;
(function (error_type) {
    error_type[error_type["LEXICO"] = 0] = "LEXICO";
    error_type[error_type["SINTACTICO"] = 1] = "SINTACTICO";
    error_type[error_type["SEMANTICO"] = 2] = "SEMANTICO";
})(error_type = exports.error_type || (exports.error_type = {}));
exports.error_arr = [];

},{}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.type_tbl = exports.type = void 0;
var type;
(function (type) {
    type[type["INTEGER"] = 0] = "INTEGER";
    type[type["STRING"] = 1] = "STRING";
    type[type["BOOLEAN"] = 2] = "BOOLEAN";
    type[type["FLOAT"] = 3] = "FLOAT";
    type[type["CHAR"] = 4] = "CHAR";
    type[type["NULL"] = 5] = "NULL";
    type[type["VOID"] = 6] = "VOID";
    type[type["UNDEFINED"] = 7] = "UNDEFINED";
    type[type["STRUCT"] = 8] = "STRUCT";
    type[type["STRUCT_ITEM"] = 9] = "STRUCT_ITEM";
    type[type["FUNCTION"] = 10] = "FUNCTION";
})(type = exports.type || (exports.type = {}));
/*
        INTEGER        STRING       BOOLEAN       FLOAT     CHAR
*/
exports.type_tbl = [
    [
        type.INTEGER, type.STRING, type.NULL, type.FLOAT, type.INTEGER
    ],
    [
        type.STRING, type.STRING, type.STRING, type.STRING, type.STRING
    ],
    [
        type.NULL, type.STRING, type.NULL, type.NULL, type.NULL
    ],
    [
        type.FLOAT, type.STRING, type.NULL, type.FLOAT, type.FLOAT
    ],
    [
        type.INTEGER, type.STRING, type.NULL, type.FLOAT, type.INTEGER
    ]
];

},{}]},{},[51]);
