<template>
  <div>
    <el-form ref="form" :model="form" :rules="rules" style="margin-top: 6px" size="small" label-width="100px">
      <el-form-item label="项目标题" prop="title">
        <el-input v-model="form.title" style="width: 96%" />
      </el-form-item>

      <el-form-item label="项目内容" />

      <div ref="editor" class="editor" />
      <el-form-item label="附件上传" prop="upload">
        <el-upload
          ref="upload"
          :before-upload="beforeUpload"
          :auto-upload="true"
          :data="uploadData"
          :headers="headers"
          :on-preview="seeThisOne"
          :on-remove="handleRemove"
          :before-remove="beforeRemove"
          :on-success="handleSuccess"
          :file-list="fileList"
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
import { edit } from '@/api/projectDraft'
import { delFiles } from '@/api/project'
import { upload } from '@/utils/upload'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import moment from 'moment'

import DateRangePicker from '@/components/DateRangePicker'
import E from 'wangeditor'
export default {
  name: 'Add',
  components: {
    DateRangePicker
  },
  props: {
    selectItem: {
      type: [Object]
    }
  },
  data() {
    return {
      loading: false,
      selectRow: {},
      headers: { Authorization: getToken() },
      fileList: [],
      flieSelectedList: [],
      uploadData: {
        uploadType: '1'
      },
      form: { title: '', content: '', createTime: '' },
      rules: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters(['imagesUploadApi', 'annexUploadApi', 'baseApi'])
  },
  mounted() {
    const _this = this
    var editor = new E(this.$refs.editor)
    // 自定义菜单配置
    editor.customConfig.zIndex = 10
    // 文件上传
    editor.customConfig.customUploadImg = function(files, insert) {
      // files 是 input 中选中的文件列表
      // insert 是获取图片 url 后，插入到编辑器的方法
      files.forEach(image => {
        upload(_this.imagesUploadApi, image).then(res => {
          const data = res.data
          const url = _this.baseApi + '/file/' + data.type + '/' + data.realName
          insert(url)
        })
      })
    }
    editor.customConfig.onchange = (html) => {
      this.form.content = html
    }
    editor.create()
  },
  methods: {
    seeThisOne(file) {
      console.log(file)
      const url = this.getCaption(file.url)

      console.log(url)
      window.open(this.baseApi + '/' + url)
    },
    removeDomain(item) {
      var index = this.tos.indexOf(item)
      if (index !== -1 && this.tos.length !== 1) {
        this.tos.splice(index, 1)
      } else {
        this.$message({
          message: '请至少保留一位联系人',
          type: 'warning'
        })
      }
    },
    addDomain() {
      this.tos.push({
        value: '',
        key: Date.now()
      })
    },
    initPage(item) {
      // this.form = item;
      const _this = this
      this.selectRow = item
      this.form.title = item.title
      this.form.content = item.content
      this.fileList = item.attachments
      var editor = new E(this.$refs.editor)
      editor.customConfig.zIndex = 10
      // 文件上传
      editor.customConfig.customUploadImg = function(files, insert) {
        // files 是 input 中选中的文件列表
        // insert 是获取图片 url 后，插入到编辑器的方法
        files.forEach(image => {
          upload(_this.imagesUploadApi, image).then(res => {
            const data = res.data
            const url = _this.baseApi + '/file/' + data.type + '/' + data.realName
            insert(url)
          })
        })
      }
      editor.customConfig.onchange = (html) => {
        this.form.content = html
      }
      editor.create()
      editor.txt.html(item.content)
    },
    doSubmit(target) {
      this.$refs['form'].validate((valid) => {
        this.form.tos = []
        if (valid) {
          this.loading = true
          const _data = {
            attachments: [],
            content: this.form.content,
            status: target,
            draftId: this.selectRow.draftId,
            title: this.form.title
          }
          // 处理文件信息
          const arr = []
          this.flieSelectedList.forEach((item) => {
            if (item.response) {
              arr.push({
                projectAttachmentId: item.response.fileId,
                title: item.name,
                uploadTime: item.uploadTime,
                url: item.response.fileUrl
              })
            } else {
              arr.push({
                projectAttachmentId: item.projectAttachmentId,
                title: item.name,
                uploadTime: item.uploadTime,
                projectId: this.selectRow.draftId,
                url: item.url
              })
            }
          })
          _data.attachments = arr

          edit(_data)
            .then((res) => {
              this.$notify({
                title: '修改成功',
                type: 'success',
                duration: 2500
              })
              this.loading = false;
              (this.form = { title: '', content: '', createTime: '' }),
              this.$emit('closeDia')
            })
            .catch((err) => {
              this.loading = false
              console.log(err.response.data.message)
            })
        } else {
          return false
        }
      })
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
      // projectAttachmentId
      delFiles({
        'deleteType': 0,
        'ids': [
          file.projectAttachmentId
        ]
      }).then(res => {
        console.log(res)
      })
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    beforeUpload(file) {
      let isLt2M = true
      isLt2M = file.size / 1024 / 1024 < 100
      if (!isLt2M) {
        this.loading = false
        this.$message.error('上传文件大小不能超过 100MB!')
      }
      this.form.name = file.name
      return isLt2M
    },
    handleSuccess(response, file, fileList) {
      this.flieSelectedList = JSON.parse(JSON.stringify(fileList))
      this.flieSelectedList.forEach((d) => {
        d.uploadTime = moment(new Date()).format('yyyy-MM-DD HH:mm:ss')
      })
      this.selectedFileId = response.fileId
      // this.crud.notify("上传成功", CRUD.NOTIFICATION_TYPE.SUCCESS);
      // this.$refs.upload.clearFiles();
      // this.crud.status.add = CRUD.STATUS.NORMAL;
      // this.crud.resetForm();
      // this.crud.toQuery();
      console.log(this.fileList)
    },
    // 监听上传失败
    handleError(e, file, fileList) {
      const msg = JSON.parse(e.message)
      this.$notify({
        title: msg.message,
        type: 'error',
        duration: 2500
      })
      this.loading = false
    }
  }
}
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
