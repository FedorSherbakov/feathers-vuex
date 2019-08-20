'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makeFindMixin;

var _utils = require('./utils');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function makeFindMixin(options) {
  var _data, _computed;

  var service = options.service,
      params = options.params,
      fetchQuery = options.fetchQuery,
      _options$queryWhen = options.queryWhen,
      queryWhen = _options$queryWhen === undefined ? function () {
    return true;
  } : _options$queryWhen,
      _options$local = options.local,
      local = _options$local === undefined ? false : _options$local,
      _options$qid = options.qid,
      qid = _options$qid === undefined ? 'default' : _options$qid,
      items = options.items,
      debug = options.debug;
  var name = options.name,
      _options$watch = options.watch,
      watch = _options$watch === undefined ? [] : _options$watch;


  if (typeof watch === 'string') {
    watch = [watch];
  } else if (typeof watch === 'boolean' && watch) {
    watch = ['params'];
  }

  if (!service || typeof service !== 'string' && typeof service !== 'function') {
    throw new Error('The \'service\' option is required in the FeathersVuex make-find-mixin and must be a string.');
  }
  if (typeof service === 'function' && !name) {
    name = 'service';
  }

  var nameToUse = (name || service).replace('-', '_');
  var prefix = (0, _utils.getServicePrefix)(nameToUse);
  var capitalized = (0, _utils.getServiceCapitalization)(nameToUse);
  var SERVICE_NAME = prefix + 'ServiceName';
  var ITEMS = items || prefix;
  if (typeof service === 'function' && name === 'service' && !items) {
    ITEMS = 'items';
  }
  var ITEMS_FETCHED = ITEMS + 'Fetched';
  var IS_FIND_PENDING = 'isFind' + capitalized + 'Pending';
  var PARAMS = prefix + 'Params';
  var FETCH_PARAMS = prefix + 'FetchParams';
  var WATCH = prefix + 'Watch';
  var QUERY_WHEN = prefix + 'QueryWhen';
  var FIND_ACTION = 'find' + capitalized;
  var PAGINATION = prefix + 'PaginationData';
  var LOCAL = prefix + 'Local';
  var QID = prefix + 'Qid';
  var _data2 = (_data = {}, _defineProperty(_data, IS_FIND_PENDING, false), _defineProperty(_data, WATCH, watch), _defineProperty(_data, QID, qid), _data);

  var mixin = {
    data: function data() {
      return _data2;
    },

    computed: (_computed = {}, _defineProperty(_computed, ITEMS, function () {
      return this[PARAMS] ? this.$store.getters[this[SERVICE_NAME] + '/find'](this[PARAMS]).data : [];
    }), _defineProperty(_computed, ITEMS_FETCHED, function () {
      if (this[FETCH_PARAMS]) {
        return this.$store.getters[this[SERVICE_NAME] + '/find'](this[FETCH_PARAMS]).data;
      } else {
        return this[ITEMS];
      }
    }), _computed),
    methods: _defineProperty({}, FIND_ACTION, function (params) {
      var _this = this;

      var paramsToUse = void 0;
      if (params) {
        paramsToUse = params;
      } else if (this[FETCH_PARAMS] || this[FETCH_PARAMS] === null) {
        paramsToUse = this[FETCH_PARAMS];
      } else {
        paramsToUse = this[PARAMS];
      }

      if (!this[LOCAL]) {
        if (typeof this[QUERY_WHEN] === 'function' ? this[QUERY_WHEN](paramsToUse) : this[QUERY_WHEN]) {
          this[IS_FIND_PENDING] = true;

          if (paramsToUse) {
            paramsToUse.query = paramsToUse.query || {};

            if (qid) {
              paramsToUse.qid = qid;
            }

            return this.$store.dispatch(this[SERVICE_NAME] + '/find', paramsToUse).then(function (response) {
              _this[IS_FIND_PENDING] = false;
              return response;
            });
          }
        }
      }
    }),
    created: function created() {
      var _this2 = this;

      debug && console.log('running \'created\' hook in makeFindMixin for service "' + service + '" (using name ' + nameToUse + '")');
      debug && console.log(PARAMS, this[PARAMS]);
      debug && console.log(FETCH_PARAMS, this[FETCH_PARAMS]);

      var pType = Object.getPrototypeOf(this);

      if (pType.hasOwnProperty(PARAMS) || pType.hasOwnProperty(FETCH_PARAMS)) {
        watch.forEach(function (prop) {
          if (typeof prop !== 'string') {
            throw new Error('Values in the \'watch\' array must be strings.');
          }
          prop = prop.replace('params', PARAMS);

          if (pType.hasOwnProperty(FETCH_PARAMS)) {
            if (prop.startsWith(PARAMS)) {
              prop = prop.replace(PARAMS, FETCH_PARAMS);
            }
          }
          _this2.$watch(prop, _this2[FIND_ACTION]);
        });

        return this[FIND_ACTION]();
      } else {
        if (!local) {
          // TODO: Add this message to the logging:
          //       "Pass { local: true } to disable this warning and only do local queries."
          console.log('No "' + PARAMS + '" or "' + FETCH_PARAMS + '" attribute was found in the makeFindMixin for the "' + service + '" service (using name "' + nameToUse + '").  No queries will be made.');
        }
      }
    }
  };

  if (qid) {
    mixin.computed[PAGINATION] = function () {
      return this.$store.state[this[SERVICE_NAME]].pagination[qid];
    };
  }

  setupAttribute(SERVICE_NAME, service, 'computed', true);
  setupAttribute(PARAMS, params);
  setupAttribute(FETCH_PARAMS, fetchQuery);
  setupAttribute(QUERY_WHEN, queryWhen, 'methods');
  setupAttribute(LOCAL, local);

  function setupAttribute(NAME, value) {
    var computedOrMethods = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'computed';
    var returnTheValue = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    if (typeof value === 'boolean') {
      _data2[NAME] = !!value;
    } else if (typeof value === 'string') {
      mixin.computed[NAME] = function () {
        // If the specified computed prop wasn't found, display an error.
        if (returnTheValue) {} else {
          if (!hasSomeAttribute(this, value, NAME)) {
            throw new Error('Value for ' + NAME + ' was not found on the component at \'' + value + '\'.');
          }
        }
        return returnTheValue ? value : this[value];
      };
    } else if (typeof value === 'function') {
      mixin[computedOrMethods][NAME] = value;
    }
  }

  function hasSomeAttribute(vm) {
    for (var _len = arguments.length, attributes = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      attributes[_key - 1] = arguments[_key];
    }

    return attributes.some(function (a) {
      return vm.hasOwnProperty(a) || Object.getPrototypeOf(vm).hasOwnProperty(a);
    });
  }

  return mixin;
}
module.exports = exports.default;