<template>
  <div>
    <h3>货品流水</h3>
    <el-row>
      <el-col :span="24">
        <!-- <el-button type="primary" @click="$router.push('import')">入库</el-button> -->
        <!-- <el-button type="primary" @click="$router.push('export')">出库</el-button> -->
        <el-date-picker v-model="daterange" type="daterange" value-format="yyyy-MM-dd" range-separator="~"
          start-placeholder="开始日期" end-placeholder="结束日期" unlink-panels :picker-options="pickerOptions"></el-date-picker>
        <el-select v-model="receiptType" @change="handleSelectChange" clearable placeholder="选择单据类型">
          <el-option value="in" label="入库"></el-option>
          <el-option value="out" label="出库"></el-option>
        </el-select>
        <AccountSelect v-bind:modelValue.sync="accountId"></AccountSelect>
        <CompanySelect v-bind:modelValue.sync="companyId"></CompanySelect>
        <el-cascader placeholder="请选择货品" clearable filterable v-model="productTreeVal" :options="productTree"
          :props="{ expandTrigger: 'click', checkStrictly: true }" @change="handleSelectChange"></el-cascader>
        <el-button type="primary" @click="handleSelectChange">搜索</el-button>
        <el-popover placement="bottom" trigger="click" ref="popoverOptionalColunns">
          <el-checkbox-group v-model="tableCols" @change="saveTableCols">
            <el-checkbox v-for="(col, index) in tableColsDef" :label="col.label" :key="col.label"
              style="display: block; line-height: 32px;"></el-checkbox>
          </el-checkbox-group>
        </el-popover>
        <el-tooltip effect="dark" content="显示/隐藏表格列" placement="top">
          <el-button type="primary" icon="el-icon-menu" v-popover:popoverOptionalColunns></el-button>
        </el-tooltip>
        <el-dropdown split-button type="primary" trigger="click" @command="handleCommand">
          操作
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="generateDelivery" :disabled="!rowIdStr">生成发货单</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-row>
    <br>
    <el-table :data="rows" border v-loading="loading" @selection-change="handleSelectionChange">
      <el-table-column type="selection" v-if="ifColumnShow('多选框')"></el-table-column>
      <el-table-column prop="id" label="编号" width="70" v-if="ifColumnShow('编号')"></el-table-column>
      <el-table-column prop="receipt_time" label="操作时间" v-if="ifColumnShow('操作时间')"></el-table-column>
      <el-table-column prop="receipt_id" label="单据" v-if="ifColumnShow('单据')"></el-table-column>
      <el-table-column prop="receipt_type" label="单据类型" v-if="ifColumnShow('单据类型')">
        <template slot-scope="scope">
          {{ scope.row.receipt_type === 'in' ? '入库' : '出库' }}
        </template>
      </el-table-column>
      <el-table-column prop="receipt.date" label="单据日期" v-if="ifColumnShow('单据日期')"></el-table-column>
      <el-table-column prop="company_name" label="交易公司" v-if="ifColumnShow('交易公司')"></el-table-column>
      <el-table-column prop="manufacturer" label="生产商" v-if="ifColumnShow('生产商')"></el-table-column>
      <el-table-column prop="product_name" label="货品及规格" min-width="140" v-if="ifColumnShow('货品及规格')">
        <template slot-scope="scope">
          <el-link type="primary" :underline="false" @click="openProductDialog(scope.row.product)">{{
        scope.row.product_name + ' - ' + scope.row.product_model }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="batch" label="生产批号" v-if="ifColumnShow('生产批号')"></el-table-column>
      <el-table-column prop="produce_date" label="生产日期" v-if="ifColumnShow('生产日期')"></el-table-column>
      <el-table-column prop="expire" label="有效期" v-if="ifColumnShow('有效期')"></el-table-column>
      <el-table-column prop="num" label="数量" v-if="ifColumnShow('数量')"></el-table-column>
      <el-table-column prop="product_unit" label="单位" v-if="ifColumnShow('单位')"></el-table-column>
      <el-table-column prop="price" label="单价" v-if="ifColumnShow('单价')">
        <template slot-scope="scope">
          {{ parseFloat(scope.row.price) }}
        </template>
      </el-table-column>
      <el-table-column prop="price_total" label="总价" v-if="ifColumnShow('总价')">
        <template slot-scope="scope">
          {{ Math.abs(scope.row.num * scope.row.price).toFixed(2) }}
        </template>
      </el-table-column>
    </el-table>
    <br>
    <el-pagination layout="total, sizes, prev, pager, next" background @size-change="handleSizeChange"
      @current-change="getRows" :total="total" :page-size="pageSize" :current-page.sync="page"
      :page-sizes="[10, 20, 50]">
    </el-pagination>

    <el-dialog :title="formMode === 'edit' ? '编辑货品' : '添加货品'" :visible.sync="formVisible">
      <el-form v-model="form" inline label-position="left" label-width="80px" disabled>
        <el-form-item label="单据编号" v-if="formMode === 'edit'">
          <el-input v-model="form.id" disabled></el-input>
        </el-form-item>
        <el-form-item label="制单时间">
          <el-date-picker type="date" v-model="form.date" value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>
        <el-form-item label="购货单位">
          <CompanySelect v-bind:modelValue.sync="form.company_id"></CompanySelect>
        </el-form-item>
      </el-form>
      <el-table :data="formRows">
        <el-table-column align="center" prop="product.name" label="品名及规格" width="240px">
          <template slot-scope="scope">
            {{ scope.row.product.name }} - {{ scope.row.product.model }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="product.company_id" label="厂家"></el-table-column>
        <el-table-column align="center" prop="product.unit" label="单位"></el-table-column>
        <el-table-column align="center" prop="num" label="数量">
          <template slot-scope="scope">
            {{ Math.abs(scope.row.num) }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="price" label="单价"></el-table-column>
        <el-table-column align="center" label="金额">
          <template slot-scope="scope">
            {{ Math.abs(scope.row.num * scope.row.price) }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="batch" label="生产批号"></el-table-column>
        <el-table-column align="center" prop="expire" label="有效期"></el-table-column>
      </el-table>
    </el-dialog>

    <ProductInfoDialog ref="refProductInfoDialog"></ProductInfoDialog>
  </div>
</template>
<style scoped></style>
<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import AccountSelect from './components/AccountSelect.vue'
import CompanySelect from './components/CompanySelect.vue'

const $route = getCurrentInstance().proxy.$route;
const $http = getCurrentInstance().proxy.$http;
const getAccountId = getCurrentInstance().proxy.getAccountId;

const refProductInfoDialog = ref(null)
const loading = ref(false)
const rowIdStr = ref('')
const companyId = ref('')
const accountId = ref('')

const start = new Date()
const end = new Date()
start.setTime(start.getTime() - 3600 * 1000 * 24 * 365 * 3)
const daterange = ref([start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)])
const pickerOptions = {
  shortcuts: [{
    text: '最近一年',
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
      picker.$emit('pick', [start, end]);
    }
  }, {
    text: '最近两年',
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 365 * 2);
      picker.$emit('pick', [start, end]);
    }
  }, {
    text: '最近三年',
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 365 * 3);
      picker.$emit('pick', [start, end]);
    }
  }, {
    text: '最近五年',
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 365 * 5);
      picker.$emit('pick', [start, end]);
    }
  }, {
    text: '最近十年',
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 365 * 10);
      picker.$emit('pick', [start, end]);
    }
  }]
}

const productTree = ref([])
const productTreeVal = ref([])
const receiptType = ref('')
const rows = ref([])
const total = ref(0)
const pageSize = ref(10)
const page = ref(1)
const formVisible = ref(false)
const formMode = ref('add')
const form = ref({})
const formRows = ref([])
const urls = {
  generateDelivery: '/api/receipt/generateDelivery',
  getRows: '/api/getInventories',
  add: '/product/create',
  edit: '/product/',
  getAllCompanies: '/api/getAllCompanies',
  getProductTree: '/api/getProductTree',
}

const tableCols = ref([]);
const tableColsDef = ref([
  { label: '多选框', checked: false, },
  { label: '编号', checked: false, },
  { label: '操作时间', },
  { label: '单据', checked: false, },
  { label: '单据类型', checked: false, },
  { label: '单据日期', checked: false, },
  { label: '交易公司', },
  { label: '生产商', },
  { label: '货品及规格', },
  { label: '生产批号', },
  { label: '生产日期', checked: false, },
  { label: '有效期', },
  { label: '数量', },
  { label: '单位', checked: false, },
  { label: '单价', checked: false, },
  { label: '总价', checked: false, },
]);
// 是否展示某列
function ifColumnShow(col) {
  return tableCols.value.indexOf(col) !== -1;
}
// 保存表格列配置
function saveTableCols() {
  // console.log('saveTableCols', $route)
  let key = $route.path + '#tableCols';
  localStorage.setItem(key, JSON.stringify(tableCols.value));
}
// 恢复表格列配置
function restoreTableCols() {
  // console.log('restoreTableCols')
  let key = $route.path + '#tableCols';
  let value = localStorage.getItem(key)
  if (value) {
    tableCols.value = JSON.parse(value);
  }
}
// 初始化表格列配置
function initTableCols() {
  // tableColsDef.value.splice(8, 0, ...formExtCfg.value.map((item) => {
  //   return { label: item.label, checked: false, };
  // }))
  // console.log(tableColsDef.value.map((item) => item.label))
  tableCols.value.splice(0, 0, ...tableColsDef.value.filter((item) => {
    return item.checked !== false;
  }).map((item) => {
    return item.label;
  }))
}


function openProductDialog(product) {
  refProductInfoDialog.value.show(product);
}
function handleSelectionChange(val) {
  let rowIdArr = [];
  val.map((el) => {
    rowIdArr.push(el.id);
  })
  rowIdStr.value = rowIdArr.join(',');
}
function handleCommand(command) {
  if (command === 'generateDelivery') {
    generateDelivery();
  }
}
function generateDelivery() {
  window.open(urls.generateDelivery + '?companyId=' + companyId.value + '&rowIdStr=' + rowIdStr.value);
}
function getRows() {
  loading.value = true;
  $http.get(urls.getRows, {
    params: {
      sort: 'id',
      order: 'desc',
      offset: pageSize.value * (page.value - 1),
      limit: pageSize.value,
      start: daterange.value && daterange.value[0] || '',
      end: daterange.value && daterange.value[1] || '',
      companyId: companyId.value,
      accountId: accountId.value,
      receiptType: receiptType.value,
      productCompany: productTreeVal.value[0],
      product: productTreeVal.value[1]
    }
  }).then(response => {
    rows.value.splice(0, rows.value.length, ...(response.data.rows || []));
    total.value = response.data.total || 0;
  }).finally(() => {
    loading.value = false;
  })
}
function getProductTree() {
  $http.get(urls.getProductTree).then(response => {
    let rows = response.data.rows;
    let formatted = rows.map(company => {
      return {
        value: company.id,
        label: company.id + '. ' + company.name,
        children: company.products.map(product => {
          return {
            value: product.id,
            label: product.name + ' - ' + product.model
          }
        })
      };
    });
    productTree.value.splice(0, productTree.value.length, ...formatted)
  });
}
function handleSizeChange(val) {
  pageSize.value = val;
  getRows();
}
function handleSelectChange() {
  page.value = 1;
  getRows();
}

onMounted(() => {
  getProductTree();
  getRows();
  initTableCols();
  restoreTableCols();
})
</script>
