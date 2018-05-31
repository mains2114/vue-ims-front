<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>库存预警</span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>过期预警</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  export default {
    name: "Dashboard"
  }
</script>

<style scoped>

</style>
