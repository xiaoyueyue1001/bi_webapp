<template>
  <div
    class="zcmorefunTable"
    :style="chartContainerStyle"
  >
    <!-- <div class="zcmorefunTable"> -->
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

    <!-- <Spin
      v-if="dataLoading"
      style="z-index: 100;"
      loaddingStyle="table"
    ></Spin> -->

    <div
      class="table"
      v-if="option"
      :style="{
        width:'100%',
        height: filterCompsData.length > 0 ? 'calc(100% - 40px)' : '100%'
      }"
    >
      <div
        v-if="option.title.show"
        class="table-title"
      >{{option.title.text}}</div>
      <div
        class="subtitle"
        v-if="option.title.show && option.title.subtext && option.title.subtext !== ''"
      >{{option.title.subtext}}</div>
      <div :style="{height: option.title.show ? (option.title.subtext && option.title.subtext !== '' ? 'calc(89% - 20px)' : 'calc(94% - 20px)') : 'calc(100% - 20px)'}">
        <div
          class="header"
          :style="{height: headerHeight}"
        >
          <div
            class="cell rowNumber"
            v-if="option.showRowNumber"
          >序号</div>
          <div
            class="cell ellipsisText"
            :style="{width: cellWidth}"
            v-for="field in fields"
            :title='field.alias + (field.type === "time" ? (getTextByValue(timeFormats,field.format) ? "(" + getTextByValue(timeFormats,field.format) + ")": "") : "")'
          >{{field.alias + (field.type === "time" ? (getTextByValue(timeFormats,field.format) ? "(" + getTextByValue(timeFormats,field.format) + ")": "") : "")}}</div>
        </div>
        <div
          class="body"
          :style="{height: 'calc(100% - ' + headerHeight + ')'}"
        >
          <div
            class="row"
            :style="{height: option.rowHeight.custom ? option.rowHeight.num + option.rowHeight.unit : '10%'}"
            v-for="(item, index) in pageData"
            @click="rowClicked(item, index)"
          >
            <div
              class="cell rowNumber"
              v-if="option.showRowNumber"
            >{{(currentPage-1)*pageSize + index + 1}}</div>
            <div
              class="cell ellipsisText"
              v-for="field in fields"
              :style="{width: cellWidth}"
            >
              <a
                v-if="isCanGoInField(field)"
                :title="getText(field, item, index)"
                @click="goIn(field, item, index, $event)"
                class="fieldValue"
                :style="getMarkStyle(field.name, item[field.name])"
              >{{getText(field, item, index)}}</a>
              <span
                v-else
                :title="getText(field, item, index)"
                class="fieldValue"
                :style="getMarkStyle(field.name, item[field.name])"
              >{{getText(field, item, index)}}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="computedData.length > pageSize"
        class="pagination"
      >
        <input
          class="ivu-input"
          :value="currentPage"
          @blur="currentPageChanged"
          @keyup.enter="currentPageChanged"
        ></input>
        <div style="margin-right: 6px;">{{'/' + pageCount}}</div>
        <!-- <Button
          class="page-operation"
          type="ghost"
          @click="toPrevPage"
          :disabled="currentPage===1"
        >
          <Icon
            type="md-arrow-dropup"
            size=20
          />
        </Button> -->
        <i class="bi-iconfont bi-icon-arrow-solid-up" style="fontSize:20px" 
          @click="toPrevPage"
          v-if="currentPage!==1"></i>
        <!-- <Button
          class="page-operation"
          type="ghost"
          @click="toNextPage"
          :disabled="currentPage===pageCount"
        >
          <Icon
            type="md-arrow-dropdown"
            size=20
          />
        </Button> -->
        <i class="bi-iconfont bi-icon-arrow-solid-down" style="fontSize:20px" @click="toNextPage"
          v-if="currentPage!==pageCount"></i>
      </div>
    </div>
  </div>
</template>

<script>
import FiltersInChart from "./FiltersInChart";
import GoIn from "./GoIn";
import _ from "lodash";
import { getTextByValue } from "../../utils/commonTool.js";
import { timeFormats, BASE, colorThemes } from "../../constants.js";
const GETDATA = `${BASE}selfAnalysis/getData`;
import axios from "../../utils/axios.js";
export default {
  components: {
    FiltersInChart,
    GoIn
  },
  name: "ZcmorefunTable",
  props: {
    chartId: {
      type: String,
      default: null
    },
    colorThemeName: {
      type: String,
      default: "blue"
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
    sAxisNumberFields: {
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
  computed: {
    chartContainerStyle() {
      const chartContainerStyle = {
        paddingTop: this.isChartFullscreen ? "30px" : "0px"
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
    getDataOptionInChart() {
      const getDataOption = this.useGoInGetDataOption
        ? this.goInGetDataOption
        : this.getDataOption;
      return getDataOption;
    },
    computedData() {
      if (
        [
          ...(this.getDataOptionInChart.dimensionFields || []),
          ...(this.getDataOptionInChart.numberFields || []),
          ...(this.getDataOptionInChart.sAxisNumberFields || [])
        ].length === 0
      ) {
        return [];
      }
      const computedData = _.cloneDeep(this.option.data);
      if (this.option.showColumnTotal) {
        for (let item of computedData) {
          item.columnTotal = this.getColumnTotal(item);
        }
      }
      if (this.option.showRowTotal) {
        const newItem = {};
        for (let field of this.getDataOptionInChart.dimensionFields) {
          newItem[field.name] = "总计";
        }
        const numberFields = [...this.getDataOptionInChart.numberFields];
        if (this.option.showColumnTotal) {
          numberFields.push({
            name: "columnTotal",
            alias: "总计"
          });
        }
        const getFieldTotal = fieldName => {
          let fieldTotal = 0;
          for (let item of computedData) {
            fieldTotal += Number(item[fieldName]);
          }
          return fieldTotal;
        };
        for (let field of numberFields) {
          newItem[field.name] = getFieldTotal(field.name);
        }
        computedData.push(newItem);
      }
      return computedData;
    },

    headerHeight() {
      return this.option.rowHeight.custom
        ? (this.option.rowHeight.num * 9) / 10 + this.option.rowHeight.unit
        : "9%";
    },
    fields() {
      const fields = [
        ...this.getDataOptionInChart.dimensionFields,
        ...this.getDataOptionInChart.numberFields
      ];
      if (this.option.showColumnTotal) {
        fields.push({
          name: "columnTotal",
          alias: "总计"
        });
      }
      return fields;
    },
    cellWidth() {
      const rowNumberWidth = this.option.showRowNumber ? 60 : 0;
      const fieldLength = this.fields.length;
      return this.option.showRowNumber
        ? "calc(" +
            (100 / fieldLength).toFixed(2) +
            "%" +
            " - " +
            (60 / fieldLength).toFixed(0) +
            "px"
        : (100 / fieldLength).toFixed(2) + "%";
    },
    pageSize() {
      return this.option.pageSize.custom ? this.option.pageSize.num : 10;
    },
    pageCount() {
      return Math.ceil(this.computedData.length / this.pageSize);
    },
    pageData() {
      return this.computedData.slice(
        this.pageSize * (this.currentPage - 1),
        this.pageSize * this.currentPage
      );
    }
  },
  data() {
    return {
      filterSubsAndFilterCompMapper: {},
      getTextByValue: getTextByValue,
      getOptionFuncInChart: null,
      getOption: null,
      dataLoading: false,
      option: null,
      filterCompsData: [],
      timeFormats: timeFormats,
      myChart: null,
      resizeListener: null,
      goInFieldInfo: null,
      goInFieldInfoArr: [],
      data: [],

      show: false,
      currentPage: 1,
      useGoInGetDataOption: false,
      goInGetDataOption: null
    };
  },
  methods: {
    rowClicked(item, index) {
      if (this.linkagePubs && this.linkagePubs.length > 0) {
        for (let pub of this.linkagePubs) {
          const pubFieldValue = item[pub.field];
          this.$root.Bus.$emit(
            "chartItemClicked-" + pub.id,
            pub.descField,
            pubFieldValue
          );
        }
      }
      if (this.jumpSetting) {
        switch (this.jumpSetting.targetType) {
          case "dashboard":
            switch (this.jumpSetting.position) {
              case "currentPage":
                this.$router.push({
                  path: "dashboard",
                  query: { targetDashboardCode: this.jumpSetting.dashboardCode }
                });
                break;
              case "newWindow":
                window.open(
                  "http://" +
                    window.location.host +
                    "/#/dashboard?hideHeader=true&targetDashboardCode=" +
                    this.jumpSetting.dashboardCode,
                  "_blank"
                );
                break;
              case "dialog":
                this.$root.Bus.$emit(
                  "openDashboardInModal",
                  this.jumpSetting.dashboardCode
                );
                break;
              default:
                break;
            }
            break;
          case "chart":
            const fieldParams = this.jumpSetting.fieldMappers
              .map(mapper => {
                return (
                  "&" + mapper.destFieldName + "=" + item[mapper.srcFieldName]
                );
              })
              .join("");
            switch (this.jumpSetting.position) {
              case "currentChart":
                break;
              case "newWindow":
                window.open(
                  "http://" +
                    window.location.host +
                    "/#/singleChart?chartId=" +
                    this.jumpSetting.chartId +
                    fieldParams,
                  "_blank"
                );
                break;
              case "dialog":
                this.$root.Bus.$emit("openChartInModal", {
                  chartId: this.jumpSetting.chartId,
                  fieldParams
                });
                break;
              default:
                break;
            }
          case "link":
            const url = this.jumpSetting.url.replace(
              /\@\{(.+)\}/g,
              (matchStr, groupStr) => {
                return item[groupStr];
              }
            );
            switch (this.jumpSetting.position) {
              case "newWindow":
                window.open(url, "_blank");
                break;
              case "dialog":
                this.$root.Bus.$emit("openWebModal", {
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
    },
    setGoInField(goInFieldInfo, goInFieldInfoArr) {
      this.goInFieldInfo = goInFieldInfo;
      this.goInFieldInfoArr = goInFieldInfoArr;
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
    isCanGoInField(field) {
      if (!this.option.goIn) {
        return false;
      }
      if (this.option.goIn.fromField.name === field.name) {
        return true;
      }
      if (!this.option.goIn.fields) {
        return false;
      }
      return this.option.goIn.fields.some((item, index) => {
        return item.name === field.name && index !== this.goInFieldsLength - 1;
      });
    },
    goIn(field, item, index, event) {
      event.stopPropagation();
      const that = this;
      const rawFieldInfo = _.cloneDeep(that.goInFieldInfo);
      const dimensionFieldValue = item[field.name];
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
        index,
        dimensionFieldValue,
        rawFieldInfo,
        goInFieldInfo
      );
    },
    getText(field, pageDataItem, pageDataIndex) {
      return this.option.showRowTotal &&
        (this.currentPage - 1) * 10 + pageDataIndex + 1 ===
          this.computedData.length &&
        this.isDimensionFields(field.type) &&
        field.name !== this.getDataOptionInChart.dimensionFields[0].name
        ? ""
        : this.isDimensionFields(field.type)
        ? pageDataItem[field.name]
        : Number(pageDataItem[field.name] || 0).toLocaleString();
    },
    isDimensionFields(fieldType) {
      return ["text", "time"].includes(fieldType);
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
      return new Promise(resolve => {
        this.getData(this.getDataOption).then(data => {
          this.data = data;
          const filteredData = this.getFilteredData();
          this.filteredData = filteredData;
          this.freshOption();
          resolve();
        });
      });
    },
    freshOption() {
      this.option = this.getOption(
        this.filteredData,
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
      this.currentPage = 1;
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
    reset() {
      if (this.useGoInGetDataOption) {
        this.backToFromField();
      }
      if (this.filtersInChart && this.filtersInChart.length > 0) {
        this.resetFilterCompsData();
      }
      this.filterSubsAndFilterCompMapper = {};
      this.freshChart();
    },
    init() {
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
      this.$root.Bus.$on("reset", this.reset);
      this.$root.Bus.$on("freshChart-" + this.chartId, this.freshChart);
    }
  },
  created() {
    this.getOptionFuncInChart = this.getOptionFunc;
    this.freshGetOption(this.getOptionFuncInChart);
  },
  activated() {
    this.init();
  },
  deactivated() {
    this.removeSubs();
    this.removeFilterSubs();
    this.$root.Bus.$off("reset", this.reset);
    this.$root.Bus.$off("freshChart-" + this.chartId, this.freshChart);
  },
  // beforeDestroy() {
  //   this.removeSubs();
  //   this.removeFilterSubs();
  //   this.$root.Bus.$off("reset", this.reset);
  // },
  watch: {
    chartId: {
      handler(val, oldVal) {
        if (oldVal) {
          this.$root.Bus.$off("freshChart-" + this.chartId, this.freshChart);
        }
        if (val) {
          this.$root.Bus.$on("freshChart-" + this.chartId, this.freshChart);
        }
      }
    },
    // filtersInChart: {
    //   handler(val, oldVal) {
    //     this.resetFilterCompsData();
    //   },
    //   deep: true
    // },
    // getOptionFunc() {
    //   this.getOptionFuncInChart = this.getOptionFunc;
    //   this.freshGetOption(this.getOptionFuncInChart);
    // },
    // getDataOption: {
    //   handler(val, oldVal) {
    //     this.getDataOptionChanged();
    //   },
    //   deep: true
    // },
    colorThemeName() {
      this.freshOption();
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
    }
  }
};
</script>

<style scoped>
.rowNumber {
  width: 60px;
  text-align: center;
}
.pagination {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  right: 20px;
  bottom: 0px;
  position: absolute;
}
.pagination input {
  width: 30px;
  height: 20px;
  padding-right: 7px;
}
.page-operation {
  height: 9%;
  width: 27px;
  border: none;
  margin: 0px;
  padding: 0px;
}
.zcmorefunTable .table-title {
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
.zcmorefunTable {
  height: 100%;
  font-size: 14px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  position: relative;
  display: flex;
  flex-direction: column;
}
.zcmorefunTable > .table {
  padding: 10px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  flex: 1;
  max-height: 100%;
}
.zcmorefunTable > .filtersInChart {
  height: 40px;
  background-color: transparent;
  position: relative;
}
.header {
  display: flex;
  width: 100%;
  align-items: center;
  font-weight: bold;
}
.body {
  overflow: hidden;
}
.body:hover {
  overflow: overlay;
}
.body .row {
  cursor: pointer;
  display: flex;
  width: 100%;
  align-items: center;
}
.body .row:hover {
  background: var(--table-hover-bg-color);
}
.header .cell:first-child,
.row .cell:first-child {
  padding-left: 10px;
}
</style>

<style>
.zcmorefunTable .ivu-input {
  padding: 4px;
  color: var(--default-font-color);
  border: 1px solid var(--default-border-color);
  border-radius: 0.06rem;
}
.zcmorefunTable .ivu-select-selection {
  border-width: 0px 0px 1px 0px !important;
  border-radius: 0px;
}
.zcmorefunTable .ivu-select-dropdown .ivu-select-selection {
  border-width: 1px !important;
  border-radius: 6px;
}
</style>
