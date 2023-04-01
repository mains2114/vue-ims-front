<template>
  <div>
    <h3>货品流水</h3>

    <el-row>
      <el-col :span="24">
        <!-- <el-button type="primary" @click="$router.push('import')">入库</el-button> -->
        <!-- <el-button type="primary" @click="$router.push('export')">出库</el-button> -->

        <el-select v-model="companyId" @change="handleSelectChange" filterable clearable placeholder="请选择交易公司">
          <el-option v-for="item in companies"
                     :key="item.id"
                     :value="item.id"
                     :label="item.id + '. ' + item.name">
          </el-option>
        </el-select>

        <el-cascader v-model="productTreeVal" :options="productTree" placeholder="请选择货品"
                     expand-trigger="click"
                     clearable
                     filterable
                     @change="handleSelectChange"
                     style="width: 250px"
        ></el-cascader>

        <el-select v-model="receiptType" @change="handleSelectChange" clearable placeholder="选择单据类型">
          <el-option value="in" label="入库"></el-option>
          <el-option value="out" label="出库"></el-option>
        </el-select>

        <el-select v-model="optionalColumns" multiple placeholder="额外的显示列" collapse-tags>
          <el-option value="expire" label="有效期"></el-option>
          <el-option value="product_unit" label="单位"></el-option>
          <el-option value="price" label="单价"></el-option>
          <el-option value="price_total" label="总价"></el-option>
          <el-option value="receipt_time" label="操作时间"></el-option>
        </el-select>
        
        <el-button type="primary" @click="handleSelectChange">搜索</el-button>
      </el-col>
      <!--<el-col :span="12"></el-col>-->
    </el-row>
    <br>

    <el-table :data="rows" border v-loading="loading">
      <!--<el-table-column type="selection"></el-table-column>-->
      <el-table-column prop="id" label="编号" width="70"></el-table-column>
      <el-table-column prop="manufacturer" label="生产厂商"></el-table-column>
      <el-table-column prop="product_name" label="货品"></el-table-column>
      <el-table-column prop="product_model" label="型号"></el-table-column>
      <el-table-column prop="batch" label="生产批号"></el-table-column>
      <el-table-column prop="expire" label="有效期" v-if="optionalColumns.indexOf('expire') !== -1"></el-table-column>
      <el-table-column prop="receipt_type" label="操作类型">
        <template slot-scope="scope">
          {{ scope.row.receipt_type === 'in' ? '入库' : '出库' }}
        </template>
      </el-table-column>
      <el-table-column prop="num" label="数量"></el-table-column>
      <el-table-column prop="product_unit" label="单位" v-if="optionalColumns.indexOf('product_unit') !== -1"></el-table-column>
      <el-table-column prop="price" label="单价" v-if="optionalColumns.indexOf('price') !== -1">
        <template slot-scope="scope">
          {{ parseFloat(scope.row.price) }}
        </template>
      </el-table-column>
      <el-table-column prop="price_total" label="总价" v-if="optionalColumns.indexOf('price_total') !== -1">
        <template slot-scope="scope">
          {{ Math.abs(scope.row.num) * scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column prop="receipt_time" label="操作时间" v-if="optionalColumns.indexOf('receipt_time') !== -1"></el-table-column>
      <el-table-column prop="receipt_id" label="单据"></el-table-column>
      <el-table-column prop="company_name" label="交易公司"></el-table-column>
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
      <el-form v-model="form" inline label-position="left" label-width="80px" disabled>
        <el-form-item label="单据编号" v-if="formMode === 'edit'">
          <el-input v-model="form.id" disabled></el-input>
        </el-form-item>
        <el-form-item label="制单时间">
          <el-date-picker type="date" v-model="form.date"></el-date-picker>
        </el-form-item>
        <el-form-item label="购货单位">
          <el-select v-model="form.company_id" filterable>
            <el-option v-for="item in companies"
                       :key="item.id"
                       :value="item.id"
                       :label="item.id + '. ' + item.name">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <el-table :data="formRows">
        <el-table-column align="center" prop="product.name" label="品名及规格" width="240px">
          <template slot-scope="scope">
            {{ scope.row.product.name }} - {{ scope.row.product.model }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="product.company_id" label="厂家"></el-table-column>
        <el-table-column align="center" prop="product.unit" label="单位"></el-table-column>
        <el-table-column align="center" prop="num" label="数量">
          <template slot-scope="scope">
            {{ Math.abs(scope.row.num) }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="price" label="单价"></el-table-column>
        <el-table-column align="center" label="金额">
          <template slot-scope="scope">
            {{ Math.abs(scope.row.num * scope.row.price) }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="batch" label="生产批号"></el-table-column>
        <el-table-column align="center" prop="expire" label="有效期"></el-table-column>
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
        companyId: '',
        optionalColumns: [],
        companies: [],
        productId: '',
        productTree: [],
        productTreeVal: [],
        receiptType: '',
        rows: [],
        total: 0,
        pageSize: 10,
        page: 1,
        formVisible: false,
        formMode: 'add',
        form: {},
        formRows: [],
        urls: {
          getRows: this.url('/api/getInventories'),
          add: this.url('/product/create'),
          edit: this.url('/product/'),
          getAllCompanies: this.url('/api/getAllCompanies'),
          getProductTree: this.url('/api/getProductTree')
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
            companyId: this.companyId,
            receiptType: this.receiptType,
            // productCompany: this.productTreeVal[0],
            product: this.productTreeVal[1]
          }
        }).then(response => {
          this.rows = response.data.rows || [];
          this.total = response.data.total || 0;
          this.loading = false;
        })
      },
      getAllCompanies() {
        this.$http.get(this.urls.getAllCompanies).then(response => {
          this.companies = response.data.rows;
        });
      },
      getProductTree() {
        this.$http.get(this.urls.getProductTree).then(response => {
          let rows = response.data.rows;

          this.productTree = rows.map(company => {
            return {
              value: company.id,
              label: company.id + '. ' + company.name,
              children: company.products.map(product => {
                return {
                  value: product.id,
                  label: product.name + ' - ' + product.model
                }
              })
            };
          });
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
        this.formRows = item.inventories || [];
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
      this.getAllCompanies();
      this.getProductTree();
      this.getRows();
    }
  }
</script>

<style scoped>

</style>
