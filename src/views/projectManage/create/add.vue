<template>
  <div>
    <el-steps :active="active" align-center>
      <el-step title="编辑项目信息"> </el-step>
      <el-step title="添加合作方"></el-step>
      <el-step title="项目设置"></el-step>
    </el-steps>
    <div v-show="active === 1">
      <el-form ref="form" :model="form" :rules="rules" style="margin-top: 6px" size="small" label-width="100px">
        <el-form-item label="项目标题" prop="title">
          <el-input v-model="form.title" style="width: 96%" />
        </el-form-item>

        <el-form-item label="项目内容"> </el-form-item>

        <div ref="editor" class="editor" />

        <el-form-item label="附件上传" prop="upload">
          <el-upload ref="upload" :before-upload="beforeUpload" :auto-upload="true" :data="uploadData"
          :on-preview="seeThisOne"
            :headers="headers" :on-success="handleSuccess" :on-error="handleError" :action="annexUploadApi">
            <div class="eladmin-upload"><i class="el-icon-upload" /> 添加文件</div>
            <div slot="tip" class="el-upload__tip">可上传任意格式文件，且不超过100M</div>
          </el-upload>
        </el-form-item>
      </el-form>
    </div>
    <div v-show="active === 2">
      <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="">
          <el-input v-model="formInline.user" placeholder="昵称"></el-input>
        </el-form-item>
        <el-form-item label="">
          <el-input v-model="formInline.user" placeholder="姓名"></el-input>
        </el-form-item>
        <el-form-item label="">
          <el-input v-model="formInline.user" placeholder="手机号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
          <el-button type="warning" @click="onSubmit">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table ref="table" @selection-change="handleSelectionChange" :data="tableData" style="width: 100%">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="userNo" label="合作方编号" />
        <el-table-column prop="username" label="名称" />
        <el-table-column prop="realName" label="真实姓名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="email" label="电子邮箱" />
      </el-table>
      <div class="block">
      
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage2"
          
          :page-size="pageSize"
          layout="total, prev, pager, next"
          :total="partnerTotal">
        </el-pagination>
      </div>
    </div>
    <div v-show="active === 3">
      <el-form ref="form2" :model="form2" :rules="rules2" style="margin-top: 6px" size="small" label-width="100px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="活动时间" prop="activeTimeFlag">
         
              <el-radio v-model="form2.activeTimeFlag" label="1">发布即开始，7天后结束</el-radio>
              <el-radio v-model="form2.activeTimeFlag" label="2">自定义</el-radio>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="" prop="activeTime" v-if="form2.activeTimeFlag === '2'">
              <el-date-picker v-model="form2.activeTime" type="daterange" range-separator="至" start-placeholder="开始日期"
                end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        
       
        <el-form-item label="通知方式" prop="noticeType">
          <el-checkbox-group v-model="form2.noticeType">
            <el-checkbox v-for="n in noticeTypeOptions" :label="n.code" :key="n.code">{{
              n.label
              }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import { add ,queryPartnerToJob} from "@/api/project";
  import { upload } from "@/utils/upload";
  import moment from "moment";
  import { mapGetters } from "vuex";
  import DateRangePicker from "@/components/DateRangePicker";
  import CRUD, { presenter, header, form, crud } from "@crud/crud";
  import { getToken } from "@/utils/auth";

  import E from "wangeditor";
  export default {
    name: "add",
    components: {
      DateRangePicker,
    },
    cruds() {
      return CRUD({ title: "文件", url: "api/files", crudMethod: { ...crudFile } });
    },


    mixins: [crud()],
    data() {
      return {
        partnerTotal:0,
        loading: false,
        pageSize:30,
        active: 1,
        selectedFileId: "",
        tableData: [],
        flieSelectedList: [],
        currentPage2: 0,
        headers: { Authorization: getToken() },
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
        multipleSelection: [],
        form: { title: "", content: "", createTime: "" },
        form2: { activeTime: [], noticeType: ["1"], activeTimeFlag: "2" },
        uploadData: {
          uploadType: "1",
        },
        formInline: {
          user: "",
          region: "",
        },
        rules: {
          title: [{ required: true, message: "标题不能为空", trigger: "blur" }],
          createTime: [{ required: true, message: "项目周期不能为空", trigger: "blur" }],
        },
        rules2: {
          activeTime: [{ required: true, message: "请选择活动日期", trigger: "blur" }],
          noticeType: [{ required: true, message: "请选择通知方式", trigger: "blur" }],
        },
      };
    },


    computed: {
      ...mapGetters(["imagesUploadApi", "annexUploadApi", 'baseApi']),
      projectStep: function () {
        return this.$store.getters.projectStep
      }
    },
    watch: {
      active: function (newVal, oldVal) {
        // TO DO
        console.log("newVal:", newVal);
        console.log("oldVal:", oldVal);
        this.$store.dispatch('project/updateStep', newVal)
      },
      projectStep: {
        handler(val) {
          this.active = val
        }
      },
    },
    mounted() {
      const _this = this;
      var editor = new E(this.$refs.editor);
      // 自定义菜单配置
      editor.customConfig.zIndex = 10;
      // 文件上传
      editor.customConfig.customUploadImg = function (files, insert) {
        // files 是 input 中选中的文件列表
        // insert 是获取图片 url 后，插入到编辑器的方法
        files.forEach(image => {
          upload(_this.imagesUploadApi, image).then(res => {
            const data = res.data
            const url = _this.baseApi + '/file/' + data.type + '/' + data.realName
            insert(url)
          })
        })
      };
      editor.customConfig.onchange = (html) => {
        this.form.content = html;
      };
      editor.create();
    },
    methods: {
      handleSizeChange(val) {
        console.log(`每页 ${val} 条`);
      },
      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
        queryPartnerToJob({
          page:this.currentPage2-1,
          size:this.pageSize
        }).then((res) => {
          console.log(res);
          this.tableData = res.content;
          this.partnerTotal=res.totalElements
        
        });
      },
      seeThisOne(file){
        console.log(file)
        const url=this.getCaption(file.url)
        
        console.log(url)
        window.open(this.baseApi+'/'+url)
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
        console.log(this.multipleSelection);
      },
      onSubmit() {
        console.log("submit!");
      },
      removeDomain(item) {
        var index = this.tos.indexOf(item);
        if (index !== -1 && this.tos.length !== 1) {
          this.tos.splice(index, 1);
        } else {
          this.$message({
            message: "请至少保留一位联系人",
            type: "warning",
          });
        }
      },
      addDomain() {
        this.tos.push({
          value: "",
          key: Date.now(),
        });
      },
      getPartner() {
        queryPartnerToJob({
          page:this.currentPage2-1,
          size:this.pageSize
        }).then((res) => {
          console.log(res);
          this.tableData = res.content;
          this.partnerTotal=res.totalElements
          this.active++;
        });
      },
      goBack() {

        this.active--
      },
      nextStep() {
        if (this.active === 1) {
          this.$refs["form"].validate((valid) => {
            this.form.tos = [];
            const that = this;
            if (valid) {
              that.getPartner();
            } else {
              return false;
            }
          });
        }
        if (this.active === 2) {
          if (this.multipleSelection.length < 1) {
            this.$message({
              message: "请选择合作伙伴！",
              type: "warning",
            });
            return;
          } else {
            this.active++;
            this.$emit("changeToSubmit");
          }
        }
      },
      sumitIsOk(target) {
        console.log(this.$refs["form2"]);
        this.$refs["form2"].validate((valid) => {
          if (valid) {
            const _data = {
              attachments: [
                {
                  projectAttachmentId: 0,
                  projectId: "string",
                  title: "string",
                  uploadTime: "2021-04-16T06:18:11.824Z",
                  url: "string",
                },
              ],
              content: this.form.content,
              endTime: "",
              noticeType: "1",
              partners: [
                {
                  partner: {
                    email: "string",
                    gender: "string",
                    password: "string",
                    phone: "string",
                    realName: "string",
                    remark: "string",
                    userType: "string",
                    username: "string",
                  },
                  projectId: 0,
                },
              ],
              startTime: "",
              status: "1",
              title: this.form.title,
            };
            // 处理文件信息
            const arr = [];
            this.flieSelectedList.forEach((item) => {
              arr.push({
                projectAttachmentId: item.response.fileId,
                title: item.name,
                uploadTime: item.uploadTime,
                url: item.response.fileUrl,
              });
            });
            _data.attachments = arr;

            // 处理活动时间
            if (this.form2.activeTimeFlag === "1") {
              const weekTime = new Date().getTime() + 3600 * 1000 * 24 * 7;
              _data.startTime = moment(new Date()).format("yyyy-MM-DD HH:mm:ss");
              _data.endTime = moment(weekTime).format("yyyy-MM-DD HH:mm:ss");
            } else {
              _data.startTime = this.form2.activeTime[0];
              _data.endTime = this.form2.activeTime[1];
            }

            // 通知类型
            _data.noticeType = this.form2.noticeType.toString();
            _data.partners = [];
            this.multipleSelection.forEach((item) => {
              _data.partners.push({
                partner: {
                  id: item.id,
                },
              });
            });
            console.log(_data);
            _data.status=target==='Go'?"2":'1'
            this.loading = true;
            add(_data)
              .then((res) => {
                this.$notify({
                  title: "新增成功",
                  type: "success",
                  duration: 2500,
                });

                this.loading = false;
                this.form = { title: "", content: "" };
                this.$emit("closeDia");
              })
              .catch((err) => {
                this.loading = false;
                console.log(err.response.data.message);
              });
          } else {
            return false;
          }
        });
      },
      beforeUpload(file) {
        let isLt2M = true;
        isLt2M = file.size / 1024 / 1024 < 100;
        if (!isLt2M) {
          this.loading = false;
          this.$message.error("上传文件大小不能超过 100MB!");
        }
        this.form.name = file.name;
        return isLt2M;
      },
      handleSuccess(response, file, fileList) {
        this.flieSelectedList = JSON.parse(JSON.stringify(fileList));
        this.flieSelectedList.forEach((d) => {
          d.uploadTime = moment(new Date()).format("yyyy-MM-DD HH:mm:ss");
        });
        this.selectedFileId = response.fileId;
        this.crud.notify("上传成功", CRUD.NOTIFICATION_TYPE.SUCCESS);
        // this.$refs.upload.clearFiles();
        // this.crud.status.add = CRUD.STATUS.NORMAL;
        // this.crud.resetForm();
        // this.crud.toQuery();
      },
      // 监听上传失败
      handleError(e, file, fileList) {
        const msg = JSON.parse(e.message);
        this.$notify({
          title: msg.message,
          type: "error",
          duration: 2500,
        });
        this.loading = false;
      },
    },
  };
</script>

<style scoped>
  .editor {
    text-align: left;
    margin: 20px;
    width: 96%;
  }

  ::v-deep .w-e-text-container {
    height: 300px !important;
  }
</style>