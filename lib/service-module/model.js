'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (options) {
  options = Object.assign({}, defaults, options);
  var _options = options,
      idField = _options.idField,
      preferUpdate = _options.preferUpdate,
      globalModels = _options.globalModels,
      modelName = _options.modelName;

  var instanceDefaults = options.instanceDefaults || {};

  var FeathersVuexModel = function () {
    function FeathersVuexModel() {
      var _this = this;

      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, FeathersVuexModel);

      var _constructor = this.constructor,
          store = _constructor.store,
          namespace = _constructor.namespace;

      var existingItem = data[idField] && FeathersVuexModel.getFromStore(data[idField]);
      var _relationships = {};
      var fnDefaults = void 0;

      if (options.isClone) {
        Object.defineProperty(this, 'isClone', { value: true });
      }

      Object.defineProperty(this, 'isFeathersVuexInstance', { value: true });

      if (existingItem && !options.isClone) {
        if (!data.isFeathersVuexInstance) {
          (0, _utils.updateOriginal)(data, existingItem);
        }
        return existingItem;
      }

      // Don't modify the original instanceDefaults. Clone it with accessors intact
      if (typeof instanceDefaults === 'function') {
        fnDefaults = instanceDefaults(data, { store: store, Model: this.constructor, Models: globalModels });
      }
      var _instanceDefaults = cloneWithAccessors(fnDefaults || instanceDefaults);

      Object.keys(_instanceDefaults).forEach(function (key) {
        // Prevent getters and setters from firing before the instance is constructed
        var desc = Object.getOwnPropertyDescriptor(_instanceDefaults, key);
        if (desc.get || desc.set || typeof desc.value === 'function') {
          return;
        }

        // If the default value for an instanceDefault matches a model name...
        var modelName = _instanceDefaults[key];
        if (globalModels.hasOwnProperty(modelName)) {
          // Store the relationship
          _relationships[key] = globalModels[modelName];
          // Reset the instance default for this prop to null
          _instanceDefaults[key] = null;
        }

        // Or if the value is a Date
        if (modelName === Date) {
          // Store the relationships
          _relationships[key] = Date;

          // Reset the instance default for this prop to null
          _instanceDefaults[key] = null;
        }
      });

      // Check the relationships to instantiate.
      Object.keys(_relationships).forEach(function (prop) {
        var Model = _relationships[prop];
        var related = data[prop];

        if (related) {
          // Handle arrays
          if (Array.isArray(related)) {
            related.forEach(function (item, index) {
              if (Model === Date) {
                related[index] = new Date(item);
              } else {
                var _createRelatedInstanc = createRelatedInstance({ item: item, Model: Model, idField: idField, store: store }),
                    model = _createRelatedInstanc.model,
                    storedModel = _createRelatedInstanc.storedModel;

                // Replace the original array index with a reference to the model


                related[index] = storedModel || model;
              }
            });

            // Handle objects
          } else {
            if (Model === Date) {
              data[prop] = new Date(data[prop]);
            } else {
              var _createRelatedInstanc2 = createRelatedInstance({ item: related, Model: Model, idField: idField, store: store }),
                  model = _createRelatedInstanc2.model,
                  storedModel = _createRelatedInstanc2.storedModel;

              // Replace the data's prop value with a reference to the model


              data[prop] = storedModel || model;
            }
          }
        }
      });

      // Copy all instanceDefaults, including accessors
      var props = Object.getOwnPropertyNames(_instanceDefaults);
      props.forEach(function (key) {
        var desc = Object.getOwnPropertyDescriptor(_instanceDefaults, key);
        Object.defineProperty(_this, key, desc);
      });

      // Copy over all instance data
      var dataProps = Object.getOwnPropertyNames(data);
      dataProps.forEach(function (key) {
        var desc = Object.getOwnPropertyDescriptor(data, key);
        var propertyExists = _this.hasOwnProperty(key);
        var isComputed = desc.get || desc.set || typeof desc.value === 'function';
        if (propertyExists && isComputed) {
          return;
        }
        Object.defineProperty(_this, key, desc);
      });

      // If this record has an id, addOrUpdate the store
      if (data[idField] && !options.isClone && !options.skipCommit) {
        store.dispatch(namespace + '/addOrUpdate', this);
      }
    }

    _createClass(FeathersVuexModel, [{
      key: 'clone',
      value: function clone() {
        if (this.isClone) {
          throw new Error('You cannot clone a copy');
        }
        var id = this[idField];

        return this._clone(id);
      }
    }, {
      key: '_clone',
      value: function _clone(id) {}
    }, {
      key: 'reset',
      value: function reset() {
        if (this.isClone) {
          var id = this[idField];
          this._reset(id);
        } else {
          throw new Error('You cannot reset a non-copy');
        }
      }
    }, {
      key: '_reset',
      value: function _reset() {}
    }, {
      key: 'commit',
      value: function commit() {
        if (this.isClone) {
          var id = this[idField];
          return this._commit(id);
        } else {
          throw new Error('You cannnot call commit on a non-copy');
        }
      }
    }, {
      key: '_commit',
      value: function _commit(id) {}
    }, {
      key: 'save',
      value: function save(params) {
        if (this[idField]) {
          return preferUpdate ? this.update(params) : this.patch(params);
        } else {
          return this.create(params);
        }
      }
    }, {
      key: 'create',
      value: function create(params) {
        var data = Object.assign({}, this);
        if (data[idField] === null) {
          delete data[idField];
        }
        return this._create(data, params);
      }
    }, {
      key: '_create',
      value: function _create(data, params) {}
    }, {
      key: 'patch',
      value: function patch(params) {
        if (!this[idField]) {
          var error = new Error('Missing ' + idField + ' property. You must create the data before you can patch with this data', this);
          return Promise.reject(error);
        }
        return this._patch(this[idField], this, params);
      }
    }, {
      key: '_patch',
      value: function _patch() {}
    }, {
      key: 'update',
      value: function update(params) {
        if (!this[idField]) {
          var error = new Error('Missing ' + idField + ' property. You must create the data before you can update with this data', this);
          return Promise.reject(error);
        }
        return this._update(this[idField], this, params);
      }
    }, {
      key: '_update',
      value: function _update() {}
    }, {
      key: 'remove',
      value: function remove(params) {
        return this._remove(this[idField], params);
      }
    }, {
      key: '_remove',
      value: function _remove() {}
    }, {
      key: 'toJSON',
      value: function toJSON() {
        return (0, _lodash4.default)({}, this);
      }
    }]);

    return FeathersVuexModel;
  }();

  Object.assign(FeathersVuexModel, {
    options: options,
    copiesById: {}, // For cloned data
    modelName: modelName
  });

  return FeathersVuexModel;
};

var _fastCopy = require('fast-copy');

var _fastCopy2 = _interopRequireDefault(_fastCopy);

var _lodash = require('lodash.isplainobject');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.merge');

var _lodash4 = _interopRequireDefault(_lodash3);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaults = {
  idField: 'id',
  preferUpdate: false,
  instanceDefaults: {}
};

function createRelatedInstance(_ref) {
  var item = _ref.item,
      Model = _ref.Model,
      idField = _ref.idField,
      store = _ref.store;

  // Create store instances (if data contains an idField)
  var model = new Model(item);
  var id = model[idField];
  var storedModel = store.state[model.constructor.namespace].keyedById[id];

  return { model: model, storedModel: storedModel };
}

function cloneWithAccessors(obj) {
  var clone = {};

  var props = Object.getOwnPropertyNames(obj);
  props.forEach(function (key) {
    var desc = Object.getOwnPropertyDescriptor(obj, key);

    // Do not allow sharing of deeply-nested objects between instances
    if ((0, _lodash2.default)(desc.value)) {
      desc.value = (0, _fastCopy2.default)(desc.value);
    }

    Object.defineProperty(clone, key, desc);
  });

  return clone;
}
module.exports = exports.default;