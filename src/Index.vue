<template>
  <el-container>
    <el-header>
      <el-menu mode="horizontal" router :default-active="$route.path === '/' ? '/' : $route.path">
        <el-menu-item index="/">主页</el-menu-item>
        <el-menu-item index="/company">公司</el-menu-item>
        <el-menu-item index="/product">货品</el-menu-item>
        <el-menu-item index="/receipt">单据</el-menu-item>
        <el-menu-item index="/inventory">流水</el-menu-item>
        <!-- <el-menu-item index="/import">入库</el-menu-item> -->
        <el-menu-item index="/export">出库</el-menu-item>
        <el-submenu index="/importManage">
          <template slot="title">采购管理</template>
          <!-- <el-menu-item index="/purchaseManage/purchasePlan">采购计划</el-menu-item> -->
          <el-menu-item index="/purchaseManage/confirmLog">验收记录</el-menu-item>
          <el-menu-item index="/purchaseManage/confirmForm">采购验收</el-menu-item>
          <el-menu-item index="/purchaseManage/confirmImport">验收入库</el-menu-item>
        </el-submenu>
        <el-badge value="new" :hidden="cacheStore.checkedVer >= cacheStore.changesVer">
          <el-menu-item index="/changes">更新日志</el-menu-item>
        </el-badge>
        <el-dropdown class="ims-user-info" @command="handleCommand">
          <span class="el-dropdown-link">
            {{ accountStore.account && accountStore.account.name + ' |' }} {{ username }}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="profile">用户信息</el-dropdown-item>
            <el-dropdown-item command="manage">账户管理</el-dropdown-item>
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
      <el-divider>ims-laravel © 2017 - {{ new Date().getFullYear() }}</el-divider>
    </el-footer>
  </el-container>
</template>

<script>
import { mapStores } from 'pinia'
import { useAccountStore } from './stores/account.js'
import { useCacheStore } from './stores/cache.js';

  export default {
    name: "Index",
    data() {
      return {
        username: window.$USERNAME || '用户名',
      };
    },
    computed: {
      ...mapStores(useAccountStore),
      ...mapStores(useCacheStore),
    },
    methods: {
      getProfile() {
        this.accountStore.recovery();
        this.$http.get(this.url('/api/account/getProfile')).then((response) => {
          let resp = response.data;
          let user = resp.data.user;
          this.username = user.name;
          this.accountStore.setUser(user);
          if (!this.accountStore.account && user.account) {
            this.accountStore.switchAccount(user.account);
          }
        });
      },
      handleCommand(command) {
        if (command === 'logout') {
          this.logout();
        } else if (command === 'oldVersion') {
          window.location.href = '/home';
        } else if (command === 'profile') {
          this.$router.push('/profile');
        } else if (command === 'manage') {
          this.$router.push('/manage');
        }
      },
      logout() {
        this.accountStore.switchAccount(null);
        this.$http.post(this.url('/logout')).then(() => {
          window.location.href = '/';
        });
      }
    },
    created() {
      this.getProfile();
      this.cacheStore.restoreCheckedVer();
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
  .el-date-editor.el-input {
    width: 100%;
  }
  .el-input > .el-input__inner {
    padding: 0 10px;
  }
  .el-input > .el-input-group__append {
    padding: 0 10px;
  }
  i.el-input__icon.el-icon-date {
    display: none;
  }
  .el-main h3 {
    margin-top: 0;
  }
  .el-badge__content.is-fixed {
    top: 10px;
    right: 20px;
  }
</style>
