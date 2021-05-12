<template>
  <div>
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      style="margin-top: 6px"
      size="small"
      label-width="100px"
    >
      <el-form-item label="项目标题" prop="title">
        <el-input v-model="form.title" style="width: 96%" />
      </el-form-item>

      <el-form-item label="项目内容"> </el-form-item>

      <div ref="editor" class="editor" />
      <el-form-item label="附件上传" prop="upload">
        <el-upload
          ref="upload"
          :before-upload="beforeUpload"
          :auto-upload="true"
          :data="uploadData"
          :headers="headers"
          :on-success="handleSuccess"
          :on-error="handleError"
          :action="annexUploadApi"
        >
          <div class="eladmin-upload"><i class="el-icon-upload" /> 添加文件</div>
          <div slot="tip" class="el-upload__tip">可上传任意格式文件，且不超过100M</div>
        </el-upload>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { add } from "@/api/projectDraft";
import { upload } from "@/utils/upload";
import { mapGetters } from "vuex";
import CRUD, { presenter, header, form, crud } from "@crud/crud";
import { getToken } from "@/utils/auth";
import moment from "moment";

import DateRangePicker from "@/components/DateRangePicker";
import E from "wangeditor";
export default {
  name: "add",
  components: {
    DateRangePicker,
  },
  data() {
    return {
      loading: false,
      form: { title: "", content: "", createTime: "" },
      flieSelectedList: [],
      uploadData: {
        uploadType: "1",
      },
      headers: { Authorization: getToken() },
      rules: {
        title: [{ required: true, message: "标题不能为空", trigger: "blur" }],
      },
    };
  },
  computed: {
    ...mapGetters(["imagesUploadApi", "annexUploadApi",'baseApi']),
  },
  cruds() {
    return CRUD({ title: "文件", url: "api/files", crudMethod: { ...crudFile } });
  },
  mixins: [crud()],

  mounted() {
    console.log(this.$store.getters);
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
    doSubmit(target) {
      const _this = this;
      console.log(this.form);

      this.$refs["form"].validate((valid) => {
        this.form.tos = [];
        console.log(this.form);
        if (valid) {
          this.loading = true;
          const _data = {
            attachments: [],
            content: this.form.content,
            status: target,
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
          add(_data)
            .then((res) => {
              this.$refs.upload.submit();
              this.$notify({
                title: "新增成功",
                type: "success",
                duration: 2500,
              });
              this.loading = false;
              this.form = { title: "", content: "", createTime: "" };
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
