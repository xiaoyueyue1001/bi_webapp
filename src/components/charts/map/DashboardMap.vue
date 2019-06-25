<template>
  <div
    class="chartContainer"
    id="chartContainer"
    ref="chartContainer"
  >
    <Spin
      v-if="dataLoading"
      style="z-index: 100;"
      loaddingStyle="table"
    ></Spin>
    <div
      class="myChart"
      ref="myChart"
    >
    </div>
    <GoIn
      :goIn="option ? option.goIn : null"
      :goInFieldInfo="goInFieldInfo"
      :goInFieldInfoArr="goInFieldInfoArr"
      @setGoInField="setGoInField"
    ></GoIn>
    <!-- <FiltersInChart :filtersInChart="filtersInChart"></FiltersInChart> -->
  </div>
</template>
<script>
import _ from "lodash";
import { timeFormats } from "../../../constants.js";
import FiltersInChart from "../FiltersInChart";
import GoIn from "../GoIn";
import GeoCodeMap from "./mapData/china/GeoCodeMap.json";
export default {
  components: {
    FiltersInChart,
    GoIn
  },
  data() {
    return {
      timeFormats: timeFormats,
      myChart: null,
      resizeListener: null,
      goInFieldInfo: null,
      goInFieldInfoArr: []
    };
  },
  props: {
    dataLoading: {
      type: Boolean,
      default: false
    },
    data: {
      type: Array,
      default: () => {
        return [];
      }
    },
    filtersInChart: {
      type: Array,
      default: () => {
        return [];
      }
    },
    option: Object,
    isChartFullscreen: {
      type: Boolean,
      default: false
    },
    isFullscreen: {
      type: Boolean,
      default: false
    },
    clickCallback: Function,
    georoamCallback: Function,
    datazoomCallback: Function,
    width: {
      type: Number,
      default: 431
    },
    height: {
      type: Number,
      default: 380
    }
  },
  computed: {},
  methods: {
    setGoInField(goInFieldInfo, goInFieldInfoArr) {
      this.goInFieldInfo = goInFieldInfo;
      this.goInFieldInfoArr = goInFieldInfoArr;
    },
    getTextByValue(arr, value) {
      for (let item of arr) {
        if (item.value === value) {
          return item.label;
        }
      }
      return null;
    },
    scaleMousedown() {},
    scaleMousemove() {},
    resizeDiv(that) {
      const containerComputedStyle = window.getComputedStyle(
        that.$refs.chartContainer
      );
      that.$refs.myChart.style.width = containerComputedStyle.width;
      that.$refs.myChart.style.height = containerComputedStyle.height;
    },
    getComputedValue(markPoint) {
      switch (markPoint.type) {
        case "max":
          return this.getMaxValue(
            this.option.series[markPoint.seriesIndex].data
          );
        case "min":
          return this.getMinValue(
            this.option.series[markPoint.seriesIndex].data
          );
        case "average":
          return this.getAvgValue(
            this.option.series[markPoint.seriesIndex].data
          );
        case "default":
          return null;
      }
    },
    getAvgValue(data) {
      let avg = 0,
        totalVal = 0;
      for (let item of data) {
        totalVal += item;
      }
      avg = totalVal / data.length;
      return Number(avg.toFixed(0));
    },
    getMinValue(data) {
      let min = Infinity;
      for (let item of data) {
        if (item < min) {
          min = item;
        }
      }
      return min;
    },
    getMaxValue(data) {
      let max = -Infinity;
      for (let item of data) {
        if (item > max) {
          max = item;
        }
      }
      return max;
    },
    getSignByText(text) {
      switch (text) {
        case "equal":
          return "===";
        case "greater":
          return ">";
        case "greaterOrEqual":
          return ">=";
        case "less":
          return "<";
        case "lessOrEqual":
          return "<=";
        default:
          return null;
      }
    }
  },
  mounted() {
    this.resizeDiv(this);
    if (!this.myChart) {
      this.myChart = this.$echarts.init(this.$refs.myChart);
      const that = this;
      // this.$once('hook:beforeDestroy', () => {
      //   that.myChart.dispose();
      // })
    }
    const that = this;
    that.resizeListener = () => {
      that.resizeDiv(that);
      that.myChart.resize();
    };
    if (this.clickCallback) {
      this.myChart.on("click", this.clickCallback);
    }
    if (this.georoamCallback) {
      this.myChart.on("georoam", this.georoamCallback);
    }
    if (this.datazoomCallback) {
      this.myChart.on("datazoom", this.datazoomCallback);
    }
    window.addEventListener("resize", that.resizeListener);
    if (this.option) {
      this.myChart.setOption(this.option);
    }
  },
  watch: {
    option: {
      handler(val, oldVal) {
        if (!val) {
          this.myChart.setOption({});
        }
        let map = null;
        if (
          this.option.series &&
          this.option.series[0] &&
          this.option.series[0].map
        ) {
          map = this.option.series[0].map;
        } else if (this.option.geo && this.option.geo.map) {
          map = this.option.geo.map;
        }
        if (!map) {
          return;
        }
        const geoCode = GeoCodeMap[map] || "0";
        if (!geoCode) {
          return;
        }
        require(["./mapData/china/" + geoCode + ".json"], (mapJson) => {
          this.$echarts.registerMap(map, mapJson);
          if (this.myChart) {
            this.myChart.clear();
            if (val.markPoints) {
              this.transformMarkPoints(val);
            }
            this.myChart.setOption(val);
            this.myChart.off("click");
            this.myChart.off("georoam");
            this.myChart.off("datazoom");
            if (this.clickCallback) {
              if ( val.clickCallback && JSON.stringify(val.goIn) !== JSON.stringify(oldVal.goIn)) {
                this.goInFieldInfo = null;
                this.goInFieldInfoArr = [];
              }
              const that = this;
              if (this.clickCallback) {
                this.myChart.on("click", this.clickCallback);
              }
            }
            if (this.georoamCallback) {
              this.myChart.on("georoam", this.georoamCallback);
            }
            if (this.datazoomCallback) {
              this.myChart.on("datazoom", this.datazoomCallback);
            }
          }
        });
        
      },
      deep: true
    },
    clickCallback() {
      this.myChart.off("click");

      if (this.clickCallback) {
        this.myChart.on("click", this.clickCallback);
      }
    },
    isChartFullscreen() {
      this.resizeDiv(this);
      this.myChart.resize();
    },
    isFullscreen() {
      this.resizeDiv(this);
      this.myChart.resize();
    },
    width() {
      this.resizeDiv(this);
      this.myChart.resize();
    },
    height() {
      this.resizeDiv(this);
      this.myChart.resize();
    }
  },
  beforeDestroy() {
    if (this.myChart) {
      this.myChart.off("click");
      this.myChart.off("georoam");
      this.myChart.off("datazoom");
      this.myChart.clear();
      this.myChart.dispose();
      this.myChart = null;
    }
    window.removeEventListener("resize", this.resizeListener);
  }
};
</script>

<style>
.chartContainer .myChart > div {
  border-radius: 6px;
}
</style>


<style scoped>
.chartContainer {
  border-radius: 6px;
  position: relative;
  width: 100%;
  height: 100%;
}
.myChart {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>

