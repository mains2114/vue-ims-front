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

        <el-cascader placeholder="请选择货品" clearable filterable
          v-model="productTreeVal"
          :options="productTree"
          :props="{expandTrigger:'click'}"
          @change="handleSelectChange"
        ></el-cascader>

        <el-select v-model="receiptType" @change="handleSelectChange" clearable placeholder="选择单据类型">
          <el-option value="in" label="入库"></el-option>
          <el-option value="out" label="出库"></el-option>
        </el-select>
        
        <el-button type="primary" @click="handleSelectChange">搜索</el-button>

        <el-popover placement="bottom" trigger="click" ref="popoverOptionalColunns">
          <el-checkbox-group v-model="optionalColumns">
            <el-checkbox-button label="多选框"></el-checkbox-button>
            <el-checkbox-button label="编号"></el-checkbox-button>
            <el-checkbox-button label="生产日期"></el-checkbox-button>
            <el-checkbox-button label="有效期"></el-checkbox-button>
            <el-checkbox-button label="单位"></el-checkbox-button>
            <el-checkbox-button label="单价"></el-checkbox-button>
            <el-checkbox-button label="总价"></el-checkbox-button>
            <el-checkbox-button label="操作时间"></el-checkbox-button>
          </el-checkbox-group>
        </el-popover>
        <el-tooltip  effect="dark" content="显示/隐藏表格列" placement="top">
          <el-button type="primary" icon="el-icon-menu" v-popover:popoverOptionalColunns></el-button>
        </el-tooltip>

        <el-dropdown split-button type="primary" trigger="click" @command="handleCommand">
          操作
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="generateDelivery" :disabled="!rowIdStr">生成发货单</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
      <!--<el-col :span="12"></el-col>-->
    </el-row>
    <br>

    <el-table :data="rows" border v-loading="loading" @selection-change="handleSelectionChange">
      <el-table-column type="selection" v-if="optionalColumns.indexOf('多选框') !== -1"></el-table-column>
      <el-table-column prop="id" label="编号" width="70" v-if="optionalColumns.indexOf('编号') !== -1"></el-table-column>
      <el-table-column prop="manufacturer" label="生产商"></el-table-column>
      <el-table-column prop="product_name" label="货品及规格" min-width="140">
        <template slot-scope="scope">
          <el-link type="primary" :underline="false"
            @click="openProductDialog(scope.row.product)"
          >{{ scope.row.product_name + ' - ' + scope.row.product_model }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="batch" label="生产批号"></el-table-column>
      <el-table-column prop="produce_date" label="生产日期" v-if="optionalColumns.indexOf('生产日期') !== -1"></el-table-column>
      <el-table-column prop="expire" label="有效期" v-if="optionalColumns.indexOf('有效期') !== -1"></el-table-column>
      <el-table-column prop="receipt_type" label="操作类型">
        <template slot-scope="scope">
          {{ scope.row.receipt_type === 'in' ? '入库' : '出库' }}
        </template>
      </el-table-column>
      <el-table-column prop="num" label="数量"></el-table-column>
      <el-table-column prop="product_unit" label="单位" v-if="optionalColumns.indexOf('单位') !== -1"></el-table-column>
      <el-table-column prop="price" label="单价" v-if="optionalColumns.indexOf('单价') !== -1">
        <template slot-scope="scope">
          {{ parseFloat(scope.row.price) }}
        </template>
      </el-table-column>
      <el-table-column prop="price_total" label="总价" v-if="optionalColumns.indexOf('总价') !== -1">
        <template slot-scope="scope">
          {{ Math.abs(scope.row.num * scope.row.price).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="receipt_time" label="操作时间" v-if="optionalColumns.indexOf('操作时间') !== -1"></el-table-column>
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
          <el-date-picker type="date" v-model="form.date" value-format="yyyy-MM-dd"></el-date-picker>
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

    <ProductInfoDialog ref="refProductInfoDialog"></ProductInfoDialog>
  </div>
</template>

<script>
  export default {
    name: "Company",
    data() {
      return {
        loading: false,
        rowIdStr: '',
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
          generateDelivery: this.url('/api/receipt/generateDelivery'),
          getRows: this.url('/api/getInventories'),
          add: this.url('/product/create'),
          edit: this.url('/product/'),
          getAllCompanies: this.url('/api/getAllCompanies'),
          getProductTree: this.url('/api/getProductTree')
        }
      };
    },
    methods: {
      openProductDialog(product) {
        this.$refs.refProductInfoDialog.show(product);
      },
      handleSelectionChange(val) {
        let rowIdArr = [];
        val.map((el, index) => {
            rowIdArr.push(el.id);
        })
        this.rowIdStr = rowIdArr.join(',');
      },
      handleCommand(command) {
        if (command === 'generateDelivery') {
          this.generateDelivery();
        }
      },
      generateDelivery() {
        window.open(this.urls.generateDelivery + '?companyId=' + this.companyId + '&rowIdStr=' + this.rowIdStr);
      },
      getRows() {
        this.loading = true;
        this.$http.get(this.urls.getRows, {
          params: {
            sort: 'id',
            order: 'desc',
            offset: this.pageSize * (this.page - 1),
            limit: this.pageSize,
            companyId: this.companyId,
            accountId: this.getAccountId(),
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
