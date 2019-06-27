<template>
  <mt-popup id="exportModal" v-model="show" position="bottom" :closeOnClickModal="false">
    <div class="wrap">
      <div class="title">导出图表</div>
      <div class="form">
        <div class="label">导出格式</div>
        <mt-radio v-model="type" :options="options"></mt-radio>
        <div class="btn-wrap">
          <mt-button type="default" @click="cancel">取消</mt-button>
          <mt-button type="primary" @click="confirm">导出</mt-button>
        </div>
      </div>
    </div>
  </mt-popup>
</template>
<script>
import { ExportToCsv } from "export-to-csv";
import { htmlToPng } from "@/utils/htmlToFile.js";
export default {
  data() {
    return {
      show: false,
      type: "csv",
      chartData: {},
      csvData: {},
      options: [
        {
          label: "CSV文件",
          value: "csv"
        },
        {
          label: "PNG图片",
          value: "png"
        }
      ]
    };
  },
  methods: {
    cancel() {
      this.show = false;
    },
    confirm() {
      if (this.type === "png") {
      }
      switch (this.type) {
        case "csv":
          this.exportCsv();
          break;
        case "png":
          this.exportPng();
          break;
        default:
          break;
      }
      this.cancel();
    },
    exportPng() {
      htmlToPng(
        "#chart" + this.chartData.chartId,
        this.chartData.chartName + ".png"
      );
    },
    exportCsv() {
      const csvExporter = new ExportToCsv(this.csvData.options);
      csvExporter.generateCsv(this.csvData.data);
    }
  }
};
</script>
<style lang="less" scoped>
#exportModal {
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
      > .label {
        height: 0.28rem;
        line-height: 0.28rem;
        font-size: 0.28rem;
        color: var(--gray-font-color);
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
#exportModal {
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



