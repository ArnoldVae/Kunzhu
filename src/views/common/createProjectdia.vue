<template>
  <el-dialog
    top="20vh"
    class="el-dialog-cus"
    v-bind="attributes"
    :visible="visible"
    :before-close="beClose"
    append-to-body
    :close-on-click-modal="false"
    v-on="on"
  >
    <slot v-if="visibleSlot"></slot>
    <div slot="footer">
      <el-button @click="cancel" plain>{{ btnTxt[0] }}</el-button>
      <el-button @click="confirm" type="primary" v-if="btnTxt[1]">{{
        btnTxt[1]
      }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import Dialog from "@/views/common/createProjectdia";

export default {
  inheritAttrs: false,
  props: {
    config: Object,
    autoClose: {
      type: Boolean,
      default: true,
    },
    beforeClose: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    const {
      top = "20vh",
      width = "420px",
      title = "提示",
      center = false,
      btnTxt = ["取消", "确定"],
    } = this.config || {};
    return {
      visible: false,
      attributes: {
        top,
        width,
        title,
        center,
      },
      btnTxt,
      on: this.getDialogEvents(),
      visibleSlot: false,
    };
  },
  methods: {
    open(ok) {
      this.ok = ok;
      this.visible = true;
      this.visibleSlot = true;
    },
    cancel() {
      this.visible = false;
    },
    confirm() {
      let cancel = () => this.cancel();
      this.ok(cancel);
      this.autoClose && cancel();
    },
    beClose(done) {
      done();
      this.beforeClose();
      this.cancel();
    },
    getDialogEvents() {
      // closed: () => this.visibleSlot = false是为了防止弹窗中的内容先于弹窗消失而造成弹窗在关闭时有一个突然向上缩小的情况
      let { close } = this.config || {},
        events = { closed: () => (this.visibleSlot = false) };

      if (close && typeof close == "function") {
        Object.assign(events, {
          close,
        });
      }

      return events;
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
::v-deep .el-input-number .el-input__inner {
  text-align: left;
}
</style>
