<template>
  <div>
    <h3>公司信息</h3>

    <el-row>
      <el-col :span="12">
        <el-button type="primary" @click="openFormAdd()">添加</el-button>

        <el-select v-model="companyType" @change="handleSelectChange">
          <el-option value="" label="显示所有类型公司"></el-option>
          <el-option value="manufacturer" label="仅显示生产商"></el-option>
          <el-option value="customer" label="仅显示顾客"></el-option>
          <el-option value="seller" label="仅显示销售商"></el-option>
        </el-select>
      </el-col>
      <el-col :span="12"></el-col>
    </el-row>
    <br>

    <el-table :data="rows" border>
      <el-table-column type="selection"></el-table-column>
      <el-table-column prop="id" label="编号" width="80px"></el-table-column>
      <el-table-column prop="name" label="公司简称"></el-table-column>
      <el-table-column prop="full_name" label="公司全称"></el-table-column>
      <el-table-column prop="type" label="类型"></el-table-column>
      <el-table-column prop="contact" label="联系人"></el-table-column>
      <el-table-column prop="tel" label="电话"></el-table-column>
      <el-table-column prop="created_at" label="创建时间"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <!--<a href="#" @click.prevent="openFormEdit(scope.row)">编辑</a>-->
          <el-button size="small" @click="openFormEdit(scope.row)" type="text">编辑</el-button>
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
          请输入2-50个字符，前置和拖尾的空白会被清除。
        </el-form-item>
        <el-form-item label="公司全称">
          <el-input v-model="form.full_name"></el-input>
          公司全称请输入公司完整的注册名称，该名称将用于出货单中填充相关单位名称。请输入2-100个字符。
        </el-form-item>
        <el-form-item label="公司类型">
          <el-radio v-model="form.type" label="manufacturer">生产商。 货品的生产商，创建货品、货品入库时需要使用此类公司。</el-radio>
          <br>
          <el-radio v-model="form.type" label="customer">顾客。 货品销售的对象，在货品销售出库时，需要选择此类公司。</el-radio>
          <br>
          <el-radio v-model="form.type" label="seller">销售商。 货品的销售商，进货的对象。</el-radio>
          <br>
          一个公司可以有多个类型，请至少选择一项。
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
        companyType: '',
        rows: [],
        total: 0,
        pageSize: 10,
        page: 1,
        formVisible: false,
        formMode: 'add',
        form: {},
        urls: {
          getRows: this.url('/api/getCompanies'),
          add: this.url('/company/create'),
          edit: this.url('/company/'),
          getAllCompanies: this.url('/api/getAllCompanies')
        }
      };
    },
    methods: {
      getRows() {
        this.$http.get(this.urls.getRows, {
          params: {
            sort: 'id',
            order: 'desc',
            offset: this.pageSize * (this.page - 1),
            limit: this.pageSize,
            type: this.companyType
          }
        }).then(response => {
          this.rows = response.data.rows || [];
          this.total = response.data.total || 0;
        })
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
        this.form = item;
        this.formVisible = true;
      },
      submitForm() {
        let url = this.formMode === 'add'
          ? this.urls.add
          : this.urls.edit + this.form.id;

        this.$http.post(url, this.form).then(response => {
          this.$message.success(response);
          this.formVisible = false;
          this.getRows();
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
