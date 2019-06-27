<template>
  <div id="superPanel">
    <div class="header">
      超级看板
      <i class="bi-iconfont bi-icon-sidebar-shrink" @click="showSidebar"></i>
    </div>
    <div class="panel-wrap">
      <div class="title">
        {{dashBoardData.dashBoardName}}
        <i
          class="bi-iconfont bi-icon-fullscreen"
          @click="dashboardFullscreen"
        ></i>
      </div>
      <div class="charts">
        <ChartWrap
          v-for="(chart,index) in chartsData"
          :key="index"
          :chart="chart"
          @operating="data=>{chartOperating(data,chart)}"
          class="chart-wrap"
        ></ChartWrap>
      </div>
    </div>
    <Siderbar class="sidebar-wrap" ref="sidebar"></Siderbar>
    <ExportModal class="export-wrap" ref="exportModal"></ExportModal>
    <ShareModal class="share-wrap" ref="shareModal"></ShareModal>
    <MoveChartModal class="movechart-wrap" ref="moveChartModal"></MoveChartModal>
  </div>
</template>

<script>
import Siderbar from "@/components/SuperPanel/Sidebar/Sidebar";
import ExportModal from "@/components/SuperPanel/ExportModal";
import ShareModal from "@/components/SuperPanel/ShareModal";
import MoveChartModal from "@/components/SuperPanel/MoveChartModal";
import ChartWrap from "@/components/SuperPanel/ChartWrap";
export default {
  components: { Siderbar, ExportModal, ShareModal, MoveChartModal, ChartWrap },
  data() {
    return {
      sidebarVisible: false,
      exportVisible: false
    };
  },
  computed: {
    dashBoardData() {
      return this.$store.getters["superpanel/getCurrentDashBoard"];
    },
    chartsData() {
      return this.dashBoardData.chartsData || [];
    },
    currentDashBoardBelongGroupingType() {
      let groupings = this.$store.getters["superpanel/getGroupingList"];
      let dashBoardCode = this.dashBoardData.dashBoardCode;
      let type;
      if (groupings && dashBoardCode) {
        groupings.forEach(grouping => {
          grouping.dashBoard.forEach(dashBoard => {
            if (dashBoard.dashBoardCode === dashBoardCode) {
              type = grouping.type;
            }
          });
        });
      }
      return type;
    }
  },
  methods: {
    chartOperating(data, chartData) {
      console.log(arguments);
      switch (data.type) {
        case "export":
          this.showExportModal(chartData, data.csvData);
          break;
        case "share":
          this.showShareModal(chartData);
          break;
        case "move":
          this.showMoveChartModal(chartData);
          break;
        default:
          break;
      }
    },
    showSidebar() {
      this.$refs.sidebar.show = true;
    },
    showExportModal(chartData, csvData) {
      this.$refs.exportModal.show = true;
      this.$refs.exportModal.chartData = chartData;
      this.$refs.exportModal.csvData = csvData;
    },
    showShareModal(chartData) {
      this.$refs.shareModal.show = true;
      this.$refs.shareModal.chartData = chartData;
    },
    showMoveChartModal(chartData) {
      this.$refs.moveChartModal.show = true;
      this.$refs.moveChartModal.chartData = chartData;
      this.$refs.moveChartModal.belongDashBoardCode = this.dashBoardData.dashBoardCode; //图表所属仪表盘的code
      this.$refs.moveChartModal.belongGroupingType = this.currentDashBoardBelongGroupingType; //图表所属仪表盘所属的分组的id
    },
    dashboardFullscreen() {
      this.$router.push({
        name: "dashboard",
        params: {
          from: "superpanel"
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
#superPanel {
  height: 100%;
  font-size: 0.36rem;
  color: var(--default-font-color);
  > .header {
    height: 0.84rem;
    line-height: 0.84rem;
    text-align: center;
    background-color: var(--superpanel-header-bg-color);
    position: relative;
    i.bi-iconfont {
      font-size: 0.44rem;
      position: absolute;
      left: 0.28rem;
      color: var(--gray-font-color);
    }
  }
  > .panel-wrap {
    padding: 0 0.2rem;
    background-color: var(--superpanel-wrap-bf-color);
    height: calc(100% - 0.84rem);
    overflow: hidden;
    > .title {
      height: 0.4rem;
      line-height: 0.4rem;
      margin: 0.3rem 0;
      border-left: 4px solid var(--highlight-color);
      text-indent: 0.14rem;
      i.bi-iconfont {
        font-size: 0.4rem;
        float: right;
        color: var(--gray-font-color);
      }
    }
    > .charts {
      height: calc(100% - 1rem);
      overflow: auto;
      > .chart-wrap {
        height: 6.58rem;
        border-radius: 0.12rem;
        margin-bottom: 0.2rem;
        > .title {
          padding-top: 0.18rem;
          display: flex;
          > .name {
            height: 0.6rem;
            line-height: 0.6rem;
            font-size: 26px;
            text-indent: 0.32rem;
            flex: 1;
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
      }
    }
  }
  .sidebar-wrap {
    height: 100%;
    width: 6.37rem;
    background-color: transparent;
  }
  .export-wrap {
    width: 100%;
    height: 4.94rem;
    background-color: transparent;
  }
  .share-wrap {
    width: 100%;
    height: 7.1rem;
    background-color: transparent;
  }
  .movechart-wrap {
    width: 100%;
    height: 8.6rem;
    background-color: transparent;
  }
}
</style>

