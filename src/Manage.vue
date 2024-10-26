<template>
  <div>
    <h3>账户管理</h3>

    <el-row>
      <el-col :span="24">
        <el-button type="primary" @click="openFormAdd()">添加</el-button>

        <el-button type="primary" @click="handleSelectChange">搜索</el-button>

        <el-button type="success" @click="resetAccount">重置账户选择</el-button>
      </el-col>
    </el-row>
    <br>

    <el-table :data="rows" border v-loading="loading">
      <!--<el-table-column type="selection"></el-table-column>-->
      <el-table-column prop="id" label="编号" width="80px"></el-table-column>
      <el-table-column prop="name" label="账户名称"></el-table-column>
      <el-table-column prop="address" label="地址"></el-table-column>
      <el-table-column prop="phone" label="电话"></el-table-column>
      <el-table-column prop="updated_at" label="修改时间"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-popconfirm title="确认切换？" @confirm="switchAccount(scope.row)">
            <el-button slot="reference" size="small" type="text">切换</el-button>
          </el-popconfirm>
          <el-button size="small" @click="openFormEdit(scope.row)" type="text">编辑</el-button>
          <el-popconfirm title="确认删除？"
            @confirm="deleteRows('account', [scope.row.id])"
          >
            <el-button slot="reference" size="small" type="text">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <br>

    <el-pagination layout="total, sizes, prev, pager, next" background
                   @size-change="handleSizeChange"
                   @current-change="getRows"
                   :total="total"
                   :page-size="pageSize"
                   :current-page.sync="page"
                   :page-sizes="[10, 20, 50]">
    </el-pagination>

    <el-dialog :title="formMode === 'edit' ? '编辑账户' : '添加账户'" :visible.sync="formVisible">
      <el-form v-model="form" label-position="left" label-width="100px">
        <el-form-item label="编号" v-if="formMode === 'edit'">
          <el-input v-model="form.id" disabled></el-input>
        </el-form-item>

        <el-form-item label="账户名称">
          <el-input v-model="form.name"></el-input>
          限定2-50个字符，用于账户标识，以及单据抬头信息。
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address"></el-input>
          限定0-128个字符，用于填充单据中的地址。
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone"></el-input>
          限定0-128个字符，用于填充单据中的电话。
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button @click="formVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<style scoped></style>
<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useAccountStore } from './stores/account.js'
const accountStore = useAccountStore()

const $route = getCurrentInstance().proxy.$route;
const $message = getCurrentInstance().proxy.$message;
const $http = getCurrentInstance().proxy.$http;

const loading = ref(false)
const companyType = ref('')
const companySearch = ref('')
const rows = ref([])
const total = ref(0)
const pageSize = ref(10)
const page = ref(1)
const formVisible = ref(false)
const formMode = ref('add')
const form = ref({
  name: '',
  address: '',
  phone: '',
})
const formDefault = Object.assign({}, form.value);
const urls = {
  getRows: '/api/account/getAccounts',
  delRows: '/api/delRecords',
  add: '/api/account/createAccount',
  edit: '/api/account/modifyAccount',
  getUsers: '/api/account/getUsers',
}

function getRows() {
  loading.value = true;
  $http.get(urls.getRows, {
    params: {
      sort: 'id',
      order: 'desc',
      offset: pageSize.value * (page.value - 1),
      limit: pageSize.value,
      search: companySearch.value,
      type: companyType.value
    }
  }).then(response => {
    rows.value.splice(0, rows.value.length, ...(response.data.rows || []));
    total.value = response.data.total || 0;
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
function handleSizeChange(val) {
  pageSize.value = val;
  getRows();
}
function handleSelectChange() {
  page.value = 1;
  getRows();
}
function openFormAdd() {
  formMode.value = 'add';
  Object.assign(form.value, formDefault);
  formVisible.value = true;
}
function openFormEdit(item) {
  formMode.value = 'edit';
  Object.assign(form.value, item);
  formVisible.value = true;
}
function switchAccount(item) {
  accountStore.switchAccount(item);
  $message({
    message: '当前账户已切换为：' + item.name,
    type: 'success'
  });
}
function resetAccount() {
  accountStore.switchAccount(null);
  $message({
    message: '当前账户选择已重置',
    type: 'success'
  });
}
function submitForm() {
  let url = formMode.value === 'add'
    ? urls.add
    : urls.edit;
  $http.post(url, form.value).then(response => {
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
  getRows()
})
</script>
