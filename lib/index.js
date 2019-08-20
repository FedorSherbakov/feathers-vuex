'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeGetMixin = exports.makeFindMixin = exports.FeathersVuexGet = exports.FeathersVuexFind = exports.initAuth = undefined;

exports.default = function (feathersClient) {
  var globalOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  globalOptions = Object.assign({}, globalDefaults, globalOptions);

  return {
    service: (0, _serviceModule2.default)(feathersClient, globalOptions, globalModels),
    auth: (0, _authModule2.default)(feathersClient, globalOptions, globalModels),
    FeathersVuex: (0, _vuePlugin2.default)(globalModels),
    FeathersVuexFind: _FeathersVuexFind2.default,
    FeathersVuexGet: _FeathersVuexGet2.default
  };
};

var _serviceModule = require('./service-module/service-module');

var _serviceModule2 = _interopRequireDefault(_serviceModule);

var _authModule = require('./auth-module/auth-module');

var _authModule2 = _interopRequireDefault(_authModule);

var _vuePlugin = require('./vue-plugin/vue-plugin');

var _vuePlugin2 = _interopRequireDefault(_vuePlugin);

var _FeathersVuexFind = require('./FeathersVuexFind');

var _FeathersVuexFind2 = _interopRequireDefault(_FeathersVuexFind);

var _FeathersVuexGet = require('./FeathersVuexGet');

var _FeathersVuexGet2 = _interopRequireDefault(_FeathersVuexGet);

var _makeFindMixin = require('./make-find-mixin');

var _makeFindMixin2 = _interopRequireDefault(_makeFindMixin);

var _makeGetMixin = require('./make-get-mixin');

var _makeGetMixin2 = _interopRequireDefault(_makeGetMixin);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var globalDefaults = {
  idField: 'id', // The field in each record that will contain the id
  autoRemove: false, // automatically remove records missing from responses (only use with feathers-rest)
  nameStyle: 'short', // Determines the source of the module name. 'short', 'path', or 'explicit'
  apiPrefix: '' // Setting to 'api1/' will prefix the store moduleName, unless `namespace` is used, then this is ignored.
};
var globalModels = {
  byServicePath: {}
};

exports.initAuth = _utils.initAuth;
exports.FeathersVuexFind = _FeathersVuexFind2.default;
exports.FeathersVuexGet = _FeathersVuexGet2.default;
exports.makeFindMixin = _makeFindMixin2.default;
exports.makeGetMixin = _makeGetMixin2.default;