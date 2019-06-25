<template>
  <ZcmorefunChart
    :isFullscreen="isFullscreen"
    :isChartFullscreen="isChartFullscreen"
    :title="data.title"
    :option="option"
    :datazoomCallback="data.datazoomCallback"
  ></ZcmorefunChart>
</template>

<script>
import Chart from "./Chart";
export default {
  components: { ZcmorefunChart: Chart },
  props: {
    isChartFullscreen: {
      type: Boolean,
      default: false
    },
    isFullscreen: {
      type: Boolean,
      default: false
    },
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
    values() {
      const values = [];
      for (let item of this.data.data) {
        values.push(item.value);
      }
      return values;
    }
  },
  methods: {
    setOption() {
      this.option = {
        color: ["#3398DB"],
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
        tooltip: {
          backgroundColor: "rgba(27,45,61,0.8)",
          formatter: (params, ticket, callback) => {
            return (
              '<span style="background-color:rgb(11,255,251);width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>' +
              params[0].name +
              " " +
              params[0].value.toLocaleString() +
              '</br><span style="margin-left:16px;">TGI:</span> <span style="color:' +
              (Number(TGI) > 100 ? '#d43f39">' : '#fff">') +
              TGI +
              "</span>"
            );
          },
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
        grid: {
          left: "20",
          right: "30",
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
        yAxis: [
          {
            type: "value",
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
          }
        ],
        series: [
          {
            data: this.values,
            name: this.data.title,
            animationDurationUpdate: 1000,
            type: "line",
            areaStyle: {},
            showAllSymbol: true,
            smooth: true,
            symbolSize: 1,
            itemStyle: {
              borderColor: "RGB(11,255,251)",
              barBorderRadius: 10,
              color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "RGBA(11,255,251,0.3)" },
                { offset: 1, color: "RGBA(11,255,251,0.7)" }
              ]),
              opacity: 0
            },
            emphasis: {
              itemStyle: {
                borderColor: "RGB(11,255,251)",
                borderWidth: 2,
                borderType: "solid",
                opacity: 1
              }
            }
          }
        ]
      };
    }
  },
  mounted() {
    this.setOption();
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
