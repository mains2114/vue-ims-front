<template>
  <el-select v-model="companyId" @change="handleSelectChange" filterable clearable placeholder="请选择交易公司">
    <el-option v-for="item in companies" :key="item.id" :value="item.id"
      :label="item.id + '. ' + item.name"></el-option>
  </el-select>
</template>
<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useCacheStore } from '../stores/cache.js'

const $http = getCurrentInstance().proxy.$http;
const store = useCacheStore();

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
const companyId = ref(props.modelValue)
const companies = ref([])

function handleSelectChange(val) {
  emit('update:modelValue', val)
}
function getAllCompanies() {
  if (store.companies.length > 0) {
    companies.value.splice(0, companies.value.length, ...store.companies);
    return;
  }
  if (store.companiesLock) {
    setTimeout(() => {
      getAllCompanies();
    }, 3000);
    return;
  }
  store.lockCompanies(true);
  $http.get('/api/getAllCompanies').then(response => {
    companies.value.splice(0, companies.value.length, ...response.data.rows);
    store.updateCompanies(companies.value);
  }).finally(() => {
    store.lockCompanies(false);
  });
}
onMounted(() => {
  getAllCompanies()
})
</script>
