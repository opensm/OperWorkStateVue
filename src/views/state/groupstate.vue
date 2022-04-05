<template>
  <div>
    <el-row :gutter="0">
      <el-col :span="12" :style="{ marginBottom: '12px' }">
        <v-chart class="chart" :option="projects"/>
      </el-col>
      <el-col :span="12" :style="{ marginBottom: '12px' }">
        <v-chart class="chart" :option="option"/>
      </el-col>
    </el-row>
  </div>

</template>

<script>
import {mapGetters} from 'vuex'
import ChartCard from '@/components/ChartCard'
import {getGroupStates} from "@/api/workstates"

import {use} from 'echarts/core'
import {CanvasRenderer} from 'echarts/renderers'
import {PieChart} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import VChart, {THEME_KEY} from 'vue-echarts'

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

export default {
  name: 'Dashboard',
  components: {
    ChartCard,
    VChart
  },
  provide: {
    [THEME_KEY]: 'dark'
  },
  data() {
    return {
      projects: {
        title: {
          text: '按项目统计',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: this.projectList
        },
        series: [
          {
            name: '项目情况统计',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [
              {value: 1, name: 'P102'},
              {value: 7, name: 'P301'},
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 5,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      },
      option :{
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        dataset: {
          source: [
            ['product', '2015', '2016', '2017'],
            ['Matcha Latte', 43.3, 85.8, 93.7],
            ['Milk Tea', 83.1, 73.4, 55.1],
            ['Cheese Cocoa', 86.4, 65.2, 82.5],
            ['Walnut Brownie', 72.4, 53.9, 39.1]
          ]
        },
        xAxis: {type: 'category'},
        yAxis: {},
        // Declare several bar series, each will be mapped
        // to a column of dataset.source by default.
        series: [
          {type: 'bar'},
          {type: 'bar'},
          {type: 'bar'}
        ]
      },
      projectList: []
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
      getGroupStates().then(response => {
        const { data } = response
        data.map(item =>{
          this.projectList.push(item.Project)
        })
      })
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
