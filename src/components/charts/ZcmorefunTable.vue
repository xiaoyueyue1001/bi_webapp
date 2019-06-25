<template>
  <div
    class="zcmorefunTable"
    :style="chartContainerStyle"
  >
    <div
      v-if="option"
      :style="{paddingTop: filtersInChart.length > 0 ? '30px' : '0px', width:'100%', height: '100%'}"
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
                @click="goIn(field, item, index)"
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
        <Button
          class="page-operation"
          type="ghost"
          @click="toPrevPage"
          :disabled="currentPage===1"
        >
          <Icon
            type="md-arrow-dropup"
            size=20
          />
        </Button>
        <Button
          class="page-operation"
          type="ghost"
          @click="toNextPage"
          :disabled="currentPage===pageCount"
        >
          <Icon
            type="md-arrow-dropdown"
            size=20
          />
        </Button>
      </div>

      <GoIn
        :goIn="option ? option.goIn : null"
        :goInFieldInfo="goInFieldInfo"
        :goInFieldInfoArr="goInFieldInfoArr"
        @setGoInField="setGoInField"
        @chartItemClicked="chartItemClicked"
      ></GoIn>
      <FiltersInChart
        :filtersInChart="filtersInChart"
        @filterCompsDataValueChanged="filterCompsDataValueChanged"
      ></FiltersInChart>
    </div>
  </div>
</template>

<script>
import { getTextByValue } from "../../utils/commonTool.js";
import { timeFormats } from "../../constants.js";
import FiltersInChart from "./FiltersInChart";
import GoIn from "./GoIn";
export default {
  name: "ZcmorefunTable",
  components: {
    GoIn,
    FiltersInChart
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
    sAxisNumberFields: {
      type: Array,
      default: () => {
        return [];
      }
    }
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
    goInFieldsLength() {
      if (!this.option || !this.option.goIn || !this.option.goIn.fields) {
        return 0;
      }
      const goInFieldsLength = this.option.goIn.fields.length;
      return goInFieldsLength;
    },
    goInFieldInfo() {
      return this.$store.getters["selfAnalysis/getGoInFieldInfo"];
    },
    goInFieldInfoArr() {
      return this.$store.getters["selfAnalysis/getGoInFieldInfoArr"];
    },
    computedData() {
      if (
        [
          ...(this.dimensionFields || []),
          ...(this.numberFields || []),
          ...(this.sAxisNumberFields || [])
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
        for (let field of this.dimensionFields) {
          newItem[field.name] = "总计";
        }
        const numberFields = [...this.numberFields];
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
      return this.option.rowHeight && this.option.rowHeight.custom
        ? (this.option.rowHeight.num * 9) / 10 + this.option.rowHeight.unit
        : "9%";
    },
    fields() {
      const fields = [...this.dimensionFields, ...this.numberFields];
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
      return this.option.pageSize && this.option.pageSize.custom ? this.option.pageSize.num : 10;
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
      getTextByValue: getTextByValue,
      timeFormats: timeFormats,
      show: false,
      currentPage: 1
    };
  },
  methods: {
    setGoInField(goInFieldInfo, goInFieldInfoArr) {
      this.$store.commit("selfAnalysis/setGoInFieldInfo", goInFieldInfo);
      this.$store.commit("selfAnalysis/setGoInFieldInfoArr", goInFieldInfoArr);
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
    goIn(field, item, index) {
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
      that.$emit(
        "chartItemClicked",
        index,
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
    filterCompsDataValueChanged(filterCompsData) {
      this.$emit("filterCompsDataValueChanged", filterCompsData);
    },
    getText(field, pageDataItem, pageDataIndex) {
      return this.option.showRowTotal &&
        (this.currentPage - 1) * 10 + pageDataIndex + 1 ===
          this.computedData.length &&
        this.isDimensionFields(field.type) &&
        field.name !== this.dimensionFields[0].name
        ? ""
        : this.isDimensionFields(field.type)
        ? pageDataItem[field.name]
        : pageDataItem[field.name] || pageDataItem[field.name] === 0
        ? Number(pageDataItem[field.name]).toLocaleString()
        : "";
    },
    isDimensionFields(fieldType) {
      return ["text", "time"].includes(fieldType);
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
          return this.getMaxValue(this.option.data, markPoint.field);
        case "min":
          return this.getMinValue(this.option.data, markPoint.field);
        case "average":
          return this.getAvgValue(this.option.data, markPoint.field);
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
      this.$root.Bus.$emit("chartItemClicked", null, null, rawFieldInfo, null);
    },
    goToField(index) {
      this.goInFieldInfoArr.splice(index + 1);
      const rawFieldInfo = _.cloneDeep(this.goInFieldInfo);
      this.goInFieldInfo = this.goInFieldInfoArr[index];
      this.$root.Bus.$emit(
        "chartItemClicked",
        null,
        null,
        rawFieldInfo,
        this.goInFieldInfo
      );
    }
  },
  watch: {
    option() {
      this.currentPage = 1;
    }
  }
};
</script>

<style scoped>
.fieldValue {
  display: inline-block;
  border-radius: 3px;
}
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
  width: 40px;
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
.zcmorefunTable {
  height: 100%;
  font-size: 14px;
  border-radius: 6px;
  position: relative;
  padding: 10px;
}
.zcmorefunTable > div {
  padding: 10px;
  border-radius: 6px;
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
