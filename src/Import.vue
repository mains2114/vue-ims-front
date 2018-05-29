<template>
  <el-form inline>
    <el-row style="font-size: 24px;">
      <el-col :span="12" :offset="6" align="center">广西钟山县锦辉医疗器械有限公司收货单</el-col>
      <el-col :span="6" align="right">No.00001234</el-col>
    </el-row>

    <el-row>
      <el-col :span="12" align="left">
        <el-form-item label="供货单位">
          <!--<el-select v-model="form.company_id" filterable>-->
            <!--<el-option v-for="company in companies"-->
                       <!--:key="company.id"-->
                       <!--:value="company.id"-->
                       <!--:label="company.id + '. ' + company.name">-->
            <!--</el-option>-->
          <!--</el-select>-->

          <el-select v-model="form.companyId">
            <el-option-group v-for="group in companiesGrouped"
                             :key="group.label"
                             :label="group.label">
              <el-option v-for="company in group.children"
                         :key="company.id" :value="company.id" :label="company.id + '. ' + company.name">
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12" align="right">
        <el-form-item label="制单时间">
          <el-date-picker type="date" v-model="form.date"></el-date-picker>
        </el-form-item>
      </el-col>
    </el-row>

    <el-table border="" :data="tableRows">
      <el-table-column prop="id" label="编号" width="60"></el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="model" label="规格"></el-table-column>
      <el-table-column prop="company_name" label="生产厂家"></el-table-column>
      <el-table-column prop="unit" label="单位" width="60"></el-table-column>
      <el-table-column prop="prefer_price" label="单价">
        <template slot-scope="scope">
          <el-input v-model="scope.row.prefer_price" size="small"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="num" label="数量">
        <template slot-scope="scope">
          <el-input-number v-model="scope.row.num2" :min="0" size="small"></el-input-number>
        </template>
      </el-table-column>
      <el-table-column prop="batch" label="生产批号">
        <template slot-scope="scope">
          <el-input v-model="scope.row.batch" size="small"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="expire" label="有效期" width="165">
        <template slot-scope="scope">
          <el-date-picker type="date" v-model="scope.row.expire" size="small" placeholder="选择日期"></el-date-picker>
        </template>
      </el-table-column>
      <el-table-column prop="total" label="总价" width="100">
        <template slot-scope="scope">
          {{ scope.row.price * (scope.row.num2 || 0) | toFixed(2) }}
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
      <el-col :span="6">收货人：黄忠发</el-col>
      <el-col :span="6">送货人：</el-col>
      <el-col :span="6">制单：熊水香</el-col>
      <el-col :span="6">单位盖章：（未盖章无效）</el-col>
    </el-row>

    <el-row style="text-align: left;">
      <el-col :span="6">地址：钟山县西路原收费站北侧</el-col>
      <el-col :span="12">电话：8972468&nbsp;&nbsp;13132943929&nbsp;&nbsp;13878456812</el-col>
      <el-col :span="6">传真：8972468</el-col>
    </el-row>

    <el-row>
      <el-col :span="12" :offset="6" style="text-align: center;">
        <el-button type="text" icon="el-icon-plus" @click="dialogFormVisible = true">添加货物</el-button>
        <el-button type="text" icon="el-icon-message" @click="submitReceipt">提交表单</el-button>
      </el-col>
    </el-row>

    <el-dialog title="选择货物" :visible.sync="dialogFormVisible">
      <el-form inline>
        <el-form-item label="生产商" :label-width="formLabelWidth">
          <el-select v-model="productsFilter" placeholder="请选择生产商">
            <el-option v-for="company in companies"
                       v-if="company.type === 'manufacturer'"
                       :key="company.id"
                       :value="company.id"
                       :label="company.id + '. ' + company.name">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <el-table ref="selectTable" border="" :data="productsFiltered" height="400" @selection-change="productSelectedChange">
        <el-table-column prop="id" label="编号" type="selection"></el-table-column>
        <el-table-column prop="company_name" label="生产厂家"></el-table-column>
        <el-table-column prop="name" label="名称" width="200" sortable></el-table-column>
        <el-table-column prop="model" label="规格"></el-table-column>
        <el-table-column prop="unit" label="单位"></el-table-column>
        <el-table-column prop="price" label="单价"></el-table-column>
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
        products: [],
        productsSelected: [],
        components: {},
        urls: {
          getRows: this.url('/api/getCompanies'),
          add: this.url('/company/create'),
          edit: this.url('/company/'),
          getAllCompanies: this.url('/api/getAllCompanies'),
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

          if (value.company.id === this.productsFilter) {
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
      toFixed(num, precision = 2) {
        return num.toFixed(precision);
      }
    },
    methods: {
      getManufacturers() {
        this.$http.get(this.urls.getAllCompanies).then(response => {
          this.companies = response.data.rows || [];
        })
      },
      getProducts() {
        this.$http.get(this.url('/api/getProducts'), {
          params: {
            companyType: 0,
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
        this.tableRows = _.unionBy(this.tableRows, this.productsSelected, 'id');
        this.dialogFormVisible = false;
      },
      deleteTableRow(row) {
        this.tableRows.splice(
          _.findIndex(this.tableRows, o => o.id = row.id),
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

        this.$http.post(this.urls.submitForm, form).then(
          response => {
            if (response.data.error === 0) {
              this.$message.success(response.data.msg || '操作成功');
              this.$router.push('/receipt');
              return;
            }

            console.log(response);
            this.$message.error(response.data.msg || '请求错误');
          }
        );
      }
    },
    created() {
      this.getManufacturers();
      this.getProducts();
    }
  }
</script>
