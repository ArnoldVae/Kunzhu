<template>
  <div class="detail_main">
    <div class="title">
      <span style="font-size: 24px">{{ projectInfo.title }}</span>
      <span style="float: right; margin-right: 20px; font-size: 16px">
        <span style="margin-right: 20px">提交人:{{ projectInfo.createBy }}</span>
        <span>提交时间:{{ projectInfo.createTime }}</span>
      </span>
    </div>
    <hr style="border: 0.5px solid #ccc; width: 96%" />
    <div class="content">
      <p v-html="projectInfo.content"></p>
    </div>
    <hr style="border: 0.5px solid #ccc; width: 96%" />
    <div class="flooter">
      <span style="font-size: 16px">相关附件：</span>
      <span
        style="margin: 16px;color:rgb(24, 144, 255); cursor: pointer;"
        @click="showThisOne(a)"
        v-for="a in projectInfo.attachments"
        :key="a.projectAttachmentId"
      >
        {{ a.title }}</span
      >
    </div>
  </div>
</template>

<script>
    import { mapGetters } from "vuex";
export default {
  name: "detail",
  components: {},

  data() {
    return {
      projectInfo: {},
    };
  },

  computed: {
    ...mapGetters([ 'baseApi']),
  },
  mounted() {},
  methods: {
    showThisOne(file){
      const url=this.getCaption(file.url)
        
        console.log(url)
        window.open(this.baseApi+'/'+url)
    },
    initEditPage(item) {
      this.projectInfo = item;
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.detail_main {
  border: 1px solid #ccc;
  .title {
    height: 45px;
    margin-left: 20px;
    line-height: 45px;
  }
  .content {
    padding: 16px;
    min-height: 300px;
  }
  .flooter {
    padding: 20px;
  }
}
::v-deep .w-e-text-container {
  height: 360px !important;
}
</style>
