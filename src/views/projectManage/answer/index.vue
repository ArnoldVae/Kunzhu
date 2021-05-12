<template>
  <div class="pro_answer">
    <div class="title">
      <h2>{{ $route.query.projectInfo.title }}</h2>
    </div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="全部" name="all"></el-tab-pane>
      <el-tab-pane label="待回复" name="noReplied"></el-tab-pane>
      <el-tab-pane label="已回复" name="isReplied"></el-tab-pane>
    </el-tabs>
    <div class="problem_content">
      <div class="problem_content_item">
        <div class="problem_content_item_single" v-for="p in problems" :key="p.questionId">
          <el-row>
            <el-col :span="6">{{ p.createBy.username }}<br />
              {{ p.createBy.phone }}<br />
              {{ p.createBy.userNo }}
            </el-col>
            <el-col :span="6">
              <div class="questions">
                {{ p.content }}<br />
                {{ p.createTime }}
              </div>
              <div class="answer" v-for="a in p.answers" :key="a.answerId">
                <span style="color: red">{{ a.content }}</span><br />
                {{ a.createTime }}
              </div>
            </el-col>
            <el-col :span="6">
              <span v-if="p.isReplied">已回复</span>
              <span v-else>待回复</span>
            </el-col>
            <el-col :span="6">
              <span style="cursor: pointer;color: #1890ff;" @click="toAnswer(p)">官方答疑</span>
            </el-col>
          </el-row>
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

      <hr style="border: 0.7px solid #ccc; margin-top: 20px" />
      <div class="dia_alais">
        官方回复
        <el-checkbox style="float: right" v-model="isRepublic">公开回复</el-checkbox>
      </div>
      <div class="dia_txt">
        <el-input type="textarea" :rows="12" placeholder="请输入内容" v-model="answerDetail">
        </el-input>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="ProblemVisible = false">取 消</el-button>
        <el-button type="primary" @click="answerSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import { searchQuestion, ToProjectAnswer } from "@/api/answer";
  import { getToken } from "@/utils/auth";
  import CRUD, { presenter, header, form, crud } from "@crud/crud";
  import { mapGetters } from "vuex";
  import moment from "moment";
  export default {
    name: "pro_answer",
    components: {},

    created() { },
    cruds() {
      return CRUD({ title: "文件", url: "api/files", crudMethod: { ...crudFile } });
    },
    mixins: [crud()],
    computed: {
      ...mapGetters(["imagesUploadApi", "annexUploadApi"]),
    },
    data() {
      return {
        activeName: "all",
        isReplied:'',
        problems: [],
        ProblemVisible: false,
        isRepublic: true,
        answerDetail: "",
        headers: { Authorization: getToken() },
        flieSelectedList: [],
        uploadData: {
          uploadType: "3",
        },
        selectQuerstion: {
          createBy: {},
        },
      };
    },
    mounted() {
      console.log(this.$route.query.projectInfo);
      console.log()
      if (this.$route.query.projectInfo.projectId) {
        this.getProblems();
      } else {
        this.$router.push({
          path: "create",
        });
      }
    },
    methods: {
      answerSubmit() {
        const _data = {
          attachments: [],
          content: this.answerDetail,
          isPublic: this.isRepublic,
          questionId: this.selectQuerstion.questionId,
        };

        ToProjectAnswer(_data).then((res) => {
          this.$message.success("回复成功!");

          this.answerDetail = "";
          this.ProblemVisible = false;
          this.getProblems();
        });
      },
      async getProblems() {
        const _data = {
          sort:['createTime,desc'],
          projectId: this.$route.query.projectInfo.projectId,
          isReplied:this.isReplied
        };
        const res = await searchQuestion(_data);
        if (res) {
          console.log(res);
          this.problems = res.content;
        }
      },
      handleClick(tab, event) {
        console.log(tab, event);
        this.isReplied=this.activeName==='all'?'':this.activeName==='noReplied'?false:true
        this.getProblems()
      },
      toAnswer(item) {
        this.selectQuerstion = item;
        console.log(this.selectQuerstion);
        this.ProblemVisible = true;
      },

    }
  };
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
  }
</style>