<template>
  <Suspense>
    <transition name="fade" mode="out-in">
      <component :is="layoutComp[layout]"> </component>
    </transition>

    <template #fallback>
      <v-progress-linear indeterminate color="primary"></v-progress-linear>
    </template>
  </Suspense>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import "vue3-toastify/dist/index.css";
import "@mdi/font/css/materialdesignicons.css";

import "vuetify/styles";

//**Layouts */
import DefaultLayout from "./layouts/default.vue";
import AuthLayout from "./layouts/auth.vue";

const router = useRouter();
const layout: any = ref("default");
const layoutComp: any = {
  default: DefaultLayout,
  auth: AuthLayout,
} as any;

watch(
  () => router.currentRoute.value,
  (to: any, from: any) => {
    if (to?.meta?.layout && to.meta.layout !== layout.value) {
      layout.value = to.meta.layout;
    } else {
      layout.value = "default";
    }
  }
);
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100dvh;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
