<template>
  <div
    class="zcmorefunBubble"
    :style="chartContainerStyle"
  >
    <div
      v-if="option"
      :style="{paddingTop: filtersInChart.length > 0 ? '30px' : '0px', width:'100%', height: '100%'}"
    >
      <div
        v-if="option.title.show"
        class="bubble-title"
      >{{option.title.text}}</div>
      <div
        class="subtitle"
        v-if="option.title.show && option.title.subtext && option.title.subtext !== ''"
      >{{option.title.subtext}}</div>
      <div :style="{height: option.title.show ? (option.title.subtext && option.title.subtext !== '' ? 'calc(89% - 20px)' : 'calc(94% - 20px)') : 'calc(100% - 20px)'}">
        <div
          class="chartContainer"
          ref="chartContainer"
          @mousedown.stop="scaleMousedown"
          @mousemove.stop="scaleMousemove"
        >
          <svg
            :id="id"
            :width="svgWidth"
            :height="svgHeight"
            font-family="sans-serif"
            font-size="14"
            text-anchor="middle"
          ></svg>
        </div>
        <FiltersInChart
          :filtersInChart="filtersInChart"
          @filterCompsDataValueChanged="filterCompsDataValueChanged"
        ></FiltersInChart>
        <GoIn
          :goIn="option ? option.goIn : null"
          :goInFieldInfo="goInFieldInfo"
          :goInFieldInfoArr="goInFieldInfoArr"
          @setGoInField="setGoInField"
          @chartItemClicked="chartItemClicked"
        ></GoIn>
      </div>
    </div>
  </div>

</template>
<script>
import * as d3 from "d3";
import uuid from "../../utils/uuid.js";
import FiltersInChart from "./FiltersInChart";
import GoIn from "./GoIn";
let current = null;
export default {
  name: "ZcmorefunBubble",
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
    isChartFullscreen: {
      type: Boolean,
      default: false
    },
    isFullscreen: {
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
    dimensionFields: {
      type: Array,
      default: () => {
        return [];
      }
    },
    numberFields: {
      type: Array,
      default: () => {
        return [];
      }
    },
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
      default: 280
    },
    height: {
      type: Number,
      default: 280
    }
  },
  data() {
    return {
      id: null,
      svgWidth: this.width,
      svgHeight: this.height,
      enterTimeout: null,
      enterLastTime: null
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
    },
    name() {
      if (!this.dimensionFields || this.dimensionFields.length === 0) {
        return null;
      }
      return this.dimensionFields[0].name;
    },
    value() {
      if (!this.numberFields || this.numberFields.length === 0) {
        return null;
      }
      return this.numberFields[0].name;
    },
    total() {
      if (!this.value) {
        return 0;
      }
      let total = 0;
      for (let item of this.data) {
        total += Number(item[this.value]);
      }
      return total;
    },
    computedData() {
      if (
        !this.name ||
        !this.value ||
        !this.option ||
        !this.option.data ||
        this.option.data.length === 0
      ) {
        return [];
      }
      const data = JSON.parse(JSON.stringify(this.option.data));
      let index = 0;
      data.sort((a, b) => {
        return b[this.value] - a[this.value];
      });
      for (let item of data) {
        item.percent = Math.round((item[this.value] / this.total) * 100);
        item.index = index;
        index++;
      }
      return data;
    }
  },
  methods: {
    goIn(data) {
      const that = this;
      const rawFieldInfo = _.cloneDeep(that.goInFieldInfo);
      const val = that.option;
      let dimensionField = null;
      if (!this.goInFieldInfo) {
        dimensionField = this.option.goIn.fromField;
      } else {
        dimensionField = this.goInFieldInfoArr[this.goInFieldInfoArr.length - 1]
          .field;
      }
      const dimensionFieldValue = data[dimensionField.name];
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
        0,
        dimensionFieldValue,
        rawFieldInfo,
        goInFieldInfo
      );
    },
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
    setGoInField(goInFieldInfo, goInFieldInfoArr) {
      this.$store.commit("selfAnalysis/setGoInFieldInfo", goInFieldInfo);
      this.$store.commit("selfAnalysis/setGoInFieldInfoArr", goInFieldInfoArr);
    },
    filterCompsDataValueChanged(filterCompsData) {
      this.$emit("filterCompsDataValueChanged", filterCompsData);
    },
    scaleMousedown() {},
    scaleMousemove() {},
    throttle(func, wait, timeout, lastTime) {
      return function() {
        let context = this;
        let now = new Date();
        if (!timeout) {
          lastTime = now;
          timeout = setTimeout(() => {
            timeout = null;
            lastTime = null;
            func.apply(context, arguments);
          }, wait);
        } else {
          const interval = now - lastTime - wait;
          if (interval < 0) {
            lastTime = now;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              timeout = null;
              lastTime = null;
              // func.apply(context, arguments);
            }, wait);
          }
        }
      };
    },
    initCircle(data) {
      const that = this;
      d3.select("#" + that.id)
        .selectAll("*")
        .remove(); //清空作图区域
      that.resizeDiv(that);
      if (!data || data.length === 0) {
        return;
      }
      var svg = d3.select("#" + that.id),
        width = that.svgWidth,
        height = that.svgHeight;
      var format = d3.format(",d");
      var color = this.option
        ? [...this.option.color.slice(0, 10), "RGBA(166,179,201,0.4)"]
        : [
            "RGB(1,86,21)",
            "RGB(99,99,20)",
            "RGB(5,113,120)",
            "RGB(1,79,115)",
            "RGB(1,42,125)",
            "RGB(85,37,44)",
            "RGBA(166,179,201,0.4)"
          ]; //自定义颜色
      var stokeColor = this.option
        ? [...this.option.color.slice(0, 10), "RGBA(166,179,201,0.4)"]
        : [
            "RGB(0,174,3)",
            "RGB(210,191,9)",
            "RGB(10,236,233)",
            "RGB(0,155,218)",
            "RGB(0,49,159)",
            "RGB(165,53,52)",
            "RGB(166,179,201)"
          ];
      var pack = d3
        .pack()
        .size([width, height])
        .padding(30);
      var num, pid;
      var index = 0;
      var wrap = function(d) {
        const padding = 0;
        const textWidth = d.r > 40 ? d.r : d.r + 20;
        var self = d3.select(this);
        self.style("font-size", function(d) {
          const fontSize = Math.floor(d.r / 3);
          return (fontSize > 8 ? fontSize : 8) + "px";
        });
        var textLength = self.node().getComputedTextLength(),
          text = self.text();
        while (textLength > textWidth - 2 * padding && text.length > 0) {
          text = text.slice(0, -1);
          self.text(text + "...");
          textLength = self.node().getComputedTextLength();
        }
      };
      var root = d3
        .hierarchy({ children: data })
        .sum(function(d) {
          return d[that.value];
        })
        .each(function(d) {
          if (d.parent == null) {
            num = d[that.value];
          }
          if ((id = d.data[that.name])) {
            var id;
            const mod = index < 10 ? index : 10;
            d.id = id;
            d.class = id;
            pid = num / d[that.value];
            d.colorPick = mod;
            d.colorStroke = mod;
            index++;
          }
        });

      let tooltip = d3.select("#" + that.id + " + .bubble-tooltip");
      if (!tooltip || !tooltip._groups[0][0]) {
        tooltip = d3
          .select("#" + that.id)
          .select(function() {
            return this.parentNode;
          })
          .append("div")
          .attr("class", "bubble-tooltip tooltip")
          .style("display", "none");
      }

      var node = svg
        .selectAll("#" + that.id + ".node")
        .data(pack(root).leaves())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
          return "translate(" + (d.x || 0) + "," + (d.y || 0) + ")";
        })
        .style("cursor", "pointer")
        .style("-webkit-user-select", "none")
        .style("-moz-user-select", "none")
        .style("-ms-user-select", "none")
        .style("user-select", "none")
        .on(
          "mouseenter",
          that.throttle(
            function(d) {
              const circle = d3.select(this).select("circle");
              d3.select(this).on("mouseleave", function(d) {
                d3.select(this).on("mouseleave", null);
                const circle = d3.select(this).select("circle");
                circle
                  .transition()
                  .duration(50)
                  .attr("r", d.r);
              });
              circle
                .transition()
                .duration(50)
                .attr("r", d.r * 1.1);
            },
            200,
            that.enterTimeout,
            that.enterLastTime
          )
        )

        .on("click", function(d) {
          if (that.option && that.option.goIn && that.option.clickCallback) {
            that.goIn(d.data);
          }
        })

        .on("mouseover touchstart", function(d) {
          const circle = d3.select(this).select("circle");
          tooltip
            .html(
              '<span style="background-color:' +
                color[d.colorPick] +
                ';width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>' +
                d.data[that.name] +
                " " +
                d.data[that.value].toLocaleString() +
                " (" +
                d.data.percent +
                "%)" +
                "</span>"
            )
            .style("left", d3.event.pageX + 30 + "px")
            .style("top", d3.event.pageY + "px")
            .style("display", "block");
        })
        .on("mouseout touchend", function(d) {
          tooltip.style("display", "none");
        });

      node
        .append("circle")
        .attr("id", function(d) {
          return d.id;
        })
        .style("fill", function(d) {
          return color[d.colorPick];
        })
        .style("stroke", function(d) {
          return stokeColor[d.colorPick];
        })
        .attr("r", 0)
        .transition()
        .duration(1000)
        .attr("r", function(d) {
          return d.r || 0;
        });

      node
        .append("text")
        .attr("clip-path", function(d) {
          return "url(#clip-" + d.id + ")";
        })
        .selectAll("tspan")
        .data(function(d) {
          const data = JSON.parse(JSON.stringify(d.data));
          data.r = d.r;
          var arr = new Array();
          if (d.r < 12) {
            return arr;
          }
          arr.push(data);
          arr.push(data);
          return arr; //圆内显示内容
        })
        .enter()
        .append("tspan")
        .attr("x", 0)
        .attr("y", function(d, i, nodes) {
          return (i * (d.r || 0)) / 2.3;
        })
        .text(function(d, i, nodes) {
          if (d.index >= 10) {
            return "";
          }
          return i === 0 ? d[that.name] : d.percent + "%";
        })
        .each(wrap);
      node.selectAll("text").style("fill", function(d) {
        return "#fff";
      });
    },
    resizeDiv(that) {
      const containerComputedStyle = window.getComputedStyle(
        that.$refs.chartContainer
      );
      that.svgWidth = parseInt(containerComputedStyle.width);
      that.svgHeight = parseInt(containerComputedStyle.height);
    },
    init(){
      const that = this;
      that.resizeListener = () => {
        that.initCircle(that.computedData);
      };
      window.addEventListener("resize", that.resizeListener);
      this.initCircle(this.computedData);
    }
  },
  created() {
    current = this;
    this.id = "svg" + uuid();
  },
  mounted() {
    this.init();
  },
  activated() {
    this.init();
  },
  watch: {
    option: {
      handler(val, oldVal) {
        setTimeout(() => {
          current.initCircle(current.computedData);
        }, 50);
      },
      deep: true
    },
    isChartFullscreen() {
      this.initCircle(this.computedData);
    },
    isFullscreen() {
      this.initCircle(this.computedData);
    },
    data() {
      this.initCircle(this.computedData);
    },
    width() {
      this.svgWidth = this.width;
      this.initCircle(this.computedData);
    },
    height() {
      this.svgHeight = this.height;
      this.initCircle(this.computedData);
    }
  },
  beforeDestroy() {
    current = null;
    window.removeEventListener("resize", this.resizeListener);
  }
};
</script>
<style>
.zcmorefunBubble .tooltip {
  width: auto;
  height: auto;
  position: fixed;
  border-radius: 6px;
  background-color: rgba(27, 45, 61, 0.8);
  font-size: 12px;
  color: #fff;
  padding: 10px;
}
</style>

<style scoped>
.bubble-title {
  height: 5%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  font-family: sans-serif;
  padding-top: 5px;
}
.subtitle {
  height: 5%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  font-size: 12px;
  color: var(--gray-font-color);
}
.zcmorefunBubble {
  height: 100%;
  font-size: 14px;
  border-radius: 6px;
  padding: 10px;
}
.zcmorefunBubble > div {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 6px;
}
.zcmorefunBubble > div > div {
  border-radius: 6px;
}
.chartContainer {
  border-radius: 6px;
  position: relative;
  width: 100%;
  height: 100%;
}
</style>

