<template>
  <div id='tjs'>
    <div id='div3d'></div>
  </div>
</template>

<script setup>
<%_ if(useEarth){_%>
// 地球
import {initMap} from '@/scripts/init';
import {onMounted} from "vue";
  onMounted(() => {
    initMap().then(() => {
    })
  })
<%_} _%>

</script>
