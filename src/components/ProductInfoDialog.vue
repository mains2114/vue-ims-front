<template>
  <el-dialog title="货品信息" :visible.sync="productDialogVisible">
    <el-descriptions title="" direction="" :column="2" border>
      <el-descriptions-item label="ID">{{ productDialogValue.id }}</el-descriptions-item>
      <el-descriptions-item label="生产商">{{ productDialogValue.company && productDialogValue.company.full_name }}</el-descriptions-item>
      <el-descriptions-item label="货品">{{ productDialogValue.name }}</el-descriptions-item>
      <el-descriptions-item label="型号">{{ productDialogValue.model }}</el-descriptions-item>
      <el-descriptions-item label="单位">{{ productDialogValue.unit }}</el-descriptions-item>
      <el-descriptions-item label="单价">{{ productDialogValue.price }}</el-descriptions-item>
      <el-descriptions-item label="注册号">{{ productDialogValue.approval }}</el-descriptions-item>
      <el-descriptions-item label="生产许可证">{{ productDialogValue.permit }}</el-descriptions-item>
      <el-descriptions-item label="医保编码">{{ productDialogValue.ext && productDialogValue.ext.yb_code }}</el-descriptions-item>
      <el-descriptions-item label="挂网价">{{ productDialogValue.ext && productDialogValue.ext.price_online }}</el-descriptions-item>
      <el-descriptions-item label="包装规格">{{ productDialogValue.ext && productDialogValue.ext.packing_size }}</el-descriptions-item>
      <el-descriptions-item label="库存预警值">{{ productDialogValue.ext && productDialogValue.ext.warning_num }}</el-descriptions-item>
      <el-descriptions-item label="总库存" :span="2">
        {{ productDialogValue.storage && productDialogValue.storage.reduce((acc, curr) => acc + parseInt(curr.num), 0) || 0 }}
      </el-descriptions-item>
    </el-descriptions>
    
    <div v-if="productDialogValue.storage && productDialogValue.storage.length > 0" style="margin-top: 20px;">
      <h4>库存详情</h4>
      <el-table :data="productDialogValue.storage" border style="width: 100%;">
        <el-table-column prop="batch" label="生产批号" width="100px"></el-table-column>
        <el-table-column prop="produce_date" label="生产日期" width="100px"></el-table-column>
        <el-table-column prop="expire" label="过期时间" width="100px"></el-table-column>
        <el-table-column prop="num" label="库存"></el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>
<script setup>
import { ref } from 'vue';
import _ from 'lodash';
import axios from 'axios';

const productDialogVisible = ref(false);
const productDialogValue = ref({});

const show = (product) => {
  let obj = _.clone(product);
  obj.ext = JSON.parse(obj.ext);
  
  // 调用接口获取库存信息
  axios.get('/api/product/getProductStorage', {
    params: {
      productId: product.id
    }
  }).then(response => {
    if (response.data.error === 0) {
      obj.storage = response.data.data.storage;
    }
  }).finally(() => {
    productDialogValue.value = obj;
    productDialogVisible.value = true;
  });
};

defineExpose({
  show
});
</script>
