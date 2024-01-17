<template>
  <el-dialog title="货品信息" :visible.sync="productDialogVisible">
    <el-descriptions title="" direction="" :column="2" border>
      <el-descriptions-item label="ID">{{ productDialogValue.id }}</el-descriptions-item>
      <el-descriptions-item label="生产商">{{ productDialogValue.company.full_name }}</el-descriptions-item>
      <el-descriptions-item label="货品">{{ productDialogValue.name }}</el-descriptions-item>
      <el-descriptions-item label="型号">{{ productDialogValue.model }}</el-descriptions-item>
      <el-descriptions-item label="单位">{{ productDialogValue.unit }}</el-descriptions-item>
      <el-descriptions-item label="单价">{{ productDialogValue.price }}</el-descriptions-item>
      <el-descriptions-item label="注册号">{{ productDialogValue.approval }}</el-descriptions-item>
      <el-descriptions-item label="生产许可证">{{ productDialogValue.permit }}</el-descriptions-item>
      <el-descriptions-item label="医保编码">{{ productDialogValue.ext && productDialogValue.ext.yb_code }}</el-descriptions-item>
      <el-descriptions-item label="挂网价">{{ productDialogValue.ext && productDialogValue.ext.price_online }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>
<script>
  export default {
    name: "ProductInfoDialog",
    props: {
    },
    data() {
      return {
        productDialogVisible: false,
        productDialogValue: {},
      };
    },
    methods: {
      show(product) {
        let obj = _.clone(product);
        obj.ext = JSON.parse(obj.ext);
        this.productDialogValue = obj;
        this.productDialogVisible = true;
      },
    }
  }
</script>
