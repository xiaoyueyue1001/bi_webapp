import Vue from 'vue'
import Vuex from 'vuex'
import base from "./modules/base";
import superpanel from "./modules/superpanel";

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    base,
    superpanel
  }
})
