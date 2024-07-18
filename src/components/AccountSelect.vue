<template>
  <el-select v-model="accountId" @change="handleSelectChange" clearable placeholder="请选择账户">
    <el-option v-for="item in accounts" :key="item.id" :value="item.id" :label="item.id + '. ' + item.name"></el-option>
  </el-select>
</template>
<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useCacheStore } from '../stores/cache.js'

const $http = getCurrentInstance().proxy.$http;
const store = useCacheStore();
const getAccountId = getCurrentInstance().proxy.getAccountId;

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
const accountId = ref(props.modelValue)
const accounts = ref([])

function handleSelectChange(val) {
  emit('update:modelValue', val)
}
function getAccounts() {
  if (store.accounts.length > 0) {
    accounts.value.splice(0, accounts.value.length, ...store.accounts)
    return;
  }
  $http.get('/api/account/getAccounts', {
    params: {
      offset: 0,
      limit: 10,
      sort: 'id',
      order: 'asc',
    }
  }).then((response) => {
    accounts.value.splice(0, accounts.value.length, ...response.data.rows)
    store.updateAccounts(accounts.value)
    // accountId.value = getAccountId()
  })
}
onMounted(() => {
  getAccounts()
})
</script>
