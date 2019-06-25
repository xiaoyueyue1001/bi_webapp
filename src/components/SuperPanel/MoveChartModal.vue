<template>
  <mt-popup id="moveChartModal" v-model="show" position="bottom" :closeOnClickModal="false">
    <div class="wrap">
      <div class="btn-wrap">
        <div class="btn cancel" @click="cancel">取消</div>
        <div class="btn move" @click="confirm">移动</div>
      </div>
      <div class="tab-wrap">
        <mt-navbar v-model="selected">
          <mt-tab-item id="1">选择分组</mt-tab-item>
          <mt-tab-item id="2">选择仪表盘</mt-tab-item>
        </mt-navbar>

        <!-- tab-container -->
        <mt-tab-container v-model="selected">
          <mt-tab-container-item id="1">
            <div
              v-for="grouping in groupingList"
              :key="grouping.value"
              class="groupingItem"
              :class="{check:grouping.check}"
              @click="selectGrouping(grouping)"
            >
              <span>{{grouping.label}}</span>
              <i class="bi-iconfont bi-icon-finished"></i>
            </div>
          </mt-tab-container-item>
          <mt-tab-container-item id="2">
            <div
              v-for="dashboard in dashboadList"
              :key="dashboard.value"
              class="dashboardItem"
              :class="{check:dashboard.check}"
              @click="selectDashboard(dashboard)"
            >
              <span>{{dashboard.label}}</span>
              <i class="bi-iconfont bi-icon-finished"></i>
            </div>
          </mt-tab-container-item>
        </mt-tab-container>
      </div>
    </div>
  </mt-popup>
</template>
<script>
export default {
  data() {
    return {
      show: false,
      selected: "1",
      chartData: {},
      belongDashBoardCode: "",
      belongGroupingType: "",
      currentGroupingId: "",
      currentDashboardCode: ""
    };
  },
  computed: {
    groupingsData() {
      let groupingsData = this.$store.getters["superpanel/getGroupingList"];
      let belongGroupingType = this.belongGroupingType;
      let allowTransferGroupingTypeArray = [];
      switch (belongGroupingType) {
        case 1:
          //画像不允许移动
          break;
        case 2:
          //自助分析只允许在本组移动
          allowTransferGroupingTypeArray = [2];
          break;
        case 3:
          //驾驶舱与自定义分组可跨组移动
          allowTransferGroupingTypeArray = [3, 4];
          break;
        case 4:
          //驾驶舱与自定义分组可跨组移动
          allowTransferGroupingTypeArray = [3, 4];
          break;
        case 5:
          //分享收藏只允许在本组移动
          allowTransferGroupingTypeArray = [5];
          break;
        default:
          break;
      }
      groupingsData = groupingsData.filter(item => {
        return allowTransferGroupingTypeArray.includes(item.type);
      });
      /*根据仪表盘所在分组的类型约束移动的分组的范围(以上)*/
      let groupingsDataFormat = groupingsData.map(grouping => {
        return {
          type: grouping.type,
          label: grouping.label,
          dashBoardGroupId: grouping.dashBoardGroupId,
          dashBoardGroupCode: grouping.dashBoardGroupCode,
          dashBoard: grouping.dashBoard.map(dashboard => {
            return {
              dashBoardName: dashboard.dashBoardName,
              dashBoardCode: dashboard.dashBoardCode,
              dashBoardId: dashboard.dashBoardId
            };
          })
        };
      });
      return groupingsDataFormat;
    },
    groupingList() {
      return this.groupingsData.map(item => {
        return {
          label: item.label,
          value: item.dashBoardGroupId,
          check: item.dashBoardGroupId === this.currentGroupingId
        };
      });
    },
    dashboadList() {
      let selectId = this.currentGroupingId;
      if (selectId) {
        let currentGrouping = this.groupingsData.filter(item => {
          return selectId === item.dashBoardGroupId;
        })[0];
        //过滤自身所属仪表盘
        let currentDashboardCode = this.belongDashBoardCode;
        currentGrouping.dashBoard = currentGrouping.dashBoard.filter(item => {
          return item.dashBoardCode !== currentDashboardCode;
        });
        return currentGrouping.dashBoard.map(item => {
          return {
            label: item.dashBoardName,
            value: item.dashBoardCode,
            check: item.dashBoardCode === this.currentDashboardCode
          };
        });
      } else {
        return [];
      }
    }
  },
  methods: {
    selectGrouping(grouping) {
      this.currentGroupingId = grouping.value;
      this.currentDashboardCode = "";
    },
    selectDashboard(dashboard) {
      this.currentDashboardCode = dashboard.value;
    },
    cancel() {
      this.show = false;
    },
    confirm() {
      this.$store
        .dispatch({
          type: "superpanel/moveChart",
          payload: {
            chartCode: this.chartData.chartCode,
            sourceDashBoardCode: this.belongDashBoardCode,
            targetDashBoardCode: this.currentDashboardCode,
            detailId: this.chartData.detailChartId
          }
        })
        .then(() => {
          this.cancel();
          //   let chartId = this.chartData.uuid;
          //   this.$store.dispatch("dashboard/removePanel", chartId);
          // this.$emit("removePanel");
          //删除联动
          //   let links = _.clone(this.linkages) || [];
          //   links = links.filter(item => {
          // return chartId !== item.descChart && chartId !== item.srcChart;
          //   });
          //   this.$store.commit("dashboard/setLinkages", links);
          //   this.$emit("transferChart");
          //   this.cancel();
        });
    }
  }
};
</script>
<style lang="less" scoped>
#moveChartModal {
  height: 100%;
  .wrap {
    height: 100%;
    background-color: var(--modal-bg-color);
    > .btn-wrap {
      height: 0.8rem;
      border-bottom: 1px solid var(--default-border-color);
      display: flex;
      > .btn {
        background-color: var(--move-tab-bg-color);
        flex: 1;
        height: 100%;
        text-align: center;
        line-height: 0.8rem;
        font-size: 0.3rem;
        &.move {
          border-left: 1px solid var(--default-border-color);
          color: var(--highlight-color);
        }
      }
    }
    > .tab-wrap {
      margin: 0 0.4rem;
      .groupingItem {
        height: 0.9rem;
        font-size: 0.3rem;
        display: flex;
        align-items: center;
        i.bi-iconfont {
          margin-left: 0.4rem;
          color: var(--highlight-color);
          font-size: 0.3rem;
          display: none;
        }
        &.check {
          i.bi-iconfont {
            display: block;
          }
        }
      }
      .dashboardItem {
        height: 0.9rem;
        font-size: 0.3rem;
        display: flex;
        align-items: center;
        i.bi-iconfont {
          margin-left: 0.4rem;
          color: var(--highlight-color);
          font-size: 0.3rem;
          display: none;
        }
        &.check {
          i.bi-iconfont {
            display: block;
          }
        }
      }
    }
  }
}
</style>
<style lang="less">
#moveChartModal {
  .mint-navbar {
    background-color: transparent;
    margin-top: 0.4rem;
    .mint-tab-item {
      height: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .mint-tab-container-item {
    text-indent: 0.4rem;
  }
}
</style>


