<template>
	<div class="page-fabric_order">
		<v-progress-linear v-if="loading.page" indeterminate color="primary" />

		<v-data-table
			style="height: calc(100dvh - 90px); max-width: 100"
			align="start"
			v-model:items-per-page="tableOptions.itemsPerPage"
			v-model:page="tableOptions.page"
			:items-per-page-options="tableOptions.itemsPerPageOptions"
			:items-per-page-text="tableOptions.itemsPerPageText"
			:items-per-page-all="tableOptions.itemsPerPageAll"
			:page-text="tableOptions.pageText"
			:headers="headers"
			:items="search.list"
			show-current-page
			@update:page="handlePageUpdate"
			@update:items-per-page="handlePageUpdate"
			fixed-header>
			<template v-slot:top>
				<v-toolbar flat color="white">
					<v-text-field
						v-model="search.value"
						label="Ara"
						placeholder="İsim ara..."
						compact
						dense
						size="small"
						hide-details
						prepend-inner-icon="mdi-magnify"
						class="txt-search dense bg-white"
						style="max-width: 230px"
						variant="outlined"
						clearable></v-text-field>
					<v-divider vertical class="mx-3 my-5"></v-divider>

					<div
						class="position-relative d-flex align-center pa-2 rounded border-primary"
						:class="[{ 'bg-primary-opacity-1 border-1': search.filtered }]">
						<BtDatePicker
							key="startDate"
							id="startDate"
							v-model:model-value="search.startDate"
							label="Başlangıç Tarihi"
							placeholder="Başlangıç Tarihi"
							class="txt-search mr-2"
							style="width: 200px"
							:disabled="search.loading.filter"></BtDatePicker>
						<BtDatePicker
							key="endDate"
							id="endDate"
							v-model:model-value="search.endDate"
							label="Bitiş Tarihi"
							placeholder="Bitiş Tarihi"
							class="txt-search mr-2"
							style="width: 200px"
							:disabled="search.loading.filter"></BtDatePicker>
						<v-tooltip v-if="search.filtered" text="Filtreyi Temizle" location="top">
							<template v-slot:activator="{ props }">
								<v-btn
									v-bind="props"
									color="gray"
									variant="tonal"
									class="px-1 btn-clear-filter"
									@click="handleResetFilter"
									style="min-width: 30px"
									:disabled="search.loading.filter">
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
									style="min-width: 30px !important">
									<v-icon>mdi-filter-outline</v-icon>
								</v-btn>
							</template>
						</v-tooltip>
					</div>
				</v-toolbar>
			</template>

			<template v-slot:item.fabricColorRGBCode="{ item }: any">
				<!-- <div style="white-space: no-wrap;" class="d-flex align-end">
					<div v-if="item.fabricColorRGBCode" class="color-square" :style="{ backgroundColor: item.fabricColorRGBCode }"></div>
					<v-img v-else-if="item.fabricColorImage" :src="item.fabricColorImage" width="22px" class="rounded" />
					<span class="ms-2">{{ item.fabricColorName }}</span>
				</div> -->
				<div class="d-flex align-center">
					<v-chip v-if="item.fabricColorRGBCode" size="x-small" :color="item.fabricColorRGBCode" variant="flat" class="ma-1">
						{{ item.fabricColorName }}
					</v-chip>
					<v-tooltip v-else-if="item.fabricColorImage" :width="128" :height="128" location="top" content-class="pa-0">
						<template v-slot:activator="{ props }">
							<v-chip v-bind="props" class="d-flex align-center" size="x-small" variant="outlined" color="primary py-2">
								<v-img
									:src="item.fabricColorImage"
									width="16"
									height="16"
									class="rounded mr-1"
									cover />
								{{ item.fabricColorName }}
							</v-chip>
						</template>
						<v-img :src="item.fabricColorImage" width="128" height="128" cover class="rounded border shadow-sm border-gray" />
					</v-tooltip>
				</div>
			</template>
			<template v-slot:no-data>
				<p class="text-subtitle-1 mt-10 mb-3">Kayıt bulunamadı</p>
				<!-- <v-btn color="primary" @click="fetchStockStatusList" flat>
          Yenile
        </v-btn> -->
			</template>
		</v-data-table>
		<BtModal
			v-model:show="dialogDetail.show"
			v-model:loading="dialogDetail.loading"
			:title="dialogDetail.title"
			width="50vw"
			@save="dialogDetail.submit">
			<template #content>
				<v-card-text>
					<v-form ref="fabricOrderDetailForm2" @submit.prevent>
						<v-row>
							<v-col cols="12" sm="6">
								<v-text-field v-model="dialogDetail.model.meterCount" label="Metre" :rules="[rules.required]" dense variant="outlined"></v-text-field>
							</v-col>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="dialogDetail.model.ballCount"
									label="Top Sayısı"
									:rules="[rules.required]"
									dense
									variant="outlined"></v-text-field>
							</v-col>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="dialogDetail.model.price"
									label="Fiyat"
									:rules="[rules.required]"
									dense
									:suffix="currentCurrency.symbol"
									variant="outlined"></v-text-field>
							</v-col>
						</v-row>
					</v-form>
				</v-card-text>
			</template>
		</BtModal>
	</div>
</template>

<script lang="ts" setup>
import { ref, watchEffect, onMounted, watch, reactive } from "vue";
import { toast } from "vue3-toastify";
import { rules } from "../../../config/rules";
import dayjs from "dayjs";

import ConfirmBox from "../../components/ConfirmBox.vue";
import BtModal from "../../components/BtModal.vue";
// import { useFetch } from "../../composables/useFetch";
import $axios from "../../composables/axios";
import BtDatePicker from "../../components/BtDatePicker.vue";
import { cloneDeep } from "lodash";
import {currentCurrency} from "../../composables/useCurrentCurrency";

const headers: any = ref([
  { title: "Kumaş Kodu", value: "fabricCode", align: "start" },
  { title: "Kumaş Adı", value: "fabricName", align: "start" },
  { title: "Kumaş Rengi", value: "fabricColorRGBCode", align: "start" },
  { title: "Toplam Top Sayısı", value: "totalBallCount", align: "start" },
  { title: "Toplam Metre", value: "totalMeterCount", align: "start" },
]);
const list = ref([]);
const fabricOrderForm = ref();
const fabricOrderDetailForm2 = ref();
const loading = ref({
  table: true,
  page: true,
});

const fabricDeliverForm = ref();

const model: any = ref({
  meter: "",
  ballCount: "",
  price: "",
  fabricTypeId: null,
  fabricManufacturerId: null,
});
const dialogDetail: any = ref({
  show: false,
  loading: false,
  title: "Kumaş Siparişi Detaylarını Düzenle",
  type: "new",
  model: {
    meterCount: "",
    ballCount: "",
    price: "",
  },
  submit: async () => {
    fabricOrderDetailForm2.value?.validate();
    if (fabricOrderDetailForm2.value?.isValid) {
      dialogDetail.value.loading = true;
      const url = "/FabricOrderDelivered/UpdateFabricOrderDelireved";
      const response: any = await $axios(url, {
        method: dialogDetail.value.type === "new" ? "POST" : "PUT",
        data: dialogDetail.value.model,
      }).catch((err: any) => {
        dialogDetail.value.loading = false;
        toast.error("Kumaş siparişi detayı güncellenirken hata oluştu");
      });

      if (!response) return false;

      const { data, isFinished, error }: any = response;

      dialogDetail.value.loading = false;
      if (!data.value.succeeded) {
        toast.error(
          data.value.message ||
            "Kumaş siparişi detayı güncellenirken hata oluştu"
        );
      } else {
        toast.success("Kumaş siparişi detayı başarıyla güncellendi");
        fetchStockStatusList();
        dialogDetail.value.show = false;
      }
    }
  },
});


const tableOptions = ref({
  itemsPerPageText: "Sayfa başına satır:",
  itemsPerPageAll: "Hepsi",
  pageText: "Toplam Kayıt: {2}",
  noDataText: "Kayıt bulunamadı",
  itemsPerPageOptions: [10, 15, 20, 25, 30],
  itemsPerPage: 10,
  page: 1,
});

const search: any = ref({
  value: "",
  filtered: false,
  startDate: "",
  endDate: "",
  loading: {
    filter: false,
    search: false,
  },
  list: [],
  handler: () => {
    if (search.value.value.length > 2) {
      search.value.list = list.value.filter((item: any) =>
        item.name.toLowerCase().includes(search.value.value.toLowerCase())
      );
    } else {
      search.value.list = list.value;
    }
  },
});

const handleFilter = async () => {
  search.value.filtered = true;
  search.value.loading.filter = true;

  const modelpool: any = {}
  if (search.value.startDate) modelpool.startDate = dayjs(search.value.startDate).add(1, "day")
  if (search.value.endDate) modelpool.endDate = dayjs(search.value.endDate).add(1, "day")

  await fetchStockStatusList(modelpool)
  search.value.loading.filter = false;
};
const handleResetFilter = async () => {
  search.value.filtered = false
  search.value.startDate = null
  search.value.endDate = null
  await fetchStockStatusList();
};

const handlePageUpdate = (page: number) => {
  tableOptions.value.page = page;
  fetchStockStatusList();
};

const fetchStockStatusList = async (
  queryParams: object | undefined = {}
): Promise<void> => {
  const { data, error }: any = (await $axios("/FabricStock/GetFabricStock", {
    method: "GET",
    params: {
      page: tableOptions.value.page,
      size: tableOptions.value.itemsPerPage,
      ...queryParams,
    },
  })) as any;
  if (error.value) {
    toast.error(error.message || "Kumaş tipleri getirilirken hata oluştu");
  } else {
    list.value = data.value?.data;
    search.value.list = list.value;
    search.value.value = "";
  }
};

onMounted(async () => {
  loading.value.page = true;

  await fetchStockStatusList();

  loading.value.page = false;
  loading.value.table = false;
});
</script>

<style scoped>
.color-square {
  display: inline-block;
  height: 22px;
  width: 22px;
  content: "";
  border-radius: 4px;
  border: 1px solid #ccc;
}

.btn-clear-filter {
}
</style>
