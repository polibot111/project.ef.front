<template>
	<div class="page-capitone_list">
		<v-progress-linear v-if="loading.page" indeterminate color="primary" />

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
			show-expand
			@update:page="handlePageUpdate"
			@update:items-per-page="handlePerPageUpdate"
			@update:expanded="handleGetRowDetails"
			:items-length="tableOptions.totalCount"
			v-model:expanded.sync="expandedRows"
			fixed-header
			show-current-page>
			<template v-slot:top>
				<v-toolbar flat color="white">
					<v-select
						v-model="filter.completedType"
						:items="Object.values(showCompletedToWorkshopOrder).map((item:any) => ({
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

					<v-btn color="primary" variant="flat" @click="$router.push('/capitone-management/create')"> Yeni Ekle</v-btn>
				</v-toolbar>
			</template>

			<template v-slot:item.usedFabricCapitoneOrderDTOs="{ item }: any">
				<div class="py-1">
					<v-chip v-for="(fabric, index) in item.usedFabricCapitoneOrderDTOs" :key="index" class="me-2 my-1" color="primary" label>
						<div v-for="(child, cIndex) in fabric" :key="cIndex">
							<strong v-if="cIndex === 0">{{ child.fabricTypeName }}</strong>
							{{ child.fabricStockTypeName }}: {{ child.usedFabricCount }}<span v-if="cIndex !== fabric.length - 1" class="mx-1">-</span>
						</div>
						<!-- <strong>{{ fabric.fabricTypeName }}</strong
            >: {{ fabric.usedFabricCount }} {{ fabric.fabricStockTypeName }} -->

						<div>
							<v-icon
								v-if="item.arrivedBallCount === 0 && item.arrivedMeterCount === 0 && item.arrivedPrice === 0"
								class="ml-2 cursor-pointer btn"
								right
								@click="usedFabric.handleShow(item, fabric, index)"
								>mdi-pencil-box-outline</v-icon
							>

							<v-tooltip text="Düzenle" location="top" activator="parent"> </v-tooltip>
						</div>
					</v-chip>
				</div>
			</template>
			<template v-slot:item.isArrived="{ item }: any">
				<v-chip :color="item.isArrived ? 'success' : 'error'" label>
					{{ item.isArrived ? "Evet" : "Hayır" }}
				</v-chip>
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
				<v-tooltip color="success" text="Teslim Et" location="top">
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" class="me-2" color="purple" size="small" @click="deliver.handleShow(item)"> mdi-truck-delivery-outline </v-icon>
					</template>
				</v-tooltip>
				<v-tooltip color="orange" text="PDF'e Aktar" location="top">
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" class="me-2" color="orange" size="small" @click="handleExportToPDF('selected', item)"> mdi-file-pdf-box </v-icon>
					</template>
				</v-tooltip>
				<v-tooltip color="green" text="Excel'e Aktar" location="top">
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" class="me-2" color="green" size="small" @click="handleExportToExcel('selected', item)">
							mdi-file-excel-outline
						</v-icon>
					</template>
				</v-tooltip>

				<v-icon
					v-if="item.arrivedBallCount === 0 && item.arrivedMeterCount === 0 && item.arrivedPrice === 0"
					class="me-2"
					color="primary"
					size="small"
					@click="editItem(item)">
					mdi-pencil-box-outline
				</v-icon>

				<v-icon size="small" color="error" @click="confirm.handlerShow(item, 'parent')"> mdi-delete-outline</v-icon>
			</template>

			<template v-slot:item.meterCount="{ item }: { item: any }">
				<div>
					<v-tooltip :text="`Teslim Edilen Metre: ${item.arrivedMeterCount}`" activator="parent" location="top"> </v-tooltip>
					{{ item.meterCount }}
				</div>
			</template>
			<template v-slot:item.price="{ item }: { item: any }">
				<div>
					<v-tooltip :text="`Teslim Edilen Tutar: ${item.arrivedPrice}`" activator="parent" location="top"> </v-tooltip>
					{{ item.price }}
				</div>
			</template>
			<template v-slot:item.ballCount="{ item }: { item: any }">
				<div>
					<v-tooltip :text="`Teslim Edilen Top: ${item.arrivedBallCount}`" activator="parent" location="top"> </v-tooltip>
					{{ item.ballCount }}
				</div>
			</template>

			<template v-slot:no-data>
				<p class="text-subtitle-1 mt-10 mb-3">Kayıt bulunamadı</p>
				<!-- <v-btn color="primary" @click="fetchCapitoneList" flat>
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
								<v-text-field v-model="model.workShopName" label="Atölye Adı" dense variant="outlined" disabled hide-details="auto"></v-text-field>
							</v-col>
							<v-col cols="12" sm="6">
								<v-text-field v-model="model.fabricName" label="Kumaş Tipi" dense variant="outlined" hide-details="auto" disabled></v-text-field>
							</v-col>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="model.meterCount"
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
									:suffix="currentCurrency.name"
									hide-details="auto"></v-text-field>
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
									:suffix="currentCurrency.name"
									hide-details="auto"></v-text-field>
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
									:suffix="currentCurrency.name"
									variant="outlined"
									hide-details="auto"></v-text-field>
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
		<BtModal
			v-model:show="usedFabric.dialog.show"
			v-model:loading="usedFabric.dialog.loading"
			:title="usedFabric.dialog.title"
			width="50vw"
			@save="usedFabric.handleSubmit">
			<template #content>
				<v-card-text>
					<v-form ref="usedFabricForm" @submit.prevent>
						<v-row>
							<v-col cols="12" sm="12">
								<v-text-field
									v-model="usedFabric.dialog.modelpool.fabricName"
									label="Kumaş Tipi"
									dense
									variant="outlined"
									readonly
									hide-details="auto" />
							</v-col>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="usedFabric.dialog.modelpool.meterCount"
									label="Metre"
									:rules="[rules.required]"
									dense
									variant="outlined"
									hide-details="auto" />
							</v-col>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="usedFabric.dialog.modelpool.ballCount"
									label="Top Sayısı"
									:rules="[rules.required]"
									dense
									variant="outlined"
									hide-details="auto"></v-text-field>
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
import { cloneDeep, groupBy, uniqBy } from "lodash"
import {currentCurrency} from "../../composables/useCurrentCurrency"
import {useExport} from "../../composables/useExport"
import { showCompletedToWorkshopOrder } from "../../../config/enum"

const { exportToExcel, exportToPDF } = useExport('Kapiton Siparişleri')
const headers: any = ref([
  { title: "Atölye Adı", value: "workShopName", align: "start", minWidth: 160 },
  { title: "Kapitone Metre", value: "meterCount", align: "start", minWidth: 140 },
  { title: "Kapitone Fiyat", value: "price", align: "start", minWidth: 140 },
  { title: "Kapitone Top Sayısı", value: "ballCount", align: "start", minWidth: 140 },
  { title: "Kumaş Tipi", value: "fabricName", align: "start", minWidth: 170 },
  { title: "Kumaşlar", value: "usedFabricCapitoneOrderDTOs", align: "start" },
  { title: "Tamamlandı", value: "isArrived", align: "start", minWidth: 140 },

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
    title: "Kapiton Teslim Et",
    item: null,
    modelpool: {
      price: null,
      meterCount: null,
      ballCount: null,
      fabricCapitoneOrderId: null,
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

    deliver.value.dialog.modelpool.fabricCapitoneOrderId = deliver.value.dialog.item.id

    const isSuccess = await deliverItem(deliver.value.dialog.modelpool)
    if (isSuccess) {
      const arrayRows = expandedRows.value.map((item) => item)
      if (expanded.value?.[deliver.value.dialog.item.id]) expanded.value[deliver.value.dialog.item.id].loaded = false
      handleGetRowDetails([...arrayRows])

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
const usedFabricForm = ref()
const usedFabric: any = ref({
  dialog: {
    show: false,
    loading: false,
    title: "Kumaş Düzenle",
    item: null,
    fabricItem: null,
    modelpool: {
      fabricName: "",
      meterCount: null,
      meterId: null,
      meterStockTypeId: null,
      ballCount: null,
      ballId: null,
      ballStockTypeId: null,

    },
  },
  handleShow: (item: any, fabric: any, index:any) => {
    usedFabric.value.dialog.item = item
    usedFabric.value.dialog.show = true

    usedFabric.value.dialog.modelpool.fabricName = fabric?.[0]?.fabricTypeName
    usedFabric.value.dialog.title = `Kumaş Düzenle - ${fabric?.[0]?.fabricTypeName}`
    usedFabric.value.dialog.fabricItem = fabric
    fabric.forEach((el: any) => {
      // !#TODO: burası değişmeli!!!
      if (el.fabricStockTypeName.toLowerCase() === 'top') {
        usedFabric.value.dialog.modelpool.ballId = el.id
        usedFabric.value.dialog.modelpool.ballStockTypeId = el.fabricStockTypeId
        usedFabric.value.dialog.modelpool.ballCount = el.usedFabricCount
      }

      if (el.fabricStockTypeName.toLowerCase() === 'metre') {
        usedFabric.value.dialog.modelpool.meterId = el.id
        usedFabric.value.dialog.modelpool.meterStockTypeId = el.fabricStockTypeId
        usedFabric.value.dialog.modelpool.meterCount = el.usedFabricCount
      }

    })

  },
  handleSubmit: async () => {
    usedFabric.value.dialog.loading = true
    const isValid = usedFabricForm.value?.validate()
    if (!isValid) return

    usedFabric.value.dialog.modelpool.fabricCapitoneOrderId = usedFabric.value.dialog.item.id

    const promises = []
    promises.push( usedFabric.value.update(usedFabric.value.dialog.modelpool.meterId, usedFabric.value.dialog.modelpool.meterCount))
    promises.push(usedFabric.value.update(usedFabric.value.dialog.modelpool.ballId, usedFabric.value.dialog.modelpool.ballCount))

    const results = await Promise.allSettled(promises)
    // !#TODO: buraya kontrol yazılabilir!!


    // if (isSuccess) {
    //   const arrayRows = expandedRows.value.map((item) => item)
    //   if (expanded.value?.[usedFabric.value.dialog.item.id]) expanded.value[usedFabric.value.dialog.item.id].loaded = false
    //   handleGetRowDetails([...arrayRows])

    //   usedFabric.value.dialog.show = false
    //   usedFabric.value.dialog.item = null
    //   usedFabric.value.dialog.modelpool = {
    //     fabricOrderId: "",
    //     meter: "",
    //     ballCount: "",
    //     price: "",
    //     fabricTypeId: null,
    //   }
    // }

    usedFabric.value.dialog.loading = false
  },
  update:async (id: string, value: any) => {
    return await $axios(`/UsedFabric`, {
      method: "PUT",
      data: {
        id,
        usedFabricCount: value,
      },
    }).catch((err: any) => {
      toast.error("Kumaş siparişi eklenirken hata oluştu")
    })
  }
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
  title: "Kapiton Detaylarını Düzenle",
  type: "new",
  model: {
    meterCount: "",
    ballCount: "",
    price: "",
    id: "",
    fabricCapitoneOrderId: "",

  },
  submit: async () => {
    fabricOrderDetailForm2.value?.validate()
    if (fabricOrderDetailForm2.value?.isValid) {
      dialogDetail.value.loading = true
      const url = "/FabricCapitoneOrderDeliveredDelivered/UpdateFabricCapitoneOrderDelivered"
      const response: any = await $axios(url, {
        method: dialogDetail.value.type === "new" ? "POST" : "PUT",
        data: dialogDetail.value.model,
      }).catch((err: any) => {
        dialogDetail.value.loading = false
        toast.error("Kapiton detayı güncellenirken hata oluştu")
      })

      if (!response) return false

      const { data, isFinished, error }: any = response

      dialogDetail.value.loading = false
      if (!data.value.succeeded) {
        toast.error(data.value.message || "Kapiton detayı güncellenirken hata oluştu")
      } else {
        toast.success("Kapiton detayı başarıyla güncellendi")
        fetchCapitoneList()
        dialogDetail.value.show = false

        const result = await fetchRowDetails(dialogDetail.value.model.fabricOrderId)

        const expandedItem = expanded.value[dialogDetail.value.model.fabricOrderId]
        if (!result.succeeded) {
          toast.error(result.message || "Satır detayları getirilirken hata oluştu")

          expandedItem.loaded = false
          expandedItem.loading = false
          return
        }
        const arrayRows = expandedRows.value.map((item) => item)
        if (expanded.value?.[dialogDetail.value.model?.fabricCapitoneOrderId]) expanded.value[dialogDetail.value.model?.fabricCapitoneOrderId].loaded = false
        await handleGetRowDetails([...arrayRows])


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
  title: "Kapiton Oluştur",
  type: "new",
})

const confirm = ref({
  show: false,
  title: "Kapiton Sil!",
  body: ``,
  type: "error",
  item: null,
  otherItem: null,
  loading: false,
  handler: async (type: string) => {
    switch (type) {
      case "save": {
        confirm.value.loading = true
        const isSuccess = await deleteItem(confirm.value.item, confirm.value.otherItem)
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
    confirm.value.item = { ...item, type, emitType: type }
    confirm.value.otherItem = { ...otherItem, type: type, emitType: type }
    confirm.value.show = true
    confirm.value.type = "error"

    if (type === "child") {
      confirm.value.title = "Kapiton Detayını Sil!"
      confirm.value.body = `
      <p>
        <strong>${otherItem.workShopName}</strong> atölyesindeki ve <strong>${otherItem.fabricName}</strong> kumaş tipli kapitonun içindeki;
        <br />
        <br />
        <strong>${item.meterCount}</strong> metre, <strong>${item.ballCount}</strong> top, fiyatı <strong>${item.price} ${currentCurrency.value.name}</strong> olan kaydı silmek istediğinize emin misiniz?
      </p>
    `
      return
    }

    confirm.value.title = "Kapiton Sil!"
    confirm.value.body = `
      <p>
      <strong>${item.workShopName}</strong> atölyesindeki  <strong>${item.fabricName}</strong> kumaş tipindeki kaydı silmek istediğinize emin misiniz?
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
  totalCount: 0,
  page: 1,
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
  await fetchCapitoneList(modelpool)
  search.value.loading.filter = false
}
const handleResetFilter = async () => {
  search.value.filtered = false
  await fetchCapitoneList()
}

const handlePageUpdate = async (page: number) => {
  tableOptions.value.page = page
  await fetchCapitoneList()
}
const handlePerPageUpdate = async (itemsPerPage: number) => {
  tableOptions.value.itemsPerPage = itemsPerPage
  await fetchCapitoneList()
}

const fetchCapitoneList = async (queryParams: object | undefined = {}): Promise<void> => {
  const { data, error }: any = (await $axios("/FabricCapitoneOrder/GetFabricCapitoneOrder", {
    method: "GET",
    params: {
      page: tableOptions.value.page,
      size: tableOptions.value.itemsPerPage,
      showCompletedToWorkshopOrder: filter.completedType,
      ...queryParams,
    },
  })) as any
  if (error.value) {
    toast.error(error.message || "Kumaş tipleri getirilirken hata oluştu")
  } else {
    list.value = data.value?.data

    // usedFabricCapitoneOrderDTOs da   fabricTypeId aynı olanları birleştir ancak fabricStockTypeId id'lerini kendi içinde groupla ve usedFabricCount u topla
    search.value.list = list.value.map((item: any) => ({
      ...item,
      usedFabricCapitoneOrderDTOs: groupBy(
        item.usedFabricCapitoneOrderDTOs.reduce((acc: any, curr: any) => {
          // fabricStockTypeId aynı olanları birleştir ve topla

          const findIndex = acc.findIndex((item: any) => item.fabricStockTypeId === curr.fabricStockTypeId && item.fabricTypeId === curr.fabricTypeId)
          if (findIndex >= 0) {
            acc[findIndex].usedFabricCount += curr.usedFabricCount
          } else {
            acc.push(curr)
          }

          // fabricTypeId'leri aynı olanları grupla
          return acc
        }, []),
        "fabricTypeId"
      ),
    }))
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

  const { data }: any = await $axios("/FabricCapitoneOrderDeliveredDelivered/GetFabricCapitoneOrderDelivered", {
    method: "GET",
    params: {
      FabricCapitoneOrderId: id,
      size: -1,
    },
  }).catch((err: any) => {
    toast.error("Kapitonları getirilirken hata oluştu")
  })
  return data.value
}

const handleNewFabricModel = () => {
  dialog.value.show = true
  dialog.value.title = "Kapiton Oluştur"
  dialog.value.type = "new"
  model.value = {
    name: "",
    code: "",
  }
}

const handleSubmit = async () => {
  fabricOrderForm.value?.validate()
  if (fabricOrderForm.value?.isValid) {
    dialog.value.loading = true
    const url = dialog.value.type === "new" ? "/FabricOrder/CreateFabricOrders" : "/FabricCapitoneOrder/UpdateFabricCapitoneOrder"

    const { data, isFinished, error }: any = await $axios(url, {
      method: dialog.value.type === "new" ? "POST" : "PUT",
      data: model.value,
    }).catch((err: any) => {
      dialog.value.loading = false
      toast.error("Kapiton eklenirken hata oluştu")
    })

    dialog.value.loading = false
    if (!data.value.succeeded) {
      toast.error(data.value.message || "Kapiton eklenirken hata oluştu")
    } else {
      toast.success("Kapiton başarıyla eklendi")
      fetchCapitoneList()
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
    // fabricTypeId: item.fabricType.id,
  }
  // meter: "",
  // ballCount: "",
  // price: "",
  // fabricTypeId: null,
  // fabricManufacturerId: null,
  dialog.value.show = true
  dialog.value.title = "Kapiton Düzenle"
  dialog.value.type = "edit"
}

const deliverItem = async (modelpool: any) => {
  loading.value.table = true
  const response: any = await $axios("/FabricCapitoneOrderDeliveredDelivered/AddFabricCapitoneOrderDelivered", {
    method: "POST",
    data: modelpool,
  })
    .catch((err: any) => {
      loading.value.table = false
      confirm.value.loading = false
      toast.error("Teslim edilirken hata oluştu")
    })
    .finally(() => {
      loading.value.table = false
      confirm.value.loading = false
    })

  if (!response) return false

  const { data, isFinished }: any = response

  if (!data.value?.succeeded) {
    loading.value.table = false

    toast.error(data.value.message || "Kapiton teslim edilirken hata oluştu")
    return false
  } else {
    toast.success("Kapiton başarıyla teslim edildi")
    await fetchCapitoneList()
  }

  loading.value.table = false
  return true
}

const deleteItem = async (item: any, otherItem?: any) => {
  loading.value.table = true

  const url = item?.emitType === "child" ? "/FabricCapitoneOrderDeliveredDelivered/DeleteFabricCapitoneOrderDelivered" : "/FabricCapitoneOrder/DeleteFabricCapitoneOrder"

  const sendpool = item?.emitType === "child" ? { fabricCapitoneDeliveredId: item.id } : { id: item.id }

  const response: any = await $axios(url, {
    method: "DELETE",
    data: sendpool,
  }).catch((err: any) => {
    loading.value.table = false
    confirm.value.loading = false
    toast.error("Kapiton silinirken hata oluştu")
  })

  if (!response) return false

  const { data, isFinished }: any = response

  if (!data.value?.succeeded) {
    loading.value.table = false
    return false
    toast.error(data.value.message || "Kapiton silinirken hata oluştu")
  } else {
    toast.success("Kapiton başarıyla silindi")


    if (item?.emitType === "child") {
      const arrayRows = expandedRows.value.map((item) => item)
      if (expanded.value?.[otherItem?.id]) expanded.value[otherItem?.id].loaded = false
      await handleGetRowDetails([...arrayRows])
    } else {
      await fetchCapitoneList()
    }
  }

  loading.value.table = false
  return true
}

const editRowChild = async (item: any, otherItem: any) => {
  dialogDetail.value.model = {
    // fabricOrderDeliveredId: otherItem.id,
    // fabricOrderId: item.id,
    fabricCapitoneOrderId: item.id,
    id: otherItem.id,
    price: otherItem.price,
    ballCount: otherItem.ballCount,
    meterCount: otherItem.meterCount,
  }
  dialogDetail.value.show = true
  dialogDetail.value.title = "Kapiton Detayını Düzenle"
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

onMounted(async () => {
  loading.value.page = true
  await fetchFabricTypes()
  await fetchFabricManufacturers()
  await fetchCapitoneList()

  loading.value.page = false
  loading.value.table = false
})

const handleExportToExcel = async (exportType: 'all' | 'selected' = 'all', item?: any) => {
  const exportItems = exportType === 'selected'
    ? [item]
    : search.value.list

  // Optional: Define custom column mappings specific to this view
  const columnMappings = [
    { key: 'workShopName', label: 'Atölye Adı' },
    { key: 'meterCount', label: 'Kapitone Metre' },
    {
      key: 'price',
      label: 'Kapitone Fiyat',
      formatter: (value:any) => `${value}`
    },
    { key: 'ballCount', label: 'Kapitone Top Sayısı' },
    { key: 'fabricName', label: 'Kumaş Tipi'}
  ]

  const expandedColumnMappings = [
    { key: 'meterCount', label: 'Metre' },
    { key: 'price', label: 'Fiyat', formatter: (value: any) => `${value}` },
    { key: 'ballCount', label: 'Top Sayısı' },
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
    { key: 'workShopName', label: 'Atölye Adı' },
    { key: 'meterCount', label: 'Kapitone Metre' },
    {
      key: 'price',
      label: 'Kapitone Fiyat',
      formatter: (value:any) => `${value}`
    },
    { key: 'ballCount', label: 'Kapitone Top Sayısı' },
    { key: 'fabricName', label: 'Kumaş Tipi' },
    // { key: 'usedFabricCapitoneOrderDTOs', label: 'Kumaşlar', formatter: (vv:any) => {
    //   // {{ child.fabricStockTypeName }}: {{ child.usedFabricCount }}
    //   console.log('vv is => ', vv)
    //   return Object.values(vv).flatMap((item:any) =>
    //     Object.values(item).flatMap((child:any) => {
    //       console.log('child is => ', child)
    //       return `${child.fabricTypeName}: ${child.usedFabricCount}`
    //     })
    //   ).join(', ')
    // }},
    { key: 'usedFabricCapitoneOrderDTOs', label: 'Kumaşlar TOP', formatter: (vv:any) => {
      return Object.values(vv).flatMap((item:any) =>
        Object.values(item)
          .filter((x:any) => x.fabricStockTypeName.toLowerCase() === 'top')
          .map((child:any) =>  `${child.fabricTypeName}: ${child.usedFabricCount} top`)
      ).join(', ')
    }},
    { key: 'usedFabricCapitoneOrderDTOs', label: 'Kumaşlar Metre', formatter: (vv:any) => {
      return Object.values(vv).flatMap((item:any) =>
        Object.values(item)
          .filter((x:any) => x.fabricStockTypeName.toLowerCase() === 'metre')
          .map((child:any) =>  `${child.fabricTypeName}: ${child.usedFabricCount} metre`)
      ).join(', ')
    }}
  ]


  let findDetails:any = reactive([])
  let expandedColumnMappings:any = reactive([])

  if (item?.id) {
    findDetails = await fetchRowDetails(item.id).then((res: any) => res.data)
    expandedColumnMappings = [
      { key: 'meterCount', label: 'Metre' },
      { key: 'price', label: 'Fiyat', formatter: (value: any) => `${value}` },
      { key: 'ballCount', label: 'Top Sayısı' },
      { key: 'arrivedDate', label: 'Tamamlanma Tarihi', formatter: (value: any) => value ? dayjs(value).format("DD.MM.YYYY") : '-' }
    ]
  }

  exportToPDF(exportItems, fetchRowDetails, exportType, columnMappings, expandedColumnMappings, findDetails)

  // exportToPDF(exportItems, undefined, exportType, columnMappings, expandedItems)
}

const filter = reactive({
  completedType: 2,
})

const handleCompletedOrdersToggle = async (value: number) => {
  filter.completedType = value
  await fetchCapitoneList()
}
const loadingIsArrived:any = ref({})

const toggleCompletedOrder = async (item:any) => {
  loadingIsArrived.value[item.id] = true
  // /FabricOrder/UpdateArriveFabricOrders

  const { data, isFinished, error }: any = await $axios("/FabricCapitoneOrder/UpdateArriveDateFabricCapitoneOrder", {
    method: "PUT",
    data: { id: item.id, isArrived: !item.isArrived },
  })

  if (!data.value.succeeded) {
    toast.error(data.value.message || "Kumaş siparişi tamamlanırken hata oluştu")
  } else {
    toast.success("Kumaş siparişi başarıyla tamamlandı", { autoClose: 1000 })
    await fetchCapitoneList()
  }
  loadingIsArrived.value[item.id] = false
}
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

.btn-clear-filter {}
</style>
