<template>
  <Breadcrumb
    v-if="goIn && fieldInfoArr.length > 0"
    style="position:absolute;bottom:0px;left:10px;"
    :separator="'>'"
  >
    <BreadcrumbItem><a @click="backToFromField()">{{goIn.fromField.alias + (goIn.fromField.type === "time" ? (getTextByValue(timeFormats, goIn.fromField.format) ? "(" + getTextByValue(timeFormats, goIn.fromField.format) + ")": "") : "")}}</a></BreadcrumbItem>
    <BreadcrumbItem v-for="(fieldInfo, index) in fieldInfoArr">
      <a
        v-if="index < fieldInfoArr.length - 1"
        @click="goToField(index)"
      >
        {{fieldInfo.filters[fieldInfo.filters.length - 1].conditions[0].value}}</a>
      <span v-else>{{fieldInfo.filters[fieldInfo.filters.length - 1].conditions[0].value}}</span></BreadcrumbItem>
  </Breadcrumb>
</template>

<script>
import { timeFormats } from "../../constants.js";
import { getTextByValue } from "../../utils/commonTool.js";
export default {
  props: {
    goIn: {
      type: Object,
      default: null
    },
    goInFieldInfo: {
      type: Object,
      default: null
    },
    goInFieldInfoArr: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      timeFormats: timeFormats,
      getTextByValue: getTextByValue,
      fieldInfo: null,
      fieldInfoArr: []
    };
  },
  methods: {
    backToFromField() {
      const rawFieldInfo = _.cloneDeep(this.fieldInfo);
      this.fieldInfo = null;
      this.fieldInfoArr = [];
      this.$emit("setGoInField", this.fieldInfo, this.fieldInfoArr);
      this.$emit("chartItemClicked", null, null, rawFieldInfo, null);
    },
    goToField(index) {
      this.fieldInfoArr.splice(index + 1);
      const rawFieldInfo = _.cloneDeep(this.fieldInfo);
      this.fieldInfo = this.fieldInfoArr[index];
      this.$emit("setGoInField", this.fieldInfo, this.fieldInfoArr);
      this.$emit("chartItemClicked", null, null, rawFieldInfo, this.fieldInfo);
    }
  },
  created() {
    this.fieldInfo = this.goInFieldInfo;
    this.fieldInfoArr = this.goInFieldInfoArr;
  },
  watch: {
    goInFieldInfo: {
      handler(val, oldVal) {
        this.fieldInfo = val;
      },
      deep: true
    },
    goInFieldInfoArr: {
      handler(val, oldVal) {
        this.fieldInfoArr = val;
      },
      deep: true
    }
  }
};
</script>

<style scoped>
</style>
