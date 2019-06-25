import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'

import '@/utils/global.js'
import './css/common/index.less'
import { getLocalUser } from "./utils/session";
import Mint from 'mint-ui';
import 'mint-ui/lib/style.css'
import './css/mint/index.less' //自定义部分mint样式
import "./css/iconfont/iconfont.css";
// import echarts from "./components/apache-echarts-4.2.1-incubating-src";
var echarts = require("./components/apache-echarts-4.2.1-incubating-src")
require("./components/apache-echarts-4.2.1-incubating-src/extension-src/dataTool")(
  echarts
);

Vue.use(Mint);
Vue.prototype.$echarts = echarts;

Vue.config.productionTip = false

/* 登录跳转逻辑 */
router.beforeEach(({ meta, path, query }, from, next) => {
  const userSession = getLocalUser();
  // store.commit("setCurrentQuery", query);
  // store.commit("setUserInfo", userSession);
  if (!userSession && ["/login"].indexOf(path) === -1) {
    window.location.href = `${
      window.location.origin
      }/#/login?backUrl=${encodeURIComponent(window.location.href)}`;
    // window.event.returnValue = false;
  } else {
    next();
  }
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
