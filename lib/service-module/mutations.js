'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = makeServiceMutations;

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _lodash = require('lodash.merge');

var _lodash2 = _interopRequireDefault(_lodash);

var _serializeError = require('serialize-error');

var _serializeError2 = _interopRequireDefault(_serializeError);

var _lodash3 = require('lodash.isobject');

var _lodash4 = _interopRequireDefault(_lodash3);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function makeServiceMutations(servicePath, _ref) {
  var debug = _ref.debug,
      globalModels = _ref.globalModels;

  globalModels = globalModels || { byServicePath: {} };

  function _addItems(state, items) {
    var idField = state.idField;

    var Model = globalModels.byServicePath[servicePath];

    var newKeyedById = _extends({}, state.keyedById);

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var item = _step.value;

        var id = item[idField];
        var isIdOk = (0, _utils.checkId)(id, item, debug);

        if (isIdOk) {
          if (Model && !item.isFeathersVuexInstance) {
            item = new Model(item);
          }

          // Only add the id if it's not already in the `ids` list.
          if (!state.ids.includes(id)) {
            state.ids.push(id);
          }

          newKeyedById[id] = item;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    state.keyedById = newKeyedById;
  }

  function _updateItems(state, items) {
    var idField = state.idField,
        replaceItems = state.replaceItems,
        addOnUpsert = state.addOnUpsert;

    var Model = globalModels.byServicePath[servicePath];

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = items[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var item = _step2.value;

        var id = item[idField];
        var isIdOk = (0, _utils.checkId)(id, item, debug);

        // Update the record
        if (isIdOk) {
          if (state.ids.includes(id)) {
            // Completely replace the item
            if (replaceItems) {
              if (Model && !item.isFeathersVuexInstance) {
                item = new Model(item);
              }
              _vue2.default.set(state.keyedById, id, item);
              // Merge in changes
            } else {
              (0, _utils.updateOriginal)(item, state.keyedById[id]);
            }

            // if addOnUpsert then add the record into the state, else discard it.
          } else if (addOnUpsert) {
            state.ids.push(id);
            _vue2.default.set(state.keyedById, id, item);
          }
          continue;
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }

  return {
    addItem: function addItem(state, item) {
      _addItems(state, [item]);
    },
    addItems: function addItems(state, items) {
      _addItems(state, items);
    },
    updateItem: function updateItem(state, item) {
      _updateItems(state, [item]);
    },
    updateItems: function updateItems(state, items) {
      if (!Array.isArray(items)) {
        throw new Error('You must provide an array to the `updateItems` mutation.');
      }
      _updateItems(state, items);
    },
    removeItem: function removeItem(state, item) {
      var idField = state.idField;

      var idToBeRemoved = (0, _lodash4.default)(item) ? item[idField] : item;
      var currentId = state.currentId;

      var isIdOk = (0, _utils.checkId)(idToBeRemoved, item, debug);
      var index = state.ids.findIndex(function (i) {
        return i === idToBeRemoved;
      });

      if (isIdOk && index !== null && index !== undefined) {
        _vue2.default.delete(state.ids, index);
        _vue2.default.delete(state.keyedById, idToBeRemoved);

        if (currentId === idToBeRemoved) {
          state.currentId = null;
          state.copy = null;
        }
      }
    },
    removeItems: function removeItems(state, items) {
      var idField = state.idField,
          currentId = state.currentId;


      if (!Array.isArray(items)) {
        throw new Error('You must provide an array to the `removeItems` mutation.');
      }
      // Make sure we have an array of ids. Assume all are the same.
      var containsObjects = items[0] && (0, _lodash4.default)(items[0]);
      var idsToRemove = containsObjects ? items.map(function (item) {
        return item[idField];
      }) : items;
      var mapOfIdsToRemove = idsToRemove.reduce(function (map, id) {
        map[id] = true;
        return map;
      }, {});
      idsToRemove.forEach(function (id) {
        _vue2.default.delete(state.keyedById, id);
      });

      // Get indexes to remove from the ids array.
      var mapOfIndexesToRemove = state.ids.reduce(function (map, id, index) {
        if (mapOfIdsToRemove[id]) {
          map[index] = true;
        }
        return map;
      }, {});
      // Remove highest indexes first, so the indexes don't change
      var indexesInReverseOrder = Object.keys(mapOfIndexesToRemove).sort(function (a, b) {
        if (a < b) {
          return 1;
        } else if (a > b) {
          return -1;
        } else {
          return 0;
        }
      });
      indexesInReverseOrder.forEach(function (indexInIdsArray) {
        _vue2.default.delete(state.ids, indexInIdsArray);
      });

      if (currentId && mapOfIdsToRemove[currentId]) {
        state.currentId = null;
        state.copy = null;
      }
    },
    setCurrent: function setCurrent(state, itemOrId) {
      var idField = state.idField;

      var Model = globalModels.byServicePath[servicePath];
      var id = void 0;
      var item = void 0;

      if ((0, _lodash4.default)(itemOrId)) {
        id = itemOrId[idField];
        item = itemOrId;
      } else {
        id = itemOrId;
        item = state.keyedById[id];
      }
      state.currentId = id;

      state.copy = new Model(item, { isClone: true });
    },
    clearCurrent: function clearCurrent(state) {
      state.currentId = null;
      state.copy = null;
    },


    // Creates a copy of the record with the passed-in id, stores it in copiesById
    createCopy: function createCopy(state, id) {
      var current = state.keyedById[id];
      var Model = globalModels.byServicePath[servicePath];
      var copyData = (0, _lodash2.default)({}, current);
      var copy = new Model(copyData, { isClone: true });

      if (state.keepCopiesInStore) {
        state.copiesById[id] = copy;
      } else {
        Model.copiesById[id] = copy;
      }
    },


    // Deep assigns copy to original record, locally
    commitCopy: function commitCopy(state, id) {
      var isIdOk = (0, _utils.checkId)(id, undefined, debug);
      var current = isIdOk ? state.keyedById[id] : state.keyedById[state.currentId];
      var Model = globalModels.byServicePath[servicePath];
      var copy = void 0;

      if (state.keepCopiesInStore || !Model) {
        copy = isIdOk ? state.copiesById[id] : state.copy;
      } else {
        copy = Model.copiesById[id];
      }

      (0, _utils.updateOriginal)(copy, current);

      // Object.assign(current, copy)
    },


    // Resets the copy to match the original record, locally
    rejectCopy: function rejectCopy(state, id) {
      var isIdOk = (0, _utils.checkId)(id, undefined, debug);
      var current = isIdOk ? state.keyedById[id] : state.keyedById[state.currentId];
      var Model = globalModels.byServicePath[servicePath];
      var copy = void 0;

      if (state.keepCopiesInStore || !Model) {
        copy = isIdOk ? state.copiesById[id] : state.copy;
      } else {
        copy = Model.copiesById[id];
      }

      (0, _lodash2.default)(copy, current);
    },


    // Removes the copy from copiesById
    clearCopy: function clearCopy(state, id) {
      var newCopiesById = Object.assign({}, state.copiesById);
      delete newCopiesById[id];
      state.copiesById = newCopiesById;
    },
    clearAll: function clearAll(state) {
      state.ids = [];
      state.currentId = null;
      state.copy = null;
      state.keyedById = {};
    },
    clearList: function clearList(state) {
      var currentId = state.currentId;
      var current = state.keyedById[currentId];

      if (currentId && current) {
        state.keyedById = _defineProperty({}, currentId, current);
        state.ids = [currentId];
      } else {
        state.keyedById = {};
        state.ids = [];
      }
    },


    // Stores pagination data on state.pagination based on the query identifier (qid)
    // The qid must be manually assigned to `params.qid`
    updatePaginationForQuery: function updatePaginationForQuery(state, _ref2) {
      var qid = _ref2.qid,
          response = _ref2.response,
          query = _ref2.query;
      var data = response.data,
          limit = response.limit,
          skip = response.skip,
          total = response.total;
      var idField = state.idField;

      var ids = data.map(function (item) {
        return item[idField];
      });
      var queriedAt = new Date().getTime();
      _vue2.default.set(state.pagination, qid, { limit: limit, skip: skip, total: total, ids: ids, query: query, queriedAt: queriedAt });
    },
    setFindPending: function setFindPending(state) {
      state.isFindPending = true;
    },
    unsetFindPending: function unsetFindPending(state) {
      state.isFindPending = false;
    },
    setGetPending: function setGetPending(state) {
      state.isGetPending = true;
    },
    unsetGetPending: function unsetGetPending(state) {
      state.isGetPending = false;
    },
    setCreatePending: function setCreatePending(state) {
      state.isCreatePending = true;
    },
    unsetCreatePending: function unsetCreatePending(state) {
      state.isCreatePending = false;
    },
    setUpdatePending: function setUpdatePending(state) {
      state.isUpdatePending = true;
    },
    unsetUpdatePending: function unsetUpdatePending(state) {
      state.isUpdatePending = false;
    },
    setPatchPending: function setPatchPending(state) {
      state.isPatchPending = true;
    },
    unsetPatchPending: function unsetPatchPending(state) {
      state.isPatchPending = false;
    },
    setRemovePending: function setRemovePending(state) {
      state.isRemovePending = true;
    },
    unsetRemovePending: function unsetRemovePending(state) {
      state.isRemovePending = false;
    },
    setFindError: function setFindError(state, payload) {
      state.errorOnFind = Object.assign({}, (0, _serializeError2.default)(payload));
    },
    clearFindError: function clearFindError(state) {
      state.errorOnFind = null;
    },
    setGetError: function setGetError(state, payload) {
      state.errorOnGet = Object.assign({}, (0, _serializeError2.default)(payload));
    },
    clearGetError: function clearGetError(state) {
      state.errorOnGet = null;
    },
    setCreateError: function setCreateError(state, payload) {
      state.errorOnCreate = Object.assign({}, (0, _serializeError2.default)(payload));
    },
    clearCreateError: function clearCreateError(state) {
      state.errorOnCreate = null;
    },
    setUpdateError: function setUpdateError(state, payload) {
      state.errorOnUpdate = Object.assign({}, (0, _serializeError2.default)(payload));
    },
    clearUpdateError: function clearUpdateError(state) {
      state.errorOnUpdate = null;
    },
    setPatchError: function setPatchError(state, payload) {
      state.errorOnPatch = Object.assign({}, (0, _serializeError2.default)(payload));
    },
    clearPatchError: function clearPatchError(state) {
      state.errorOnPatch = null;
    },
    setRemoveError: function setRemoveError(state, payload) {
      state.errorOnRemove = Object.assign({}, (0, _serializeError2.default)(payload));
    },
    clearRemoveError: function clearRemoveError(state) {
      state.errorOnRemove = null;
    }
  };
}
module.exports = exports.default;