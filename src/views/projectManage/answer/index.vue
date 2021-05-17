<template>
  <div class="pro_answer">
    <div class="title">
      <span>{{ $route.query.projectInfo.title }}</span>
      <el-button type="warning" @click="goback">返回</el-button>
    </div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="待回复" name="noReplied" />
      <el-tab-pane label="已回复" name="isReplied" />
    </el-tabs>
    <div class="problem_content">
      <div class="problem_content_item">
        <div
          v-for="p in problems"
          :key="p.questionId"
          class="problem_content_item_single"
        >
          <el-row>
            <el-col
              :span="6"
            >{{ p.createBy.username }}<br>
              {{ p.createBy.phone }}<br>
              {{ p.createBy.userNo }}
            </el-col>
            <el-col :span="6">
              <div class="questions">
                {{ p.content }}<br>
                {{ p.createTime }}<br>
                <span v-if="p.attachments.length > 0">
                  相关附件：<span
                    v-for="f in p.attachments"
                    :key="f.questionAttachmentId"
                    style="color: #409eff; margin-right: 16px; cursor: pointer"
                    @click="showThisOne(f)"
                  >{{ f.title }}</span></span>
              </div>
              <div v-for="a in p.answers" :key="a.answerId" class="answer">
                <span style="color: red">{{ a.content }}</span><br>
                {{ a.createTime }}
              </div>
            </el-col>
            <el-col :span="6">
              <span v-if="p.isReplied && p.isPublic">公开回复</span>
              <span v-else-if="p.isReplied && !p.isPublic">私人回复</span>
              <span v-else>待回复</span>
            </el-col>
            <el-col :span="6">
              <span
                style="cursor: pointer; color: #1890ff"
                @click="toAnswer(p)"
              >官方答疑</span>
            </el-col>
          </el-row>
        </div>
        <div class="block">
          <el-pagination
            :current-page.sync="currentPage"
            :page-size="pageSize"
            layout="total, prev, pager, next"
            :total="partnerTotal"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
    <el-dialog title="项目答疑" :visible.sync="ProblemVisible" width="60%">
      <div class="dia_title">{{ $route.query.projectInfo.title }}</div>
      <div class="dia_title">提问</div>
      <div class="dia_question">
        <el-row>
          <el-col :span="6">
            <ul>
              <li>
                {{ selectQuerstion.createBy.realName }}【{{
                  selectQuerstion.createBy.username
                }}】
              </li>
              <li>{{ selectQuerstion.createBy.phone }}</li>
              <li>{{ selectQuerstion.createBy.userNo }}</li>
            </ul>
          </el-col>
          <el-col :span="18">{{ selectQuerstion.content }}</el-col>
        </el-row>
      </div>
      <div class="link_file">
        <span v-if="selectQuerstion.attachments.length > 0">
          相关附件：<span
            v-for="f in selectQuerstion.attachments"
            :key="f.questionAttachmentId"
            style="color: #409eff; margin-right: 16px; cursor: pointer"
            @click="showThisOne(f)"
          >{{ f.title }}</span>
        </span>
      </div>
      <hr style="border: 0.7px solid #ccc; margin-top: 20px">
      <div class="dia_alais">
        官方回复
        <el-checkbox v-model="isRepublic" style="float: right">公开回复</el-checkbox>
      </div>
      <div class="dia_txt">
        <el-input
          v-model="answerDetail"
          type="textarea"
          maxlength="300"
          show-word-limit
          :rows="12"
          placeholder="请输入内容"
        />
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="ProblemVisible = false">取 消</el-button>
        <el-button type="primary" @click="answerSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { searchQuestion, ToProjectAnswer } from '@/api/answer'
import { getToken } from '@/utils/auth'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import { mapGetters } from 'vuex'
import moment from 'moment'
export default {
  name: 'ProAnswer',
  components: {},

  created() {},
  cruds() {
    return CRUD({ title: '文件', url: 'api/files', crudMethod: { ...crudFile }})
  },
  mixins: [crud()],
  computed: {
    ...mapGetters(['imagesUploadApi', 'annexUploadApi', 'baseApi'])
  },
  data() {
    return {
      pageSize: 30,
      currentPage: 0,
      partnerTotal: 0,
      activeName: 'all',
      isReplied: '',
      problems: [],
      ProblemVisible: false,
      isRepublic: true,
      answerDetail: '',
      headers: { Authorization: getToken() },
      flieSelectedList: [],
      uploadData: {
        uploadType: '3'
      },
      selectQuerstion: {
        attachments: [],
        createBy: {}
      }
    }
  },
  mounted() {
    console.log(this.$route.query.projectInfo)
    console.log()
    if (this.$route.query.projectInfo.projectId) {
      this.getProblems()
    } else {
      this.$router.push({
        path: 'create'
      })
    }
  },
  methods: {
    goback() {
      window.history.back()
    },
    showThisOne(file) {
      const url = this.getCaption(file.url)

      console.log(url)
      window.open(this.baseApi + '/' + url)
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      getProblems({
        sort: ['createTime,desc'],
        projectId: this.$route.query.projectInfo.projectId,
        page: this.currentPage - 1,
        size: this.pageSize,
        isReplied: this.isReplied
      }).then((res) => {
        console.log(res)
        this.problems = res.content
        this.partnerTotal = res.totalElements
      })
    },
    answerSubmit() {
      if (this.answerDetail.length < 1) {
        this.$message.warning('回复内容不能为空!')
        return
      }
      const _data = {
        attachments: [],
        content: this.answerDetail,
        isPublic: this.isRepublic,
        questionId: this.selectQuerstion.questionId
      }

      ToProjectAnswer(_data).then((res) => {
        this.$message.success('回复成功!')

        this.answerDetail = ''
        this.ProblemVisible = false
        this.getProblems()
      })
    },
    async getProblems() {
      const _data = {
        sort: ['createTime,desc'],
        projectId: this.$route.query.projectInfo.projectId,
        page: this.currentPage - 1,
        size: this.pageSize,
        isReplied: this.isReplied
      }
      const res = await searchQuestion(_data)
      if (res) {
        console.log(res)
        this.problems = res.content
        this.partnerTotal = res.totalElements
      }
    },
    handleClick(tab, event) {
      console.log(tab, event)
      this.isReplied = this.activeName === 'all' ? '' : this.activeName !== 'noReplied'
      this.getProblems()
    },
    toAnswer(item) {
      this.selectQuerstion = item
      console.log(this.selectQuerstion)
      this.ProblemVisible = true
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.pro_answer {
  padding: 16px;

  .problem_content {
    border: 1px solid #ccc;
    padding: 20px;

    .problem_content_item {
      border-bottom: 1px solid #ccc;

      .problem_content_item_single {
        border-bottom: 1px solid #ccc;
      }

      .el-col {
        padding: 16px;
        border-right: 1px solid #ccc;
        word-break: break-all;
        min-height: 200px;
      }

      padding: 16px;

      .questions {
        border-bottom: 1px dashed #ccc;
        margin-bottom: 10px;
        line-height: 28px;
      }

      .answer {
        border-bottom: 1px dashed #ccc;
        margin-bottom: 16px;
        line-height: 28px;
      }
    }
  }
  .link_file {
    line-height: 40px;
  }
  .dia_title {
    height: 40px;
    line-height: 40px;
  }

  .dia_question {
    width: 100%;
    background: #dedee4;
    min-height: 120px;

    .el-col {
      padding: 20px;

      ul {
        li {
          list-style-type: none;
        }
      }
    }
  }

  .dia_alais {
    height: 40px;
    line-height: 40px;
  }

  .dia_file {
    min-height: 50px;
    padding-top: 10px;
  }
  .title {
    text-align: left;
    margin: 20px 0;
    color: #606266;
    font-size: 24px;
    button {
      float: right;
    }
  }
}
</style>
