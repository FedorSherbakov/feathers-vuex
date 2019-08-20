"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makeDefaultState;
function makeDefaultState(servicePath, options) {
  var idField = options.idField,
      autoRemove = options.autoRemove,
      enableEvents = options.enableEvents,
      addOnUpsert = options.addOnUpsert,
      diffOnPatch = options.diffOnPatch,
      skipRequestIfExists = options.skipRequestIfExists,
      preferUpdate = options.preferUpdate,
      replaceItems = options.replaceItems,
      paramsForServer = options.paramsForServer,
      whitelist = options.whitelist;


  var state = {
    ids: [],
    keyedById: {},
    copiesById: {},
    currentId: null,
    copy: null,
    idField: idField,
    servicePath: servicePath,
    autoRemove: autoRemove,
    enableEvents: enableEvents,
    addOnUpsert: addOnUpsert,
    diffOnPatch: diffOnPatch,
    skipRequestIfExists: skipRequestIfExists,
    preferUpdate: preferUpdate,
    replaceItems: replaceItems,
    pagination: {},
    paramsForServer: paramsForServer,
    whitelist: whitelist,

    setCurrentOnGet: true,
    setCurrentOnCreate: true,

    isFindPending: false,
    isGetPending: false,
    isCreatePending: false,
    isUpdatePending: false,
    isPatchPending: false,
    isRemovePending: false,

    errorOnFind: null,
    errorOnGet: null,
    errorOnCreate: null,
    errorOnUpdate: null,
    errorOnPatch: null,
    errorOnRemove: null
  };

  return state;
}
module.exports = exports.default;