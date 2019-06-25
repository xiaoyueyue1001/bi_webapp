<template>
  <mt-popup id="shareModal" v-model="show" position="bottom" :closeOnClickModal="false">
    <div class="wrap">
      <div class="title">分享图表</div>
      <div class="form">
        <div class="current1" v-if="current===0">
          <div class="label">分享方式</div>
          <mt-radio v-model="type" :options="typeOptions"></mt-radio>
          <div class="label">有效期</div>
          <mt-radio v-model="time" :options="timeOptions"></mt-radio>
        </div>
        <div class="current2" v-else>
          <div class="success">
            <i class="bi-iconfont bi-icon-finished"></i>
            分享链接创建成功!
          </div>
          <div class="link-wrap">
            <span class="label">链接:</span>
            <span class="link">{{link}}</span>
          </div>
          <div class="pwd">
            <span class="label">密码</span>
            <span>{{password}}</span>
          </div>
        </div>
        <div class="btn-wrap">
          <mt-button type="default" @click="cancel">取消</mt-button>
          <mt-button type="primary" @click="createLink" v-if="current===0">创建链接</mt-button>
          <mt-button type="primary" @click="copyLink" v-else>复制链接</mt-button>
        </div>
      </div>
    </div>
  </mt-popup>
</template>
<script>
export default {
  data() {
    return {
      show: false,
      current: 0,
      chartData: {},
      type: "1",
      time: "2",
      typeOptions: [
        {
          label: "加密分享",
          value: "1"
        },
        {
          label: "公开分享",
          value: "2"
        }
      ],
      timeOptions: [
        {
          label: "1天有效",
          value: "1"
        },
        {
          label: "7天有效",
          value: "2"
        },
        {
          label: "永久有效",
          value: "3"
        }
      ],
      link: "",
      password: ""
    };
  },
  methods: {
    cancel() {
      this.show = false;
    },
    createLink() {
      // this.cancel();
      this.$store
        .dispatch({
          type: "superpanel/createChartShare",
          payload: {
            chartCode: this.chartData.chartCode,
            shareType: this.type,
            validityPeriod: this.time
          }
        })
        .then(res => {
          // this.link = `${window.location.origin}${
          //   window.location.pathname
          // }#/sharedChart?shareCode=${res.data.shareCode}`;
          this.link = `${window.location.origin}${
            window.location.pathname
          }#/sharedLogin?shareCode=${res.data.shareCode}&type=chart`;
          this.password = res.data.pwd || "无";
          this.current++;
        });
    },
    copyLink() {
      let oInput = document.createElement("input");
      oInput.value = this.link;
      document.body.appendChild(oInput);
      oInput.select(); // 选择对象
      document.execCommand("Copy"); // 执行浏览器复制命令
      document.body.removeChild(oInput);
      Toast({
        message: "复制成功",
        position: "top",
        duration: 2000
      });
    }
  }
};
</script>
<style lang="less" scoped>
#shareModal {
  height: 100%;
  .wrap {
    height: 100%;
    background-color: var(--modal-bg-color);
    > .title {
      height: 1.1rem;
      line-height: 1.1rem;
      text-align: center;
      font-size: 0.32rem;
    }
    > .form {
      margin: 0 0.4rem;
      > .current1 {
        height: 4.48rem;
        > .label {
          height: 0.28rem;
          line-height: 0.28rem;
          font-size: 0.28rem;
          color: var(--gray-font-color);
        }
      }
      > .current2 {
        height: 4.48rem;
        > .success {
          height: 0.5rem;
          display: flex;
          align-items: center;
          margin-bottom: 0.4rem;
          color: var(--success-color);
          .bi-iconfont {
            font-size: 0.3rem;
            width: 0.5rem;
            height: 0.5rem;
            line-height: 0.5rem;
            text-align: center;
            border-radius: 50%;
            background-color: var(--success-color);
            margin-right: 0.17rem;
            color: var(--default-font-color);
          }
        }
        .link-wrap {
          display: flex;
          margin-bottom: 0.5rem;
          .label {
            font-size: 0.3rem;
            width: 0.92rem;
          }
          .link {
            font-size: 0.34rem;
            width: calc(100% - 0.92rem);
            word-break: break-all;
            color: var(--highlight-color);
          }
        }
        .pwd {
          display: flex;
          .label {
            font-size: 0.3rem;
            width: 0.92rem;
          }
        }
      }
      > .btn-wrap {
        display: flex;
        justify-content: space-between;
        button {
          width: 3.2rem;
          height: 0.8rem;
          font-size: 0.3rem;
        }
      }
    }
  }
}
</style>
<style lang="less">
#shareModal {
  .mint-radiolist {
    margin: 0.5rem 0 1.16rem 0;
    height: 0.3rem;
    display: flex;
    .mint-checklist-title {
      margin: 0;
    }
    a.mint-cell {
      width: 2.5rem;
      border: none;
      min-height: 0;
      .mint-cell-wrapper {
        font-size: 0.26rem;
        .mint-radio-core {
          background-color: transparent;
        }
        .mint-radio-core::after {
          width: 0.12rem;
          height: 0.08rem;
          border: 3px solid transparent;
          transform: rotateZ(-45deg);
          border-top: 0;
          border-right: 0;
          background-color: transparent;
        }
        .mint-radio-input:checked + .mint-radio-core {
          background-color: var(--checklist-bg-color);
        }
        .mint-radio-input:checked + .mint-radio-core::after {
          border-color: var(--default-font-color);
        }
      }
    }
  }
}
</style>



