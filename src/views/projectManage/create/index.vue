<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.title" clearable placeholder="标题" style="width: 200px" class="filter-item"
          @keyup.enter.native="crud.toQuery" />
        <el-input v-model="query.createBy" clearable placeholder="创建人" style="width: 200px" class="filter-item"
          @keyup.enter.native="crud.toQuery" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--新增组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU"
      :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="80%">
      <Add ref="send" @changeToSubmit="changeToSubmit" @closeDia="closeDia" />
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="closeDia">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="goLast" v-if="projectStep===2||projectStep===3">上一步</el-button>
        <el-button :loading="crud.status.cu === 2"  v-if="projectStep===1||projectStep===2" type="primary" @click="testConnectServer">下一步
        </el-button>
        <el-button :loading="crud.status.cu === 2" v-if="projectStep===3" type="primary" @click="submitNewProject('save')">保存
        </el-button>
        <el-button :loading="crud.status.cu === 2" v-if="projectStep===3" type="success" @click="submitNewProject('Go')">保存并发布
        </el-button>
      </div>
    </el-dialog>
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="closeModify" :visible.sync="modifyFlag"
      title="项目修改" width="80%">
      <Edit ref="edit" @changeToModifySubmit="changeToModifySubmit" :selectItem="selectItem"
        @closeMoodifyDia="closeMoodifyDia" />
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="closeMoodifyDia">取消</el-button>


        <el-button :loading="crud.status.cu === 2" type="primary" @click="goModifyLast" v-if="projectStep===2||projectStep===3">上一步</el-button>
        <el-button :loading="crud.status.cu === 2"  v-if="projectStep===1||projectStep===2" type="primary" @click="modifyNextStep">下一步
        </el-button>

        <el-button :loading="crud.status.cu === 2" v-if="projectStep===3" type="primary" @click="submitModifyProject('save')">保存
        </el-button>
        <el-button :loading="crud.status.cu === 2" v-if="projectStep===3" type="success" @click="submitModifyProject('Go')">保存并发布
        </el-button>
      </div>
    </el-dialog>
    <!--表格渲染-->
    <div class="query_content">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="全部活动" name=""></el-tab-pane>
        <el-tab-pane label="待发布" name="1"></el-tab-pane>
        <el-tab-pane label="已发布" name="3"></el-tab-pane>
        <el-tab-pane label="待跟踪" name="2"></el-tab-pane>
      
        <el-tab-pane label="已结束" name="4"></el-tab-pane>
      </el-tabs>
      <div class="query_content_item" v-for="(d, index) in crud.data" :key="index">
        <el-tag v-if="d.status === '0'" type="info">待提交</el-tag>
        <el-tag v-if="d.status === '1'">待发布</el-tag>
        <el-tag v-if="d.status === '2'" type="success">待申请</el-tag>
        <el-tag v-if="d.status === '3'" type="warning">跟踪中</el-tag>
        <el-tag v-if="d.status === '4'" type="danger">已结束</el-tag>

        <span class="query_content_title">{{ d.title }}</span>
        <div class="query_content_item_content">
          <div class="query_content_item_content_item left">
            <el-row>
              <el-col :span="7">总阅览次数：{{ d.readCount }}次</el-col>
              <el-col :span="7">已阅览人数：{{ d.readUserCount }}人</el-col>
              <el-col :span="7">未阅览次数：{{ d.unreadUserCount }}人</el-col>
              <el-col :span="3" class="point"><span @click="goRecord(d)">▶</span></el-col>
            </el-row>
            <el-row>
              <el-col :span="7">已提问题：{{ d.questionCount }}个</el-col>
              <el-col :span="7">已提问题：{{ d.questionUserCount }}人</el-col>
              <el-col :span="7">未解答问题：{{ d.noAnswerCount }}个</el-col>
              <el-col :span="3" class="point"><span @click="goAnser(d)">▶</span> </el-col>
            </el-row>
          </div>
          <div class="query_content_item_content_item center">
            <div class="single_partner" v-for="p in d.partners" :key="p.partner.id" @click="goProFollow(d)">
              {{ p.partner.realName }}【{{ p.feedbackCount }}】
            </div>
          </div>
          <div class="query_content_item_content_item right">
            <el-popover placement="right" width="400" trigger="click">
              <ul class="item_ul">
                <li @click="goProjectHide(d)"><span>隐藏申请</span></li>
                <li @click="goProjectCloseApply(d)"><span>结束申请</span></li>
                <li @click="modifyProject(d)"><span>修改项目</span></li>
                <li @click="removePro(d)"><span>删除项目</span></li>
              </ul>
              <el-button slot="reference">管理项目</el-button>
            </el-popover>
            <el-button @click="showDetail(d)">查看原始</el-button>
          </div>
        </div>
      </div>
    </div>

    <!--分页组件-->
    <pagination />
    <el-dialog title="项目详情" :visible.sync="detailVisible" width="60%">
      <ProjectDetail ref="detail"></ProjectDetail>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">取 消</el-button>
        <el-button type="primary" @click="detailVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import crudServer from "@/api/project";
  import { validateIP } from "@/utils/validate";
  import CRUD, { presenter, header, form, crud } from "@crud/crud";
  import rrOperation from "@crud/RR.operation";
  import crudOperation from "@crud/PROJECT.operation";
  import pagination from "@crud/Pagination";
  import DateRangePicker from "@/components/DateRangePicker";
  import { getProDetail, del, setHideOrShow, ToCloseApply } from "@/api/project";
  import ProjectDetail from "@/views/common/projectDetail.vue";
  import Add from "./add";
  import Edit from "./edit";
  const defaultForm = {
    projectId: null,
    name: null,
    port: 22,
    account: "root",
    password: null,
  };
  export default {
    name: "Server",
    components: {
      pagination,
      crudOperation,
      rrOperation,
      DateRangePicker,
      Add,
      Edit,
      ProjectDetail,
    },
    cruds() {
      return CRUD({
        title: "项目",
        url: "api/projectInfo",
        crudMethod: { ...crudServer },
        sort: ["project_id,desc"],
        params: {
          test: 1,
        },
      });
    },
    mixins: [presenter(), header(), form(defaultForm), crud()],

    data() {
      return {
        accountList: [],
        accountMap: {},
        loading: false,
        modifyFlag: false,
        showModifySubmitFlag: false,
        detailVisible: false,
        showSubmitFlag: false,
        activeName: "",
        selectItem: null,
        permission: {
          add: ["admin", "projectInfo:add"],
          edit: ["admin", "projectInfo:edit"],
          del: ["admin", "projectInfo:del"],
        },
        rules: {
          name: [{ required: true, message: "请输入名称", trigger: "blur" }],
          ip: [
            { required: true, message: "请输入IP", trigger: "blur" },
            { validator: validateIP, trigger: "change" },
          ],
          port: [
            { required: true, message: "请输入端口", trigger: "blur", type: "number" },
          ],
          account: [{ required: true, message: "请输入账号", trigger: "blur" }],
          password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        },
      };
    },
    computed: {
      projectStep: function () {
        return this.$store.getters.projectStep
      }
    },
    watch: {
      projectStep: {
        handler(val) {
          console.log(val + 'zhege');
        }
      },
    },
    methods: {
      // 跳转去
      goProFollow(item) {
        debugger
        this.$router.push({
          path: "/follow",
          query: item,
        });
      },
      // 查看原始
      async showDetail(item) {
        console.log(item);
        const that = this;
        const res = await getProDetail({
          projectId: item.projectId,
        });

        console.log(res);
        if (res) {
          this.detailVisible = true;
          setTimeout(() => {
            that.$refs["detail"].initEditPage(res);
          }, 100);
        }
      },
      async goRemovePro(item) {
        const res = await del([item.projectId]);
        this.$message({
          type: "success",
          message: "删除成功!",
        });
        this.crud.toQuery();
      },
      async goHideBa(item) {
        const res = await setHideOrShow(item.projectId);
        this.$message({
          type: "success",
          message: "隐藏成功!",
        });
        this.crud.toQuery();
      },
      // 项目删除
      removePro(item) {
        this.$confirm("确定删除这个项目?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            this.goRemovePro(item);
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除",
            });
          });
      },
      async goCloseProApply(item) {
        const res = await ToCloseApply(item.projectId);
        this.$message({
          type: "success",
          message: "操作成功!",
        });
        this.crud.toQuery();
      },
      // 项目结束申请
      goProjectCloseApply(item) {
        this.$confirm("确定结束申请这个项目?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            this.goCloseProApply(item);
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消操作",
            });
          });
      },
      // 项目隐藏
      goProjectHide(item) {
        this.$confirm("确定隐藏这个项目?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            this.goHideBa(item);
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消操作",
            });
          });
      },
      // 项目修改
      async modifyProject(item) {
        console.log(item);
        const that = this;
        this.$store.dispatch('project/updateStep', 1)
        const res = await getProDetail({
          projectId: item.projectId,
        });
        console.log(res);
        if (res) {
          if (res.attachments.length > 0) {
            res.attachments.forEach((f) => {
              f.name = f.title;
            });
          }
          this.modifyFlag = true;
          setTimeout(() => {
            that.$refs["edit"].initEditPage(res);
          });
        }
      },

      changeToSubmit() {
        this.showSubmitFlag = true;
      },
      changeToModifySubmit() {
        this.showModifySubmitFlag = true;
      },

      goAnser(item) {
        this.$router.push({
          path: "/projectManage/answer",
          query: {
            projectInfo: item,
          },
        });
      },
      goRecord(item) {
        this.$router.push({
          path: "/projectRecord/index",
          query: {
            projectId: item.projectId,
          },
        });
      },
      handleClick(tab, event) {
        console.log(tab, event);
        this.crud.params.status = this.activeName==='0'?'':this.activeName;
        this.crud.toQuery()
        console.log(this.activeName)
      },
      goLast(){
        this.$refs["send"].goBack();
      },
      goModifyLast(){
        this.$refs["edit"].goBack();
      },
      testConnectServer() {
        this.$refs["send"].nextStep();
      },
      modifyNextStep() {
        this.$refs["edit"].nextStep();
      },
      submitNewProject(target) {
        this.$refs["send"].sumitIsOk(target);
      },
      submitModifyProject(target) {
        this.$refs["edit"].sumitIsOk(target);
      },
      editSubmit() {
        this.$refs["edit"].doSubmit();
      },
      closeDia() {
        this.crud.cancelCU();
        this.crud.toQuery();
      },
      closeModify() {
        this.modifyFlag = false;
      },
      closeMoodifyDia() {
        this.modifyFlag = false;
      },
      editItem(item) {
        this.modifyFlag = true;
        const _this = this;
        this.showModifySubmitFlag = false;
        setTimeout(() => {
          _this.$refs["edit"].initPage(item);
        }, 100);
      },
    },
    mounted() {
      console.log(this.$store);
    },
  };
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  ::v-deep .el-input-number .el-input__inner {
    text-align: left;
  }

  .item_ul {
    list-style-type: none;
    text-align: center;
    margin: 0;
    padding: 0;

    li {
      cursor: pointer;
      height: 40px;
      line-height: 40px;
    }

    li:hover {
      height: 40px;
      line-height: 40px;
      background: #f0ebeb;
    }
  }

  .point {
    cursor: pointer;
  }

  .query_content_item {
    height: 160px;
    border: 1px solid #ccc;
    padding: 10px;
    background: #e8e4e4;

    .query_content_title {
      font-size: 14px;
    }

    .query_content_item_content {
      font-size: 14px;
      margin-top: 4px;
      height: 100px;
      width: 100%;
      background: #fff;
      padding: 10px;

      .query_content_item_content_item {
        padding: 16px;
        height: 100%;
        float: left;
        width: 45%;
        margin-right: 10px;
        background: #f0ebeb;

        .el-row {
          margin-bottom: 10px;
        }
      }

      .left {
        width: 45%;
      }

      .center {
        width: 30%;

        .single_partner {
          padding: 4px 8px;
          background: #fff;
          float: left;
          border: 1px solid #ccc;
          border-radius: 3px;
          margin: 0 16px;
          cursor: pointer;
        }
      }

      .right {
        width: 18%;
      }
    }
  }
</style>