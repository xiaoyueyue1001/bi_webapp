<template>
  <div
    class="dashboardChart chartContainer"
    id="chartContainer"
    ref="chartContainer"
    :style="chartContainerStyle"
  >
    <!-- <Spin v-if="dataLoading" style="z-index: 100;" loaddingStyle="table"></Spin> -->
    <div class="myChart" ref="myChart"></div>

    <GoIn
      :goIn="option ? option.goIn : null"
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
import GoIn from "./GoIn";
import FiltersInChart from "./FiltersInChart";
import _ from "lodash";
import { BASE, colorThemes } from "../../constants.js";
const GETDATA = `${BASE}selfAnalysis/getData`;
import axios from "../../utils/axios.js";
export default {
  components: {
    GoIn,
    FiltersInChart
  },
  data() {
    return {
      filterSubsAndFilterCompMapper: {},
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
      useGoInGetDataOption: false,
      goInGetDataOption: null,
      filteredData: []
    };
  },
  props: {
    chartId: {
      type: String,
      default: null
    },
    defaultFontColor: {
      type: String,
      default: ""
    },
    grayFontColor: {
      type: String,
      default: ""
    },
    showTitle: {
      type: Boolean,
      default: false
    },
    colorThemeName: {
      type: String,
      default: "blue"
    },
    panelId: String,
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
    clickCallback: [Function, Object],
    georoamCallback: [Function, Object],
    datazoomCallback: [Function, Object],
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
    },
    fieldParams: {
      type: Array,
      default: () => {
        return null;
      }
    }
  },
  computed: {
    chartContainerStyle() {
      const chartContainerStyle = {
        "border-top-left-radius": this.showTitle ? "0px" : "6px",
        "border-top-right-radius": this.showTitle ? "0px" : "6px"
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
    }
  },
  methods: {
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
        this.getDataOption.dimensionFields,
        this.getDataOption.numberFields
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
      if (!that.$refs.chartContainer) return;
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
      const getDataOption = _.cloneDeep(this.getDataOption);
      if (this.fieldParams) {
        const filters = this.fieldParams.map(fieldParam => {
          return {
            field: fieldParam.fieldName,
            conditions: [
              {
                condition: "equal",
                value: fieldParam.fieldValue,
                logicalOp: "AND"
              }
            ],
            logicalOp: "AND"
          };
        });
        getDataOption.filters.push(...filters);
      }
      return new Promise(resolve => {
        this.getData(getDataOption).then(data => {
          this.data = data;
          const filteredData = this.getFilteredData();
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
          .sharePost(GETDATA, params)
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
        const filteredData = this.getFilteredData();
        this.filteredData = filteredData;
        this.freshOption();
      });
    },
    getDataByFieldParams(fieldParams) {
      const getDataOption = _.cloneDeep(this.getDataOption);
      const filters = fieldParams.map(fieldParam => {
        return {
          field: fieldParam.fieldName,
          conditions: [
            {
              condition: "equal",
              value: fieldParam.fieldValue,
              logicalOp: "AND"
            }
          ],
          logicalOp: "AND"
        };
      });
      getDataOption.filters.push(...filters);
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
    freshClickCallback() {
      if (!this.myChart) return;
      this.myChart.off("click");
      if (
        (this.option &&
          (this.option.clickCallback ||
            (this.linkagePubs && this.linkagePubs.length > 0))) ||
        (this.jumpSetting && this.jumpSetting.targetType)
      ) {
        const that = this;
        this.myChart.on("click", params => {
          const item = that.filteredData[params.dataIndex];
          if (!item) {
            return;
          }
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

          if (!this.option.clickCallback) return;
          const rawFieldInfo = _.cloneDeep(that.goInFieldInfo);

          let dimensionFieldValue = null;
          if (that.option.chartType === "analysisAreaMap") {
            dimensionFieldValue = params.data.rawName;
          } else if (
            ["pie", "scatter", "funnel"].includes(that.option.chartType)
          ) {
            dimensionFieldValue = params.name;
          } else {
            dimensionFieldValue =
              that.option[
                that.option.chartType === "horizontalBar" ? "yAxis" : "xAxis"
              ].data[params.dataIndex];
          }

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
          this.chartItemClicked(
            params.dataIndex,
            dimensionFieldValue,
            rawFieldInfo,
            that.goInFieldInfo
          );
        });
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
    setOption(option) {
      const newOption = _.cloneDeep(option);
      this.myChart.setOption(newOption);
    },
    init() {
      this.getOptionFuncInChart = this.getOptionFunc;
      this.freshGetOption(this.getOptionFuncInChart);
      this.resizeDiv(this);
      if (!this.myChart) {
        this.myChart = this.$echarts.init(this.$refs.myChart);
        const that = this;
        // this.$once('hook:beforeDestroy', () => {
        //   that.myChart.dispose();
        // })
      }
      const that = this;
      that.resizeListener = () => {
        that.resizeDiv(that);
        that.myChart.resize();
      };
      this.freshClickCallback();
      if (this.georoamCallback) {
        this.myChart.on("georoam", this.georoamCallback);
      }
      if (this.datazoomCallback) {
        this.myChart.on("datazoom", this.datazoomCallback);
      }
      window.addEventListener("resize", that.resizeListener);
      if (
        this.chartResult &&
        this.chartResult.length > 0 &&
        !this.fieldParams
      ) {
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
      // this.$root.Bus.$on("reset", this.reset);
      // this.$root.Bus.$on("freshChart-" + this.chartId, this.freshChart);
    }
  },
  // created() {
  //   this.getOptionFuncInChart = this.getOptionFunc;
  //   this.freshGetOption(this.getOptionFuncInChart);
  // },
  activated() {
    this.init();
  },
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
    getOptionFunc() {
      this.getOptionFuncInChart = this.getOptionFunc;
      this.freshGetOption(this.getOptionFuncInChart);
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
        if (!val) {
          this.setOption({});
        }
        if (this.myChart) {
          this.myChart.clear();
          if (val.markPoints) {
            this.transformMarkPoints(val);
          }
          this.setOption(val);
          this.myChart.off("georoam");
          this.myChart.off("datazoom");
          this.freshClickCallback();
          if (this.georoamCallback) {
            this.myChart.on("georoam", this.georoamCallback);
          }
          if (this.datazoomCallback) {
            this.myChart.on("datazoom", this.datazoomCallback);
          }
        }
      },
      deep: true
    },
    isChartFullscreen() {
      this.resizeDiv(this);
      this.myChart.resize();
    },
    isFullscreen() {
      this.resizeDiv(this);
      this.myChart.resize();
    },
    width() {
      this.resizeDiv(this);
      this.myChart.resize();
    },
    height() {
      this.resizeDiv(this);
      this.myChart.resize();
    }
  },
  deactivated() {
    console.log("DashboardChart deactivated");
    if (this.myChart) {
      this.myChart.off("click");
      this.myChart.off("georoam");
      this.myChart.off("datazoom");
      this.myChart.clear();
      this.myChart.dispose();
      this.myChart = null;
    }
    window.removeEventListener("resize", this.resizeListener);
    this.removeSubs();
    this.removeFilterSubs();
    this.$root.Bus.$off("reset", this.reset);
    this.$root.Bus.$off("freshChart-" + this.chartId, this.freshChart);
  }
};
</script>

<style scoped>
.chartContainer {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  position: relative;
  width: 100%;
  height: 100%;
}
.myChart {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>

<style>
.dashboardChart.chartContainer .myChart > div {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}
.chartContainer .ivu-select-selection {
  border-width: 0px 0px 1px 0px !important;
  border-radius: 0px;
}
.chartContainer .ivu-select-dropdown .ivu-select-selection {
  border-width: 1px !important;
  border-radius: 6px;
}
</style>

