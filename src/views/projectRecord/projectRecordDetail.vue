<template>
  <div class="app-container">
    <ul>
      <li v-for="r in crud.data" :key="r.accessRecordId">
        {{ r.createTime }} {{ r.partnerName }} 通过 {{ r.dataSource }}进入系统
      </li>
    </ul>
    <!--表格渲染-->
    <pagination></pagination>
  </div>
</template>

<script>
import crudServer from "@/api/projectRecord";

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
  name: "projectRecordDetail",
  components: { pagination, crudOperation, rrOperation, udOperation, DateRangePicker },
  cruds() {
    return CRUD({
      title: "访问记录统计",
      url: "api/projectAccessRecord",
      data: {
        page: {
          // 页码
          page: 0,
          // 每页数据条数
          size: 20,
          // 总数据条数
          total: 0,
        },
      },

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
    this.crud.page.size = 20;
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
ul {
  li {
    list-style-type: none;
    color: #606266;
    height: 32px;
    font-size: 14px;
  }
}
</style>
