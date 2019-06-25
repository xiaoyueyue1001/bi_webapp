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
export default {
  name: "ZcmorefunWordCloud",
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
  beforeCreate() {
    if (!window.wordcloudRegistered) {
      const echartsWordcloud = require("./echarts-wordcloud").default;
      echartsWordcloud(this.$echarts);
      window.wordcloudRegistered = true;
    }
  },
  mounted() {
    this.setOption();
  },
  methods: {
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
          left: "20",
          right: "20",
          top: "50",
          bottom: "20",
          containLabel: true
        },
        series: [
          {
            name: "",
            type: "wordCloud",
            animationDurationUpdate: 1000,
            sizeRange: [12, 35],
            rotationRange: [-45, 90],
            textPadding: 0,
            autoSize: {
              enable: true,
              minSize: 6
            },
            textStyle: {
              normal: {
                color: function(params) {
                  return colors[params.dataIndex % colors.length];
                }
              },
              emphasis: {
                shadowBlur: 10,
                shadowColor: "#333"
              }
            },
            data: this.data
          }
        ]
      };
    }
  },
  watch: {
    data: {
      handler(val, oldVal) {
        this.setOption();
      },
      deep: true
    }
  }
};
</script>
