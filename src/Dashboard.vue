<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>库存预警</span>
          </div>

          <el-form :inline="true">
            <el-form-item>
              <el-radio-group v-model="lowStorageParams.showAll" @change="getRows">
                <el-radio-button label="1">全部</el-radio-button>
                <el-radio-button label="0">低库存预警</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-form>

          <el-table :data="tableRows1" :rowClassName="tableRowClassName" border v-loading="loading">
            <el-table-column prop="product.company.name" label="生产商" min-width="100" sortable></el-table-column>
            <el-table-column prop="product.name" label="货品及规格" min-width="160" sortable>
              <template slot-scope="scope">
                <el-link type="primary" :underline="false"
                  @click="openProductDialog(scope.row.product)"
                >{{ scope.row.product.name + ' - ' + scope.row.product.model }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="num" label="数量" min-width="80"></el-table-column>
            <el-table-column prop="warning_num" label="预警值" min-width="80"></el-table-column>
            <el-table-column prop="updated_at" label="更新时间"></el-table-column>
          </el-table>
          <br>
          <el-pagination layout="total, sizes, prev, pager, next" background
                   :total="pager1.total"
                   :page-size.sync="pager1.size"
                   :current-page.sync="pager1.page"
                   :page-sizes="[10, 20, 50]">
          </el-pagination>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>过期预警</span>
          </div>

          <el-table :data="tableRows2" border v-loading="loading2">
            <el-table-column prop="product.company.name" label="生产商" min-width="100" sortable></el-table-column>
            <el-table-column prop="product.name" label="货品及规格" min-width="160" sortable>
              <template slot-scope="scope">
                <el-link type="primary" :underline="false"
                  @click="openProductDialog(scope.row.product)"
                >{{ scope.row.product.name + ' - ' + scope.row.product.model }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="num" label="数量" min-width="80"></el-table-column>
            <el-table-column prop="batch" label="生产批号"></el-table-column>
            <el-table-column prop="expire" label="过期时间" sortable></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="small" type="text" disabled="" v-if="scope.row.is_lock">已锁定</el-button>
                <el-button size="small" @click="lockExpireStock(scope.row.id)" type="text" v-else>锁定</el-button>
              </template>
            </el-table-column>
          </el-table>
          <br>
          <el-pagination layout="total, sizes, prev, pager, next" background
                   :total="pager2.total"
                   :page-size.sync="pager2.size"
                   :current-page.sync="pager2.page"
                   :page-sizes="[10, 20, 50]">
          </el-pagination>
        </el-card>
      </el-col>

      <ProductInfoDialog ref="refProductInfoDialog"></ProductInfoDialog>
    </el-row>
  </div>
</template>

<script>
  export default {
    name: "Dashboard",
    data() {
      return {
        loading: false,
        loading2: false,
        lowStorageStock:[],
        lowStorageParams: {
          showAll: 1,
        },
        nearExpireStock: [],
        pager1: {
          total: 0,
          size: 10,
          page: 1,
        },
        pager2: {
          total: 0,
          size: 10,
          page: 1,
        },
        urls: {
          getInventoryWarning: this.url('/api/getInventoryWarning'),
          getExpireWarning: this.url('/api/getExpireWarning'),
          lockStorage: this.url('/api/lockStorage'),
        }
      }
    },
    computed: {
      tableRows1() {
        let start = (this.pager1.page - 1) * this.pager1.size;
        let end = start + this.pager1.size;
        return this.lowStorageStock.slice(start, end);
      },
      tableRows2() {
        let start = (this.pager2.page - 1) * this.pager2.size;
        let end = start + this.pager2.size;
        return this.nearExpireStock.slice(start, end);
      },
    },
    methods: {
      openProductDialog(product) {
        this.$refs.refProductInfoDialog.show(product);
      },
      getRows() {
        this.loading = true;

        this.$http.get(this.urls.getInventoryWarning, {
          params: {
            ...this.lowStorageParams,
            sort: 'id',
            order: 'desc',
          }
        }).then(response => {
          this.lowStorageStock = response.data.rows || [];
          this.pager1.total = this.lowStorageStock.length;

          this.loading = false;
        })
      },
      tableRowClassName({row, rowIndex}) {
        if (row.num - row.warning_num <= 0) {
          return 'warning-row';
        }
        return '';
      },
      getRows2() {
        this.loading2 = true;

        this.$http.get(this.urls.getExpireWarning, {
          params: {
            sort: 'id',
            order: 'desc',
          }
        }).then(response => {
          this.nearExpireStock = response.data.rows || [];
          this.pager2.total = this.nearExpireStock.length;

          this.loading2 = false;
        })
      },
      lockExpireStock(rowId) {
        let param = {
          rowId,
        };

        this.$http.post(this.urls.lockStorage, param).then(response => {
          if (response.data.error === 0) {
            this.$message.success(response.data.msg || '操作成功');

            this.getRows2();
            return;
          }

          console.log(response);
          this.$message.error(response.data.msg || '请求错误');
        });
      },
    },
    created() {
      this.getRows();
      this.getRows2();
    }
  }
</script>

<style>
.el-table .warning-row {
  background: oldlace;
}
</style>
