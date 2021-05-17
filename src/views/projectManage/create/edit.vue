<template>
  <div>
    <el-steps :active="active" align-center>
      <el-step title="编辑项目信息" />
      <el-step title="添加合作方" />
      <el-step title="项目设置" />
    </el-steps>
    <div v-show="active === 1">
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
            :on-preview="seeThisOne"
            :headers="headers"
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
    <div v-show="active === 2">
      <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="">
          <el-input v-model="formInline.user" placeholder="昵称" />
        </el-form-item>
        <el-form-item label="">
          <el-input v-model="formInline.user" placeholder="姓名" />
        </el-form-item>
        <el-form-item label="">
          <el-input v-model="formInline.user" placeholder="手机号" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
          <el-button type="warning" @click="onSubmit">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table ref="table" :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="userNo" label="合作方编号" />
        <el-table-column prop="username" label="名称" />
        <el-table-column prop="realName" label="真实姓名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="email" label="电子邮箱" />
      </el-table>
      <div class="block">

        <el-pagination
          :current-page.sync="currentPage2"
          :page-size="pageSize"
          layout="total, prev, pager, next"

          :total="partnerTotal"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <div v-show="active === 3">
      <el-form ref="form2" :model="form2" :rules="rules2" style="margin-top: 6px" size="small" label-width="100px">
        <el-row>
          <el-col :span="7">
            <el-form-item label="活动时间" prop="activeTimeFlag">

              <el-radio v-model="form2.activeTimeFlag" label="1">发布即开始，7天后结束</el-radio>
              <el-radio v-model="form2.activeTimeFlag" label="2">自定义</el-radio>
            </el-form-item>
          </el-col>
          <el-col :span="12" class="dateAli">

            <el-form-item v-if="form2.activeTimeFlag === '2'" label="日期范围" prop="activeTime">
              <el-date-picker
                v-model="form2.activeTime"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="通知方式" prop="noticeType">
          <el-checkbox-group v-model="form2.noticeType">
            <el-checkbox v-for="n in noticeTypeOptions" :key="n.code" :label="n.code">{{
              n.label
            }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { edit, delFiles, queryPartnerToJob } from '@/api/project'
import { upload } from '@/utils/upload'
import { getPartnerList } from '@/api/partner'
import moment from 'moment'
import { mapGetters } from 'vuex'
import DateRangePicker from '@/components/DateRangePicker'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import { getToken } from '@/utils/auth'

import E from 'wangeditor'
export default {
  name: 'Edit',
  components: {
    DateRangePicker
  },
  cruds() {
    return CRUD({ title: '文件', url: 'api/files', crudMethod: { ...crudFile }})
  },
  mixins: [crud()],
  data() {
    return {
      pageSize: 30,
      currentPage2: 0,
      partnerTotal: 0,
      loading: false,
      active: 1,
      flieSelectedList: [],
      selectedFileId: '',
      tableData: [],

      headers: { Authorization: getToken() },
      noticeTypeOptions: [
        {
          label: '邮件通知',
          code: '1'
        },
        {
          label: '短信通知',
          code: '2'
        }
      ],
      multipleSelection: [],
      form: { title: '', content: '', createTime: '' },
      form2: { activeTime: [], noticeType: ['1'], activeTimeFlag: '2' },
      fileList: [],
      projectId: '',
      uploadData: {
        uploadType: '1'
      },
      formInline: {
        user: '',
        region: ''
      },
      rules: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        createTime: [{ required: true, message: '项目周期不能为空', trigger: 'blur' }]
      },
      rules2: {
        activeTime: [{ required: true, message: '请选择活动日期', trigger: 'blur' }],
        noticeType: [{ required: true, message: '请选择通知方式', trigger: 'blur' }]
      }
    }
  },

  computed: {
    ...mapGetters(['imagesUploadApi', 'annexUploadApi', 'baseApi']),
    projectStep: function() {
      return this.$store.getters.projectStep
    }
  },
  watch: {
    active: function(newVal, oldVal) {
      // TO DO
      console.log('newVal:', newVal)
      console.log('oldVal:', oldVal)
      this.$store.dispatch('project/updateStep', newVal)
    },
    projectStep: {
      handler(val) {
        this.active = val
      }
    }
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
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      queryPartnerToJob({
        page: this.currentPage2 - 1,
        size: this.pageSize
      }).then((res) => {
        console.log(res)
        this.tableData = res.content
        this.partnerTotal = res.totalElements
      })
    },
    seeThisOne(file) {
      console.log(file)
      const url = this.getCaption(file.url)

      console.log(url)
      window.open(this.baseApi + '/' + url)
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
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
    initEditPage(item) {
      this.flieSelectedList = []
      this.active = 1
      const _this = this
      this.form.title = item.title
      this.fileList = item.attachments
      this.selectdRow = item
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
      this.form2.activeTime = []
      this.form2.noticeType = []
      // 第三步
      this.form2.activeTimeFlag = '2'
      if (item.startTime && item.endTime) {
        this.form2.activeTime = [item.startTime, item.endTime]
      }

      this.form2.noticeType = item.noticeType.split('')
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      console.log(this.multipleSelection)
    },
    onSubmit() {
      console.log('submit!')
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
    // 默认选中
    selectedToTable() {
      this.selectdRow.partners.forEach((item) => {
        console.log(item.partner)
        this.tableData.forEach((i) => {
          if (item.partner.id === i.id) {
            this.$refs.table.toggleRowSelection(i)
          }
        })
      })
    },
    getPartner() {
      queryPartnerToJob({
        page: this.currentPage2 - 1,
        size: this.pageSize
      }).then((res) => {
        console.log(res)
        this.tableData = res.content
        this.partnerTotal = res.totalElements
        this.active++
        setTimeout(() => {
          this.selectedToTable()
        })
      })
    },
    goBack() {
      this.active--
    },
    nextStep() {
      if (this.active === 1) {
        this.$refs['form'].validate((valid) => {
          this.form.tos = []
          const that = this
          if (valid) {
            that.getPartner()
          } else {
            return false
          }
        })
      }
      if (this.active === 2) {
        if (this.multipleSelection.length < 1) {
          this.$message({
            message: '请选择合作伙伴！',
            type: 'warning'
          })
          return
        } else {
          this.active++
          this.$emit('changeToModifySubmit')
        }
      }
    },
    sumitIsOk(target) {
      console.log(this.$refs['form2'])
      this.$refs['form2'].validate((valid) => {
        if (valid) {
          const _data = {
            attachments: [
              {
                projectAttachmentId: 0,
                projectId: 'string',
                title: 'string',
                uploadTime: '2021-04-16T06:18:11.824Z',
                url: 'string'
              }
            ],
            content: this.form.content,
            endTime: '',
            noticeType: '1',
            partners: [
              {
                partner: {
                  email: 'string',
                  gender: 'string',
                  password: 'string',
                  phone: 'string',
                  realName: 'string',
                  remark: 'string',
                  userType: 'string',
                  username: 'string'
                },
                projectId: 0
              }
            ],
            startTime: '',
            status: '1',
            title: this.form.title
          }
          console.log(this.fileList)
          // 处理文件信息
          const arr = []
          this.flieSelectedList.forEach((item) => {
            if (item.response) {
              arr.push({
                projectAttachmentId: item.response.fileId,
                title: item.name,
                uploadTime: item.uploadTime,
                url: item.response.fileUrl,
                projectId: this.selectdRow.projectId
              })
            } else {
              arr.push({
                projectAttachmentId: item.projectAttachmentId,
                title: item.name,
                uploadTime: item.uploadTime,
                projectId: this.selectdRow.projectId,
                url: item.url
              })
            }
          })
          _data.attachments = arr

          // 处理活动时间
          if (this.form2.activeTimeFlag === '1') {
            const weekTime = new Date().getTime() + 3600 * 1000 * 24 * 7
            _data.startTime = moment(new Date()).format('yyyy-MM-DD HH:mm:ss')
            _data.endTime = moment(weekTime).format('yyyy-MM-DD HH:mm:ss')
          } else {
            _data.startTime = this.form2.activeTime[0]
            _data.endTime = this.form2.activeTime[1]
          }

          // 通知类型
          _data.noticeType = this.form2.noticeType.toString()
          _data.partners = []
          this.multipleSelection.forEach((item) => {
            _data.partners.push({
              partner: {
                id: item.id,
                projectId: this.selectdRow.projectId
              }
            })
          })
          _data.content = this.form.content || this.selectdRow.content
          _data.projectId = this.selectdRow.projectId
          console.log(_data)
          _data.status = target === 'Go' ? '2' : this.selectdRow.status
          this.loading = true
          edit(_data)
            .then((res) => {
              this.active = 2
              this.$notify({
                title: '修改成功',
                type: 'success',
                duration: 2500
              })

              this.$emit('closeMoodifyDia')
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
      this.crud.notify('上传成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
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
  .dateAli{
    margin: 0;
    .el-form-item__content{
      margin: ;
    }
  }
</style>
