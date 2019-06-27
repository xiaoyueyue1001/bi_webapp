<template>
  <div :id="'chart'+chart.chartId">
    <div class="chartRender-wrap">
      <i class="bi-iconfont" @click="quitFullscreen">×</i>
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
      default() {
        return {};
      }
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
  },
  methods: {
    quitFullscreen() {
      this.$emit("quitFullscreen");
    }
  }
};
</script>
<style lang="less" scoped>
.chartRender {
  .chartRender-wrap {
    position: relative;
    height: 100%;
    .bi-iconfont {
      position: absolute;
      top: 0.2rem;
      right: 0.2rem;
      font-size: 0.36rem;
      z-index: 99;
      display: none;
    }
  }
  &.fullScreen {
    .chartRender-wrap {
      transform-origin: 50vw 50vw;
      transform: rotateZ(90deg);
      width: 100vh;
      height: 100vw;
      .bi-iconfont {
        display: block;
      }
    }
  }
}
</style>
<style lang="less">
/*全屏横屏显示代码*/
.myChart {
  width: 100% !important;
  height: 100% !important;
  > div:nth-child(1) {
    width: 100% !important;
    height: 100% !important;
    > canvas {
      width: 100% !important;
      height: 100% !important;
    }
  }
}
</style>


