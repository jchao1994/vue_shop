import Vue from 'vue'
import App from './App.vue'
import router from './router'

import {Button, Form, FormItem, Input, Message} from 'element-ui'

Vue.config.productionTip = false

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.prototype.$message = Message


new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
