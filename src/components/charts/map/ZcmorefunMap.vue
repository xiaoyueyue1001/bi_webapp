// <template>
//   <ZcmorefunChart
//     :isFullscreen="isFullscreen"
//     :isChartFullscreen="isChartFullscreen"
//     :title="title"
//     :height="height"
//     :width="width"
//     :option="option"
//     :clickCallback="clickCallback"
//     :georoamCallback="georoamCallback"
//     :datazoomCallback="datazoomCallback"
//     style="height: 100%;width: 100%"
//   ></ZcmorefunChart>
// </template>

// <script>
// import Chart from "../Chart";
// import GeoCodeMap from "./mapData/china/GeoCodeMap.json";
// export default {
//   name: "ZcmorefunMap",
//   components: {
//     ZcmorefunChart: Chart
//   },
//   props: {
//     isChartFullscreen: {
//       type: Boolean,
//       default: false
//     },
//     isFullscreen: {
//       type: Boolean,
//       default: false
//     },
//     option: Object,
//     title: {
//       type: String,
//       default: ""
//     },
//     clickCallback: Function,
//     georoamCallback: Function,
//     datazoomCallback: Function,
//     width: {
//       type: Number,
//       default: 280
//     },
//     height: {
//       type: Number,
//       default: 280
//     }
//   },
//   data() {
//     return {
//       GeoCodeMap: GeoCodeMap
//     };
//   },
//   watch: {
//     option() {
//       if (this.option) {
//         let map = null;
//         if (
//           this.option.series &&
//           this.option.series[0] &&
//           this.option.series[0].map
//         ) {
//           map = this.option.series[0].map;
//         } else if (this.option.geo && this.option.geo.map) {
//           map = this.option.geo.map;
//         }
//         if (!map) {
//           return;
//         }
//         const geoCode = this.GeoCodeMap[map] || "0";
//         if (!geoCode) {
//           return;
//         }
//         const mapJson = require("./mapData/china/" + geoCode + ".json");
//         this.$echarts.registerMap(map, mapJson);
//       }
//     }
//   }
// };
// </script>
