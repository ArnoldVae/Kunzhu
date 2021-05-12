<template>
  <div class="projectFollow">
    <h2>项目追踪</h2>
    <el-row>
      <el-col :span="18">
        <el-tabs type="border-card" v-model="tabTarget" @tab-click="test" tabPosition="left">
      
          <el-tab-pane
          
            :key="item.partner.realName"
            v-for="(item, index) in tabOptions"
            :label="item.partner.realName"
            :name="item.partner.realName"
          >
            <div class="follow_main">
              <div class="follow_item" v-for="f in followOptions" :key="f.feedbackId">
                <div class="follow_item_title">
                  <span
                    v-if="f.accessType === '2'"
                    style="color: rgb(19, 136, 247); margin-right: 20px"
                    >进度反馈</span
                  >
                  <span
                    v-if="f.accessType === '1'"
                    style="color: rgb(221, 115, 31); margin-right: 20px"
                    >跟踪询问</span
                  >
                  {{ f.content }}
                </div>
                <div class="follow_item_content">
                  {{ f.createTime }} 通过
                  <span v-if="f.noticeType.indexOf('1') > -1">邮件、</span>
                  <span v-if="f.noticeType.indexOf('2') > -1">短信、</span>
                  <span v-if="f.accessType === '1'">形式发出跟踪询问</span>
                  <span v-if="f.accessType === '2'">形式进行跟踪反馈</span>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs></el-col
      >
      <el-col :span="6">
        <div class="content_right">
          跟踪询问
          <div class="content_text">
            <el-input
              type="textarea"
              :rows="14"
              placeholder="请输入内容"
              v-model="followDetail"
            >
            </el-input>
          </div>

          <div class="content_text">
            <el-checkbox-group v-model="noticeType">
              <el-checkbox v-for="n in noticeTypeOptions" :label="n.code" :key="n.code">{{
                n.label
              }}</el-checkbox>
            </el-checkbox-group>
          </div>
          <div class="content_btn">
            <el-button type="success" @click="submitFollow">发出跟踪询问</el-button>
          </div>
          <div class="content_btn">
            <el-button type="danger" @click="confirmPartner">确认最终合作方</el-button>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getToken } from "@/utils/auth";
import CRUD, { presenter, header, form, crud } from "@crud/crud";
import { mapGetters } from "vuex";
import moment from "moment";
import { getProjectFollow, setProjectFollow, confirmPartnerSubmit } from "@/api/project";
export default {
  name: "ProjectFollow",
  components: {},

  created() {
    console.log(this.$store.getters);
    if (typeof this.$route.query.partners === "string" || !this.$route.query.partners) {
      this.$router.push({
        path: "create",
      });
    } else {
      this.projectStatus=this.$route.query.status
      this.tabOptions = this.$route.query.partners;
      this.tabTarget = this.tabOptions[0].partner.realName;
      this.selectId = this.tabOptions[0].partner.id;
      this.getProjectFollowInfo();
    }
    console.log(this.tabOptions);
  },
  cruds() {
    return CRUD({ title: "文件", url: "api/files", crudMethod: { ...crudFile } });
  },
  mixins: [crud()],
  computed: {},
  data() {
    return {
      projectStatus:"",
      tabTarget: "",
      noticeTypeOptions: [
        {
          label: "邮件通知",
          code: "1",
        },
        {
          label: "短信通知",
          code: "2",
        },
      ],

      noticeType: [],
      tabOptions: [],
      followDetail: "",
      followOptions: [],
      selectId: "",
    };
  },
  mounted() {},
  methods: {
    test(target){
      console.log(target)
      console.log(this.tabTarget)
      console.log(this.tabOptions)
      this.tabOptions.forEach(item => {
        if(item.partner.realName===this.tabTarget){
          
          this.selectId=item.partner.id
        }
      });
      this.getProjectFollowInfo()

    },
    async confirmPartnerGoSubmit() {
      const res = confirmPartnerSubmit({
        partnerId: this.selectId,
        projectId: this.$route.query.projectId,
      });
      if (res) {
        this.$message({
          type: "success",
          message: "操作成功!",
        });
        this.$router.push({
          path: "/projectManage/create/index",
          query: {},
        });
      }
    },
    confirmPartner() {
      this.$confirm("此操作将确认最终合作方，是否确认?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.confirmPartnerGoSubmit();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消操作",
          });
        });
    },
    async getProjectFollowInfo() {
      const res = await getProjectFollow({
        sort:['createTime,desc'],
        partnerId: this.selectId,
        projectId: this.$route.query.projectId,
      });
      if (res) {
        console.log(res);
        this.followOptions = res.content;
      }
    },

    async submitFollow() {
      const res = await setProjectFollow({
        content: this.followDetail,
        dataSource: "string",

        noticeType: this.noticeType.toString(),
        partnerId: this.selectId,
        projectId: this.$route.query.projectId,
      });
      this.followDetail = "";
      this.$message.success("操作成功!");
      this.getProjectFollowInfo();
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.projectFollow {
  .el-row {
    .el-col {
      padding: 16px;
    }
  }
  .el-tabs__header {
    min-width: 16%;
  }
  .follow_main {
    .follow_item {
      border-bottom: 1px dashed #ccc;
      .follow_item_title {
        height: 50px;
        line-height: 50px;
      }
      .follow_item_content {
        height: 50px;
        line-height: 50px;
        font-size: 14px;
      }
    }
  }
  .content_right {
    height: 60vh;
    background: #fff;
    width: 90%;
    margin-right: 16px;
    border: 1px solid #ccc;
    padding: 16px;
    .content_text {
      margin-top: 16px;
      margin-bottom: 16px;
    }
    .content_btn {
      text-align: center;
      margin-bottom: 20px;
      button {
        width: 70%;
      }
    }
  }
}
</style>
