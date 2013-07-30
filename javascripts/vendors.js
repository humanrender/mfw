//     Underscore.js 1.5.1
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.5.1';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? void 0 : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed > result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value == null ? _.identity : value);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, "length").concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var result;
    var timeout = null;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);
/*!
 * VERSION: beta 1.10.2
 * DATE: 2013-07-27
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * @license Copyright (c) 2008-2013, GreenSock. All rights reserved.
 * This work is subject to the terms at http://www.greensock.com/terms_of_use.html or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */

(function(window) {
  
    "use strict";
    var _globals = window.GreenSockGlobals || window,
      _namespace = function(ns) {
        var a = ns.split("."), 
          p = _globals, i;
        for (i = 0; i < a.length; i++) {
          p[a[i]] = p = p[a[i]] || {};
        }
        return p;
      },
      gs = _namespace("com.greensock"),
      _slice = [].slice,
      _emptyFunc = function() {},
      a, i, p, _ticker, _tickerActive,
      _defLookup = {},

      /**
       * @constructor
       * Defines a GreenSock class, optionally with an array of dependencies that must be instantiated first and passed into the definition.
       * This allows users to load GreenSock JS files in any order even if they have interdependencies (like CSSPlugin extends TweenPlugin which is
       * inside TweenLite.js, but if CSSPlugin is loaded first, it should wait to run its code until TweenLite.js loads and instantiates TweenPlugin
       * and then pass TweenPlugin to CSSPlugin's definition). This is all done automatically and internally.
       *
       * Every definition will be added to a "com.greensock" global object (typically window, but if a window.GreenSockGlobals object is found,
       * it will go there as of v1.7). For example, TweenLite will be found at window.com.greensock.TweenLite and since it's a global class that should be available anywhere,
       * it is ALSO referenced at window.TweenLite. However some classes aren't considered global, like the base com.greensock.core.Animation class, so
       * those will only be at the package like window.com.greensock.core.Animation. Again, if you define a GreenSockGlobals object on the window, everything
       * gets tucked neatly inside there instead of on the window directly. This allows you to do advanced things like load multiple versions of GreenSock
       * files and put them into distinct objects (imagine a banner ad uses a newer version but the main site uses an older one). In that case, you could
       * sandbox the banner one like:
       *
       * <script>
       *     var gs = window.GreenSockGlobals = {}; //the newer version we're about to load could now be referenced in a "gs" object, like gs.TweenLite.to(...). Use whatever alias you want as long as it's unique, "gs" or "banner" or whatever.
       * </script>
       * <script src="js/greensock/v1.7/TweenMax.js"></script>
       * <script>
       *     window.GreenSockGlobals = null; //reset it back to null so that the next load of TweenMax affects the window and we can reference things directly like TweenLite.to(...)
       * </script>
       * <script src="js/greensock/v1.6/TweenMax.js"></script>
       * <script>
       *     gs.TweenLite.to(...); //would use v1.7
       *     TweenLite.to(...); //would use v1.6
       * </script>
       *
       * @param {!string} ns The namespace of the class definition, leaving off "com.greensock." as that's assumed. For example, "TweenLite" or "plugins.CSSPlugin" or "easing.Back".
       * @param {!Array.<string>} dependencies An array of dependencies (described as their namespaces minus "com.greensock." prefix). For example ["TweenLite","plugins.TweenPlugin","core.Animation"]
       * @param {!function():Object} func The function that should be called and passed the resolved dependencies which will return the actual class for this definition.
       * @param {boolean=} global If true, the class will be added to the global scope (typically window unless you define a window.GreenSockGlobals object)
       */
      Definition = function(ns, dependencies, func, global) {
        this.sc = (_defLookup[ns]) ? _defLookup[ns].sc : []; //subclasses
        _defLookup[ns] = this;
        this.gsClass = null;
        this.func = func;
        var _classes = [];
        this.check = function(init) {
          var i = dependencies.length,
            missing = i,
            cur, a, n, cl;
          while (--i > -1) {
            if ((cur = _defLookup[dependencies[i]] || new Definition(dependencies[i], [])).gsClass) {
              _classes[i] = cur.gsClass;
              missing--;
            } else if (init) {
              cur.sc.push(this);
            }
          }
          if (missing === 0 && func) {
            a = ("com.greensock." + ns).split(".");
            n = a.pop();
            cl = _namespace(a.join("."))[n] = this.gsClass = func.apply(func, _classes);

            //exports to multiple environments
            if (global) {
              _globals[n] = cl; //provides a way to avoid global namespace pollution. By default, the main classes like TweenLite, Power1, Strong, etc. are added to window unless a GreenSockGlobals is defined. So if you want to have things added to a custom object instead, just do something like window.GreenSockGlobals = {} before loading any GreenSock files. You can even set up an alias like window.GreenSockGlobals = windows.gs = {} so that you can access everything like gs.TweenLite. Also remember that ALL classes are added to the window.com.greensock object (in their respective packages, like com.greensock.easing.Power1, com.greensock.TweenLite, etc.)
              if (typeof(define) === "function" && define.amd){ //AMD
                define((window.GreenSockAMDPath ? window.GreenSockAMDPath + "/" : "") + ns.split(".").join("/"), [], function() { return cl; });
              } else if (typeof(module) !== "undefined" && module.exports){ //node
                module.exports = cl;
              }
            }
            for (i = 0; i < this.sc.length; i++) {
              this.sc[i].check();
            }
          }
        };
        this.check(true);
      },

      //used to create Definition instances (which basically registers a class that has dependencies).
      _gsDefine = window._gsDefine = function(ns, dependencies, func, global) {
        return new Definition(ns, dependencies, func, global);
      },

      //a quick way to create a class that doesn't have any dependencies. Returns the class, but first registers it in the GreenSock namespace so that other classes can grab it (other classes might be dependent on the class).
      _class = gs._class = function(ns, func, global) {
        func = func || function() {};
        _gsDefine(ns, [], function(){ return func; }, global);
        return func;
      };

    _gsDefine.globals = _globals;



/*
 * ----------------------------------------------------------------
 * Ease
 * ----------------------------------------------------------------
 */
    var _baseParams = [0, 0, 1, 1],
      _blankArray = [],
      Ease = _class("easing.Ease", function(func, extraParams, type, power) {
        this._func = func;
        this._type = type || 0;
        this._power = power || 0;
        this._params = extraParams ? _baseParams.concat(extraParams) : _baseParams;
      }, true),
      _easeMap = Ease.map = {},
      _easeReg = Ease.register = function(ease, names, types, create) {
        var na = names.split(","),
          i = na.length,
          ta = (types || "easeIn,easeOut,easeInOut").split(","),
          e, name, j, type;
        while (--i > -1) {
          name = na[i];
          e = create ? _class("easing."+name, null, true) : gs.easing[name] || {};
          j = ta.length;
          while (--j > -1) {
            type = ta[j];
            _easeMap[name + "." + type] = _easeMap[type + name] = e[type] = ease.getRatio ? ease : ease[type] || new ease();
          }
        }
      };
    
    p = Ease.prototype;
    p._calcEnd = false;
    p.getRatio = function(p) {
      if (this._func) {
        this._params[0] = p;
        return this._func.apply(null, this._params);
      }
      var t = this._type,
        pw = this._power,
        r = (t === 1) ? 1 - p : (t === 2) ? p : (p < 0.5) ? p * 2 : (1 - p) * 2;
      if (pw === 1) {
        r *= r;
      } else if (pw === 2) {
        r *= r * r;
      } else if (pw === 3) {
        r *= r * r * r;
      } else if (pw === 4) {
        r *= r * r * r * r;
      }
      return (t === 1) ? 1 - r : (t === 2) ? r : (p < 0.5) ? r / 2 : 1 - (r / 2);
    };

    //create all the standard eases like Linear, Quad, Cubic, Quart, Quint, Strong, Power0, Power1, Power2, Power3, and Power4 (each with easeIn, easeOut, and easeInOut)
    a = ["Linear","Quad","Cubic","Quart","Quint,Strong"];
    i = a.length;
    while (--i > -1) {
      p = a[i]+",Power"+i;
      _easeReg(new Ease(null,null,1,i), p, "easeOut", true);
      _easeReg(new Ease(null,null,2,i), p, "easeIn" + ((i === 0) ? ",easeNone" : ""));
      _easeReg(new Ease(null,null,3,i), p, "easeInOut");
    }
    _easeMap.linear = gs.easing.Linear.easeIn;
    _easeMap.swing = gs.easing.Quad.easeInOut; //for jQuery folks


/*
 * ----------------------------------------------------------------
 * EventDispatcher
 * ----------------------------------------------------------------
 */
    var EventDispatcher = _class("events.EventDispatcher", function(target) {
      this._listeners = {};
      this._eventTarget = target || this;
    });
    p = EventDispatcher.prototype;

    p.addEventListener = function(type, callback, scope, useParam, priority) {
      priority = priority || 0;
      var list = this._listeners[type],
        index = 0,
        listener, i;
      if (list == null) {
        this._listeners[type] = list = [];
      }
      i = list.length;
      while (--i > -1) {
        listener = list[i];
        if (listener.c === callback && listener.s === scope) {
          list.splice(i, 1);
        } else if (index === 0 && listener.pr < priority) {
          index = i + 1;
        }
      }
      list.splice(index, 0, {c:callback, s:scope, up:useParam, pr:priority});
      if (this === _ticker && !_tickerActive) {
        _ticker.wake();
      }
    };
    
    p.removeEventListener = function(type, callback) {
      var list = this._listeners[type], i;
      if (list) {
        i = list.length;
        while (--i > -1) {
          if (list[i].c === callback) {
            list.splice(i, 1);
            return;
          }
        }
      }
    };
    
    p.dispatchEvent = function(type) {
      var list = this._listeners[type],
        i, t, listener;
      if (list) {
        i = list.length;
        t = this._eventTarget;
        while (--i > -1) {
          listener = list[i];
          if (listener.up) {
            listener.c.call(listener.s || t, {type:type, target:t});
          } else {
            listener.c.call(listener.s || t);
          }
        }
      }
    };


/*
 * ----------------------------------------------------------------
 * Ticker
 * ----------------------------------------------------------------
 */
    var _reqAnimFrame = window.requestAnimationFrame, 
      _cancelAnimFrame = window.cancelAnimationFrame, 
      _getTime = Date.now || function() {return new Date().getTime();};
    
    //now try to determine the requestAnimationFrame and cancelAnimationFrame functions and if none are found, we'll use a setTimeout()/clearTimeout() polyfill.
    a = ["ms","moz","webkit","o"];
    i = a.length;
    while (--i > -1 && !_reqAnimFrame) {
      _reqAnimFrame = window[a[i] + "RequestAnimationFrame"];
      _cancelAnimFrame = window[a[i] + "CancelAnimationFrame"] || window[a[i] + "CancelRequestAnimationFrame"];
    }

    _class("Ticker", function(fps, useRAF) {
      var _self = this,
        _startTime = _getTime(),
        _useRAF = (useRAF !== false && _reqAnimFrame),
        _fps, _req, _id, _gap, _nextTime,
        _tick = function(manual) {
          _self.time = (_getTime() - _startTime) / 1000;
          var overlap = _self.time - _nextTime,
            dispatch;
          if (!_fps || overlap > 0 || manual === true) {
            _self.frame++;
            _nextTime += overlap + (overlap >= _gap ? 0.004 : _gap - overlap);
            dispatch = true;
          }
          if (manual !== true) { //make sure the request is made before we dispatch the "tick" event so that timing is maintained. Otherwise, if processing the "tick" requires a bunch of time (like 15ms) and we're using a setTimeout() that's based on 16.7ms, it'd technically take 31.7ms between frames otherwise.
            _id = _req(_tick);
          }
          if (dispatch) {
            _self.dispatchEvent("tick");
          }
        };

      EventDispatcher.call(_self);
      this.time = this.frame = 0;
      this.tick = function() {
        _tick(true);
      };

      this.sleep = function() {
        if (_id == null) {
          return;
        }
        if (!_useRAF || !_cancelAnimFrame) {
          clearTimeout(_id);
        } else {
          _cancelAnimFrame(_id);
        }
        _req = _emptyFunc;
        _id = null;
        if (_self === _ticker) {
          _tickerActive = false;
        }
      };

      this.wake = function() {
        if (_id !== null) {
          _self.sleep();
        }
        _req = (_fps === 0) ? _emptyFunc : (!_useRAF || !_reqAnimFrame) ? function(f) { return setTimeout(f, ((_nextTime - _self.time) * 1000 + 1) | 0); } : _reqAnimFrame;
        if (_self === _ticker) {
          _tickerActive = true;
        }
        _tick(2);
      };

      this.fps = function(value) {
        if (!arguments.length) {
          return _fps;
        }
        _fps = value;
        _gap = 1 / (_fps || 60);
        _nextTime = this.time + _gap;
        _self.wake();
      };

      this.useRAF = function(value) {
        if (!arguments.length) {
          return _useRAF;
        }
        _self.sleep();
        _useRAF = value;
        _self.fps(_fps);
      };
      _self.fps(fps);

      //a bug in iOS 6 Safari occasionally prevents the requestAnimationFrame from working initially, so we use a 1.5-second timeout that automatically falls back to setTimeout() if it senses this condition.
      setTimeout(function() {
        if (_useRAF && (!_id || _self.frame < 5)) {
          _self.useRAF(false);
        }
      }, 1500);
    });
    
    p = gs.Ticker.prototype = new gs.events.EventDispatcher();
    p.constructor = gs.Ticker;

    //some browsers (like iOS) occasionally stop dispatching requestAnimationFrame events when the user switches to a different tab and then comes back again, so we use a 2-second setTimeout() to sense if/when that condition occurs and then wake() the timer.
    /*
    (function(time) {
      var checkTimeout = function() {
          var t = _getTime();
          if (t - time > 3000) {
            _ticker.wake();
          }
          time = t;
          setTimeout(checkTimeout, 2000);
        };
      checkTimeout();
    }(_getTime()));
    */

/*
 * ----------------------------------------------------------------
 * Animation
 * ----------------------------------------------------------------
 */
    var Animation = _class("core.Animation", function(duration, vars) {
        this.vars = vars || {};
        this._duration = this._totalDuration = duration || 0;
        this._delay = Number(this.vars.delay) || 0;
        this._timeScale = 1;
        this._active = (this.vars.immediateRender === true);
        this.data = this.vars.data;
        this._reversed = (this.vars.reversed === true);
        
        if (!_rootTimeline) {
          return;
        }
        if (!_tickerActive) {
          _ticker.wake();
        }

        var tl = this.vars.useFrames ? _rootFramesTimeline : _rootTimeline;
        tl.add(this, tl._time);
        
        if (this.vars.paused) {
          this.paused(true);
        }
      });

    _ticker = Animation.ticker = new gs.Ticker();
    p = Animation.prototype;
    p._dirty = p._gc = p._initted = p._paused = false;
    p._totalTime = p._time = 0;
    p._rawPrevTime = -1;
    p._next = p._last = p._onUpdate = p._timeline = p.timeline = null;
    p._paused = false;
    
    p.play = function(from, suppressEvents) {
      if (arguments.length) {
        this.seek(from, suppressEvents);
      }
      return this.reversed(false).paused(false);
    };
    
    p.pause = function(atTime, suppressEvents) {
      if (arguments.length) {
        this.seek(atTime, suppressEvents);
      }
      return this.paused(true);
    };
    
    p.resume = function(from, suppressEvents) {
      if (arguments.length) {
        this.seek(from, suppressEvents);
      }
      return this.paused(false);
    };
    
    p.seek = function(time, suppressEvents) {
      return this.totalTime(Number(time), suppressEvents !== false);
    };
    
    p.restart = function(includeDelay, suppressEvents) {
      return this.reversed(false).paused(false).totalTime(includeDelay ? -this._delay : 0, (suppressEvents !== false), true);
    };
    
    p.reverse = function(from, suppressEvents) {
      if (arguments.length) {
        this.seek((from || this.totalDuration()), suppressEvents);
      }
      return this.reversed(true).paused(false);
    };
    
    p.render = function() {
      
    };
    
    p.invalidate = function() {
      return this;
    };
    
    p._enabled = function (enabled, ignoreTimeline) {
      if (!_tickerActive) {
        _ticker.wake();
      }
      this._gc = !enabled; 
      this._active = (enabled && !this._paused && this._totalTime > 0 && this._totalTime < this._totalDuration);
      if (ignoreTimeline !== true) {
        if (enabled && !this.timeline) {
          this._timeline.add(this, this._startTime - this._delay);
        } else if (!enabled && this.timeline) {
          this._timeline._remove(this, true);
        }
      }
      return false;
    };
  
    
    p._kill = function(vars, target) {
      return this._enabled(false, false);
    };
    
    p.kill = function(vars, target) {
      this._kill(vars, target);
      return this;
    };
    
    p._uncache = function(includeSelf) {
      var tween = includeSelf ? this : this.timeline;
      while (tween) {
        tween._dirty = true;
        tween = tween.timeline;
      }
      return this;
    };

    p._swapSelfInParams = function(params) {
      var i = params.length,
        copy = params.concat();
      while (--i > -1) {
        if (params[i] === "{self}") {
          copy[i] = this;
        }
      }
      return copy;
    };
  
//----Animation getters/setters --------------------------------------------------------
    
    p.eventCallback = function(type, callback, params, scope) {
      if ((type || "").substr(0,2) === "on") {
        var v = this.vars;
        if (arguments.length === 1) {
          return v[type];
        }
        if (callback == null) {
          delete v[type];
        } else {
          v[type] = callback;
          v[type + "Params"] = ((params instanceof Array) && params.join("").indexOf("{self}") !== -1) ? this._swapSelfInParams(params) : params;
          v[type + "Scope"] = scope;
        }
        if (type === "onUpdate") {
          this._onUpdate = callback;
        }
      }
      return this;
    };
    
    p.delay = function(value) {
      if (!arguments.length) {
        return this._delay;
      }
      if (this._timeline.smoothChildTiming) {
        this.startTime( this._startTime + value - this._delay );
      }
      this._delay = value;
      return this;
    };
    
    p.duration = function(value) {
      if (!arguments.length) {
        this._dirty = false;
        return this._duration;
      }
      this._duration = this._totalDuration = value;
      this._uncache(true); //true in case it's a TweenMax or TimelineMax that has a repeat - we'll need to refresh the totalDuration. 
      if (this._timeline.smoothChildTiming) if (this._time > 0) if (this._time < this._duration) if (value !== 0) {
        this.totalTime(this._totalTime * (value / this._duration), true);
      }
      return this;
    };
    
    p.totalDuration = function(value) {
      this._dirty = false;
      return (!arguments.length) ? this._totalDuration : this.duration(value);
    };
    
    p.time = function(value, suppressEvents) {
      if (!arguments.length) {
        return this._time;
      }
      if (this._dirty) {
        this.totalDuration();
      }
      return this.totalTime((value > this._duration) ? this._duration : value, suppressEvents);
    };
    
    p.totalTime = function(time, suppressEvents, uncapped) {
      if (!_tickerActive) {
        _ticker.wake();
      }
      if (!arguments.length) {
        return this._totalTime;
      }
      if (this._timeline) {
        if (time < 0 && !uncapped) {
          time += this.totalDuration();
        }
        if (this._timeline.smoothChildTiming) {
          if (this._dirty) {
            this.totalDuration();
          }
          var totalDuration = this._totalDuration,
            tl = this._timeline;
          if (time > totalDuration && !uncapped) {
            time = totalDuration;
          }
          this._startTime = (this._paused ? this._pauseTime : tl._time) - ((!this._reversed ? time : totalDuration - time) / this._timeScale);
          if (!tl._dirty) { //for performance improvement. If the parent's cache is already dirty, it already took care of marking the ancestors as dirty too, so skip the function call here.
            this._uncache(false);
          }
          //in case any of the ancestor timelines had completed but should now be enabled, we should reset their totalTime() which will also ensure that they're lined up properly and enabled. Skip for animations that are on the root (wasteful). Example: a TimelineLite.exportRoot() is performed when there's a paused tween on the root, the export will not complete until that tween is unpaused, but imagine a child gets restarted later, after all [unpaused] tweens have completed. The startTime of that child would get pushed out, but one of the ancestors may have completed.
          if (tl._timeline) {
            while (tl._timeline) {
              if (tl._timeline._time !== (tl._startTime + tl._totalTime) / tl._timeScale) {
                tl.totalTime(tl._totalTime, true);
              }
              tl = tl._timeline;
            }
          }
        }
        if (this._gc) {
          this._enabled(true, false);
        }
        if (this._totalTime !== time) {
          this.render(time, suppressEvents, false);
        }
      }
      return this;
    };
    
    p.startTime = function(value) {
      if (!arguments.length) {
        return this._startTime;
      }
      if (value !== this._startTime) {
        this._startTime = value;
        if (this.timeline) if (this.timeline._sortChildren) {
          this.timeline.add(this, value - this._delay); //ensures that any necessary re-sequencing of Animations in the timeline occurs to make sure the rendering order is correct.
        }
      }
      return this;
    };
    
    p.timeScale = function(value) {
      if (!arguments.length) {
        return this._timeScale;
      }
      value = value || 0.000001; //can't allow zero because it'll throw the math off
      if (this._timeline && this._timeline.smoothChildTiming) {
        var pauseTime = this._pauseTime,
          t = (pauseTime || pauseTime === 0) ? pauseTime : this._timeline.totalTime();
        this._startTime = t - ((t - this._startTime) * this._timeScale / value);
      }
      this._timeScale = value;
      return this._uncache(false);
    };
    
    p.reversed = function(value) {
      if (!arguments.length) {
        return this._reversed;
      }
      if (value != this._reversed) {
        this._reversed = value;
        this.totalTime(this._totalTime, true);
      }
      return this;
    };
    
    p.paused = function(value) {
      if (!arguments.length) {
        return this._paused;
      }
      if (value != this._paused) if (this._timeline) {
        if (!_tickerActive && !value) {
          _ticker.wake();
        }
        var tl = this._timeline,
          raw = tl.rawTime(),
          elapsed = raw - this._pauseTime;
        if (!value && tl.smoothChildTiming) {
          this._startTime += elapsed;
          this._uncache(false);
        }
        this._pauseTime = value ? raw : null;
        this._paused = value;
        this._active = (!value && this._totalTime > 0 && this._totalTime < this._totalDuration);
        if (!value && elapsed !== 0 && this._duration !== 0) {
          this.render((tl.smoothChildTiming ? this._totalTime : (raw - this._startTime) / this._timeScale), true, true); //in case the target's properties changed via some other tween or manual update by the user, we should force a render.
        }
      }
      if (this._gc && !value) {
        this._enabled(true, false);
      }
      return this;
    };
  

/*
 * ----------------------------------------------------------------
 * SimpleTimeline
 * ----------------------------------------------------------------
 */
    var SimpleTimeline = _class("core.SimpleTimeline", function(vars) {
      Animation.call(this, 0, vars);
      this.autoRemoveChildren = this.smoothChildTiming = true;
    });
    
    p = SimpleTimeline.prototype = new Animation();
    p.constructor = SimpleTimeline;
    p.kill()._gc = false;
    p._first = p._last = null;
    p._sortChildren = false;

    p.add = p.insert = function(child, position, align, stagger) {
      var prevTween, st;
      child._startTime = Number(position || 0) + child._delay;
      if (child._paused) if (this !== child._timeline) { //we only adjust the _pauseTime if it wasn't in this timeline already. Remember, sometimes a tween will be inserted again into the same timeline when its startTime is changed so that the tweens in the TimelineLite/Max are re-ordered properly in the linked list (so everything renders in the proper order).
        child._pauseTime = child._startTime + ((this.rawTime() - child._startTime) / child._timeScale);
      }
      if (child.timeline) {
        child.timeline._remove(child, true); //removes from existing timeline so that it can be properly added to this one.
      }
      child.timeline = child._timeline = this;
      if (child._gc) {
        child._enabled(true, true);
      }
      prevTween = this._last;
      if (this._sortChildren) {
        st = child._startTime;
        while (prevTween && prevTween._startTime > st) {
          prevTween = prevTween._prev;
        }
      }
      if (prevTween) {
        child._next = prevTween._next;
        prevTween._next = child;
      } else {
        child._next = this._first;
        this._first = child;
      }
      if (child._next) {
        child._next._prev = child;
      } else {
        this._last = child;
      }
      child._prev = prevTween;
      if (this._timeline) {
        this._uncache(true);
      }
      return this;
    };
    
    p._remove = function(tween, skipDisable) {
      if (tween.timeline === this) {
        if (!skipDisable) {
          tween._enabled(false, true);
        }
        tween.timeline = null;
        
        if (tween._prev) {
          tween._prev._next = tween._next;
        } else if (this._first === tween) {
          this._first = tween._next;
        }
        if (tween._next) {
          tween._next._prev = tween._prev;
        } else if (this._last === tween) {
          this._last = tween._prev;
        }
        
        if (this._timeline) {
          this._uncache(true);
        }
      }
      return this;
    };
    
    p.render = function(time, suppressEvents, force) {
      var tween = this._first, 
        next;
      this._totalTime = this._time = this._rawPrevTime = time;
      while (tween) {
        next = tween._next; //record it here because the value could change after rendering...
        if (tween._active || (time >= tween._startTime && !tween._paused)) {
          if (!tween._reversed) {
            tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
          } else {
            tween.render(((!tween._dirty) ? tween._totalDuration : tween.totalDuration()) - ((time - tween._startTime) * tween._timeScale), suppressEvents, force);
          }
        }
        tween = next;
      }
    };
        
    p.rawTime = function() {
      if (!_tickerActive) {
        _ticker.wake();
      }
      return this._totalTime;     
    };
  
  
/*
 * ----------------------------------------------------------------
 * TweenLite
 * ----------------------------------------------------------------
 */
    var TweenLite = _class("TweenLite", function(target, duration, vars) {
        Animation.call(this, duration, vars);
        this.render = TweenLite.prototype.render; //speed optimization (avoid prototype lookup on this "hot" method)

        if (target == null) {
          throw "Cannot tween a null target.";
        }

        this.target = target = (typeof(target) !== "string") ? target : TweenLite.selector(target) || target;

        var isSelector = (target.jquery || (target.length && target !== window && target[0] && (target[0] === window || (target[0].nodeType && target[0].style && !target.nodeType)))),
          overwrite = this.vars.overwrite,
          i, targ, targets;

        this._overwrite = overwrite = (overwrite == null) ? _overwriteLookup[TweenLite.defaultOverwrite] : (typeof(overwrite) === "number") ? overwrite >> 0 : _overwriteLookup[overwrite];

        if ((isSelector || target instanceof Array) && typeof(target[0]) !== "number") {
          this._targets = targets = _slice.call(target, 0);
          this._propLookup = [];
          this._siblings = [];
          for (i = 0; i < targets.length; i++) {
            targ = targets[i];
            if (!targ) {
              targets.splice(i--, 1);
              continue;
            } else if (typeof(targ) === "string") {
              targ = targets[i--] = TweenLite.selector(targ); //in case it's an array of strings
              if (typeof(targ) === "string") {
                targets.splice(i+1, 1); //to avoid an endless loop (can't imagine why the selector would return a string, but just in case)
              }
              continue;
            } else if (targ.length && targ !== window && targ[0] && (targ[0] === window || (targ[0].nodeType && targ[0].style && !targ.nodeType))) { //in case the user is passing in an array of selector objects (like jQuery objects), we need to check one more level and pull things out if necessary. Also note that <select> elements pass all the criteria regarding length and the first child having style, so we must also check to ensure the target isn't an HTML node itself.
              targets.splice(i--, 1);
              this._targets = targets = targets.concat(_slice.call(targ, 0));
              continue;
            }
            this._siblings[i] = _register(targ, this, false);
            if (overwrite === 1) if (this._siblings[i].length > 1) {
              _applyOverwrite(targ, this, null, 1, this._siblings[i]);
            }
          }

        } else {
          this._propLookup = {};
          this._siblings = _register(target, this, false);
          if (overwrite === 1) if (this._siblings.length > 1) {
            _applyOverwrite(target, this, null, 1, this._siblings);
          }
        }
        if (this.vars.immediateRender || (duration === 0 && this._delay === 0 && this.vars.immediateRender !== false)) {
          this.render(-this._delay, false, true);
        }
      }, true),
      _isSelector = function(v) {
        return (v.length && v !== window && v[0] && (v[0] === window || (v[0].nodeType && v[0].style && !v.nodeType))); //we cannot check "nodeType" if the target is window from within an iframe, otherwise it will trigger a security error in some browsers like Firefox.
      },
      _autoCSS = function(vars, target) {
        var css = {},
          p;
        for (p in vars) {
          if (!_reservedProps[p] && (!(p in target) || p === "x" || p === "y" || p === "width" || p === "height" || p === "className" || p === "border") && (!_plugins[p] || (_plugins[p] && _plugins[p]._autoCSS))) { //note: <img> elements contain read-only "x" and "y" properties. We should also prioritize editing css width/height rather than the element's properties.
            css[p] = vars[p];
            delete vars[p];
          }
        }
        vars.css = css;
      };
  
    p = TweenLite.prototype = new Animation();
    p.constructor = TweenLite;
    p.kill()._gc = false;
  
//----TweenLite defaults, overwrite management, and root updates ----------------------------------------------------
  
    p.ratio = 0;
    p._firstPT = p._targets = p._overwrittenProps = p._startAt = null;
    p._notifyPluginsOfEnabled = false;
    
    TweenLite.version = "1.10.2";
    TweenLite.defaultEase = p._ease = new Ease(null, null, 1, 1);
    TweenLite.defaultOverwrite = "auto";
    TweenLite.ticker = _ticker;
    TweenLite.autoSleep = true;
    TweenLite.selector = window.$ || window.jQuery || function(e) { if (window.$) { TweenLite.selector = window.$; return window.$(e); } return window.document ? window.document.getElementById((e.charAt(0) === "#") ? e.substr(1) : e) : e; };

    var _internals = TweenLite._internals = {}, //gives us a way to expose certain private values to other GreenSock classes without contaminating tha main TweenLite object.
      _plugins = TweenLite._plugins = {},
      _tweenLookup = TweenLite._tweenLookup = {}, 
      _tweenLookupNum = 0,
      _reservedProps = _internals.reservedProps = {ease:1, delay:1, overwrite:1, onComplete:1, onCompleteParams:1, onCompleteScope:1, useFrames:1, runBackwards:1, startAt:1, onUpdate:1, onUpdateParams:1, onUpdateScope:1, onStart:1, onStartParams:1, onStartScope:1, onReverseComplete:1, onReverseCompleteParams:1, onReverseCompleteScope:1, onRepeat:1, onRepeatParams:1, onRepeatScope:1, easeParams:1, yoyo:1, immediateRender:1, repeat:1, repeatDelay:1, data:1, paused:1, reversed:1, autoCSS:1},
      _overwriteLookup = {none:0, all:1, auto:2, concurrent:3, allOnStart:4, preexisting:5, "true":1, "false":0},
      _rootFramesTimeline = Animation._rootFramesTimeline = new SimpleTimeline(), 
      _rootTimeline = Animation._rootTimeline = new SimpleTimeline();
      
    _rootTimeline._startTime = _ticker.time;
    _rootFramesTimeline._startTime = _ticker.frame;
    _rootTimeline._active = _rootFramesTimeline._active = true;
    
    Animation._updateRoot = function() {
        _rootTimeline.render((_ticker.time - _rootTimeline._startTime) * _rootTimeline._timeScale, false, false);
        _rootFramesTimeline.render((_ticker.frame - _rootFramesTimeline._startTime) * _rootFramesTimeline._timeScale, false, false);
        if (!(_ticker.frame % 120)) { //dump garbage every 120 frames...
          var i, a, p;
          for (p in _tweenLookup) {
            a = _tweenLookup[p].tweens;
            i = a.length;
            while (--i > -1) {
              if (a[i]._gc) {
                a.splice(i, 1);
              }
            }
            if (a.length === 0) {
              delete _tweenLookup[p];
            }
          }
          //if there are no more tweens in the root timelines, or if they're all paused, make the _timer sleep to reduce load on the CPU slightly
          p = _rootTimeline._first;
          if (!p || p._paused) if (TweenLite.autoSleep && !_rootFramesTimeline._first && _ticker._listeners.tick.length === 1) {
            while (p && p._paused) {
              p = p._next;
            }
            if (!p) {
              _ticker.sleep();
            }
          }
        }
      };
    
    _ticker.addEventListener("tick", Animation._updateRoot);
    
    var _register = function(target, tween, scrub) {
        var id = target._gsTweenID, a, i;
        if (!_tweenLookup[id || (target._gsTweenID = id = "t" + (_tweenLookupNum++))]) {
          _tweenLookup[id] = {target:target, tweens:[]};
        }
        if (tween) {
          a = _tweenLookup[id].tweens;
          a[(i = a.length)] = tween;
          if (scrub) {
            while (--i > -1) {
              if (a[i] === tween) {
                a.splice(i, 1);
              }
            }
          }
        }
        return _tweenLookup[id].tweens;
      },
      
      _applyOverwrite = function(target, tween, props, mode, siblings) {
        var i, changed, curTween, l;
        if (mode === 1 || mode >= 4) {
          l = siblings.length;
          for (i = 0; i < l; i++) {
            if ((curTween = siblings[i]) !== tween) {
              if (!curTween._gc) if (curTween._enabled(false, false)) {
                changed = true;
              }
            } else if (mode === 5) {
              break;
            }
          }
          return changed;
        }
        //NOTE: Add 0.0000000001 to overcome floating point errors that can cause the startTime to be VERY slightly off (when a tween's time() is set for example)
        var startTime = tween._startTime + 0.0000000001, 
          overlaps = [], 
          oCount = 0,
          zeroDur = (tween._duration === 0),
          globalStart;
        i = siblings.length;
        while (--i > -1) {
          if ((curTween = siblings[i]) === tween || curTween._gc || curTween._paused) {
            //ignore
          } else if (curTween._timeline !== tween._timeline) {
            globalStart = globalStart || _checkOverlap(tween, 0, zeroDur);
            if (_checkOverlap(curTween, globalStart, zeroDur) === 0) {
              overlaps[oCount++] = curTween;
            }
          } else if (curTween._startTime <= startTime) if (curTween._startTime + curTween.totalDuration() / curTween._timeScale + 0.0000000001 > startTime) if (!((zeroDur || !curTween._initted) && startTime - curTween._startTime <= 0.0000000002)) {
            overlaps[oCount++] = curTween;
          }
        }
        
        i = oCount;
        while (--i > -1) {
          curTween = overlaps[i];
          if (mode === 2) if (curTween._kill(props, target)) {
            changed = true;
          }
          if (mode !== 2 || (!curTween._firstPT && curTween._initted)) { 
            if (curTween._enabled(false, false)) { //if all property tweens have been overwritten, kill the tween.
              changed = true;
            }
          }
        }
        return changed;
      },
      
      _checkOverlap = function(tween, reference, zeroDur) {
        var tl = tween._timeline, 
          ts = tl._timeScale, 
          t = tween._startTime,
          min = 0.0000000001; //we use this to protect from rounding errors.
        while (tl._timeline) {
          t += tl._startTime;
          ts *= tl._timeScale;
          if (tl._paused) {
            return -100;
          }
          tl = tl._timeline;
        }
        t /= ts;
        return (t > reference) ? t - reference : ((zeroDur && t === reference) || (!tween._initted && t - reference < 2 * min)) ? min : ((t += tween.totalDuration() / tween._timeScale / ts) > reference + min) ? 0 : t - reference - min;
      };

  
//---- TweenLite instance methods -----------------------------------------------------------------------------

    p._init = function() {
      var v = this.vars,
        op = this._overwrittenProps,
        dur = this._duration,
        immediate = v.immediateRender,
        ease = v.ease,
        i, initPlugins, pt, p;
      if (v.startAt) {
        if (this._startAt) {
          this._startAt.render(-1, true); //if we've run a startAt previously (when the tween instantiated), we should revert it so that the values re-instantiate correctly particularly for relative tweens. Without this, a TweenLite.fromTo(obj, 1, {x:"+=100"}, {x:"-=100"}), for example, would actually jump to +=200 because the startAt would run twice, doubling the relative change.
        }
        v.startAt.overwrite = 0;
        v.startAt.immediateRender = true;
        this._startAt = TweenLite.to(this.target, 0, v.startAt);
        if (immediate) {
          if (this._time > 0) {
            this._startAt = null; //tweens that render immediately (like most from() and fromTo() tweens) shouldn't revert when their parent timeline's playhead goes backward past the startTime because the initial render could have happened anytime and it shouldn't be directly correlated to this tween's startTime. Imagine setting up a complex animation where the beginning states of various objects are rendered immediately but the tween doesn't happen for quite some time - if we revert to the starting values as soon as the playhead goes backward past the tween's startTime, it will throw things off visually. Reversion should only happen in TimelineLite/Max instances where immediateRender was false (which is the default in the convenience methods like from()).
          } else if (dur !== 0) {
            return; //we skip initialization here so that overwriting doesn't occur until the tween actually begins. Otherwise, if you create several immediateRender:true tweens of the same target/properties to drop into a TimelineLite or TimelineMax, the last one created would overwrite the first ones because they didn't get placed into the timeline yet before the first render occurs and kicks in overwriting.
          }
        }
      } else if (v.runBackwards && v.immediateRender && dur !== 0) {
        //from() tweens must be handled uniquely: their beginning values must be rendered but we don't want overwriting to occur yet (when time is still 0). Wait until the tween actually begins before doing all the routines like overwriting. At that time, we should render at the END of the tween to ensure that things initialize correctly (remember, from() tweens go backwards)
        if (this._startAt) {
          this._startAt.render(-1, true);
          this._startAt = null;
        } else if (this._time === 0) {
          pt = {};
          for (p in v) { //copy props into a new object and skip any reserved props, otherwise onComplete or onUpdate or onStart could fire. We should, however, permit autoCSS to go through.
            if (!_reservedProps[p] || p === "autoCSS") {
              pt[p] = v[p];
            }
          }
          pt.overwrite = 0;
          this._startAt = TweenLite.to(this.target, 0, pt);
          return;
        }
      }
      if (!ease) {
        this._ease = TweenLite.defaultEase;
      } else if (ease instanceof Ease) {
        this._ease = (v.easeParams instanceof Array) ? ease.config.apply(ease, v.easeParams) : ease;
      } else {
        this._ease = (typeof(ease) === "function") ? new Ease(ease, v.easeParams) : _easeMap[ease] || TweenLite.defaultEase;
      }
      this._easeType = this._ease._type;
      this._easePower = this._ease._power;
      this._firstPT = null;
      
      if (this._targets) {
        i = this._targets.length;
        while (--i > -1) {
          if ( this._initProps( this._targets[i], (this._propLookup[i] = {}), this._siblings[i], (op ? op[i] : null)) ) {
            initPlugins = true;
          }
        }
      } else {
        initPlugins = this._initProps(this.target, this._propLookup, this._siblings, op);
      }
      
      if (initPlugins) {
        TweenLite._onPluginEvent("_onInitAllProps", this); //reorders the array in order of priority. Uses a static TweenPlugin method in order to minimize file size in TweenLite
      }
      if (op) if (!this._firstPT) if (typeof(this.target) !== "function") { //if all tweening properties have been overwritten, kill the tween. If the target is a function, it's probably a delayedCall so let it live.
        this._enabled(false, false);
      }
      if (v.runBackwards) {
        pt = this._firstPT;
        while (pt) {
          pt.s += pt.c;
          pt.c = -pt.c;
          pt = pt._next;
        }
      }
      this._onUpdate = v.onUpdate;
      this._initted = true;
    };
    
    p._initProps = function(target, propLookup, siblings, overwrittenProps) {
      var p, i, initPlugins, plugin, a, pt, v;
      if (target == null) {
        return false;
      }
      if (!this.vars.css) if (target.style) if (target !== window && target.nodeType) if (_plugins.css) if (this.vars.autoCSS !== false) { //it's so common to use TweenLite/Max to animate the css of DOM elements, we assume that if the target is a DOM element, that's what is intended (a convenience so that users don't have to wrap things in css:{}, although we still recommend it for a slight performance boost and better specificity). Note: we cannot check "nodeType" on the window inside an iframe.
        _autoCSS(this.vars, target);
      }
      for (p in this.vars) {
        v = this.vars[p];
        if (_reservedProps[p]) {
          if (v instanceof Array) if (v.join("").indexOf("{self}") !== -1) {
            this.vars[p] = v = this._swapSelfInParams(v, this);
          }
          
        } else if (_plugins[p] && (plugin = new _plugins[p]())._onInitTween(target, this.vars[p], this)) {
          
          //t - target    [object]
          //p - property    [string]
          //s - start     [number]
          //c - change    [number]
          //f - isFunction  [boolean]
          //n - name      [string]
          //pg - isPlugin   [boolean]
          //pr - priority   [number]
          this._firstPT = pt = {_next:this._firstPT, t:plugin, p:"setRatio", s:0, c:1, f:true, n:p, pg:true, pr:plugin._priority};
          i = plugin._overwriteProps.length;
          while (--i > -1) {
            propLookup[plugin._overwriteProps[i]] = this._firstPT;
          }
          if (plugin._priority || plugin._onInitAllProps) {
            initPlugins = true;
          }
          if (plugin._onDisable || plugin._onEnable) {
            this._notifyPluginsOfEnabled = true;
          }
          
        } else {
          this._firstPT = propLookup[p] = pt = {_next:this._firstPT, t:target, p:p, f:(typeof(target[p]) === "function"), n:p, pg:false, pr:0};
          pt.s = (!pt.f) ? parseFloat(target[p]) : target[ ((p.indexOf("set") || typeof(target["get" + p.substr(3)]) !== "function") ? p : "get" + p.substr(3)) ]();
          pt.c = (typeof(v) === "string" && v.charAt(1) === "=") ? parseInt(v.charAt(0) + "1", 10) * Number(v.substr(2)) : (Number(v) - pt.s) || 0;
        }
        if (pt) if (pt._next) {
          pt._next._prev = pt;
        }
      }
      
      if (overwrittenProps) if (this._kill(overwrittenProps, target)) { //another tween may have tried to overwrite properties of this tween before init() was called (like if two tweens start at the same time, the one created second will run first)
        return this._initProps(target, propLookup, siblings, overwrittenProps);
      }
      if (this._overwrite > 1) if (this._firstPT) if (siblings.length > 1) if (_applyOverwrite(target, this, propLookup, this._overwrite, siblings)) {
        this._kill(propLookup, target);
        return this._initProps(target, propLookup, siblings, overwrittenProps);
      }
      return initPlugins;
    };
    
    p.render = function(time, suppressEvents, force) {
      var prevTime = this._time,
        isComplete, callback, pt;
      if (time >= this._duration) {
        this._totalTime = this._time = this._duration;
        this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1;
        if (!this._reversed) {
          isComplete = true;
          callback = "onComplete";
        }
        if (this._duration === 0) { //zero-duration tweens are tricky because we must discern the momentum/direction of time in order to determine whether the starting values should be rendered or the ending values. If the "playhead" of its timeline goes past the zero-duration tween in the forward direction or lands directly on it, the end values should be rendered, but if the timeline's "playhead" moves past it in the backward direction (from a postitive time to a negative time), the starting values must be rendered.
          if (time === 0 || this._rawPrevTime < 0) if (this._rawPrevTime !== time) {
            force = true;
            if (this._rawPrevTime > 0) {
              callback = "onReverseComplete";
              if (suppressEvents) {
                time = -1; //when a callback is placed at the VERY beginning of a timeline and it repeats (or if timeline.seek(0) is called), events are normally suppressed during those behaviors (repeat or seek()) and without adjusting the _rawPrevTime back slightly, the onComplete wouldn't get called on the next render. This only applies to zero-duration tweens/callbacks of course.
              }
            }
          }
          this._rawPrevTime = time;
        }
        
      } else if (time < 0.0000001) { //to work around occasional floating point math artifacts, round super small values to 0.
        this._totalTime = this._time = 0;
        this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0;
        if (prevTime !== 0 || (this._duration === 0 && this._rawPrevTime > 0)) {
          callback = "onReverseComplete";
          isComplete = this._reversed;
        }
        if (time < 0) {
          this._active = false;
          if (this._duration === 0) { //zero-duration tweens are tricky because we must discern the momentum/direction of time in order to determine whether the starting values should be rendered or the ending values. If the "playhead" of its timeline goes past the zero-duration tween in the forward direction or lands directly on it, the end values should be rendered, but if the timeline's "playhead" moves past it in the backward direction (from a postitive time to a negative time), the starting values must be rendered.
            if (this._rawPrevTime >= 0) {
              force = true;
            }
            this._rawPrevTime = time;
          }
        } else if (!this._initted) { //if we render the very beginning (time == 0) of a fromTo(), we must force the render (normal tweens wouldn't need to render at a time of 0 when the prevTime was also 0). This is also mandatory to make sure overwriting kicks in immediately.
          force = true;
        }
        
      } else {
        this._totalTime = this._time = time;
        
        if (this._easeType) {
          var r = time / this._duration, type = this._easeType, pow = this._easePower;
          if (type === 1 || (type === 3 && r >= 0.5)) {
            r = 1 - r;
          }
          if (type === 3) {
            r *= 2;
          }
          if (pow === 1) {
            r *= r;
          } else if (pow === 2) {
            r *= r * r;
          } else if (pow === 3) {
            r *= r * r * r;
          } else if (pow === 4) {
            r *= r * r * r * r;
          }
          
          if (type === 1) {
            this.ratio = 1 - r;
          } else if (type === 2) {
            this.ratio = r;
          } else if (time / this._duration < 0.5) {
            this.ratio = r / 2;
          } else {
            this.ratio = 1 - (r / 2);
          }
          
        } else {
          this.ratio = this._ease.getRatio(time / this._duration);
        }
        
      }

      if (this._time === prevTime && !force) {
        return;
      } else if (!this._initted) {
        this._init();
        if (!this._initted) { //immediateRender tweens typically won't initialize until the playhead advances (_time is greater than 0) in order to ensure that overwriting occurs properly.
          return;
        }
        //_ease is initially set to defaultEase, so now that init() has run, _ease is set properly and we need to recalculate the ratio. Overall this is faster than using conditional logic earlier in the method to avoid having to set ratio twice because we only init() once but renderTime() gets called VERY frequently.
        if (this._time && !isComplete) {
          this.ratio = this._ease.getRatio(this._time / this._duration);
        } else if (isComplete && this._ease._calcEnd) {
          this.ratio = this._ease.getRatio((this._time === 0) ? 0 : 1);
        }
      }
      
      if (!this._active) if (!this._paused && this._time !== prevTime && time >= 0) {
        this._active = true;  //so that if the user renders a tween (as opposed to the timeline rendering it), the timeline is forced to re-render and align it with the proper time/frame on the next rendering cycle. Maybe the tween already finished but the user manually re-renders it as halfway done.
      }

      if (prevTime === 0) {
        if (this._startAt) {
          if (time >= 0) {
            this._startAt.render(time, suppressEvents, force);
          } else if (!callback) {
            callback = "_dummyGS"; //if no callback is defined, use a dummy value just so that the condition at the end evaluates as true because _startAt should render AFTER the normal render loop when the time is negative. We could handle this in a more intuitive way, of course, but the render loop is the MOST important thing to optimize, so this technique allows us to avoid adding extra conditional logic in a high-frequency area.
          }
        }
        if (this.vars.onStart) if (this._time !== 0 || this._duration === 0) if (!suppressEvents) {
          this.vars.onStart.apply(this.vars.onStartScope || this, this.vars.onStartParams || _blankArray);
        }
      }

      pt = this._firstPT;
      while (pt) {
        if (pt.f) {
          pt.t[pt.p](pt.c * this.ratio + pt.s);
        } else {
          pt.t[pt.p] = pt.c * this.ratio + pt.s;
        }
        pt = pt._next;
      }
      
      if (this._onUpdate) {
        if (time < 0) if (this._startAt) {
          this._startAt.render(time, suppressEvents, force); //note: for performance reasons, we tuck this conditional logic inside less traveled areas (most tweens don't have an onUpdate). We'd just have it at the end before the onComplete, but the values should be updated before any onUpdate is called, so we ALSO put it here and then if it's not called, we do so later near the onComplete.
        }
        if (!suppressEvents) {
          this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || _blankArray);
        }
      }
      
      if (callback) if (!this._gc) { //check _gc because there's a chance that kill() could be called in an onUpdate
        if (time < 0 && this._startAt && !this._onUpdate) {
          this._startAt.render(time, suppressEvents, force);
        }
        if (isComplete) {
          if (this._timeline.autoRemoveChildren) {
            this._enabled(false, false);
          }
          this._active = false;
        }
        if (!suppressEvents && this.vars[callback]) {
          this.vars[callback].apply(this.vars[callback + "Scope"] || this, this.vars[callback + "Params"] || _blankArray);
        }
      }
      
    };
    
    p._kill = function(vars, target) {
      if (vars === "all") {
        vars = null;
      }
      if (vars == null) if (target == null || target === this.target) {
        return this._enabled(false, false);
      }
      target = (typeof(target) !== "string") ? (target || this._targets || this.target) : TweenLite.selector(target) || target;
      var i, overwrittenProps, p, pt, propLookup, changed, killProps, record;
      if ((target instanceof Array || _isSelector(target)) && typeof(target[0]) !== "number") {
        i = target.length;
        while (--i > -1) {
          if (this._kill(vars, target[i])) {
            changed = true;
          }
        }
      } else {
        if (this._targets) {
          i = this._targets.length;
          while (--i > -1) {
            if (target === this._targets[i]) {
              propLookup = this._propLookup[i] || {};
              this._overwrittenProps = this._overwrittenProps || [];
              overwrittenProps = this._overwrittenProps[i] = vars ? this._overwrittenProps[i] || {} : "all";
              break;
            }
          }
        } else if (target !== this.target) {
          return false;
        } else {
          propLookup = this._propLookup;
          overwrittenProps = this._overwrittenProps = vars ? this._overwrittenProps || {} : "all";
        }

        if (propLookup) {
          killProps = vars || propLookup;
          record = (vars !== overwrittenProps && overwrittenProps !== "all" && vars !== propLookup && (vars == null || vars._tempKill !== true)); //_tempKill is a super-secret way to delete a particular tweening property but NOT have it remembered as an official overwritten property (like in BezierPlugin)
          for (p in killProps) {
            if ((pt = propLookup[p])) {
              if (pt.pg && pt.t._kill(killProps)) {
                changed = true; //some plugins need to be notified so they can perform cleanup tasks first
              }
              if (!pt.pg || pt.t._overwriteProps.length === 0) {
                if (pt._prev) {
                  pt._prev._next = pt._next;
                } else if (pt === this._firstPT) {
                  this._firstPT = pt._next;
                }
                if (pt._next) {
                  pt._next._prev = pt._prev;
                }
                pt._next = pt._prev = null;
              }
              delete propLookup[p];
            }
            if (record) { 
              overwrittenProps[p] = 1;
            }
          }
          if (!this._firstPT && this._initted) { //if all tweening properties are killed, kill the tween. Without this line, if there's a tween with multiple targets and then you killTweensOf() each target individually, the tween would technically still remain active and fire its onComplete even though there aren't any more properties tweening.
            this._enabled(false, false);
          }
        }
      }
      return changed;
    };
  
    p.invalidate = function() {
      if (this._notifyPluginsOfEnabled) {
        TweenLite._onPluginEvent("_onDisable", this);
      }
      this._firstPT = null;
      this._overwrittenProps = null;
      this._onUpdate = null;
      this._startAt = null;
      this._initted = this._active = this._notifyPluginsOfEnabled = false;
      this._propLookup = (this._targets) ? {} : [];
      return this;
    };
    
    p._enabled = function(enabled, ignoreTimeline) {
      if (!_tickerActive) {
        _ticker.wake();
      }
      if (enabled && this._gc) {
        var targets = this._targets,
          i;
        if (targets) {
          i = targets.length;
          while (--i > -1) {
            this._siblings[i] = _register(targets[i], this, true);
          }
        } else {
          this._siblings = _register(this.target, this, true);
        }
      }
      Animation.prototype._enabled.call(this, enabled, ignoreTimeline);
      if (this._notifyPluginsOfEnabled) if (this._firstPT) {
        return TweenLite._onPluginEvent((enabled ? "_onEnable" : "_onDisable"), this);
      }
      return false;
    };
  
  
//----TweenLite static methods -----------------------------------------------------
    
    TweenLite.to = function(target, duration, vars) {
      return new TweenLite(target, duration, vars);
    };
    
    TweenLite.from = function(target, duration, vars) {
      vars.runBackwards = true;
      vars.immediateRender = (vars.immediateRender != false);
      return new TweenLite(target, duration, vars);
    };
    
    TweenLite.fromTo = function(target, duration, fromVars, toVars) {
      toVars.startAt = fromVars;
      toVars.immediateRender = (toVars.immediateRender != false && fromVars.immediateRender != false);
      return new TweenLite(target, duration, toVars);
    };
    
    TweenLite.delayedCall = function(delay, callback, params, scope, useFrames) {
      return new TweenLite(callback, 0, {delay:delay, onComplete:callback, onCompleteParams:params, onCompleteScope:scope, onReverseComplete:callback, onReverseCompleteParams:params, onReverseCompleteScope:scope, immediateRender:false, useFrames:useFrames, overwrite:0});
    };
    
    TweenLite.set = function(target, vars) {
      return new TweenLite(target, 0, vars);
    };
    
    TweenLite.killTweensOf = TweenLite.killDelayedCallsTo = function(target, vars) {
      var a = TweenLite.getTweensOf(target), 
        i = a.length;
      while (--i > -1) {
        a[i]._kill(vars, target);
      }
    };
    
    TweenLite.getTweensOf = function(target) {
      if (target == null) { return []; }
      target = (typeof(target) !== "string") ? target : TweenLite.selector(target) || target;
      var i, a, j, t;
      if ((target instanceof Array || _isSelector(target)) && typeof(target[0]) !== "number") {
        i = target.length;
        a = [];
        while (--i > -1) {
          a = a.concat(TweenLite.getTweensOf(target[i]));
        }
        i = a.length;
        //now get rid of any duplicates (tweens of arrays of objects could cause duplicates)
        while (--i > -1) {
          t = a[i];
          j = i;
          while (--j > -1) {
            if (t === a[j]) {
              a.splice(i, 1);
            }
          }
        }
      } else {
        a = _register(target).concat();
        i = a.length;
        while (--i > -1) {
          if (a[i]._gc) {
            a.splice(i, 1);
          }
        }
      }
      return a;
    };
    
    
    
/*
 * ----------------------------------------------------------------
 * TweenPlugin   (could easily be split out as a separate file/class, but included for ease of use (so that people don't need to include another <script> call before loading plugins which is easy to forget)
 * ----------------------------------------------------------------
 */
    var TweenPlugin = _class("plugins.TweenPlugin", function(props, priority) {
          this._overwriteProps = (props || "").split(",");
          this._propName = this._overwriteProps[0];
          this._priority = priority || 0;
          this._super = TweenPlugin.prototype;
        }, true);
    
    p = TweenPlugin.prototype;
    TweenPlugin.version = "1.10.1";
    TweenPlugin.API = 2;
    p._firstPT = null;    
      
    p._addTween = function(target, prop, start, end, overwriteProp, round) {
      var c, pt;
      if (end != null && (c = (typeof(end) === "number" || end.charAt(1) !== "=") ? Number(end) - start : parseInt(end.charAt(0) + "1", 10) * Number(end.substr(2)))) {
        this._firstPT = pt = {_next:this._firstPT, t:target, p:prop, s:start, c:c, f:(typeof(target[prop]) === "function"), n:overwriteProp || prop, r:round};
        if (pt._next) {
          pt._next._prev = pt;
        }
        return pt;
      }
    };
      
    p.setRatio = function(v) {
      var pt = this._firstPT,
        min = 0.000001,
        val;
      while (pt) {
        val = pt.c * v + pt.s;
        if (pt.r) {
          val = (val + ((val > 0) ? 0.5 : -0.5)) | 0; //about 4x faster than Math.round()
        } else if (val < min) if (val > -min) { //prevents issues with converting very small numbers to strings in the browser
          val = 0;
        }
        if (pt.f) {
          pt.t[pt.p](val);
        } else {
          pt.t[pt.p] = val;
        }
        pt = pt._next;
      }
    };
      
    p._kill = function(lookup) {
      var a = this._overwriteProps,
        pt = this._firstPT,
        i;
      if (lookup[this._propName] != null) {
        this._overwriteProps = [];
      } else {
        i = a.length;
        while (--i > -1) {
          if (lookup[a[i]] != null) {
            a.splice(i, 1);
          }
        }
      }
      while (pt) {
        if (lookup[pt.n] != null) {
          if (pt._next) {
            pt._next._prev = pt._prev;
          }
          if (pt._prev) {
            pt._prev._next = pt._next;
            pt._prev = null;
          } else if (this._firstPT === pt) {
            this._firstPT = pt._next;
          }
        }
        pt = pt._next;
      }
      return false;
    };
      
    p._roundProps = function(lookup, value) {
      var pt = this._firstPT;
      while (pt) {
        if (lookup[this._propName] || (pt.n != null && lookup[ pt.n.split(this._propName + "_").join("") ])) { //some properties that are very plugin-specific add a prefix named after the _propName plus an underscore, so we need to ignore that extra stuff here.
          pt.r = value;
        }
        pt = pt._next;
      }
    };
    
    TweenLite._onPluginEvent = function(type, tween) {
      var pt = tween._firstPT, 
        changed, pt2, first, last, next;
      if (type === "_onInitAllProps") {
        //sorts the PropTween linked list in order of priority because some plugins need to render earlier/later than others, like MotionBlurPlugin applies its effects after all x/y/alpha tweens have rendered on each frame.
        while (pt) {
          next = pt._next;
          pt2 = first;
          while (pt2 && pt2.pr > pt.pr) {
            pt2 = pt2._next;
          }
          if ((pt._prev = pt2 ? pt2._prev : last)) {
            pt._prev._next = pt;
          } else {
            first = pt;
          }
          if ((pt._next = pt2)) {
            pt2._prev = pt;
          } else {
            last = pt;
          }
          pt = next;
        }
        pt = tween._firstPT = first;
      }
      while (pt) {
        if (pt.pg) if (typeof(pt.t[type]) === "function") if (pt.t[type]()) {
          changed = true;
        }
        pt = pt._next;
      }
      return changed;
    };
    
    TweenPlugin.activate = function(plugins) {
      var i = plugins.length;
      while (--i > -1) {
        if (plugins[i].API === TweenPlugin.API) {
          _plugins[(new plugins[i]())._propName] = plugins[i];
        }
      }
      return true;
    };

    //provides a more concise way to define plugins that have no dependencies besides TweenPlugin and TweenLite, wrapping common boilerplate stuff into one function (added in 1.9.0). You don't NEED to use this to define a plugin - the old way still works and can be useful in certain (rare) situations.
    _gsDefine.plugin = function(config) {
      if (!config || !config.propName || !config.init || !config.API) { throw "illegal plugin definition."; }
      var propName = config.propName,
        priority = config.priority || 0,
        overwriteProps = config.overwriteProps,
        map = {init:"_onInitTween", set:"setRatio", kill:"_kill", round:"_roundProps", initAll:"_onInitAllProps"},
        Plugin = _class("plugins." + propName.charAt(0).toUpperCase() + propName.substr(1) + "Plugin",
          function() {
            TweenPlugin.call(this, propName, priority);
            this._overwriteProps = overwriteProps || [];
          }, (config.global === true)),
        p = Plugin.prototype = new TweenPlugin(propName),
        prop;
      p.constructor = Plugin;
      Plugin.API = config.API;
      for (prop in map) {
        if (typeof(config[prop]) === "function") {
          p[map[prop]] = config[prop];
        }
      }
      Plugin.version = config.version;
      TweenPlugin.activate([Plugin]);
      return Plugin;
    };


    //now run through all the dependencies discovered and if any are missing, log that to the console as a warning. This is why it's best to have TweenLite load last - it can check all the dependencies for you. 
    a = window._gsQueue;
    if (a) {
      for (i = 0; i < a.length; i++) {
        a[i]();
      }
      for (p in _defLookup) {
        if (!_defLookup[p].func) {
          window.console.log("GSAP encountered missing dependency: com.greensock." + p);
        }
      }
    }

    _tickerActive = false; //ensures that the first official animation forces a ticker.tick() to update the time when it is instantiated
  
})(window);
/*!
 * VERSION: beta 1.9.3
 * DATE: 2013-04-02
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * @license Copyright (c) 2008-2013, GreenSock. All rights reserved.
 * This work is subject to the terms at http://www.greensock.com/terms_of_use.html or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 **/

(window._gsQueue || (window._gsQueue = [])).push( function() {

  "use strict";

  window._gsDefine("easing.Back", ["easing.Ease"], function(Ease) {
    
    var w = (window.GreenSockGlobals || window),
      gs = w.com.greensock,
      _2PI = Math.PI * 2,
      _HALF_PI = Math.PI / 2,
      _class = gs._class,
      _create = function(n, f) {
        var C = _class("easing." + n, function(){}, true),
          p = C.prototype = new Ease();
        p.constructor = C;
        p.getRatio = f;
        return C;
      },
      _easeReg = Ease.register || function(){}, //put an empty function in place just as a safety measure in case someone loads an OLD version of TweenLite.js where Ease.register doesn't exist.
      _wrap = function(name, EaseOut, EaseIn, EaseInOut, aliases) {
        var C = _class("easing."+name, {
          easeOut:new EaseOut(),
          easeIn:new EaseIn(),
          easeInOut:new EaseInOut()
        }, true);
        _easeReg(C, name);
        return C;
      },
      EasePoint = function(time, value, next) {
        this.t = time;
        this.v = value;
        if (next) {
          this.next = next;
          next.prev = this;
          this.c = next.v - value;
          this.gap = next.t - time;
        }
      },

      //Back
      _createBack = function(n, f) {
        var C = _class("easing." + n, function(overshoot) {
            this._p1 = (overshoot || overshoot === 0) ? overshoot : 1.70158;
            this._p2 = this._p1 * 1.525;
          }, true), 
          p = C.prototype = new Ease();
        p.constructor = C;
        p.getRatio = f;
        p.config = function(overshoot) {
          return new C(overshoot);
        };
        return C;
      },

      Back = _wrap("Back",
        _createBack("BackOut", function(p) {
          return ((p = p - 1) * p * ((this._p1 + 1) * p + this._p1) + 1);
        }),
        _createBack("BackIn", function(p) {
          return p * p * ((this._p1 + 1) * p - this._p1);
        }),
        _createBack("BackInOut", function(p) {
          return ((p *= 2) < 1) ? 0.5 * p * p * ((this._p2 + 1) * p - this._p2) : 0.5 * ((p -= 2) * p * ((this._p2 + 1) * p + this._p2) + 2);
        })
      ),


      //SlowMo
      SlowMo = _class("easing.SlowMo", function(linearRatio, power, yoyoMode) {
        power = (power || power === 0) ? power : 0.7;
        if (linearRatio == null) {
          linearRatio = 0.7;
        } else if (linearRatio > 1) {
          linearRatio = 1;
        }
        this._p = (linearRatio !== 1) ? power : 0;
        this._p1 = (1 - linearRatio) / 2;
        this._p2 = linearRatio;
        this._p3 = this._p1 + this._p2;
        this._calcEnd = (yoyoMode === true);
      }, true),
      p = SlowMo.prototype = new Ease(),
      SteppedEase, RoughEase, _createElastic;
      
    p.constructor = SlowMo;
    p.getRatio = function(p) {
      var r = p + (0.5 - p) * this._p;
      if (p < this._p1) {
        return this._calcEnd ? 1 - ((p = 1 - (p / this._p1)) * p) : r - ((p = 1 - (p / this._p1)) * p * p * p * r);
      } else if (p > this._p3) {
        return this._calcEnd ? 1 - (p = (p - this._p3) / this._p1) * p : r + ((p - r) * (p = (p - this._p3) / this._p1) * p * p * p);
      }
      return this._calcEnd ? 1 : r;
    };
    SlowMo.ease = new SlowMo(0.7, 0.7);
    
    p.config = SlowMo.config = function(linearRatio, power, yoyoMode) {
      return new SlowMo(linearRatio, power, yoyoMode);
    };


    //SteppedEase
    SteppedEase = _class("easing.SteppedEase", function(steps) {
        steps = steps || 1;
        this._p1 = 1 / steps;
        this._p2 = steps + 1;
      }, true);
    p = SteppedEase.prototype = new Ease(); 
    p.constructor = SteppedEase;
    p.getRatio = function(p) {
      if (p < 0) {
        p = 0;
      } else if (p >= 1) {
        p = 0.999999999;
      }
      return ((this._p2 * p) >> 0) * this._p1;
    };
    p.config = SteppedEase.config = function(steps) {
      return new SteppedEase(steps);
    };


    //RoughEase
    RoughEase = _class("easing.RoughEase", function(vars) {
      vars = vars || {};
      var taper = vars.taper || "none",
        a = [],
        cnt = 0,
        points = (vars.points || 20) | 0,
        i = points,
        randomize = (vars.randomize !== false),
        clamp = (vars.clamp === true),
        template = (vars.template instanceof Ease) ? vars.template : null,
        strength = (typeof(vars.strength) === "number") ? vars.strength * 0.4 : 0.4,
        x, y, bump, invX, obj, pnt;
      while (--i > -1) {
        x = randomize ? Math.random() : (1 / points) * i;
        y = template ? template.getRatio(x) : x;
        if (taper === "none") {
          bump = strength;
        } else if (taper === "out") {
          invX = 1 - x;
          bump = invX * invX * strength;
        } else if (taper === "in") {
          bump = x * x * strength;
        } else if (x < 0.5) {  //"both" (start)
          invX = x * 2;
          bump = invX * invX * 0.5 * strength;
        } else {        //"both" (end)
          invX = (1 - x) * 2;
          bump = invX * invX * 0.5 * strength;
        }
        if (randomize) {
          y += (Math.random() * bump) - (bump * 0.5);
        } else if (i % 2) {
          y += bump * 0.5;
        } else {
          y -= bump * 0.5;
        }
        if (clamp) {
          if (y > 1) {
            y = 1;
          } else if (y < 0) {
            y = 0;
          }
        }
        a[cnt++] = {x:x, y:y};
      }
      a.sort(function(a, b) {
        return a.x - b.x;
      });

      pnt = new EasePoint(1, 1, null);
      i = points;
      while (--i > -1) {
        obj = a[i];
        pnt = new EasePoint(obj.x, obj.y, pnt);
      }

      this._prev = new EasePoint(0, 0, (pnt.t !== 0) ? pnt : pnt.next);
    }, true);
    p = RoughEase.prototype = new Ease();
    p.constructor = RoughEase;
    p.getRatio = function(p) {
      var pnt = this._prev;
      if (p > pnt.t) {
        while (pnt.next && p >= pnt.t) {
          pnt = pnt.next;
        }
        pnt = pnt.prev;
      } else {
        while (pnt.prev && p <= pnt.t) {
          pnt = pnt.prev;
        }
      }
      this._prev = pnt;
      return (pnt.v + ((p - pnt.t) / pnt.gap) * pnt.c);
    };
    p.config = function(vars) {
      return new RoughEase(vars);
    };
    RoughEase.ease = new RoughEase();


    //Bounce
    _wrap("Bounce",
      _create("BounceOut", function(p) {
        if (p < 1 / 2.75) {
          return 7.5625 * p * p;
        } else if (p < 2 / 2.75) {
          return 7.5625 * (p -= 1.5 / 2.75) * p + 0.75;
        } else if (p < 2.5 / 2.75) {
          return 7.5625 * (p -= 2.25 / 2.75) * p + 0.9375;
        }
        return 7.5625 * (p -= 2.625 / 2.75) * p + 0.984375;
      }),
      _create("BounceIn", function(p) {
        if ((p = 1 - p) < 1 / 2.75) {
          return 1 - (7.5625 * p * p);
        } else if (p < 2 / 2.75) {
          return 1 - (7.5625 * (p -= 1.5 / 2.75) * p + 0.75);
        } else if (p < 2.5 / 2.75) {
          return 1 - (7.5625 * (p -= 2.25 / 2.75) * p + 0.9375);
        }
        return 1 - (7.5625 * (p -= 2.625 / 2.75) * p + 0.984375);
      }),
      _create("BounceInOut", function(p) {
        var invert = (p < 0.5);
        if (invert) {
          p = 1 - (p * 2);
        } else {
          p = (p * 2) - 1;
        }
        if (p < 1 / 2.75) {
          p = 7.5625 * p * p;
        } else if (p < 2 / 2.75) {
          p = 7.5625 * (p -= 1.5 / 2.75) * p + 0.75;
        } else if (p < 2.5 / 2.75) {
          p = 7.5625 * (p -= 2.25 / 2.75) * p + 0.9375;
        } else {
          p = 7.5625 * (p -= 2.625 / 2.75) * p + 0.984375;
        }
        return invert ? (1 - p) * 0.5 : p * 0.5 + 0.5;
      })
    );


    //CIRC
    _wrap("Circ",
      _create("CircOut", function(p) {
        return Math.sqrt(1 - (p = p - 1) * p);
      }),
      _create("CircIn", function(p) {
        return -(Math.sqrt(1 - (p * p)) - 1);
      }),
      _create("CircInOut", function(p) {
        return ((p*=2) < 1) ? -0.5 * (Math.sqrt(1 - p * p) - 1) : 0.5 * (Math.sqrt(1 - (p -= 2) * p) + 1);
      })
    );


    //Elastic
    _createElastic = function(n, f, def) {
      var C = _class("easing." + n, function(amplitude, period) {
          this._p1 = amplitude || 1;
          this._p2 = period || def;
          this._p3 = this._p2 / _2PI * (Math.asin(1 / this._p1) || 0);
        }, true),
        p = C.prototype = new Ease();
      p.constructor = C;
      p.getRatio = f;
      p.config = function(amplitude, period) {
        return new C(amplitude, period);
      };
      return C;
    };
    _wrap("Elastic",
      _createElastic("ElasticOut", function(p) {
        return this._p1 * Math.pow(2, -10 * p) * Math.sin( (p - this._p3) * _2PI / this._p2 ) + 1;
      }, 0.3),
      _createElastic("ElasticIn", function(p) {
        return -(this._p1 * Math.pow(2, 10 * (p -= 1)) * Math.sin( (p - this._p3) * _2PI / this._p2 ));
      }, 0.3),
      _createElastic("ElasticInOut", function(p) {
        return ((p *= 2) < 1) ? -0.5 * (this._p1 * Math.pow(2, 10 * (p -= 1)) * Math.sin( (p - this._p3) * _2PI / this._p2)) : this._p1 * Math.pow(2, -10 *(p -= 1)) * Math.sin( (p - this._p3) * _2PI / this._p2 ) *0.5 + 1;
      }, 0.45)
    );


    //Expo
    _wrap("Expo",
      _create("ExpoOut", function(p) {
        return 1 - Math.pow(2, -10 * p);
      }),
      _create("ExpoIn", function(p) {
        return Math.pow(2, 10 * (p - 1)) - 0.001;
      }),
      _create("ExpoInOut", function(p) {
        return ((p *= 2) < 1) ? 0.5 * Math.pow(2, 10 * (p - 1)) : 0.5 * (2 - Math.pow(2, -10 * (p - 1)));
      })
    );


    //Sine
    _wrap("Sine",
      _create("SineOut", function(p) {
        return Math.sin(p * _HALF_PI);
      }),
      _create("SineIn", function(p) {
        return -Math.cos(p * _HALF_PI) + 1;
      }),
      _create("SineInOut", function(p) {
        return -0.5 * (Math.cos(Math.PI * p) - 1);
      })
    );

    _class("easing.EaseLookup", {
        find:function(s) {
          return Ease.map[s];
        }
      }, true);

    //register the non-standard eases
    _easeReg(w.SlowMo, "SlowMo", "ease,");
    _easeReg(RoughEase, "RoughEase", "ease,");
    _easeReg(SteppedEase, "SteppedEase", "ease,");
    
    return Back;
    
  }, true);

}); if (window._gsDefine) { window._gsQueue.pop()(); }
;

