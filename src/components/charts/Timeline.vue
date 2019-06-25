<template>
  <ZcmorefunChart :isFullscreen="isFullscreen" :isChartFullscreen="isChartFullscreen" :title="data.title" :option="option" :datazoomCallback="data.datazoomCallback"></ZcmorefunChart>
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
    }
  },
  methods: {
    setOption() {
      this.option = {
        dataZoom: [
          {
            type: "inside",
            start: this.data.start || 0,
            end: this.data.end || 100,
            minValueSpan: 1
          },
          {
            show: false,
            type: "slider",
            bottom: 60,
            start: this.data.start || 0,
            end: this.data.end || 100,
            minValueSpan: 1
          }
        ],
        tooltip: {
          backgroundColor: "rgba(27,45,61,0.8)",
          formatter: (params, ticket, callback) => {
            return (
              params[0].name +
              '</br><span style="background-color:rgb(11,255,251);width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>调整幅度：' +
              params[0].data["调整幅度"] +
              (this.data.unit || "") +
              '</br><span style="background-color:rgb(11,255,251);width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>调整前：' +
              params[0].data["调整前"] +
              (this.data.unit || "") +
              '</br><span style="background-color:rgb(11,255,251);width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>调整后：' +
              params[0].data["调整后"] +
              (this.data.unit || "")
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
          show: true,
          lineStyle: {
            color: "rgba(0,0,0,0)"
          }
        },
        singleAxis: {
          left: 40,
          right: 40,
          bottom: 80,
          top: 100,
          boundaryGap: false,
          type: "category",
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
        series: [
          {
            coordinateSystem: "singleAxis",
            type: "scatter",
            animationDurationUpdate: 1000,
            symbol: "pin",
            symbolSize: [80, 60],
            symbolOffset: [0, 20],
            itemStyle: {
              color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "RGBA(11,255,251,0.7)" },
                { offset: 1, color: "RGBA(11,255,251,0.3)" }
              ])
            },
            label: {
              normal: {
                show: true,
                position: "inside",
                color: "white",
                fontSize: 12,
                formatter: function(params) {
                  return params.data["调整幅度"].replace("%", "") + "\n%";
                }
              }
            },
            data: this.data.data
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
