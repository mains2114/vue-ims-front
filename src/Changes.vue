<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useCacheStore } from './stores/cache.js';
import md from './ChangeLog.md?raw';

const cache = useCacheStore()

const activity = ref([]);
var list = md.split(/##/);
list.forEach(element => {
  var parts = element.split(/\n/);
  if (parts.length >= 2) {
    var item = {
      date: parts[0],
      lines: [],
    };
    for (var i = 1; i < parts.length; i++) {
      if (parts[i].trim()) {
        item.lines.push(parts[i].trim());
      }
    }
    activity.value.push(item)
  }
});

onMounted(() => {
  cache.updateCheckedVer()
})
</script>
<template>
  <el-form>
    <el-timeline>
      <el-timeline-item placement="top"
        v-for="value, idx in activity"
        :key="idx"
        :timestamp="value.date"
      >
        <p v-for="item in value.lines">{{ item }}</p>
      </el-timeline-item>
    </el-timeline>
  </el-form>
</template>


<style scoped>

</style>
