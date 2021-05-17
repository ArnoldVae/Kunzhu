<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input
          v-model="query.title"
          clearable
          placeholder="标题"
          style="width: 200px"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <el-input
          v-model="query.createBy"
          clearable
          placeholder="创建人"
          style="width: 200px"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog
      append-to-body
      :close-on-click-modal="false"
      :before-close="crud.cancelCU"
      :visible.sync="crud.status.cu > 0"
      :title="crud.status.title"
      width="80%"
    >
      <Send ref="send" @closeDia="closeDia" />
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="closeDia">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="testConnectServer('0')">确认</el-button>
        <el-button :loading="crud.status.cu === 2" type="success" @click="testConnectServer('1')">转发</el-button>
      </div>
    </el-dialog>
    <el-dialog
      append-to-body
      :close-on-click-modal="false"
      :before-close="closeModify"
      :visible.sync="modifyFlag"
      title="项目修改"
      width="80%"
    >
      <Edit ref="edit" :select-item="selectItem" @closeDia="closeModify" />
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="closeModify">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="editSubmit('0')">确认</el-button>
        <el-button :loading="crud.status.cu === 2" type="success" @click="editSubmit('1')">转发</el-button>
      </div>
    </el-dialog>
    <!--表格渲染-->
    <el-table
      ref="table"
      v-loading="crud.loading"
      :data="crud.data"
      style="width: 100%"
      @selection-change="crud.selectionChangeHandler"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="projectNo" label="项目编号" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="status" label="状态">
        <template slot-scope="scope">
          <span v-if="scope.row.status === '0'">未提交</span>
          <span v-if="scope.row.status === '1'">待审核</span>
          <span v-if="scope.row.status === '2'">已发布</span>
          <span v-if="scope.row.status === '3'">跟踪中</span>
          <span v-if="scope.row.status === '4'">已结束</span>
          <!-- <span v-if="scope.row.status === '0'">未转发</span>
          <span v-else>已转发</span> -->
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column prop="createBy" label="创建人" />
      <el-table-column label="操作" width="200px" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-view" circle @click="showDetail(scope.row)" />
          <el-button
            v-if="scope.row.status === '0'"
            type="primary"
            size="mini"
            icon="el-icon-edit"
            circle
            @click="editItem(scope.row)"
          />
          <el-button v-if="scope.row.status === '0'" size="mini" style="float: right" @click="submitProject(scope.row)">
            转发</el-button>
          <upOperaation
            v-if="scope.row.status === '0'"
            style="float: right; margin-left: 3px"
            :data="scope.row"
            :permission="permission"
          />

        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
    <el-dialog title="项目详情" :visible.sync="detailVisible" width="60%">
      <ProjectDetail ref="detail" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">取 消</el-button>
        <el-button type="primary" @click="detailVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import crudServer from '@/api/projectDraft'
import { validateIP } from '@/utils/validate'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/PROJECT.operation'
import upOperaation from '@crud/PR.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker'
import ProjectDetail from '@/views/common/projectDetail.vue'
import { getProDetail, submitThisProject } from '@/api/projectDraft'
import Send from './send'
import Edit from './edit'
console.log(crudServer)
const defaultForm = {
  id: null,
  name: null,
  ip: null,
  port: 22,
  account: 'root',
  password: null
}
export default {
  name: 'Server',
  components: {
    pagination,
    ProjectDetail,
    crudOperation,
    rrOperation,
    DateRangePicker,
    upOperaation,
    Send,
    Edit
  },
  cruds() {
    return CRUD({
      title: '项目',
      url: 'api/projectDraft',
      crudMethod: { ...crudServer },
      sort: ['create_time,desc'],
      idField: 'draftId'
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],

  data() {
    return {
      accountList: [],
      accountMap: {},
      loading: false,
      modifyFlag: false,
      detailVisible: false,
      selectItem: null,
      permission: {
        add: ['admin', 'projectDraft:add'],
        edit: ['admin', 'projectDraft:edit'],
        del: ['admin', 'projectDraft:del']
      },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        ip: [
          { required: true, message: '请输入IP', trigger: 'blur' },
          { validator: validateIP, trigger: 'change' }
        ],
        port: [
          { required: true, message: '请输入端口', trigger: 'blur', type: 'number' }
        ],
        account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  computed: {
    isNew: function() {
      return this.crud.status.cu
    }
  },
  filters: {},
  watch: {
    isNew: {
      handler(val) {
        if (val) {
          this.$refs.send.initPage()
        }
      }
    }

  },
  mounted() {
    console.log(this.crud)
  },
  methods: {
    // 查看原始
    async showDetail(item) {
      console.log(item)
      const that = this
      const res = await getProDetail({
        draftId: item.draftId
      })

      console.log(res)
      if (res) {
        this.detailVisible = true
        setTimeout(() => {
          that.$refs['detail'].initEditPage(res)
        }, 100)
      }
    },
    async goProjectSubmit(id) {
      const res = await submitThisProject(id[0])
      this.$message({
        type: 'success',
        message: '提交成功!'
      })
      this.crud.sort = ['update_time,desc']

      this.crud.toQuery()
    },
    // 项目提交
    submitProject(item) {
      this.$confirm('提交这个项目, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.goProjectSubmit([item.draftId])
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作'
          })
        })
    },
    testConnectServer(target) {
      this.$refs['send'].doSubmit(target)
    },
    editSubmit(target) {
      this.$refs['edit'].doSubmit(target)
    },
    closeDia() {
      this.crud.cancelCU()
      this.crud.toQuery()
    },
    closeModify() {
      this.modifyFlag = false
    },
    async editItem(item) {
      const res = await getProDetail({
        draftId: item.draftId
      })

      console.log(res)
      if (res) {
        if (res.attachments.length > 0) {
          res.attachments.forEach((f) => {
            f.name = f.title
          })
        }
        this.modifyFlag = true
        setTimeout(() => {
          this.$refs['edit'].initPage(res)
        }, 100)
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  ::v-deep .el-input-number .el-input__inner {
    text-align: left;
  }
</style>
