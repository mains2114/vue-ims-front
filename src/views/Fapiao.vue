<template>
  <div>
    <h3>发票管理</h3>
    <p>从电子税务局平台导出的开票、收票信息管理。</p>

    <el-row>
      <el-col :span="24" class="hf-toolbar">
        <el-button type="primary" @click="openImportDialog">导入发票</el-button>
        <el-input v-model="searchKeyword" placeholder="搜索发票号/销方/购方" clearable style="width: 280px;"></el-input>
        <el-date-picker
          v-model="paymentMonthRange"
          type="monthrange"
          range-separator="至"
          start-placeholder="开始月份"
          end-placeholder="结束月份"
          format="yyyy-MM"
          value-format="yyyy-MM"
          :picker-options="monthRangePickerOptions"
        ></el-date-picker>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button type="primary" @click="openStatistics">统计报表</el-button>
      </el-col>
    </el-row>
    <br>

    <el-table :data="rows" border v-loading="loading" highlight-selection-row>
      <el-table-column prop="fapiao_time" label="开票日期" width="140px"></el-table-column>
      <el-table-column prop="fapiao_no" label="发票号码" width="160px"></el-table-column>
      <el-table-column prop="seller_name" label="销方名称" min-width="120px"></el-table-column>
      <el-table-column prop="buyer_name" label="购买方名称" min-width="120px"></el-table-column>
      <el-table-column prop="total_amount" label="价税合计(元)" width="130px">
        <template slot-scope="scope">
          <span style="font-weight: bold; color: #E6A23C;">¥ {{ formatAmount(scope.row.total_amount / 100) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="fapiao_status" label="发票状态" width="120px"></el-table-column>
      <el-table-column prop="payment_month" label="结算月份" width="120px">
        <template slot-scope="scope">
          <span style="cursor: pointer; color: #409EFF; text-decoration: underline;" @click="openReceiptsDialog(scope.row)">{{ scope.row.payment_month || '未设置' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结算清单" min-width="150px">
        <template slot-scope="scope">
          <span v-if="scope.row.payment_receipts" style="cursor: pointer; color: #409EFF; text-decoration: underline;" @click="openReceiptsDialog(scope.row)">
            {{ scope.row.payment_receipts }}
          </span>
          <span v-else style="color: #909399;">无</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180px">
        <template slot-scope="scope">
          <el-button size="small" type="text" @click="showRawData(scope.row)" style="margin-right: 20px;">原始数据</el-button>
          <el-popconfirm title="确认删除？" @confirm="deleteFapiao(scope.row.id)">
            <el-button slot="reference" size="small" type="text">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <br>

    <el-pagination layout="total, sizes, prev, pager, next" background @size-change="handleSizeChange"
      @current-change="handlePageChange" :total="total" :page-size="pageSize" :current-page.sync="page"
      :page-sizes="[10, 20, 50]">
    </el-pagination>

    <el-dialog :title="importDialogTitle" :visible.sync="importDialogVisible" width="500px">
      <el-form>
        <el-form-item label="选择Excel文件">
          <el-upload
            class="upload-demo"
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="uploadFileList"
            accept=".xlsx,.xls"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">仅支持xlsx/xls格式文件</div>
          </el-upload>
        </el-form-item>
        <div v-if="uploadFileList.length > 0" style="color: #67C23A; margin-bottom: 15px;">
          <i class="el-icon-check"></i> 文件已选择: {{ uploadFileList[0].name }}
        </div>
      </el-form>
      <span slot="footer">
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImport" :disabled="uploadFileList.length === 0 || importLoading">
          <i class="el-icon-loading" v-if="importLoading"></i>
          {{ importLoading ? '导入中...' : '开始导入' }}
        </el-button>
      </span>
    </el-dialog>

    <el-dialog title="统计报表" :visible.sync="showStatistics" width="800px">
      <div style="margin-bottom: 15px;">
        <span style="color: #606266;">当前筛选：</span>
        <span v-if="paymentMonthRange.length === 2" style="margin-right: 20px;">
          结算月份：{{ paymentMonthRange[0] }} 至 {{ paymentMonthRange[1] }}
        </span>
        <span v-else>结算月份：未选择</span>
        <el-button type="primary" @click="getStatisticsData" style="margin-left: 20px;">查询</el-button>
      </div>
      <el-table :data="statisticsData" border v-loading="statisticsLoading">
        <el-table-column prop="buyer_name" label="购买方名称" min-width="180px"></el-table-column>
        <el-table-column prop="payment_month" label="结算月份" width="120px"></el-table-column>
        <el-table-column prop="total_amount_formatted" label="开票金额(元)" width="140px">
          <template slot-scope="scope">
            <span style="font-weight: bold; color: #67C23A;">¥ {{ scope.row.total_amount_formatted }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="count" label="发票数量" width="100px"></el-table-column>
      </el-table>
      <span slot="footer">
          <el-button @click="showStatistics = false">关闭</el-button>
        </span>
      </el-dialog>

      <el-dialog title="发票原始数据" :visible.sync="showRawDataDialog" width="600px">
        <el-form label-width="120px">
          <el-form-item label="发票号码">
            <span>{{ currentFapiao?.fapiao_no }}</span>
          </el-form-item>
          <el-form-item label="原始JSON数据">
            <el-input 
              type="textarea" 
              :value="rawDataText" 
              readonly 
              :rows="12"
              style="font-family: monospace; font-size: 12px;"
            ></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="showRawDataDialog = false">关闭</el-button>
        </span>
      </el-dialog>

      <el-dialog title="结算清单详情" :visible.sync="showReceiptsDialog" width="700px">
        <el-form label-width="120px">
          <el-form-item label="发票号码">
            <span>{{ currentFapiaoForReceipts?.fapiao_no }}</span>
          </el-form-item>
          <el-form-item label="开票日期">
            <span>{{ currentFapiaoForReceipts?.fapiao_time }}</span>
          </el-form-item>
          <el-form-item label="结算清单编号">
            <span>{{ currentFapiaoForReceipts?.payment_receipts }}</span>
          </el-form-item>
          <el-form-item label="结算月份">
            <div style="display: flex; gap: 10px; align-items: center;">
              <el-input 
                v-model="editingPaymentMonth" 
                placeholder="YYYY-MM" 
                style="width: 120px;"
                @change="checkPaymentMonthChange"
              ></el-input>
              <el-button 
                type="primary" 
                size="small" 
                :disabled="!paymentMonthChanged"
                @click="savePaymentMonth"
              >保存</el-button>
            </div>
          </el-form-item>
        </el-form>
        <el-table :data="receiptsData" border v-loading="receiptsLoading">
          <el-table-column prop="id" label="ID" width="80px"></el-table-column>
          <el-table-column prop="date" label="日期" width="120px"></el-table-column>
          <el-table-column prop="company_name" label="公司名称" min-width="150px"></el-table-column>
          <el-table-column prop="amount" label="金额(元)" width="140px">
            <template slot-scope="scope">
              <span style="font-weight: bold;">¥ {{ formatAmount(scope.row.amount) }}</span>
            </template>
          </el-table-column>
        </el-table>
        <div style="padding: 15px; border-top: 1px solid #EBEEF5; margin-top: 10px;">
          <div style="display: flex; gap: 80px; align-items: center; margin-bottom: 15px;">
            <div style="text-align: center; flex: 1;">
              <div style="font-size: 14px; color: #606266; margin-bottom: 5px;">发票金额</div>
              <div style="font-size: 20px; font-weight: bold; color: #E6A23C;">
                ¥ {{ formatAmount(currentFapiaoForReceipts?.total_amount / 100) }}
              </div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="font-size: 14px; color: #606266; margin-bottom: 5px;">结算清单汇总</div>
              <div :style="{ fontSize: '20px', fontWeight: 'bold', color: isAmountMatch ? '#67C23A' : '#F56C6C' }">
                ¥ {{ formatAmount(receiptsTotalAmount) }}
              </div>
            </div>
          </div>
          <div style="text-align: center; font-size: 14px;" :style="{ color: isAmountMatch ? '#67C23A' : '#F56C6C' }">
            {{ isAmountMatch ? '✓ 金额一致' : '✗ 金额不匹配' }}
          </div>
        </div>
        <span slot="footer">
          <el-button @click="closeReceiptsDialog">关闭</el-button>
        </span>
      </el-dialog>
    </div>
  </template>

<style scoped>
.hf-toolbar {
  margin-bottom: 10px;
}
</style>

<script setup>
import { ref, onMounted, getCurrentInstance, computed } from 'vue'

const $http = getCurrentInstance().proxy.$http
const $message = getCurrentInstance().proxy.$message

const loading = ref(false)
const rows = ref([])
const total = ref(0)
const pageSize = ref(10)
const page = ref(1)
const searchKeyword = ref('')
const paymentMonthRange = ref([])

const importDialogVisible = ref(false)
const importDialogTitle = ref('导入发票')
const uploadFileList = ref([])
const importLoading = ref(false)

const showStatistics = ref(false)
const statisticsData = ref([])
const statisticsLoading = ref(false)

const showRawDataDialog = ref(false)

const showReceiptsDialog = ref(false)
const currentFapiaoForReceipts = ref(null)
const receiptsData = ref([])
const receiptsLoading = ref(false)
const currentFapiao = ref(null)
const editingPaymentMonth = ref('')
const originalPaymentMonth = ref('')
const paymentMonthChanged = ref(false)

function formatAmount(amount) {
  if (!amount || amount === 0) {
    return '0.00'
  }
  return Number(amount).toFixed(2)
}

const urls = {
  getRows: '/api/fapiao/getFapiaos',
  import: '/api/fapiao/import',
  updatePaymentMonth: '/api/fapiao/updatePaymentMonth',
  delete: '/api/fapiao/delete',
  statistics: '/api/fapiao/statistics',
  getReceipts: '/api/fapiao/getReceipts',
}

function getRows() {
  loading.value = true
  const [startMonth, endMonth] = paymentMonthRange.value
  $http.get(urls.getRows, {
    params: {
      sort: 'fapiao_time',
      order: 'desc',
      offset: pageSize.value * (page.value - 1),
      limit: pageSize.value,
      search: searchKeyword.value,
      paymentMonthStart: startMonth,
      paymentMonthEnd: endMonth,
    }
  }).then(response => {
    rows.value = response.data.rows || []
    total.value = response.data.total || 0
  }).finally(() => {
    loading.value = false
  })
}

function handleSearch() {
  page.value = 1
  getRows()
}

function handleSizeChange(val) {
  pageSize.value = val
  page.value = 1
  getRows()
}

function handlePageChange(val) {
  page.value = val
  getRows()
}

function openImportDialog() {
  uploadFileList.value = []
  importDialogVisible.value = true
}

function handleFileChange(file, fileList) {
  uploadFileList.value = [file]
}

function handleImport() {
  if (uploadFileList.value.length === 0) {
    $message.warning('请选择要导入的文件')
    return
  }

  importLoading.value = true
  const file = uploadFileList.value[0].raw
  const formData = new FormData()
  formData.append('file', file)

  $http.post(urls.import, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(response => {
    if (response.data.error === 0) {
      const data = response.data.data
      $message.success(`导入完成！新增: ${data.imported}条，更新: ${data.updated}条，跳过: ${data.skipped}条`)
      importDialogVisible.value = false
      getRows()
    } else {
      $message.error(response.data.msg || '导入失败')
    }
  }).catch(error => {
    $message.error('导入失败: ' + (error.response?.data?.msg || error.message))
  }).finally(() => {
    importLoading.value = false
  })
}

function showRawData(row) {
  currentFapiao.value = row
  showRawDataDialog.value = true
}

const rawDataText = computed(() => {
  if (!currentFapiao.value?.raw_value) {
    return ''
  }
  try {
    const rawData = typeof currentFapiao.value.raw_value === 'string' 
      ? JSON.parse(currentFapiao.value.raw_value) 
      : currentFapiao.value.raw_value
    return JSON.stringify(rawData, null, 2)
  } catch (e) {
    return currentFapiao.value.raw_value
  }
})

function openReceiptsDialog(row) {
  currentFapiaoForReceipts.value = row
  editingPaymentMonth.value = row.payment_month || ''
  originalPaymentMonth.value = row.payment_month || ''
  paymentMonthChanged.value = false
  receiptsLoading.value = true
  
  $http.get(urls.getReceipts, {
    params: {
      id: row.id
    }
  }).then(response => {
    receiptsData.value = response.data.rows || []
  }).catch(error => {
    $message.error('获取结算清单失败: ' + (error.response?.data?.msg || error.message))
  }).finally(() => {
    receiptsLoading.value = false
  })
  
  showReceiptsDialog.value = true
}

function closeReceiptsDialog() {
  showReceiptsDialog.value = false
  currentFapiaoForReceipts.value = null
  receiptsData.value = []
}

function checkPaymentMonthChange() {
  paymentMonthChanged.value = editingPaymentMonth.value !== originalPaymentMonth.value
}

function savePaymentMonth() {
  if (!paymentMonthChanged.value) return
  
  $http.post(urls.updatePaymentMonth, {
    id: currentFapiaoForReceipts.value.id,
    payment_month: editingPaymentMonth.value
  }).then(response => {
    if (response.data.error === 0) {
      $message.success('修改成功')
      currentFapiaoForReceipts.value.payment_month = editingPaymentMonth.value
      originalPaymentMonth.value = editingPaymentMonth.value
      paymentMonthChanged.value = false
    } else {
      $message.error(response.data.msg)
    }
  }).catch(error => {
    $message.error('修改失败: ' + (error.response?.data?.msg || error.message))
  })
}

const receiptsTotalAmount = computed(() => {
  let total = 0
  receiptsData.value.forEach(item => {
    total += item.amount ? item.amount: 0
  })
  return total
})

const isAmountMatch = computed(() => {
  const invoiceAmount = currentFapiaoForReceipts.value?.total_amount ? currentFapiaoForReceipts.value.total_amount / 100 : 0
  return Math.abs(invoiceAmount - receiptsTotalAmount.value) < 0.01
})

function deleteFapiao(id) {
  $http.post(urls.delete, { id }).then(response => {
    if (response.data.error === 0) {
      $message.success('删除成功')
      getRows()
    } else {
      $message.error(response.data.msg || '删除失败')
    }
  }).catch(() => {
    $message.error('删除失败')
  })
}

function openStatistics() {
  showStatistics.value = true
}

const monthRangePickerOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const shortcuts = []
  
  for (let i = 0; i < 3; i++) {
    const year = currentYear - i
    shortcuts.push({
      text: `${year}年`,
      onClick: (picker) => {
        picker.$emit('pick', [`${year}-01`, `${year}-12`])
      }
    })
  }
  
  return { shortcuts }
})

function getStatisticsData() {
  statisticsLoading.value = true
  const [startMonth, endMonth] = paymentMonthRange.value
  $http.get(urls.statistics, {
    params: {
      search: searchKeyword.value,
      paymentMonthStart: startMonth,
      paymentMonthEnd: endMonth,
    }
  }).then(response => {
    if (response.data.error === 0) {
      statisticsData.value = response.data.data || []
    }
  }).finally(() => {
    statisticsLoading.value = false
  })
}

onMounted(() => {
  getRows()
})
</script>