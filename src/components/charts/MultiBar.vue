<template>
  <ZcmorefunChart :isFullscreen="isFullscreen" :isChartFullscreen="isChartFullscreen" :title="data.title" :option="option" :datazoomCallback="data.datazoomCallback"></ZcmorefunChart>
</template>

<script>
import Chart from "./Chart";
import colors from "./colors.json";
import gradientColors from "./gradientColors.json";
export default {
  components: {
    isChartFullscreen: {
      type: Boolean,
      default: false
    },
    isFullscreen: {
      type: Boolean,
      default: false
    },
    ZcmorefunChart: Chart
  },
  props: {
    data: Object
  },
  data() {
    return {
      option: null
    };
  },
  computed: {
    names() {
      const names = [];
      for (let item of this.data.data) {
        names.push(item.name);
      }
      return names;
    },
    keys() {
      if (!this.data.data || this.data.data.length === 0) {
        return [];
      }
      const keys = Object.keys(this.data.data[0]);
      keys.splice(keys.indexOf("name"), 1);
      return keys;
    },
    series() {
      const series = [];
      let index = 0;
      for (let key of this.keys) {
        const colorIndex = index % gradientColors.length;
        const color = colors[colorIndex];
        const gradientColor = gradientColors[colorIndex];
        series.push({
          type: "bar",
          name: key,
          showAllSymbol: true,
          animationDurationUpdate: 1000,
          symbolSize: 0,
          barWidth: "20%",
          itemStyle: {
            normal: {
              borderColor: color,
              barBorderRadius: 10,
              color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: gradientColor[0] },
                { offset: 1, color: gradientColor[1] }
              ])
            }
          },
          data: this.attrValueToArray(key, this.data.data)
        });
        index++;
      }
      return series;
    },
    legendData() {
      const legendData = [];
      for (let key of this.keys) {
        legendData.push({
          name: key,
          textStyle: {
            fontSize: 14,
            color: "#fff"
          },
          icon:
            "path://M511.90181978 511.90181978m-89.54028743 0a89.54028745 89.54028745 0 1 0 179.08057505 0 89.54028745 89.54028745 0 1 0-179.08057505 0Z"
        });
      }
      return legendData;
    }
  },
  mounted() {
    this.setOption();
  },
  methods: {
    attrValueToArray(attrName, objArray) {
      const results = [];
      for (let obj of objArray) {
        results.push(obj[attrName]);
      }
      return results;
    },
    setOption() {
      this.option = {
        title: {
          show: false
        },
        dataZoom: [
          {
            type: "inside",
            start: this.data.start || 0,
            end: this.data.end || 100,
            minValueSpan: 10
          },
          {
            show: false,
            type: "slider",
            bottom: 60,
            start: this.data.start || 0,
            end: this.data.end || 100,
            minValueSpan: 10
          }
        ],
        color: colors,
        tooltip: {
          backgroundColor: "rgba(27,45,61,0.8)",
          textStyle: {
            fontSize: 12,
            color: "#fff"
          },
          padding: 10,
          trigger: "axis"
        },
        axisPointer: {
          lineStyle: {
            color: "rgb(51,75,92)"
          }
        },
        toolbox: {
          show: false,
          feature: {
            saveAsImage: {}
          }
        },
        legend: {
          inactiveColor: "#bbbbbb",
          data: this.legendData,
          top: 10,
          right: 15
        },
        grid: {
          left: "20",
          right: "20",
          top: "20",
          bottom: "20",
          containLabel: true
        },
        xAxis: {
          boundaryGap: false,
          data: this.names,
          axisLine: {
            lineStyle: {
              color: "#59a2a4"
            }
          },
          axisLabel: {
            formatter: "{value}",
            textStyle: {
              color: "#bbbbbb"
            }
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: true
          }
        },
        yAxis: {
          type: "value",
          offset: 10,
          min: this.data.min,
          max: this.data.max,
          axisLine: {
            show: false
          },
          axisLabel: {
            formatter: "{value}",
            textStyle: {
              color: "#bbbbbb"
            }
          },
          splitNumber: 3,
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          }
        },
        series: this.series
      };
    }
  },
  watch: {
    data: {
      handler(val, oldVal) {
        this.setOption();
      }
    }
  }
};
</script>
