import jQuery from 'jquery'
import util from './co-util'
import { Loading } from 'element-ui'
import Vue from 'vue'
const baseUrl = '/api/'

/**
 * Returns 当前组件需要的查询条件
 * @param obj {start: 0, limit: 10,results: 0,pageIndex: 1}
 * @type Object {start: 0, limit: 10,results: 0,pageIndex: 1}
 */
export const getQueryCondition = (obj) => {
  obj = obj || {}
  let page = {
    start: obj.start || 0,
    limit: obj.limit || 10,
    results: obj.results || 0
  }
  page.pageIndex = obj.pageIndex || Math.floor(page.start / page.limit) + 1
  const start = (page.pageIndex - 1) * page.limit
  page.start = start
  return page
}

export const getCurrentPage = (pageResponse) => {
  let currentPage = {
    start: pageResponse.start || 0,
    limit: pageResponse.limit || 10,
    results: pageResponse.results || 0
  }
  const pageIndex = Number(currentPage.start / currentPage.limit) + 1
  currentPage.pageIndex = pageIndex
  return currentPage
}

/**
 * 通过复杂对象的查询数据的方法,复杂对象的更新contentType采用'application/jsoncharset=utf-8'
 * 参数采用标准的json格式
 * @param obj.url 服务接口, 指定了 url 就不需要指定 service, version, method
 * @param obj.service 调用的服务
 * @param obj.version 调用服务的版本
 * @param obj.method 调用服务的方法
 * @param obj.data 查询参数。
 * @param obj.dataType 返回数据类型.
 * @param obj.async 是否同步.
 * @param obj.loading loading展示标识:true展示, false 或者不填写不展示
 * @param obj.success 查询成功的回调函数。
 * @param obj.error 查询失败的回调函数。如果没有特殊处理建议不赋值，方法提供了默认处理
 * @param obj.dealException 是否自己处理返回异常
 * @param obj.contentType 服务器接收参数
 */
export const post = (obj) => {
  let url = getUrl(obj)
  const dataType = obj.dataType || 'json'
  const data = obj.data || {}
  const success = obj.success
  const error = obj.error || null
  const async = obj.async !== false
  const dealException = obj.dealException === true
  const contentType = obj.contentType ? obj.contentType : 'application/x-www-form-urlencoded'
	_dealPostParam(data, true) // 处理非必填的 null undefined ''
	const loading = obj.loading !== false
	jQuery.ajax({
		url: url,
		type: 'POST',
		data: obj.url ? data : { 'parameter': JSON.stringify({ body: data }) },
		async: async,
		dataType: dataType,
        contentType: contentType,
        beforeSend: (XMLHttpRequest) => {
          if (loading) {
            openFullScreen()
          }
        },
        complete: (XMLHttpRequest, textStatus) => {
          if (loading) {
            closeFullScreen()
          }
        },
        success: function (data) {
          // 关闭loading
          if (data.status === 0 && !dealException) {
            dealExceptionFun(data)
          } else {
            success(data)
          }
        },
        error: (XMLHttpRequest) => {
          // 关闭loading
          error && error(XMLHttpRequest)
          dealError(XMLHttpRequest, obj)
        }
      })
    }
    let counter = () => {
      let count = 0
      const add = () => {
        count++
      }
      const getCount = () => {
        return count
      }
      const rest = () => {
        count = 0
      }
      const minus = () => {
        count--
      }
      return { add: add, minus: minus, getCount: getCount, rest: rest }
    }
    let loadingObject = null
    /**
     * openFullScreen  加载
     * @param
     */
    let openFullScreen = () => {
      // console.log('loading start')
      if (!loadingObject) {
        loadingObject = {
          loadingInstance: Loading.service({
            lock: true,
            spinner: 'loading',
            background: 'rgba(0, 0, 0, 0.5)'
          }),
          counter: counter()
        }
      } else {
        loadingObject.loadingInstance = Loading.service({
          lock: true,
          spinner: 'loading',
          background: 'rgba(0, 0, 0, 0.5)'
        })
        loadingObject.counter.add()
      }
    }
    let closeFullScreen = () => {
      // console.log('loading end')
      loadingObject.counter.minus()
      if (loadingObject.counter.getCount() <= 1) {
        Vue.nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
          loadingObject.loadingInstance.close()
        })
      }
      setTimeout(function () {
        if (loadingObject.loadingInstance.visible) {
          loadingObject.loadingInstance.close()
        }
      }, 1500)
    }

let getUrl = (obj) => {
	if ((!obj.service || !obj.method) && !obj.url) {
		throw Error('请指定请求地址')
	}
	if (obj.url) {
		return util.getRoot() + baseUrl + obj.url + '.html'
	}
	const version = obj.version || '1.0.0'
	let servicePath = ''
	switch (obj.service) {
	case 'SupplierService':
		servicePath = 'com.today.api.supplier.service.SupplierService'
		break
	case 'GoodsAdminService':
		servicePath = 'com.today.api.goods.service.GoodsAdminService'
		break
	case 'CategoryService':
		servicePath = 'com.today.api.category.service.CategoryService'
		break
	case 'MemberService':
		servicePath = 'com.today.api.member.service.MemberService'
		break
	case 'AddressService':
		servicePath = 'com.today.api.address.service.AddressService'
    	break
  	case 'DictionaryService':
    	servicePath = 'com.today.api.dictionary.service.DictionaryService'
    	break
  	case 'SkuPriceService':
    	servicePath = 'com.today.api.goods.service.SkuPriceService'
    	break
	case 'LayoutService':
		servicePath = 'com.today.api.layout.service.LayoutService'
       break
    case 'SkuBuyingPriceService':
		servicePath = 'com.today.api.supplier.service.SkuBuyingPriceService'
    break
  case 'PurchaseService':
    servicePath = 'com.today.api.purchase.service.PurchaseService'
		break
	case 'demo':
		servicePath = 'demo'
		break
	default:
		throw Error('请指定请求服务')
	}
	if (servicePath === 'demo') {
		return util.getRoot() + baseUrl + servicePath + '/' + obj.method + '.html'
	}
	return util.getRoot() + baseUrl + servicePath + '/' + version + '/' + obj.method + '.html'
}

/**
 * 回调处理
 * @param {*} XMLHttpRequest XMLHttpRequest
 * @param {*} ajaxParam ajaxParam
 */
let dealError = (XMLHttpRequest, ajaxParam) => {
  // 确保每次只弹出一个 toast, 手动处理的不在此列
  console.error('ajax请求参数:', JSON.stringify(ajaxParam))
  console.error('ajax 请求地址:', getUrl(ajaxParam))
  if (ajaxParam.error) {
    ajaxParam.error(XMLHttpRequest)
  } else {
    let msg = XMLHttpRequest.responseText
    let toastMsg = msg
    switch (XMLHttpRequest.status) {
      case 400:
        toastMsg = '参数错误'
        break
      case 401:
        toastMsg = '未登录，请登录！'
        break
      case 403:
        toastMsg = '没有操作权限！'
        break
      case 404:
        toastMsg = '404啦...快去检查链接!'
        // TODO 需要404页面
        break
      case 405:
        toastMsg = '方法不允许请求!请检查方法的RequestMethod前后端配置是否一致'
        break
      case 408:
        toastMsg = '请求超时...！'
        break
      case 413:
        toastMsg = '请求数据超大,请查看是否上传了大附件'
        break
      case 500:
        toastMsg = '服务出错' + msg
        break
      case 502:
        msg = toastMsg = '网络连接失败,请检查网络连接'
        break
      case 504:
        msg = toastMsg = '网络连接失败,请检查网络连接'
        break
      case 631:
        break
      case 632:
        break
      default:
        toastMsg = '未知的错误, 请联系管理员'
    }
    // 打印错误消息
    util.message({ message: toastMsg })
    console.error(toastMsg)
  }
}

/**
 *
 * @param {*} data
 */
let dealExceptionFun = (data) => {
  console.error(`${data.responseCode}: ${data.responseMsg}`)
  util.message({ message: data.responseMsg })
  // throw Error(`${data.responseCode}: ${data.responseMsg}`)
}

//  处理更新和创建的参数
let _dealPostParam = (param) => {
  delete param.pageIndex
  delete param.results
  delete param.createdAt //  创建时间
  delete param.updatedAt //  更新时间
  delete param.operatorId // 操作人
  delete param.createdBy //  创建人
  delete param.updatedBy //  更新人
  dealParams(param, false) //  删除无意义字段 null undefined
}
/**
 * 删除无意义字段 null undefined ''
 */
let dealParams = (params, isDelBlackStr) => {
  if (isDelBlackStr === undefined) {
    isDelBlackStr = true
  }
  if (!util.isEmptyObject(params)) {
    for (var p in params) {
      if ((params[p] === '' && isDelBlackStr) || (params[p] !== 0 && params[p] !== false && !params[p] &&
        (typeof params[p] !== 'boolean' || typeof params[p] !== 'number'))) {
        delete params[p]
      }
    }
  }
}
