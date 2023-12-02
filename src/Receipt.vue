<template>
  <div>
    <h3>单据信息</h3>
    <p>所有货品出库、入库的单据都可以在这里查看。</p>

    <el-row>
      <el-col :span="24">
        <!-- <el-button type="primary" @click="$router.push('import')">入库</el-button> -->
        <el-button type="primary" @click="$router.push('export')">出库</el-button>

        <el-select v-model="companyId" @change="handleSelectChange" filterable clearable placeholder="请选择公司">
          <el-option v-for="item in companies"
                     :key="item.id"
                     :value="item.id"
                     :label="item.id + '. ' + item.name">
          </el-option>
        </el-select>

        <el-select v-model="receiptType" @change="handleSelectChange" clearable placeholder="选择单据类型">
          <el-option value="in" label="入库"></el-option>
          <el-option value="out" label="出库"></el-option>
        </el-select>

        <el-input v-model="receiptSearch" placeholder="输入单据ID" clearable="" style="width: 180px;"></el-input>

        <el-button type="primary" @click="handleSelectChange">搜索</el-button>
      </el-col>
      <!--<el-col :span="12"></el-col>-->
    </el-row>
    <br>

    <el-table :data="rows" border v-loading="loading">
      <!--<el-table-column type="selection"></el-table-column>-->
      <el-table-column prop="formatted_no" label="单据编号" width="150px"></el-table-column>
      <el-table-column prop="company_name" label="交易公司"></el-table-column>
      <el-table-column prop="date" label="制单时间"></el-table-column>
      <el-table-column prop="type" label="单据类型">
        <template slot-scope="scope">
          <span>{{ {in: '入库', out: '出库'}[ scope.row.type ] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="small" @click="openFormView(scope.row)" type="text">查看</el-button>
          <el-button size="small" @click="openFormEdit(scope.row)" type="text" v-if="methodIsEnableEdit(scope.row)">修改</el-button>
          <el-popconfirm title="确认删除？"
            @confirm="deleteRows('receipt', [scope.row.id])"
          >
            <el-button slot="reference" size="small" type="text" style="margin-left: 10px;">删除</el-button>
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

    <el-dialog :title="computedIsEdit ? '修改单据' : '查看单据'" :visible.sync="formVisible" width="70%">
      <el-form v-model="form" inline label-position="left" label-width="80px">
        <el-form-item label="单据编号">
          <el-input v-model="form.formatted_no" disabled></el-input>
        </el-form-item>
        <el-form-item label="单据类型">
          <el-input :value="form.type === 'in' ? '入库' : '出库'" disabled></el-input>
        </el-form-item>
        <el-form-item label="制单时间">
          <el-date-picker type="date" v-model="form.date" value-format="yyyy-MM-dd" 
            :disabled="!computedIsEdit"></el-date-picker>
          <!-- <el-input v-model="form.date" :disabled="!computedIsEdit"></el-input> -->
        </el-form-item>
        <el-form-item label="购货单位">
          <el-select v-model="form.company_id" filterable v-if="computedIsEdit">
            <el-option v-for="item in companies"
                        :key="item.id"
                        :value="item.id"
                        :label="item.id + '. ' + item.name">
            </el-option>
          </el-select>
          <el-input v-model="form.company_name" disabled v-else></el-input>
        </el-form-item>

      <el-table :data="formRows">
        <el-table-column align="center" prop="product.name" label="品名及规格" width="240px">
          <template slot-scope="scope">
            {{ scope.row.product.name }} - {{ scope.row.product.model }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="product.company.name" label="厂家"></el-table-column>
        <el-table-column align="center" prop="product.unit" label="单位" width="80px"></el-table-column>
        <el-table-column align="center" prop="num" label="数量">
          <template slot-scope="scope">
            <el-input type="text" v-model="scope.row.num" v-if="computedIsEdit"></el-input>
            <span v-else>{{ scope.row.num }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="price" label="单价">
          <template slot-scope="scope">
            <el-input type="text" v-model="scope.row.price" v-if="computedIsEdit"></el-input>
            <span v-else>{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="金额">
          <template slot-scope="scope">
            {{ Math.abs(scope.row.num * scope.row.price).toFixed(3) }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="batch" label="生产批号" min-width="100px">
          <template slot-scope="scope">
            <el-input type="text" v-model="scope.row.batch" v-if="computedIsEdit"></el-input>
            <span v-else>{{ scope.row.batch }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="" label="生产日期" min-width="100px">
          <template slot-scope="scope">
            <el-date-picker type="date" v-model="scope.row.produce_date" v-if="computedIsEdit" value-format="yyyy-MM-dd"></el-date-picker>
            <span v-else>{{ scope.row.produce_date }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="expire" label="有效期" min-width="100px">
          <template slot-scope="scope">
            <el-date-picker type="date" v-model="scope.row.expire" v-if="computedIsEdit" value-format="yyyy-MM-dd"></el-date-picker>
            <span v-else>{{ scope.row.expire }}</span>
          </template>
        </el-table-column>
      </el-table>

      </el-form>

      <span slot="footer">
        <el-button type="success" @click="formVisible = false" v-if="computedIsEdit">取消</el-button>
        <el-button type="danger" @click="submitForm()" v-if="computedIsEdit">保存</el-button>
        <el-button type="primary" @click="exportReceipt(form.id)" v-else>导出单据</el-button>
        <el-button type="primary" @click="showDelivery(form.id)" v-if="computedShowDelivery">查看发货单</el-button>
      </span>
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
        receiptType: '',
        receiptSearch: '',
        rows: [],
        total: 0,
        pageSize: 10,
        page: 1,
        formVisible: false,
        formMode: 'add',
        form: {},
        formRows: [],
        urls: {
          getRows: this.url('/api/getReceipts'),
          delRows: this.url('/api/delRecords'),
          add: this.url('/receipt/create'),
          edit: this.url('/api/inventory/saveReceiptChangeV2'),
          getAllCompanies: this.url('/api/getAllCompanies')
        }
      };
    },
    computed: {
      computedIsEdit() {
        return this.formMode === 'edit';
      },
      computedShowDelivery() {
        return this.formMode === 'view' && this.form.type === 'in';
      }
    },
    methods: {
      methodIsEnableEdit(row) {
        // 允许修改最近1天创建的单据
        let isRecent = new Date(row.created_at).getTime() + 86400 * 1000 > new Date().getTime();
        return isRecent || (window.ims && window.ims.enableReceiptEdit);
      },
      exportReceipt(receiptId) {
        window.open(this.url('/receipt/export/' + receiptId))
      },
      showDelivery(receiptId) {
        window.open(this.url('/api/receipt/generateDelivery?receiptId=' + receiptId))
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
            search: this.receiptSearch,
            type: this.receiptType
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
      openFormAdd() {
        this.formMode = 'add';
        this.form = {};
        this.formVisible = true;
      },
      openFormView(item) {
        this.formMode = 'view';
        this.form = _.clone(item);
        this.formRows = _.map(item.inventories || [], (item) => {
          let tmp = _.clone(item);
          tmp.num = Math.abs(item.num);
          return tmp;
        });
        this.formVisible = true;
      },
      openFormEdit(item) {
        this.formMode = 'edit';
        this.form = _.clone(item);
        this.formRows = _.map(item.inventories || [], (item) => {
          let tmp = _.clone(item);
          tmp.num = Math.abs(item.num);
          return tmp;
        });
        this.formVisible = true;
      },
      submitForm() {
        let url = this.formMode === 'add'
          ? this.urls.add
          : this.urls.edit;
        let formData = {
          id: this.form.id,
          date: this.form.date,
          company_id: this.form.company_id,
          rows: _.map(this.formRows, (item) => {
            return {
              id: item.id,
              num: item.num,
              price: item.price,
              batch: item.batch,
              expire: item.expire,
              produce_date: item.produce_date,
            };
          }),
        };

        this.$http.post(url, formData).then(response => {
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
