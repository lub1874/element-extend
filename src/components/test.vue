<template>
  <div class="test">
    <co-select @change="onSelect" :bind-key.sync="key" :disabled="disabled" :back-fill-content="backFillContent" :thead-list="theadList" :bind-fun="filterData" :url="url" :placeholder="placeholder" ref="coSelect" :placement="placement"></co-select>
  </div>
</template>

<script>
  import CoSelect from './co-select/co-select'

  export default {
    components: {CoSelect},
    name: 'test',
    data () {
      return {
        theadList: [
          {
            'tableName': '商品类型',
            'tableField': 'typeLabel',
            'thStyle': {
              width: '200px'
            }
          },
          {
            'tableName': '商品名称',
            'tableField': 'skuName',
            'thStyle': {
              width: '200px'
            },
            backFillFlag: true // 回填标记，Boolean类型，默认false
          },
          {
            'tableName': '主供应商',
            'tableField': 'masterSupplierName',
            'thStyle': {
              width: '200px'
            }
          }
        ],
        url: 'com.today.api.goods.service.GoodsAdminService/1.0.0/listSkuByKeyword.html',
        placeholder: '请输入货号或者主条码',
        placement: 'right'
        // keywordLength: 2
      }
    },
    props: {
      bindKey: {
        type: String,
        default: ''
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
    computed: {
      key: {
        get: function () {
          return this.bindKey
        },
        set: function (val) {
          if (!val) {
            this.$emit('update:bindKey', '')
          }
        }
      }
    },
    methods: {
      onSelect: function (data) {
        console.log('selected: ' + data)
        this.$emit('change', data)
      },
      filterData: function (res) {
        let results = res.success.skuList || []
        return results
      }
    }
  }
</script>
