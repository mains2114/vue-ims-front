<template>
  <div>
    <h3>货品信息</h3>
    <el-row>
      <el-col :span="24">
        <el-button type="primary" @click="openFormAdd()">添加</el-button>
        <el-select v-model="companyId" @change="handleSelectChange" filterable clearable placeholder="请选择生产商">
          <el-option v-for="item in companies" v-if="item.type === 'manufacturer'" :key="item.id" :value="item.id"
            :label="item.id + '. ' + item.name">
          </el-option>
        </el-select>
        <el-input v-model.trim="searchName" placeholder="请输入货品名称" clearable="" style="width: 180px;"></el-input>
        <el-input v-model.trim="searchModel" placeholder="请输入规格型号" clearable="" style="width: 180px;"></el-input>
        <el-button type="primary" @click="handleSelectChange">搜索</el-button>
        <el-popover placement="bottom" trigger="click" :width="100">
          <el-checkbox-group v-model="tableCols" @change="saveTableCols">
            <el-checkbox v-for="(col, index) in tableColsDef" :label="col.label" :key="col.label"
              style="display: block; line-height: 32px;"></el-checkbox>
          </el-checkbox-group>
          <el-button slot="reference" type="primary" icon="el-icon-menu"></el-button>
        </el-popover>
      </el-col>
    </el-row>
    <br>
    <el-table :data="rows" border v-loading="loading">
      <!--<el-table-column type="selection"></el-table-column>-->
      <el-table-column prop="id" label="编号" sortable width="80px" v-if="ifColumnShow('编号')"></el-table-column>
      <el-table-column prop="name" label="名称" sortable v-if="ifColumnShow('名称')"></el-table-column>
      <el-table-column prop="model" label="规格" sortable v-if="ifColumnShow('规格')"></el-table-column>
      <el-table-column prop="company.name" label="生产商" v-if="ifColumnShow('生产商')"></el-table-column>
      <el-table-column prop="unit" label="单位" width="80px" v-if="ifColumnShow('单位')"></el-table-column>
      <el-table-column prop="price" label="单价" width="100px" v-if="ifColumnShow('单价')"></el-table-column>
      <el-table-column prop="approval" label="注册号" v-if="ifColumnShow('注册号')"></el-table-column>
      <el-table-column prop="permit" label="生产许可证" v-if="ifColumnShow('生产许可证')"></el-table-column>
      <template v-for="(cfg, index) in formExtCfg">
        <el-table-column :prop="'ext.' + cfg.field" :label="cfg.label" :key="cfg.field"
          v-if="ifColumnShow(cfg.label)"></el-table-column>
      </template>
      <el-table-column prop="" label="库存" v-if="ifColumnShow('库存')">
        <template slot-scope="scope">
          <el-popover trigger="click">
            <el-table :data="scope.row.storage">
              <el-table-column prop="batch" label="生产批号" width="100px"></el-table-column>
              <el-table-column prop="produce_date" label="生产日期" width="100px"></el-table-column>
              <el-table-column prop="expire" label="过期时间" width="100px"></el-table-column>
              <el-table-column prop="num" label="库存"></el-table-column>
            </el-table>
            <a href="#" slot="reference" @click.prevent>
              {{ scope.row.storage.reduce((acc, curr) => acc + parseInt(curr.num), 0) }}
            </a>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="操作" v-if="ifColumnShow('操作')">
        <template slot-scope="scope">
          <el-button size="small" @click="openFormEdit(scope.row)" type="text">编辑</el-button>
          <el-button size="small" @click="openFormAdd(scope.row)" type="text">复制</el-button>
          &nbsp;
          <el-popconfirm title="确认删除？" @confirm="deleteRows('product', [scope.row.id])">
            <el-button slot="reference" size="small" type="text">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <br>
    <el-pagination layout="total, sizes, prev, pager, next" background @size-change="handleSizeChange"
      @current-change="getRows" :total="total" :page-size="pageSize" :current-page.sync="page"
      :page-sizes="[10, 20, 50]">
    </el-pagination>
    <el-dialog :title="formMode === 'edit' ? '编辑货品' : '添加货品'" :visible.sync="formVisible">
      <el-form :model="form" label-position="left" label-width="110px">
        <el-form-item label="编号" v-if="formMode === 'edit'">
          <el-input v-model="form.id" disabled></el-input>
        </el-form-item>
        <el-form-item label="货品名称">
          <el-input v-model="form.name"></el-input>
          请输入货品名称，限定2-50个字符。
        </el-form-item>
        <el-form-item label="规格型号">
          <el-input v-model="form.model"></el-input>
          请输入货品规格型号，限定1-50个字符。
        </el-form-item>
        <el-form-item label="生产商">
          <el-select v-model="form.company_id" filterable>
            <el-option v-for="item in companies" v-if="item.type === 'manufacturer'" :key="item.id" :value="item.id"
              :label="item.id + '. ' + item.name">
            </el-option>
          </el-select>
          <br>
          请选择该货品的生产商。如果没有对应的，请先在公司页面添加。
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="form.unit"></el-input>
          货品销售时，使用的最小单位（如，支）。
        </el-form-item>
        <el-form-item label="单价（元）">
          <el-input-number v-model="form.price" :step="0.001" :min="0"></el-input-number>
          货品单价，支持三位小数。
        </el-form-item>
        <el-form-item label="注册号">
          <el-input v-model="form.approval"></el-input>
        </el-form-item>
        <el-form-item label="生产许可证">
          <el-input v-model="form.permit"></el-input>
        </el-form-item>
        <el-form-item label="中标号">
          <el-input v-model="form.bid"></el-input>
        </el-form-item>
        <el-divider></el-divider>
        <el-form-item v-for="(cfg, index) in formExtCfg" :label="cfg.label" :key="cfg.label">
          <el-input v-model="formExt[cfg.field]"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button @click="formVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog title="库存详情" :visible.sync="dialog2Visible">
      <el-table :data="dialog2Rows" border>
        <el-table-column prop="batch" label="生产批号"></el-table-column>
        <el-table-column prop="num" label="库存"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<style scoped></style>
<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'

const $route = getCurrentInstance().proxy.$route;
const $message = getCurrentInstance().proxy.$message;
const $http = getCurrentInstance().proxy.$http;

const loading = ref(false);
const companyId = ref('');
const companies = ref([]);
const searchName = ref('');
const searchModel = ref('');
const rows = ref([]);
const total = ref(0);
const pageSize = ref(10);
const page = ref(1);
const formVisible = ref(false);
const formMode = ref('add');
const form = ref({
  id: 0,
  name: '',
  model: '',
  company_id: '',
  unit: '',
  price: '',
  approval: '',
  permit: '',
  bid: '',
});
const formExt = ref({
  yb_code: '',
  price_online: '',
  packing_size: '',
  warning_num: '',
});
const formDefault = Object.assign({}, form.value);
const formExtDefault = Object.assign({}, formExt.value);
const formExtCfg = ref([
  { field: 'yb_code', label: '医保编码' },
  { field: 'price_online', label: '挂网价' },
  { field: 'packing_size', label: '包装规格' },
  { field: 'warning_num', label: '库存预警值' },
]);
const tableCols = ref([]);
const tableColsDef = ref([
  { label: '编号', },
  { label: '名称', },
  { label: '规格', },
  { label: '生产商', },
  { label: '单位', },
  { label: '单价', },
  { label: '注册号', },
  { label: '生产许可证', checked: false, },
  { label: '库存', },
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
  tableColsDef.value.splice(8, 0, ...formExtCfg.value.map((item) => {
    return { label: item.label, checked: false, };
  }))
  // console.log(tableColsDef.value.map((item) => item.label))
  tableCols.value.splice(0, 0, ...tableColsDef.value.filter((item) => {
    return item.checked !== false;
  }).map((item) => {
    return item.label;
  }))
}

const dialog2Visible = ref(false);
const dialog2Rows = ref([]);
const urls = {
  getRows: '/api/getProducts',
  delRows: '/api/delRecords',
  add: '/product/create',
  edit: '/product/',
  getAllCompanies: '/api/getAllCompanies',
};

function getRows() {
  loading.value = true;
  $http.get(urls.getRows, {
    params: {
      sort: 'id',
      order: 'desc',
      offset: pageSize.value * (page.value - 1),
      limit: pageSize.value,
      search: searchName.value,
      model: searchModel.value,
      company_id: companyId.value
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
    companies.value.splice(0, 0, ...response.data.rows);
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

function openFormAdd(item) {
  formMode.value = 'add';
  if (item) {
    // 用于复制添加
    Object.assign(form.value, item);
    Object.assign(formExt.value, item.ext);
  } else {
    Object.assign(form.value, formDefault);
    Object.assign(formExt.value, formExtDefault);
  }
  formVisible.value = true;
}
function openFormEdit(item) {
  formMode.value = 'edit';
  Object.assign(form.value, item);
  // item.ext可能没有包含所有的字段，因此先使用默认值覆盖一次
  Object.assign(formExt.value, formExtDefault);
  Object.assign(formExt.value, item.ext);
  formVisible.value = true;
}
function submitForm() {
  let url = formMode.value === 'add'
    ? urls.add
    : urls.edit + form.value.id;
  let tmpForm = Object.assign({}, form.value);
  tmpForm.ext = formExt.value;
  $http.post(url, tmpForm).then(response => {
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

  initTableCols()
  // console.log(tableCols.value)
  restoreTableCols();
  // console.log(tableCols.value)
})
</script>
