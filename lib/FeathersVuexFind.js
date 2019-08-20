'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  props: {
    service: {
      type: String,
      required: true
    },
    query: {
      type: Object,
      default: null
    },
    queryWhen: {
      type: [Boolean, Function],
      default: true
    },
    // If a separate query is desired to fetch data, use fetchQuery
    // The watchers will automatically be updated, so you don't have to write 'fetchQuery.propName'
    fetchQuery: {
      type: Object
    },
    watch: {
      type: [String, Array],
      default: function _default() {
        return [];
      }
    },
    local: {
      type: Boolean,
      default: false
    },
    editScope: {
      type: Function,
      default: function _default(scope) {
        return scope;
      }
    },
    qid: {
      type: String,
      default: function _default() {
        return randomString(10);
      }
    }
  },
  data: function data() {
    return {
      isFindPending: false
    };
  },
  computed: {
    items: function items() {
      var query = this.query,
          service = this.service,
          $store = this.$store;


      return query ? $store.getters[service + '/find']({ query: query }).data : [];
    },
    pagination: function pagination() {
      return this.$store.state[this.service].pagination[this.qid];
    },
    scope: function scope() {
      var items = this.items,
          isFindPending = this.isFindPending,
          pagination = this.pagination;

      var defaultScope = { isFindPending: isFindPending, pagination: pagination, items: items };

      return this.editScope(defaultScope) || defaultScope;
    }
  },
  methods: {
    findData: function findData() {
      var _this = this;

      var query = this.fetchQuery || this.query;

      if (typeof this.queryWhen === 'function' ? this.queryWhen(this.query) : this.queryWhen) {
        this.isFindPending = true;

        if (query) {
          var params = { query: query };

          if (this.qid) {
            params.qid = params.qid || this.qid;
          }
          return this.$store.dispatch(this.service + '/find', params).then(function () {
            _this.isFindPending = false;
          });
        }
      }
    },
    fetchData: function fetchData() {
      if (!this.local) {
        if (this.query) {
          return this.findData();
        } else {
          // TODO: access debug boolean from from the store config, somehow.
          console.log('No query and no id provided, so no data will be fetched.');
        }
      }
    }
  },
  created: function created() {
    var _this2 = this;

    if (!this.$FeathersVuex) {
      throw new Error('You must first Vue.use the FeathersVuex plugin before using the \'feathers-vuex-find\' component.');
    }
    if (!this.$store.state[this.service]) {
      throw new Error('The \'' + this.service + '\' plugin cannot be found. Did you register the service with feathers-vuex?');
    }

    var watch = Array.isArray(this.watch) ? this.watch : [this.watch];

    if (this.fetchQuery || this.query) {
      watch.forEach(function (prop) {
        if (typeof prop !== 'string') {
          throw new Error('Values in the \'watch\' array must be strings.');
        }
        if (_this2.fetchQuery) {
          if (prop.startsWith('query')) {
            prop.replace('query', 'fetchQuery');
          }
        }
        _this2.$watch(prop, _this2.fetchData);
      });

      this.fetchData();
    }
  },
  render: function render() {
    return this.$scopedSlots.default(this.scope);
  }
};


function randomString(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}
module.exports = exports.default;