<template>
  <v-layout class="rounded rounded-md">
    <v-navigation-drawer
      permanent
      style="background-color: var(--bt-theme-sidebar-bg) !important"
      class="pa-0"
    >
      <div style="object-fit: contain" class="py-1">
        <img
          src="/logo.png"
          alt="logo"
          class="mx-auto my-0 w-100"
          style="height: 48px; object-fit: contain"
        />
      </div>
      <!-- <v-divider  class="mx-5 my-2"/> -->
      <v-list
        v-model="router.currentRoute.value.path"
        class="text-left"
        density="compact"
        nav
      >
        <v-list-item
          v-for="item in menuList"
          :key="item.path"
          @click="handleNavigationParent(item)"
          class="cursor-pointer"
          :value="item.path"
          :prepend-icon="item.meta.icon"
          :title="item.meta.title"
          :active="
            router.currentRoute.value.path === item.path ||
            item.children.some((x:any) => x.path === router.currentRoute.value.path)
          "
        >
          <!-- if children -->
          <template v-slot:append>
            <v-icon
              v-if="item.children.length > 0"
              icon="mdi-menu-right"
              size="x-small"
            ></v-icon>
          </template>

          <v-menu
            v-if="item.children.length > 0"
            activator="parent"
            open-on-hover
            submenu
            style=""
          >
            <v-list density="compact" nav>
              <v-list-item
                v-for="childItem in item.children"
                :key="'child' + childItem.path"
                link
                :active="router.currentRoute.value.path === childItem.path"
                :value="childItem.path"
                @click="handleChildItem(childItem)"
              >
                <template v-slot:prepend>
                  <v-icon size="x-small">{{ childItem.meta?.icon }}</v-icon>
                </template>

                <v-list-item-title style="font-size: 14px;" class="mr-5 child-title">{{
                  childItem.meta?.title
                }}</v-list-item-title>

                <!-- <v-menu
                  :open-on-focus="false"
                  activator="parent"
                  open-on-hover
                  submenu
                >
                  <v-list>
                    <v-list-item v-for="k in 5" :key="k" link>
                      <v-list-item-title
                        >Item {{ i }} - {{ j }} - {{ k }}</v-list-item-title
                      >
                    </v-list-item>
                  </v-list>
                </v-menu> -->
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      style="
        background-color: var(--bt-theme-appbar-bg);
        border-bottom: 1px solid var(--bt-theme-border-color);
      "
      elevation="0"
    >
      <v-toolbar-title class="text-left text-h6">{{
        router.currentRoute.value.meta.title
      }}</v-toolbar-title>
      <v-spacer />
      <div class="cursor-pointer d-flex align-center">
        <span class="text-subtitle-2 text-capitalize">Merhaba, {{ user.userName }}</span>

        <v-avatar class="">
          <v-icon icon="mdi-account-circle" />
        </v-avatar>

        <v-menu activator="parent">
          <v-list class="pa-0">
            <v-list-item
              class="cursor-pointer"
              @click="handleLogout"
              style="font-size: 14px"
            >
              <v-icon size="20" class="mr-2">mdi-logout</v-icon>
              Çıkış yap
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <v-main
      class="d-flex align-center justify-center"
      style="
        min-height: 300px;
        background: var(--bt-theme-content-bg) !important;
      "
    >
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" class="w-100 pa-3" />
        </transition>
      </router-view>
    </v-main>
  </v-layout>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { RouterView } from "vue-router";
import { useCookies } from "vue3-cookies";
import { useRouter } from "vue-router";

const cookies = useCookies();
const router = useRouter();
const menuList: any = ref(
  router
    .getRoutes()
    .filter((x: any) => x.meta.menu && x.meta.level === 0)
    .sort((a: any, b: any) => a.meta.order - b.meta.order)
);

function handleLogout() {
  localStorage.removeItem("user");
  router.push("/auth/login");
}

function handleNavigationParent(routerItem: any) {
  if (routerItem.children.length > 0) {
    // router.push({ path: routerItem.children[0].path });
  } else {
    router.push({ path: routerItem.path });
  }
}

function handleChildItem(childItem: any) {
  router.push({ path: childItem.path });
}

const user = computed(() => {
  return JSON.parse(localStorage.getItem("user") || "{}");
})

onMounted(() => {
  postMessage({ payload: "removeLoading" }, "*");
})
</script>
