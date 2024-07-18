<template>
  <div>
    <h3>单据信息</h3>
    <p>所有货品出库、入库的单据都可以在这里查看。</p>

    <el-row>
      <el-col :span="24">
        <!-- <el-button type="primary" @click="$router.push('import')">入库</el-button> -->
        <el-button type="primary" @click="$router.push('export')">出库</el-button>
        <el-select v-model="companyId" @change="handleSelectChange" filterable clearable placeholder="请选择公司">
          <el-option v-for="item in companies" :key="item.id" :value="item.id" :label="item.id + '. ' + item.name">
          </el-option>
        </el-select>
        <el-select v-model="receiptType" @change="handleSelectChange" clearable placeholder="选择单据类型">
          <el-option value="in" label="入库"></el-option>
          <el-option value="out" label="出库"></el-option>
        </el-select>
        <el-input v-model="receiptSearch" placeholder="输入单据ID" clearable="" style="width: 180px;"></el-input>
        <el-button type="primary" @click="handleSelectChange">搜索</el-button>
        <el-popover placement="bottom" trigger="click" :width="100">
          <el-checkbox-group v-model="tableCols" @change="saveTableCols">
            <el-checkbox v-for="(col, index) in tableColsDef" :label="col.label" :key="col.label"
              style="display: block; line-height: 32px;"></el-checkbox>
          </el-checkbox-group>
          <el-button slot="reference" type="primary" icon="el-icon-menu"></el-button>
        </el-popover>
      </el-col>
      <!--<el-col :span="12"></el-col>-->
    </el-row>
    <br>

    <el-table :data="rows" border v-loading="loading">
      <!--<el-table-column type="selection"></el-table-column>-->
      <el-table-column prop="id" label="单据编号" width="150px" v-if="ifColumnShow('单据编号')"></el-table-column>
      <el-table-column prop="company_name" label="交易公司" v-if="ifColumnShow('交易公司')"></el-table-column>
      <el-table-column prop="date" label="制单时间" v-if="ifColumnShow('制单时间')"></el-table-column>
      <el-table-column prop="type" label="单据类型" v-if="ifColumnShow('单据类型')">
        <template slot-scope="scope">
          <span>{{ { in: '入库', out: '出库' }[scope.row.type] }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="" label="金额" v-if="ifColumnShow('金额')">
        <template slot-scope="scope">
          <span>{{ calcReceiptTotal(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="" label="货品" v-if="ifColumnShow('货品')">
        <template slot-scope="scope">
          <span>{{ calcReceiptProducts(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" v-if="ifColumnShow('创建时间')"></el-table-column>
      <el-table-column label="操作" v-if="ifColumnShow('操作')">
        <template slot-scope="scope">
          <el-button size="small" @click="openFormView(scope.row)" type="text">查看</el-button>
          <el-button size="small" @click="openFormEdit(scope.row)" type="text"
            v-if="methodIsEnableEdit(scope.row)">修改</el-button>
          <el-popconfirm title="确认删除？" @confirm="deleteRows('receipt', [scope.row.id])">
            <el-button slot="reference" size="small" type="text" style="margin-left: 10px;">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <br>

    <el-pagination layout="total, sizes, prev, pager, next" background @size-change="handleSizeChange"
      @current-change="getRows" :total="total" :page-size="pageSize" :current-page.sync="page"
      :page-sizes="[10, 20, 50]">
    </el-pagination>

    <el-dialog :title="computedIsEdit ? '修改单据' : '查看单据'" :visible.sync="formVisible" width="70%">
      <el-form v-model="form" inline label-position="left" label-width="80px">
        <el-form-item label="单据编号">
          <el-input v-model="form.id" disabled></el-input>
        </el-form-item>
        <el-form-item label="单据类型">
          <el-input :value="form.type === 'in' ? '入库' : '出库'" disabled></el-input>
        </el-form-item>
        <el-form-item label="制单时间">
          <el-date-picker type="date" v-model="form.date" value-format="yyyy-MM-dd"
            :disabled="!computedIsEdit"></el-date-picker>
        </el-form-item>
        <el-form-item label="购货单位">
          <el-select v-model="form.company_id" filterable v-if="computedIsEdit">
            <el-option v-for="item in companies" :key="item.id" :value="item.id" :label="item.id + '. ' + item.name">
            </el-option>
          </el-select>
          <el-input v-model="form.company_name" disabled v-else></el-input>
        </el-form-item>
        <el-form-item label="所属账户" v-if="form.account_name">
          <el-input v-model="form.account_name" disabled></el-input>
        </el-form-item>
        <el-form-item label="制单">
          <el-input v-model="form.creator" :disabled="!computedIsEdit"></el-input>
        </el-form-item>
        <el-form-item label="复核">
          <el-input v-model="form.reviewer" :disabled="!computedIsEdit"></el-input>
        </el-form-item>
        <el-form-item label="送货人">
          <el-input v-model="form.deliverer" :disabled="!computedIsEdit"></el-input>
        </el-form-item>

        <el-table :data="formRows" show-summary :summary-method="getSummaries">
          <el-table-column align="center" prop="product.name" label="品名及规格" width="240px">
            <template slot-scope="scope">
              {{ scope.row.product.name }} - {{ scope.row.product.model }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="product.company.name" label="厂家"></el-table-column>
          <el-table-column align="center" prop="product.unit" label="单位" width="80px"></el-table-column>
          <el-table-column align="center" prop="num" label="数量">
            <template slot-scope="scope">
              <el-input type="text" v-model="scope.row.num" v-if="computedIsEdit"></el-input>
              <span v-else>{{ scope.row.num }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="price" label="单价">
            <template slot-scope="scope">
              <el-input type="text" v-model="scope.row.price" v-if="computedIsEdit"></el-input>
              <span v-else>{{ scope.row.price }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="金额">
            <template slot-scope="scope">
              {{ Math.abs(scope.row.num * scope.row.price).toFixed(3) }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="batch" label="生产批号" min-width="100px">
            <template slot-scope="scope">
              <el-input type="text" v-model="scope.row.batch" v-if="computedIsEdit"></el-input>
              <span v-else>{{ scope.row.batch }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="" label="生产日期" min-width="100px">
            <template slot-scope="scope">
              <el-date-picker type="date" v-model="scope.row.produce_date" v-if="computedIsEdit"
                value-format="yyyy-MM-dd"></el-date-picker>
              <span v-else>{{ scope.row.produce_date }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="expire" label="有效期" min-width="100px">
            <template slot-scope="scope">
              <el-date-picker type="date" v-model="scope.row.expire" v-if="computedIsEdit"
                value-format="yyyy-MM-dd"></el-date-picker>
              <span v-else>{{ scope.row.expire }}</span>
            </template>
          </el-table-column>
        </el-table>

      </el-form>

      <span slot="footer">
        <el-button type="success" @click="formVisible = false" v-if="computedIsEdit">取消</el-button>
        <el-button type="danger" @click="submitForm()" v-if="computedIsEdit">保存</el-button>
        <el-button type="primary" @click="exportReceipt(form.id)" v-else>导出单据</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<style scoped></style>
<script setup>
import { ref, onMounted, computed, getCurrentInstance } from 'vue'

const $route = getCurrentInstance().proxy.$route;
const $http = getCurrentInstance().proxy.$http;
const $message = getCurrentInstance().proxy.$message;
const getAccountId = getCurrentInstance().proxy.getAccountId;

const loading = ref(false)
const companyId = ref('')
const companies = ref([])
const receiptType = ref('')
const receiptSearch = ref('')
const rows = ref([])
const total = ref(0)
const pageSize = ref(10)
const page = ref(1)
const formVisible = ref(false)
const formMode = ref('add')
const form = ref({
  id: 0,
  type: '',
  date: '',
  company_id: 0,
  company_name: '',
  account_name: '',
  creator: '',
  reviewer: '',
  deliverer: '',
})
const formRows = ref([])

const tableCols = ref([]);
const tableColsDef = ref([
  { label: '单据编号', },
  { label: '交易公司', },
  { label: '制单时间', },
  { label: '单据类型', },
  { label: '金额', },
  { label: '货品', checked: false, },
  { label: '创建时间', checked: false, },
  { label: '操作', },
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
  // console.log(tableColsDef.value.map((item) => item.label))
  tableCols.value.splice(0, 0, ...tableColsDef.value.filter((item) => {
    return item.checked !== false;
  }).map((item) => {
    return item.label;
  }))
}

const urls = {
  getRows: '/api/getReceipts',
  delRows: '/api/delRecords',
  add: '/receipt/create',
  edit: '/api/inventory/saveReceiptChangeV2',
  getAllCompanies: '/api/getAllCompanies',
}

const computedIsEdit = computed(() => {
  return formMode.value === 'edit';
})
function calcReceiptTotal(row) {
  let total = row.inventories.reduce((prev, item) => {
    return prev + Math.abs(item.num) * Number(item.price)
  }, 0)
  // console.log(total)
  return total.toFixed(2)
}
function calcReceiptProducts(row) {
  let products = row.inventories.map((item) => {
    return item.product.name.replace('一次性使用', '')
  })
  let tmpSet = new Set(products)
  return [...tmpSet].join('，')
}
function getSummaries(param) {
  const sums = [];
  const total = formRows.value.reduce((prev, curr) => {
    return prev + curr.price * Math.abs(curr.num);
  }, 0);
  sums[4] = '合计金额'
  sums[5] = isNaN(total) ? '0.00' : total.toFixed(2);
  return sums;
}
function methodIsEnableEdit(row) {
  // 允许修改最近1天创建的单据
  let isRecent = new Date(row.created_at).getTime() + 86400 * 1000 > new Date().getTime();
  return isRecent || window.$ims.enableReceiptEdit;
}
function exportReceipt(receiptId) {
  window.open('/receipt/export/' + receiptId)
}
function getRows() {
  loading.value = true;
  $http.get(urls.getRows, {
    params: {
      sort: 'id',
      order: 'desc',
      offset: pageSize.value * (page.value - 1),
      limit: pageSize.value,
      companyId: companyId.value,
      accountId: getAccountId(),
      search: receiptSearch.value,
      type: receiptType.value,
    }
  }).then(response => {
    rows.value.splice(0, rows.value.length, ...(response.data.rows || []));
    total.value = response.data.total || 0;
  }).finally(() => {
    loading.value = false;
  })
}
function deleteRows(module, records) {
  let form = {
    module,
    records
  };
  $http.post(urls.delRows, form).then(response => {
    if (response.data.error === 0) {
      $message.success(response.data.msg || '操作成功');
      getRows();
      return;
    }
    console.log(response);
    $message.error(response.data.msg || '请求错误');
  });
}
function getAllCompanies() {
  $http.get(urls.getAllCompanies).then(response => {
    companies.value.splice(0, companies.value.length, ...response.data.rows);
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
function openFormView(item) {
  formMode.value = 'view';
  Object.assign(form.value, item);
  let formatted = item.inventories.map((item) => {
    let tmp = Object.assign({}, item);
    tmp.num = Math.abs(item.num);
    return tmp;
  });
  formRows.value.splice(0, formRows.value.length, ...formatted)
  formVisible.value = true;
}
function openFormEdit(item) {
  formMode.value = 'edit';
  Object.assign(form.value, item);
  formRows.value = item.inventories.map((item) => {
    let tmp = Object.assign({}, item);
    tmp.num = Math.abs(item.num);
    return tmp;
  });
  formVisible.value = true;
}
function submitForm() {
  let url = formMode.value === 'add'
    ? urls.add
    : urls.edit;
  let formData = {
    id: form.value.id,
    date: form.value.date,
    company_id: form.value.company_id,
    creator: form.value.creator,
    reviewer: form.value.reviewer,
    deliverer: form.value.deliverer,
    rows: _.map(formRows.value, (item) => {
      return {
        id: item.id,
        num: item.num,
        price: item.price,
        batch: item.batch,
        expire: item.expire,
        produce_date: item.produce_date,
      };
    }),
  };

  $http.post(url, formData).then(response => {
    if (response.data.error === 0) {
      $message.success(response.data.msg || '操作成功');
      formVisible.value = false;
      getRows();
      return;
    }
    console.log(response);
    $message.error(response.data.msg || '请求错误');
  });
}

onMounted(() => {
  getAllCompanies();
  getRows();
  initTableCols();
  restoreTableCols();
})
</script>
