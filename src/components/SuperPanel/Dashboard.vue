<template>
  <div id="dashboard" class="horizontal">
    <div class="side" :class="{hide:!showSide}">
      <div class="title">
        <span v-if="showSide">收起</span>
      </div>
      <div class="charts">
        <div
          class="chart"
          v-for="chart in chartsData"
          :key="chart.chartId"
          :class="{check:chart.check}"
          @click="selectChart(chart)"
        >{{chart.chartName}}</div>
      </div>
    </div>
    <div class="chart-wrap" :class="{full:!showSide}">
      <i class="bi-iconfont bi-icon-sidebar-shrink" @click="toogleSide" :class="{showSide}"></i>
      <i class="bi-iconfont exit" @click="exit">×</i>
      <ChartRender class="chartRender" :chart="currentChart" v-if="showChart"></ChartRender>
    </div>
  </div>
</template>
<script>
import ChartRender from "./ChartRender";
export default {
  components: { ChartRender },
  data() {
    return {
      showSide: true,
      currentChartId: "",
      showChart: true
    };
  },
  computed: {
    chartsData() {
      let dashBoardData = this.$store.getters["superpanel/getCurrentDashBoard"];
      let chartsData = dashBoardData.chartsData || [];
      return chartsData.map(chart => {
        chart.check = chart.chartId === this.currentChartId;
        return chart;
      });
    },
    currentChart() {
      this.showChart = false;
      this.$nextTick(() => {
        this.showChart = true;
      });
      return this.chartsData.find(chart => chart.check);
    }
  },
  methods: {
    toogleSide() {
      this.showSide = !this.showSide;
    },
    exit() {
      this.$router.push({
        name: "superPanel"
      });
    },
    selectChart(chart) {
      this.currentChartId = chart.chartId;
    }
  },
  created() {
    if (this.$route.params.from !== "superpanel") {
      this.exit();
    } else {
      this.currentChartId = this.chartsData[0] && this.chartsData[0].chartId;
    }
  }
};
</script>
<style lang="less" scoped>
#dashboard {
  background-color: var(--chart-bg-color);
  display: flex;
  height: 100%;
  &.horizontal {
    width: 100vh;
    height: 100vw;
    transform-origin: 50vw 50vw;
    transform: rotateZ(90deg);
  }
  .side {
    width: 3rem;
    height: 100%;
    background-color: var(--dashboard-side-bg-color);
    transition: all 1s;
    position: relative;
    overflow: hidden;
    &.hide {
      width: 0rem;
      transform: translateX(-100%);
    }
    > .title {
      height: 0.9rem;
      display: flex;
      align-items: center;
      padding: 0 0.8rem;
      font-size: 0.3rem;
      color: var(--default-font-color);
      border-bottom: 1px solid var(--default-border-color);
      word-break: keep-all;
    }
    .charts {
      overflow: hidden;
      height: calc(100% - 0.9rem);
      .chart {
        height: 0.9rem;
        line-height: 0.9rem;
        text-indent: 0.3rem;
        color: var(--default-font-color);
        border-bottom: 1px solid var(--default-border-color);
        word-break: keep-all;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        &.check {
          background-color: var(--select-item-bg-color);
        }
      }
    }
  }
  .chart-wrap {
    width: calc(100% - 3rem);
    height: 100%;
    transition: all 1s;
    position: relative;
    &.full {
      width: 100%;
    }

    > .bi-iconfont.bi-icon-sidebar-shrink {
      transition: all 1s;
      font-size: 0.4rem;
      margin-right: 0.17rem;
      color: var(--default-font-color);
      position: absolute;
      top: 0.25rem;
      left: 0.2rem;
      z-index: 99;
      &.showSide {
        transform: translateX(-3rem) rotateY(180deg);
      }
    }
    > .bi-iconfont.exit {
      position: absolute;
      font-size: 0.36rem;
      top: 0.3rem;
      right: 0.5rem;
      z-index: 99;
    }
    .chartRender {
      height: 100%;
      color: var(--default-font-color);
    }
  }
}
</style>
