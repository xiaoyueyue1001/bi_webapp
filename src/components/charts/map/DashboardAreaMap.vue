<template>
  <div
    class="point-map"
    @mousedown.stop="scaleMousedown"
    ref="analysisAreaMap"
    :style="chartContainerStyle"
  >
    <ZcmorefunMap
      class="zcmorefun-map"
      :isFullscreen="isFullscreen"
      :isChartFullscreen="isChartFullscreen"
      :height="height"
      :width="width"
      :option="processedOption"
      :clickCallback="clickCallback"
      :georoamCallback="georoamCallback"
      :datazoomCallback="datazoomCallback"
      :dataLoading="dataLoading"
    ></ZcmorefunMap>
    <div
      v-if="processedOption && processedOption.data && processedOption.data.length > 0 && processedOption.showScale && showScale"
      class="scale-wrapper"
    >
      <div
        class="scale"
        ref="scale"
        v-if="!processedOption.notShowScale"
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
            class="gray-color-bar scale-gray-bar-left"
            :style="{width: littleSliderNum + 'px' }"
          ></div>
          <div
            class="gray-color-bar scale-gray-bar-right"
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
    <!-- <div
      class="rangking-list"
      v-if="processedOption.showRankingList && showRankList"
    >
      <div class="ranking-list-title">{{processedOption.rankingTitle}}</div>
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
          <div class="rangking-item-value">{{item.value.toLocaleString()}}</div>
        </div>
      </div>
    </div> -->
    <GoIn
      :goIn="processedOption ? processedOption.goIn : null"
      :goInFieldInfo="goInFieldInfo"
      :goInFieldInfoArr="goInFieldInfoArr"
      @setGoInField="setGoInField"
      @chartItemClicked="chartItemClicked"
    ></GoIn>
    <FiltersInChart
      :filtersInChart="filterCompsData"
      @filterCompsDataValueChanged="filterCompsDataValueChanged"
    ></FiltersInChart>
  </div>
</template>

<script>
import ZcmorefunMap from "./DashboardMap";
import GoIn from "../GoIn";
import FiltersInChart from "../FiltersInChart";
import _ from "lodash";
import { BASE, colorThemes } from "../../../constants.js";
const GETDATA = `${BASE}selfAnalysis/getData`;
import axios from "../../../utils/axios.js";
let self = null;
export default {
  name: "ZcmorefunAnalysisAreaMap",
  components: {
    GoIn,
    ZcmorefunMap,
    FiltersInChart
  },
  props: {
    chartId: {
      type: String,
      default: null,
    },
    colorThemeName: {
      type: String,
      default: "blue"
    },
    background: {
      type: String,
      default: "rgba(255,255,255,0)"
    },
    panelId: String,
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

    chartResult: Array,
    analysisCharts: Array,
    linkagePubs: Array,
    linkageSubs: Array,
    filterSubs: Array,
    activeColorTheme: Object,
    getDataOption: Object,
    getOptionFunc: String,
    filtersInChart: {
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
    width: {
      type: Number,
      default: 431
    },
    height: {
      type: Number,
      default: 380
    },
    jumpSetting: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      min: -Infinity,
      max: Infinity,
      filterSubsAndFilterCompMapper: {},
      changedItems: [],
      clickCallback: null,
      georoamCallback: null,
      datazoomCallback: null,
      getOptionFuncInChart: null,
      getOption: null,
      dataLoading: false,
      option: null,
      filterCompsData: [],
      myChart: null,
      resizeListener: null,
      goInFieldInfo: null,
      goInFieldInfoArr: [],
      data: [],

      resizeListener: null,
      processedOption: {},
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
      sliderIndexRight: 5,
      littleSliderNum: 0,
      biggerSliderNum: 560,
      littleSliderIndex: 0,
      bigSliderIndex: 5,
      colorBarWidth: 560,
      colors: [[0, 186, 1], [247, 221, 5], [212, 63, 57]],
      filteredData: null,
      useGoInGetDataOption: false,
      goInGetDataOption: null
    };
  },
  computed: {
    chartContainerStyle() {
      const chartContainerStyle = {
        width: "100%",
        height: "100%",
        position: "relative",
        top: this.isFullscreen ? "30px" : 0
      };
      return chartContainerStyle;
    },
    colorThemeColors() {
      if (!this.colorThemeName) {
        return colorThemes[0].colors;
      }
      const theme = colorThemes.find(item => {
        return item.name === this.colorThemeName;
      });
      return theme.colors;
    },
    splitNumber() {
      return this.option && this.option.splitNumber
        ? this.option.splitNumber
        : 5;
    },
    showRankList() {
      return this.width >= 600 && this.height >= 320;
    },
    showScale() {
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
      if (!this.option) {
        return maxValue;
      }
      for (let item of this.option.data) {
        if (item.value > maxValue) {
          maxValue = item.value;
        }
      }
      maxValue = Math.ceil(maxValue / this.splitNumber);
      const numLen = String(maxValue).length;
      const denominator = Math.pow(10, numLen - 2);
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
      const data = JSON.parse(JSON.stringify(this.option.data));
      data.sort((a, b) => {
        return b.value - a.value;
      });
      const top10 = data.slice(0, 10);
      return top10;
    }
  },
  methods: {
    setProcesssedOption(option) {
      const processedOption = _.cloneDeep(option || this.option);
      processedOption.tooltip.formatter = (params, ticket, callback) => {
        if (!params.name || params.name === "" || params.data === undefined) {
          return "";
        }
        const color = "rgb(" + self.getColor(params.value).join(",") + ")";
        return (
          '<span style="background-color:' +
          color +
          ';width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>' +
          params.name +
          ": " +
          params.value.toLocaleString()
        );
      };
      if (
        !processedOption.visualMap.max &&
        processedOption.visualMap.max !== 0
      ) {
        processedOption.visualMap.max = this.maxValue;
      }
      if (
        !processedOption.visualMap.splitNumber &&
        processedOption.visualMap.splitNumber !== 0
      ) {
        processedOption.visualMap.splitNumber = 5;
      }

      for (let changedItem of this.changedItems) {
        const { keys, value } = changedItem;
        if (value === undefined || value === null) {
          this.deleteKey(processedOption, keys);
        } else {
          this.changeValue(processedOption, keys, value);
        }
      }
      this.processedOption = processedOption;
    },
    getMarkpointData() {
      if (isNaN(this.option.markpointDataIndex)) {
        return [];
      }
      return [this.option.data[this.option.markpointDataIndex]];
    },
    deleteKey(obj, keys) {
      const keysLength = keys.length;
      for (let index = 0; index < keysLength; index++) {
        const key = keys[index];
        if (key !== "i" && index < keysLength - 1) {
          obj = obj[key];
        }
        if (key !== "i" && index === keysLength - 1) {
          const keyToIndex = Number(key);
          if (!isNaN(keyToIndex)) {
            obj.splice(keyToIndex, 1);
          } else {
            delete obj[key];
          }
        }
        if (key === "i") {
          obj.forEach(item => {
            this.deleteKey(item, keys.slice(index + 1, keysLength));
          });
        }
      }
    },
    changeValue(obj, keys, value) {
      const keysLength = keys.length;
      for (let index = 0; index < keysLength; index++) {
        const key = keys[index];
        if (key !== "i" && index < keysLength - 1) {
          if (!obj[key]) {
            obj[key] = {};
          }
          obj = obj[key];
        }
        if (key !== "i" && index === keysLength - 1) {
          obj[key] = value;
        }
        if (key === "i") {
          obj.every(item => {
            this.changeValue(item, keys.slice(index + 1, keysLength), value);
          });
        }
      }
    },
    downClicked() {
      this.$emit("resetInterval");
      this.downSelected = !this.downSelected;
      this.filteredData = this.getFilteredData();
      this.filterOptionData();
    },
    upClicked() {
      this.$emit("resetInterval");
      this.upSelected = !this.upSelected;
      this.filteredData = this.getFilteredData();
      this.filterOptionData();
    },
    filterOptionData() {
      const dimensionField = this.getDataOption.dimensionFields[0];
      const numberField = this.getDataOption.numberFields[0];
      const filteredOptionData =
        !dimensionField || !numberField
          ? []
          : this.filteredData.map(item => {
              return {
                name: item[dimensionField.name]
                  .replace(/省|(自治区)$/, "")
                  .replace(/(回族)|(壮族)|(维吾尔)|(藏族)$/, "")
                  .replace("重庆市", "重庆").replace("北京市", "北京").replace("天津市", "天津").replace("上海市", "上海"),
                value: Number(item[numberField.name]) || 0,
                rawName: item[dimensionField.name]
              };
            });
      this.processedOption.series[0].data = filteredOptionData;
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
      this.min = this.scaleNums[this.littleSliderIndex];
      this.max = this.scaleNums[this.bigSliderIndex];
      this.filteredData = this.getFilteredData();
      this.filterOptionData();
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
    scaleMousemove() {},

    setGoInField(goInFieldInfo, goInFieldInfoArr) {
      this.goInFieldInfo = goInFieldInfo;
      this.goInFieldInfoArr = goInFieldInfoArr;
    },
    freshGetOption(getOptionFunc) {
      if (!getOptionFunc) {
        return null;
      }
      this.getOption = new Function(`return ` + getOptionFunc)();
    },
    getFieldByName(fields, fieldName) {
      let index = 0;
      for (let field of fields) {
        if (fieldName === field.name) {
          return {
            index: index,
            field: field
          };
        }
        index++;
      }
    },
    chartItemClicked(
      dataIndex,
      dimensionFieldValue,
      rawFieldInfo,
      goInFieldInfo
    ) {
      const getDataOption = _.cloneDeep(this.getDataOption);
      const fieldInfo = this.getFieldByName(
        getDataOption.dimensionFields,
        this.option.goIn.fromField.name
      );

      let getDataCallback = null;

      const isBackHome = dataIndex === null && goInFieldInfo === null;

      if (!isBackHome) {
        const goInFieldIndex = goInFieldInfo.index;
        goInFieldInfo.field.groupBy = true;
        if (fieldInfo.field.name !== goInFieldInfo.field.name) {
          getDataOption.dimensionFields.splice(
            fieldInfo.index,
            1,
            goInFieldInfo.field
          );
        }
        if (getDataOption.filters) {
          getDataOption.filters = [
            ...getDataOption.filters,
            ...goInFieldInfo.filters
          ];
        } else {
          getDataOption.filters = goInFieldInfo.filters;
        }
      }
      const that = this;
      this.getData(getDataOption).then(data => {
        that.data = data;
        const toReplaceFieldInfo = rawFieldInfo || fieldInfo;
        if (that.filtersInChart && that.filtersInChart.length > 0) {
          if (!that.filterCompsData || that.filterCompsData.length === 0) {
            return;
          }
          const rawIndex = that.filterCompsData.findIndex(filterComp => {
            return filterComp.field === toReplaceFieldInfo.field.name;
          });
          if (rawIndex === -1) return;
          const toReplaceFilterComp = _.cloneDeep(
            that.filterCompsData[rawIndex]
          );
          that.fieldNameToFilterCompMap[
            toReplaceFilterComp.field
          ] = toReplaceFilterComp;

          const replaceWithFieldInfo = goInFieldInfo || fieldInfo;
          let replaceWithFilterComp =
            that.fieldNameToFilterCompMap[replaceWithFieldInfo.field.name];
          if (!replaceWithFilterComp) {
            const rawFieldOptions = that.getFieldOptions(
              replaceWithFieldInfo.field.name,
              data
            );
            const options = [
              { value: "all", label: "全部" },
              ...rawFieldOptions.map(item => {
                return {
                  value: item,
                  label: item
                };
              })
            ];
            replaceWithFilterComp = {
              field: replaceWithFieldInfo.field.name,
              fieldDetail: replaceWithFieldInfo.field,
              options: options,
              value: ["all", ...rawFieldOptions]
            };
          }
          that.filterCompsData.splice(rawIndex, 1, replaceWithFilterComp);
        }

        if (isBackHome) {
          let reg = new RegExp(toReplaceFieldInfo.field.name + "Arr", "g"); //创建正则RegExp对象
          let getOptionFuncInChart = that.getOptionFuncInChart.replace(
            reg,
            fieldInfo.field.name + "Arr"
          );
          reg = new RegExp("item." + toReplaceFieldInfo.field.name, "g");
          getOptionFuncInChart = getOptionFuncInChart.replace(
            reg,
            "item." + fieldInfo.field.name
          );
          that.getOptionFuncInChart = getOptionFuncInChart;

          this.changedItems = [
            {
              keys: ["series", 0, "map"],
              value: "中国"
            }
          ];
          that.goInGetDataOption = null;
          that.useGoInGetDataOption = false;
        } else {
          that.goInGetDataOption = getDataOption;
          that.useGoInGetDataOption = true;
          let reg = new RegExp(toReplaceFieldInfo.field.name + "Arr", "g"); //创建正则RegExp对象

          let getOptionFuncInChart = that.getOptionFuncInChart.replace(
            reg,
            goInFieldInfo.field.name + "Arr"
          );
          reg = new RegExp("item." + toReplaceFieldInfo.field.name, "g");
          getOptionFuncInChart = getOptionFuncInChart.replace(
            reg,
            "item." + goInFieldInfo.field.name
          );
          that.getOptionFuncInChart = getOptionFuncInChart;

          this.changedItems = [
            {
              keys: ["series", 0, "map"],
              value: goInFieldInfo.filters[0].conditions[0].value
            }
          ];
        }
        that.freshGetOption(that.getOptionFuncInChart);
        const filteredData = this.getFilteredData(this.filterCompsData);
        this.filteredData = filteredData;
        this.filterOptionData();
        that.freshOption();
      });
    },
    isConditionSatisfied(item, filterComp) {
      let satisfied = false;
      const itemFieldValue = item[filterComp.field];
      if (["time", "text"].includes(filterComp.fieldDetail.type)) {
        if (filterComp.value.includes(itemFieldValue)) {
          satisfied = true;
          return satisfied;
        }
      } else {
        let parsedItemFieldValue = Number(itemFieldValue);
        const filterCompValue = Number(filterComp.value.value);
        switch (filterComp.value.condition) {
          case "all":
            satisfied = true;
            return satisfied;
          case "equal":
            satisfied = parsedItemFieldValue === filterCompValue;
            break;
          case "notEqual":
            satisfied = parsedItemFieldValue !== filterCompValue;
            break;
          case "greater":
            satisfied = parsedItemFieldValue > filterCompValue;
            break;
          case "less":
            satisfied = parsedItemFieldValue < filterCompValue;
            break;
          case "greaterOrEqual":
            satisfied = parsedItemFieldValue >= filterCompValue;
            break;
          case "lessOrEqual":
            satisfied = parsedItemFieldValue <= filterCompValue;
            break;
          case "between":
            satisfied =
              parsedItemFieldValue > Number(filterComp.value.minValue) &&
              parsedItemFieldValue < Number(filterComp.value.maxValue);
            break;
          case "notNull":
            satisfied = !this.isNull(itemFieldValue);
            break;
          case "isNull":
            satisfied = this.isNull(itemFieldValue);
            break;
          default:
            break;
        }
      }
      return satisfied;
    },
    isNull(arg) {
      return !arg && arg !== 0 && typeof arg !== "boolean" ? true : false;
    },
    getFilteredData(customFilterCompsData) {
      const filteredData = [];

      const min = this.min;
      const max = this.max;
      const valueFieldName = this.getDataOption.numberFields[0].name;

      const filterCompsData = customFilterCompsData || [
        ...this.filterCompsData,
        ...Object.values(this.filterSubsAndFilterCompMapper)
      ];

      for (let item of this.data) {
        const itemValue = item[valueFieldName];
        if (
          filterCompsData.every(filterComp => {
            return this.isConditionSatisfied(item, filterComp);
          }) &&
          itemValue >= min &&
          itemValue < max
        ) {
          filteredData.push(item);
        }
      }
      return filteredData;
    },
    resetFilterCompsData(filtersInChart) {
      this.fieldNameToFilterCompMap = {};
      const filterCompsData = [];
      for (let filter of filtersInChart || this.filtersInChart) {
        const rawFieldOptions = this.getFieldOptions(filter.fieldDetail.name);
        const options = [
          { value: "all", label: "全部" },
          ...rawFieldOptions.map(item => {
            return {
              value: item,
              label: item
            };
          })
        ];
        const filterCompData = {
          ...filter
        };
        if (["time", "text"].includes(filter.fieldDetail.type)) {
          filterCompData.options = options;
          filterCompData.value = ["all", ...rawFieldOptions];
        } else {
          filterCompData.value = { condition: "all" };
        }

        filterCompsData.push(filterCompData);
      }
      this.filterCompsData = filterCompsData;
    },
    uniq(array) {
      var temp = []; //一个新的临时数组
      for (var i = 0; i < array.length; i++) {
        if (temp.indexOf(array[i]) == -1) {
          temp.push(array[i]);
        }
      }
      return temp;
    },
    getFieldOptions(fieldName, data) {
      const fieldArr = [];
      for (let item of data || this.data) {
        fieldArr.push(item[fieldName]);
      }
      return this.uniq(fieldArr);
    },
    filterCompsDataValueChanged(filterCompsData, isDashboardFilter) {
      if (!this.getOption) return;
      if (!isDashboardFilter) {
        this.freshFilterCompsDataOptions(filterCompsData);
        this.filterCompsData = filterCompsData;
      }
      const filteredData = this.getFilteredData(filterCompsData);
      this.filteredData = filteredData;
      this.filterOptionData();
    },
    freshFilterCompsDataOptions(filterCompsData) {
      for (let filterComp of filterCompsData) {
        if (!filterComp.fieldDetail.type) continue;
        const rawFieldOptions = this.getFieldOptions(
          filterComp.fieldDetail.name
        );
        const options = [
          { value: "all", label: "全部" },
          ...rawFieldOptions.map(item => {
            return {
              value: item,
              label: item
            };
          })
        ];
        filterComp.options = options;
      }
    },
    getTextByValue(arr, value) {
      for (let item of arr) {
        if (item.value === value) {
          return item.label;
        }
      }
      return null;
    },
    backToFromField() {
      const rawFieldInfo = _.cloneDeep(this.goInFieldInfo);
      this.goInFieldInfo = null;
      this.goInFieldInfoArr = [];
      this.chartItemClicked(null, null, rawFieldInfo, null);
    },
    goToField(index) {
      this.goInFieldInfoArr.splice(index + 1);
      const rawFieldInfo = _.cloneDeep(this.goInFieldInfo);
      this.goInFieldInfo = this.goInFieldInfoArr[index];
      this.chartItemClicked(null, null, rawFieldInfo, this.goInFieldInfo);
    },
    scaleMousedown() {},
    scaleMousemove() {},
    resizeDiv(that) {
      const containerComputedStyle = window.getComputedStyle(
        that.$refs.chartContainer
      );
      that.$refs.myChart.style.width = containerComputedStyle.width;
      that.$refs.myChart.style.height = containerComputedStyle.height;
    },
    getComputedValue(markPoint) {
      switch (markPoint.type) {
        case "max":
          return this.getMaxValue(
            this.option.series[markPoint.seriesIndex].data
          );
        case "min":
          return this.getMinValue(
            this.option.series[markPoint.seriesIndex].data
          );
        case "average":
          return this.getAvgValue(
            this.option.series[markPoint.seriesIndex].data
          );
        case "default":
          return null;
      }
    },
    getAvgValue(data) {
      let avg = 0,
        totalVal = 0;
      for (let item of data) {
        totalVal += item;
      }
      avg = totalVal / data.length;
      return Number(avg.toFixed(0));
    },
    getMinValue(data) {
      let min = Infinity;
      for (let item of data) {
        if (item < min) {
          min = item;
        }
      }
      return min;
    },
    getMaxValue(data) {
      let max = -Infinity;
      for (let item of data) {
        if (item > max) {
          max = item;
        }
      }
      return max;
    },
    getSignByText(text) {
      switch (text) {
        case "equal":
          return "===";
        case "greater":
          return ">";
        case "greaterOrEqual":
          return ">=";
        case "less":
          return "<";
        case "lessOrEqual":
          return "<=";
        default:
          return null;
      }
    },
    transformMarkPoint(markPoint) {
      let transformedArr = [];
      let index = 0;
      if (
        !this.option.series[markPoint.seriesIndex] ||
        !this.option.series[markPoint.seriesIndex].data
      ) {
        return transformedArr;
      }
      if (markPoint.comparisonOp === "between") {
        for (let itemValue of this.option.series[markPoint.seriesIndex].data) {
          if (
            itemValue > markPoint.smallerValue &&
            itemValue < markPoint.greaterValue
          ) {
            transformedArr.push({
              value: itemValue,
              xAxis: this.option.xAxis.data[index],
              yAxis: itemValue,
              itemStyle: {
                color: markPoint.bgColor
              },
              label: {
                color: markPoint.fontColor
              }
            });
          }
          index++;
        }
      } else {
        let value = null;
        if (markPoint.valueType === "computedValue") {
          value = this.getComputedValue(markPoint);
        } else {
          value = markPoint.value;
        }

        index = 0;
        const data = this.option.series[markPoint.seriesIndex].data;
        for (let itemValue1 of data) {
          if (
            eval(
              "itemValue1 " +
                this.getSignByText(markPoint.comparisonOp) +
                " value"
            )
          ) {
            transformedArr.push({
              value: itemValue1,
              xAxis: this.option.xAxis.data[index],
              yAxis: itemValue1,
              itemStyle: {
                color: markPoint.bgColor
              },
              label: {
                color: markPoint.fontColor
              }
            });
          }
          index++;
        }
      }
      return transformedArr;
    },
    transformMarkPoints(option) {
      const transformedMarkPoints = {};
      for (let markPoint of option.markPoints) {
        let markPointDatas = this.transformMarkPoint(markPoint);
        if (!transformedMarkPoints[markPoint.seriesIndex]) {
          transformedMarkPoints[markPoint.seriesIndex] = {
            symbolSize: [70, 40],
            data: markPointDatas,
            label: {
              show: true,
              fontSize: 12,
              color: "#fff",
              fontWeight: "lighter",
              formatter: params => {
                return params.value.toLocaleString();
              }
            }
          };
        } else {
          transformedMarkPoints[markPoint.seriesIndex].data = [
            ...(transformedMarkPoints[markPoint.seriesIndex].data || []),
            ...markPointDatas
          ];
        }
      }
      Object.keys(transformedMarkPoints).forEach(key => {
        option.series[key].markPoint = transformedMarkPoints[key];
      });
      delete option.markPoints;
    },
    getDataOptionChanged() {
      this.freshChart();
    },
    freshChart() {
      return new Promise(resolve => {
        this.getData(this.getDataOption).then(data => {
          this.data = data;
          const filteredData = this.getFilteredData(this.filterCompsData);
          this.filteredData = filteredData;
          this.freshOption();
          resolve();
        });
      });
    },
    freshOption() {
      const getDataOption = this.useGoInGetDataOption
        ? this.goInGetDataOption
        : this.getDataOption;
      this.option = this.getOption(
        this.filteredData,
        this.colorThemeName,
        this.colorThemeColors,
        this.$echarts,
        getDataOption.dimensionFields,
        getDataOption.numberFields
      );
    },
    getData(params) {
      return new Promise((resolve, reject) => {
        this.dataLoading = true;
        axios
          .post(GETDATA, params)
          .then(res => {
            const data = res.data.rows;
            this.dataLoading = false;
            resolve(data);
          })
          .catch(() => {
            this.dataLoading = false;
            reject();
          });
      });
    },
    chartItemClickedSubFunc(fieldName, value) {
      const getDataOption = _.cloneDeep(this.getDataOption);
      getDataOption.filters.push({
        field: fieldName,
        conditions: [
          {
            condition: "equal",
            value: value,
            logicalOp: "AND"
          }
        ],
        logicalOp: "AND"
      });
      this.getData(getDataOption).then(data => {
        this.data = data;
        const filteredData = this.getFilteredData(this.filterCompsData);
        this.filteredData = filteredData;
        this.filterOptionData();
        // this.freshOption();
      });
    },
    filterCompChangedCallback(filterComp, fieldName) {
      const transformedFilterComp = _.cloneDeep(filterComp);
      transformedFilterComp.field = fieldName;
      transformedFilterComp.fieldDetail.name = fieldName;
      this.filterSubsAndFilterCompMapper[fieldName] = transformedFilterComp;
      this.filterCompsDataValueChanged(
        Object.values(this.filterSubsAndFilterCompMapper),
        true
      );
    },
    removeFilterSubs() {
      if (this.filterSubs) {
        for (let filterSub of this.filterSubs) {
          this.$root.Bus.$off(
            "filterCompChanged-" + this.panelId + "-" + filterSub,
            this.filterCompChangedCallback
          );
        }
      }
    },
    addFilterSubs() {
      if (this.filterSubs) {
        for (let filterSub of this.filterSubs) {
          const filterSubName =
            "filterCompChanged-" + this.panelId + "-" + filterSub;
          this.$root.Bus.$on(filterSubName, this.filterCompChangedCallback);
        }
      }
    },
    removeSubs(linkageSubs) {
      const subs = linkageSubs || this.linkageSubs;
      if (subs) {
        for (let sub of subs) {
          this.$root.Bus.$off(
            "chartItemClicked-" + sub.id,
            this.chartItemClickedSubFunc
          );
        }
      }
    },
    addSubs() {
      if (this.linkageSubs) {
        for (let sub of this.linkageSubs) {
          this.$root.Bus.$on(
            "chartItemClicked-" + sub.id,
            this.chartItemClickedSubFunc
          );
        }
      }
    },
    freshClickCallback() {
      if (
        this.option &&
        (this.option.clickCallback || (this.linkagePubs && this.linkagePubs.length > 0)) || 
        (this.jumpSetting && this.jumpSetting.targetType)
      ) {
        const that = this;
        const val = this.option;
        this.clickCallback = function(params) {
          const item = that.filteredData[params.dataIndex];
          if (!item) {
            return;
          }
          if (that.linkagePubs && that.linkagePubs.length > 0) {
            for (let pub of that.linkagePubs) {
              const pubFieldValue = item[pub.field];
              that.$root.Bus.$emit(
                "chartItemClicked-" + pub.id,
                pub.descField,
                pubFieldValue
              );
            }
          }

          if (that.jumpSetting) {
            switch (that.jumpSetting.targetType) {
              case "dashboard":
                switch (that.jumpSetting.position) {
                  case "currentPage":
                    that.$router.push({
                      path: "dashboard",
                      query: {
                        targetDashboardCode: that.jumpSetting.dashboardCode
                      }
                    });
                    break;
                  case "newWindow":
                    window.open(
                      "http://" +
                        window.location.host +
                        "/#/dashboard?hideHeader=true&targetDashboardCode=" +
                        that.jumpSetting.dashboardCode,
                      "_blank"
                    );
                    break;
                  case "dialog":
                    that.$root.Bus.$emit(
                      "openDashboardInModal",
                      that.jumpSetting.dashboardCode
                    );
                    break;
                  default:
                    break;
                }
                break;
              case "chart":
                const fieldParams = that.jumpSetting.fieldMappers
                  .map(mapper => {
                    return (
                      "&" +
                      mapper.destFieldName +
                      "=" +
                      item[mapper.srcFieldName]
                    );
                  })
                  .join("");
                switch (that.jumpSetting.position) {
                  case "currentChart":
                    break;
                  case "newWindow":
                    window.open(
                      "http://" +
                        window.location.host +
                        "/#/singleChart?chartId=" +
                        that.jumpSetting.chartId +
                        fieldParams,
                      "_blank"
                    );
                    break;
                  case "dialog":
                    that.$root.Bus.$emit("openChartInModal", {
                      chartId: that.jumpSetting.chartId,
                      fieldParams
                    });
                    break;
                  default:
                    break;
                }
              case "link":
                const url = that.jumpSetting.url.replace(
                  /\@\{(.+)\}/g,
                  (matchStr, groupStr) => {
                    return item[groupStr];
                  }
                );
                switch (that.jumpSetting.position) {
                  case "newWindow":
                    window.open(url, "_blank");
                    break;
                  case "dialog":
                    that.$root.Bus.$emit("openWebModal", {
                      url: url
                    });
                    break;
                  default:
                    break;
                }
                break;
              default:
                break;
            }
          }

          if (!val.clickCallback) return;
          const rawFieldInfo = _.cloneDeep(that.goInFieldInfo);
          const dimensionFieldValue = [
            "pie",
            "scatter",
            "analysisAreaMap"
          ].includes(val.chartType)
            ? params.name
            : that.option[val.chartType === "horizontalBar" ? "yAxis" : "xAxis"]
                .data[params.dataIndex];
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

            that.goInFieldInfo = {
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

              that.goInFieldInfo = {
                index: newGoInFieldIndex,
                field: that.option.goIn.fields[newGoInFieldIndex],
                filters: [...rawFieldInfo.filters, filter]
              };
            }
          }
          that.goInFieldInfoArr.push(that.goInFieldInfo);
          that.chartItemClicked(
            params.dataIndex,
            dimensionFieldValue,
            rawFieldInfo,
            that.goInFieldInfo
          );
        };
      }
    },
    reset() {
      if (this.useGoInGetDataOption) {
        this.backToFromField();
      }
      if (this.filtersInChart && this.filtersInChart.length > 0) {
        this.resetFilterCompsData();
      }
      this.filterSubsAndFilterCompMapper = {};
      this.resetSlide();
      this.freshChart();
    },
    resetSlide() {
      this.sliderNumLeft = 0;
      this.sliderNumRight = 560;
      this.sliderIndexLeft = 0;
      this.sliderIndexRight = 5;
      this.littleSliderNum = 0;
      this.biggerSliderNum = 560;
      this.littleSliderIndex = 0;
      this.bigSliderIndex = 5;
      this.min = -Infinity;
      this.max = Infinity;
    }
  },
  watch: {
    chartId: {
      handler(val, oldVal) {
        if(oldVal) {
          this.$root.Bus.$off("freshChart-" + this.chartId, this.freshChart);
        }
        if(val) {
          this.$root.Bus.$on("freshChart-" + this.chartId, this.freshChart);
        }
      }
    },
    colorThemeName() {
      this.freshOption();
    },
    linkagePubs() {
      this.freshClickCallback();
    },
    linkageSubs: {
      handler(val, oldVal) {
        this.removeSubs(oldVal);
        this.addSubs();
      },
      deep: true
    },
    filterSubs: {
      handler(val, oldVal) {
        this.removeFilterSubs();
        this.addFilterSubs();
      },
      deep: true
    },
    filtersInChart: {
      handler(val, oldVal) {
        this.resetFilterCompsData();
      },
      deep: true
    },
    getDataOption: {
      handler(val, oldVal) {
        this.getDataOptionChanged();
      },
      deep: true
    },
    option: {
      handler(val, oldVal) {
        // this.resetSlide();
        this.freshClickCallback();
        this.setProcesssedOption(val);
      },
      deep: true
    },
    width() {
      this.setProcesssedOption();
    },
    height() {
      this.setProcesssedOption();
    }
  },
  created() {
    this.getOptionFuncInChart = this.getOptionFunc;
    this.freshGetOption(this.getOptionFuncInChart);
  },
  activated() {
    self = this;
    if (this.chartResult && this.chartResult.length > 0) {
      this.data = this.chartResult;
      const filteredData = this.getFilteredData(this.filterCompsData);
      this.filteredData = filteredData;
      this.freshOption();
      if (this.filtersInChart && this.filtersInChart.length > 0) {
        this.resetFilterCompsData();
      }
    } else {
      this.freshChart().then(() => {
        if (this.filtersInChart && this.filtersInChart.length > 0) {
          this.resetFilterCompsData();
        }
      });
    }
    this.addSubs();
    this.addFilterSubs();
    const that = this;
    document.addEventListener("mouseup", this.sliderMoveEnd);
    document.addEventListener("mousemove", that.sliderMove, true);
    document.addEventListener("touchmove", that.sliderMove, true);
    document.addEventListener("touchend", this.sliderMoveEnd);
    window.addEventListener("resize", this.resizeListener);
    this.setProcesssedOption();
    this.$root.Bus.$on("reset", this.reset);
    this.$root.Bus.$on("freshChart-" + this.chartId, this.freshChart);
  },
  deactivated() {
    self = null;
    document.removeEventListener("mouseup", this.sliderMoveEnd);
    document.removeEventListener("mousemove", this.sliderMove);
    document.removeEventListener("touchmove", this.sliderMove);
    document.removeEventListener("touchend", this.sliderMoveEnd);
    window.removeEventListener("resize", this.resizeListener);
    this.removeSubs();
    this.removeFilterSubs();
    this.$root.Bus.$off("reset", this.reset);
    this.$root.Bus.$off("freshChart-" + this.chartId, this.freshChart);
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
  bottom: 100px;
  left: 20px;
}
.icon-slider {
  cursor: pointer;
  font-size: 12px;
  margin-left: -16px;
  margin-right: -16px;
  position: absolute;
  bottom: -15px;
  padding: 5px 10px 0px 10px;
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
.gray-color-bar.scale-gray-bar-left {
  left: 0px;
}
.gray-color-bar.scale-gray-bar-right {
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
