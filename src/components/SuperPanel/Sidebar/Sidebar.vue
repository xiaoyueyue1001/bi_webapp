<template>
  <mt-popup v-model="show" position="left" id="sidebar">
    <div class="wrap">
      <div class="search-wrap">
        <mt-field placeholder="搜索仪表盘" v-model="keyword" class="search"></mt-field>
        <i class="bi-iconfont bi-icon-search"></i>
      </div>
      <div class="groupings-wrap">
        <ul>
          <li
            v-for="(grouping,index) in groupings"
            :key="index"
            :class="{isExpand:grouping.expand}"
          >
            <div class="title" @click="toggleGrouping(grouping)">
              <div class="left">
                <i :class="'bi-iconfont bi-icon-'+grouping.icon"></i>
                <span :title="grouping.label">{{grouping.label}}</span>
              </div>
              <div class="right">
                <i class="bi-iconfont bi-icon-arrow-down"></i>
              </div>
            </div>
            <div class="expand" :style="getDashBoardStyle(grouping)">
              <div class="items" v-if="grouping.dashBoard.length !==0">
                <div
                  class="item"
                  v-for="(dashBoard,index) in grouping.dashBoard"
                  :key="index"
                  :class="{active:dashBoard.active}"
                  @click="selectDashBoard(dashBoard,grouping)"
                >
                  <div class="name">
                    <span :title="dashBoard.name" class="dashboard-name">{{dashBoard.name}}</span>
                    <span>({{dashBoard.chartNumber}})</span>
                  </div>
                </div>
              </div>
              <div class="none" v-else>暂无数据</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </mt-popup>
</template>
<script>
export default {
  data() {
    return {
      show: false,
      keyword: "",
      expandGroupingIdList: [],
      currentDashboardCode: "",
      currentGroupingId: ""
    };
  },
  computed: {
    groupings() {
      //通过计算属性获取接口原始值  前端的操作全部记录在data之中 通过计算属性得出需要渲染的数据
      let groupings = this.$store.getters["superpanel/getGroupingList"];
      this.getLastDashBoard(groupings); //过去上次的记录值
      groupings = this.formatGroupingList(groupings); //格式化原始数据用于渲染
      groupings = this.sortGrouping(groupings); //排列显示顺序
      groupings = this.filterByKeyword(groupings); //过滤
      return groupings;
    }
  },
  methods: {
    toggleGrouping(grouping) {
      //将需要展开的分组id加入list  如果已经加入则移除
      if (this.expandGroupingIdList.includes(grouping.id)) {
        this.expandGroupingIdList = this.expandGroupingIdList.filter(item => {
          return item !== grouping.id;
        });
      } else {
        this.expandGroupingIdList.push(grouping.id);
      }
    },
    filterByKeyword(groupings) {
      //过滤函数
      let key = this.keyword.trim();
      if (key === "") {
        return groupings;
      }
      let collapse = JSON.parse(JSON.stringify(groupings));
      let collapse2 = collapse.map(items => {
        if (items.label.indexOf(key) !== -1) {
          //若分组名含有关键字则保留其状态不变
          items.expand = this.expandGroupingIdList.includes(items.id);
          return items;
        } else {
          let kong = true;
          items.dashBoard = items.dashBoard.map(item => {
            if (item.name.indexOf(key) !== -1) {
              kong = false;
              return item;
            } else {
              return null;
            }
          });
          if (kong) {
            return null;
          } else {
            items.expand = this.expandGroupingIdList.includes(items.id);
            return items;
          }
        }
      });
      return collapse2
        .filter(item => {
          return item;
        })
        .map(items => {
          items.dashBoard = items.dashBoard.filter(item => {
            return item;
          });
          return items;
        });
    },
    getLastDashBoard(groupings) {
      groupings.forEach(grouping => {
        grouping.dashBoard.forEach(dashBoard => {
          //仅在没有当前仪表盘的时候使用接口传递的上次记录的值
          if (dashBoard.active && !this.currentDashboardCode) {
            this.currentDashboardCode = dashBoard.dashBoardCode;
            this.currentGroupingId = grouping.dashBoardGroupId;
            this.expandGroupingIdList.push(grouping.dashBoardGroupId);
          }
        });
      });
    },
    formatGroupingList(groupings) {
      return groupings.map(grouping => {
        return {
          label: grouping.label,
          icon: this.groupingTypeIconMapping(grouping.type),
          expand: this.expandGroupingIdList.includes(grouping.dashBoardGroupId),
          type: grouping.type,
          id: grouping.dashBoardGroupId,
          groupSort: grouping.groupSort,
          dashBoard: grouping.dashBoard.map(dashBoard => {
            return {
              name: dashBoard.dashBoardName,
              id: dashBoard.dashBoardId,
              code: dashBoard.dashBoardCode,
              chartNumber: dashBoard.haveChartNum,
              dashBoardSort: dashBoard.dashBoardSort,
              belongGroupingType: grouping.type,
              belongGroupingId: grouping.dashBoardGroupId,
              active: this.currentDashboardCode === dashBoard.dashBoardCode
            };
          })
        };
      });
    },
    groupingTypeIconMapping(type) {
      //分组类型的图片的映射map
      let icon = "";
      switch (type) {
        case 2:
          icon = "sidebar-self-analysis";
          break;
        case 3:
          icon = "sidebar-cockpit";
          break;
        case 4:
          icon = "sidebar-custom";
          break;
        case 5:
          icon = "sidebar-share-collection";
          break;
        default:
          icon = "sidebar-custom";
          break;
      }
      return icon;
    },
    sortGrouping(collapse) {
      //根据typeSort中的type顺序排列collapse(分组排序)
      let typeSort = [3, 2, 1, 5, 4];
      let sortArray = [];
      typeSort.forEach(type => {
        let current = collapse.filter(item => {
          return item.type === type;
        });
        if (type === 4) {
          //自助分析内部使用groupSort排序
          current.sort((a, b) => a.groupSort - b.groupSort);
        }
        sortArray.push(...current);
      });
      return sortArray;
    },
    getDashBoardStyle(item) {
      //计算分组展开时的高度
      let height = 0;
      if (item.expand) {
        height = item.dashBoard.length * 0.9;
      }
      return {
        height: height + "rem"
      };
    },
    selectDashBoard(dashBoard, grouping) {
      this.currentDashboardCode = dashBoard.code;
      this.currentGroupingId = grouping.id;
      this.show = false;
    }
  },
  created() {
    this.$store.dispatch({
      type: "superpanel/queryGroupingList"
    });
  },
  watch: {
    currentDashboardCode(code) {
      console.log(code);
      this.$store
        .dispatch("superpanel/loadDashBoardChart", {
          dashBoardCode: code
        })
        .then(res => {
          // this.$emit("activeDashboard", true);
          // this.$emit("close", "globalStyle");
          // let dashBoardCode = res.data.dashBoardCode;
          // let haveChartNum = res.data.haveChartNum;
          // this.collapse.forEach(item => {
          //   item.dashBoard.forEach(item => {
          //     if (item.code === dashBoardCode) {
          //       item.chartNumber = haveChartNum;
          //     }
          //   });
          // });
        });
    }
  }
};
</script>
<style lang="less" scoped>
@import url("./Sidebar.less");
</style>

