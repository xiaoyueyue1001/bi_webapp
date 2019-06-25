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
import colors from "./colors.json";
import gradientColors from "./gradientColors.json";
const MAXLENGTH = 10;
export default {
  name: "ZcmorefunCircle",
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
  methods: {
    getDisplayName(name) {
      if (name.length > MAXLENGTH) {
        return name.substring(0, MAXLENGTH - 2) + "...";
      }
      return name;
    },
    setOption() {
      this.option = {
        tooltip: {
          formatter: (params, ticket, callback) => {
            const TGI = params.data.TGI;
            return (
              '<span style="background-color:' +
              colors[params.dataIndex % colors.length] +
              ';width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>' +
              params.name +
              ": " +
              params.value.toLocaleString() +
              " (" +
              params.percent +
              "%)" +
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
          padding: 10
        },
        grid: {
          left: "0",
          right: "0",
          top: "0",
          bottom: "0",
          containLabel: true
        },
        legend: {
          show: false
        },
        color: [
          "RGBA(11,255,251,0.5)",
          "RGBA(212,63,57,0.5)",
          "RGBA(247,221,5,0.5)",
          "RGBA(0,70,255,0.5)",
          "RGBA(0,186,1,0.5)",
          "RGBA(118,209,253,0.5)",
          "RGBA(27,175,125,0.5)",
          "RGBA(222,123,123,0.5)",
          "RGBA(255,0,138,0.5)",
          "RGBA(164,37,200,0.5)"
        ],
        series: [
          {
            name: "shadow",
            type: "pie",
            // animationDurationUpdate: 1000,
            center: ["50%", "55%"],
            radius: ["30%", "55%"],
            avoidLabelOverlap: false,
            startAngle: 0,
            minAngle: 0,
            label: {
              show: false
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data:
              this.data && this.data.length > 1
                ? [
                    {
                      name: "",
                      value: 100,
                      itemStyle: {
                        color: {
                          type: "radial",
                          x: 0.5,
                          y: 0.5,
                          r: 1,
                          colorStops: [
                            {
                              offset: 0.3,
                              color: "RGBA(0,0,0,0)"
                            },
                            {
                              offset: 0.36125,
                              color: "RGBA(0,0,0,1)"
                            },
                            {
                              offset: 0.425,
                              color: "RGBA(0,0,0,0)"
                            }
                          ]
                        }
                      }
                    }
                  ]
                : []
          },
          {
            name: "",
            type: "pie",
            center: ["50%", "55%"],
            radius: ["30%", "55%"],
            avoidLabelOverlap: true,
            startAngle: 0,
            minAngle: 0,
            label: {
              normal: {
                formatter: params => {
                  return (
                    this.getDisplayName(params.name) +
                    "\n\n" +
                    params.percent +
                    "%"
                  );
                },
                lineHeight: 50,
                position: "outside",
                padding: [0, -40, 0, -40],
                verticalAlign: "middle",
                align: "center",
                fontSize: 12,
                color: "RGB(139,162,181)"
              }
            },
            labelLine: {
              normal: {
                show: true,
                length: 15,
                length2: 50
              }
            },
            data: this.data
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
