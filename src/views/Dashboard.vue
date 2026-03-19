<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>库存预警</span>
          </div>
          <el-form :inline="true">
            <el-form-item>
              <el-radio-group v-model="lowStorageParams.showAll" @change="getRows">
                <el-radio-button label="1">全部</el-radio-button>
                <el-radio-button label="0">低库存预警</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="getRows">刷新</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="tableRows" :rowClassName="tableRowClassName" height="700" border v-loading="loading">
            <el-table-column prop="product.company.name" label="生产商" min-width="100" sortable :filters="tableFilters"
              :filter-method="companyFilter"></el-table-column>
            <el-table-column prop="product.name" label="货品及规格" min-width="160" sortable>
              <template slot-scope="scope">
                <el-link type="primary" :underline="false" @click="openProductDialog(scope.row.product)">
                  {{ scope.row.product.name + ' - ' + scope.row.product.model }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column prop="num" label="数量" min-width="80"></el-table-column>
            <el-table-column prop="warning_num" label="预警值" min-width="80"></el-table-column>
          </el-table>
          <br>
          <el-pagination layout="total" background :total="tableRows.length">
          </el-pagination>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>过期预警</span>
          </div>
          <el-form :inline="true">
            <el-form-item>
              <el-button type="primary" @click="getExpireWarning">刷新</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="nearExpireStock" height="700" border v-loading="loading2"
            :default-sort="{ prop: 'expire', order: 'ascending' }">
            <el-table-column prop="product.company.name" label="生产商" min-width="100" sortable></el-table-column>
            <el-table-column prop="product.name" label="货品及规格" min-width="160" sortable>
              <template slot-scope="scope">
                <el-link type="primary" :underline="false" @click="openProductDialog(scope.row.product)">
                  {{ scope.row.product.name + ' - ' + scope.row.product.model }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column prop="num" label="数量" min-width="80"></el-table-column>
            <el-table-column prop="batch" label="生产批号"></el-table-column>
            <el-table-column prop="expire" label="过期时间" sortable></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="small" type="text" disabled="" v-if="scope.row.is_lock">已锁定</el-button>
                <el-button size="small" @click="lockExpireStock(scope.row.id)" type="text" v-else>锁定</el-button>
              </template>
            </el-table-column>
          </el-table>
          <br>
          <el-pagination layout="total" background :total="nearExpireStock.length">
          </el-pagination>
        </el-card>
      </el-col>

      <ProductInfoDialog ref="refProductInfoDialog"></ProductInfoDialog>
    </el-row>
  </div>
</template>
<style>
.el-table .warning-row {
  background: oldlace;
}
</style>
<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'

const $message = getCurrentInstance().proxy.$message;
const $http = getCurrentInstance().proxy.$http;

const refProductInfoDialog = ref(null)
const loading = ref(false)
const tableRows = ref([])
const tableFilters = ref([])
const lowStorageParams = ref({
  showAll: 1,
})
const loading2 = ref(false)
const nearExpireStock = ref([])
const urls = {
  getInventoryWarning: '/api/getInventoryWarning',
  getExpireWarning: '/api/getExpireWarning',
  lockStorage: '/api/lockStorage',
}

function openProductDialog(product) {
  refProductInfoDialog.value.show(product);
}
// 获取库存预警数据
function getRows() {
  loading.value = true;
  $http.get(urls.getInventoryWarning, {
    params: {
      ...lowStorageParams.value,
      sort: 'id',
      order: 'desc',
    }
  }).then(response => {
    tableRows.value.splice(0, tableRows.value.length, ...(response.data.rows || []));

    let companyArr = tableRows.value.map((el) => {
      return el.product.company.name;
    });
    tableFilters.value.splice(0, tableFilters.value.length,
      ...Array.from(new Set(companyArr), (el) => { return { text: el, value: el }; })
    );
  }).finally(() => {
    loading.value = false;
  })
}
// 筛选公司名称
function companyFilter(value, row, column) {
  return value == row.product.company.name;
}
// 库存数量小于预警值时，高亮显示
function tableRowClassName({ row }) {
  if (row.num - row.warning_num <= 0) {
    return 'warning-row';
  }
  return '';
}
// 获取过期预警数据
function getExpireWarning() {
  loading2.value = true;
  $http.get(urls.getExpireWarning, {
    params: {
      sort: 'id',
      order: 'desc',
    }
  }).then(response => {
    nearExpireStock.value.splice(0, nearExpireStock.value.length, ...(response.data.rows || []));
  }).finally(() => {
    loading2.value = false;
  })
}
// 锁定过期库存
function lockExpireStock(rowId) {
  let param = {
    rowId,
  };

  $http.post(urls.lockStorage, param).then(response => {
    if (response.data.error === 0) {
      $message.success(response.data.msg || '操作成功');
      getExpireWarning();
      return;
    }

    console.log(response);
    $message.error(response.data.msg || '请求错误');
  });
}

onMounted(() => {
  getRows();
  getExpireWarning();
})
</script>
