# co-select

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).


#### 1、模糊查询基础组件
```html
<co-select></co-select>
```
1.不建议直接引用该组件，建议再进行一层封装之后，再使用。

2.封装传入参数：
```html
  theadList: [{ // Array 表头
     'tableName': '供应商No',
     'tableField': 'supplierNo',
     'thStyle': { // 样式，只有宽度可设置
        width: '150px'
     },
     backFillFlag: '' // 表示这个字段是否是回填字段，Boolean 类型，默认false
  }],
  placeholder: '' // String，输入框中显示的 placeholder
  url: {} // Object 需要包含服务名，版本号，方法名
  bindFun // 传入处理接口返回数据的方法，有默认方法
  multiple // Boolean 是否多选，默认false
  placement: '' // String 可填字段：top, bottom, left, right, 可加后缀：start, end; 中间使用 - 连接
  showPagination  // Boolean 是否需要分页，默认false
  disabled  // Boolean input输入框是否禁用
  bindKey // 查询条件中间的字段
  backFillContent // 初始化回填内容
  requestObj // 接受外部传入查询条件，然后混入到queryCondition.request中间去查询
```
3.如果接口返回的数据格式有一些特殊，可以自己传入处理数据函数。 通过prop中的 bindFun 传入

4.事件抛出。 统一使用 change

5.分页默认的size是10
```
