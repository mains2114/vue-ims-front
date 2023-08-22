<template>
  <el-form inline>

    <el-row style="font-size: 24px;">
      <el-col :span="12" :offset="0" align="left">采购验收</el-col>
    </el-row>
    <br>

    <el-table border="" :data="tableRows">
      <el-table-column prop="name" label="品名及规格" width="200">
        <template slot-scope="scope">{{ scope.row.name + ' - ' + scope.row.model }}</template>
      </el-table-column>
      <el-table-column prop="company_name" label="生产厂家"></el-table-column>
      <el-table-column prop="num" label="数量">
        <template slot-scope="scope">
          <el-input v-model="scope.row.num2" size="small"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="单价">
        <template slot-scope="scope">
          <el-input v-model="scope.row.price" size="small"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="batch" label="生产批号">
        <template slot-scope="scope">
          <el-input v-model="scope.row.batch" size="small"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="batch2" label="灭菌批号">
        <template slot-scope="scope">
          <el-input v-model="scope.row.batch2" size="small"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="expire" label="有效期" width="165">
        <template slot-scope="scope">
          <el-date-picker type="date" v-model="scope.row.expire" size="small" placeholder="选择日期"
                          value-format="yyyy-MM-dd">
          </el-date-picker>
        </template>
      </el-table-column>
      <el-table-column prop="company_id" label="供货单位" width="200">
        <template slot-scope="scope">
          <el-select v-model="scope.row.company_id" size="small" filterable="">
            <el-option-group v-for="group in companiesGrouped"
                             :key="group.label"
                             :label="group.label">
              <el-option v-for="company in group.children"
                         :key="company.id" :value="company.id" :label="company.id + '. ' + company.name">
              </el-option>
            </el-option-group>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="company_audit" label="资质证明">
        <template slot-scope="scope">
          <el-select v-model="scope.row.company_audit" size="small"
            allow-create
            filterable
            default-first-option
          >
            <el-option
              v-for="item in companyAuditOptions"
              :key="item.value"
              :label="item.value"
              :value="item.value">
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="package_status" label="包装情况">
        <template slot-scope="scope">
          <el-select v-model="scope.row.package_status" size="small"
            allow-create
            filterable
            default-first-option
          >
            <el-option
              v-for="item in packageStatusOptions"
              :key="item.value"
              :label="item.value"
              :value="item.value">
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="conclusion" label="结论">
        <template slot-scope="scope">
          <el-select v-model="scope.row.conclusion" size="small"
            allow-create
            filterable
            default-first-option
          >
            <el-option
              v-for="item in conclusionOptions"
              :key="item.value"
              :label="item.value"
              :value="item.value">
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="confirm_person" label="验收人">
        <template slot-scope="scope">
          <el-select v-model="scope.row.confirm_person" size="small"
            allow-create
            filterable
            default-first-option
          >
            <el-option
              v-for="item in confirmPersonOptions"
              :key="item.value"
              :label="item.value"
              :value="item.value">
            </el-option>
          </el-select>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="80" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" icon="el-icon-delete" size="small" @click="deleteTableRow(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <br>

    <el-row>
      <el-col :span="12" :offset="6" style="text-align: center;">
        <el-button type="text" icon="el-icon-plus" @click="dialogFormVisible = true">选择货物</el-button>
        <el-button type="text" icon="el-icon-message" @click="submitReceipt">提交表单</el-button>
      </el-col>
    </el-row>

    <el-dialog title="选择货物" :visible.sync="dialogFormVisible">
      <el-form inline>
        <el-form-item label="生产商" :label-width="formLabelWidth">
          <el-select v-model="productsFilter" placeholder="请选择生产商" filterable @change="getProducts">
            <el-option v-for="company in computedManufacturer"
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
          name: '',
          region: '',
          date1: '',
          date2: '',
          delivery: false,
          type: [],
          resource: '',
          desc: '',
        },
        formLabelWidth: '120px',
        companyType: null,
        companies: [],
        productsFilter: null,
        products: [],
        productsSelected: [],
        companyAuditOptions: [
          {value: "齐全"},
          {value: "缺失"},
        ],
        packageStatusOptions: [
          {value: "良好"},
          {value: "破损"},
        ],
        conclusionOptions: [
          {value: "合格"},
          {value: "不合格"},
        ],
        confirmPersonOptions: [
          {value: "黄海芳"},
        ],
        components: {},
        urls: {
          getRows: this.url('/api/getCompanies'),
          add: this.url('/company/create'),
          edit: this.url('/company/'),
          getAllCompanies: this.url('/api/getAllCompanies'),
          submitForm: this.url('/api/purchase/addConfirmLog'),
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
      },
      computedManufacturer() {
        return _.filter(this.companies, company => {
          return company.type === 'manufacturer';
        });
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
            company_id: this.productsFilter,
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
        let selectedRows = this.productsSelected.map(item => {
          let newItem = _.clone(item);
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
          company_id: this.companyType,
          rows: []
        };

        form.rows = this.tableRows.map((row, index) => {
          return {
            product_id: row.id,
            batch: row.batch,
            expire: row.expire,
            num: row.num2,
            price: row.price,
            batch2: row.batch2,
            company_id: row.company_id,
            company_audit: row.company_audit,
            package_status: row.package_status,
            conclusion: row.conclusion,
            confirm_person: row.confirm_person
          };
        });

        this.$http.post(this.urls.submitForm, form).then(response => {
          if (response.data.error === 0) {
            this.$message.success(response.data.msg || '操作成功');
            this.$router.push('/purchaseManage/confirmLog');
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
    }
  }
</script>
