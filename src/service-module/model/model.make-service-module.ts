/*
eslint
@typescript-eslint/explicit-function-return-type: 0,
@typescript-eslint/no-explicit-any: 0
*/
// import { Module } from 'vuex'
import globalModels from './model.global-models'
function makeState(servicePath, stateOptions) {}
function makeGetters(servicePath) {}
function makeMutations(servicePath, options) {}
function makeActions(servicePath, options) {}
// import makeState from '../state'
// import makeGetters from '../getters'
// import makeMutations from '../mutations'
// import makeActions from '../actions'

function makeServiceModule(
  servicePath: string,
  options = {
    state: {},
    mutations: {},
    actions: {},
    getters: {}
  }
) {
  // const { debug, apiPrefix } = options

  if (typeof servicePath !== 'string') {
    throw new Error(
      'The first argument to setup a feathers-vuex service must be a string'
    )
  }

  // test variables
  const service = {
    paginate: {}
  }
  const debug = false
  const apiPrefix = ''

  // const service = feathersClient.service(servicePath)
  if (!service) {
    throw new Error(
      'No service was found. Please configure a transport plugin on the Feathers Client. Make sure you use the client version of the transport, like `feathers-socketio/client` or `feathers-rest/client`.'
    )
  }
  const paginate =
    service.hasOwnProperty('paginate') &&
    service.paginate.hasOwnProperty('default')
  const stateOptions = Object.assign(options, { paginate })

  const defaultState = makeState(servicePath, stateOptions)
  const defaultGetters = makeGetters(servicePath)
  const defaultMutations = makeMutations(servicePath, {
    debug,
    globalModels,
    apiPrefix
  })
  const defaultActions = makeActions(service, { debug })
  const module = {
    namespaced: true,
    state: Object.assign({}, defaultState, options.state),
    getters: Object.assign({}, defaultGetters, options.getters),
    mutations: Object.assign({}, defaultMutations, options.mutations),
    actions: Object.assign({}, defaultActions, options.actions)
  }
  return module
}

export default makeServiceModule