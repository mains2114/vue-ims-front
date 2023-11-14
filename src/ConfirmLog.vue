<template>
  <div>
    <h3>验收记录</h3>

    <el-row>
      <el-col :span="24">
        <el-button type="primary" @click="$router.push('confirmForm')">采购验收</el-button>
        <el-button type="primary" @click="$router.push('confirmImport')">验收入库</el-button>

        <el-select v-model="companyId" @change="handleSelectChange" filterable clearable placeholder="请选择供货单位">
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
        <el-button type="primary" @click="handleSelectChange">搜索</el-button>
      </el-col>
    </el-row>
    <br>

    <el-table :data="rows" border v-loading="loading">
      <el-table-column prop="id" label="验收日期">
        <template slot-scope="scope">{{ scope.row.created_at.substring(0, 10) }}</template>
      </el-table-column>
      <el-table-column prop="manufacturer" label="生产厂家"></el-table-column>
      <el-table-column prop="" label="品名及规格">
        <template slot-scope="scope">{{ scope.row.product_name + ' - ' + scope.row.product_model }}</template>
      </el-table-column>
      <el-table-column prop="batch" label="生产批号"></el-table-column>
      <el-table-column prop="produce_date" label="生产日期">
        <template slot-scope="scope">{{ scope.row.produce_date | trimZeroDate }}</template>
      </el-table-column>
      <el-table-column prop="expire" label="有效期"></el-table-column>
      <el-table-column prop="price" label="价格" width="80"></el-table-column>
      <el-table-column prop="num" label="数量" width="80"></el-table-column>
      <el-table-column prop="company_name" label="供货单位"></el-table-column>
      <el-table-column prop="company_audit" label="资质证明"></el-table-column>
      <el-table-column prop="package_status" label="包装情况"></el-table-column>
      <el-table-column prop="conclusion" label="结论"></el-table-column>
      <el-table-column prop="confirm_person" label="验收人"></el-table-column>
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

    <el-dialog :title="formMode === 'edit' ? '编辑' : '添加货品'" :visible.sync="formVisible">
      <el-form ref="form" v-model="form" label-position="left" label-width="110px">
        <el-form-item label="编号" v-if="formMode === 'edit'">
          <el-input v-model="form.id" disabled></el-input>
        </el-form-item>

        <el-form-item label="生产厂家">
          <el-input v-model="form.manufacturer" disabled=""></el-input>
        </el-form-item>
        <el-form-item label="品名">
          <el-input v-model="form.product_name" disabled=""></el-input>
        </el-form-item>
        <el-form-item label="规格">
          <el-input v-model="form.product_model" disabled=""></el-input>
        </el-form-item>

        <el-form-item label="价格">
          <el-input v-model="form.price"></el-input>
        </el-form-item>
        <el-form-item label="数量">
          <el-input v-model="form.num"></el-input>
        </el-form-item>

        <el-form-item label="生产批号">
          <el-input v-model="form.batch"></el-input>
        </el-form-item>
        <el-form-item label="生产日期">
          <el-date-picker type="date" v-model="form.produce_date" placeholder="选择日期"
                          value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="有效期">
          <el-date-picker type="date" v-model="form.expire" placeholder="选择日期"
                          value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="供货单位">
          <el-select v-model="form.company_id" filterable="">
            <el-option-group v-for="group in companiesGrouped"
                             :key="group.label"
                             :label="group.label">
              <el-option v-for="company in group.children"
                         :key="company.id" :value="company.id" :label="company.id + '. ' + company.name">
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="资质证明">
          <el-input v-model="form.company_audit"></el-input>
        </el-form-item>
        <el-form-item label="包装情况">
          <el-input v-model="form.package_status"></el-input>
        </el-form-item>
        <el-form-item label="结论">
          <el-input v-model="form.conclusion"></el-input>
        </el-form-item>
        <el-form-item label="验收人">
          <el-input v-model="form.confirm_person"></el-input>
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
        companyId: '',
        companies: [],
        productTree: [],
        productTreeVal: [],
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
          getRows: this.url('/api/purchase/getConfirmLog'),
          add: this.url('/product/create'),
          edit: this.url('/api/purchase/editConfirmLog'),
          getAllCompanies: this.url('/api/getAllCompanies'),
          getProductTree: this.url('/api/getProductTree'),
        }
      };
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
            productId: this.productTreeVal[1],
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
        this.form = Object.assign({}, item);
        this.formVisible = true;
      },
      openDialog2(rows) {
        this.dialog2Rows = rows;
        this.dialog2Visible = true;
      },
      submitForm() {
        let url = this.formMode === 'add'
          ? this.urls.add
          : this.urls.edit;

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
      this.getProductTree();
      this.getRows();
    }
  }
</script>

<style scoped>

</style>
