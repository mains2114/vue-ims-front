<template>
  <el-row>
    <el-col :span="12" :offset="6">
      <el-card>
        <div slot="header">
          <span>用户信息</span>
        </div>
        <el-form label-position="left" label-width="100px">
          <el-form-item label="用户ID">
            {{ user.id }}
          </el-form-item>
          <el-form-item label="用户名">
            {{ user.name }}
          </el-form-item>
          <el-form-item label="邮箱">
            {{ user.email }}
          </el-form-item>
          <el-form-item label="公司名称">
            {{ account.name }}
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: "Profile.vue",
  data() {
    return {
      user: {},
      account: {},
    }
  },
  created() {
    this.user = window.ims.user || {};
    this.account = window.ims.account || {};
  }
}
</script>