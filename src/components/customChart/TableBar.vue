<template>
  <div class="tableBar" :style="{fontSize:height<200?'10px':'14px'}" v-show="height > 40">
    <div
      style="position:relative;height:100%;"
      v-if="total>0"
      :style="{height: 'calc(100% - ' + (computedData.length > 10 ? 36 : 0) + 'px)'}"
    >
      <div class="flex-row ranking-row ranking-row-header">
        <div class="ranking vertical-middle">
          <div>排名</div>
        </div>
        <div class="name vertical-middle">
          <div>{{data.fields[0]}}</div>
        </div>
        <div class="percent vertical-middle">
          <div>{{data.fields[1]}}</div>
        </div>
        <div class="value vertical-middle">
          <div>{{data.fields[2]}}</div>
        </div>
        <div class="tgi vertical-middle">
          <div>TGI</div>
        </div>
      </div>
      <div
        v-for="(item,index) in pageData"
        class="flex-row ranking-row"
      >
        <div class="ranking vertical-middle">{{(currentPage-1)*10 + index + 1}}</div>
        <div class="name vertical-middle">
          <div>{{item.name}}</div>
        </div>
        <div class="percent flex-row">
          <div class="progress flex-row">
            <transition
              v-on:before-enter="beforeEnter"
              v-on:enter="enter(arguments, {width:Math.round(item.value / computedData[0].value * 100) + '%'})"
              v-bind:css="false"
            >
              <div
                v-if="show"
                class="progress-bar"
              ></div>
            </transition>
          </div>
          <div class="percentText vertical-middle">{{Math.round(item.value/total * 10000) / 100 + "%"}}</div>
        </div>
        <div class="value vertical-middle">{{item.value.toLocaleString()}}</div>
        <div class="tgi vertical-middle"><span :class="Number(item.TGI) > 100 ? 'red' : ''">{{item.TGI}}</span></div>
      </div>
    </div>
    <div
      v-if="computedData.length > 10 && width > 170 && height > 70"
      class="pagination"
    >
      <input
        class="ivu-input"
        :value="currentPage"
        @blur="currentPageChanged"
        @keyup.enter="currentPageChanged"
      ></input>
      <div style="margin-right: 6px;">{{'/' + pageCount}}</div>
      <Button
        class="page-operation"
        type="ghost"
        @click="toPrevPage"
        :disabled="currentPage===1"
      >
        <!-- <Icon
          type="md-arrow-dropup"
          size=20
        /> -->
      </Button>
      <Button
        class="page-operation"
        type="ghost"
        @click="toNextPage"
        :disabled="currentPage===pageCount"
      >
        <!-- <Icon
          type="md-arrow-dropdown"
          size=20
        /> -->
      </Button>
    </div>
    <div
      v-if="!computedData || computedData.length === 0"
      class="empty"
    >暂无数据</div>
  </div>
</template>
<script>
import Velocity from "velocity-animate";
export default {
  name: "ZcmorefunTableBar",
  data() {
    return {
      show: false,
      currentPage: 1
    };
  },
  props: {
    data: {
      type: Object,
      default: () => {
        return {
          fields: {
            type: Array,
            default: () => {
              return ["场馆名称", "关注人群占比", "人群规模"];
            }
          },
          data: {
            type: Array,
            default: () => {
              return [];
            }
          }
        };
      }
    },
    width: {
      type: Number,
      default: 933
    },
    height: {
      type: Number,
      default: 362
    }
  },
  computed: {
    computedData() {
      const computedData = JSON.parse(JSON.stringify(this.data.data));
      computedData.sort((a, b) => {
        return b.value - a.value;
      });
      return computedData;
    },
    total() {
      let total = 0;
      this.data.data.forEach(element => {
        total += element.value;
      });
      return total;
    },
    pageCount() {
      return Math.ceil(this.data.data.length / 10);
    },
    pageData() {
      return this.computedData.slice(
        10 * (this.currentPage - 1),
        10 * this.currentPage
      );
    }
  },
  methods: {
    currentPageChanged(e) {
      const num = Number(e.target.value);
      if (this.currentPage !== num) {
        this.show = false;
      }
      if (isNaN(num) || num <= 0) {
        this.currentPage = 1;
        e.target.value = 1;
        setTimeout(() => {
          this.show = true;
        }, 100);
        return;
      }
      if (num >= this.pageCount) {
        this.currentPage = this.pageCount;
        e.target.value = this.pageCount;
        setTimeout(() => {
          this.show = true;
        }, 100);
        return;
      }
      this.currentPage = num;
      setTimeout(() => {
        this.show = true;
      }, 100);
    },
    toPrevPage() {
      this.show = false;
      this.currentPage -= 1;
      setTimeout(() => {
        this.show = true;
      }, 100);
    },
    toNextPage() {
      this.show = false;
      this.currentPage += 1;
      setTimeout(() => {
        this.show = true;
      }, 100);
    },
    beforeEnter: function(el) {
      el.style.width = "0%";
    },
    enter(args, styles) {
      Velocity(args[0], styles, { duration: 300 });
    }
  },
  mounted() {
    setTimeout(() => {
      this.show = true;
    }, 100);
  }
};
</script>
<style scoped>
.red {
  color: #d43f39;
}
.ranking-row-header {
  margin-top: 5px;
}
.pagination {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  right: 20px;
  bottom: 10px;
  position: absolute;
}
.pagination input {
  width: 30px;
  height: 20px;
}
.page-operation {
  height: 9%;
  width: 27px;
  border: none;
  margin: 0px;
  padding: 0px;
}
.empty {
  width: 100%;
  height: 9.1%;
  line-height: 27px;
  text-align: center;
}
.tableBar {
  font-size: 14px;
  width: 100%;
  height: 100%;
  position: relative;
  padding-left: 10px;
  padding-bottom: 10px;
}
.ranking {
  width: 8%;
  /* padding-left: 15px; */
  height: 100%;
}
.ranking-row {
  height: 9%;
}
.vertical-middle {
  display: -webkit-box;
  -webkit-box-orient: horizontal;
  -webkit-box-pack: start;
  -webkit-box-align: center;

  display: -moz-box;
  -moz-box-orient: horizontal;
  -moz-box-pack: start;
  -moz-box-align: center;

  display: -o-box;
  -o-box-orient: horizontal;
  -o-box-pack: start;
  -o-box-align: center;

  display: -ms-box;
  -ms-box-orient: horizontal;
  -ms-box-pack: start;
  -ms-box-align: center;

  display: box;
  box-orient: horizontal;
  box-pack: start;
  box-align: center;
}
.name {
  width: 10%;
  height: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.ranking-row-header > div > div {
  overflow: hidden;
  max-width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.name div {
  display: block;
  overflow: hidden;
  max-width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.percent {
  width: 60%;
  height: 100%;
}
.value {
  width: 11%;
  height: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.tgi {
  width: 9%;
  height: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.progress {
  width: 80%;
  background: transparent;
  height: 100%;
}
.progress-bar {
  height: 50%;
  background: linear-gradient(
    to right,
    RGBA(11, 255, 251, 0.3),
    RGBA(11, 255, 251, 0.7)
  );
  border-radius: 6px;
}
.percentText {
  width: 20%;
  margin-left: 5px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>

