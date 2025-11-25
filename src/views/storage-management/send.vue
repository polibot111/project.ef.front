<template>
	<div class="page-storage_sended">
		<v-progress-linear v-if="loading.page" indeterminate color="primary" />
		<v-toolbar flat color="white" class="mb-3">
			<!-- <v-text-field
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
				clearable></v-text-field> -->
			<!-- <v-divider vertical class="ml-4 mr-2 my-5"></v-divider> -->

			<div class="position-relative d-flex align-center pa-2 rounded border-primary" :class="[{ 'bg-primary-opacity-1 border-1': search.filtered }]">
				<v-autocomplete
					color="primary"
					class="bg-white mr-2"
					style="border-radius: 0.25rem; max-height: 40px; min-width: 200px;"
					max-width="300px"
					v-model:model-value="filter.storage"
					:items="storageList.list"
					label="Depo"
					variant="outlined"
					placeholder="Depo Seçininiz"
					density="compact"
					hide-details
					:loading="storageList.loading"
					:disabled="storageList.loading || loading.page"
					:item-props="(item: any) => ({ item, title: item.name, disabled: item.disabled })"
					clearable
					item-value="id"
					@click:clear="filter.storage = null"
					no-data-text="Depo listesi bulunamadı" />
				<v-autocomplete
					color="primary"
					class="bg-white mr-2"
					style="border-radius: 0.25rem; max-height: 40px; min-width: 200px;"
					max-width="300px"
					v-model:model-value="filter.set"
					:items="setList.list"
					label="Set Adı"
					variant="outlined"
					placeholder="Set Adı Seçininiz"
					density="compact"
					hide-details
					:loading="setList.loading"
					:disabled="setList.loading || loading.page"
					:item-props="(item: any) => ({ item, title: item.name, disabled: item.disabled })"
					item-value="id"
					clearable
					no-data-text="Set listesi bulunamadı"
					@click:clear="filter.set = null" />
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
			<!-- <v-btn color="primary" variant="flat" @click="handleCreateCustomer">Yeni Ekle</v-btn> -->
			<!-- <v-btn color="orange" variant="tonal" @click="handleExportToPDF('all')" class="mr-2 ml-2">
				<v-icon left>mdi-file-pdf-box</v-icon>
				PDF
			</v-btn>
			<v-btn color="green" variant="tonal" class="mr-2" @click="handleExportToExcel('all')">
				<v-icon left>mdi-file-excel</v-icon>
				Excel
			</v-btn> -->
		</v-toolbar>
		<v-spacer vertical />

		<v-expansion-panels v-model="masterOrderAccordion.shown" class="w-100 d-block">
			<template v-for="masterOrder of search.list">
				<div>
					<v-expansion-panel class="w-100 mb-3" elevation="0" style="border:1px solid rgba(var(--v-theme-primary), 0.7);">
						<template #title>
							<div class="d-flex align-center justify-space-between w-100 mx-3">
								<div>Önizleme Kodu: {{ masterOrder.code }}</div>
								<div>
									<!-- <v-tooltip text="Sil" location="top">
										<template v-slot:activator="{ props }">
											<v-btn v-bind="props" color="error" variant="tonal" size="small" @click="deleteConfirm.handler('show', masterOrder)"
												><v-icon>mdi-delete-outline</v-icon></v-btn
											>
										</template>
									</v-tooltip>
									<v-tooltip text="PDF'e Aktar" location="top">
										<template v-slot:activator="{ props }">
											<v-btn
												v-bind="props"
												color="orange"
												variant="tonal"
												size="small"
												class="ml-2"
												@click="handleExportToPDF('selected', masterOrder.items.map((x: any) =>  ({...x, previewCode: masterOrder.masterOrderCode})), 'firstChild')"
												><v-icon>mdi-file-pdf-box</v-icon></v-btn
											>
										</template>
									</v-tooltip>
									<v-tooltip text="Excel'e Aktar" location="top">
										<template v-slot:activator="{ props }">
											<v-btn
												v-bind="props"
												color="green"
												variant="tonal"
												size="small"
												class="ml-2"
												@click="handleExportToExcel('selected', masterOrder.items.map((x: any) => ({...x, previewCode: masterOrder.masterOrderCode})), 'firstChild')"
												><v-icon>mdi-file-excel</v-icon></v-btn
											>
										</template>
									</v-tooltip> -->
								</div>
							</div>
						</template>
						<template #text>
							<!-- :group-by="[{key: 'setFabricModelName', order:'asc'}]" -->
							<OTTable
								:key="masterOrder.orderId"
								:headers="headers"
								type="storage-send"
								:items="masterOrder.orderStorageInSetDTOs"
								:items-per-page="tableOptions.itemsPerPage"
								:items-per-page-options="tableOptions.itemsPerPageOptions"
								:items-per-page-text="tableOptions.itemsPerPageText"
								:items-per-page-all="tableOptions.itemsPerPageAll"
								:page-text="tableOptions.pageText"
								:total-count="tableOptions.totalCount"
								:loading="loading.table"
								:hide-default-footer="true"
								item-value="orderId"
								disable-footer
								:third-deep-headers="thirdDeepHeaders"
								:group-by="[{key: 'setFabricModelName', order:'asc'}]"
								@edit="editItem"
								@edit:measurement="editMeasurement.handleShow"
								@delete="confirm.handlerDelete"
								@page:update="handlePageUpdate"
								@deliver="handleDeliver"
								@items-per-page:update="handlePageUpdate"
								@send:toWorkshop="toWorkshop.showDialog"
								@export:pdf="handleExportToPDF('selected', $event.item, 'secondChild', true )"
								@export:excel="handleExportToExcel('selected', $event.item, 'secondChild', true)"
								@measure:edit="editMeasurement.handleShow"
								@measure:delete="confirm.handlerDelete"
								@storage:delete="confirm.handlerDelete($event, 'storage')" />
						</template>
					</v-expansion-panel>
				</div>
			</template>
		</v-expansion-panels>
		<OTNewOrder
			v-model:show="dialog.show"
			v-model:title="dialog.title"
			v-model:loading="dialog.loading"
			:modal-type="dialog.type"
			:item="dialog.item"
			@save="handleSave" />
		<v-spacer vertical />
		<BtModal
			class="comp-edit_measurement_dialog"
			v-model:show="editMeasurement.show"
			v-model:loading="editMeasurement.loading"
			width="100%"
			max-width="925px"
			hide-footer
			@save="editMeasurement.save()">
			<template #title> {{ editMeasurement.title }} </template>
			<template #content>
				<div class="ml-6 mt-3 mb-10">
					<v-row class="w-100 mt-2">
						<v-col cols="12" sm="12">
							<v-text-field
								density="comfortable"
								variant="outlined"
								v-model="editMeasurement.tempItem.count"
								placeholder="Adet"
								class="bg-white"
								label="Adet"
								style="border-radius: 0.25rem;"
								:disabled="measurementList.loading"
								hide-details="auto" />
						</v-col>
						<v-col cols="12" class="d-flex justify-end">
							<VBtn
								color="primary"
								elevation="0"
								variant="flat"
								@click="editMeasurement.save"
								:loading="editMeasurement.loading"
								:disabled="editMeasurement.loading"
								>Kaydet</VBtn
							>
						</v-col>
					</v-row>
				</div>
			</template>
		</BtModal>
		<BtModal
			class="comp-to_workshop_dialog"
			v-model:show="toWorkshop.show"
			v-model:loading="toWorkshop.loading"
			width="100%"
			max-width="925px"
			hide-footer
			@save="toWorkshop.save">
			<template #title> {{ toWorkshop.title }} </template>
			<template #content>
				<div class="mx-6 mt-3 mb-6">
					<div class="d-flex gap-3 align-center">
						<v-autocomplete
							color="primary"
							class="bg-white"
							style="border-radius: 0.25rem; max-height: 40px;"
							max-width="300px"
							v-model="station.data"
							:items="station.list"
							:loading="station.loading"
							label="İstasyon"
							variant="outlined"
							placeholder="İstasyon Seçininiz"
							density="compact"
							hide-details
							:disabled="toWorkshop.loading"
							:rules="[rules.required]"
							:item-props="(item: any) => ({ item, title: item.name, disabled: item.disabled })"
							item-value="id"
							no-data-text="İstasyon listesi bulunamadı"
							@update:model-value="workshop.getWorkshopList" />
						<v-icon>mdi-arrow-right</v-icon>
						<v-autocomplete
							color="primary"
							class="bg-white"
							style="border-radius: 0.25rem; max-height: 40px;"
							max-width="300px"
							v-model="workshop.data"
							:items="workshop.list"
							:loading="workshop.loading"
							:disabled="!workshop.list || workshop.list.length <= 0 || toWorkshop.loading"
							label="Atölye"
							variant="outlined"
							placeholder="Atölye Seçininiz"
							density="compact"
							hide-details
							:rules="[rules.required]"
							:item-props="(item: any) => ({ item, title: item.name, disabled: item.disabled })"
							item-value="id"
							no-data-text="Atölye listesi bulunamadı"
							@update:model-value="workshop.setWorkshop" />
					</div>
					<v-divider class="my-6" />
					<div>
						<div class="d-flex gap-3 align-center justify-space-between">
							<div><strong>Sipariş Kodu :</strong> {{ toWorkshop.item.orderNumber }}</div>
							<div><strong>Ürün :</strong> {{ toWorkshop.item.fabricModelDto.code }} | {{ toWorkshop.item.fabricModelDto.name }}</div>
						</div>
					</div>
					<!-- <v-divider class="my-3" /> -->
					<VCard color="" variant="outlined" elevation="0" class="px-6 pb-6 mt-6" style="border-color: rgba(var(--v-theme-primary), 0.7);">
						<h4 class="mt-6 mb-6 text-primary" style="font-weight: 600;">Kumaş Tipi</h4>

						<div v-for="fabricTypes of toWorkshop.item.fabricTypeDtos">
							<div class="d-flex gap-3 mb-3">
								<div style="width: 120px">{{ fabricTypes.name }}</div>
								<VTextField
									type="number"
									:value="fabricTypes.tempMeter"
									@update:model-value="toWorkshop.addFabricType($event, 'meter', fabricTypes)"
									label="Metre"
									density="compact"
									variant="outlined"
									:disabled="toWorkshop.loading"
									hide-details="auto"
									persistent-hint
									:hint="`En Fazla ${fabricTypes.stockMeterCount} Metre Eklenebilir`">
								</VTextField>
								<VTextField
									type="number"
									:value="fabricTypes.tempBall"
									@update:model-value="toWorkshop.addFabricType($event, 'ball', fabricTypes)"
									label="Top"
									density="compact"
									variant="outlined"
									:disabled="toWorkshop.loading"
									hide-details="auto"
									persistent-hint
									:hint="`En Fazla ${fabricTypes.stockBallCount} Top Eklenebilir`"></VTextField>
							</div>
						</div>
					</VCard>
					<v-divider class="my-6" />
					<VCard color="" variant="outlined" elevation="0" class="px-6" style="border-color: rgba(var(--v-theme-primary), 0.7);">
						<h4 class="mt-6 mb-6 text-primary" style="font-weight: 600;">Ölçüler</h4>
						<div v-for="orderItem of toWorkshop.item.orderItemsDto">
							<div class="d-flex gap-3 mb-3">
								<div style="width: 250px">
									{{ orderItem.measurementDTO.name }} - {{ orderItem.measurementDTO.width }} x {{ orderItem.measurementDTO.height }}
								</div>
								<VTextField
									type="number"
									:value="orderItem.tempCount"
									@update:model-value="toWorkshop.addOrderItem($event, orderItem)"
									label="Adet"
									density="compact"
									variant="outlined"
									:disabled="toWorkshop.loading"
									hide-details="auto"
									persistent-hint
									:hint="`En Fazla ${orderItem.count - orderItem.countInWorkshop} Adet Eklenebilir`"></VTextField>
							</div>
						</div>
					</VCard>
					<div class="footer mt-6 d-flex align-center justify-space-between">
						<VBtn color="gray" elevation="0" variant="flat" @click="toWorkshop.show = false" :disabled="toWorkshop.loading">İptal</VBtn>

						<VBtn color="primary" elevation="0" variant="flat" @click="toWorkshop.save" :loading="toWorkshop.loading" :disabled="toWorkshop.loading"
							>Kaydet</VBtn
						>
					</div>
				</div>
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
		<ConfirmBox
			v-model:show="deleteConfirm.show"
			:title="deleteConfirm.title"
			:type="deleteConfirm.type"
			:loading="deleteConfirm.loading"
			@save="deleteConfirm.handler('save')"
			@cancel="deleteConfirm.handler('cancel')">
			<template #content>
				<div v-html="deleteConfirm.body"></div>
			</template>
		</ConfirmBox>
	</div>
</template>

<script lang="ts" setup>
import { ref, watchEffect, onMounted, watch, reactive } from "vue";
import { toast } from "vue3-toastify";
import { rules } from "../../../config/rules";
import dayjs from "dayjs";

import ConfirmBox from "../../components/ConfirmBox.vue";
import BtModal from "../../components/BtModal.vue";

import $axios from "../../composables/axios";
import BtDatePicker from "../../components/BtDatePicker.vue";
import { cloneDeep } from "lodash";
import OTTable from "../../components/order-preview-management/OTTable.vue";
import OTNewOrder from "../../components/order-preview-management/OTNewOrder.vue";
import { useExport } from "../../composables/useExport"
const { exportToExcel, exportToPDF } = useExport('Sipariş Önizlemeleri')

const headers: any = ref([
  { title: "Sipariş Kodu", value: "orderCode", align: "start" },
  { title: "Personel", value: "orderOwnerName", align: "start" },
  { title: "Müşteri", value: "customername", align: "start" },
  { title: "Set", value: "setFabricModelName", align: "start", minWidth: '150px' },
  { title: "Set Parçası Adedi", value: "fabricSetModelCount", align: "start", minWidth: '130px' },
  { title: "Toplam Sipariş Adedi", value: "totalCountInStorage", align: "start", minWidth: '130px' },
  {
    title: "Ürün",
    value: "fabricModelAndTypeDTO.fabricModelDTO",
    align: "start",
    minWidth: '200px',
    formatter: (value:any) => value.code ? `${value.code + ' |'}  ${value.name}` : value.name
  },
  {
    title: "Kumaş Tipi",
    value: "fabricModelAndTypeDTO.fabricTypeDTOs",
    align: "start",
    minWidth: '250px'
  },

  // {
  //   title: "",
  //   value: "actions",
  //   align: "start",
  //   minWidth: "120px",
  //   maxWidth: "120px",
  //   fixed: true,
  // },
  // {
  //   title: "",
  //   value: "exportColumn",
  //   align: "start",
  //   minWidth: "90px",
  //   maxWidth: "90px",
  //   fixed: true,
  // }
]);
const expandedTableHeaders = ref([
  {title: 'Name', value: 'name', align: 'start', minWidth: '200px'},
  {title: 'Code', value: 'code', align: 'start', minWidth: '100px'},
])
const thirdDeepHeaders = ref([
  {title: 'Depo Adı', value: 'storageName', align: 'start', minWidth: '200px'},
  {title: 'Toplam Depodaki Sipariş Adedi', value: 'orderTotalCountInStorage', align: 'start', minWidth: '200px'},
  {title: '', value: 'actions', align: 'start', minWidth: '100px'}
])
const station = ref({
  data: null,
  list: [],
  loading: false
});

const list = ref([]);
const storageList = ref({
  list: [],
  loading: false
})
const setList = ref({
  list: [],
  loading: false
})
const filter = ref({
  storage: null,
  set: null,
})
const loading = ref({
  table: true,
  page: true,
  orderItemDelete: false,
  storageList: false,
  setList: false,
});
const deleteConfirm:any = ref({
  show: false,
  loading: false,
  title: "Sipariş Önizlemesini Sil!",
  body: ``,
  type: "error",
  item: null,
  handler: async (type: any, item?: any) => {
    console.log('item is => ', item)
    switch (type) {
      case 'show': {
        deleteConfirm.value.item = item
        deleteConfirm.value.body = `
        <p>
          Önizleme kodu <strong>${item.code}</strong> olan sipariş önizlemeyi silmek istediğinize emin misiniz?
        </p>
        `
        deleteConfirm.value.show = true
        break
      }
      case 'save': {
        console.log('DELETE save item is => ', item)
        deleteConfirm.value.loading = true
        const result: any = await $axios('/OrderStorage/OrderStorageItemDelete', {
          method: 'DELETE',
          data: { id: deleteConfirm.value.item.masterOrderId }
        }).catch((err: any) => {
          console.log('err is => ', {err})
          toast.error(err?.response?.data?.message  || err?.message ||'Sipariş silinirken hata oluştu')
          deleteConfirm.value.loading = false
        })

        if (result?.data?.value?.succeeded) {
          toast.success('Sipariş başarıyla silindi')
          await fetchOrderPreviewList()
          deleteConfirm.value.loading = false
          deleteConfirm.value.show = false
        } else {
          // toast.error(result?.data?.value?.message || 'Sipariş silinirken hata oluştu')
          deleteConfirm.value.loading = false
        }




        break
      }
      case 'cancel': {
        deleteConfirm.value.show = false
        deleteConfirm.value.item = null
        break
      }
    }

  }
})

const editMeasurement: any = ref({
  show: false,
  loading: false,
  title: "Ölçü Düzenle",
  item: {},
  tempItem: {},
  handleShow: (payload: any) => {
    console.log('payload is => ', payload)
    // editMeasurement.value.item = { ...payload.item, orderItemsDto: payload.item.orderItemsDto.map((x: any) => ({ ...x, loading: false })) };
    editMeasurement.value.show = true;
    editMeasurement.value.tempItem = payload.actionItem
  },
  save: async (payload: any) => {
    console.log('payload is => ', payload)
    const isErrors =  editMeasurement.value.tempItem.count === 0 || !editMeasurement.value.tempItem.count

    if (isErrors) {
      toast.error("Adet seçimi yapmalısınız", {
        autoClose: 1000
      });
      return;
    }

    const sendpool: any = {
      count: editMeasurement.value.tempItem.count,
      id: editMeasurement.value.tempItem.id
    }
    const result: any = await $axios('/OrderStorage/OrderStorageItemUpdate', {
      method: 'PUT',
      data: sendpool
    }).catch((err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Ölçü güncellenirken hata oluştu");
    })

    if(result?.data?.value?.succeeded) {
      toast.success('Ölçü başarıyla güncellendi')
      editMeasurement.value.item = {}
      editMeasurement.value.tempItem = {}
      editMeasurement.value.show = false
    }
  },
  deleteOrderItem: async (item: any) => {
    item.loading = true
    console.log('delete item is => ', item, editMeasurement.value.item)

    const findIsInProccess = editMeasurement.value.item.orderItemsDto.some((x: any) => x.id === item.id && x.countInWorkshop > 0)
    if (findIsInProccess) {
      toast.error("İşlemde olan ölçüyü silemezsiniz")
      item.loading = false
      return
    }


    if (item.type === 'new') {
      editMeasurement.value.item.orderItemsDto = editMeasurement.value.item.orderItemsDto.filter((x: any) => x.measurementDTO.id !== item.measurementDTO.id)
      return
    }
    const result: any = await $axios('/Order/DeleteOrderItem', {
      method: 'DELETE',
      data: {
        id: item.id
      }
    }).catch((err: any) => {
      toast.error(err.message || "Ölçü silinirken hata oluştu");
      item.loading = false
    })


    if (result.data.value.succeeded) {
      editMeasurement.value.item.orderItemsDto = editMeasurement.value.item.orderItemsDto.filter((x: any) => x.measurementDTO.id !== item.measurementDTO.id)
      await fetchOrderPreviewList();
      toast.success('Ölçü başarıyla silindi')

    } else {
      item.loading = false
    }



  },
});

const model: any = ref({
  id: "",
  name: null,
  address: null,
  note: null,
  telephone: null,
});

const dialog = ref({
  show: false,
  loading: false,
  title: "Sipariş Oluştur",
  type: "new",
  item: {},
});

const confirm = ref({
  show: false,
  title: "Müşteri Sil!",
  body: ``,
  type: "error",
  item: null,
  loading: false,
  deleteType: '',
  handler: async (type: string) => {
    switch (type) {
      case "save": {
        confirm.value.loading = true;
        let isSuccess = false
        if(confirm.value.deleteType !== 'storage') {
          isSuccess = await deleteItem(confirm.value.item);
        } else {
          isSuccess = await deleteStorage(confirm.value.item);
        }
        if (isSuccess) {
          confirm.value.show = false;
        }
        confirm.value.loading = false;
        break;
      }
      case "cancel": {
        confirm.value.show = false;
        confirm.value.item = null;
        confirm.value.title = "";

        break;
      }
      default:
        break;
    }
  },
  handlerShow: (item: any, type?: string, otherItem?: any) => {
    console.log("delete iterm is => ", item);
    confirm.value.item = item;
    confirm.value.show = true;
    confirm.value.type = "error";
    confirm.value.deleteType = type || '';

    if(type !== 'storage') {
      confirm.value.title = "Ölçü Sil!";
      confirm.value.body = `
          <p>
            <strong>Ölçüyü silmek istediğinize emin misiniz?
          </p>
        `;
    } else {
      confirm.value.title = "Depo Sil!";
      confirm.value.body = `
          <p>
            <strong>Depoyu silmek istediğinize emin misiniz?
          </p>
        `;
    }
  },
  handlerDelete: (item: any, type: string) => {
    console.log('handlerDelete item is => ', item, type)
    confirm.value.handlerShow(item.actionItem, type);
  },
});

const tableOptions = ref({
  itemsPerPageText: "Sayfa başına satır:",
  itemsPerPageAll: "Hepsi",
  pageText: "Toplam Kayıt: {2}",
  noDataText: "Kayıt bulunamadı",
  itemsPerPageOptions: [10, 15, 20, 25, 30],
  itemsPerPage: -1,
  page: 1,
  totalCount: 0,
});
const masterOrderAccordion = ref({
  shown: [0],
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
      )
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
  if (filter.value.storage) modelpool.storageId = filter.value.storage
  if (filter.value.set) modelpool.orderStorageSetId = filter.value.set

  await fetchOrderPreviewList(modelpool)
  search.value.loading.filter = false;
};
const handleResetFilter = async () => {
  search.value.filtered = false;
  search.value.startDate = null
  search.value.endDate = null
  
  filter.value.storage = null
  filter.value.set = null

  search.value.loading.filter = true
  await fetchOrderPreviewList();
  search.value.loading.filter = false
};

const handlePageUpdate = async (page: number) => {
  tableOptions.value.page = page;
  await fetchOrderPreviewList();
};

const fetchOrderPreviewList = async (
  queryParams: object | undefined = {}
): Promise<void> => {
  loading.value.page = true
  const modelpool:any = ref({
    page: tableOptions.value.page,
    size: tableOptions.value.itemsPerPage,
  })
  if (queryParams) modelpool.value = {...modelpool.value, ...queryParams}
  if (filter.value.storage) modelpool.value.storageId = filter.value.storage
  if (filter.value.set) modelpool.value.orderStorageSetId = filter.value.set
  const { data }: any = (await $axios("/OrderStorage/GetOrderStorage", {
    method: "GET",
    params: modelpool.value,
  }).catch((err: any) => {
    console.log("err is => ", err);
    toast.error(err.message || "Müşteriler getirilirken hata oluştu");
    loading.value.page = false
  })) as any;
  if (!data.value.succeeded) {
    console.log("data.value", data.value);
    toast.error(data.value.message || "Müşteriler getirilirken hata oluştu");
    loading.value.page = false
  } else {
    list.value = data.value?.data;
    tableOptions.value.totalCount = data.value?.totalCount;
    // tableOptions.value.pageText = `Toplam Kayıt: ${data.value?.totalCount}`;
    let result:any = []
    search.value.list = list.value.map((masterOrder: any) => {
      const newMasterOrder = {...masterOrder}


      newMasterOrder.orderStorageInSetDTOs = masterOrder.orderStorageInSetDTOs.map((orderSet: any) => {
        const newOrderSet = {...orderSet}
        let newOrderStorageList:any = []
        newOrderSet.orderStorageDTOs = orderSet.orderStorageDTOs.map((orderStorage: any) => {
          let newOrderStorage = {...orderStorage}


           orderStorage.orderStorageItemDTOs.forEach((orderItem: any) => {
            const a =  orderItem.orderStorageItemInOrderStorageDTOs.map((orderItemInOrderStorage: any) => {
              const tempModel = {
                ...orderItem,
                ...orderItemInOrderStorage,
                orderStorageItemInOrderStorageDTOsId: orderItemInOrderStorage.id
              }
              delete tempModel.orderStorageItemInOrderStorageDTOs
              result.push({
                code: masterOrder.code,
                masterOrderId: masterOrder.id,
                orderStorageInSetDTOs: {
                  customerId: orderSet.customerId,
                  customerName: orderSet.customerName,
                  fabricModelAndTypeDTO: orderSet.fabricModelAndTypeDTO,
                  fabricSetModelCount: orderSet.fabricSetModelCount,
                  fabricSetModelId: orderSet.fabricSetModelId,
                  fabricSetModelName: orderSet.fabricSetModelName,
                  setOrderCode: orderSet.orderCode,
                  setOrderId: orderSet.orderId,
                  setOrderOwnerId: orderSet.orderOwnerId,
                  setOrderOwnerName: orderSet.orderOwnerName,
                  setFabricModelId: orderSet.setFabricModelId,
                  setFabricModelName: orderSet.setFabricModelName,

                  orderStorageDTOsId: orderStorage.id,
                  orderStorageDTOsOrderTotalCountInStorage: orderStorage.orderTotalCountInStorage,
                  orderStorageDTOsStorageId: orderStorage.storageId,
                  orderStorageDTOsStorageName: orderStorage.storageName,

                  orderStorageItemId: orderItem.orderItemId,
                  orderStorageItemTotalCount: orderItem.totalCount,
                  orderStorageItemMeasurementId: orderItem.measurementId,

                  orderStorageItemInOrderStorageDTOsId: orderItemInOrderStorage.id,
                  orderStorageItemInOrderStorageDTOsCount: orderItemInOrderStorage.count,
                  orderStorageItemInOrderStorageDTOsMeasurementId: orderItemInOrderStorage.measurement.id,
                  orderStorageItemInOrderStorageDTOsMeasurementName: orderItemInOrderStorage.measurement.name,
                  orderStorageItemInOrderStorageDTOsMeasurementWidth: orderItemInOrderStorage.measurement.width,
                  orderStorageItemInOrderStorageDTOsMeasurementHeight: orderItemInOrderStorage.measurement.height
                }
              })





              return tempModel
            })

            // newOrderStorage = {...newOrderStorage, ...a.flat()}
            newOrderStorageList.push(...a)
          })

          return newOrderStorage
        })
        return newOrderSet
      })

      return newMasterOrder


    })
    reMappedList.value = result.reduce((acc:any, item:any) => {
      const existingGroup = acc.find((group:any) => group.masterOrderId === item.masterOrderId);
      if (existingGroup) {
        existingGroup.items.push(item);
      } else {
        acc.push({
          masterOrderId: item.masterOrderId,
          masterOrderCode: item.code,
          items: [item]
        });
      }
      return acc;
    }, [])
    console.log('reMappedList.value is => ', reMappedList.value)
    console.log('search.value.list is => ', search.value.list)
    search.value.value = "";
  }
  loading.value.page = false
};
const reMappedList:any = ref([])


const editItem = (item: any) => {
  dialog.value.item = item;
  dialog.value.show = true;
  dialog.value.title = "Sipariş Düzenle";
  dialog.value.type = "edit";
};

const deleteItem = async (item: any) => {
  loading.value.table = true;

  const url = "/OrderStorage/OrderStorageItemDelete";
  console.log('before delete', item)

  const sendpool = { id: item.id };

  const response: any = await $axios(url, {
    method: "DELETE",
    data: sendpool,
  }).catch((err: any) => {
    toast.error(err?.response?.data?.message || err?.message || "Ölçü silinirken hata oluştu");
    loading.value.table = false;
    confirm.value.loading = false;
  });

  if (!response) return false;

  const { data, isFinished }: any = response;

  if (!data.value?.succeeded) {
    loading.value.table = false;
    toast.error(data.value.message || "Ölçü silinirken hata oluştu");
    return false;
  } else {
    toast.success("Ölçü başarıyla silindi");
    await fetchOrderPreviewList();
  }

  loading.value.table = false;
  return true;
};

const deleteStorage = async (item: any) => {
  loading.value.table = true;

  const url = "/OrderStorage/OrderStorageDelete";
  console.log('before delete', item)

  const sendpool = { id: item.id };

  const response: any = await $axios(url, {
    method: "DELETE",
    data: sendpool,
  }).catch((err: any) => {
    toast.error(err?.response?.data?.message || err?.message || "Depo silinirken hata oluştu");
    loading.value.table = false;
    confirm.value.loading = false;
  });

  if (!response) return false;

  const { data, isFinished }: any = response;

  if (!data.value?.succeeded) {
    loading.value.table = false;
    toast.error(data.value.message || "Depo silinirken hata oluştu");
    return false;
  } else {
    toast.success("Depo başarıyla silindi");
    await fetchOrderPreviewList();
  }

  loading.value.table = false;
  return true;
};

const handleSave = async (mp: any) => {
  console.log('saved! modelpool is => ', mp)


  if (!mp.personel) {
    dialog.value.loading = false;
    toast.error("Personel seçimi yapmalısınız");
    return;
  }

  if (!mp.customer) {
    dialog.value.loading = false;
    toast.error("Müşteri seçimi yapmalısınız");
    return;
  }

  if (mp.sets.length === 0 && mp.orderList.length === 0 ) {
    toast.error("Ürün veya set seçimi yapmalısınız");
    return;
  }



  const findSetError = mp.sets.some((s: any) => {
    if (!s.setId) {
      toast.error("Set seçimi yapmalısınız");
      return true;
    }
    if (s.count === 0 || !s.count) {
      toast.error("Set adedi girmelisiniz");
      return true;
    }

    return false;
  });

  const findModelError = mp.orderList.some((o: any) => {
    if (!o.fabricModel) {
      toast.error("Ürün seçimi yapmalısınız");
      return true;
    }
    if (o.fabricTypes.length === 0) {
      toast.error("Kumaş tipi seçimi yapmalısınız");
      return true;
    }
    if (o.measurements.length === 0) {
      toast.error("Ölçü seçimi yapmalısınız");
      return true;
    }
    if (o.measurements.some((x: any) => !x.measurementId)) {
      toast.error("Ölçü seçimi yapmalısınız");
      return true;
    }
    if (o.measurements.some((x: any) => x.count === 0 || !x.count)) {
      toast.error("Ölçü adedi girmelisiniz");
      return true;
    }

    return false;
  });

  if (findModelError) {
    dialog.value.loading = false;
    return;
  }


  console.log('finded error is => ', findSetError)

  if (findSetError) {
    dialog.value.loading = false;
    return;
  }


  dialog.value.loading = true;

  const sendpool = {
    "setFabricModelOrders": mp.sets.map((s: any) => {
      return {
        setFabricModelId: s.setId,
        count: s.count,
        orderNote: '',
      }
    }),
    "fabricModelOrders": mp.orderList.map((o: any) => {
      return {
        fabricModelId: o.fabricModel.id,
        fabricTypeIds: o.fabricTypes.map((x: any) => x.id),
        orderItemParams: o.measurements
      }
    }),

    "customerId": mp.customer,
    "orderOwnerId": mp.personel,
    "orderNote": mp.note
  }

  const { data, isFinished, error }: any = await $axios("/Order/AddOrderPreview", {
    method: "POST",
    data: sendpool,
  }).catch((err: any) => {
    dialog.value.loading = false;
    toast.error("Sipariş eklenirken hata oluştu");
  });

  if (!data.value.succeeded) {
    toast.error(data.value.message || "Sipariş eklenirken hata oluştu");
  } else {
    toast.success("Sipariş başarıyla eklendi");
    await fetchOrderPreviewList();
    dialog.value.show = false;
  }
  console.log('data is => ', data)

  dialog.value.loading = false;
};

const measurementList: any = ref({
  items: [],
  disabledItems: [],
  loading: false,
  mockOrderItem: {
    "id": "",
    type: 'new',
    "measurementDTO": {
      "id": "",
      "name": "",
      "width": 0,
      "height": 0
    },
    "count": 0,
    "measurementId": ""
  }
});


const fetchMeasurementList = async () => {
  measurementList.value.loading = true
  const { data, error }: any = await $axios("/Meansure", {
    method: "GET",
    params: {
      page: 1,
      size: -1,
    },
  }).catch((err: any) => {
    toast.error(err.message || "Ölçüler getirilirken hata oluştu");
    measurementList.value.loading = false
  });
  if (error.value) {
    toast.error(error.message || "Ölçüler getirilirken hata oluştu");
  } else {
    measurementList.value.items = data.value.data;
  }
  measurementList.value.loading = false
};

const handleDeliver = async (payload: any) => {
  payload.deliverLoading = true
  const result: any = await $axios('/Order/UpdateOrderPreviewCompleted', {
    method: 'PATCH',
    data: {
      id: payload.id,
      isCompleted: !payload.isCompleted
    }
  }).catch((err: any) => {
    toast.error(err.message || "Sipariş teslim edilirken hata oluştu");
    payload.deliverLoading = false
  })

  if (result?.data.value.succeeded) {
    await fetchOrderPreviewList();
    toast.success('Sipariş başarıyla teslim edildi')
  } else {
    toast.error(result?.data.value.message || "Sipariş teslim edilirken hata oluştu");
  }
  payload.deliverLoading = false
}


const toWorkshop: any = ref({
  show: false,
  loading: false,
  title: "Atölyeye Gönder",
  mockUsedFabrics: {
    meterCount: null, // nullable
    ballCount: null, // nullable
    fabricTypeId: ''
  },
  mockOrderItemWorkshops: {
    fromOrderItemWorkshopId: null, // nullable
    orderItemsId: '',
    count: 0,
    meansurementId: ''
  },
  mockOrderRequests: {
    price: null, // nullable
    fromWorkShopId: null, // nullable
    toWorkShopId: '',
    fromToWorkshopOrderId: null, // nullable
    orderId: '',
    orderItemWorkshops: [],
    usedFabrics: [] // empty arrays is possible
  },
  item: {
    orderOwnerId: "",
    situationId: "",
    toWorkshopOrderRequests: []
  },
  modelpool: {
    orderOwnerId: "",
    situationId: "",
    toWorkshopOrderRequests: []
  },
  showDialog: (payload: any) => {
    toWorkshop.value.item = payload.item
    toWorkshop.value.show = true
    console.log('show toWorkshop dialog is => ', payload.item)
    toWorkshop.value.modelpool.orderOwnerId = payload.item.ownerId
    toWorkshop.value.modelpool.toWorkshopOrderRequests = [cloneDeep(toWorkshop.value.mockOrderRequests)]
  },
  save: async (payload: any) => {
    toWorkshop.value.loading = true
    console.log('toWorkshop dialog is => ', toWorkshop.value.modelpool)
    if (!toWorkshop.value.modelpool.orderOwnerId) {
      toWorkshop.value.loading = false
      toast.error("Personel seçimi yapmalısınız")
      return
    }
    if (!toWorkshop.value.modelpool.situationId) {
      toWorkshop.value.loading = false
      toast.error("İstasyon seçimi yapmalısınız")
      return
    }

    const result: any = await $axios('/ToWorkshopOrder/AddToWorkshopOrderPreview', {
      method: 'POST',
      data: toWorkshop.value.modelpool
    }).catch((err: any) => {
      toast.error(err.message || "Atölyeye gönderilirken hata oluştu")
      toWorkshop.value.loading = false
    })

    if (result?.data.value.succeeded) {
      await fetchOrderPreviewList();
      toast.success('Atölyeye başarıyla gönderildi')
      toWorkshop.value.show = false
    } else {
      toast.error(result.data.value.message || "Atölyeye gönderilirken hata oluştu")
    }


    toWorkshop.value.loading = false
  },
  addFabricType: (value: any, type: string, fabricType: any) => {
    console.log('value is => ', value, type, fabricType)
    console.log('before modelpool', toWorkshop.value.modelpool)


    if (toWorkshop.value.modelpool.toWorkshopOrderRequests.length === 0) {
      toWorkshop.value.modelpool.toWorkshopOrderRequests.push(cloneDeep(toWorkshop.value.mockOrderRequests))
    }

    const findIndex = toWorkshop.value.modelpool.toWorkshopOrderRequests[0].usedFabrics?.findIndex((x: any) => x.fabricTypeId === fabricType.id) || null
    if (findIndex === -1) {
      toWorkshop.value.modelpool.toWorkshopOrderRequests[0].usedFabrics.push({
        meterCount: 0,
        ballCount: 0,
        fabricTypeId: fabricType.id
      })
    }
    const findIndex2 = toWorkshop.value.modelpool.toWorkshopOrderRequests[0].usedFabrics?.findIndex((x: any) => x.fabricTypeId === fabricType.id)
    if (type === 'meter') {
      toWorkshop.value.modelpool.toWorkshopOrderRequests[0].usedFabrics[findIndex2].meterCount = value > fabricType.stockMeterCount ? fabricType.stockMeterCount : value
      fabricType.tempMeter = value > fabricType.stockMeterCount ? fabricType.stockMeterCount : value
    } else {
      toWorkshop.value.modelpool.toWorkshopOrderRequests[0].usedFabrics[findIndex2].ballCount = value > fabricType.stockBallCount ? fabricType.stockBallCount : value
      fabricType.tempBall = value > fabricType.stockBallCount ? fabricType.stockBallCount : value
    }
    console.log('mooodelpool', toWorkshop.value.modelpool)
  },
  addOrderItem: (value: any, orderItem: any) => {
    console.log('value is => ', value, orderItem)
    console.log('before modelpool', toWorkshop.value.modelpool)
    if (toWorkshop.value.modelpool.toWorkshopOrderRequests.length === 0) {
      toWorkshop.value.modelpool.toWorkshopOrderRequests.push(cloneDeep(toWorkshop.value.mockOrderRequests))
    }

    const availableCount = orderItem.count - orderItem.countInWorkshop

    const findIndex = toWorkshop.value.modelpool.toWorkshopOrderRequests[0].orderItemWorkshops?.findIndex((x: any) => x.meansurementId === orderItem.measurementDTO.id) || null
    if (findIndex === -1) {
      toWorkshop.value.modelpool.toWorkshopOrderRequests[0].orderItemWorkshops.push({
        fromOrderItemWorkshopId: null,
        orderItemsId: orderItem.id,
        count: 0,
        meansurementId: orderItem.measurementDTO.id
      })
    }
    const findIndex2 = toWorkshop.value.modelpool.toWorkshopOrderRequests[0].orderItemWorkshops?.findIndex((x: any) => x.meansurementId === orderItem.measurementDTO.id)
    toWorkshop.value.modelpool.toWorkshopOrderRequests[0].orderItemWorkshops[findIndex2].count = value > availableCount ? availableCount : value
    orderItem.tempCount = value > availableCount ? availableCount : value
    console.log('mooodelpool orderITEMMMM', toWorkshop.value.modelpool)
  },
})

const fetchStationList = async () => {
  station.value.loading = true;
  const { data, error }: any = await $axios("/Parameters/GetSituation", {
    method: "GET",
    data: { size: -1 },
  }).catch((error: any) => {
    toast.error(error.message || "Departmanlar getirilirken hata oluştu");
  })
  if (error.value) {
    toast.error(error.message || "Departmanlar getirilirken hata oluştu");
  } else {
    station.value.list = cloneDeep(data.value?.data).filter((item: any) => item.name !== "Kapitone");
  }
  station.value.loading = false;
};

const workshop = ref({
  data: null,
  list: [],
  loading: false,
  getWorkshopList: async (stationId: any) => {
    workshop.value.loading = true;
    console.log('getWorkshop list is => ', stationId)
    toWorkshop.value.modelpool.situationId = stationId
    const { data, error }: any = await $axios("/Workshop/GetWorkshops", {
      method: "GET",
      params: { size: -1, situationId: stationId },
    });
    if (error.value) {
      toast.error(error.message || "Atölyeler getirilirken hata oluştu");
    } else {
      workshop.value.list = data.value?.data;
    }
    workshop.value.loading = false;
  },
  setWorkshop: (workshopId: any) => {
    if (toWorkshop.value.modelpool.toWorkshopOrderRequests.length === 0) {
      toWorkshop.value.modelpool.toWorkshopOrderRequests.push(cloneDeep(toWorkshop.value.mockOrderRequests))
    }
    toWorkshop.value.modelpool.toWorkshopOrderRequests[0].toWorkShopId = workshopId
    toWorkshop.value.modelpool.toWorkshopOrderRequests[0].orderId = toWorkshop.value.item.id
    console.log('setWorkshop modelpool', toWorkshop.value.modelpool)
    console.log('setWorkshop', toWorkshop.value.item)
  }
});

const handleExportToPDF = async (exportType: 'all' | 'selected' = 'all', item?: any, otherType?: 'firstChild' | 'secondChild', showExpanded?: boolean) => {
  const exportItems = exportType === 'selected'
    ? (otherType !== 'firstChild' ? [item] : item)
    : search.value.list

  console.log('exportItems is => ', exportItems)

  let columnMappings = [
    { key: 'code', label: 'Önizleme Kodu' },
    { key: 'orderResponseDTOs', label: 'Personel', formatter: (item: any) => [...new Set(item?.map((x: any) => x?.ownerName).filter(Boolean))].join(', ') },
    { key: 'orderResponseDTOs', label: 'Müşteri', formatter: (item: any) => [...new Set(item?.map((x: any) => x?.customerName).filter(Boolean))].join(', ') },
    { key: 'orderResponseDTOs', label: 'Set', formatter: (item: any) => [...new Set(item?.map((x: any) => x?.setFabricName).filter(Boolean))].join(', ') },
    // { key: 'orderResponseDTOs', label: 'Ürün', formatter: (item: any) => [...new Set(item.fabricTypeDtos.map((x: any) => `${x?.code}|${x.name} (${x.color.name})`).filter(Boolean))].join(', ') },
    { key: 'orderResponseDTOs', label: 'Ürün', formatter: (item: any) => {
        const groupedFabricTypes = item?.reduce((acc: any, x: any) => {
            x.fabricTypeDtos.forEach((y: any) => {
                const key = `${y?.code} | ${y.name}`;
                if (!acc[key]) {
                    acc[key] = {};
                }
                if (!acc[key][y.color.name]) {
                    acc[key][y.color.name] = 1;
                } else {
                    acc[key][y.color.name]++;
                }
            });
            return acc;
        }, {});

        return Object.entries(groupedFabricTypes)
            .map(([fabricType, colors]:any) =>
                `${fabricType} (${Object.entries(colors)
                    // .map(([colorName, count]) => `${colorName}: ${count}`)
                    .map(([colorName, count]) => `${colorName}`)
                    .join(', ')})`
            )
            .join(', ');
    }},
    { key: 'orderResponseDTOs', label: 'Toplam Sipariş Adedi', formatter: (item: any) => item?.reduce((acc: number, x: any) => acc + x.totalOrderItemsCount, 0), width: 30 },
    { key: 'orderResponseDTOs', label: 'İşlemdeki Toplam Sipariş Adedi', formatter: (item: any) => item?.reduce((acc: number, x: any) => acc + x.totalOrderItemsInWorkshopProcessCount, 0), width: 30 },
    { key: 'orderResponseDTOs', label: 'Sipariş Notu', formatter: (item: any) => [...new Set(item?.map((x: any) => x.orderNotes).filter(Boolean))].join(', '), width: 30 }
    // { key: 'totalOrderItemsCount', label: 'Sipariş Adedi' },
    // { key: 'totalOrderItemsInWorkshopProcessCount', label: 'İşlemdeki Sipariş Adedi' },
    // { key: 'orderNotes', label: 'Sipariş Notu' }
  ]

  if (otherType === 'firstChild') {
    columnMappings = [
      { key: 'previewCode', label: 'Önizleme Kodu' },
      { key: 'ownerName', label: 'Personel' },
      { key: 'customerName', label: 'Müşteri' },
      { key: 'setFabricName', label: 'Set' },
      { key: 'fabricTypeDtos', label: 'Ürün', formatter: (item: any) => {
        return item.map((x: any) => `${x.name} (${x.color.name})`).join(', ')
      } },
      { key: 'totalOrderItemsCount', label: 'Sipariş Adedi', formatter: (item: number) => item, width: 30 },
      { key: 'totalOrderItemsInWorkshopProcessCount', label: 'İşlemdeki Sipariş Adedi', formatter: (item: number) => item, width: 30 },
      { key: 'orderNotes', label: 'Sipariş Notu', formatter: (item: string) => item, width: 30 }
    ]
  } else if (otherType === 'secondChild') {
    columnMappings = [
      { key: 'orderNumber', label: 'Sipariş Numarası' },
      { key: 'ownerName', label: 'Personel' },
      { key: 'customerName', label: 'Müşteri' },
      { key: 'setFabricName', label: 'Set' },
      { key: 'fabricTypeDtos', label: 'Ürün', formatter: (item: any) => {
        return item.map((x: any) => `${x.name} (${x.color.name})`).join(', ')
      } },
      { key: 'totalOrderItemsCount', label: 'Sipariş Adedi', formatter: (item: number) => item, width: 30 },
      { key: 'totalOrderItemsInWorkshopProcessCount', label: 'İşlemdeki Sipariş Adedi', formatter: (item: number) => item, width: 30 },
      { key: 'orderNotes', label: 'Sipariş Notu', formatter: (item: string) => item, width: 30 }
    ]
  }

  let expandedColumnMappings = [
    { key: 'code', label: 'Önizleme Kodu' },
    { key: 'ownerName', label: 'Personel'}
  ]

  let expandedDetails = showExpanded ? exportItems.flatMap((item: any) => (item.orderItemWorkshopGroupByOrder)) : []

  if(otherType === 'secondChild' && showExpanded) {
    expandedColumnMappings = [
      { key: 'measurementDTO.name', label: 'Ölçü Adı' },
      { key: 'measurementDTO.width', label: 'Genişlik' },
      { key: 'measurementDTO.height', label: 'Yükseklik' },
      { key: 'count', label: 'Adet' }
    ]
    expandedDetails = exportItems.flatMap((item: any) => {
      console.log('item is => ', item)
      return item?.orderItemsDto || []
    })
    console.log('expandedDetails is => ', expandedDetails)
  }

  exportToPDF(exportItems, undefined, exportType, columnMappings, expandedColumnMappings, expandedDetails)
}

const handleExportToExcel = async (exportType: 'all' | 'selected' = 'all', item?: any, otherType?: 'firstChild' | 'secondChild', showExpanded?: boolean) => {
    const exportItems:any = exportType === 'selected'
        ? (otherType !== 'firstChild' ? [item] : item)
        : search.value.list

    let columnMappings:any = [
        { key: 'code', label: 'Önizleme Kodu' },
        { key: 'orderResponseDTOs', label: 'Personel', formatter: (item: any) => [...new Set(item.map((x: any) => x.ownerName).filter(Boolean))].join(', ') },
        { key: 'orderResponseDTOs', label: 'Müşteri', formatter: (item: any) => [...new Set(item.map((x: any) => x.customerName).filter(Boolean))].join(', ') },
        { key: 'orderResponseDTOs', label: 'Set', formatter: (item: any) => [...new Set(item.map((x: any) => x.setFabricName).filter(Boolean))].join(', ') },
        {
            key: 'orderResponseDTOs',
            label: 'Ürün',
            formatter: (item: any) => {
                const groupedFabricTypes = item.reduce((acc: any, x: any) => {
                    x.fabricTypeDtos.forEach((y: any) => {
                        const key = `${y?.code} | ${y.name}`;
                        if (!acc[key]) {
                            acc[key] = {};
                        }
                        if (!acc[key][y.color.name]) {
                            acc[key][y.color.name] = 1;
                        } else {
                            acc[key][y.color.name]++;
                        }
                    });
                    return acc;
                }, {});

                return Object.entries(groupedFabricTypes)
                    .map(([fabricType, colors]:any) =>
                        `${fabricType} (${Object.entries(colors)
                            .map(([colorName, count]) => `${colorName}`)
                            .join(', ')})`
                    )
                    .join(', ');
            }
        },
        { key: 'orderResponseDTOs', label: 'Toplam Sipariş Adedi', formatter: (item: any) => item.reduce((acc: number, x: any) => acc + x.totalOrderItemsCount, 0), width: 30 },
        { key: 'orderResponseDTOs', label: 'İşlemdeki Toplam Sipariş Adedi', formatter: (item: any) => item.reduce((acc: number, x: any) => acc + x.totalOrderItemsInWorkshopProcessCount, 0), width: 30 },
        { key: 'orderResponseDTOs', label: 'Sipariş Notu', formatter: (item: any) => [...new Set(item.map((x: any) => x.orderNotes).filter(Boolean))].join(', '), width: 30 }
    ]

    if (otherType === 'firstChild') {
        columnMappings = [
            { key: 'previewCode', label: 'Önizleme Kodu' },
            { key: 'ownerName', label: 'Personel' },
            { key: 'customerName', label: 'Müşteri' },
            { key: 'setFabricName', label: 'Set' },
            {
                key: 'fabricTypeDtos',
                label: 'Ürün',
                formatter: (item: any) => item.map((x: any) => `${x.name} (${x.color.name})`).join(', ')
            },
            { key: 'totalOrderItemsCount', label: 'Sipariş Adedi', width: 30 },
            { key: 'totalOrderItemsInWorkshopProcessCount', label: 'İşlemdeki Sipariş Adedi', width: 30 },
            { key: 'orderNotes', label: 'Sipariş Notu', width: 30 }
        ]
    } else if (otherType === 'secondChild') {
        columnMappings = [
            { key: 'orderNumber', label: 'Sipariş Numarası' },
            { key: 'ownerName', label: 'Personel' },
            { key: 'customerName', label: 'Müşteri' },
            { key: 'setFabricName', label: 'Set' },
            {
                key: 'fabricTypeDtos',
                label: 'Ürün',
                formatter: (item: any) => item.map((x: any) => `${x.name} (${x.color.name})`).join(', ')
            },
            { key: 'totalOrderItemsCount', label: 'Sipariş Adedi', width: 30 },
            { key: 'totalOrderItemsInWorkshopProcessCount', label: 'İşlemdeki Sipariş Adedi', width: 30 },
            { key: 'orderNotes', label: 'Sipariş Notu', width: 30 }
        ]
    }

    let expandedColumnMappings = [
        { key: 'code', label: 'Önizleme Kodu' },
        { key: 'ownerName', label: 'Personel'}
    ]

    let expandedDetails = showExpanded ? exportItems.flatMap((item: any) => (item.orderItemWorkshopGroupByOrder)) : []

    if(otherType === 'secondChild' && showExpanded) {
        expandedColumnMappings = [
            { key: 'measurementDTO.name', label: 'Ölçü Adı' },
            { key: 'measurementDTO.width', label: 'Genişlik' },
            { key: 'measurementDTO.height', label: 'Yükseklik' },
            { key: 'count', label: 'Adet' }
        ]
        expandedDetails = exportItems.flatMap((item: any) => item?.orderItemsDto || [])
    }

    await exportToExcel(exportItems, expandedDetails, exportType, columnMappings, expandedColumnMappings)
}

const fetchSetList = async (): Promise<void> => {
    const { data }: any = (await $axios("/SetFabricModel", {
        method: "GET",
        params: {
            page: 1,
            size: -1
        },
    }).catch((err: any) => {
        toast.error(err.message || "Set listesi getirilirken hata oluştu");
    })) as any;
    if (!data.value.succeeded) {
        toast.error(data.value.message || "Set listesi getirilirken hata oluştu");
    } else {
        setList.value.list = data.value.data;
    }

    setList.value.loading = false;
};

const fetchStorageList = async (
  queryParams: object | undefined = {}
): Promise<void> => {
  storageList.value.loading = true
  const { data }: any = (await $axios("/Storage/GetStorage", {
    method: "GET",
    params: {
      page: tableOptions.value.page,
      size: tableOptions.value.itemsPerPage,
      ...queryParams,
    },
  }).catch((err: any) => {
    toast.error(err?.response?.data?.message || err?.data?.message || err.message || "Depo getirilirken hata oluştu");
  })) as any;
  if (!data.value.succeeded) {
    toast.error(data.value.message || "Depo getirilirken hata oluştu");
  } else {
    storageList.value.list = data.value?.data
  }

  storageList.value.loading = false
};

onMounted(async () => {
  loading.value.page = true;
  await fetchOrderPreviewList();
  await fetchMeasurementList();
  await fetchStationList()
  await fetchSetList()
  await fetchStorageList()

  loading.value.page = false;
  loading.value.table = false;
});
</script>

<style scoped>
.btn-clear-filter {}
</style>

<style>
.page-order_preview_management-preview .v-expansion-panel .v-expansion-panel-text__wrapper {
  padding: 0;
  padding-inline: 0.25rem;
  margin: 0;
}

.v-input__details {
  padding-left: 2px !important;
}

.page-order_preview_management-preview .v-expansion-panel {
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  box-shadow: 0 0 5px rgba(var(--v-theme-primary), 0.08);
  padding-bottom: 0.25rem;
}
</style>
