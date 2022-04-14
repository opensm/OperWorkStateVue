<template>
  <div class="app-container">
    <el-table
      :data="tableData"
      style="width: 100%">
      <el-table-column
        prop="date"
        label="序号"
        width="150">
      </el-table-column>
      <el-table-column label="运维部门信息">
        <el-table-column
          prop="name"
          label="所属部门"
          width="120">
        </el-table-column>
        <el-table-column
          prop="name"
          label="花名"
          width="120">
        </el-table-column>
        <el-table-column
          prop="name"
          label="岗位"
          width="120">
        </el-table-column>
        <el-table-column  v-for="pro in projectList" :key="pro" :label="pro">
          <el-table-column
            prop="province"
            label="任务"
            width="120">
          </el-table-column>
          <el-table-column
            prop="city"
            label="用时/h"
            width="120">
          </el-table-column>
        </el-table-column>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ChartCard from '@/components/ChartCard'
import { getGroupStates } from "@/api/workstates"

export default {
  name: 'Dashboard',
  components: {
    ChartCard
  },
  data() {
    return {
      tableData: [{
        date: '2016-05-03',
        name: '王小虎',
        province: '上海',
        city: '普陀区',
        address: '上海市普陀区金沙江路 1518 弄',
        zip: 200333
      }, {
        date: '2016-05-02',
        name: '王小虎',
        province: '上海',
        city: '普陀区',
        address: '上海市普陀区金沙江路 1518 弄',
        zip: 200333
      }, {
        date: '2016-05-04',
        name: '王小虎',
        province: '上海',
        city: '普陀区',
        address: '上海市普陀区金沙江路 1518 弄',
        zip: 200333
      }, {
        date: '2016-05-01',
        name: '王小虎',
        province: '上海',
        city: '普陀区',
        address: '上海市普陀区金沙江路 1518 弄',
        zip: 200333
      }, {
        date: '2016-05-08',
        name: '王小虎',
        province: '上海',
        city: '普陀区',
        address: '上海市普陀区金沙江路 1518 弄',
        zip: 200333
      }, {
        date: '2016-05-06',
        name: '王小虎',
        province: '上海',
        city: '普陀区',
        address: '上海市普陀区金沙江路 1518 弄',
        zip: 200333
      }, {
        date: '2016-05-07',
        name: '王小虎',
        province: '上海',
        city: '普陀区',
        address: '上海市普陀区金沙江路 1518 弄',
        zip: 200333
      }],
      listLoading: true,
      projectList: [],
      groupList: []
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'roles',
      'role_name',
      'last'
    ]),
    getUnCommit: function () {
      return this.flowTaskTotal - (this.unCommit + this.commit)
    }
  },
  created() {
    this.getTotalState()
  },
  methods: {
    getTotalState() {
      this.projectList=[]
      this.listLoading = true
      getGroupStates().then(response => {
        const { data } = response
        data.map(item => {
          let index = this.projectList.indexOf(item.Project)
          console.log(1111111111111111111)
          console.log(index)
          console.log(2222222222222222222)
          if (index === -1){
            this.projectList.push(item.Project)
          }
        })
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
        this.groupList = [...new Set(JSON.parse(JSON.stringify(data)))]
        console.log(this.projectList)
        console.log(this.groupList)
      })
      // this.projectList = JSON.parse(JSON.stringify(this.projectList))
    },
  }
}
</script>

<style lang="scss" scoped>
  .dashboard {
    &-container {
      margin: 30px;
    }

    &-text {
      font-size: 30px;
      line-height: 46px;
    }
  }

  .chart {
    height: 400px;
  }
</style>
