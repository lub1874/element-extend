// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
// import App from './App'
import ElementUI from 'element-ui'
// import router from './router'
import CoSelect from './components/co-select/co-select'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(CoSelect)

/* eslint-disable no-new */
// new Vue({
//   el: '#app',
//   router,
//   components: { App },
//   template: '<App/>'
// })
export default CoSelect
