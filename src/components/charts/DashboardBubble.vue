<template>
  <div class="zcmorefunBubble" :style="chartContainerStyle">
    <div
      v-if="option"
      :style="{paddingTop: filterCompsData.length > 0 ? '30px' : '0px', width:'100%', height: '100%'}"
    >
      <!-- <Spin
        v-if="dataLoading"
        style="z-index: 100;"
        loaddingStyle="table"
      ></Spin>-->
      <div v-if="option.title.show" class="bubble-title">{{option.title.text}}</div>
      <div
        class="subtitle"
        v-if="option.title.show && option.title.subtext && option.title.subtext !== ''"
      >{{option.title.subtext}}</div>
      <div
        :style="{height: option.title.show ? (option.title.subtext && option.title.subtext !== '' ? 'calc(89% - 20px)' : 'calc(94% - 20px)') : 'calc(100% - 20px)'}"
      >
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
          :filtersInChart="filterCompsData"
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
import FiltersInChart from "./FiltersInChart";
import GoIn from "./GoIn";
import * as d3 from "d3";
import uuid from "../../utils/uuid.js";
import axios from "../../utils/axios.js";
import { getTextByValue } from "../../utils/commonTool.js";
import { timeFormats, BASE, colorThemes } from "../../constants.js";
const GETDATA = `${BASE}selfAnalysis/getData`;
let current = null;
export default {
  components: {
    FiltersInChart,
    GoIn
  },
  name: "ZcmorefunBubble",
  props: {
    chartId: {
      type: String,
      default: null
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
    isChartFullscreen: {
      type: Boolean,
      default: false
    },
    isFullscreen: {
      type: Boolean,
      default: false
    },
    filtersInChart: {
      type: Array,
      default: () => {
        return [];
      }
    },
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
      filterSubsAndFilterCompMapper: {},
      getTextByValue: getTextByValue,
      timeFormats: timeFormats,
      getOptionFuncInChart: null,
      getOption: null,
      dataLoading: false,
      option: null,
      filterCompsData: [],
      resizeListener: null,
      goInFieldInfo: null,
      goInFieldInfoArr: [],
      data: [],

      filterCompsData: [],
      id: null,
      svgWidth: this.width,
      svgHeight: this.height,
      enterTimeout: null,
      enterLastTime: null,
      useGoInGetDataOption: false,
      goInGetDataOption: null
    };
  },
  computed: {
    chartContainerStyle() {
      return {};
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
    getDataOptionInChart() {
      const getDataOption = this.useGoInGetDataOption
        ? this.goInGetDataOption
        : this.getDataOption;
      return getDataOption;
    },
    name() {
      if (
        !this.getDataOptionInChart ||
        !this.getDataOptionInChart.dimensionFields ||
        this.getDataOptionInChart.dimensionFields.length === 0
      ) {
        return null;
      }
      return this.getDataOptionInChart.dimensionFields[0].name;
    },
    value() {
      if (
        !this.getDataOptionInChart ||
        !this.getDataOptionInChart.numberFields ||
        this.getDataOptionInChart.numberFields.length === 0
      ) {
        return null;
      }
      return this.getDataOptionInChart.numberFields[0].name;
    },
    total() {
      if (!this.value || !this.option) {
        return 0;
      }
      let total = 0;
      for (let item of this.option.data) {
        total += Number(item[this.value]) || 0;
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
        return (Number(b[this.value]) || 0) - (Number(a[this.value]) || 0);
      });
      for (let item of data) {
        item.percent = Math.round(
          (Number(item[this.value]) / this.total) * 100
        );
        item.index = index;
        index++;
      }
      return data;
    }
  },
  methods: {
    setGoInField(goInFieldInfo, goInFieldInfoArr) {
      this.goInFieldInfo = goInFieldInfo;
      this.goInFieldInfoArr = goInFieldInfoArr;
    },
    goIn(data) {
      const that = this;
      const rawFieldInfo = _.cloneDeep(that.goInFieldInfo);
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
      that.chartItemClicked(
        0,
        dimensionFieldValue,
        rawFieldInfo,
        goInFieldInfo
      );
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
      this.currentPage = 1;
      const getDataOption = _.cloneDeep(this.getDataOption);
      const fieldInfo = this.getFieldByName(
        getDataOption.dimensionFields,
        this.option.goIn.fromField.name
      );

      let getDataCallback = null;

      const isBackHome = dataIndex === null && goInFieldInfo === null;

      if (!isBackHome) {
        const goInFieldIndex = goInFieldInfo.index;
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
        }
        that.freshGetOption(that.getOptionFuncInChart);
        const filteredData = this.getFilteredData();
        this.filteredData = filteredData;
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

      const filterCompsData = customFilterCompsData || [
        ...this.filterCompsData,
        ...Object.values(this.filterSubsAndFilterCompMapper)
      ];

      for (let item of this.data) {
        if (
          filterCompsData.every(filterComp => {
            return this.isConditionSatisfied(item, filterComp);
          })
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
        this.freshFilterCompsDataOptions(filterCompsData, filteredData);
        this.filterCompsData = filterCompsData;
      }
      const filteredData = this.getFilteredData();
      this.filteredData = filteredData;
      const option = this.getOption(
        filteredData,
        this.colorThemeName,
        this.colorThemeColors,
        this.$echarts,
        this.getDataOptionInChart.dimensionFields,
        this.getDataOptionInChart.numberFields
      );
      this.option = option;
    },
    freshFilterCompsDataOptions(filterCompsData, filteredData) {
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

    getMarkStyle(fieldName, itemValue) {
      if (!this.option.markPoints) return {};
      const markPointsInField = this.option.markPoints.filter(markPoint => {
        const isSameField = markPoint.field === fieldName;
        if (!isSameField) return false;

        if (markPoint.comparisonOp === "between") {
          return (
            itemValue > markPoint.smallerValue &&
            itemValue < markPoint.greaterValue
          );
        } else {
          let value = null;
          if (markPoint.valueType === "computedValue") {
            value = this.getComputedValue(markPoint);
          } else {
            value = markPoint.value;
          }
          return eval(
            "Number(itemValue) " +
              this.getSignByText(markPoint.comparisonOp) +
              " value"
          );
        }

        return markPoint.field === fieldName;
      });
      if (!markPointsInField || markPointsInField.length === 0) return {};
      const lastMarkPointInField =
        markPointsInField[markPointsInField.length - 1];
      return {
        background: lastMarkPointInField.bgColor,
        color: lastMarkPointInField.fontColor
      };
    },
    getComputedValue(markPoint) {
      switch (markPoint.type) {
        case "max":
          return this.getMaxValue(this.data, markPoint.field);
        case "min":
          return this.getMinValue(this.data, markPoint.field);
        case "average":
          return this.getAvgValue(this.data, markPoint.field);
        case "default":
          return null;
      }
    },
    getAvgValue(data, fieldName) {
      let avg = 0,
        totalVal = 0;
      for (let item of data) {
        totalVal += Number(item[fieldName]);
      }
      avg = totalVal / data.length;
      return Number(avg.toFixed(0));
    },
    getMinValue(data, fieldName) {
      let min = Infinity;
      for (let item of data) {
        const itemFieldValue = Number(item[fieldName]);
        if (itemFieldValue < min) {
          min = itemFieldValue;
        }
      }
      return min;
    },
    getMaxValue(data, fieldName) {
      let max = -Infinity;
      for (let item of data) {
        const itemFieldValue = Number(item[fieldName]);
        if (itemFieldValue > max) {
          max = itemFieldValue;
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
    getColumnTotal(item) {
      let columnTotal = 0;
      for (let field of this.numberFields) {
        columnTotal += item[field.name];
      }
      return columnTotal;
    },
    currentPageChanged(e) {
      const num = Number(e.target.value);
      if (this.currentPage !== num) {
        this.show = false;
      }
      if (isNaN(num) || num <= 0) {
        this.currentPage = 1;
        e.target.value = 1;
        setTimeout(() => {
          this.show = true;
        }, 100);
        return;
      }
      if (num >= this.pageCount) {
        this.currentPage = this.pageCount;
        e.target.value = this.pageCount;
        setTimeout(() => {
          this.show = true;
        }, 100);
        return;
      }
      this.currentPage = num;
      setTimeout(() => {
        this.show = true;
      }, 100);
    },
    toPrevPage() {
      this.show = false;
      this.currentPage -= 1;
      setTimeout(() => {
        this.show = true;
      }, 100);
    },
    toNextPage() {
      this.show = false;
      this.currentPage += 1;
      setTimeout(() => {
        this.show = true;
      }, 100);
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
    getDataOptionChanged() {
      this.freshChart();
    },
    freshChart() {
      const that = this;
      return new Promise(resolve => {
        that.getData(that.getDataOption).then(data => {
          that.data = data;
          const filteredData = this.getFilteredData();
          this.filteredData = filteredData;
          that.freshOption();
          resolve();
        });
      });
    },
    freshOption() {
      this.option = this.getOption(
        this.data,
        this.colorThemeName,
        this.colorThemeColors,
        this.$echarts,
        this.getDataOptionInChart.dimensionFields,
        this.getDataOptionInChart.numberFields
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
      const getDataOption = _.cloneDeep(this.getDataOptionInChart);
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
        const filteredData = this.getFilteredData();
        this.filteredData = filteredData;
        this.freshOption();
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
            this.enterTimeout,
            this.enterLastTime
          )
        )

        .on("click", function(d) {
          if (that.linkagePubs && that.linkagePubs.length > 0) {
            for (let pub of that.linkagePubs) {
              const pubFieldValue = d.data[pub.field];
              that.$root.Bus.$emit(
                "chartItemClicked-" + pub.id,
                pub.descField,
                pubFieldValue
              );
            }
          }

          const item = d.data;

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
      if (!that.$refs.chartContainer) {
        return;
      }
      const containerComputedStyle = window.getComputedStyle(
        that.$refs.chartContainer
      );
      that.svgWidth = parseInt(containerComputedStyle.width);
      that.svgHeight = parseInt(containerComputedStyle.height);
    },
    reset() {
      if (this.useGoInGetDataOption) {
        this.backToFromField();
      }
      if (this.filtersInChart && this.filtersInChart.length > 0) {
        this.resetFilterCompsData();
      }
      this.freshChart();
    }
  },
  created() {
    current = this;
    this.id = "svg" + uuid();
    this.filterCompsData = this.filtersInChart;
    this.getOptionFuncInChart = this.getOptionFunc;
    this.freshGetOption(this.getOptionFuncInChart);
  },
  mounted() {
    const that = this;
    that.resizeListener = () => {
      that.initCircle(that.computedData);
    };
    window.addEventListener("resize", that.resizeListener);
    // this.initCircle(this.computedData);

    if (this.chartResult && this.chartResult.length > 0) {
      this.data = this.chartResult;
      const filteredData = this.getFilteredData();
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
    setTimeout(() => {
      that.initCircle(that.computedData);
    }, 500);
    this.$root.Bus.$on("reset", this.reset);
    this.$root.Bus.$on("freshChart-" + this.chartId, this.freshChart);
  },
  watch: {
    chartId: {
      handler(val, oldVal) {
        if (oldVal) {
          this.$root.Bus.$off("freshChart-" + oldVal, this.freshChart);
        }
        if (val) {
          this.$root.Bus.$on("freshChart-" + val, this.freshChart);
        }
      }
    },
    colorThemeName() {
      this.freshOption();
    },
    linkagePubs() {
      // this.freshClickCallback();
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
    option: {
      handler(val, oldVal) {
        const that = this;
        setTimeout(() => {
          that.initCircle(that.computedData);
        }, 200);
      },
      deep: true
    },
    filtersInChart: {
      handler(val, oldVal) {
        this.resetFilterCompsData();
      },
      deep: true
    },
    isChartFullscreen() {
      this.initCircle(this.computedData);
    },
    isFullscreen() {
      this.initCircle(this.computedData);
    },
    width() {
      this.svgWidth = this.width || 0;
      this.initCircle(this.computedData);
    },
    height() {
      this.svgHeight = this.height || 0;
      this.initCircle(this.computedData);
    }
  },
  beforeDestroy() {
    current = null;
    window.removeEventListener("resize", this.resizeListener);
    this.removeSubs();
    this.removeFilterSubs();
    this.$root.Bus.$off("reset", this.reset);
    this.$root.Bus.$off("freshChart-" + this.panelId, this.freshChart);
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
.zcmorefunBubble .ivu-input {
  padding: 4px;
}
.zcmorefunBubble .ivu-select-selection {
  border-width: 0px 0px 1px 0px !important;
  border-radius: 0px;
}
.zcmorefunBubble .ivu-select-dropdown .ivu-select-selection {
  border-width: 1px !important;
  border-radius: 6px;
}
</style>

<style scoped>
.zcmorefunBubble {
  position: relative;
  padding: 10px;
}
.bubble-title {
  height: 5%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  font-family: sans-serif;
  padding-top: 10px;
  padding-bottom: 10px;
  color: var(--default-font-color);
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
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}
.zcmorefunBubble > div {
  width: 100%;
  height: 100%;
  position: relative;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}
.zcmorefunBubble > div > div {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}
.chartContainer {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  position: relative;
  width: 100%;
  height: 100%;
}
</style>

