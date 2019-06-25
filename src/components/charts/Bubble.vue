<template>
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
</template>
<script>
import * as d3 from "d3";
import uuid from "../../utils/uuid.js";
export default {
  name: "ZcmorefunBubble",
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
      svgHeight: this.height
    };
  },
  computed: {
    total() {
      let total = 0;
      for (let item of this.data) {
        total += item.value;
      }
      return total;
    },
    computedData() {
      const data = JSON.parse(JSON.stringify(this.data));
      let index = 0;
      data.sort((a, b) => {
        return b.value - a.value;
      });
      for (let item of data) {
        item.percent = Math.round((item.value / this.total) * 100);
        item.index = index;
        index++;
      }
      return data;
    }
  },
  methods: {
    scaleMousedown() {},
    scaleMousemove() {},
    initCircle(data) {
      d3.select("#" + this.id)
        .selectAll("*")
        .remove(); //清空作图区域
      this.resizeDiv(this);  
      var svg = d3.select("#" + this.id),
        width = this.svgWidth,
        height = this.svgHeight;
      var format = d3.format(",d");
      var color = [
        "RGB(1,86,21)",
        "RGB(99,99,20)",
        "RGB(5,113,120)",
        "RGB(1,79,115)",
        "RGB(1,42,125)",
        "RGB(85,37,44)",
        "RGBA(166,179,201,0.4)"
      ]; //自定义颜色
      var stokeColor = [
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
        const textWidth = d.r * 2.4;
        var self = d3.select(this),
          textLength = self.node().getComputedTextLength(),
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
          return d.value;
        })
        .each(function(d) {
          if (d.parent == null) {
            num = d.value;
          }
          if ((id = d.data.name)) {
            var id;
            const mod = index < 10 ? index % 6 : 6;
            d.id = id;
            d.class = id;
            pid = num / d.value;
            d.colorPick = mod;
            d.colorStroke = mod;
            index++;
          }
        });

      let tooltip = d3.select("#" + this.id + " + .bubble-tooltip");
      if (!tooltip || !tooltip._groups[0][0]) {
        tooltip = d3
          .select("#" + this.id)
          .select(function() {
            return this.parentNode;
          })
          .append("div")
          .attr("class", "bubble-tooltip tooltip")
          .style("display", "none");
      }

      var node = svg
        .selectAll("#" + this.id + ".node")
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
        .on("mousedown mouseover touchstart", d => {
          const TGI = d.data.TGI;
          tooltip
            .html(
              '<span style="background-color:' +
                color[d.colorPick] +
                ';width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>' +
                d.data.name +
                " " +
                d.data.value.toLocaleString() +
                " (" +
                d.data.percent +
                "%)" +
                '</br><span style="margin-left:16px;">TGI:</span> <span style="color:' +
                (Number(TGI) > 100 ? '#d43f39">' : '#fff">') +
                TGI +
                "</span>"
            )
            .style("left", d3.event.pageX + 30 + "px")
            .style("top", d3.event.pageY + "px")
            .style("display", "block");
        })
        .on("mouseout touchend", d => {
          tooltip.style("display", "none");
        });

      node
        .append("circle")
        .attr("id", function(d) {
          return d.id;
        })
        .attr("r", function(d) {
          return d.r || 0;
        })
        .style("fill", function(d) {
          return color[d.colorPick];
        })
        .style("stroke", function(d) {
          return stokeColor[d.colorPick];
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
          if (d.index > 9) {
            return "";
          }
          return i === 0 ? d.name : d.percent + "%";
        })
        .each(wrap);
      node
        .selectAll("text")
        .style("fill", function(d) {
          return "#fff";
        })
        .style("font-size", function(d) {
          const fontSize = Math.floor(d.r / 2.5);
          return (fontSize > 8 ? fontSize : 8) + "px";
        });
    },
    resizeDiv(that) {
      const containerComputedStyle = window.getComputedStyle(
        that.$refs.chartContainer
      );
      that.svgWidth = parseInt(containerComputedStyle.width);
      that.svgHeight = parseInt(containerComputedStyle.height);
    }
  },
  created() {
    this.id = "svg" + uuid();
  },
  mounted() {
    const that = this;
    that.resizeListener = () => {
      // that.resizeDiv(that);
      that.initCircle(that.computedData);
    };
    window.addEventListener("resize", that.resizeListener);
    this.initCircle(this.computedData);
  },
  watch: {
    isChartFullscreen() {
      // this.resizeDiv(this);
      this.initCircle(this.computedData);
    },
    isFullscreen() {
      // this.resizeDiv(this);
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
    window.removeEventListener("resize", this.resizeListener);
  }
};
</script>
<style>
.tooltip {
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
.chartContainer {
  border-radius: 6px;
  position: relative;
  width: 100%;
  height: 100%;
}
</style>

