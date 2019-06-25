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
      <i v-show="isShowMoreOperating" class="bi-iconfont bi-icon-delete"></i>
      <i v-show="isShowMoreOperating" class="bi-iconfont bi-icon-chart-fullscreen"></i>
      <i class="bi-iconfont bi-icon-more" @click="showMoreOperating"></i>
    </div>
    <ChartRender class="chartRender" :chart="chart"></ChartRender>
  </div>
</template>
<script>
import ChartRender from "./ChartRender";
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
      isShowMoreOperating: false
    };
  },
  methods: {
    operating(type) {
      this.$emit("operating", type);
    },
    showMoreOperating() {
      this.isShowMoreOperating = !this.isShowMoreOperating;
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


