<template>
	<div class="page-fabric_order">
		<v-progress-linear v-if="loading.page" indeterminate color="primary" />

		<!-- <v-data-table-server 
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
       show-expand 
       @update:page="handlePageUpdate"
        @update:items-per-page="handlePageUpdate" 
        v-model:expanded.sync="expandedRows" 
        @update:expanded="handleGetRowDetails" 
        fixed-header
        > -->

		<v-data-table-server
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
			:items-length="tableOptions.totalCount"
			show-current-page
			@update:page="handlePageUpdate"
			@update:items-per-page="handlePageUpdate"
			v-model:expanded.sync="expandedRows"
			show-expand
			@update:expanded="handleGetRowDetails">
			<template v-slot:top>
				<v-toolbar flat color="white" class="overflow-x-auto">
					<div class="d-flex align-center overflow-x-auto w-100">
						<v-select
							v-model="filter.completedType"
							:items="Object.values(showCompletedToWorkshopOrder).map(item => ({
							title: item.name,
							value: item.value
						}))"
							label="Tamamlanma Durumu"
							variant="outlined"
							density="compact"
							class="mr-2 mt-6"
							style="width: 200px; min-width: 200px"
							@update:model-value="handleCompletedOrdersToggle" />
						<v-divider vertical class="mx-3 my-5"></v-divider>

						<div
							class="position-relative d-flex align-center pa-2 rounded border-primary"
							:class="[{ 'bg-primary-opacity-1 border-1': search.filtered }]">
							<BtDatePicker
								key="startDate"
								id="startDate"
								v-model="search.startDate"
								label="Başlangıç Tarihi"
								placeholder="Başlangıç Tarihi"
								class="txt-search mr-2"
								style="width: 200px"
								:disabled="search.loading.filter"></BtDatePicker>
							<BtDatePicker
								key="endDate"
								id="endDate"
								v-model="search.endDate"
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

						<v-spacer />

						<v-btn color="orange" variant="tonal" @click="handleExportToPDF('all')" class="mr-2">
							<v-icon left>mdi-file-pdf-box</v-icon>
							PDF
						</v-btn>
						<v-btn color="green" variant="tonal" class="mr-2" @click="handleExportToExcel('all')">
							<v-icon left>mdi-file-excel</v-icon>
							Excel
						</v-btn>

						<v-btn color="primary" variant="flat" @click="handleNewFabricModel">Yeni Ekle</v-btn>
					</div>
				</v-toolbar>
			</template>

			<template v-slot:item.createdDate="{ item }: any">
				{{ dayjs(item.createdDate).format("DD.MM.YYYY") }}
			</template>
			<template v-slot:item.arriveDate="{ item }: any">
				{{ item.arriveDate ? dayjs(item.arriveDate).format("DD.MM.YYYY") : "-" }}
			</template>
			<template v-slot:item.isArrived="{ item }: any">
				<v-chip :color="item.isArrived ? 'success' : 'error'" label>
					{{ item.isArrived ? "Evet" : "Hayır" }}
				</v-chip>
			</template>

			<template v-slot:item.fabricColorName="{ item }: any">
				<div class="d-flex align-center">
					<v-chip v-if="item.fabricType.color.rgbCode" size="x-small" :color="item.fabricType.color.rgbCode" variant="flat" class="ma-1">
						{{ item.fabricType.color.name }}
					</v-chip>
					<v-tooltip v-else :width="128" :height="128" location="top" content-class="pa-0">
						<template v-slot:activator="{ props }">
							<v-chip v-bind="props" class="d-flex align-center" size="x-small" variant="outlined" color="primary py-2">
								<v-img
									:src="item.fabricType.color?.images?.[2]?.path || item.fabricType.color?.images?.[0]?.path"
									width="16"
									height="16"
									class="rounded mr-1"
									cover />
								{{ item.fabricType.color.name }}
							</v-chip>
						</template>
						<v-img :src="item.fabricType.color?.images?.[0]?.path" width="128" height="128" cover class="rounded border shadow-sm border-gray" />
					</v-tooltip>
				</div>
			</template>
			<template v-slot:item.actions="{ item, index }: any">
				<v-tooltip :color="item.isArrived ? 'success' : 'error'" :text="item.isArrived ? 'Tamamlandı Kaldır' : 'Tamamla'" location="top">
					<template v-slot:activator="{ props }">
						<v-icon
							v-if="!loadingIsArrived[item.id]"
							v-bind="props"
							class="me-2"
							:color="!item.isArrived ? 'info' : 'error'"
							size="small"
							@click="toggleCompletedOrder(item)"
							:loading="loadingIsArrived[item.id]">
							{{ !item.isArrived ? "mdi-check-circle" : "mdi-close-circle" }}
						</v-icon>
						<v-progress-circular v-else :width="2" size="14" color="info" v-bind="props" indeterminate class="me-2" />
					</template>
				</v-tooltip>
				<v-tooltip v-if="!item.isArrived" color="purple" text="Teslim Et" location="top">
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" class="me-2" color="purple" size="small" @click="deliver.handleShow(item)"> mdi-truck-delivery-outline </v-icon>
					</template>
				</v-tooltip>
				<v-tooltip location="top" text="Düzenle" color="primary">
					<template v-slot:activator="{ props }">
						<v-icon v-if="!item.isArrived" v-bind="props" class="me-2" color="primary" size="small" @click="editItem(item)"> mdi-pencil-box-outline </v-icon>
					</template>
				</v-tooltip>

				<v-tooltip location="top" text="Sil" color="error">
					<template v-slot:activator="{ props }">
						<v-icon v-if="!item.isArrived" v-bind="props" size="small" color="error" class="me-2" @click="confirm.handlerShow(item, 'parent')"> mdi-delete-outline</v-icon>
					</template>
				</v-tooltip>
				<v-tooltip color="orange" text="PDF'e Aktar" location="top">
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" class="me-2" color="orange" size="small" @click="handleExportToPDF('selected', item,)"> mdi-file-pdf-box </v-icon>
					</template>
				</v-tooltip>
				<v-tooltip color="green" text="Excel'e Aktar" location="top">
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" class="me-2" color="green" size="small" @click="handleExportToExcel('selected', item)">
							mdi-file-excel-outline
						</v-icon>
					</template>
				</v-tooltip>
			</template>
			<template v-slot:no-data>
				<p class="text-subtitle-1 mt-10 mb-3">Kayıt bulunamadı</p>
				<!-- <v-btn color="primary" @click="fetchFabricOrderList" flat>
          Yenile
        </v-btn> -->
			</template>

			<template v-slot:expanded-row="{ columns, item, isExpanded, index: expandedIndex }: any">
				<tr style="background: var(--bt-expanded-row-bg)">
					<td :colspan="columns.length" class="py-4">
						<transition name="fade" mode="out-in">
							<v-data-table
								v-if="expanded?.[item?.id].loaded"
								:headers="expandHeaders"
								:items="expanded?.[item?.id]?.data"
								:loading="expanded?.[item?.id]?.loading"
								fixed-header
								color="primary"
								no-data-text="Kayıt bulunamadı"
								hide-default-footer
								density="compact">
								<template v-slot:item.arrivedDate="{ item: childItem }: any">
									{{ childItem.arrivedDate ? dayjs(childItem.arrivedDate).format("DD.MM.YYYY") : "-" }}
								</template>
								<template v-slot:item.actions="{ item: childItem }">
									<v-icon class="me-2" color="primary" size="small" @click="editRowChild(item, childItem)"> mdi-pencil-box-outline </v-icon>

									<v-icon size="small" color="error" @click="confirm.handlerShow(childItem, 'child', item)"> mdi-delete-outline</v-icon>
								</template>
							</v-data-table>
							<v-skeleton-loader v-else type="table-row@5"></v-skeleton-loader>
						</transition>
					</td>
				</tr>
			</template>
		</v-data-table-server>
		<BtModal v-model:show="dialog.show" v-model:loading="dialog.loading" :title="dialog.title" width="50vw" @save="handleSubmit">
			<template #content>
				<v-card-text>
					<v-form ref="fabricOrderForm" @submit.prevent>
						<v-row>
							<v-col cols="12" sm="6">
								<!-- <v-autocomplete
									v-if="dialog.type === 'new'"
									v-model="model.fabricTypeId"
									:items="fabricTypes.list"
									label="Kumaş Tipi"
									:loading="fabricTypes.loading"
									:disabled="dialog.type === 'new' ? false : true"
									:item-props="(item: any) => ({ item, title: item.name })"
									item-value="id"
									variant="outlined"
									:multiple="false"
									hide-details="auto"> -->
								<BtFabricTypeAutocomplete
									v-if="dialog.type === 'new'"
									v-model="model.fabricTypeId"
									:items="fabricTypes.list"
									label="Kumaş Tipi"
									:loading="fabricTypes.loading"
									:disabled="dialog.type === 'new' ? false : true"
									:multiple="false"
									hide-details="auto" />
								<v-text-field
									v-else
									v-model="model.fabricType.name"
									label="Kumaş Tipi"
									dense
									disabled
									variant="outlined"
									hide-details="auto"></v-text-field>
							</v-col>
							<v-col cols="12" sm="6">
								<v-autocomplete
									v-if="dialog.type === 'new'"
									v-model="model.fabricManufacturerId"
									:items="fabricManufacturers.list"
									:item-props="(item: any) => ({ item, title: item.name })"
									item-value="id"
									label="Üretici"
									:rules="[dialog.type === 'new' ? rules.required : '']"
									:loading="fabricManufacturers.loading"
									:disabled="dialog.type === 'new' ? false : true"
									dense
									variant="outlined"
									hide-details="auto"></v-autocomplete>
								<v-text-field
									v-else
									v-model="model.fabricManufactur"
									label="Üretici"
									dense
									disabled
									variant="outlined"
									hide-details="auto"></v-text-field>
							</v-col>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="model.meter"
									label="Metre"
									:rules="[rules.required]"
									dense
									variant="outlined"
									hide-details="auto"></v-text-field>
							</v-col>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="model.ballCount"
									label="Top Sayısı"
									:rules="[rules.required]"
									dense
									variant="outlined"
									hide-details="auto"></v-text-field>
							</v-col>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="model.price"
									label="Fiyat"
									:rules="[rules.required]"
									dense
									variant="outlined"
									hide-details="auto"
									:suffix="currentCurrency.symbol" />
							</v-col>
						</v-row>
					</v-form>
				</v-card-text>
			</template>
		</BtModal>
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
								<v-text-field
									v-model="dialogDetail.model.meterCount"
									label="Metre"
									:rules="[rules.required]"
									dense
									variant="outlined"
									hide-details="auto"></v-text-field>
							</v-col>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="dialogDetail.model.ballCount"
									label="Top Sayısı"
									:rules="[rules.required]"
									dense
									variant="outlined"
									hide-details="auto"></v-text-field>
							</v-col>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="dialogDetail.model.price"
									label="Fiyat"
									:rules="[rules.required]"
									dense
									variant="outlined"
									hide-details="auto"
									:suffix="currentCurrency.symbol" />
							</v-col>
						</v-row>
					</v-form>
				</v-card-text>
			</template>
		</BtModal>
		<ConfirmBox
			v-model:show="confirm.show"
			:title="confirm.title"
			:type="confirm.type"
			:loading="confirm.loading"
			@save="confirm.handler('save')"
			@cancel="confirm.handler('cancel')">
			<template #content>
				<div v-html="confirm.body"></div>
			</template>
		</ConfirmBox>
		<BtModal
			v-model:show="deliver.dialog.show"
			v-model:loading="deliver.dialog.loading"
			:title="deliver.dialog.title"
			width="50vw"
			@save="deliver.handleSubmit">
			<template #content>
				<v-card-text>
					<v-form ref="fabricDeliverForm" @submit.prevent>
						<v-row>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="deliver.dialog.modelpool.meterCount"
									label="Metre"
									:rules="[rules.required]"
									dense
									variant="outlined"
									hide-details="auto"></v-text-field>
							</v-col>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="deliver.dialog.modelpool.ballCount"
									label="Top Sayısı"
									:rules="[rules.required]"
									dense
									variant="outlined"
									hide-details="auto"></v-text-field>
							</v-col>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="deliver.dialog.modelpool.price"
									label="Fiyat"
									:rules="[rules.required]"
									dense
									variant="outlined"
									hide-details="auto"
									:suffix="currentCurrency.symbol" />
							</v-col>
							<v-col cols="12" sm="6">
								<!-- <v-autocomplete
                  v-model="deliver.dialog.modelpool.fabricTypeId"
                  :items="fabricTypes.list"
                  label="Kumaş Tipi"
                  :loading="fabricTypes.loading"
                  :disabled="fabricTypes.loading"
                  :rules="[rules.required]"
                  :item-props="(item:any) => ({ item, title: item.name })"
                  item-value="id"
                  variant="outlined"
                  :multiple="false"
                  hide-details="auto"
                >
                </v-autocomplete> -->
							</v-col>
						</v-row>
					</v-form>
				</v-card-text>
			</template>
		</BtModal>
	</div>
</template>

<script lang="ts" setup>
import { ref, watchEffect, onMounted, watch, reactive } from "vue"
import { toast } from "vue3-toastify"
import { rules } from "../../../config/rules"
import dayjs from "dayjs"

import ConfirmBox from "../../components/ConfirmBox.vue"
import BtModal from "../../components/BtModal.vue"
// import { useFetch } from "../../composables/useFetch";
import $axios from "../../composables/axios"
import BtDatePicker from "../../components/BtDatePicker.vue"
import { cloneDeep, debounce } from "lodash"
import { currentCurrency } from "../../composables/useCurrentCurrency"
import BtFabricTypeAutocomplete from "../../components/BtFabricTypeAutocomplete.vue"
import { useExport } from '../../composables/useExport'
import { showCompletedToWorkshopOrder } from "../../../config/enum"
const headers: any = ref([
  { title: "Üretici adı", value: "fabricManufactur", align: "start" },
  { title: "Metre", value: "meter", align: "start" },
  { title: "Fiyat", value: "price", align: "start" },
  { title: "Top Sayısı", value: "ballCount", align: "start" },
  { title: "Oluşturma Tarihi", value: "createdDate", align: "start" },
  { title: "Tamamlanma Tarihi", value: "arriveDate", align: "start" },
  { title: "Kumaş Adı", value: "fabricType.name", align: "start" },
  { title: "Kumaş Kodu", value: "fabricType.code", align: "start" },
  { title: "Kumaş Rengi", value: "fabricColorName", align: "center" },
  { title: "Tamamlanma Durumu", value: "isArrived", align: "start" },
  {
    title: "İşlemler",
    value: "actions",
    align: "start",
    minWidth: "120px",
    maxWidth: "120px",
    fixed: true,
  },
])

const expandHeaders: any = ref([
  { title: "Metre", value: "meterCount", align: "start" },
  { title: "Fiyat", value: "price", align: "start" },
  { title: "Top Sayısı", value: "ballCount", align: "start" },
  { title: "Tarih", value: "arrivedDate", align: "start" },
  { title: "İşlemler", value: "actions", align: "start" },
])
const list = ref([])
const fabricOrderForm = ref()
const fabricOrderDetailForm2 = ref()
const loading = ref({
  table: true,
  page: true,
})

const fabricDeliverForm = ref()
const deliver: any = ref({
  dialog: {
    show: false,
    loading: false,
    title: "Kumaş Siparişi Teslim Et",
    item: null,
    modelpool: {
      fabricOrderId: "",
      meterCount: "",
      ballCount: "",
      price: "",
      fabricTypeId: null,
    },
  },
  handleShow: (item: any) => {
    deliver.value.dialog.item = item
    deliver.value.dialog.show = true
  },
  handleSubmit: async () => {
    deliver.value.dialog.loading = true

    const isValid = fabricDeliverForm.value?.validate()
    if (!isValid) return

    deliver.value.dialog.modelpool.fabricOrderId = deliver.value.dialog.item.id
    deliver.value.dialog.modelpool.fabricTypeId = deliver.value.dialog.item.fabricType.id

    const isSuccess = await deliverItem(deliver.value.dialog.modelpool)
    if (isSuccess) {
      const arrayRows = expandedRows.value.map((item) => item)
      if (expanded.value?.[deliver.value.dialog.item.id]) expanded.value[deliver.value.dialog.item.id].loaded = false
      await handleGetRowDetails([...arrayRows])

      deliver.value.dialog.show = false
      deliver.value.dialog.item = null
      deliver.value.dialog.modelpool = {
        fabricOrderId: "",
        meter: "",
        ballCount: "",
        price: "",
        fabricTypeId: null,
      }
    }

    deliver.value.dialog.loading = false
  },
})
const model: any = ref({
  meter: "",
  ballCount: "",
  price: "",
  fabricTypeId: null,
  fabricManufacturerId: null,
})
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
    fabricOrderDetailForm2.value?.validate()
    if (fabricOrderDetailForm2.value?.isValid) {
      dialogDetail.value.loading = true
      const url = "/FabricOrderDelivered/UpdateFabricOrderDelireved"
      const response: any = await $axios(url, {
        method: dialogDetail.value.type === "new" ? "POST" : "PUT",
        data: dialogDetail.value.model,
      }).catch((err: any) => {
        dialogDetail.value.loading = false
        toast.error("Kumaş siparişi detayı güncellenirken hata oluştu")
      })

      if (!response) return false

      const { data, isFinished, error }: any = response

      dialogDetail.value.loading = false
      if (!data.value.succeeded) {
        toast.error(data.value.message || "Kumaş siparişi detayı güncellenirken hata oluştu")
      } else {
        toast.success("Kumaş siparişi detayı başarıyla güncellendi")
        fetchFabricOrderList()
        dialogDetail.value.show = false

        const result = await fetchRowDetails(dialogDetail.value.model.fabricOrderId)

        const expandedItem = expanded.value[dialogDetail.value.model.fabricOrderId]
        if (!result.succeeded) {
          toast.error(result.message || "Satır detayları getirilirken hata oluştu")

          expandedItem.loaded = false
          expandedItem.loading = false
          return
        }
        expandedItem.data = result.data.length <= 0 ? [] : result.data
        expandedItem.loaded = true
        expandedItem.loading = false
      }
    }
  },
})

const dialog = ref({
  show: false,
  loading: false,
  title: "Kumaş Siparişi Oluştur",
  type: "new",
})

const confirm = ref({
  show: false,
  title: "Kumaş Siparişi Sil!",
  body: ``,
  type: "error",
  item: null,
  childItem: null,
  loading: false,
  handler: async (type: string) => {
    switch (type) {
      case "save": {
        confirm.value.loading = true
        const isSuccess = await deleteItem(confirm.value.item, confirm.value.childItem)
        if (isSuccess) {
          confirm.value.show = false
        }
        confirm.value.loading = false
        break
      }
      case "cancel": {
        confirm.value.show = false
        confirm.value.item = null
        confirm.value.title = ""

        break
      }
      default:
        break
    }
  },
  handlerShow: (item: any, type?: string, otherItem?: any) => {
    confirm.value.item = { ...otherItem, type: "parent", emitedType: type }
    confirm.value.childItem = { ...item, type: "child", emitedType: type }
    confirm.value.show = true
    confirm.value.type = "error"

    if (type === "child") {
      confirm.value.title = "Kumaş Siparişini Detayını Sil!"
      confirm.value.body = `
        <p>
          <strong>${otherItem.fabricManufactur}</strong> üreticili ve <strong>${otherItem.meter}</strong> metre, <strong>${otherItem.fabricType.color.name}</strong> renkli <strong>${otherItem.fabricType.name}</strong> kumaş tipindeki, fiyatı <strong>${otherItem.price}${currentCurrency.symbol}</strong> olan kaydın içindeki;
          <br />
          <br />
          <strong>${item.meterCount}</strong> metre, <strong>${item.ballCount}</strong> top, fiyatı <strong>${item.price}${currentCurrency.symbol}</strong> olan kaydı silmek istediğinize emin misiniz?
        </p>
      `
      return
    }

    confirm.value.title = "Kumaş Siparişini Sil!"
    confirm.value.body = `
        <p>
          <strong>${item.fabricManufactur}</strong> üreticili ve <strong>${item.meter}</strong> metre, <strong>${item.fabricType.color.name}</strong> renkli <strong>${item.fabricType.name}</strong> kumaş tipindeki, fiyatı <strong>${item.price}${currentCurrency.symbol}</strong> olan kaydı silmek istediğinize emin misiniz?
        </p>
      `
  },
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
      search.value.list = list.value.filter((item: any) => item.name.toLowerCase().includes(search.value.value.toLowerCase()))
    } else {
      search.value.list = list.value
    }
  },
})

const handleFilter = async () => {
  search.value.filtered = true
  search.value.loading.filter = true
  const modelpool: any = {}
  if (search.value.startDate) modelpool.startDate = dayjs(search.value.startDate).add(1, "day")
  if (search.value.endDate) modelpool.endDate = dayjs(search.value.endDate).add(1, "day")
  await fetchFabricOrderList(modelpool)
  search.value.loading.filter = false
}
const handleResetFilter = async () => {
  search.value.filtered = false
  search.value.startDate = null
  search.value.endDate = null
  await fetchFabricOrderList()
}

const handlePageUpdate = (page: number) => {
  tableOptions.value.page = page
  fetchFabricOrderList()
}

const fetchFabricOrderList = async (queryParams: object | undefined = {}): Promise<void> => {
  const modelpool = {
    page: tableOptions.value.page,
    size: tableOptions.value.itemsPerPage,
    showCompletedToWorkshopOrder: filter.completedType,
    ...queryParams,
  }

  const { data, error }: any = (await $axios("/FabricOrder/GetFabricOrders", {
    method: "GET",
    params: modelpool,
  })) as any
  if (error.value) {
    toast.error(error.message || "Kumaş tipleri getirilirken hata oluştu")
  } else {
    list.value = data.value?.data
    search.value.list = list.value
    tableOptions.value.totalCount = data.value?.totalCount

    search.value.value = ""
  }
}

const expanded: any = ref({})
const expandedRows = ref([])
const handleGetRowDetails = async (expandedIds: any) => {
  const newItem: any = Object.values(expandedIds).filter((item: any) => !expanded.value[item]?.value)
  // toggle expanded value with expandedIds
  // if newItem is not included in expanded, add it
  // else remove it

  if (newItem.length) {
    expanded.value[newItem[0]] = {
      value: true,
      loaded: false,
      id: newItem[0],
      data: {},
    }
  } else {
    const findDiff = Object.keys(expanded.value).filter((item) => !expandedIds.includes(item))
    delete expanded.value[findDiff[0]]
  }

  for await (const expandedItem of Object.values(expanded.value) as {
    value: boolean
    loading: boolean
    loaded: boolean
    id: number
    data?: any
  }[]) {
    if (!expandedItem.loaded) {
      expandedItem.loading = true
      const result = await fetchRowDetails(expandedItem.id)
      if (!result.succeeded) {
        toast.error(result.message || "Satır detayları getirilirken hata oluştu")
        expandedItem.loaded = false
        expandedItem.loading = false
        return
      }
      expandedItem.data = result.data.length <= 0 ? [] : result.data
      expandedItem.loaded = true
      expandedItem.loading = false
    }
  }
}

const fetchRowDetails = async (id: number) => {
  const { data }: any = await $axios("/FabricOrderDelivered/FabricOrderDelirevedGetAll", {
    method: "GET",
    params: {
      fabricOrderId: id,
      size: -1,
    },
  }).catch((err: any) => {
    toast.error("Kumaş siparişleri getirilirken hata oluştu")
  })
  return data.value
}

const handleNewFabricModel = () => {
  dialog.value.title = "Kumaş Siparişi Oluştur"
  dialog.value.type = "new"
  model.value = {
    name: "",
    code: "",
    fabricTypeId: null,
    fabricManufacturerId: null,
  }
  dialog.value.show = true
}

const handleSubmit = async () => {
  fabricOrderForm.value?.validate()
  if (fabricOrderForm.value?.isValid) {
    dialog.value.loading = true
    const url = dialog.value.type === "new" ? "/FabricOrder/CreateFabricOrders" : "/FabricOrder/UpdateFabricOrders"

    const { data, isFinished, error }: any = await $axios(url, {
      method: dialog.value.type === "new" ? "POST" : "PUT",
      data: model.value,
    }).catch((err: any) => {
      dialog.value.loading = false
      toast.error("Kumaş siparişi eklenirken hata oluştu")
    })

    dialog.value.loading = false
    if (!data.value.succeeded) {
      toast.error(data.value.message || "Kumaş siparişi eklenirken hata oluştu")
    } else {
      toast.success("Kumaş siparişi başarıyla eklendi")
      fetchFabricOrderList()
      dialog.value.show = false
    }
  }
}

const editItem = (item: any) => {
  model.value = {
    ...model.value,
    ...item,
    id: item.id,
    manufacturerId: item.fabricManufacturId,
    fabricTypeId: item.fabricType.id,
  }

  dialog.value.type = "edit"
  dialog.value.title = "Kumaş Siparişini Düzenle"
  dialog.value.show = true
}

const deliverItem = async (modelpool: any) => {
  loading.value.table = true
  const response: any = await $axios("/FabricOrderDelivered/FabricOrderDelirevedArrivedOrder", {
    method: "POST",
    data: modelpool,
  })
    .catch((err: any) => {
      loading.value.table = false
      confirm.value.loading = false
      // toast.error("Kumaş siparişi teslim edilirken hata oluştu");
    })
    .finally(() => {
      loading.value.table = false
      confirm.value.loading = false
    })

  if (!response) return false

  const { data, isFinished }: any = response

  if (!data.value?.succeeded) {
    loading.value.table = false

    toast.error(data.value.message || "Kumaş siparişi teslim edilirken hata oluştu")
    return false
  } else {
    toast.success("Kumaş siparişi başarıyla teslim edildi")
    await fetchFabricOrderList()
  }

  loading.value.table = false
  return true
}

const deleteItem = async (item: any, childItem?: any) => {
  loading.value.table = true

  const url = childItem?.emitedType === "child" ? "/FabricOrderDelivered/DeleteFabricOrderDelireved" : "/FabricOrder/DeleteFabricOrders"

  const sendpool = childItem?.emitedType === "child" ? { fabricOrderDelirevedId: childItem.id } : { id: childItem.id }

  const response: any = await $axios(url, {
    method: "DELETE",
    data: sendpool,
  }).catch((err: any) => {
    loading.value.table = false
    confirm.value.loading = false
    toast.error("Kumaş siparişi silinirken hata oluştu")
  })

  if (!response) return false

  const { data, isFinished }: any = response

  if (!data.value?.succeeded) {
    loading.value.table = false
    toast.error(data.value.message || "Kumaş siparişi silinirken hata oluştu")
    return false
  } else {
    toast.success("Kumaş siparişi başarıyla silindi")
    await fetchFabricOrderList()

    const arrayRows = expandedRows.value.map((item) => item)
    if (expanded.value?.[item.id]) expanded.value[item.id].loaded = false
    await handleGetRowDetails([...arrayRows])
  }

  loading.value.table = false
  return true
}

const editRowChild = async (item: any, childItem: any) => {
  dialogDetail.value.model = {
    fabricOrderDeliveredId: childItem.id,
    fabricOrderId: item.id,
    price: childItem.price,
    ballCount: childItem.ballCount,
    meterCount: childItem.meterCount,
  }
  dialogDetail.value.show = true
  dialogDetail.value.title = "Kumaş Siparişi Detaylarını Düzenle"
  dialogDetail.value.type = "edit"
}

// fabricTypes
const fabricTypes = reactive({
  list: [],
  loading: false,
})
const fetchFabricTypes = async () => {
  fabricTypes.loading = true
  const { data, error }: any = await $axios("/FabricTypes/GetFabricTypes", {
    method: "GET",
    data: { size: -1 },
  })
  if (error.value) {
    toast.error(error.message || "Kumaş tipleri getirilirken hata oluştu")
  } else {
    fabricTypes.list = cloneDeep(data.value?.data)
  }
  fabricTypes.loading = false
}

// fabricManufacturers
const fabricManufacturers = ref({
  list: [],
  loading: false,
})

const fetchFabricManufacturers = async () => {
  fabricManufacturers.value.loading = true
  const { data, error }: any = await $axios("/Manufacturer/GetManufacturer", {
    method: "GET",
    data: { size: -1 },
  })
  if (error.value) {
    toast.error(error.message || "Kumaş üreticileri getirilirken hata oluştu")
  } else {
    fabricManufacturers.value.list = data.value?.data
  }
  fabricManufacturers.value.loading = false
}

const { exportToExcel, exportToPDF } = useExport('Kumaş Siparişleri')

// Modify export methods
const handleExportToExcel = async (exportType: 'all' | 'selected' = 'all', item?: any) => {
  const exportItems = exportType === 'selected'
    ? [item]
    : search.value.list

  // Optional: Define custom column mappings specific to this view
  const columnMappings = [
    { key: 'fabricManufactur', label: 'Üretici Adı' },
    { key: 'meter', label: 'Metre' },
    {
      key: 'price',
      label: 'Fiyat',
      formatter: (value: any) => `${value} ${currentCurrency.value.name}`
    },
    { key: 'ballCount', label: 'Top Sayısı' },
    { key: 'fabricType.name', label: 'Kumaş Adı' },
    { key: 'fabricType.code', label: 'Kumaş Kodu' },
    { key: 'fabricType.color.name', label: 'Kumaş Rengi' }
  ]
  const expandedColumnMappings = [
    { key: 'meterCount', label: 'Metre' },
    { key: 'price', label: 'Fiyat', formatter: (value: any) => `${value} ${currentCurrency.value.name}` },
    { key: 'ballCount', label: 'Top Sayısı' },
    { key: 'arrivedDate', label: 'Tamamlanma Tarihi', formatter: (value: any) => value ? dayjs(value).format("DD.MM.YYYY") : '-' }
  ]

  let expandedItems: any = []
  if (exportType === 'selected' && item?.id) {
    expandedItems = await fetchRowDetails(item.id).then((res: any) => res.data)
  }

  exportToExcel(exportItems, expandedItems, exportType, columnMappings, expandedColumnMappings)
}

const handleExportToPDF = async (exportType: 'all' | 'selected' = 'all', item?: any) => {
  const exportItems = exportType === 'selected'
    ? [item]
    : search.value.list

  // Optional: Define custom column mappings specific to this view
  const columnMappings = [
    { key: 'fabricManufactur', label: 'Üretici Adı' },
    { key: 'meter', label: 'Metre' },
    {
      key: 'price',
      label: 'Fiyat',
      formatter: (value: any) => `${value} ${currentCurrency.value.name}`
    },
    { key: 'ballCount', label: 'Top Sayısı' },
    { key: 'fabricType.name', label: 'Kumaş Adı' },
    { key: 'fabricType.code', label: 'Kumaş Kodu' },
    { key: 'fabricType.color.name', label: 'Kumaş Rengi' }
  ]
  console.log('main items is => ', exportItems)

  let findDetails:any = reactive([])
  let expandedColumnMappings:any = reactive([])
  if (item?.id) {
    findDetails = await fetchRowDetails(item.id).then((res: any) => res.data)
    console.log('findDetails is => ', findDetails)
    expandedColumnMappings = [
      { key: 'meterCount', label: 'Metre' },
      { key: 'price', label: 'Fiyat', formatter: (value: any) => `${value} ${currentCurrency.value.name}` },
      { key: 'ballCount', label: 'Top Sayısı' },
      { key: 'arrivedDate', label: 'Tamamlanma Tarihi', formatter: (value: any) => value ? dayjs(value).format("DD.MM.YYYY") : '-' }
    ]
  }

  exportToPDF(exportItems, fetchRowDetails, exportType, columnMappings, expandedColumnMappings, findDetails)
}

const filter = reactive({
  completedType: 2,
})

const handleCompletedOrdersToggle = async (value: number) => {
  filter.completedType = value
  await fetchFabricOrderList()
}

const loadingIsArrived:any = ref({})


const toggleCompletedOrder = async (item:any) => {
  loadingIsArrived.value[item.id] = true
  // /FabricOrder/UpdateArriveFabricOrders

  const { data, isFinished, error }: any = await $axios("/FabricOrder/UpdateArriveFabricOrders", {
    method: "PUT",
    data: { id: item.id, isArrived: !item.isArrived },
  })

  if (!data.value.succeeded) {
    toast.error(data.value.message || "Kumaş siparişi tamamlanırken hata oluştu")
  } else {
    toast.success("Kumaş siparişi başarıyla tamamlandı", { autoClose: 1000 })
    await fetchFabricOrderList()
  }
  loadingIsArrived.value[item.id] = false
}

onMounted(async () => {
  loading.value.page = true
  await fetchFabricTypes()
  await fetchFabricManufacturers()
  await fetchFabricOrderList()

  loading.value.page = false
  loading.value.table = false
})
</script>

<style scoped>
.btn-clear-filter {}
</style>
