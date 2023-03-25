<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>库存预警</span>
          </div>

          <el-form :inline="true">
            <el-form-item label="库存预警范围">
              <el-input v-model="lowStorageParams.min"></el-input>
            </el-form-item>
            <el-form-item label="-">
              <el-input v-model="lowStorageParams.max"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="getRows">查询</el-button>
            </el-form-item>
          </el-form>

          <el-table :data="lowStorageStock" border v-loading="loading">
            <!--<el-table-column type="selection"></el-table-column>-->
            <el-table-column prop="product.company.name" label="公司" width="80px"></el-table-column>
            <el-table-column prop="product.name" label="货品"></el-table-column>
            <el-table-column prop="product.model" label="型号"></el-table-column>
            <el-table-column prop="num" label="数量"></el-table-column>
            <!--<el-table-column prop="created_at" label="创建时间"></el-table-column>-->
            <el-table-column prop="updated_at" label="更新时间"></el-table-column>
            <!--<el-table-column label="操作">-->
              <!--<template slot-scope="scope">-->
                <!--<el-button size="small" @click="openFormEdit(scope.row)" type="text">编辑</el-button>-->
                <!--<el-button size="small" @click="deleteRows('company', [scope.row.id])" type="text">删除</el-button>-->
              <!--</template>-->
            <!--</el-table-column>-->
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>过期预警</span>
          </div>

          <el-table :data="nearExpireStock" border v-loading="loading2">
            <!--<el-table-column type="selection"></el-table-column>-->
            <el-table-column prop="product.company.name" label="公司" width="80px"></el-table-column>
            <el-table-column prop="product.name" label="货品"></el-table-column>
            <el-table-column prop="product.model" label="型号"></el-table-column>
            <el-table-column prop="num" label="数量"></el-table-column>
            <el-table-column prop="batch" label="生产批号"></el-table-column>
            <el-table-column prop="expire" label="过期时间"></el-table-column>
            <!--<el-table-column prop="updated_at" label="更新时间"></el-table-column>-->
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="small" type="text" disabled="" v-if="scope.row.is_lock">已锁定</el-button>
                <el-button size="small" @click="lockExpireStock(scope.row.id)" type="text" v-else>锁定</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
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
          min: 0,
          max: 100
        },
        nearExpireStock: [],
        urls: {
          getInventoryWarning: this.url('/api/getInventoryWarning'),
          getExpireWarning: this.url('/api/getExpireWarning'),
          lockStorage: this.url('/api/lockStorage'),
        }
      }
    },
    methods: {
      getRows() {
        this.loading = true;

        this.$http.get(this.urls.getInventoryWarning, {
          params: {
            min: this.lowStorageParams.min,
            max: this.lowStorageParams.max,
            sort: 'id',
            order: 'desc',
          }
        }).then(response => {
          this.lowStorageStock = response.data.rows || [];

          this.loading = false;
        })
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

<style scoped>

</style>
