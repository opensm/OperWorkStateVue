<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="权限"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select v-model="listQuery.level" placeholder="菜单等级" clearable class="filter-item" style="width: 130px">
        <el-option
          v-for="item in calendarTypeOptions"
          :key="item.level"
          :label="item.display_name+'('+item.level+')'"
          :value="item.level"
        />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option
          v-for="item in sortOptions"
          :key="item.key"
          :label="item.label"
          :value="item.key"
        />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        :disabled=" post === 'false'"
        @click="handleCreate"
      >
        新增
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      border
      :data="list"
      row-key="id"
      :tree-props="{children: 'children', hasChildren: true}"
    >
      <el-table-column
        prop="name"
        label="菜单名称"
        :show-overflow-tooltip="true"
        width="220px"
      />
      <el-table-column
        prop="component_type"
        label="组件类型"
        align="center"
        width="160px"
      />
      <el-table-column prop="icon" label="图标" align="center" width="160px">
        <template slot-scope="scope">
          <svg-icon :icon-class="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column prop="index" label="排序" width="120px" align="center" />
      <el-table-column prop="path" label="路径" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.path }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="create_date" label="创建日期" width="220px" />
      <el-table-column label="操作" align="center" prop="button" class-name="small-padding fixed-width" width="220px">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" :disabled="! buttonStatus(scope.row.button, 'PUT')" @click="handleUpdate(scope.row)">
            修改
          </el-button>
          <el-button size="mini" type="danger" :disabled="! buttonStatus(scope.row.button, 'DELETE')" @click="handleDelete(scope,scope.row.id)">
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="权限" prop="name">
          <el-input
            v-model="temp.name"
          />
        </el-form-item>
        <el-form-item label="隐藏" prop="component">
          <el-switch
            v-model="temp.hidden"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>
        <el-form-item label="url" prop="path">
          <el-input
            v-model="temp.path"
          />
        </el-form-item>
        <el-form-item label="组件类型" prop="level">
          <el-select ref="select" v-model="temp.component_type" placeholder="请选择">
            <el-option value="M">菜单</el-option>
            <el-option value="B">按钮</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜单等级" prop="level">
          <el-select ref="select" v-model="temp.level" placeholder="请选择">
            <el-option
              v-for="item in calendarTypeOptions"
              :key="item.level"
              :value="item.level"
              :label="item.display_name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-select ref="select" v-model="temp.icon" placeholder="请选择">
            <el-option v-for="(item,index) in iconOptions" :key="index" :value="item" :label="item">
              <template>
                <span v-if="item">
                  <svg-icon
                    :icon-class="item"
                  />
                </span>
                <span>: {{ item }}</span>
              </template>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="显示序列" prop="index">
          <el-input-number
            v-model="temp.index"
            :min="0"
            :max="10"
          />
        </el-form-item>
        <el-form-item label="父级菜单" prop="parent">
          <el-select v-model="temp.parent" filterable clearable placeholder="请选择">
            <template v-for="option in parent">
              <el-option
                :key="option.id"
                :value="option.id"
                :label="option.name"
                :disabled="temp.id === option.id || temp.level===0"
              >
                <span>
                  <span v-if="option.icon">
                    <svg-icon
                      :icon-class="option.icon"
                    /> :</span>
                  <span>{{ option.name }}</span>
                </span>
              </el-option>
            </template>
          </el-select>
        </el-form-item>
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
  getMenus, addMenu, updateMenu, deleteMenu
} from '@/api/menus'
import waves from '@/directive/waves' // waves directive
// import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
// import { constantRoutes } from "@/router"; // secondary package based on el-pagination

const calendarTypeOptions = [
  {
    level: 0, display_name: '一级菜单'
  },
  {
    level: 1, display_name: '二级菜单'
  }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.level] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      post: null,
      parent: [],
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        level: 0,
        sort: '+id'
      },
      calendarTypeOptions,
      sortOptions: [{
        label: 'ID 正序', key: '+id'
      }, {
        label: 'ID 逆序', key: '-id'
      }],
      showReviewer: false,
      iconOptions: [
        '404', 'bug', 'chart', 'clipboard', 'component', 'dashboard', 'documentation', 'drag', 'edit', 'education', 'email', 'example', 'excel', 'exit-fullscreen', 'eye-open', 'eye', 'form', 'fullscreen', 'guide', 'icon', 'international', 'language', 'link', 'list', 'lock', 'message', 'money', 'nested', 'password', 'pdf', 'people', 'peoples', 'qq', 'search', 'shopping', 'size', 'skill', 'star', 'tab', 'table', 'theme', 'tree-table', 'tree', 'user', 'wechat', 'zip'
      ],
      temp: {
        id: undefined,
        path: '',
        model: '',
        name: '',
        icon: '',
        level: '',
        hidden: false,
        component_type: '',
        parent: '',
        index: 0,
        children: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改菜单',
        create: '添加菜单'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        path: [{
          required: true, message: '资源路径必须填写!', trigger: 'blur'
        }],
        name: [{
          required: true, message: '权限名称必须填写！', trigger: 'blur'
        }],
        model: [{
          required: true, message: '资源必须填写！', trigger: 'blur'
        }],
        level: [{
          required: true, message: '菜单级别必须填写！', trigger: 'blur'
        }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
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
      if (this.listQuery.level === '') {
        this.listQuery.level = undefined
      }
      getMenus(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.total
        this.post = response.meta.post_tag

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
      getMenus({ 'level': 0 }).then(response => {
        const { data } = response
        this.parent = data
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
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
        path: '',
        model: '',
        name: '',
        icon: '',
        level: '',
        parent: '',
        component: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          addMenu(this.temp).then(response => {
            const { meta } = response
            this.list.unshift(this.temp)
            this.$notify({
              title: '成功',
              message: meta.msg,
              type: 'success',
              duration: 2000
            })
          })
          this.dialogFormVisible = false
          this.handleFilter()
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      // this.temp.timestamp = new Date(this.temp.timestamp)
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
          updateMenu(tempData.id, tempData).then(response => {
            const { meta } = response
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
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
    handleDelete(row, index) {
      deleteMenu(row.id).then(response => {
        const { meta } = response
        const index = this.list.findIndex(v => v.id === this.temp.id)
        this.list.splice(index, 1)
        this.$notify({
          title: '成功',
          message: meta.msg,
          type: 'success',
          duration: 2000
        })
        this.handleFilter()
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
