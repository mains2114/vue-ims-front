import Vue from 'vue'
import Router from 'vue-router'
import axios from 'axios'
import _ from 'lodash'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import './element-variables.scss'
import Index from './Index.vue'
import ProductInfoDialog from './components/ProductInfoDialog.vue'

// 全局配置
window.ims = {
  enableReceiptEdit: false,
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

const routes = [
  { path: '/', component: () => import('./Dashboard.vue') },
  { path: '/import', component: () => import('./Import.vue') },
  { path: '/export', component: () => import('./Export.vue') },
  { path: '/company', component: () => import('./Company.vue') },
  { path: '/product', component: () => import('./Product.vue') },
  { path: '/receipt', component: () => import('./Receipt.vue') },
  { path: '/inventory', component: () => import('./Inventory.vue') },
  // { path: '/purchaseManage/purchasePlan', component: () => import('./Import.vue') },
  { path: '/purchaseManage/ConfirmForm', component: () => import('./ConfirmForm.vue') },
  { path: '/purchaseManage/ConfirmLog', component: () => import('./ConfirmLog.vue') },
  { path: '/purchaseManage/ConfirmImport', component: () => import('./ConfirmImport.vue') },
  { path: '/changes', component: () => import('./Changes.vue') },
  { path: '/profile', component: () => import('./Profile.vue') },
  { path: '/manage', component: () => import('./Manage.vue') },
];

const router = new Router({
  routes
});

new Vue({
  router,
  el: '#app',
  render: h => h(Index)
});
