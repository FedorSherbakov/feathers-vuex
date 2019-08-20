'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makeFindMixin;

var _inflection = require('inflection');

var _inflection2 = _interopRequireDefault(_inflection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function makeFindMixin(options) {
  var _data, _computed;

  var service = options.service,
      params = options.params,
      fetchParams = options.fetchParams,
      queryWhen = options.queryWhen,
      id = options.id,
      _options$local = options.local,
      local = _options$local === undefined ? false : _options$local,
      _options$qid = options.qid,
      qid = _options$qid === undefined ? 'default' : _options$qid,
      item = options.item,
      debug = options.debug;
  var name = options.name,
      _options$watch = options.watch,
      watch = _options$watch === undefined ? [] : _options$watch;


  if (typeof watch === 'string') {
    watch = [watch];
  } else if (typeof watch === 'boolean' && watch) {
    watch = ['query'];
  }

  if (!service || typeof service !== 'string' && typeof service !== 'function') {
    throw new Error('The \'service\' option is required in the FeathersVuex make-find-mixin and must be a string.');
  }
  if (typeof service === 'function' && !name) {
    name = 'service';
  }

  var nameToUse = (name || service).replace('-', '_');
  var singularized = _inflection2.default.singularize(nameToUse);
  var prefix = _inflection2.default.camelize(singularized, true);
  var capitalized = prefix.charAt(0).toUpperCase() + prefix.slice(1);
  var SERVICE_NAME = prefix + 'ServiceName';
  var ITEM = item || prefix;
  if (typeof service === 'function' && name === 'service' && !item) {
    ITEM = 'item';
  }
  var IS_GET_PENDING = 'isGet' + capitalized + 'Pending';
  var PARAMS = prefix + 'Params';
  var FETCH_PARAMS = prefix + 'FetchParams';
  var WATCH = prefix + 'Watch';
  var QUERY_WHEN = prefix + 'QueryWhen';
  var GET_ACTION = 'get' + capitalized;
  var LOCAL = prefix + 'Local';
  var QID = prefix + 'Qid';
  var ID = prefix + 'Id';
  var _data2 = (_data = {}, _defineProperty(_data, IS_GET_PENDING, false), _defineProperty(_data, WATCH, watch), _defineProperty(_data, QID, qid), _data);

  var mixin = {
    data: function data() {
      return _data2;
    },

    computed: (_computed = {}, _defineProperty(_computed, ITEM, function () {
      return this[ID] ? this.$store.getters[this[SERVICE_NAME] + '/get'](this[ID]) : null;
    }), _defineProperty(_computed, QUERY_WHEN, function () {
      return true;
    }), _computed),
    methods: _defineProperty({}, GET_ACTION, function (id, params) {
      var _this = this;

      var paramsToUse = params || this[FETCH_PARAMS] || this[PARAMS];
      var idToUse = id || this[ID];

      if (!this[LOCAL]) {
        if (this[QUERY_WHEN]) {
          this[IS_GET_PENDING] = true;

          if (idToUse) {
            return this.$store.dispatch(this[SERVICE_NAME] + '/get', [idToUse, paramsToUse]).then(function (response) {
              _this[IS_GET_PENDING] = false;
              return response;
            });
          }
        }
      }
    }),
    created: function created() {
      var _this2 = this;

      debug && console.log('running \'created\' hook in makeGetMixin for service "' + service + '" (using name ' + nameToUse + '")');
      debug && console.log(ID, this[ID]);
      debug && console.log(PARAMS, this[PARAMS]);
      debug && console.log(FETCH_PARAMS, this[FETCH_PARAMS]);

      var pType = Object.getPrototypeOf(this);

      if (pType.hasOwnProperty(ID) || pType.hasOwnProperty(PARAMS) || pType.hasOwnProperty(FETCH_PARAMS)) {
        if (!watch.includes(ID)) {
          watch.push(ID);
        }

        watch.forEach(function (prop) {
          if (typeof prop !== 'string') {
            throw new Error('Values in the \'watch\' array must be strings.');
          }
          prop = prop.replace('query', PARAMS);

          if (pType.hasOwnProperty(FETCH_PARAMS)) {
            if (prop.startsWith(PARAMS)) {
              prop.replace(PARAMS, FETCH_PARAMS);
            }
          }
          _this2.$watch(prop, _this2[GET_ACTION]);
        });

        return this[GET_ACTION]();
      } else {
        console.log('No "' + ID + '", "' + PARAMS + '" or "' + FETCH_PARAMS + '" attribute was found in the makeGetMixin for the "' + service + '" service (using name "' + nameToUse + '").  No queries will be made.');
      }
    }
  };

  setupAttribute(SERVICE_NAME, service, 'computed', true);
  setupAttribute(ID, id);
  setupAttribute(PARAMS, params);
  setupAttribute(FETCH_PARAMS, fetchParams);
  setupAttribute(QUERY_WHEN, queryWhen, 'computed');
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