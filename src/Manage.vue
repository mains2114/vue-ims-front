<template>
  <div>
    <h3>账户管理</h3>

    <el-row>
      <el-col :span="24">
        <el-button type="primary" @click="openFormAdd()">添加</el-button>

        <el-button type="primary" @click="handleSelectChange">搜索</el-button>
      </el-col>
    </el-row>
    <br>

    <el-table :data="rows" border v-loading="loading">
      <!--<el-table-column type="selection"></el-table-column>-->
      <el-table-column prop="id" label="编号" width="80px"></el-table-column>
      <el-table-column prop="name" label="账户名称"></el-table-column>
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
      <el-form ref="form" v-model="form" label-position="left" label-width="100px">
        <el-form-item label="编号" v-if="formMode === 'edit'">
          <el-input v-model="form.id" disabled></el-input>
        </el-form-item>

        <el-form-item label="账户名称">
          <el-input v-model="form.name"></el-input>
          请输入2-50个字符，前置和拖尾的空白会被清除。
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button @click="formVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Company",
    data() {
      return {
        loading: false,
        companyType: '',
        companySearch: '',
        rows: [],
        total: 0,
        pageSize: 10,
        page: 1,
        formVisible: false,
        formMode: 'add',
        form: {},
        urls: {
          getRows: this.url('/api/account/getAccounts'),
          delRows: this.url('/api/delRecords'),
          add: this.url('/api/account/createAccount'),
          edit: this.url('/api/account/modifyAccount'),
          getUsers: this.url('/api/account/getUsers'),
        }
      };
    },
    methods: {
      getRows() {
        this.loading = true;

        this.$http.get(this.urls.getRows, {
          params: {
            sort: 'id',
            order: 'desc',
            offset: this.pageSize * (this.page - 1),
            limit: this.pageSize,
            search: this.companySearch,
            type: this.companyType
          }
        }).then(response => {
          this.rows = response.data.rows || [];
          this.total = response.data.total || 0;

          this.loading = false;
        })
      },
      deleteRows(module, records) {
        let form = {
          module,
          records
        };

        this.$http.post(this.urls.delRows, form).then(response => {
          if (response.data.error === 0) {
            this.$message.success(response.data.msg || '操作成功');

            this.getRows();
            return;
          }

          console.log(response);
          this.$message.error(response.data.msg || '请求错误');
        });
      },
      handleSizeChange(val) {
        this.pageSize = val;
        this.getRows();
      },
      handleSelectChange() {
        this.page = 1;
        this.getRows();
      },
      openFormAdd() {
        this.formMode = 'add';
        this.form = {};
        this.formVisible = true;
      },
      openFormEdit(item) {
        this.formMode = 'edit';
        this.form = Object.assign({}, item);
        this.formVisible = true;
      },
      switchAccount(item) {
        window.ims.account = item;
        this.$message({
          message: '已切换为：' + item.name,
          type: 'success'
        });
      },
      submitForm() {
        let url = this.formMode === 'add'
          ? this.urls.add
          : this.urls.edit;

        this.$http.post(url, this.form).then(response => {
          if (response.data.error === 0) {
            this.$message.success(response.data.msg || '操作成功');
            this.formVisible = false;
            this.getRows();
            return;
          }

          console.log(response);
          this.$message.error(response.data.msg || '请求错误');
        });
      }
    },
    created() {
      this.getRows();
    }
  }
</script>

<style scoped>

</style>
