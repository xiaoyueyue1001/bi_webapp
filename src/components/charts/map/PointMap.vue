<template>
  <div
    class="point-map"
    :style="{width: '100%', height: '100%'}"
    @mousedown.stop="scaleMousedown"
  >
    <ZcmorefunMap
      :isFullscreen="isFullscreen"
      :isChartFullscreen="isChartFullscreen"
      class="zcmorefun-map"
      :height="height"
      :width="width"
      :title="data.title"
      :option="option"
      :clickCallback="data.clickCallback"
      :georoamCallback="data.georoamCallback"
      :datazoomCallback="data.datazoomCallback"
    ></ZcmorefunMap>
    <div 
      v-if="showScale"
      class="scale-wrapper">
      <div
        class="scale"
        ref="scale"
        v-if="!data.notShowScale"
      >
        <div
          class="scale-nums flex-row"
          :style="{width: scaleNumsWidth + 'px', left: scaleNumsLeft + 'px' }"
        >
          <template v-for="(item, index) in scaleNums">
            <div class="scale-num">{{item.toLocaleString()}}</div>
          </template>
        </div>
        <div class="scale-seps flex-row">
          <template v-for="(item, index) in scaleNums">
            <div class="scale-sep"></div>
            <div
              v-if="index < scaleNums.length - 1"
              class="flex-empty"
            ></div>
          </template>
        </div>
        <div
          class="color-bar"
          ref="colorBar"
        >
          <div
            class="gray-color-bar left"
            :style="{width: littleSliderNum + 'px' }"
          ></div>
          <div
            class="gray-color-bar right"
            :style="{width: colorBarWidth - biggerSliderNum + 'px' }"
          ></div>
          <i
            class="ivu-icon dubhe-iconfont dubhe-icon-slider icon-slider"
            @touchstart="sliderTouchstart('Left',$event)"
            @mousedown="sliderMousedown('Left',$event)"
            :style="{left: sliderNumLeft + 'px',opacity: sliderNumLeftClicked?1:0}"
          ></i>
          <i
            class="ivu-icon dubhe-iconfont dubhe-icon-slider icon-slider"
            @touchstart="sliderTouchstart('Right',$event)"
            @mousedown="sliderMousedown('Right',$event)"
            :style="{left: sliderNumRight + 'px',opacity: sliderNumRightClicked?1:0}"
          ></i>
        </div>
        <span class="unit"></span>
      </div>
    </div>
    <div
      class="rangking-list"
      v-if="showRankList && !data.notShowRankingList"
    >
      <div class="ranking-list-title">{{data.rankingTitle}}</div>
      <div
        class="rangking-item"
        v-for="(item,index) in top10"
      >
        <div class="rangking-item-ranking">{{index + 1}}</div>
        <div class="rangking-item-name-value">
          <div
            class="rangking-item-name"
            :title="item.name"
          >{{item.name + " "}}</div>
          <div class="rangking-item-value">{{item.value[2] ? item.value[2].toLocaleString() : ''}}</div>
        </div>
      </div>
    </div>
    <div
      class="up-down"
      v-if="data.showUpDown"
    >
      <div
        class="up-down-item"
        @click="upClicked"
        :class="upSelected?'selected':''"
      >
        <i class="icon ivu-icon dubhe-iconfont icon-dot"></i> 上涨
      </div>
      <div
        class="up-down-item"
        @click="downClicked"
        :class="downSelected?'selected':''"
      >
        <i class="icon ivu-icon dubhe-iconfont icon-circle"></i> 下跌
      </div>
    </div>
  </div>
</template>

<script>
import Map from "./Map.vue";
export default {
  components: {
    ZcmorefunMap: Map
  },
  props: {
    isChartFullscreen: {
      type: Boolean,
      default: false
    },
    isFullscreen: {
      type: Boolean,
      default: false
    },
    isFullscreen: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => {
        return {};
      }
    },
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
      movementX: 0,
      tag: null,
      sliderDragstartPosX: 0,
      upSelected: true,
      downSelected: true,
      sliderNumLeftClicked: false,
      sliderNumRightClicked: false,
      sliderNumLeft: 0,
      sliderNumRight: 560,
      sliderIndexLeft: 0,
      sliderIndexRight: 10,
      littleSliderNum: 0,
      biggerSliderNum: 560,
      littleSliderIndex: 0,
      splitNumber: this.data.splitNumber || 5,
      bigSliderIndex: 10,
      colorBarWidth: 560,
      // scaleNums: [0, 1000, 2000, 3000, 4000, 5000, 6000],
      colors: [[0, 186, 1], [247, 221, 5], [212, 63, 57]],
      option: null,
      filteredData: null
    };
  },
  computed: {
    showScale() {
      return this.width >= 600 && this.height >= 320;
    },
    showRankList() {
      return this.width >= 600 && this.height >= 320;
    },
    scaleNumsLeft() {
      return -this.colorBarWidth / this.splitNumber / 2;
    },
    scaleNumsWidth() {
      return (this.colorBarWidth / this.splitNumber) * (this.splitNumber + 1);
    },
    maxValue() {
      let maxValue = 0;
      for (let item of this.data.data) {
        if (item.value[2] > maxValue) {
          maxValue = item.value[2];
        }
      }
      maxValue = Math.ceil(maxValue / this.splitNumber);
      const numLen = String(maxValue).length;
      const denominator = Math.pow(10, numLen - 1);
      maxValue = Math.ceil(maxValue / denominator);
      maxValue = maxValue * denominator * this.splitNumber;
      return maxValue;
    },
    scaleNums() {
      const scaleNums = [];
      const scale = this.maxValue / this.splitNumber;
      for (let i = 0; i < this.splitNumber + 1; i++) {
        scaleNums.push(scale * i);
      }
      return scaleNums;
    },
    length() {
      return this.scaleNums.length;
    },
    mod() {
      return this.scaleNums.length % 2;
    },
    middle() {
      return this.scaleNums.length / 2;
    },
    totalDistance() {
      return this.mod === 0 ? this.middle - 0.5 : this.middle;
    },
    aScaleWidth() {
      const aScaleWidth = this.colorBarWidth / (this.length - 1);
      return aScaleWidth;
    },
    top10() {
      const data = JSON.parse(JSON.stringify(this.data.data));
      data.sort((a, b) => {
        return b.value[2] - a.value[2];
      });
      const top10 = data.slice(0, 10);
      return top10;
    }
  },
  mounted() {
    this.filteredData = this.data.data;
    this.setOption();
    document.addEventListener("mouseup", this.sliderMoveEnd);
    document.addEventListener("mousemove", this.sliderMove);
    document.addEventListener("touchmove", this.sliderMove);
    document.addEventListener("touchend", this.sliderMoveEnd);
  },
  beforeDestroy() {
    document.removeEventListener("mouseup", this.sliderMoveEnd);
    document.removeEventListener("mousemove", this.sliderMove);
    document.removeEventListener("touchmove", this.sliderMove);
    document.removeEventListener("touchend", this.sliderMoveEnd);
  },
  methods: {
    getMarkpointData() {
      if (isNaN(this.data.markpointDataIndex)) {
        return [];
      }
      return [this.data.data[this.data.markpointDataIndex]];
    },
    setOption() {
      this.option = {
        tooltip: {
          trigger: "item",
          formatter: (params, ticket, callback) => {
            const color =
              "rgb(" +
              this.getColor(this.filteredData[params.dataIndex].value[2]).join(
                ","
              ) +
              ")";
            // return (
            //   params.name +
            //   '</br><span style="background-color:' +
            //   color +
            //   ';width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>' +
            //   params.value[2].toLocaleString() +
            //   (this.data.unit || "")

            const TGI = params.data.TGI;
            return (
              '<span style="background-color:' +
              color +
              ';width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>' +
              params.name +
              ": " +
              params.value[2].toLocaleString() +
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
        series: [
          {
            name: this.data.title,
            type: "custom",
            coordinateSystem: "geo",
            animation: false,
            renderItem: (params, api) => {
              const coord = api.coord(
                this.filteredData[params.dataIndex].value
              );
              if (!coord) return;
              const color =
                "rgb(" +
                this.getColor(
                  this.filteredData[params.dataIndex].value[2]
                ).join(",") +
                ")";
              if (
                this.filteredData[params.dataIndex].value[3] &&
                this.filteredData[params.dataIndex].value[3] < 0
              ) {
                const item = {
                  type: "path",
                  position: coord,
                  shape: {
                    pathData:
                      "path('M 7.38 4.82 A 2.56 2.56 0 0 0 4.82 2.25 A 2.56 2.56 0 0 0 2.25 4.82 A 2.56 2.56 0 0 0 4.82 7.38 A 2.56 2.56 0 0 0 7.38 4.82 Z m 0.84 -3.41 a 4.82 4.82 0 0 1 0 6.81 a 4.82 4.82 0 0 1 -6.81 0 A 4.82 4.82 0 0 1 8.22 1.41 Z')",
                    x: -5,
                    y: -5,
                    width: 10,
                    height: 10
                  },
                  style: {
                    fill: color
                  }
                };
                return item;
              }
              return {
                type: "circle",
                shape: {
                  cx: coord[0],
                  cy: coord[1],
                  r: 5
                },
                style: {
                  fill: color
                }
              };
            },
            data: this.filteredData
          },
          {
            name: "",
            type: "scatter",
            coordinateSystem: "geo",
            symbol: "pin",
            symbolSize: 60,
            itemStyle: {
              color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "RGBA(11,125,121,1)" },
                { offset: 1, color: "RGBA(11,125,121,0.8)" }
              ])
            },
            label: {
              show: true,
              color: "white",
              formatter: "{b}"
            },
            data: this.getMarkpointData()
          }
        ],
        geo: {
          zoom: 1,
          scaleLimit: {
            min: 0.3
          },
          map: this.data.area,
          // center: [113.944805, 22.548782],
          label: {
            show: true,
            color: "#ffffff",
            emphasis: {
              color: "#ffffff"
            }
          },
          roam: this.data.roam || true,
          itemStyle: {
            normal: {
              borderColor: "#59a2a4",
              borderWidth: 1,
              areaColor: "rgba(11,255,251,0.05)"
            },
            emphasis: {
              areaColor: "rgba(11,255,251,0.5)",
              borderWidth: 1
            }
          }
        }
      };
    },
    downClicked() {
      this.$emit("resetInterval");
      this.downSelected = !this.downSelected;
      this.filterData();
    },
    upClicked() {
      this.$emit("resetInterval");
      this.upSelected = !this.upSelected;
      this.filterData();
    },
    filterData() {
      const filteredData = [];
      const min = this.scaleNums[this.littleSliderIndex];
      const max = this.scaleNums[this.bigSliderIndex];
      for (let item of this.data.data) {
        if (
          (!this.upSelected && item.value[3] > 0) ||
          (!this.downSelected && item.value[3] < 0)
        ) {
          continue;
        }
        if (item.value[2] >= min && item.value[2] < max) {
          filteredData.push(item);
        }
      }
      this.filteredData = filteredData;
      this.option.series[0].data = this.filteredData;
    },
    sliderTouchstart(tag, event) {
      this.$emit("resetInterval");
      this.tag = tag;
      this.movementX = 0;
      this["sliderNum" + tag + "Clicked"] = true;
      this.sliderDragstartPosX = e.touches[0].clientX;
    },
    sliderMousedown(tag, event) {
      this.$emit("resetInterval");
      this.tag = tag;
      this.movementX = 0;
      this["sliderNum" + tag + "Clicked"] = true;
    },
    sliderMove(event) {
      const tag = this.tag;
      if (this["sliderNum" + tag + "Clicked"]) {
        let movementX = event.movementX;
        if (isNaN(movementX)) {
          movementX =
            e.touches[0].clientX - this.sliderDragStartX - this.movementX;
        }
        this.movementX = this.movementX + movementX;
        let newSliderNum = this["sliderNum" + tag] + movementX;
        if (newSliderNum < 0) {
          this["sliderNum" + tag] = 0;
          return;
        }
        if (newSliderNum > 560) {
          this["sliderNum" + tag] = 560;
          return;
        }
        this["sliderNum" + tag] = newSliderNum;
      }
    },
    sliderMoveEnd() {
      if (!this["sliderNumLeftClicked"] && !this["sliderNumRightClicked"]) {
        return;
      }
      if (this["sliderNumLeftClicked"]) {
        this.sliderIndexLeft = Math.round(
          this["sliderNumLeft"] / this.aScaleWidth
        );
        this["sliderNumLeft"] = this.sliderIndexLeft * this.aScaleWidth;
        this["sliderNumLeftClicked"] = false;
      }
      if (this["sliderNumRightClicked"]) {
        this.sliderIndexRight = Math.round(
          this["sliderNumRight"] / this.aScaleWidth
        );
        this["sliderNumRight"] = this.sliderIndexRight * this.aScaleWidth;
        this["sliderNumRightClicked"] = false;
      }
      if (this["sliderNumLeft"] < this["sliderNumRight"]) {
        this.littleSliderNum = this["sliderNumLeft"];
        this.littleSliderIndex = this["sliderIndexLeft"];
        this.biggerSliderNum = this["sliderNumRight"];
        this.bigSliderIndex = this["sliderIndexRight"];
      } else {
        this.littleSliderNum = this["sliderNumRight"];
        this.littleSliderIndex = this["sliderIndexRight"];
        this.biggerSliderNum = this["sliderNumLeft"];
        this.bigSliderIndex = this["sliderIndexLeft"];
      }
      this.filterData();
      this.tag = null;
      this.movementX = 0;
    },
    getColor(num) {
      const length = this.length - 1;
      const mod = this.mod;
      const middle = this.middle;
      const totalDistance = this.totalDistance;
      const index = this.getPosition(num).index;
      if (index < middle) {
        return [
          this.colors[0][0] +
            ((this.colors[1][0] - this.colors[0][0]) * index) / totalDistance,
          this.colors[0][1] +
            ((this.colors[1][1] - this.colors[0][1]) * index) / totalDistance,
          this.colors[0][2] +
            ((this.colors[1][2] - this.colors[0][2]) * index) / totalDistance
        ];
      } else {
        const distance = index - totalDistance;
        return [
          this.colors[1][0] +
            ((this.colors[2][0] - this.colors[1][0]) * distance) /
              totalDistance,
          this.colors[1][1] +
            ((this.colors[2][1] - this.colors[1][1]) * distance) /
              totalDistance,
          this.colors[1][2] +
            ((this.colors[2][2] - this.colors[1][2]) * distance) / totalDistance
        ];
      }
    },
    getPosition(num) {
      let index = 0;
      let floorAndCeiling = {};
      let nextScaleNum = 0;
      let nexIndex = 0;
      let maxIndex = this.length - 1;
      for (let scaleNum of this.scaleNums) {
        nextScaleNum = 0;
        nexIndex = index + 1;
        if (nexIndex === maxIndex + 1) {
          nextScaleNum = this.scaleNums[maxIndex];
          floorAndCeiling = {
            floor: {
              index: maxIndex,
              value: nextScaleNum
            },
            ceiling: null,
            index: maxIndex
          };
          return floorAndCeiling;
        }
        nextScaleNum = this.scaleNums[nexIndex];
        if (num >= scaleNum && num < nextScaleNum) {
          floorAndCeiling = {
            floor: {
              index: index,
              value: scaleNum
            },
            ceiling: {
              index: nexIndex,
              value: nextScaleNum
            },
            index: index + (num - scaleNum) / (nextScaleNum - scaleNum)
          };
          return floorAndCeiling;
        }
        index++;
      }
    },
    scaleMousedown() {},
    scaleMousemove() {}
  },
  watch: {
    data: {
      handler(val, oldVal) {
        this.sliderNumLeft = 0;
        this.sliderNumRight = 560;
        this.sliderIndexLeft = 0;
        this.sliderIndexRight = 10;
        this.littleSliderNum = 0;
        this.biggerSliderNum = 560;
        this.littleSliderIndex = 0;
        this.bigSliderIndex = 10;
        this.filteredData = this.data.data;
        this.setOption();
      },
      deep: true
    },
    width() {
      this.setOption();
    },
    height() {
      this.setOption();
    }
  }
};
</script>

<style>
.point-map .chartContainer {
  box-shadow: none !important;
  width: 100%;
  height: 100%;
}
</style>


<style scoped>
.up-down-item {
  font-size: 14px;
  height: 20px;
  line-height: 20px;
  color: #bbbbbb;
  cursor: pointer;
}
.up-down-item.selected {
  color: #0bfffb;
}
.up-down-item i {
  font-size: 12px;
}
.up-down {
  width: 50px;
  height: 40px;
  background: transparent;
  position: absolute;
  top: 60px;
  left: 30px;
}
.rangking-item-name-value {
  width: 90px;
  height: 15px;
  line-height: 15px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: inline-block;
  background: linear-gradient(
    to right,
    var(--rangking-bg-color),
    rgba(0, 0, 0, 0)
  );
  position: absolute;
  top: 3px;
}
.rangking-item-name {
  width: 50px;
  height: 15px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  position: absolute;
  background: transparent;
}
.rangking-item-value {
  height: 15px;
  position: absolute;
  right: 0px;
  top: 0px;
}
.rangking-item-ranking {
  width: 20px;
  height: 15px;
  line-height: 15px;
  margin-right: 5px;
  text-align: center;
  background: var(--rangking-bg-color);
  display: inline-block;
}
.rangking-item:nth-child(2) {
  --rangking-bg-color: rgba(212, 63, 57, 1);
}
.rangking-item:nth-child(3) {
  --rangking-bg-color: rgba(247, 221, 5, 1);
}
.rangking-item:nth-child(4) {
  --rangking-bg-color: rgba(0, 186, 1, 1);
}
.rangking-item {
  font-size: 12px;
  line-height: 21px;
  /* height: 12px; */
  margin-top: 3px;
  font-weight: lighter;
  --rangking-bg-color: rgba(42, 71, 94, 1);
  position: relative;
}
.ranking-list-title {
  font-size: 16px;
  margin-bottom: 6px;
  width: auto;
}
.rangking-list {
  color: white;
  width: 120px;
  height: 210px;
  background: transparent;
  position: absolute;
  bottom: 110px;
  left: 20px;
}
.icon-slider {
  cursor: pointer;
  font-size: 12px;
  margin-left: -16px;
  margin-right: -16px;
  position: absolute;
  bottom: -30px;
  padding: 10px;
  color: #76d1fd;
  opacity: 0;
}
.icon-slider:hover {
  opacity: 1 !important;
  z-index: 100;
}
.scale-seps {
  height: 6px;
  width: 560px;
  background: transparent;
  position: absolute;
  bottom: 20px;
  left: 0px;
}
.scale-sep {
  width: 1px;
  height: 4px;
  background: white;
  z-index: 100;
}
.scale-nums {
  height: 24px;
  background: transparent;
  position: absolute;
  top: 0px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.scale-num {
  font-size: 12px;
  color: #bbbbbb;
  font-weight: lighter;
  /* width: 56px; */
  text-align: center;
  flex: 1;
}
.scale-wrapper {
  position: absolute;
  width: 630px;
  height: 50px;
  bottom: 10px;
  left: 20px;
}
.scale {
  position: relative;
  width: 100%;
  height: 100%;
}
.point-map {
  position: relative;
}
.gray-color-bar {
  height: 6px;
  /* width: 0px; */
  background: #666;
  position: absolute;
}
.gray-color-bar.left {
  left: 0px;
}
.gray-color-bar.right {
  right: 0px;
}
.color-bar {
  height: 6px;
  width: 560px;
  background: linear-gradient(
    to right,
    rgb(0, 186, 1),
    rgb(247, 221, 5),
    rgb(212, 63, 57)
  );
  position: absolute;
  bottom: 20px;
  left: 0px;
}
.unit {
  position: absolute;
  bottom: 15px;
  left: 580px;
  color: #bbbbbb;
  font-size: 14px;
}
</style>
