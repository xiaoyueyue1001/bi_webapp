<template>
  <div class="chart-wrap">
    <div class="title">
      <div class="name" :title="chart.chartName">{{chart.chartName}}</div>
      <i
        v-show="isShowMoreOperating"
        class="bi-iconfont bi-icon-export"
        @click="operating('export')"
      ></i>
      <i v-show="isShowMoreOperating" class="bi-iconfont bi-icon-share" @click="operating('share')"></i>
      <i
        v-show="isShowMoreOperating"
        class="bi-iconfont bi-icon-chart-move"
        @click="operating('move')"
      ></i>
      <i v-show="isShowMoreOperating" class="bi-iconfont bi-icon-delete" @click="deleteChart"></i>
      <i
        v-show="isShowMoreOperating"
        class="bi-iconfont bi-icon-chart-fullscreen"
        @click="fullscreen"
      ></i>
      <i class="bi-iconfont bi-icon-more" @click="showMoreOperating"></i>
    </div>
    <ChartRender
      class="chartRender"
      :chart="chart"
      ref="chartRender"
      :class="{fullScreen:isFullscreen}"
      @quitFullscreen="quitFullscreen"
    ></ChartRender>
  </div>
</template>
<script>
import ChartRender from "./ChartRender";
import screenfull from "screenfull";
import { requestFullScreen, exitFullscreen } from "@/utils/fullscreen";
export default {
  components: { ChartRender },
  props: {
    chart: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      isShowMoreOperating: false,
      isFullscreen: false
    };
  },
  methods: {
    operating(type) {
      this.csvData = this.getCsvData();
      let data = { type };
      if (type === "export") {
        data.csvData = this.getCsvData();
      }
      this.$emit("operating", data);
    },
    showMoreOperating() {
      this.isShowMoreOperating = !this.isShowMoreOperating;
    },
    getCsvData() {
      let headers = null;
      if (this.chart.chartSource === "2") {
        headers = [
          ...(this.chart.getDataOption.dimensionFields || []),
          ...(this.chart.getDataOption.numberFields || []),
          ...(this.chart.getDataOption.sAxisNumberFields || []),
          ...(this.chart.getDataOption.xAxisNumberFields || [])
        ].map(field => {
          return field.alias;
        });
      } else {
        headers = ["标签名称", "人群数量"];
      }
      const options = {
        fieldSeparator: ",",
        filename: this.chart.chartName,
        quoteStrings: '"',
        decimalseparator: ".",
        showLabels: true,
        showTitle: true,
        title: this.chart.chartName,
        useBom: true,
        headers: headers
      };

      const propData =
        this.chart.chartSource === "2"
          ? this.$refs.chartRender.$refs.component.filteredData
          : this.$refs.chartRender.$refs.component.data;
      const data = Array.isArray(propData) ? propData : propData.data;
      if (this.chart.chartSource === "2" && data[0]) {
        const clonedData0 = _.cloneDeep(data[0]);
        data[0] = {};
        for (let field of [
          ...(this.chart.getDataOption.dimensionFields || []),
          ...(this.chart.getDataOption.numberFields || []),
          ...(this.chart.getDataOption.sAxisNumberFields || []),
          ...(this.chart.getDataOption.xAxisNumberFields || [])
        ]) {
          data[0][field.name] = clonedData0[field.name];
        }
      }

      return {
        options,
        data
      };
    },
    fullscreen() {
      const element = document.querySelector(`#chart${this.chart.chartId}`);
      if (screenfull.enabled) {
        this.isFullscreen = true;
        screenfull.request(element);
      }
    },
    quitFullscreen() {
      this.isFullscreen = false;
      screenfull.exit();
    },
    deleteChart() {
      MessageBox.confirm("确定执行此操作?").then(
        action => {
          console.log(action);
        },
        err => {
          console.log(err);
        }
      );
    }
  }
};
</script>
<style lang="less" scoped>
.chart-wrap {
  height: 100%;
  background-color: var(--chart-bg-color);
  > .title {
    padding-top: 0.18rem;
    display: flex;
    > .name {
      height: 0.6rem;
      line-height: 0.6rem;
      font-size: 26px;
      text-indent: 0.32rem;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    > i.bi-iconfont {
      width: 0.6rem;
      height: 0.6rem;
      line-height: 0.6rem;
      text-align: center;
      border-radius: 50%;
      font-size: 0.38rem;
      margin: 0 0.21rem 0 0.03rem;
      background-color: var(--icon-bg-color);
      color: var(--gray-font-color);
    }
  }
  > .chartRender {
    height: calc(100% - 0.78rem);
  }
}
</style>


