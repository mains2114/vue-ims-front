<template>
  <div>
    <h3>公司信息</h3>

    <el-row>
      <el-col :span="24">
        <el-button type="primary" @click="openFormAdd()">添加</el-button>

        <el-select v-model="companyType" @change="handleSelectChange">
          <el-option value="" label="显示所有公司"></el-option>
          <el-option value="manufacturer" label="仅显示生产商"></el-option>
          <el-option value="customer" label="仅显示顾客"></el-option>
          <el-option value="seller" label="仅显示销售商"></el-option>
        </el-select>

        <el-input v-model="companySearch" placeholder="请输入公司名称" clearable="" style="width: 180px;"></el-input>

        <el-button type="primary" @click="handleSelectChange">搜索</el-button>
      </el-col>
      <!--<el-col :span="12"></el-col>-->
    </el-row>
    <br>

    <el-table :data="rows" border v-loading="loading">
      <!--<el-table-column type="selection"></el-table-column>-->
      <el-table-column prop="id" label="编号" width="80px"></el-table-column>
      <el-table-column prop="name" label="公司简称"></el-table-column>
      <el-table-column prop="full_name" label="公司全称"></el-table-column>
      <el-table-column prop="type" label="类型">
        <template slot-scope="scope">
          {{ companyTypes[ scope.row.type ] }}
        </template>
      </el-table-column>
      <el-table-column prop="contact" label="联系人"></el-table-column>
      <el-table-column prop="tel" label="电话"></el-table-column>
      <el-table-column prop="created_at" label="创建时间"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="small" @click="openFormEdit(scope.row)" type="text">编辑</el-button>
          <el-popconfirm title="确认删除？"
            @confirm="deleteRows('company', [scope.row.id])"
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

    <el-dialog :title="formMode === 'edit' ? '编辑公司' : '添加公司'" :visible.sync="formVisible">
      <el-form ref="form" v-model="form" label-position="left" label-width="100px">
        <el-form-item label="编号" v-if="formMode === 'edit'">
          <el-input v-model="form.id" disabled></el-input>
        </el-form-item>

        <el-form-item label="公司简称">
          <el-input v-model="form.name"></el-input>
          限定2-50个字符，不可重复。
        </el-form-item>
        <el-form-item label="公司全称">
          <el-input v-model="form.full_name"></el-input>
          请输入公司完整的注册名称，限定2-100个字符。
        </el-form-item>
        <el-form-item label="公司类型">
          <el-radio v-model="form.type" label="manufacturer">生产商。 货品的生产商，创建货品、货品入库时使用此类公司。</el-radio>
          <br>
          <el-radio v-model="form.type" label="customer">顾客。 货品销售的对象，在货品销售出库时，选择此类公司。</el-radio>
          <br>
          <el-radio v-model="form.type" label="seller">销售商。 货品的销售商，进货时可选的公司。</el-radio>
          <br>
          <!-- 一个公司可以有多个类型，请至少选择一项。 -->
        </el-form-item>

        <el-form-item label="公司地址">
          <el-input v-model="form.address"></el-input>
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="form.contact"></el-input>
        </el-form-item>
        <el-form-item label="电话号码">
          <el-input v-model="form.tel"></el-input>
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
        companyTypes: {
          manufacturer: '生产商',
          seller: '销售商',
          customer: '顾客',
        },
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
          getRows: this.url('/api/getCompanies'),
          delRows: this.url('/api/delRecords'),
          add: this.url('/company/create'),
          edit: this.url('/company/'),
          getAllCompanies: this.url('/api/getAllCompanies')
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
      submitForm() {
        let url = this.formMode === 'add'
          ? this.urls.add
          : this.urls.edit + this.form.id;

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
