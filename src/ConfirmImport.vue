<template>
  <el-form inline>
    <el-row style="font-size: 24px;">
      <el-col :span="12" :offset="6" align="center">验收入库</el-col>
      <!-- <el-col :span="6" align="right">No.00001234</el-col> -->
    </el-row>

    <el-row>
      <el-col :span="12" align="left">
        <el-form-item label="供货单位">
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

    <el-table border="" :data="tableRows" show-summary :summary-method="getSummaries">
      <!-- <el-table-column prop="id" label="编号" width="60"></el-table-column> -->
      <el-table-column prop="product_name" label="名称"></el-table-column>
      <el-table-column prop="product_model" label="规格"></el-table-column>
      <el-table-column prop="manufacturer" label="生产厂家"></el-table-column>
      <el-table-column prop="product_unit" label="单位" width="60"></el-table-column>
      <el-table-column prop="num" label="数量">
        <template slot-scope="scope">
          <el-input v-model="scope.row.num" size="small"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="单价">
        <template slot-scope="scope">
          <el-input v-model="scope.row.price" size="small"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="total" label="总价" width="100">
        <template slot-scope="scope">
          {{ scope.row.price * (scope.row.num || 0) | toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="batch" label="生产批号" min-width="120">
        <template slot-scope="scope">
          <el-input v-model="scope.row.batch" size="small"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="" label="生产日期" min-width="100">
        <template slot-scope="scope">
          <el-date-picker type="date" v-model="scope.row.produce_date" size="small" placeholder="选择日期"
                          value-format="yyyy-MM-dd">
          </el-date-picker>
        </template>
      </el-table-column>
      <el-table-column prop="expire" label="有效期" min-width="100">
        <template slot-scope="scope">
          <el-date-picker type="date" v-model="scope.row.expire" size="small" placeholder="选择日期"
                          value-format="yyyy-MM-dd">
          </el-date-picker>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" icon="el-icon-delete" size="small" @click="deleteTableRow(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <br>

    <el-row style="text-align: left;">
      <el-col :span="6"><el-form-item label="收货人："><el-input v-model="form.receiver" disabled></el-input></el-form-item></el-col>
      <el-col :span="6">
        <el-form-item label="送货人：">
          <el-select v-model="form.deliverer" size="default" allow-create filterable clearable default-first-option>
            <el-option v-for="item in userOptions" :key="item.value" :label="item.value" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="制单：">
          <el-select v-model="form.creator" size="default" allow-create filterable clearable default-first-option>
            <el-option v-for="item in userOptions" :key="item.value" :label="item.value" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="复核：">
          <el-select v-model="form.reviewer" size="default" allow-create filterable clearable default-first-option>
            <el-option v-for="item in userOptions" :key="item.value" :label="item.value" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
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

    <el-dialog title="选择验收记录进行入库" :visible.sync="dialogFormVisible" width="70%">
      <!-- <el-form inline>
        <el-form-item label="生产商" :label-width="formLabelWidth">
          <el-select v-model="productsFilter" placeholder="请选择生产商" filterable clearable @change="getProducts">
            <el-option v-for="company in companies"
                       v-if="company.type === 'manufacturer'"
                       :key="company.id"
                       :value="company.id"
                       :label="company.id + '. ' + company.name">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form> -->

      <el-table ref="selectTable" border="" :data="products" height="400" @selection-change="productSelectedChange">
        <el-table-column prop="id" label="编号" type="selection"></el-table-column>
        <el-table-column prop="manufacturer" label="生产厂家"></el-table-column>
        <el-table-column prop="product_name" label="名称" width="200" sortable></el-table-column>
        <el-table-column prop="product_model" label="规格"></el-table-column>
        <el-table-column prop="batch" label="生产批号"></el-table-column>
        <el-table-column prop="produce_date" label="生产日期" width="100"></el-table-column>
        <el-table-column prop="expire" label="有效期" width="100"></el-table-column>
        <el-table-column prop="price" label="单价" width="80"></el-table-column>
        <el-table-column prop="num" label="数量" width="65"></el-table-column>
        <el-table-column prop="conclusion" label="结论" width="60"></el-table-column>
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
          date: new Date(),
          creator: this.getUsername(),
          reviewer: '',
          deliverer: '',
        },
        userOptions: [],
        formLabelWidth: '120px',
        companyType: null,
        companies: [],
        productsFilter: null,
        products: [],
        productsSelected: [],
        components: {},
        urls: {
          getUsers: this.url('/api/account/getUsers'),
          getRows: this.url('/api/getCompanies'),
          add: this.url('/company/create'),
          edit: this.url('/company/'),
          getAllCompanies: this.url('/api/getAllCompanies'),
          getConfirmLog: this.url('/api/purchase/getConfirmLog'),
          submitForm: this.url('/inventory/import')
        }
      }
    },
    computed: {
      productsFiltered() {
        return this.products.filter((value) => {
          if (!this.productsFilter) {
            return true;
          }

          if (value.product_company_id === this.productsFilter) {
            return true;
          } else {
            return false;
          }
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
    },
    methods: {
      getSummaries(param) {
        const sums = [];
        const total = this.tableRows.reduce((prev, curr) => {
          return prev + curr.price * curr.num;
        }, 0);
        sums[5] = '合计金额'
        sums[6] = isNaN(total) ? '0.00' : total.toFixed(2);
        return sums;
      },
      getUsers() {
        this.$http.get(this.urls.getUsers, {params: {sort: 'id'}}).then(response => {
          let users = response.data.rows;
          this.userOptions = users.map((el, index) => {
            return {value: el.name};
          })
        })
      },
      getManufacturers() {
        this.$http.get(this.urls.getAllCompanies).then(response => {
          this.companies = response.data.rows || [];
        })
      },
      getProducts() {
        this.$http.get(this.urls.getConfirmLog, {
          params: {
            productCompanyId: this.productsFilter,
            accountId: this.getAccountId(),
            limit: 100,
            sort: 'id',
            order: 'desc'
          }
        }).then(response => {
          this.products = response.data.rows;
        })
      },
      productSelectedChange(rows) {
        this.productsSelected = rows;
      },
      chooseProducts() {
        this.tableRows = _.unionBy(this.tableRows, this.productsSelected, 'id');
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
          account_id: this.getAccountId(),
          company_id: this.form.companyId,
          creator: this.form.creator,
          reviewer: this.form.reviewer,
          deliverer: this.form.deliverer,
          rows: []
        };

        form.rows = this.tableRows.map((row, index) => {
          return {
            product_id: row.product_id,
            batch: row.batch,
            expire: row.expire,
            produce_date: row.produce_date,
            num: row.num,
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
      }
    },
    created() {
      this.getManufacturers();
      this.getProducts();
      this.getUsers();
    }
  }
</script>
