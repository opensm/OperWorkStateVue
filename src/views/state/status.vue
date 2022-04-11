<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.StatusName"
        placeholder="状态名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        style="margin-left: 10px;"
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
      style="width: 100%;margin-top: 10px"
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
          <span class="link-type">{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态名称" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.StatusName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态编码" align="center">
        <template slot-scope="{row}">
          <span>{{ row.StatusCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Jira项目" align="center">
        <template slot-scope="{row}">
          <span>{{ row.JiraProject }}</span>
        </template>
      </el-table-column>
      <el-table-column label="ShowType" align="center">
        <template slot-scope="{row}">
          <span>{{ row.ShowType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center">
        <template slot-scope="{row}">
          <span>{{ row.Description }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="400" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-document"
            :disabled="! buttonStatus(row.button, 'PUT')"
            @click="handleUpdate(row)"
          >
            修改
          </el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete-solid"
            :disabled="! buttonStatus(row.button,'DELETE')"
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
            <el-form-item label="状态名称" prop="StatusName">
              <el-input
                v-model="temp.StatusName"
              />
            </el-form-item>
            <el-form-item label="Jira项目" prop="StatusCode">
              <el-input
                v-model="temp.JiraProject"
              />
            </el-form-item>

          </el-col>
          <el-col :span="10">
            <el-form-item label="状态code" prop="StatusCode">
              <el-input
                v-model="temp.StatusCode"
              />
            </el-form-item>
            <el-form-item label="ShowType" prop="ShowType">
              <el-input
                v-model="temp.ShowType"
              />
            </el-form-item>
          </el-col>
          <el-col :span="19">
            <el-form-item type="textarea" label="备注" prop="note">
              <el-input
                v-model="temp.Description"
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
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    getStatuses, deleteStatus, updateStatus, addStatuses
  } from '@/api/status'
  import waves from '@/directive/waves' // waves directive
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
        // 日志弹窗变量
        drawer: false,
        direction: 'rtl',
        // 日志内容变量
        reverse: true,
        activities: [],
        // 任务列表变量
        tableKey: 0,
        total: 0,
        post: true,
        list: [],
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 10,
          StatusName: undefined,
          sort: '-id'
        },
        sortOptions: [{
          label: 'ID 正序', key: '+id'
        }, {
          label: 'ID 逆序', key: '-id'
        }],
        showReviewer: false,
        temp: {
          id: undefined,
          StatusCode: '',
          StatusName: '',
          Description: '',
          ShowType:''
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '修改状态',
          create: '添加状态'
        },
        dialogPvVisible: false,
        pvData: [],
        rules: {
          StatusCode: [{
            required: true, message: '状态名称必须填写！', trigger: 'blur'
          }],
          StatusName: [{
            required: true, message: '状态名称必须填写！', trigger: 'blur'
          }],
          JiraProject: [{
            required: true, message: 'Jira项目必须填写！', trigger: 'blur'
          }],
          ShowType: [{
            required: true, message: '显示类型！', trigger: 'blur'
          }],
          Description: [{
            required: true, message: '备注必须填写！', trigger: 'blur'
          }]
        },
        downloadLoading: false
      }
    },
    created() {
      this.getList()
    },
    methods: {
      // handleView(row) {
      //   this.$router.push({path: '/state/project', query: {task_id: row.id}})
      // },
      buttonStatus(data, button) {
        if (data === undefined || data.length <= 0) {
          return false
        } else {
          return data.includes(button)
        }
      },
      getList() {
        this.listLoading = true
        // 重置选择上的空
        if (this.listQuery.StatusName === '') {
          this.listQuery.StatusName = undefined
        }
        getStatuses(this.listQuery).then(response => {
          this.list = response.data
          this.total = response.total
          this.post = response.meta.post_tag

          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      },
      handleFilter() {
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
        this.temp = {
          id: undefined,
          StatusCode: '',
          StatusName: '',
          Description: '',
          ShowType:''
        }
      },
      handleCreate() {
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            // this.temp.task_time = this.moment(this.temp.task_time).format('YYYY-MM-DD HH:mm:ss')
            addStatuses(this.temp).then(response => {
              const {meta} = response
              this.list.unshift(this.temp)
              this.$notify({
                title: '成功',
                message: meta.msg,
                type: 'success',
                duration: 2000
              })
              this.dialogFormVisible = false
              this.handleFilter()
            })
          }
        })
      },
      handleUpdate(row) {
        this.temp = {}
        this.temp = Object.assign({}, row) // copy obj
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            const tempData = Object.assign({}, this.temp)
            updateStatus(tempData.id, tempData).then(response => {
              const {meta} = response
              const index = this.list.findIndex(v => v.id === this.temp.id)
              this.list.splice(index, 1, this.temp)
              this.$notify({
                title: '成功',
                message: meta.msg,
                type: 'success',
                duration: 2000
              })
              this.dialogFormVisible = false
            })
          }
        })
      },
      handleDelete(row, index) {
        this.$confirm('确定删除吗?', '提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            deleteStatus(row.id).then(response => {
              const {meta} = response
              const {id, StatusName} = row
              this.list.splice(index, 1)
              this.$notify({
                title: '成功',
                dangerouslyUseHTMLString: true,
                message: `
            <div>ID: ${id}</div>
            <div>任务名称: ${StatusName}</div>
            <div>返回信息: ${meta.msg}</div>`,
                type: 'success'
              })
              this.dialogFormVisible = false
              // this.handleFilter()
              // Just to simulate the time of the request
              setTimeout(() => {
                this.listLoading = false
              }, 1.5 * 1000)
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

  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>
<style rel="stylesheet/scss" lang="scss">
  .el-drawer {

    overflow: scroll
  }

</style>
