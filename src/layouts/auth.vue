<template>
  <v-layout class="rounded rounded-md">
    <v-main class="d-flex flex-column align-center justify-center" style="min-height: 300px; height: 100dvh">
      <router-view v-slot="{ Component }">
        <transition name="fade"mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-main>
  </v-layout>
</template>

<script lang="ts" setup>
  import { onMounted } from "vue";
import { RouterView, useRouter } from "vue-router"
  import { useCookies } from "vue3-cookies"

  const { cookies } = useCookies()
  const router = useRouter()

  const user = cookies.get("user")

  if (user) {
    router.push("/dashboard")
  }

  onMounted(() => {
    
  postMessage({ payload: "removeLoading" }, "*");
  })
</script>
