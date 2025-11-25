<template>
	<div class="page-payment_management">
		<v-data-table-server
			style="height: calc(100dvh - 90px)"
			align="start"
			v-model:items-per-page="tableOptions.itemsPerPage"
			v-model:page="tableOptions.page"
			:items-per-page-options="tableOptions.itemsPerPageOptions"
			:items-per-page-text="tableOptions.itemsPerPageText"
			:items-per-page-all="tableOptions.itemsPerPageAll"
			:page-text="tableOptions.pageText"
			:headers="headers"
			:items="list"
			:items-length="tableOptions.totalCount"
			:loading="loading.table"
			show-current-page
			@update:page="handlePageUpdate"
			@update:items-per-page="handlePerPageUpdate"
			:header-props="{ class: 'bg-primary' }"
			density="comfortable"
			:show-lines="true"
			class="rounded">
			<template v-slot:item.price="{ item }: any"> {{ item.price }} {{ currentCurrency.name }} </template>
			<template v-slot:top>
				<div class="d-flex justify-end pa-2 gap-2">
					<div class="d-flex gap-2 align-center w-100 overflow-x-auto py-0">
						<div class="d-flex gap-2 align-center overflow-x-auto w-100 py-2">
							<div
								class="position-relative d-flex align-center rounded border-primary"
								:class="[{ 'bg-primary-opacity-1 border-1': search.filtered }]">
								<div class="d-flex gap-2 align-center w-100">
									<v-radio-group v-model="filter.workshopType" hide-details density="compact" class="d-flex">
										<div class="d-flex gap-2 align-center w-100">
											<v-radio
												label="Kapitone Atölye"
												value="withCapitoneWorkshop"
												class="mr-2 w-100"
												style="white-space: nowrap; min-width: 150px;"></v-radio>
											<v-radio label="Atölye" value="withWorkshop" class="mr-2 w-100" style="white-space: nowrap; min-width: 100px;"></v-radio>
											<v-radio label="Üretici" value="withManufacturer" class="w-100" style="white-space: nowrap; min-width: 100px;"></v-radio>
										</div>
									</v-radio-group>
								</div>
								<BtDatePicker
									key="startDate"
									id="startDate"
									v-model="filter.startDate"
									label="Başlangıç Tarihi"
									placeholder="Başlangıç Tarihi"
									class="txt-search mr-2"
									style="min-width: 200px"
									:disabled="filter.loading"></BtDatePicker>
								<BtDatePicker
									key="endDate"
									id="endDate"
									v-model="filter.endDate"
									label="Bitiş Tarihi"
									placeholder="Bitiş Tarihi"
									class="txt-search mr-2"
									style="min-width: 200px"
									:disabled="filter.loading"></BtDatePicker>
							</div>
						</div>
						<v-btn color="primary" variant="flat" class="" @click="handleFilter">
							<v-icon class="mr-1">mdi-filter-outline</v-icon> Filtreyi Uygula
						</v-btn>
						<v-tooltip v-if="filter.startDate || filter.endDate || filter.workshopType" text="Filtreyi Temizle" location="top">
							<template v-slot:activator="{ props }">
								<v-btn v-bind="props" color="error" variant="flat" class="" @click="handleResetFilter">
									<v-icon class="">mdi-filter-remove-outline</v-icon>
								</v-btn>
							</template>
						</v-tooltip>
					</div>
					<v-btn color="orange" variant="tonal" @click="handleExportPDF()" class="mr-2 mt-2">
						<v-icon left>mdi-file-pdf-box</v-icon>
						PDF
					</v-btn>
					<v-btn color="green" variant="tonal" class="mr-2 mt-2" @click="handleExportExcel()">
						<v-icon left>mdi-file-excel</v-icon>
						Excel
					</v-btn>
				</div>
			</template>
			<template v-slot:bottom>
				<div class="d-flex flex-column flex-md-row align-center justify-space-between pa-2 gap-2">
					<div class="d-flex align-center gap-3">
						<div class="text-subtitle-2 text-center text-sm-start">
							<strong>Toplam Ödeme:</strong>
							<strong class="text-primary d-block"
								>{{ total.totalPayment.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
								{{ currentCurrency.name }}</strong
							>
						</div>
						<!-- <div class="text-subtitle-2 text-center text-sm-start">
							<strong>Toplam Kazanç:</strong>
							<strong class="text-primary d-block"
								>{{ total.totalEarned.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
								{{ currentCurrency.name }}</strong
							>
						</div>
						<div class="text-subtitle-2 text-center text-sm-start">
							<strong>Ödeme Sağlığı:</strong>
							<strong class="text-primary d-block"
								>%{{ total.paymentHealth.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong
							>
						</div> -->
					</div>
					<div class="d-flex align-center gap-3">
						<div class="d-flex align-center gap-2">
							<span style="font-weight: 400 !important; font-size: 14px;">Sayfa Başına Satır</span>
							<v-select
								v-model="tableOptions.itemsPerPage"
								:items="tableOptions.itemsPerPageOptions"
								@update:model-value="handlePerPageUpdate"
								variant="outlined"
								density="compact"
								hide-details
								class="d-inline-block"
								style="width: 100px;"></v-select>
						</div>
						<div class="text-subtitle-2 text-center text-sm-start">
							<span style="font-weight: 400 !important; font-size: 14px;">Toplam Kayıt: {{ tableOptions.totalCount }}</span>
						</div>
						<v-pagination
							v-model="tableOptions.page"
							:length="Math.ceil(tableOptions.totalCount / tableOptions.itemsPerPage)"
							density="comfortable"
							@input="handlePageUpdate"
							show-first-last-page
							:total-visible="$vuetify.display.smAndDown ? 1 : 3"></v-pagination>
					</div>
				</div>
			</template>
		</v-data-table-server>
	</div>
</template>

<script lang="ts" setup>
import { ref,  onMounted, reactive } from "vue"
import { toast } from "vue3-toastify"
import { currentCurrency } from "../../composables/useCurrentCurrency";
import { debounce } from "lodash"
import dayjs from "dayjs"
import BtDatePicker from "../../components/BtDatePicker.vue";


import $axios from "../../composables/axios"
import {useExport} from "../../composables/useExport"
const { exportToExcel, exportToPDF } = useExport('Ödemeler')

const headers: any = ref([
  { title: "Kapitone Atölyesi Adı", value: "fabricCapitoneOrderDeliveredToWorkshopName", align: "start" },
  { title: "Atölye Adı", value: "toWorkshopOrderToWorkshopName", align: "start" },
  { title: "Üretici Adı", value: "manufacturerName", align: "start" },
  { title: "Ödeme Türü", value: "paymentCodeName", align: "start" },
  { title: "Tutar", value: "price", align: "start", sortable: true, },
])
const list = ref([])

const loading = ref({
  table: true,
})
const total = ref({
	totalPayment: 0,
	totalEarned: 0,
	paymentHealth: 0,
})
const model: any = ref({
  name: "",
  code: "",
  denierCount: "",
  grammage: "",
  width: "",
  colorId: null,
  isCapitone: false,
})


const tableOptions = ref({
  itemsPerPageText: "Sayfa başına satır:",
  itemsPerPageAll: "Hepsi",
  pageText: "Toplam Kayıt: {2}",
  noDataText: "Kayıt bulunamadı",
  itemsPerPageOptions: [10, 15, 20, 25, 30],
  itemsPerPage: 10,
  page: 1,
  totalCount: 0,
})

const colorList = ref([])
const colorHexList: any = ref({})
const { data, isFinished } = await $axios("/Color/GetColors")
const search = ref({
  startDate: null,
  endDate: null,
  filtered: false,

  query: null,
  items: [],
  loading: false,
  searchInput: null,
  handleSearch: debounce(async (value: string) => {
    console.log("search params is => ", value)
    if (!value) {
      search.value.items = []
      return
    }

    search.value.loading = true
    const { data, isFinished }: any = await $axios("/FabricTypes/GetFabricTypeByNameOrCode", {
      method: "GET",
      params: {
        fabricTypeByNameOrCode: value,
      },
    }).catch((err: any) => {
      search.value.loading = false
    })
    if (data?.value?.succeeded) {
      search.value.items = data?.value?.data || []
      console.log("search items is => ", data)
      console.log("search items length is => ", search.value.items.length)
    }
    search.value.loading = false
  }, 500),
  select: (id: any) => {
    const item:any = search.value.items.find((item: any) => item.id === id)
    console.log("selected value is => ", item)
    model.value = {
      name: item.name,
      code: item.code,
      denierCount: item.denierCount,
      grammage: item.grammage,
      width: item.width,
      colorId: item.colorId,
      isCapitone: item.isCapitone,
    }
    search.value.query = item.displayName
    search.value.items = []
    search.value.searchInput = null
  },
})

if (data.value.succeeded) {
  colorList.value = data.value.data

  colorHexList.value = data.value.data.reduce((acc: any, item: any) => {
    acc[item.id] = item
    return acc
  }, {})
}

const fetchPaymentList = async (queryParams: object | undefined = {}) => {
  loading.value.table = true
  let sendModel:any = {
    page: tableOptions.value.page,
    size: tableOptions.value.itemsPerPage,

    ...queryParams,
  }
  console.log("filter is => ", filter.value)
  if(filter.value.workshopType === "withCapitoneWorkshop") sendModel.withCapitoneWorkshop = true
  if(filter.value.workshopType === "withWorkshop") sendModel.withWorkshop = true
  if(filter.value.workshopType === "withManufacturer") sendModel.withManufacturer = true
  if(filter.value.startDate && dayjs(filter.value.startDate).isValid()) sendModel.startDate = filter.value.startDate
  if(filter.value.endDate && dayjs(filter.value.endDate).isValid()) sendModel.endDate = filter.value.endDate

  const { data, isFinished }: any = await $axios("/Payment/PaymentQuery", {
    method: "GET",
    params: sendModel,
  }).catch((err: any) => {
    loading.value.table = false
    toast.error("Kumaş tipleri getirilirken hata oluştu")
  })
  if (!data.value.succeeded) {
    toast.error(data.value.succeeded || "Kumaş tipleri getirilirken hata oluştu")
  } else {
    list.value = data.value?.data
    tableOptions.value.totalCount = data.value?.totalCount
  }

  loading.value.table = false
}
const fetchTotalPayment = async () => {
  const sendModel:any = {}
  if(filter.value.workshopType === "withCapitoneWorkshop") sendModel.withCapitoneWorkshop = true
  if(filter.value.workshopType === "withWorkshop") sendModel.withWorkshop = true
  if(filter.value.workshopType === "withManufacturer") sendModel.withManufacturer = true
  if(filter.value.startDate && dayjs(filter.value.startDate).isValid()) sendModel.startDate = filter.value.startDate
  if(filter.value.endDate && dayjs(filter.value.endDate).isValid()) sendModel.endDate = filter.value.endDate
  const { data, isFinished }: any = await $axios("/Payment/PaymentReportQuery", {
    method: "GET",
    params: sendModel,
  }).catch((err: any) => {
    toast.error(err?.response?.data?.message || err?.data?.message || "Ödeme raporu getirilirken hata oluştu")
  })
  if (data.value.succeeded) {
    console.log("data is => ", data.value.data)
    total.value = { ...data.value.data }
  }
}

const handlePageUpdate = async (page: number) => {
  tableOptions.value.page = page
  await fetchPaymentList()
}
const handlePerPageUpdate = async (itemsPerPage: number) => {
  tableOptions.value.itemsPerPage = itemsPerPage
  await fetchPaymentList()
}

const handleExportExcel = async () => {
  try {
    const columnMappings = headers.value.map((header: any) => ({ key: header.value, label: header.title }))
    await exportToExcel(list.value, undefined, 'all', columnMappings)
  } catch (error) {
    toast.error('Excel\'e aktarma sırasında bir hata oluştu')
  }
}

const handleExportPDF = async () => {
  try {
    const columnMappings = headers.value.map((header: any) => ({ key: header.value, label: header.title }))
    await exportToPDF(list.value, undefined, 'all', columnMappings)
  } catch (error) {
    toast.error('PDF\'e aktarma sırasında bir hata oluştu')
  }
}


const filter:any = ref({
  withCapitoneWorkshop: false,
  withWorkshop: false,
  withManufacturer: false,
  startDate: null,
  endDate: null,
  loading: false,
})

const handleResetFilter = async () => {
  filter.value = {
    withCapitoneWorkshop: false,
    withWorkshop: false,
    withManufacturer: false,
    startDate: null,
    endDate: null,
  }
  search.value.filtered = false
  await fetchPaymentList()
  await fetchTotalPayment()
}

const handleFilter = async () => {
  search.value.filtered = true
  await fetchPaymentList()
  await fetchTotalPayment()
}


onMounted(async () => {
  await fetchPaymentList()
  await fetchTotalPayment()
  loading.value.table = false
  search.value.loading = false
})
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
</style>
