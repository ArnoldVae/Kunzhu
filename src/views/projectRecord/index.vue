<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input
          v-model="query.id"
          clearable
          placeholder="输入合作方名称"
          style="width: 200px"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <date-range-picker v-model="query.createTime" class="date-item" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->

    <!--表格渲染-->
    <el-row>
      <el-col :span="16">
        <el-table
          ref="table"
          @row-click="showRecordDetail"
          v-loading="crud.loading"
          :data="crud.data"
          style="width: 100%"
          @selection-change="crud.selectionChangeHandler"
        >
          <el-table-column prop="userNo" label="合作方编号" />
          <el-table-column prop="realName" label="姓名" />
          <el-table-column prop="phone" label="手机号" />
          <el-table-column prop="readCount" label="访问次数" />

          <el-table-column
            v-if="checkPer(['admin', 'serverDeploy:edit', 'serverDeploy:del'])"
            label="操作"
            width="200px"
            align="center"
          >
          </el-table-column>
        </el-table>
        <!--分页组件-->
        <pagination />
      </el-col>
      <el-col :span="8">
        <ProjectRecordDetail></ProjectRecordDetail>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import crudServer from "@/api/projectRecord";
import ProjectRecordDetail from "./projectRecordDetail";

import CRUD, { presenter, header, form, crud } from "@crud/crud";
import rrOperation from "@crud/RR.operation";
import crudOperation from "@crud/CRUD.operation";
import udOperation from "@crud/UD.operation";
import pagination from "@crud/Pagination";
import DateRangePicker from "@/components/DateRangePicker";
const defaultForm = {
  username: null,
  realName: null,
  email: null,
  phone: null,
  gender: null,
};
export default {
  name: "Server",
  components: {
    pagination,
    crudOperation,
    rrOperation,
    udOperation,
    DateRangePicker,
    ProjectRecordDetail,
  },
  cruds() {
    return CRUD({
      title: "访问记录",
      url: "api/projectAccessRecord/statistics",
      optShow: {
        add: false,
        edit: false,
        del: false,
        download: true,
        reset: true,
      },
      sort: [""],
      queryOnPresenterCreated: false,
      params: {},
      crudMethod: { ...crudServer },
    });
  },
  created() {
    this.crud.params.projectId = this.$route.query.projectId;
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  mounted() {
    console.log(this.crud);
    this.crud.toQuery();
  },
  data() {
    return {
      accountList: [],
      accountMap: {},
      loading: false,
      genderOptions: [
        {
          value: "1",
          label: "男",
        },
        {
          value: "2",
          label: "女",
        },
      ],
      permission: {},
      rules: {
        username: [{ required: true, message: "请输入名称", trigger: "blur" }],
        realName: [{ required: true, message: "请输入真实姓名", trigger: "blur" }],
        phone: [{ required: true, message: "请输入手机号", trigger: "blur" }],
        email: [{ required: true, message: "请输入邮箱", trigger: "blur" }],
        password: [{ required: true, message: "请输选择性别", trigger: "blur" }],
        currentType: [{ required: true, message: "请选择", trigger: "blur" }],
        gender: [{ required: true, message: "请选择", trigger: "blur" }],
      },
    };
  },
  methods: {
    showRecordDetail(row) {
      console.log(row);
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
::v-deep .el-input-number .el-input__inner {
  text-align: left;
}
</style>
