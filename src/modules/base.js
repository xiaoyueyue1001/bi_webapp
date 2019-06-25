import axios from "../utils/axios";
import { LOGIN } from '@/constants'
import Vue from "vue";

const vue = new Vue();
export default {
    state: {
        // themeColors: {
        //   backcolor: "#00a83f",
        //   "menu-selected-item-background-color": "#019a3a",
        //   fcolor: "white",
        //   primaryColor: "#00a83f",
        //   btnColor: "#00a83f",
        //   primaryShallowColor: "#33b965"
        // },
        // currentQuery: {},
        // currentRoute: ["", ""],
        // breadcrumMapper: {
        //   dashboard: "看板",
        //   profile: "用户画像",
        //   whole: "整体画像",
        //   crowdManage: "人群管理",
        //   statistics: "统计分析",
        //   customization: "人群定制",
        //   combination: "人群组合",
        //   seeProfile: "查看画像",
        //   dataAccess: "数据接入",
        //   addDataSet: "添加数据"
        // },
        userInfo: null
    },
    getters: {
        // getCurrentQuery: state => {
        //   return state.currentQuery;
        // },
        // getThemeColors: state => {
        //   return state.themeColors;
        // },
        // getCurrentRoute: state => {
        //   return state.currentRoute;
        // },
        // getBreadcrumMapper: state => {
        //   return state.breadcrumMapper;
        // },
        // getDubheOrigin: state => {
        //   return state.origin;
        // },
        // getUserInfo: state => {
        //   return state.userInfo
        // }
    },
    mutations: {
        // setCurrentQuery(state, currentQuery) {
        //   state.currentQuery = currentQuery;
        // },
        // setThemeColors(state, themeColors) {
        //   state.themeColors = themeColors;
        // },
        // setCurrentRoute(state, currentRoute) {
        //   state.currentRoute = currentRoute;
        // },
        // setOrigin(state, origin) {
        //   state.origin = origin;
        // },
        setUserInfo(state, data) {
            state.userInfo = data
        }
    },
    actions: {
        submitLogin(context, params) {
            return new Promise((resolve, reject) => {
                axios.postWithoutVt(LOGIN.IN, params).then(res => {
                    context.commit("setUserInfo", res.data && res.data.obj)
                    resolve(res.data || {})
                });
            })
        },
        // LoginOut(context, params) {
        //   return new Promise(resolve => {
        //     axios.loginOut(LOGIN.OUT).then(res => {
        //       resolve(res)
        //     })
        //   })
        // }
    }
};
