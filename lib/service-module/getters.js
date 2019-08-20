'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makeServiceGetters;

var _sift = require('sift');

var _sift2 = _interopRequireDefault(_sift);

var _commons = require('@feathersjs/commons');

var _commons2 = _interopRequireDefault(_commons);

var _adapterCommons = require('@feathersjs/adapter-commons');

var _adapterCommons2 = _interopRequireDefault(_adapterCommons);

var _lodash = require('lodash.omit');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _ = _commons2.default._;
var filterQuery = _adapterCommons2.default.filterQuery,
    sorter = _adapterCommons2.default.sorter,
    select = _adapterCommons2.default.select;

var FILTERS = ['$sort', '$limit', '$skip', '$select'];
var OPERATORS = ['$in', '$nin', '$lt', '$lte', '$gt', '$gte', '$ne', '$or'];
var additionalOperators = ['$elemMatch'];
var defaultOps = FILTERS.concat(OPERATORS).concat(additionalOperators);

function makeServiceGetters(servicePath) {
  return {
    list: function list(state) {
      return state.ids.map(function (id) {
        return state.keyedById[id];
      });
    },

    find: function find(state) {
      return function () {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var paramsForServer = state.paramsForServer,
            whitelist = state.whitelist;

        var q = (0, _lodash2.default)(params.query || {}, paramsForServer);
        var customOperators = Object.keys(q).filter(function (k) {
          return k[0] === '$' && !defaultOps.includes(k);
        });
        var cleanQuery = (0, _lodash2.default)(q, customOperators);

        var _filterQuery = filterQuery(cleanQuery, {
          operators: additionalOperators.concat(whitelist)
        }),
            query = _filterQuery.query,
            filters = _filterQuery.filters;

        var values = _.values(state.keyedById);
        values = (0, _sift2.default)(query, values);

        var total = values.length;

        if (filters.$sort) {
          values.sort(sorter(filters.$sort));
        }

        if (filters.$skip) {
          values = values.slice(filters.$skip);
        }

        if (typeof filters.$limit !== 'undefined') {
          values = values.slice(0, filters.$limit);
        }

        if (filters.$select) {
          values = values.map(function (value) {
            return _.pick.apply(_, [value].concat(_toConsumableArray(filters.$select.slice())));
          });
        }

        return {
          total: total,
          limit: filters.$limit || 0,
          skip: filters.$skip || 0,
          data: values
        };
      };
    },
    get: function get(_ref) {
      var keyedById = _ref.keyedById,
          idField = _ref.idField;
      return function (id) {
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        return keyedById[id] ? select(params, idField)(keyedById[id]) : undefined;
      };
    },
    current: function current(state) {
      return state.currentId ? state.keyedById[state.currentId] : null;
    },
    getCopy: function getCopy(state) {
      return state.copy ? state.copy : null;
    },

    getCopyById: function getCopyById(state) {
      return function (id) {
        return state.copiesById[id];
      };
    }
  };
}
module.exports = exports.default;