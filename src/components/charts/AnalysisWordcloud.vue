<template>
  <div
    class="chartContainer"
    id="chartContainer"
    ref="chartContainer"
    :style="chartContainerStyle"
  >
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
      @chartItemClicked="chartItemClicked"
    ></GoIn>
    <FiltersInChart
      :filtersInChart="filtersInChart"
      @filterCompsDataValueChanged="filterCompsDataValueChanged"
    ></FiltersInChart>
  </div>
</template>
<script>
import _ from "lodash";
import { timeFormats } from "../../constants.js";
import FiltersInChart from "./FiltersInChart";
import GoIn from "./GoIn";
export default {
  components: {
    FiltersInChart,
    GoIn
  },
  props: {
    bgType: {
      type: String,
      default: "color"
    },
    backgroundColor: {
      type: String,
      default: "rgba(255,255,255,0)"
    },
    backgroundImage: {
      type: String,
      default: null
    },
    borderType: {
      type: String,
      default: 'noBorder'
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
  data() {
    return {
      timeFormats: timeFormats,
      myChart: null,
      resizeListener: null
    };
  },
  computed: {
    chartContainerStyle() {
      let borderStyle = {};
      switch(this.borderType) {
        case "noBorder":
          borderStyle = {
            border: "none"
          }
          break;
        case "solidBorder":
          borderStyle = {
            border: "1px solid var(--littlelight-border-color)"
          }
          break;
        case "shadowBorder":
          borderStyle = {
            boxShadow: "inset 0 0 10px var(--shadow-border-color)"
          }
          break;
        default:
          break;      
      }
      if(this.bgType === "color") {
        return {
          ...borderStyle,
          background: this.backgroundColor
        }
      }
      return {
        ...borderStyle,
        backgroundImage: this.backgroundImage ? "url(" + this.backgroundImage + ")" : 'none',
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%"
      }
    },
    goInFieldInfo() {
      return this.$store.getters["selfAnalysis/getGoInFieldInfo"];
    },
    goInFieldInfoArr() {
      return this.$store.getters["selfAnalysis/getGoInFieldInfoArr"];
    }
  },
  methods: {
    chartItemClicked(
      dataIndex,
      dimensionFieldValue,
      rawFieldInfo,
      goInFieldInfo
    ) {
      this.$emit(
        "chartItemClicked",
        dataIndex,
        dimensionFieldValue,
        rawFieldInfo,
        goInFieldInfo
      );
    },
    filterCompsDataValueChanged(filterCompsData) {
      this.$emit("filterCompsDataValueChanged", filterCompsData);
    },
    setGoInField(goInFieldInfo, goInFieldInfoArr) {
      this.$store.commit("selfAnalysis/setGoInFieldInfo", goInFieldInfo);
      this.$store.commit("selfAnalysis/setGoInFieldInfoArr", goInFieldInfoArr);
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
    },
    transformMarkPoint(markPoint) {
      let transformedArr = [];
      let index = 0;
      if (
        !this.option.series[markPoint.seriesIndex] ||
        !this.option.series[markPoint.seriesIndex].data
      ) {
        return transformedArr;
      }
      if (markPoint.comparisonOp === "between") {
        for (let itemValue of this.option.series[markPoint.seriesIndex].data) {
          if (
            Number(itemValue) > Number(markPoint.smallerValue) &&
            Number(itemValue) < Number(markPoint.greaterValue)
          ) {
            transformedArr.push({
              value: itemValue,
              xAxis: this.option.xAxis.data[index],
              yAxis: itemValue,
              itemStyle: {
                color: markPoint.bgColor
              },
              label: {
                color: markPoint.fontColor
              }
            });
          }
          index++;
        }
      } else {
        let value = null;
        if (markPoint.valueType === "computedValue") {
          value = this.getComputedValue(markPoint);
        } else {
          value = markPoint.value;
        }

        index = 0;
        const data = this.option.series[markPoint.seriesIndex].data;
        for (let itemValue1 of data) {
          if (
            eval(
              "Number(itemValue1) " +
                this.getSignByText(markPoint.comparisonOp) +
                " Number(value)"
            )
          ) {
            transformedArr.push({
              value: itemValue1,
              xAxis:
                this.option.chartType === "horizontalBar"
                  ? itemValue1
                  : this.option.xAxis.data[index],
              yAxis:
                this.option.chartType === "horizontalBar"
                  ? this.option.yAxis.data[index]
                  : itemValue1,
              itemStyle: {
                color: markPoint.bgColor
              },
              label: {
                color: markPoint.fontColor
              }
            });
          }
          index++;
        }
      }
      return transformedArr;
    },
    transformMarkPoints(option) {
      const transformedMarkPoints = {};
      for (let markPoint of option.markPoints) {
        let markPointDatas = this.transformMarkPoint(markPoint);
        if (!transformedMarkPoints[markPoint.seriesIndex]) {
          transformedMarkPoints[markPoint.seriesIndex] = {
            symbolSize: [70, 40],
            data: markPointDatas,
            label: {
              show: true,
              fontSize: 12,
              color: "#fff",
              fontWeight: "lighter",
              formatter: params => {
                return [Infinity, -Infinity].includes(params.value)
                  ? params.value
                  : params.value.toLocaleString();
              }
            }
          };
        } else {
          transformedMarkPoints[markPoint.seriesIndex].data = [
            ...(transformedMarkPoints[markPoint.seriesIndex].data || []),
            ...markPointDatas
          ];
        }
      }
      Object.keys(transformedMarkPoints).forEach(key => {
        option.series[key].markPoint = transformedMarkPoints[key];
      });
      delete option.markPoints;
    },
    chartItemClickedWithParams(params) {
      const that = this;
      const rawFieldInfo = _.cloneDeep(that.goInFieldInfo);
      const val = that.option;
      let dimensionFieldValue = null;
      if (val.chartType === "analysisAreaMap") {
        dimensionFieldValue = params.data.rawName;
      } else if (["pie", "scatter", "funnel"].includes(val.chartType)) {
        dimensionFieldValue = params.name;
      } else {
        dimensionFieldValue =
          that.option[val.chartType === "horizontalBar" ? "yAxis" : "xAxis"]
            .data[params.dataIndex];
      }
      let goInFieldInfo = null;
      if (that.goInFieldInfo === undefined || that.goInFieldInfo === null) {
        const filter = {
          field: that.option.goIn.fromField.name,
          logicalOp: "AND",
          conditions: [
            {
              condition: "equal",
              value: dimensionFieldValue,
              logicalOp: "AND"
            }
          ]
        };

        const format = that.option.goIn.fromField.format;
        if (format) {
          filter.format = format;
        }

        goInFieldInfo = {
          index: 0,
          field: that.option.goIn.fields[0],
          filters: [filter]
        };
      } else {
        const goInFieldIndex = that.goInFieldInfo.index;
        if (goInFieldIndex === that.option.goIn.fields.length - 1) {
          return;
        } else {
          const newGoInFieldIndex = goInFieldIndex + 1;

          const filter = {
            field: that.goInFieldInfo.field.name,
            logicalOp: "AND",
            conditions: [
              {
                condition: "equal",
                value: dimensionFieldValue,
                logicalOp: "AND"
              }
            ]
          };
          const format = that.goInFieldInfo.field.format;
          if (format) {
            filter.format = format;
          }

          goInFieldInfo = {
            index: newGoInFieldIndex,
            field: that.option.goIn.fields[newGoInFieldIndex],
            filters: [...rawFieldInfo.filters, filter]
          };
        }
      }
      that.setGoInField(goInFieldInfo, [
        ...that.goInFieldInfoArr,
        goInFieldInfo
      ]);
      that.$emit(
        "chartItemClicked",
        params.dataIndex,
        dimensionFieldValue,
        rawFieldInfo,
        goInFieldInfo
      );
    }
  },
  beforeCreate() {
    if (!window.wordcloudRegistered) {
      const echartsWordcloud = require("./echarts-wordcloud").default;
      echartsWordcloud(this.$echarts);
      window.wordcloudRegistered = true;
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
    if (this.option && this.option.clickCallback) {
      this.myChart.on("click", this.chartItemClickedWithParams);
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
        if (this.myChart) {
          this.myChart.clear();
          if (val.markPoints) {
            this.transformMarkPoints(val);
          }
          this.myChart.setOption(val);
          this.myChart.off("click");
          this.myChart.off("georoam");
          this.myChart.off("datazoom");
          if (val.clickCallback) {
            const that = this;
            this.myChart.on("click", this.chartItemClickedWithParams);
          }
          if (this.georoamCallback) {
            this.myChart.on("georoam", this.georoamCallback);
          }
          if (this.datazoomCallback) {
            this.myChart.on("datazoom", this.datazoomCallback);
          }
        }
      },
      deep: true
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

