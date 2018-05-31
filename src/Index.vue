<template>
  <el-container>
    <el-header>
      <el-menu mode="horizontal" router :default-active="$route.path === '/' ? '/' : $route.path">
        <el-menu-item index="/">主页</el-menu-item>
        <el-menu-item index="/company">公司</el-menu-item>
        <el-menu-item index="/product">货品与库存</el-menu-item>
        <el-menu-item index="/receipt">单据</el-menu-item>
        <el-menu-item index="/inventory">流水</el-menu-item>
        <el-menu-item index="/import">入库</el-menu-item>
        <el-menu-item index="/export">出库</el-menu-item>
        <el-submenu index="/importManage">
          <template slot="title">采购管理</template>
          <el-menu-item index="/purchaseManage/purchasePlan">采购计划</el-menu-item>
          <el-menu-item index="/purchaseManage/confirmForm">采购验收</el-menu-item>
          <el-menu-item index="/purchaseManage/confirmLog">验收记录</el-menu-item>
          <el-menu-item index="/purchaseManage/purchaseImport">采购入库</el-menu-item>
        </el-submenu>
      </el-menu>
    </el-header>
    <el-main>
      <router-view></router-view>
    </el-main>
    <el-footer>
      <p style="text-align: center;">ims-laravel © 2017</p>
    </el-footer>
  </el-container>
</template>

<script>
  export default {
    name: "Index"
  }
</script>

<style scoped>

</style>
