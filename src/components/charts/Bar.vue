<template>
  <ZcmorefunChart
    :isFullscreen="isFullscreen"
    :isChartFullscreen="isChartFullscreen"
    :width="width"
    :height="height"
    :option="option"
  ></ZcmorefunChart>
</template>

<script>
import Chart from "./Chart";
export default {
  name: "ZcmorefunBar",
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
    data: Array,
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
      option: null
    };
  },
  computed: {
    names() {
      const names = [];
      for (let item of this.data) {
        names.push(item.name);
      }
      return names;
    },
    values() {
      const values = [];
      for (let item of this.data) {
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
            const TGI = this.data[params[0].dataIndex].TGI;
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
          top: "50",
          bottom: "20",
          containLabel: true
        },
        xAxis: [
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
              align: "center",
              textStyle: {
                color: "#bbbbbb"
              }
            }
          }
        ],
        yAxis: [
          {
            type: "value",
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: "#bbbbbb"
              }
            },
            splitLine: {
              lineStyle: {
                type: "dashed",
                color: "#2b4c52"
              }
            }
          }
        ],
        series: [
          {
            name: "",
            type: "bar",
            animationDurationUpdate: 1000,
            barWidth: "40%",
            data: this.values,
            markPoint: {
              symbolSize: [70, 40],
              data: [{ type: "max", name: "最大值" }],
              label: {
                show: true,
                fontSize: 12,
                color: '#fff',
                fontWeight: 'lighter',
                formatter: params => {
                  return params.value.toLocaleString();
                },
                // width: "200%"
                // padding: 5
              }
            },
            itemStyle: {
              normal: {
                borderColor: "RGB(11,255,251)",
                barBorderRadius: 10,
                color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: "RGBA(11,255,251,0.7)" },
                  { offset: 1, color: "RGBA(11,255,251,0.3)" }
                ])
              },
              emphasis: {
                borderColor: "RGB(212,63,57)",
                shadowBlur: 0,
                shadowOffsetX: 0,
                ShadowOffsetY: 0,
                color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
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
