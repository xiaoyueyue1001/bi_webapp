<template>
  <div>
    <keep-alive
      v-if="['ZcmorefunChart', 'ZcmorefunTable', 'ZcmorefunD3Bubble', 'ZcmorefunAnalysisAreaMap', 'ZcmorefunWordcloud'].includes(chartType)"
    >
      <component
        :panelId="''"
        :isFullscreen="false"
        :isChartFullscreen="false"
        v-bind:is="chartType"
        :chartResult="chart.chartResult"
        :chartType="chartType"
        :getDataOption="chart.getDataOption"
        :getOptionFunc="chart.getOptionFunc"
        :filtersInChart="chart.filtersInChart"
        :activeColorTheme="activeColorTheme"
        :filterSubs="[]"
        ref="component"
        :style="{
          top:0,
          height:'100%'
        }"
        :showTitle="false"
      ></component>
    </keep-alive>
    <keep-alive v-else>
      <component
        :panelId="''"
        :isFullscreen="false"
        :isChartFullscreen="false"
        v-bind:is="chartType"
        :data="chart.chartResult"
        ref="component"
        :style="{
          top:0,
          height:'100%'
        }"
        :showTitle="false"
      ></component>
    </keep-alive>
  </div>
</template>
<script>
import {
  chartCompRegister,
  transformChartType
} from "@/common/register/chartCompRegister.js";
import { colorThemes } from "@/constants.js";
export default {
  components: {
    ...chartCompRegister
  },
  props: {
    chart: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      activeColorTheme: colorThemes[0]
    };
  },
  computed: {
    chartType() {
      if (this.chart.chartType === undefined) return;
      const chartType = transformChartType(this.chart.chartType);
      return chartType;
    }
  }
};
</script>
<style lang="less" scoped>
</style>

