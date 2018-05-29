import Vue from 'vue'
import Router from 'vue-router'
import axios from 'axios'
import _ from 'lodash'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Index from './Index.vue'

Vue.prototype.$http = axios;
// Vue.prototype.url = api => 'http://ims.local:8080' + api;
Vue.prototype.url = api => api;
Vue.use(ElementUI);
Vue.use(Router);

const routes = [
  { path: '/import', component: () => import('./Import.vue') },
  { path: '/export', component: () => import('./Export.vue') },
  { path: '/company', component: () => import('./Company.vue') },
  { path: '/product', component: () => import('./Product.vue') },
  { path: '/receipt', component: () => import('./Receipt.vue') },
  { path: '/inventory', component: () => import('./Inventory.vue') },
  { path: '/purchaseManage/purchasePlan', component: () => import('./Import.vue') },
  { path: '/purchaseManage/ConfirmForm', component: () => import('./ConfirmForm.vue') },
  { path: '/purchaseManage/ConfirmLog', component: () => import('./ConfirmLog.vue') },
  { path: '/purchaseManage/purchaseImport', component: () => import('./Import.vue') },
];

const router = new Router({
  routes
});

new Vue({
  router,
  el: '#app',
  render: h => h(Index)
});
