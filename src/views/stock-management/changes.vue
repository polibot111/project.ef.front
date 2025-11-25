<template>
  <div class="page-stock_management-changes h-100">
    <div>
      <div
        class="position-relative d-flex align-center pa-2 rounded border-primary"
        :class="[{ 'bg-primary-opacity-1 border-1': search.filtered }]"
      >
        <BtDatePicker
          key="startDate"
          id="startDate"
          v-model:model-value="search.startDate"
          label="Başlangıç Tarihi"
          placeholder="Başlangıç Tarihi"
          class="txt-search mr-2"
          style="width: 200px"
          :disabled="search.loading.filter"
        ></BtDatePicker>
        <BtDatePicker
          key="endDate"
          id="endDate"
          v-model:model-value="search.endDate"
          label="Bitiş Tarihi"
          placeholder="Bitiş Tarihi"
          class="txt-search mr-2"
          style="width: 200px"
          :disabled="search.loading.filter"
        ></BtDatePicker>
        <v-tooltip
          v-if="search.filtered"
          text="Filtreyi Temizle"
          location="top"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              color="gray"
              variant="tonal"
              class="px-1 btn-clear-filter"
              @click="handleResetFilter"
              style="min-width: 30px"
              :disabled="search.loading.filter"
            >
              <v-icon size="14px"> mdi-filter-remove-outline </v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Filtrele" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              color="primary"
              variant="outlined"
              @click="handleFilter"
              :disabled="search.loading.filter"
              :loading="search.loading.filter"
              :class="[{ 'ml-2': search.filtered }]"
              style="min-width: 30px !important"
            >
              <v-icon>mdi-filter-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </div>
    </div>
    <v-infinite-scroll
      :items="items"
      :onLoad="load"
      emptyText="Bütün hareketler yüklendi!"
    >
      <template v-for="(item, index) in items" :key="item">
        <div
          class="text-left pl-5 py-5 border-1"
          style=""
          :class="['pa-2', index % 2 === 0 ? 'bg-grey-lighten-3' : '']"
          v-html="item.fabricStockReport"
        ></div>
      </template>
    </v-infinite-scroll>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { cloneDeep } from "lodash";
import { $axios } from "../../composables/axios";
import { toast } from "vue3-toastify";
import BtCapitoneItem from "../../components/capitone/BtCapitoneItem.vue";
import { rules } from "../../../config/rules";
import { useDisplay } from "vuetify";
import dayjs from "dayjs";
import BtDatePicker from "../../components/BtDatePicker.vue";

const pageOptions = ref({
  page: 0,
  size: 30,
  itemsPerPage: 30,
  totalCount: 0,
});
const loading = ref(false);

const items: any = ref([]);

const search: any = reactive({
  startDate: null,
  endDate: null,
  filtered: false,
  loading: {
    filter: false,
  },
});

const handleFilter = async () => {
  search.loading.filter = true;
  pageOptions.value.page = 0;
  items.value = [];
  search.filtered = true;
  // await fetchStockLogs();
  search.loading.filter = false;
};

const handleResetFilter = async () => {
  search.loading.filter = true;
  search.startDate = null;
  search.endDate = null;
  search.filtered = false;
  pageOptions.value.page = 1;

  const { data, error }: any = await $axios("/FabricStock/GetFabricStockLog", {
    method: "GET",
    params: {
      page: 1,
      size: pageOptions.value.itemsPerPage,
    },
  });
  if (error.value) {
    toast.error(error.message || "Kumaş tipleri getirilirken hata oluştu");
    return [];
  } else {
    pageOptions.value.totalCount = data.value.totalCount;
    search.loading.filter = false;

    items.value = data.value.data;
    refDone.value("ok");
  }

  // items.value = await fetchStockLogs();
};

const fetchStockLogs = async () => {
  const paramsModel: any = {
    page: pageOptions.value.page,
    size: pageOptions.value.itemsPerPage,
  };
  if (search.startDate) {
    paramsModel["startDate"] = dayjs(search.startDate).add(1, "day");
  }
  if (search.endDate) {
    paramsModel["endDate"] = dayjs(search.endDate).add(1, "day");
  }
  const { data, error }: any = await $axios("/FabricStock/GetFabricStockLog", {
    method: "GET",
    params: paramsModel,
  });
  if (error.value) {
    toast.error(error.message || "Kumaş tipleri getirilirken hata oluştu");
    return [];
  } else {
    pageOptions.value.totalCount = data.value.totalCount;
    return data.value.data;
  }
};

const refDone: any = ref(null);

async function api() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(fetchStockLogs());
    }, 1000);
  });
}
async function load({ done }: any) {
  refDone.value = done;
  if (
    pageOptions.value.totalCount > 0 &&
    items.value.length >= pageOptions.value.totalCount
  ) {
    done("empty");
    return;
  }
  loading.value = true;
  pageOptions.value.page++;

  // Perform API call
  const res: any = await api();
  items.value.push(...res);

  done("ok");
  loading.value = false;
}
</script>
