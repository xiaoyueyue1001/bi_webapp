<template>
  <div
    v-if="filterCompsData && filterCompsData.length > 0"
    class="filtersInChart"
  >
    <Icon
      size=16
      custom="dubhe-iconfont dubhe-icon-filter"
      style="margin-top: 8px;"
    ></Icon>

    <div class="filterCompsWrapper">
      <div class="filterComps">
        <template v-for="filterComp in filterCompsData">
          <MultiSelect
            v-if="filterComp.fieldDetail.type === 'time' || filterComp.fieldDetail.type === 'text'"
            :fieldName="filterComp.fieldDetail.alias"
            style="width:160px;margin-left: 10px;"
            :placeholder="'请选择' + filterComp.fieldDetail.alias"
            v-model="filterComp.value"
            :allItems="filterComp.options"
            filterable
            multiple
            @on-change="filterCompsDataValueChanged"
          >
            <Option
              v-for="item in filterComp.options"
              :value="item.value"
              :key="item.value"
            >{{ item.label && item.label.trim() !== "" ? item.label : "&nbsp;" }}</Option>
          </MultiSelect>
          <NumberRangeSelect
            v-else
            :fieldName="filterComp.fieldDetail.alias"
            style="width:160px;margin-left: 10px;"
            v-model="filterComp.value"
            @on-change="filterCompsDataValueChanged"
            class="numberFilter"
          ></NumberRangeSelect>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    filtersInChart: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      filterCompsData: []
    };
  },
  methods: {
    filterCompsDataValueChanged() {
      this.$emit("filterCompsDataValueChanged", this.filterCompsData);
    }
  },
  created() {
    this.filterCompsData = this.filtersInChart;
  },
  watch: {
    filtersInChart: {
      handler(val, oldVal) {
        this.filterCompsData = val;
      },
      deep: true
    }
  }
};
</script>

<style scoped>
.filterCompsWrapper {
  overflow-x: hidden;
  overflow-y: hidden;
  width: calc(100% - 20px);
  /* position: relative; */
}
.filterCompsWrapper:hover {
  overflow-x: overlay;
  overflow-y: hidden;
}
.filterComps {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
}
.filtersInChart {
  position: absolute;
  top: 0px;
  left: 20px;
  display: flex;
  justify-content: flex-start;
  width: calc(100% - 40px);
  clear: both;
}
</style>


<style>
.filtersInChart .ivu-input {
  padding: 4px;
}
.filtersInChart .ivu-select-selection {
  border-width: 0px 0px 1px 0px !important;
  border-radius: 0px;
}
.filtersInChart .ivu-select-dropdown .ivu-select-selection {
  border-width: 1px !important;
  border-radius: 6px;
}
.filtersInChart .ivu-select-multiple .ivu-select-item {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 25px;
}
.filtersInChart .numberFilter .ivu-select-dropdown {
  overflow: visible;
}
.filtersInChart .numberFilter .ivu-select-dropdown .ivu-select-dropdown {
  overflow: auto;
  background-color: var(--popup-content-bg-color-in-modal);
  border-radius: 6px;
}
</style>

