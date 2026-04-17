import Vue from 'vue'
import Router from 'vue-router'
import axios from 'axios'
import _ from 'lodash'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import './element-variables.scss'
import Index from './views/Index.vue'
import ProductInfoDialog from './components/ProductInfoDialog.vue'
import { createPinia, PiniaVuePlugin } from 'pinia'

// 全局配置
window.$ims = {
  enableReceiptEdit: false,
  user: null,
  account: null,
};

Vue.filter('toFixed', function(num, precision = 2) {
  return num.toFixed(precision);
});
Vue.filter('trimZeroDate', function(date) {
  return date === '0000-00-00' ? '' : date;
});

Vue.component('ProductInfoDialog', ProductInfoDialog);

axios.interceptors.response.use(function (response) {
  // Do something with response data
  return response;
}, function (error) {
  // Do something with response error

  // if meets http status 401, login again
  if (error.response && error.response.status === 401) {
    window.location.href = '/';
  }

  return Promise.reject(error);
});
Vue.prototype.$http = axios;
Vue.prototype.getAccountId = () => {
  return window.$ims.account && window.$ims.account.id || 0;
}
Vue.prototype.getUsername = () => {
  return window.$ims.user && window.$ims.user.name || '';
}

// Vue.prototype.url = api => 'http://ims.local:8080' + api;
Vue.prototype.url = api => api;
Vue.prototype.apiList = () => {
  return {
    delRecords: '/api/delRecords',
    getAllCompanies: '/api/getAllCompanies',
    getCompanies: '/api/getCompanies',
    getExpireWarning: '/api/getExpireWarning',
    getInventories: '/api/getInventories',
    getInventoryWarning: '/api/getInventoryWarning',
    getProducts: '/api/getProducts',
    getProductTree: '/api/getProductTree',
    getReceipts: '/api/getReceipts',
    getStorage: '/api/getStorage',
    saveReceiptChangeV2: '/api/inventory/saveReceiptChangeV2',
    lockStorage: '/api/lockStorage',
    addConfirmLog: '/api/purchase/addConfirmLog',
    editConfirmLog: '/api/purchase/editConfirmLog',
    getConfirmLog: '/api/purchase/getConfirmLog',
    companyEdit: '/company/',
    companyCreate: '/company/create',
    export: '/inventory/export',
    import: '/inventory/import',
    logout: '/logout',
    productEdit: '/product/',
    productCreate: '/product/create',
    receiptCreate: '/receipt/create',
    receiptExport: '/receipt/export',
  }
};
Vue.use(ElementUI);
Vue.use(Router);
Vue.use(PiniaVuePlugin);
const pinia = createPinia()

const routes = [
  { path: '/', component: () => import('./views/Dashboard.vue') },
  { path: '/import', component: () => import('./views/Import.vue') },
  { path: '/export', component: () => import('./views/Export.vue') },
  { path: '/company', component: () => import('./views/Company.vue') },
  { path: '/product', component: () => import('./views/Product.vue') },
  { path: '/receipt', component: () => import('./views/Receipt.vue') },
  { path: '/inventory', component: () => import('./views/Inventory.vue') },
  // { path: '/purchaseManage/purchasePlan', component: () => import('./views/Import.vue') },
  { path: '/purchaseManage/ConfirmForm', component: () => import('./views/ConfirmForm.vue') },
  { path: '/purchaseManage/ConfirmLog', component: () => import('./views/ConfirmLog.vue') },
  { path: '/purchaseManage/ConfirmImport', component: () => import('./views/ConfirmImport.vue') },
  { path: '/changes', component: () => import('./views/Changes.vue') },
  { path: '/profile', component: () => import('./views/Profile.vue') },
  { path: '/manage', component: () => import('./views/Manage.vue') },
];

const router = new Router({
  routes
});

// 设置页面标题
if (import.meta.env.MODE === 'production') {
  document.title = '库存管理';
} else {
  document.title = '库存管理 - ' + import.meta.env.MODE;
}

new Vue({
  router,
  pinia,
  el: '#app',
  render: h => h(Index)
});
