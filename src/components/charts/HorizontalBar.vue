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
        tooltip: {
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
          backgroundColor: "rgba(27,45,61,0.8)",
          textStyle: {
            fontSize: 12,
            color: "#fff"
          },
          padding: 10,
          trigger: "axis",
          axisPointer: {
            type: ""
          }
        },
        grid: {
          left: "20",
          right: "20",
          top: "20",
          bottom: "20",
          containLabel: true
        },
        yAxis: [
          {
            type: "category",
            data: this.names,
            axisTick: {
              show: false,
              alignWithLabel: true
            },
            axisLine: {
              lineStyle: {
                color: "RGB(1,166,164)"
              }
            },
            axisLabel: {
              rotate: 0,
              margin: 10,
              align: "right",
              textStyle: {
                color: "#bbbbbb"
              }
            }
          }
        ],
        xAxis: [
          {
            type: "value",
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false,
              textStyle: {
                color: "#fff"
              }
            },
            splitLine: {
              show: false,
              lineStyle: {
                type: "dashed",
                color: "#2b4c52"
              }
            }
          }
        ],
        series: [
          {
            name: this.data.seriesName || "",
            type: "bar",
            animationDurationUpdate: 1000,
            barWidth: "40%",
            data: this.values,
            itemStyle: {
              normal: {
                borderColor: "RGB(11,255,251)",
                barBorderRadius: 10,
                color: new this.$echarts.graphic.LinearGradient(1, 0, 0, 0, [
                  { offset: 0, color: "RGBA(11,255,251,0.7)" },
                  { offset: 1, color: "RGBA(11,255,251,0.3)" }
                ])
              },
              emphasis: {
                borderColor: "RGB(212,63,57)",
                shadowBlur: 0,
                shadowOffsetX: 0,
                ShadowOffsetY: 0,
                color: new this.$echarts.graphic.LinearGradient(1, 0, 0, 0, [
                  { offset: 0, color: "RGBA(212,63,57,0.7)" },
                  { offset: 1, color: "RGBA(212,63,57,0.3)" }
                ])
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
