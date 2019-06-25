<template>
  <div
    v-if="filterCompsData && filterCompsData.length > 0"
    class="filtersInDashboard"
    :style="backgroundStyle"
  >

    <template v-for="filterComp in filterCompsData">
      <MultiSelect
        class="filtersInDashboardSelect"
        v-if="filterComp.fieldDetail.type === 'time' || filterComp.fieldDetail.type === 'text'"
        :fieldName="filterComp.fieldDetail.alias"
        style="width:160px;margin-top: 5px;margin-bottom: 5px;"
        :placeholder="'请选择' + filterComp.fieldDetail.alias"
        v-model="filterComp.value"
        :allItems="filterComp.options"
        filterable
        multiple
        @on-change="filterCompsDataValueChanged(filterComp)"
      >
        <Option
          v-for="item in filterComp.options"
          :value="item.value"
          :key="item.value"
        >{{ item.label && item.label.trim() !== "" ? item.label : "&nbsp;" }}</Option>
      </MultiSelect>
      <NumberRangeSelect
        v-else
        class="filtersInDashboardSelect numberFilter"
        :fieldName="filterComp.fieldDetail.alias"
        style="width:160px;margin-top: 6px;margin-bottom: 5px;"
        v-model="filterComp.value"
        @on-change="filterCompsDataValueChanged(filterComp)"
      ></NumberRangeSelect>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    backgroundStyle: {
      type: Object,
      default: () => {
        return {};
      }
    },
    filtersInDashboard: {
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
    filterCompsDataValueChanged(filterComp) {
      this.$emit("filterCompsDataValueChanged", this.filterCompsData);
      for (let panelField of filterComp.panelFields) {
        const fieldName = JSON.parse(panelField.field.value).name;
        const subName =
          "filterCompChanged-" + panelField.panelId + "-" + fieldName;
        this.$root.Bus.$emit(subName, filterComp, fieldName);
      }
    }
  },
  created() {
    this.filterCompsData = this.filtersInDashboard;
  },
  watch: {
    filtersInDashboard: {
      handler(val, oldVal) {
        this.filterCompsData = val;
      },
      deep: true
    }
  }
};
</script>

<style scoped>
.filtersInDashboard {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: calc(100% - 50px);
  height: 100%;
  flex-wrap: wrap;
  overflow: auto;
  border-radius: 6px;
}
.filtersInDashboard .ivu-select-item {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.filtersInDashboard > .filtersInDashboardSelect {
  margin-left: 10px;
}
</style>


<style>
.filtersInDashboard .ivu-input {
  padding: 4px;
}

.filtersInDashboard .numberFilter .ivu-select-dropdown {
  overflow: visible;
}
.filtersInDashboard .numberFilter .ivu-select-dropdown .ivu-select-dropdown {
  overflow: auto;
  background-color: var(--popup-content-bg-color-in-modal);
  border-radius: 6px;
}
</style>

