import axios from "../utils/axios";
import { BASE } from "../constants";

const LOADDASHBOARD = `${BASE}dashBoard/loadDashBoard`;
const LOADDASHBOARDCHART = `${BASE}dashBoard/loadDashBoardChart`;
const CREATECHARTSHARE = `${BASE}dashBoard/createChartShare`;
const MOVECHART = `${BASE}dashBoard/moveChart`;

export default {
    namespaced: true,
    state: {
        groupingList: [],
        currentDashBoard: {}
    },
    getters: {
        getGroupingList(state) {
            return state.groupingList;
        },
        getCurrentDashBoard(state) {
            return state.currentDashBoard;
        },
    },
    mutations: {
        setGroupingList(state, groupingList = []) {
            //过滤画像分析
            groupingList = groupingList.filter(item => {
                return item.type !== 1
            })
            state.groupingList = groupingList;
        },
        setCurrentDashBoard(state, currentDashBoard) {
            state.currentDashBoard = currentDashBoard;
        },
    },
    actions: {
        //接口

        //查询侧边栏分组信息   
        queryGroupingList({ commit }) {
            return axios.get(LOADDASHBOARD).then(res => {
                commit("setGroupingList", res.data);
            });
        },

        //查询单个仪表盘的详细信息
        loadDashBoardChart({ state, commit }, params) {
            return new Promise(resolve => {
                axios
                    .shareGet(LOADDASHBOARDCHART, params)
                    .then(res => {
                        const resData = res.data;

                        // const resData = { globalStyle: { themeName: "default", themeSettings: { dashboardBgType: "color", dashboardBgColor: "rgba(255,255,0,0.5)", dashboardBgImage: "/img/HXQAHVrJ.svg", chartColorThemeName: "blue", chartBgType: "image", chartBgColor: "rgba(255,0,255,0.5)", chartBgImage: "/img/HXQAHVrJ.svg", chartBorder: null, showTitle: true, compBgType: "color", compBgColor: "rgba(100,100,100,0.8)", compBgImage: "/img/HXQAHVrJ.svg" } }, "dashBoardId": "f3384300a53c465a834fe0ce40678f81", "dashBoardCode": "ebe2762372364e228d77ab5d3ef9c08c", "dashBoardName": "hz0522", "belongsUserCode": "admin", "haveChartNum": 1, "createTime": 1558504128000, "layoutData": [{ "chartCode": "19afcd24ca4b4d4ca4d2552bf166b85f", "chartId": "c8dc0b55950f45d881ebb056cf3fd09f", "w": 935, "chartAlias": "", "x": 0, "h": 405, "crowdCode": "", "y": 0, "id": "e94cef3142674e93a0f65393016ddc9a" }], "chartsData": [{ "chartCode": "19afcd24ca4b4d4ca4d2552bf166b85f", "chartId": "c8dc0b55950f45d881ebb056cf3fd09f", "chartName": "新建图表20190522141954", "bgType": "image", "backgroundColor": "rgba(0,0,255,0.5)", "backgroundImage": "/img/HXQAHVrJ.svg", "colorTheme": "red", "borderType": "solidBorder", "getDataOption": { "dimensionFields": [{ "chartCode": "19afcd24ca4b4d4ca4d2552bf166b85f", "dimType": "D", "name": "province", "alias": "province", "groupBy": true, "id": "91a520acb1b54da6b3649a9f7d805a19", "type": "text" }], "dsId": "8efb52b3f67744fdb2c12e6ea68af445", "xAxisNumberFields": [], "filters": [], "numberFields": [{ "chartCode": "19afcd24ca4b4d4ca4d2552bf166b85f", "dimType": "N", "name": "price", "alias": "price", "groupBy": false, "id": "86387a0e5f3440fe9e75ce36ebf77b5d", "type": "number" }], "sAxisNumberFields": [], "tableName": "city_price_info" }, "getOptionFunc": "function getOption(zcmorefunData, zcmorefunColorThemeName, zcmorefunColorThemeColors, echarts) {\n  const INFINITY = Infinity,\n        INFINITESIMAL = -Infinity,\n        markLineFormatter = params => {\n          return params.name + \"\\n\" + params.value.toLocaleString();\n        };\n\n  const provinceArr = [];\n  const priceArr = [];\n\n  for (let item of zcmorefunData) {\n    provinceArr.push(item.province);\n    priceArr.push(item.price);\n  }\n\n  return {\n    \"chartType\": \"line\",\n\n    \"title\": {\n      \"show\": false,\n      \"text\": \"新建图表20190522141954\",\n      \"subtext\": \"\",\n\n      \"textStyle\": {\n        \"color\": \"#ffffff\",\n        \"fontSize\": 16\n      },\n\n      \"subtextStyle\": {\n        \"color\": \"#a6b3c9\"\n      },\n\n      \"x\": \"center\",\n      \"top\": 13\n    },\n\n    \"backgroundColor\": \"rgba(255,255,255,0)\",\n    \"colorThemeName\": zcmorefunColorThemeName,\n    \"color\": zcmorefunColorThemeColors,\n\n    \"tooltip\": {\n      \"backgroundColor\": \"rgba(27,45,61,0.8)\",\n\n      \"textStyle\": {\n        \"fontSize\": 12,\n        \"color\": \"#fff\"\n      },\n\n      \"padding\": 10,\n      \"trigger\": \"axis\"\n    },\n\n    \"grid\": {\n      \"left\": 80,\n      \"right\": 60,\n      \"top\": 50,\n      \"bottom\": 50,\n      \"containLabel\": true\n    },\n\n    \"axisPointer\": {\n      \"lineStyle\": {\n        \"color\": \"rgb(51,75,92)\"\n      }\n    },\n\n    \"xAxis\": {\n      \"type\": \"category\",\n      \"boundaryGap\": false,\n      \"nameLocation\": \"center\",\n\n      \"nameTextStyle\": {\n        \"color\": \"#ffffff\",\n        \"padding\": 10\n      },\n\n      \"axisLine\": {\n        \"onZero\": false,\n\n        \"lineStyle\": {\n          \"color\": \"RGB(1,166,164)\"\n        }\n      },\n\n      \"axisLabel\": {\n        \"color\": \"#a6b3c9\"\n      },\n\n      \"data\": provinceArr,\n      \"name\": \"province\"\n    },\n\n    \"yAxis\": [{\n      \"type\": \"value\",\n      \"name\": \"price\",\n\n      \"nameTextStyle\": {\n        \"color\": \"#ffffff\"\n      },\n\n      \"axisLine\": {\n        \"show\": false\n      },\n\n      \"axisTick\": {\n        \"show\": false\n      },\n\n      \"axisLabel\": {\n        \"color\": \"#a6b3c9\"\n      },\n\n      \"splitLine\": {\n        \"lineStyle\": {\n          \"type\": \"dashed\",\n          \"color\": \"#2b4c52\"\n        }\n      },\n\n      \"nameLocation\": \"center\",\n      \"nameGap\": 55,\n      \"customName\": false\n    }],\n\n    \"series\": [{\n      \"name\": \"price\",\n      \"type\": \"line\",\n      \"data\": priceArr,\n      \"smooth\": true,\n      \"symbolSize\": 4,\n      \"animationEasing\": \"quadraticIn\",\n      \"animationDuration\": 2000\n    }],\n\n    \"dataZoom\": [{\n      \"type\": \"inside\",\n      \"minValueSpan\": 10\n    }, {\n      \"show\": false,\n      \"type\": \"slider\",\n      \"bottom\": 60,\n      \"minValueSpan\": 10\n    }]\n  };\n}", "detailChartId": "c8dc0b55950f45d881ebb056cf3fd09f", "chartType": 8, "chartSource": "2", "filtersInChart": [], "chartResult": [{ "province": "", "price": "" }, { "province": "", "price": 0 }, { "province": "", "price": 4900 }, { "province": "上海", "price": 54039 }, { "province": "云南省", "price": 5318 }, { "province": "内蒙古自治区", "price": 4430 }, { "province": "北京", "price": 38014 }, { "province": "吉林省", "price": 4223 }, { "province": "四川省", "price": 6106 }, { "province": "天津", "price": 19630 }, { "province": "宁夏回族自治区", "price": 4218 }, { "province": "安徽省", "price": 7705 }, { "province": "山东省", "price": 6435 }, { "province": "山西省", "price": 3829 }, { "province": "广东省", "price": 13247 }, { "province": "广西壮族自治区", "price": 12098 }, { "province": "新疆维吾尔自治区", "price": 7420 }, { "province": "江苏省", "price": 7947 }, { "province": "江西省", "price": 5126 }, { "province": "河北省", "price": 16826 }, { "province": "河南省", "price": 4694 }, { "province": "浙江省", "price": 10549 }, { "province": "海南省", "price": 15221 }, { "province": "湖北省", "price": 3746 }, { "province": "湖南省", "price": 3854 }, { "province": "甘肃省", "price": 4043 }, { "province": "福建省", "price": 9444 }, { "province": "西藏自治区", "price": 0 }, { "province": "贵州省", "price": 5076 }, { "province": "辽宁省", "price": 4688 }, { "province": "重庆", "price": 12181 }, { "province": "陕西省", "price": 5166 }, { "province": "青海省", "price": 5852 }, { "province": "黑龙江省", "price": 3522 }] }], "filtersInDashboard": null, "linkages": null, "textComps": null };
                        // commit("setPanels", resData.layoutData);
                        // commit("setChartsData", resData.chartsData);
                        // commit("setLinkages", resData.linkages);
                        commit("setCurrentDashBoard", resData);
                        // commit("setFiltersInDashboard", resData.filtersInDashboard || []);
                        // commit("setTextComps", resData.textComps || []);
                        // commit("setWebComps", resData.webComps || []);
                        // commit("setGlobalStyle", resData.globalStyle || globalStyles.default);
                        // commit("setRefreshInterval", resData.freshInterval);
                        resolve(res);
                    });
            });
        },
        //分享图表
        createChartShare({ }, params) {
            return axios.post(
                CREATECHARTSHARE,
                params.payload
            );
        },
        //移动图表
        moveChart({ dispatch }, params) {
            return axios.get(MOVECHART, params.payload)
                .then(() => {
                    dispatch("queryGroupingList")
                        .then(() => {
                            dispatch("loadDashBoardChart", {
                                dashBoardCode: params.payload.sourceDashBoardCode
                            })
                        })
                })
        }
    }
};
