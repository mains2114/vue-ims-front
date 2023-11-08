<style>
  .el-input > .el-input__inner {
    padding: 0 10px;
  }
  .el-input > .el-input-group__append {
    padding: 0 10px;
  }
</style>

<template>
  <el-form inline>
    <el-row style="font-size: 24px;">
      <el-col :span="12" :offset="6" align="center">出库单</el-col>
      <!-- <el-col :span="6" align="right">No.00001234</el-col> -->
    </el-row>

    <el-row>
      <el-col :span="12" align="left">
        <el-form-item label="收货单位">
          <el-select v-model="form.companyId" filterable>
            <el-option-group v-for="group in companiesGrouped"
                             :key="group.label"
                             :label="group.label">
              <el-option v-for="company in group.children"
                         :key="company.id"
                         :value="company.id"
                         :label="company.id + '. ' + company.name">
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12" align="right">
        <el-form-item label="制单时间">
          <el-date-picker type="date" v-model="form.date" value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>
      </el-col>
    </el-row>

    <el-table border="" :data="tableRows">
      <!--<el-table-column prop="id" label="编号" width="60"></el-table-column>-->
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="model" label="规格"></el-table-column>
      <el-table-column prop="company_name" label="生产厂家" width="80"></el-table-column>
      <el-table-column prop="unit" label="单位" width="60"></el-table-column>
      <el-table-column prop="num" label="数量">
        <template slot-scope="scope">
          <el-input v-model="scope.row.num2" :min="0" size="small">
            <template slot="append">/ {{ scope.row.num }}</template>
          </el-input>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="单价">
        <template slot-scope="scope">
          <el-input v-model="scope.row.price" size="small"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="total" label="总价" width="100">
        <template slot-scope="scope">
          {{ scope.row.price * (scope.row.num2 || 0) | toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="batch" label="生产批号" min-width="120"></el-table-column>
      <el-table-column prop="expire" label="有效期" min-width="100"></el-table-column>
      <el-table-column label="操作" width="80" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" icon="el-icon-delete" size="small" @click="deleteTableRow(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <br>

    <el-row style="text-align: left;">
      <el-col :span="6"><el-form-item label="收货人："><el-input v-model="form.receiver"></el-input></el-form-item></el-col>
      <el-col :span="6"><el-form-item label="送货人："><el-input v-model="form.delivery"></el-input></el-form-item></el-col>
      <el-col :span="6"><el-form-item label="制单："><el-input v-model="form.creator"></el-input></el-form-item></el-col>
      <el-col :span="6"><el-form-item label="审核："><el-input v-model="form.reviewer"></el-input></el-form-item></el-col>
    </el-row>

    <!-- <el-row style="text-align: left;">
      <el-col :span="6">地址：钟山县西路原收费站北侧</el-col>
      <el-col :span="12">电话：8972468&nbsp;&nbsp;13132943929&nbsp;&nbsp;13878456812</el-col>
      <el-col :span="6">传真：8972468</el-col>
    </el-row> -->

    <el-row>
      <el-col :span="12" :offset="6" style="text-align: center;">
        <el-button type="text" icon="el-icon-plus" @click="dialogFormVisible = true">添加货物</el-button>
        <el-button type="text" icon="el-icon-message" @click="submitReceipt">提交表单</el-button>
      </el-col>
    </el-row>

    <el-dialog title="选择货物（仅显示有库存的货物）" :visible.sync="dialogFormVisible" width="70%">
      <el-form inline>
        <el-form-item label="选择货品" :label-width="formLabelWidth">
          <el-cascader v-model="productTreeVal" :options="productTree" placeholder="请选择货品"
                      clearable
                      filterable
                      @change="productTreeChange"
                      style="width: 250px"
                      :props="{ expandTrigger: 'click', checkStrictly: true }"
          ></el-cascader>
        </el-form-item>
      </el-form>

      <el-table ref="selectTable" border="" :data="productsFiltered" height="400" @selection-change="productSelectedChange">
        <el-table-column prop="id" label="编号" type="selection"></el-table-column>
        <el-table-column prop="company_name" label="生产厂家"></el-table-column>
        <el-table-column prop="name" label="名称" width="200" sortable></el-table-column>
        <el-table-column prop="model" label="规格"></el-table-column>
        <el-table-column prop="batch" label="批次" :width="110"></el-table-column>
        <el-table-column prop="expire" label="有效期" :width="100"></el-table-column>
        <!--<el-table-column prop="unit" label="单位"></el-table-column>-->
        <!-- <el-table-column prop="prefer_price" label="单价"></el-table-column> -->
        <el-table-column prop="num" label="数量"></el-table-column>
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="chooseProducts">确 定</el-button>
      </div>
    </el-dialog>
  </el-form>
</template>

<script>
  export default {
    name: 'app',
    data() {
      return {
        msg: 'hello vue',
        tableRows: [],
        dialogFormVisible: false,
        form: {
          companyId: null,
          date: '',
        },
        formLabelWidth: '120px',
        companyType: null,
        companies: [],
        productsFilter: null,
        productTree: [],
        productTreeVal: [],
        products: [],
        productsSelected: [],
        components: {},
        urls: {
          getRows: this.url('/api/getCompanies'),
          add: this.url('/company/create'),
          edit: this.url('/company/'),
          getAllCompanies: this.url('/api/getAllCompanies'),
          getStorage: this.url('/api/getStorage'),
          submitForm: this.url('/inventory/export'),
          getProductTree: this.url('/api/getProductTree'),
        }
      }
    },
    computed: {
      productsFiltered() {
        return this.products.filter((value) => {
          if (this.productTreeVal.length === 0) {
            return true;
          }
          if (this.productTreeVal.length === 1) {
            return value.company_id === this.productTreeVal[0];
          }
          if (this.productTreeVal.length >= 2) {
            return value.product_id === this.productTreeVal[1];
          }
          return true;
        })
      },
      companiesGrouped() {
        let group = {
          manufacturer: {
            label: '生产商',
            children: [],
          },
          seller: {
            label: '销售商',
            children: [],
          },
          customer: {
            label: '顾客',
            children: [],
          }
        };

        _.each(this.companies, company => {
          group[ company.type ].children.push(company);
        });

        return group;
      }
    },
    filters: {
      toFixed(num, precision = 2) {
        return num.toFixed(precision);
      }
    },
    methods: {
      getManufacturers() {
        this.$http.get(this.urls.getAllCompanies).then(response => {
          this.companies = response.data.rows;
        })
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
      getProducts() {
        this.$http.get(this.urls.getStorage, {
          params: {
            order: 'asc',
            limit: 100
          }
        }).then(response => {
          this.products = response.data.rows;
        })
      },
      productSelectedChange(rows) {
        this.productsSelected = rows;
      },
      chooseProducts() {
        console.log(this.productsSelected);
        var selectedRows = this.productsSelected.map(item => {
          let newItem = _.clone(item);
          newItem.price = 0;
          // newItem.price = parseFloat(item.prefer_price);
          // newItem.num = parseFloat(item.num);
          return newItem;
        });
        this.tableRows = _.unionBy(this.tableRows, selectedRows, 'id');
        this.dialogFormVisible = false;
      },
      deleteTableRow(row) {
        this.tableRows.splice(
          _.findIndex(this.tableRows, o => o.id == row.id),
          1
        );
      },
      submitReceipt() {
        var form = {
          company_id: this.form.companyId,
          rows: []
        };

        form.rows = this.tableRows.map((row, index) => {
          return {
            product_id: row.id,
            batch: row.batch,
            expire: row.expire,
            num: row.num2,
            price: row.price
          };
        });

        this.$http.post(this.urls.submitForm, form).then(response => {
          if (response.data.error === 0) {
            this.$message.success(response.data.msg || '操作成功');
            this.$router.push('/receipt');
            return;
          }

          console.log(response);
          this.$message.error(response.data.msg || '请求错误');
        });
      },
      productTreeChange() {
        console.log(this.productTreeVal);
      },
    },
    created() {
      this.getManufacturers();
      this.getProductTree();
      this.getProducts();
    }
  }
</script>

