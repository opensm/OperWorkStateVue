<template xmlns:el-col="http://www.w3.org/1999/html">
  <div class="app-container">
    <el-card class="box-card" style="margin-top: 0px;margin-left: 0px;margin-right: 0px">
      <div class="filter-TaskName" style="margin-bottom: 10px;">
        <el-input
          v-model="listQuery.Project"
          placeholder="发版名称"
          style="width: 300px;"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />
        <el-button
          v-waves
          class="filter-item"
          type="primary"
          style="margin-left: 10px;"
          icon="el-icon-search"
          @click="handleFilter"
        >
          搜索
        </el-button>
        <el-button
          class="filter-item"
          style="margin-left: 10px;"
          type="primary"
          icon="el-icon-edit"
          :disabled="post === false"
          @click="handleCreate"
        >
          新增
        </el-button>
      </div>

      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%;"
        @sort-change="sortChange"
      >
        <el-table-column
          label="ID"
          prop="id"
          sortable="custom"
          align="center"
          width="80"
          :class-name="getSortClass('id')"
        >
          <template slot-scope="{row}">
            <span>{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="所属项目" align="center">
          <template slot-scope="{row}">
            {{ row.project_st }}
          </template>
        </el-table-column>
        <el-table-column label="任务名称" align="center">
          <template slot-scope="{row}">
            {{ row.TaskName }}
          </template>
        </el-table-column>
        <el-table-column label="使用时长" align="center">
          <template slot-scope="{row}">
            <span>{{ row.UseTime }} {{ row.UseTimeType }}</span>
          </template>
        </el-table-column>
        <el-table-column label="当前状态" align="center">
          <template slot-scope="{row}">
            <el-tag :type="row.status_fg">{{ row.status_st }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center">
          <template slot-scope="{row}">
            <span>{{ row.RecordTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="任务执行人" align="center">
          <template slot-scope="{row}">
            <span>{{ row.command_user_st }}</span>
          </template>
        </el-table-column>
        <el-table-column
          type="expand"
        >
          <template slot-scope="{row}">
            <el-form label-position="left" inline class="demo-table-expand">
              <el-form-item label="创建人">
                <span>{{ row.create_user_st }}</span>
              </el-form-item>
              <el-form-item label="开始时间">
                <span>{{ row.StartTime }}</span>
              </el-form-item>
              <el-form-item label="结束时间">
                <span>{{ row.FinishTime }}</span>
              </el-form-item>
              <el-form-item label="任务内容">
                <span>{{ row.Content }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
          <template slot-scope="{row,$index}">
            <el-button
              type="primary"
              size="mini"
              :disabled="! buttonStatus(row.button,'PUT')"
              @click="handleUpdate(row)"
            >
              修改
            </el-button>
            <el-button
              size="mini"
              type="danger"
              :disabled="! buttonStatus(row.button,'DELETE') "
              @click="handleDelete(row,$index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getList"
      />
    </el-card>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style=" margin-left:50px;"
      >
        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="所属项目" prop="Project">
              <el-select
                v-model="temp.Project"
                filterable
                default-first-option
                placeholder="请选择子任务"
              >
                <el-option
                  v-for="item in projectList"
                  :key="item.id"
                  :value="item.id"
                  :label="item.ProjectName"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="工时类型" prop="UseTimeType">
              <el-select
                v-model="temp.UseTimeType"
                filterable
                default-first-option
                placeholder="请选择子任务"
              >
                <el-option value="hour" label="小时"/>
              </el-select>
            </el-form-item>
            <el-form-item label="开始时间" prop="StartTime">
              <el-date-picker
                v-model="temp.StartTime"
                type="datetime"
                placeholder="选择日期时间"
                default-time="00:00:00"
              />
            </el-form-item>
            <el-form-item label="使用时间" prop="UseTimeType">
              <el-input-number v-model="temp.UseTime" :precision="2" :step="0.1" :max="12"/>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="任务名称" prop="TaskName">
              <el-input
                v-model="temp.TaskName"
                type="input"
              />
            </el-form-item>
            <el-form-item label="当前状态" prop="Status">
              <el-select
                v-model="temp.Status"
                filterable
                default-first-option
                placeholder="请选择对应状态"
              >
                <el-option
                  v-for="item in status_list"
                  :key="item.id"
                  :value="item.id"
                  :label="item.StatusName"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="结束时间" prop="FinishTime">
              <el-date-picker
                v-model="temp.FinishTime"
                type="datetime"
                placeholder="选择日期时间"
                default-time="00:00:00"
              />
            </el-form-item>
            <el-form-item label="是否为他人创建">
              <el-switch
                v-model="other"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="changeSwitch($event)"
              >
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="19">
            <el-form-item v-if="other" label="执行人" prop="CommandUser">
              <el-select
                v-model="temp.CommandUser"
                filterable
                default-first-option
                placeholder="请选择执行人"
              >
                <el-option
                  v-for="item in user_list"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item type="textarea" label="任务内容" prop="Content">
              <el-input
                v-model="temp.Content"
                :autosize="{ minRows: 2, maxRows: 10}"
                type="textarea"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="listLoading" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getStates, deleteState, updateState, addState } from '@/api/workstates'
import { getStatuses } from '@/api/status'
import waves from '@/directive/waves'
import { getProjects } from '@/api/project'
import { current_user, getUsersInfo } from '@/api/user'
import Pagination from '@/components/Pagination'

export default {
  name: 'ComplexTable',
  components: {
    Pagination
  },
  directives: {
    waves
  },
  data() {
    return {
      tableKey: 0,
      total: 0,
      temp: {},
      post: true,
      project: [],
      projectList: [],
      current: '',
      list: [],
      other: false,
      status_list: [],
      user_list: [],
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        sort: '-id',
        Project: ''
      },
      sortOptions: [{
        label: 'ID 正序', key: '+id'
      }, {
        label: 'ID 逆序', key: '-id'
      }],
      rules: {
        Content: [{
          required: true, message: '任务内容必须填写！', trigger: 'blur'
        }],
        Project: [{
          required: true, message: '项目必须填写！', trigger: 'blur'
        }],
        UseTime: [{
          required: true, message: '使用时长必须填写！', trigger: 'blur'
        }],
        UseTimeType: [{
          required: true, message: '使用时长类型必须填写！', trigger: 'blur'
        }],
        StartTime: [{
          required: true, message: '开始时间必须填写！', trigger: 'blur'
        }],
        FinishTime: [{
          required: true, message: '结束时间必须填写！', trigger: 'blur'
        }],
        Status: [{
          required: true, message: '状态必须填写！', trigger: 'blur'
        }],
        TaskName: [{
          required: true, message: '任务名称必须填写！', trigger: 'blur'
        }]

      },
      showReviewer: false,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改子任务',
        create: '添加子任务'
      },
      dialogPvVisible: false,
      pvData: [],
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    changeSwitch(data) {
      if (data === true) {
        this.getUser()
      } else {
        this.temp.CommandUser = this.current
      }
    },
    buttonStatus(data, button) {
      if (data === undefined || data.length <= 0) {
        return false
      } else {
        return data.includes(button)
      }
    },
    getProject() {
      this.listLoading = true
      getProjects().then(response => {
        this.projectList = response.data
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    getUser() {
      this.listLoading = true
      getUsersInfo().then(response => {
        this.user_list = response.data
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    getStatus() {
      this.listLoading = true
      getStatuses().then(response => {
        const { data } = response
        this.status_list = data
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    getList() {
      this.listLoading = true
      // 重置选择上的空
      if (this.listQuery.Project === '') {
        this.listQuery.Project = undefined
      }
      getStates(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.total
        this.post = response.meta.post_tag

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
        current_user().then(response => {
          this.current = response.data.id
        })
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功！',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const {
        prop, order
      } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.projectList = []
      this.user_list = []
      this.temp = {
        id: undefined,
        Content: '',
        project: '',
        UseTime: '',
        UseTimeType: '',
        StartTime: '',
        FinishTime: '',
        Status: '',
        RecordTime: '',
        CreateUser: '',
        CommandUser: '',
        TaskName: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.getProject()
      // this.getUser()
      this.getStatus()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.other = false
      this.temp.CommandUser = this.current
    },
    createData() {
      this.listLoading = true
      this.temp.startTime = this.moment(this.temp.startTime).format('YYYY-MM-DD HH:mm:ss')
      this.temp.FinishTime = this.moment(this.temp.FinishTime).format('YYYY-MM-DD HH:mm:ss')
      this.temp.CreateUser = this.current

      addState(this.temp).then(response => {
        const { meta } = response
        this.list.unshift(this.temp)
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
        this.$notify({
          title: '成功',
          message: meta.msg,
          type: 'success',
          duration: 2000
        })
        this.dialogFormVisible = false
        this.handleFilter()
      })
    },
    handleUpdate(row) {
      this.getProject()
      // this.getUser()
      this.getStatus()
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      if (this.temp.CommandUser === this.temp.CreateUser) {
        this.other = false
      } else {
        this.other = true
      }
    },
    updateData() {
      this.listLoading = true
      this.temp.startTime = this.moment(this.temp.startTime).format('YYYY-MM-DD HH:mm:ss')
      this.temp.FinishTime = this.moment(this.temp.FinishTime).format('YYYY-MM-DD HH:mm:ss')
      this.temp.CreateUser = this.current
      updateState(this.temp.id, this.temp).then(response => {
        const { meta } = response
        const index = this.list.findIndex(v => v.id === this.temp.id)
        this.list.splice(index, 1, this.temp)
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
        this.$notify({
          title: '成功',
          message: meta.msg,
          type: 'success',
          duration: 2000
        })
        this.handleFilter()
        this.dialogFormVisible = false
      })
    },
    handleDelete(row, index) {
      this.$confirm('确认都删除该密钥?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.listLoading = true
          deleteState(row.id).then(response => {
            const { meta } = response
            const { id, Content } = row
            this.list.splice(index, 1)
            setTimeout(() => {
              this.listLoading = false
            }, 1.5 * 1000)
            this.handleFilter()
            this.$notify({
              title: '成功',
              dangerouslyUseHTMLString: true,
              message: `
            <div>ID: ${id}</div>
            <div>子任务名称: ${Content}</div>
            <div>返回信息: ${meta.msg}</div>`,
              type: 'success'
            })
          })
        })
        .catch(err => {
          console.error(err)
        })
    },
    getSortClass: function (key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>

<style>
  .demo-table-expand {
    font-size: 0;
  }

  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }

  .formulate-input .formulate-input-element {
    margin-bottom: 0.1em;
    max-width: 100%;
  }

  code {
    margin-top: 2em;
  }

</style>
