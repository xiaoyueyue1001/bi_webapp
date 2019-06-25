<template>
  <div
    class="chartContainer"
    id="chartContainer"
    ref="chartContainer"
  >
    <div
      class="myChart"
      ref="myChart"
    >
    </div>
  </div>
</template>
<script>
import GeoCodeMap from "./mapData/china/GeoCodeMap.json";
import { MP } from "./map.js";

export default {
  data() {
    return {
      myChart: null,
      resizeListener: null
    };
  },
  props: {
    isChartFullscreen: {
      type: Boolean,
      default: false
    },
    isFullscreen: {
      type: Boolean,
      default: false
    },
    option: Object,
    title: {
      type: String,
      default: ""
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
    scaleMousedown() {},
    scaleMousemove() {},
    resizeDiv(that) {
      const containerComputedStyle = window.getComputedStyle(
        that.$refs.chartContainer
      );
      that.$refs.myChart.style.width = containerComputedStyle.width;
      that.$refs.myChart.style.height = containerComputedStyle.height;
    },
    mountedCallback() {
      this.resizeDiv(this);
      if (!this.myChart) {
        let map = null;
        if (
          this.option &&
          this.option.series &&
          this.option.series[0] &&
          this.option.series[0].map
        ) {
          map = this.option.series[0].map;
        } else if (this.option && this.option.geo && this.option.geo.map) {
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
          this.myChart = this.$echarts.init(this.$refs.myChart);
          const that = this;
          // this.$once('hook:beforeDestroy', () => {
          //   that.myChart.dispose();
          // })
        });
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
    }
  },
  beforeCreate() {
    require("../../apache-echarts-4.2.1-incubating-src/extension/bmap/bmap.js")(
      this.$echarts
    );
  },
  mounted() {
    this.$nextTick(() => {
      if (window.BMap) {
        this.mountedCallback();
      } else {
        MP("kcKs6Bn1eWjuYbzOoI79fa8MohtXT9ZW").then(BMap => {
          this.mountedCallback();
        });
      }
    });
  },
  watch: {
    isChartFullscreen() {
      this.resizeDiv(this);
      this.myChart.resize();
    },
    isFullscreen() {
      this.resizeDiv(this);
      this.myChart.resize();
    },
    option: {
      handler(val, oldVal) {
        if (!val) {
          this.myChart.setOption({});
          return;
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
            this.myChart.setOption(val);
          }
        })
      }
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
      this.myChart.dispose();
      this.myChart = null;
    }
    window.removeEventListener("resize", this.resizeListener);
  }
};
</script>

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
