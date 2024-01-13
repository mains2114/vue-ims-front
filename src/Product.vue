<template>
  <div>
    <h3>货品信息</h3>

    <el-row>
      <el-col :span="24">
        <el-button type="primary" @click="openFormAdd()">添加</el-button>

        <el-select v-model="companyId" @change="handleSelectChange" filterable clearable placeholder="请选择生产商">
          <el-option v-for="item in companies"
                     v-if="item.type === 'manufacturer'"
                     :key="item.id"
                     :value="item.id"
                     :label="item.id + '. ' + item.name">
          </el-option>
        </el-select>

        <el-input v-model.trim="searchName" placeholder="请输入货品名称" clearable="" style="width: 180px;"></el-input>
        <el-input v-model.trim="searchModel" placeholder="请输入规格型号" clearable="" style="width: 180px;"></el-input>

        <el-button type="primary" @click="handleSelectChange">搜索</el-button>
        <el-popover placement="bottom" trigger="click">
          <el-checkbox-group v-model="optionalColumns">
            <el-checkbox v-for="(cfg, index) in formExtCfg" :label="cfg.label" :key="cfg.label"></el-checkbox>
          </el-checkbox-group>
          <el-button slot="reference" type="primary" icon="el-icon-menu"></el-button>
        </el-popover>
      </el-col>
    </el-row>
    <br>

    <el-table :data="rows" border v-loading="loading">
      <!--<el-table-column type="selection"></el-table-column>-->
      <el-table-column prop="id" label="编号" width="80px"></el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="model" label="规格"></el-table-column>
      <el-table-column prop="company.name" label="生产商"></el-table-column>
      <el-table-column prop="unit" label="单位" width="80px"></el-table-column>
      <el-table-column prop="price" label="单价" width="100px"></el-table-column>
      <el-table-column prop="approval" label="注册号"></el-table-column>
      <template v-for="(cfg, index) in formExtCfg">
        <el-table-column :prop="'ext.' + cfg.field" :label="cfg.label" :key="cfg.field" v-if="optionalColumns.indexOf(cfg.label) !== -1"></el-table-column>
      </template>
      <el-table-column prop="" label="库存">
        <template slot-scope="scope">
          <el-popover trigger="click">
            <el-table :data="scope.row.storage">
              <el-table-column prop="batch" label="生产批号" width="100px"></el-table-column>
              <el-table-column prop="produce_date" label="生产日期" width="100px"></el-table-column>
              <el-table-column prop="expire" label="过期时间" width="100px"></el-table-column>
              <el-table-column prop="num" label="库存"></el-table-column>
            </el-table>
            <a href="#" slot="reference" @click.prevent>
              {{ scope.row.storage.reduce((acc, curr) => acc + parseInt(curr.num), 0) }}
            </a>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="small" @click="openFormEdit(scope.row)" type="text">编辑</el-button>
          <el-button size="small" @click="openFormAdd(scope.row)" type="text">复制</el-button>
          &nbsp;
          <el-popconfirm title="确认删除？"
            @confirm="deleteRows('product', [scope.row.id])"
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

    <el-dialog :title="formMode === 'edit' ? '编辑货品' : '添加货品'" :visible.sync="formVisible">
      <el-form ref="form" v-model="form" label-position="left" label-width="110px">
        <el-form-item label="编号" v-if="formMode === 'edit'">
          <el-input v-model="form.id" disabled></el-input>
        </el-form-item>

        <el-form-item label="货品名称">
          <el-input v-model="form.name"></el-input>
          请输入货品名称，限定2-50个字符。
        </el-form-item>
        <el-form-item label="规格型号">
          <el-input v-model="form.model"></el-input>
          请输入货品规格型号，限定1-50个字符。
        </el-form-item>
        <el-form-item label="生产商">
          <el-select v-model="form.company_id" filterable>
            <el-option v-for="item in companies"
                       v-if="item.type === 'manufacturer'"
                       :key="item.id"
                       :value="item.id"
                       :label="item.id + '. ' + item.name">
            </el-option>
          </el-select>
          <br>
          请选择该货品的生产商。如果没有对应的，请先在公司页面添加。
        </el-form-item>

        <el-form-item label="单位">
          <el-input v-model="form.unit"></el-input>
          货品销售时，使用的最小单位（如，支）。
        </el-form-item>
        <el-form-item label="单价（元）">
          <el-input-number v-model="form.price" :step="0.001" :min="0"></el-input-number>
          货品单价，支持三位小数。
        </el-form-item>
        <el-form-item label="注册号">
          <el-input v-model="form.approval"></el-input>
        </el-form-item>
        <el-form-item label="生产许可证">
          <el-input v-model="form.permit"></el-input>
        </el-form-item>
        <el-form-item label="中标号">
          <el-input v-model="form.bid"></el-input>
        </el-form-item>
        <el-divider></el-divider>
        <el-form-item v-for="(cfg, index) in formExtCfg" :label="cfg.label">
          <el-input v-model="formExt[cfg.field]"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button @click="formVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog title="库存详情" :visible.sync="dialog2Visible">
      <el-table :data="dialog2Rows" border>
        <el-table-column prop="batch" label="生产批号"></el-table-column>
        <el-table-column prop="num" label="库存"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Company",
    data() {
      return {
        loading: false,
        optionalColumns: [],
        companyId: '',
        companies: [],
        searchName: '',
        searchModel: '',
        rows: [],
        total: 0,
        pageSize: 10,
        page: 1,
        formVisible: false,
        formMode: 'add',
        form: {},
        formExt: {},
        formExtCfg: [
          { field:'yb_code', label:'医保编码' },
          { field:'price_online', label:'挂网价' },
        ],
        dialog2Visible: false,
        dialog2Rows: [],
        urls: {
          getRows: this.url('/api/getProducts'),
          delRows: this.url('/api/delRecords'),
          add: this.url('/product/create'),
          edit: this.url('/product/'),
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
            search: this.searchName,
            model: this.searchModel,
            company_id: this.companyId
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
      getAllCompanies() {
        this.$http.get(this.urls.getAllCompanies).then(response => {
          this.companies = response.data.rows;
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
      openFormAdd(item) {
        this.formMode = 'add';
        if (item) {
          // 用于复制添加
          this.form = Object.assign({}, item);
          this.formExt = Object.assign({}, item.ext);
        } else {
          this.form = {};
          this.formExt = {};
        }
        this.formVisible = true;
      },
      openFormEdit(item) {
        this.formMode = 'edit';
        this.form = Object.assign({}, item);
        this.formExt = Object.assign({}, item.ext);
        this.formVisible = true;
      },
      openDialog2(rows) {
        this.dialog2Rows = rows;
        this.dialog2Visible = true;
      },
      submitForm() {
        let url = this.formMode === 'add'
          ? this.urls.add
          : this.urls.edit + this.form.id;

        this.form.ext = this.formExt;
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
      this.getAllCompanies();
      this.getRows();
    }
  }
</script>

<style scoped>

</style>
