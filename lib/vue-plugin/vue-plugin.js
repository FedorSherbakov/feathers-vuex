'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = setupVuePlugin;

var _FeathersVuexFind = require('../FeathersVuexFind');

var _FeathersVuexFind2 = _interopRequireDefault(_FeathersVuexFind);

var _FeathersVuexGet = require('../FeathersVuexGet');

var _FeathersVuexGet2 = _interopRequireDefault(_FeathersVuexGet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function setupVuePlugin(globalModels) {
  return {
    install: function install(Vue) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var shouldSetupComponents = options.components !== false;

      Vue.$FeathersVuex = globalModels;
      Vue.prototype.$FeathersVuex = globalModels;

      if (shouldSetupComponents) {
        Vue.component('feathers-vuex-find', _FeathersVuexFind2.default);
        Vue.component('feathers-vuex-get', _FeathersVuexGet2.default);
      }
    }
  };
}
module.exports = exports.default;