<template>
  <div>
    <h3>货品信息</h3>

    <el-row>
      <el-col :span="12">
        <el-button type="primary" @click="openFormAdd()">添加</el-button>

        <el-select v-model="companyId" @change="handleSelectChange" filterable clearable placeholder="请选择生产商">
          <el-option v-for="item in companies"
                     v-if="item.type === 'manufacturer'"
                     :key="item.id"
                     :value="item.id"
                     :label="item.id + '. ' + item.name">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="12"></el-col>
    </el-row>
    <br>

    <el-table :data="rows" border>
      <!--<el-table-column type="expand">-->
        <!--<template slot-scope="scope">-->
          <!--<el-row v-for="item in scope.row.storage" style="margin-bottom: 5px;">-->
            <!--<span style="display: inline-block;width: 200px;">生产批次：{{ item.batch }}</span>-->
            <!--<span style="display: inline-block;width: 200px;">库存：{{ item.num }}</span>-->
          <!--</el-row>-->
          <!--<el-row style="margin-bottom: 5px;">-->
            <!--<span style="display: inline-block;width: 200px;"></span>-->
            <!--<span style="display: inline-block;width: 200px;">总计：{{ scope.row.storage.reduce((acc, curr) => acc + parseInt(curr.num), 0) }}</span>-->
          <!--</el-row>-->
        <!--</template>-->
      <!--</el-table-column>-->
      <!--<el-table-column type="selection"></el-table-column>-->
      <el-table-column prop="id" label="编号" width="80px"></el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="model" label="规格"></el-table-column>
      <el-table-column prop="company.name" label="生产厂家"></el-table-column>
      <el-table-column prop="unit" label="单位" width="80px"></el-table-column>
      <el-table-column prop="price" label="参考价格"></el-table-column>
      <el-table-column prop="" label="库存">
        <template slot-scope="scope">
          <el-popover trigger="click">
            <el-table :data="scope.row.storage">
              <el-table-column prop="batch" label="生产批次" width="100px"></el-table-column>
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
          请输入最直接的货品名称（如输液器），注意不要添加规格、厂家之类的额外信息。请输入2-50个字符。
        </el-form-item>
        <el-form-item label="规格型号">
          <el-input v-model="form.model"></el-input>
          请输入描述该货品规格的字符。请输入2-50个字符。
        </el-form-item>
        <el-form-item label="生产厂商">
          <el-select v-model="form.company_id" filterable>
            <el-option v-for="item in companies"
                       v-if="item.type === 'manufacturer'"
                       :key="item.id"
                       :value="item.id"
                       :label="item.id + '. ' + item.name">
            </el-option>
          </el-select>
          <br>
          请从下拉列表中选择该货品的生产厂商。如果没有你想选择的厂商，请前往添加。
        </el-form-item>

        <el-form-item label="基本单位">
          <el-input v-model="form.unit"></el-input>
          货品出库入库时，使用的最基本的单位（如，箱）。
        </el-form-item>
        <el-form-item label="参考价格（元）">
          <el-input-number v-model="form.price" :step="0.001" :min="0"></el-input-number>
          针对基本单位的单价，该价格仅供参考。最多保留三位小数。
        </el-form-item>
        <el-form-item label="批准文号">
          <el-input v-model="form.approval"></el-input>
        </el-form-item>
        <el-form-item label="中标号">
          <el-input v-model="form.bid"></el-input>
        </el-form-item>
        <el-form-item label="生产许可证">
          <el-input v-model="form.permit"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button @click="formVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog title="库存详情" :visible.sync="dialog2Visible">
      <el-table :data="dialog2Rows" border>
        <el-table-column prop="batch" label="生产批次"></el-table-column>
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
        companyId: '',
        companies: [],
        rows: [],
        total: 0,
        pageSize: 10,
        page: 1,
        formVisible: false,
        formMode: 'add',
        form: {},
        dialog2Visible: false,
        dialog2Rows: [],
        urls: {
          getRows: this.url('/api/getProducts'),
          add: this.url('/product/create'),
          edit: this.url('/product/'),
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
            company_id: this.companyId
          }
        }).then(response => {
          this.rows = response.data.rows || [];
          this.total = response.data.total || 0;
        })
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
      openDialog2(rows) {
        this.dialog2Rows = rows;
        this.dialog2Visible = true;
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
      this.getAllCompanies();
      this.getRows();
    }
  }
</script>

<style scoped>

</style>
