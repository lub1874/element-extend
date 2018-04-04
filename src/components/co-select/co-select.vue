<template>
  <div class="co-select">
    <template slot="scope">
      <el-popover :placement="placement" ref="reference" :width="totalWidth" v-model="launch">
        <table class="co-select_table">
          <thead>
          <tr>
            <th v-for="col in theadList" :key="col.tableField" :style="col.thStyle">{{col.tableName}}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in paginationTableData" :key="index" @click="selectData(index)"
              :class="{'selected': currentIndex.indexOf((currentPage - 1) * pageSize + index) > -1}">
            <td v-for="(col, index) in theadList" :key="index">{{item[col.tableField]}}</td>
          </tr>
          </tbody>
          <tfoot>
          <tr style="width: 100%">
            <td :colspan="multiple ? theadList.length - 1 : theadList.length" v-if="!showPagination"><span class="co-select_total">共匹配{{tableData.length}}条数据</span>
            </td>
            <td :colspan="multiple ? theadList.length - 1 : theadList.length" class="block" v-else>
              <el-pagination
                background
                :page-size="pageSize"
                layout="total, prev, pager, next"
                @current-change="handleCurrentChange"
                :current-page="currentPage"
                :total="tableData.length">
              </el-pagination>
            </td>
            <td :colspan="1" v-if="multiple"><input type="button" value="确定" class="co-select_btn"/></td>
          </tr>
          </tfoot>
        </table>
        <el-input v-model="queryCondition.request.keyword"  class="co-select_input"
               :placeholder="placeholder"
               slot="reference"
               :disabled="disabled" />
      </el-popover>
    </template>
  </div>
</template>

<script>
  // import axios from 'axios'
  import jQuery from 'jquery'
  export default {
    name: 'coSelect',
    props: {
      theadList: { // 表头配置项
        type: Array,
        default: function () {
          return []
        }
      },
      url: {
        type: String,
        default: ''
      },
      multiple: {
        type: Boolean,
        default: false // 选择方式，单选（single）或者多选（multiple)，默认单选
      },
      bindFun: {
        type: Function,
        default: function (res) { // 默认处理数据方法。理想中的状态，接口返回的数据格式：{'success': {'id': 1,...之类的数据项}, 'status': 1}
          this.tableData = res.status === 1 ? res.success : []
        }
      },
      placeholder: { // 输入框placeholder
        type: String,
        default: '请输入内容'
      },
      placement: { // popover弹出框显示的位置，top/bottom/left/right，后面可加(-start, -end)后缀
        type: String,
        default: 'bottom'
      },
      showPagination: { // 是否需要分页
        type: Boolean,
        default: false
      },
      bindKey: { // 业务页面，queryCondition中的查询条件
        bindKey: {
          type: String,
          default: ''
        }
      },
      backFillContent: {
        type: String,
        default: ''
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        backFill: false, // 是否已回填。如果true，不发起请求
        queryCondition: { // 查询条件
          request: {
            pageRequest: {
              start: 0,
              limit: 10,
              results: 0
            },
            keyword: ''
          }
        },
        currentIndex: [], // 当前选中的行下标
        selectedData: [], // 当前选中的数据
        launch: false, // 控制表格是否显示
        totalWidth: 0,
        timeout: '', // 控制请求频率的定时器
        tableData: [], // 表格数据
        currentPage: 1,
        pageSize: 10
      }
    },
    created () {
      this.bindEvent()
      for (let item of this.theadList) {
        if (item.hasOwnProperty('thStyle') && item.thStyle.hasOwnProperty('width')) {
          this.totalWidth += parseInt(item.thStyle.width)
        } else {
          this.totalWidth += 150
        }
      }
      if (this.backFillContent) {
        this.queryCondition.request.keyword = this.backFillContent
      }
    },
    computed: {
      paginationTableData: function () {
        const self = this
        if (self.showPagination) {
          return self.tableData.slice((self.currentPage - 1) * self.pageSize, self.currentPage * self.pageSize)
        } else {
          return self.tableData
        }
      }
    },
    watch: {
      'queryCondition.request.keyword': function (val) {
        const backFillArr = this.theadList.filter(item => {
          return item.backFillFlag
        })
        const backFillField = backFillArr.length > 0 ? backFillArr[0].tableField : ''
        if (this.queryCondition.request.keyword.length === 0) {
          this.$emit('update:bindKey', '')
        }
        if (this.selectedData.length === 0) { // 判断当前是否是回填
          this.backFill = false
        } else {
          this.backFill = this.selectedData[0][backFillField] === val
        }
        if (this.timeout) {
          clearTimeout(this.timeout)
        }
        this.timeout = setTimeout(() => {
          this.getData()
        }, 500)
      },
      backFillContent: function () {
        if (this.backFillContent) {
          this.queryCondition.request.keyword = this.backFillContent
        }
      }
    },
    methods: {
      getData () {
        const self = this
        const url = self.getRoot() + '/api/' + self.url
        const parameter = {
          'body': self.queryCondition
        }
        if (self.backFill || (self.queryCondition.request.keyword.length === 0 && self.launch === false)) {
          return
        }
        if (self.disabled) {
          return
        }
        jQuery.ajax({
          type: 'post',
          async: false,
          url: url,
          contentType: 'application/x-www-form-urlencoded',
          data: {
            parameter: JSON.stringify(parameter)
          },
          dataType: 'json',
          success: function (res) {
            console.log(res)
            if (res.status === 1 && JSON.stringify(res.success) !== '{}') {
              if (self.backFillContent === self.queryCondition.request.keyword) {
                self.launch = false
              } else {
                self.launch = true
              }
              self.clearSelectData()
              self.currentPage = 1
              self.tableData = self.bindFun(res)
            } else {
              self.launch = true
            }
          },
          error: function (e) {
          }
        })
      },
      //   const url = self.getRoot() + '/api/' + self.url
      //   const parameter = {parameter: JSON.stringify({'body': self.queryCondition})}
      //   axios.post(url, parameter).then(res => {
      //     if (res.data.status === 1 && JSON.stringify(res.data.success) !== '{}') {
      //       if (self.backFillContent === self.queryCondition.request.keyword) {
      //         self.launch = false
      //       } else {
      //         self.launch = true
      //       }
      //       self.clearSelectData()
      //       self.currentPage = 1
      //       self.tableData = this.bindFun(res.data)
      //     } else {
      //       self.launch = true
      //     }
      //   }).catch(e => {
      //     this.$message({
      //       showClose: true,
      //       message: '接口请求失败，请重试',
      //       type: 'error'
      //     })
      //   })
      // },
      clearSelectData: function () { // 清除选中的数据
        this.currentIndex = []
        this.selectedData = []
      },
      saveDataAndIndex: function (index) { // 把选中行的数据/序号分别存入数组中
        const curTableIndex = (this.currentPage - 1) * this.pageSize + index
        this.selectedData.push(this.tableData[curTableIndex])
        this.currentIndex.push(curTableIndex)
      },
      selectData (index) { // 点击数据行
        const backFillArr = this.theadList.filter(item => {
          return item.backFillFlag
        })
        const backFillField = backFillArr.length > 0 ? backFillArr[0].tableField : ''
        if (!this.multiple) { // 处理单选
          this.clearSelectData()
          this.saveDataAndIndex(index)
          this.queryCondition.request.keyword = this.tableData[index][backFillField] ? this.tableData[index][backFillField] : this.queryCondition.request.keyword
          this.backFill = true
          this.commitSelData()
        } else { // 处理多选
          const _index = this.currentIndex.indexOf(index)
          if (_index > -1) { // 多选重复选择逻辑处理
            this.currentIndex.splice(_index, 1)
            this.selectedData.splice(_index, 1)
            return
          }
          this.saveDataAndIndex(index)
        }
      },
      commitSelData () { // 提交数据，并收起表格
        if (this.selectedData.length > 0) {
          if (this.multiple) {
            this.$emit('change', this.selectedData) // 选择项改变的时候抛出change事件
          } else {
            this.$emit('change', this.selectedData[0]) // 选择项改变的时候抛出change事件
          }
        }
        this.launch = false
      },
      showPanel () { // 面板展示开关
        this.launch = true
      },
      bindEvent () { // 事件处理
        const self = this
        const elMain = window.document.querySelector('.el-main')
        let posX1 = 0
        let posY1 = 0
        let posX2 = 0
        let posY2 = 0
        window.document.addEventListener('mousedown', function (event) { // 监听鼠标按下事件，记录按下的x,y坐标
          posX1 = event.clientX
          posY1 = event.clientY
        })
        window.document.addEventListener('mouseup', event => { // 监听鼠标的mouseup事件，记录此时的x,y坐标。根据两次坐标来判断鼠标是否移动。
          posX2 = event.clientX
          posY2 = event.clientY

          if (Math.abs(posX2 - posX1) < 20 && Math.abs(posY2 - posY1) < 20) { // 鼠标有移动时，不做响应
            const node = event.target
            if (node.tagName === 'HTML') { // 点击页面非内容区域
              return
            }
            const parentsTagName = node.parentNode.parentNode.tagName
            if (node.id === 'co-select_input' ||
              (node.className.indexOf('co-select_table') > -1) || (node.className.indexOf('el-pagination') > -1)) { // 点击输入框/表格本身/还有分页组件时不收起表格
              return
            }
            if (node.parentNode.parentNode.className.indexOf('el-pagination') > -1) {
              return
            }
            if (!self.multiple && parentsTagName !== 'THEAD' && parentsTagName !== 'TFOOT') { // 单选时，点击tbody中间的行或者表格之外的区域，并收起表格
              self.launch = false
            } else { // 多选时，表格未关闭，点击表格之外的区域或者确定按钮，提交数据并收起表格
              if (parentsTagName !== 'THEAD' && parentsTagName !== 'TBODY' && parentsTagName !== 'TFOOT' &&
                node.className.indexOf('co-select_total') === -1 && self.launch) {
                self.commitSelData()
              }
            }
          }
        })
        window.addEventListener('scroll', event => { // 如果页面有滚动，则隐藏表格
          self.launch = false
        })
        if (elMain) {
          elMain.addEventListener('scroll', event => { // 页面可能有多个滚动条，监听el-main的滚动条事件，如果滚动，则隐藏表格
            self.launch = false
          })
        }
      },
      handleCurrentChange (val) {
        this.currentPage = val
      },
      reset () {
        this.queryCondition.request.keyword = ''
        this.selectedData = []
      },
      getRoot: function () {
        return (window.webRoot ? window.webRoot + '/' : null) || ''
      }
    }
  }
</script>

<style scoped lang="scss">
  template {
    display: block;
  }
  ::-webkit-input-placeholder {
    color: #c4ccd6;
  }
  .co-select_input {
    height: 36px;
    line-height: 36px;
    border-radius: 4px;
    border: 1px solid #c4ccd6;
    padding-left: 12px;
    font-size: 14px;
    color: #2c323e;
    width: 100%;
  }
  #co-select_input:focus {
    border: 1px solid #19bf4f;
  }
  table {
    text-align: center;
    padding: 5px;
    border-radius: 8px;
    border-collapse: separate;
    background-color: #ffffff;
    z-index: 99;
    tr {
      height: 34px;
    }
    thead {
      font-size: 14px;
      color: #454c5a;
      font-family: 冬青黑体简体中文W6;
      th {
        padding-bottom: 16px;
        border-bottom: 1px solid #e9f0f7;
      }
    }
    tbody {
      font-size: 14px;
      color: #454c5a;
      font-family: 微软雅黑regular;

      tr:hover {
        background-color: #effde8;
      }
    }
    tfoot {
      td {
        padding-top: 16px;
        border-top: 1px solid #e9f0f7;
        .co-select_total {
          font-size: 12px;
          color: #454c5a;
          padding: 0 14px;
          background-color: #f1f6fa;
          float: left;
          height: 30px;
          line-height: 30px;
          border-radius: 4px;
        }
      }
    }

    .selected {
      background-color: #effde8;
    }

    .co-select_btn {
      width: 120px;
      height: 32px;
      border: none;
      -webkit-border-radius: 4px;
      -moz-border-radius: 4px;
      border-radius: 4px;
      color: #ffffff;
      cursor: pointer;
      background-color: #19bf4f;
      font-size: 14px;
      font-family: 微软雅黑regular;
      float: right;
    }

    .co-select_btn:hover {
      opacity: 0.7;
    }
  }
</style>
