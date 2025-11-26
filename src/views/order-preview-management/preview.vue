<template>
	<div class="page-order_preview_management-preview">
		<v-progress-linear v-if="loading.page" indeterminate color="primary" />
		<v-toolbar flat color="white">
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
				clearable></v-text-field>
			<v-divider vertical class="mx-3 my-5"></v-divider> -->

			<div class="position-relative d-flex align-center pa-2 rounded border-primary" :class="[{ 'bg-primary-opacity-1 border-1': search.filtered }]">
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
			<v-btn color="primary" variant="flat" @click="handleCreateCustomer">Yeni Ekle</v-btn>
			<v-btn color="orange" variant="tonal" @click="handleExportToPDF('all')" class="mr-2 ml-2">
				<v-icon left>mdi-file-pdf-box</v-icon>
				PDF
			</v-btn>
			<v-btn color="green" variant="tonal" class="mr-2" @click="handleExportToExcel('all')">
				<v-icon left>mdi-file-excel</v-icon>
				Excel
			</v-btn>
		</v-toolbar>

		<v-expansion-panels v-model="masterOrderAccordion.shown" class="w-100 d-block">
			<template v-for="masterOrder of search.list">
				<div>
					<v-expansion-panel class="w-100 mb-3" elevation="0">
						<template #title>
							<div class="d-flex align-center justify-space-between w-100 mx-3">
								<div>Önizleme Kodu: {{ masterOrder.code }}</div>
								<div>
									<v-tooltip text="Sipariş Ekle" location="top" c>
										<template v-slot:activator="{ props }">
											<v-btn v-bind="props" color="success" variant="tonal" size="small" @click="handleAddOrder(masterOrder)" class="mr-2"
												><v-icon>mdi-plus-circle-outline</v-icon></v-btn
											>
										</template>
									</v-tooltip>
									<v-tooltip text="Sil" location="top">
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
												@click="handleExportToPDF('selected', masterOrder.orderResponseDTOs.map((x: any) =>  ({...x, previewCode: masterOrder.code})), 'firstChild')"
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
												@click="handleExportToExcel('selected', masterOrder.orderResponseDTOs.map((x: any) => ({...x, previewCode: masterOrder.code})), 'firstChild')"
												><v-icon>mdi-file-excel</v-icon></v-btn
											>
										</template>
									</v-tooltip>
								</div>
							</div>
						</template>
						<template #text>
							<OTTable
								:key="masterOrder.id"
								:headers="headers"
								:items="masterOrder.orderResponseDTOs"
								:items-per-page="tableOptions.itemsPerPage"
								:items-per-page-options="tableOptions.itemsPerPageOptions"
								:items-per-page-text="tableOptions.itemsPerPageText"
								:items-per-page-all="tableOptions.itemsPerPageAll"
								:page-text="tableOptions.pageText"
								:total-count="tableOptions.totalCount"
								:loading="loading.table"
								:hide-default-footer="true"
								disable-footer
								:group-by="[{key: 'setFabricName', order:'asc'}]"
								@edit="editItem"
								@edit:measurement="editMeasurement.handleShow"
								@delete="confirm.handlerDelete"
								@page:update="handlePageUpdate"
								@deliver="handleDeliver"
								@items-per-page:update="handlePageUpdate"
								@send:toWorkshop="toWorkshop.showDialog"
								@export:pdf="handleExportToPDF('selected', $event.item, 'secondChild', true )"
								@export:excel="handleExportToExcel('selected', $event.item, 'secondChild', true)" />
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
		<BtModal
			class="comp-edit_measurement_dialog"
			v-model:show="editMeasurement.show"
			v-model:loading="editMeasurement.loading"
			width="100%"
			max-width="925px"
			hide-footer
			@save="editMeasurement.save(editMeasurement.item.orderItemsDto)">
			<template #title> {{ editMeasurement.title }} </template>
			<template #content>
				<div class="ml-6 mt-3 mb-10">
					<div>
						<v-btn
							color="primary"
							variant="flat"
							elevation="0"
							:disabled="editMeasurement.item.orderItemsDto.length === measurementList.items.length"
							@click="editMeasurement.item.orderItemsDto.push(cloneDeep(measurementList.mockOrderItem))"
							>+</v-btn
						>
					</div>

					<v-row class="w-100 mt-2">
						<v-col cols="12" sm="6" v-for="mItem of editMeasurement.item.orderItemsDto">
							<v-card color="primary" variant="outlined" class="d-flex gap-1 w-100 text-white" elevation="0">
								<v-card-text class="w-100 d-flex gap-1">
									<v-autocomplete
										color="primary"
										class="bg-white"
										style="border-radius: 0.25rem; max-height: 40px;"
										v-model="mItem.measurementDTO.id"
										:items="measurementList.items"
										:loading="measurementList.loading"
										label="Ölçü"
										variant="outlined"
										placeholder="Ölçü Seçininiz"
										density="compact"
										hide-details
										:rules="[rules.required]"
										:item-props="(item: any) => ({ item, title: item.name, disabled: item.disabled })"
										item-value="id"
										:readonly="mItem.type !== 'new'"
										no-data-text="Ölçü listesi bulunamadı"
										@update:model-value="handleDisableMeasurements()" />
									<v-text-field
										density="compact"
										variant="outlined"
										v-model="mItem.count"
										placeholder="Adet"
										max-width="100px"
										class="bg-white"
										style="border-radius: 0.25rem;"
										:readonly="mItem.type !== 'new'"
										:disabled="measurementList.loading"
										hide-details="auto" />
									<v-btn
										v-if="mItem.type === 'new'"
										color="success"
										elevation="0"
										variant="tonal"
										height="40px"
										size="small"
										class="bg-white"
										style="border-radius: 0.25rem;"
										@click="editMeasurement.save(mItem)">
										<v-icon>mdi-content-save-outline</v-icon>
									</v-btn>
									<v-btn
										color="error"
										elevation="0"
										variant="tonal"
										height="40px"
										size="small"
										class="bg-white"
										style="border-radius: 0.25rem;"
										:loading="mItem.loading"
										:disabled="mItem.loading"
										@click="editMeasurement.deleteOrderItem(mItem)">
										<v-icon>mdi-delete-outline</v-icon>
									</v-btn>
								</v-card-text>
							</v-card>
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
									hide-details="auto">
								</VTextField>
								<VTextField
									type="number"
									:value="fabricTypes.tempBall"
									@update:model-value="toWorkshop.addFabricType($event, 'ball', fabricTypes)"
									label="Top"
									density="compact"
									variant="outlined"
									:disabled="toWorkshop.loading"
									hide-details="auto"></VTextField>
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
									:hint="`Siparişte ${orderItem.count - orderItem.countInWorkshop} Adet Mevcut`"
                  :rules="[rules.positiveNumber]"></VTextField>
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
  { title: "Personel", value: "ownerName", align: "start" },
  { title: "Müşteri", value: "customerName", align: "start" },
  { title: "Set", value: "setFabricName", align: "start", minWidth: '150px' },
  { title: "Ürün", value: "fabricModelDto", align: "start", minWidth: '200px' },
  { title: "Kumaş Tipi", value: "fabricTypeDtos", align: "start", minWidth: '250px' },
  { title: "Sipariş Adedi", value: "totalOrderItemsCount", align: "start", minWidth: '130px' },
  { title: "İşlemdeki Sipariş Adedi", value: "totalOrderItemsInWorkshopProcessCount", align: "start", minWidth: '130px' },
  { title: "Siparişi Notu", value: "orderNotes", align: "start", maxWidth: '140px' },

  {
    title: "",
    value: "actions",
    align: "start",
    minWidth: "150px",
    maxWidth: "150px",
    fixed: true,
  },
  {
    title: "",
    value: "exportColumn",
    align: "start",
    minWidth: "150px",
    maxWidth: "150px",
    fixed: true,
  }
]);
const station = ref({
  data: null,
  list: [],
  loading: false
});

const list = ref([]);

const loading = ref({
  table: true,
  page: true,
  orderItemDelete: false,
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
        console.log('save item is => ', item)
        deleteConfirm.value.loading = true
        const result: any = await $axios('/Order/DeleteMasterOrder', {
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
  handleShow: (payload: any) => {
    editMeasurement.value.item = { ...payload.item, orderItemsDto: payload.item.orderItemsDto.map((x: any) => ({ ...x, loading: false })) };
    setTimeout(async () => {
      await handleDisableMeasurements();
      editMeasurement.value.show = true;
    }, 0);
  },
  save: async (payload: any) => {
    const isErrors = payload.measurementDTO.id === "" || payload.count === 0 || !payload.count || !editMeasurement.value.item.id;

    if (isErrors) {
      toast.error("Ölçü ve adet seçimi yapmalısınız", {
        autoClose: 1000
      });
      return;
    }

    const sendpool: any = {
      count: payload.count,
      measurementId: payload.measurementDTO.id,
      orderId: editMeasurement.value.item.id
    }
    const result: any = await $axios('/Order/AddOrderItem', {
      method: 'POST',
      data: sendpool
    }).catch((err: any) => {
      toast.error(err.message || "Ölçü eklenirken hata oluştu");
    })

    if (result?.data.value.succeeded) {
      payload.type = 'old'
      payload.id = result.data.value.data.id
      payload.measurementId = result.data.value.data.measurementId

      await fetchOrderPreviewList();

      toast.success('Ölçü başarıyla eklendi', {
        autoClose: 1000
      })
    } else {
      toast.error(result?.data.value.message || "Ölçü eklenirken hata oluştu", {
        autoClose: 1000
      });
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

const dialog:any = ref({
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
  handler: async (type: string) => {
    switch (type) {
      case "save": {
        confirm.value.loading = true;
        const isSuccess = await deleteItem(confirm.value.item);
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
    console.log("iterm is => ", item);
    confirm.value.item = item;
    confirm.value.show = true;
    confirm.value.type = "error";

    confirm.value.title = "Sipariş Sil!";
    confirm.value.body = `
          <p>
            <strong>${item.item.ownerName}</strong> personelinin <strong>${item.item.customerName}</strong> müşterili siparişini silmek istediğinize emin misiniz?
          </p>
        `;
  },
  handlerDelete: (item: any) => {
    confirm.value.handlerShow(item);
  },
});

const tableOptions = ref({
  itemsPerPageText: "Sayfa başına satır:",
  itemsPerPageAll: "Hepsi",
  pageText: "Toplam Kayıt: {2}",
  noDataText: "Kayıt bulunamadı",
  itemsPerPageOptions: [10, 15, 20, 25, 30],
  itemsPerPage: 999999,
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
      ).map((x: any) => x.orderResponseDTOs.map((y: any) => ({ ...y, deliverLoading: false })));
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

  await fetchOrderPreviewList(modelpool)
  search.value.loading.filter = false;
};
const handleResetFilter = async () => {
  search.value.filtered = false;
  search.value.startDate = null
  search.value.endDate = null

  loading.value.table = true
  await fetchOrderPreviewList();
  loading.value.table = false
};

const handlePageUpdate = async (page: number) => {
  tableOptions.value.page = page;
  await fetchOrderPreviewList();
};

const fetchOrderPreviewList = async (
  queryParams: object | undefined = {}
): Promise<void> => {
  const { data }: any = (await $axios("/Order/GetAllOrderPreviews", {
    method: "GET",
    params: {
      page: tableOptions.value.page,
      size: tableOptions.value.itemsPerPage,
      ...queryParams,
    },
  }).catch((err: any) => {
    console.log("err is => ", err);
    toast.error(err.message || "Müşteriler getirilirken hata oluştu");
  })) as any;
  if (!data.value.succeeded) {
    console.log("data.value", data.value);
    toast.error(data.value.message || "Müşteriler getirilirken hata oluştu");
  } else {
    list.value = data.value?.data;
    tableOptions.value.totalCount = data.value?.totalCount;
    // tableOptions.value.pageText = `Toplam Kayıt: ${data.value?.totalCount}`;
    search.value.list = list.value;
    search.value.value = "";
  }
};

const handleCreateCustomer = () => {
  dialog.value.show = true;
  dialog.value.title = "Sipariş Oluştur";
  dialog.value.type = "new";
  model.value = {
    name: "",
    telephone: "",
    address: "",
    note: "",
  };
};

const editItem = (item: any) => {
  dialog.value.item = item;
  dialog.value.show = true;
  dialog.value.title = "Sipariş Düzenle";
  dialog.value.type = "edit";
};

const deleteItem = async (item: any) => {
  const { item: targetItem } = item
  loading.value.table = true;

  const url = "/Order/DeleteOrderPreview";

  const sendpool = { id: targetItem.id };

  const response: any = await $axios(url, {
    method: "DELETE",
    data: sendpool,
  }).catch((err: any) => {
    loading.value.table = false;
    confirm.value.loading = false;
    toast.error("Sipariş silinirken hata oluştu");
  });

  if (!response) return false;

  const { data, isFinished }: any = response;

  if (!data.value?.succeeded) {
    loading.value.table = false;
    toast.error(data.value.message || "Sipariş silinirken hata oluştu");
    return false;
  } else {
    toast.success("Sipariş başarıyla silindi");
    await fetchOrderPreviewList();
  }

  loading.value.table = false;
  return true;
};

const handleSave = async (mp: any) => {
  console.log('saved! modelpool is => ', mp)


  if (dialog.value.type !== 'addOrder' && !mp.personel) {
    dialog.value.loading = false;
    toast.error("Personel seçimi yapmalısınız");
    return;
  }

  if (dialog.value.type !== 'addOrder' && !mp.customer) {
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
  if (dialog.value.type === 'addOrder') {
    const sendpool = {
      "setFabricModelOrders": mp.sets.map((s: any) => {
        return {
          setFabricModelId: s.setId,
          count: Number(s.count),
          orderNote: ''
        }
      }),
      "fabricModelOrders": mp.orderList.map((o: any) => {
        return {
          fabricModelId: o.fabricModel.id,
          fabricTypeIds: o.fabricTypes.map((x: any) => x.id),
          orderItemParams: o.measurements.map((m: any) => ({
            measurementId: m.measurementId,
            count: Number(m.count)
          }))
        }
      }),
      "orderOwnerId": dialog.value.item?.orderResponseDTOs?.[0]?.ownerId,
      "masterOrderId": dialog.value.item?.masterOrderId || null
    }

    const { data, isFinished, error }: any = await $axios("/Order/UpdateMasterOrder", {
      method: "PUT",
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

  } else {

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
  }


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

const handleDisableMeasurements = () => {
  const mItem = measurementList.value.items
  console.log('mItem', mItem)
  // measurementList.value.disabledItems = measurementList.value.items?.map((item: any) => {
  //   console.log('item is => ', item)
  //   item.disabled = mItem.every((x: any) => editMeasurement.value.item.orderItemsDto.some((y: any) => y.measurementDTO.id !== x.id))
  //   return item;
  // });
  // measurementList.value.disabledItems = measurementList.value.items.map((item: any) => {
  //   console.log('item is => ', item)
  //   item.disabled = mItem.every((x: any) => editMeasurement.value.item.orderItemsDto.some((y: any) => y.measurementDTO.id !== x.id))
  //   return item;
  // });

}

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
      toWorkshop.value.modelpool.toWorkshopOrderRequests[0].usedFabrics[findIndex2].meterCount = value
      fabricType.tempMeter = value
    } else {
      toWorkshop.value.modelpool.toWorkshopOrderRequests[0].usedFabrics[findIndex2].ballCount = value
      fabricType.tempBall = value
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
    toWorkshop.value.modelpool.toWorkshopOrderRequests[0].orderItemWorkshops[findIndex2].count = value
    orderItem.tempCount = value
    console.log('mooodelpool orderITEMMMM', toWorkshop.value.modelpool)
  },
})

const fetchStationList = async () => {
  station.value.loading = true;
  const { data, error }: any = await $axios("/Parameters/GetSituation", {
    method: "GET",
    data: { size: -1 },
  });
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
    { key: 'orderResponseDTOs', label: 'Personel', formatter: (item: any) => [...new Set(item.map((x: any) => x.ownerName).filter(Boolean))].join(', ') },
    { key: 'orderResponseDTOs', label: 'Müşteri', formatter: (item: any) => [...new Set(item.map((x: any) => x.customerName).filter(Boolean))].join(', ') },
    { key: 'orderResponseDTOs', label: 'Set', formatter: (item: any) => [...new Set(item.map((x: any) => x.setFabricName).filter(Boolean))].join(', ') },
    // { key: 'orderResponseDTOs', label: 'Ürün', formatter: (item: any) => [...new Set(item.fabricTypeDtos.map((x: any) => `${x?.code}|${x.name} (${x.color.name})`).filter(Boolean))].join(', ') },
    { key: 'orderResponseDTOs', label: 'Ürün', formatter: (item: any) => {
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
                    // .map(([colorName, count]) => `${colorName}: ${count}`)
                    .map(([colorName, count]) => `${colorName}`)
                    .join(', ')})`
            )
            .join(', ');
    }},
    { key: 'orderResponseDTOs', label: 'Toplam Sipariş Adedi', formatter: (item: any) => item.reduce((acc: number, x: any) => acc + x.totalOrderItemsCount, 0), width: 30 },
    { key: 'orderResponseDTOs', label: 'İşlemdeki Toplam Sipariş Adedi', formatter: (item: any) => item.reduce((acc: number, x: any) => acc + x.totalOrderItemsInWorkshopProcessCount, 0), width: 30 },
    { key: 'orderResponseDTOs', label: 'Sipariş Notu', formatter: (item: any) => [...new Set(item.map((x: any) => x.orderNotes).filter(Boolean))].join(', '), width: 30 }
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


const handleAddOrder = async (item: any) => {

  dialog.value.title = "Sipariş Ekle";
  dialog.value.type = "addOrder";
  dialog.value.item = item;
  model.value = {
    name: "",
    telephone: "",
    address: "",
    note: "",
  };
  console.log('dialog.value.item is => ', dialog.value.item)

  dialog.value.show = true;
}



onMounted(async () => {
  loading.value.page = true;
  await fetchOrderPreviewList();
  await fetchMeasurementList();
  await fetchStationList()

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
