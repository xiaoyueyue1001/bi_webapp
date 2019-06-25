import Vue from "vue";
import { CHARTTYPE } from "../../constants";

const ZcmorefunWordcloud = Vue.component("ZcmorefunWordcloud", function(resolve) {
  require(["../../components/charts/DashboardWordcloud.vue"], resolve);
})
const AnalysisWordcloud = Vue.component("AnalysisWordcloud", function(resolve) {
  require(["../../components/charts/AnalysisWordcloud.vue"], resolve);
})
const ZcmorefunAnalysisAreaMap = Vue.component(
  "ZcmorefunAnalysisAreaMap",
  function(resolve) {
    require(["../../components/charts/map/DashboardAreaMap.vue"], resolve);
  }
);
const AnalysisAreaMap = Vue.component("AnalysisAreaMap", function(resolve) {
  require(["../../components/charts/map/AnalysisAreaMap.vue"], resolve);
});
const ZcmorefunAnalysisD3Bubble = Vue.component(
  "ZcmorefunAnalysisD3Bubble",
  function(resolve) {
    require(["../../components/charts/AnalysisBubble"], resolve);
  }
);
const ZcmorefunD3Bubble = Vue.component("ZcmorefunD3Bubble", function(resolve) {
  require(["../../components/charts/DashboardBubble"], resolve);
});
const ZcmorefunAnalysisTable = Vue.component("ZcmorefunAnalysisTable", function(
  resolve
) {
  require(["../../components/charts/ZcmorefunTable.vue"], resolve);
});
const ZcmorefunAnalysisChart = Vue.component("ZcmorefunAnalysisChart", function(
  resolve
) {
  require(["../../components/charts/AnalysisChart.vue"], resolve);
});
const ZcmorefunTable = Vue.component("ZcmorefunTable", function(resolve) {
  require(["../../components/charts/DashboardTable.vue"], resolve);
});
const EchartsChart = Vue.component("EchartsChart", function(resolve) {
  require(["../../components/charts/DashboardChart.vue"], resolve);
});
const EchartsMap = Vue.component("EchartsMap", function(resolve) {
  require(["../../components/charts/map/Map.vue"], resolve);
});
const EchartsBMap = Vue.component("EchartsBMap", function(resolve) {
  require(["../../components/charts/map/BMap.vue"], resolve);
});
const EchartsCircle = Vue.component("EchartsCircle", function(resolve) {
  require(["../../components/charts/Circle.vue"], resolve);
});
const EchartsBar = Vue.component("EchartsBar", function(resolve) {
  require(["../../components/charts/Bar"], resolve);
});
const G2Line = Vue.component("G2Line", function(resolve) {
  require(["../../components/g2Chart/Line"], resolve);
});
const G2MultiLine = Vue.component("G2MultiLine", function(resolve) {
  require(["../../components/g2Chart/MultiLine"], resolve);
});
const G2Area = Vue.component("G2Area", function(resolve) {
  require(["../../components/g2Chart/Area"], resolve);
});
const G2Radar = Vue.component("G2Radar", function(resolve) {
  require(["../../components/g2Chart/Radar"], resolve);
});
const G2RosePie = Vue.component("G2RosePie", function(resolve) {
  require(["../../components/g2Chart/RosePie"], resolve);
});
const D3Bubble = Vue.component("D3Bubble", function(resolve) {
  require(["../../components/charts/Bubble"], resolve);
});
const RankList = Vue.component("RankList", function(resolve) {
  require(["../../components/customChart/RankList"], resolve);
});
const TableBar = Vue.component("TableBar", function(resolve) {
  require(["../../components/customChart/TableBar"], resolve);
});
const WordCloud = Vue.component("WordCloud", function(resolve) {
  require(["../../components/charts/WordCloud"], resolve);
});
const AreaMap = Vue.component("AreaMap", function(resolve) {
  require(["../../components/charts/map/AreaMap"], resolve);
});
const PointMap = Vue.component("PointMap", function(resolve) {
  require(["../../components/charts/map/PointMap"], resolve);
});
// const HeatMap = Vue.component("HeatMap", function(resolve) {
//   require(["../../components/chart/map/HeatMap"], resolve);
// });

const toFirstUpperCase = str => {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
};

export const transformChartType = chartType => {
  return "Zcmorefun" + toFirstUpperCase(CHARTTYPE[chartType]);
};

export const chartCompRegister = {
  ZcmorefunWordcloud,
  AnalysisWordcloud,
  AnalysisAreaMap,
  ZcmorefunAnalysisAreaMap,
  ZcmorefunAnalysisD3Bubble,
  ZcmorefunD3Bubble,
  ZcmorefunAnalysisTable,
  ZcmorefunAnalysisChart: ZcmorefunAnalysisChart,
  ZcmorefunTable: ZcmorefunTable,
  ZcmorefunChart: EchartsChart,
  ZcmorefunMap: EchartsMap,
  ZcmorefunBMap: EchartsBMap,
  ZcmorefunCircle: EchartsCircle,
  ZcmorefunBar: EchartsBar,
  ZcmorefunLine: G2Line,
  ZcmorefunMultiLine: G2MultiLine,
  ZcmorefunArea: G2Area,
  ZcmorefunRadar: G2Radar,
  ZcmorefunRosePie: G2RosePie,
  ZcmorefunBubble: D3Bubble,
  ZcmorefunRankList: RankList,
  ZcmorefunTableBar: TableBar,
  ZcmorefunWordCloud: WordCloud,
  ZcmorefunAreaMap: AreaMap,
  ZcmorefunPointMap: PointMap
  // ZcmorefunHeatMap: HeatMap
};
