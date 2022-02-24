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
          <el-menu-item index="/purchaseManage/confirmImport">验收入库</el-menu-item>
        </el-submenu>
        <el-dropdown class="ims-user-info" @command="handleCommand">
          <span class="el-dropdown-link">
            {{ username }}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>用户信息</el-dropdown-item>
            <el-dropdown-item command="oldVersion">切换旧版本</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-menu>
    </el-header>
    <el-main>
      <router-view></router-view>
    </el-main>
    <el-footer>
      <p style="text-align: center;">ims-laravel © 2017 - 2022</p>
    </el-footer>
  </el-container>
</template>

<script>
  export default {
    name: "Index",
    data() {
      return {
        username: window.$USERNAME || '用户名',
      };
    },
    methods: {
      handleCommand(command) {
        if (command === 'logout') {
          this.logout();
        } else if (command === 'oldVersion') {
          window.location.href = '/home';
        }
      },
      logout() {
        this.$http.post(this.url('/logout')).then(() => {
          window.location.href = '/';
        });
      }
    }
  }
</script>

<style>
  .el-dropdown-link {
    cursor: pointer;
    color: #409eff;
  }
  .ims-user-info {
    float: right;
  }
  .ims-user-info > span {
    line-height: 60px;
    height: 60px;
    padding: 0 20px;
  }
</style>
