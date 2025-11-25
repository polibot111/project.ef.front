<template>
	<div class="page-set_management">
		<v-progress-linear v-if="loading.page" indeterminate color="primary" />
		<v-data-table-server
			style="height: calc(100dvh - 90px); max-width: 100"
			align="start"
			v-model:items-per-page="tableOptions.itemsPerPage"
			v-model:page="tableOptions.page"
			:items-per-page-options="tableOptions.itemsPerPageOptions"
			:items-per-page-text="tableOptions.itemsPerPageText"
			:items-per-page-all="tableOptions.itemsPerPageAll"
			:items-length="tableOptions.totalCount"
			:page-text="tableOptions.pageText"
			:headers="headers"
			:items="search.list"
			show-current-page
			show-expand
			expand-on-click
			@update:page="handlePageUpdate"
			@update:items-per-page="handlePageUpdate"
			v-model:expanded.sync="expandedRows"
			@update:expanded="handleGetRowDetails">
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

					<v-spacer />
					<v-btn color="primary" variant="flat" @click="handleCreateFabricSet">Yeni Ekle</v-btn>
				</v-toolbar>
			</template>
			<template v-slot:item.actions="{ item, index }">
				<!-- <v-icon class="me-2" color="primary" size="small" @click="editItem(item)"> mdi-pencil-box-outline </v-icon> -->

				<v-icon size="small" color="error" @click="confirm.handlerShow(item)"> mdi-delete-outline</v-icon>
			</template>
			<template v-slot:no-data>
				<p class="text-subtitle-1 mt-10 mb-3">Kayıt bulunamadı</p>
			</template>
			<template
				v-slot:expanded-row="{
        columns,
        item: expandedItem,
        isExpanded,
        index: expandedIndex,
      }: any">
				<tr style="background: var(--bt-expanded-row-bg)">
					<td :colspan="columns.length" class="py-4">
						<v-expansion-panels size="small" elevation="0" multiple>
							<SetItem
								v-for="(
                  itemDetail, itemDetailIndex
                ) in expandedItem.fabricSetModelDTOs"
								:key="itemDetailIndex"
								v-model:count="itemDetail.count"
								v-model:fabric-model-id="itemDetail.fabricModel.id"
								v-model:fabric-model-name="itemDetail.fabricModel.name"
								v-model:fabric-type-id="itemDetail.fabricTypeDTOs"
								v-model:measurements="itemDetail.measurements"
								:fabric-models-list.sync="fabricModels.list"
								:fabric-types-list.sync="fabricTypes.list"
								:measurement-list.sync="measurement.list"
								readonly
								@update:measurements="
                  console.log('measurements:update', $event)
                  " />
						</v-expansion-panels>
					</td>
				</tr>
			</template>
		</v-data-table-server>
		<BtModal v-model:show="measurement.show" v-model:loading="measurement.loading" :title="measurement.title" width="50vw" @save="measurement.submit">
			<template #content>
				<v-card-text class="mt-5">
					<v-form ref="staffForm" @submit.prevent>
						<v-row>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="measurement.name"
									label="Ölçü Adı"
									:rules="[rules.required]"
									dense
									variant="outlined"
									hide-details="auto"></v-text-field>
							</v-col>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="measurement.width"
									label="En"
									:rules="[rules.required]"
									dense
									variant="outlined"
									hide-details="auto"></v-text-field>
							</v-col>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="measurement.height"
									label="Boy"
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
		<BtModal v-model:show="dialog.show" v-model:loading="dialog.loading" :title="dialog.title" width="50vw" @save="handleSubmit">
			<template #content>
				<v-card-text class="mt-5">
					<v-form ref="staffForm" @submit.prevent>
						<v-row>
							<v-text-field
								v-model="model.name"
								label="Set Adı"
								:rules="[rules.required]"
								dense
								variant="outlined"
								hide-details="auto"
								class="mb-5" />
							<div class="d-block w-100 mb-5 text-right">
								<v-btn
									color="primary"
									variant="outlined"
									@click="
                  model.itemDetails.unshift(
                    cloneDeep(newMockModel.itemDetails[0])
                  )
                  ">
									<v-icon>mdi-plus</v-icon>
								</v-btn>
							</div>

							<v-expansion-panels
								size="small"
								elevation="0"
								multiple
								color="gray"
								v-model="newOptions.expanded"
								style="max-height: 300px; overflow-y: auto">
								<SetItem
									v-for="(newItem, newItemIndex) in model.itemDetails"
									:key="newItemIndex"
									v-model:count="newItem.count"
									v-model:fabric-model-id="newItem.fabricModel.id"
									v-model:fabric-model-name="newItem.fabricModel.name"
									v-model:fabric-type-id="newItem.fabricTypeDTOs"
									v-model:measurements="newItem.measurements"
									:fabric-models-list.sync="fabricModels.list"
									:fabric-types-list.sync="fabricTypes.list"
									:measurement-list.sync="measurement.list"
									title="Set Parçası"
									color="#dcdde1"
									show-delete
									@refresh:measurementList="fetchMeasurementList"
									@remove="model.itemDetails.splice(newItemIndex, 1); newOptions.expanded = []" />
							</v-expansion-panels>
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
import SetItem from "../../components/fabricSet/SetItem.vue";

const headers: any = ref([
  { title: "Set Adı", value: "name", align: "start" },
  {
    title: "İşlemler",
    value: "actions",
    align: "end",
    minWidth: "120px",
    maxWidth: "120px",
    fixed: true,
  },
]);

const list = ref([]);
const staffForm = ref();
const departmentList = ref([]);
const isEdit = ref(false);
const loading = ref({
  table: true,
  page: true,
});

const newOptions = ref({
  expanded: [0],
});
const model: any = ref({
  id: "",
  name: "",
  itemDetails: [
    {
      count: "0",
      fabricModel: {
        id: "",
        name: "",
      },
      fabricTypeDTOs: [],
      measurements: [],
    },
  ],
});
const newMockModel: any = ref({
  id: "",
  name: "",
  itemDetails: [
    {
      count: "",
      fabricModel: {
        id: null,
        name: "",
      },
      fabricTypeDTOs: [],
      measurements: [],
    },
  ],
});

const fabricTypes = reactive({
  loading: false,
  list: [],
});
const fetchFabricTypes = async () => {
  fabricTypes.loading = true;
  const { data, error }: any = await $axios("/FabricTypes/GetFabricTypes", {
    method: "GET",
    data: { size: -1 },
  });
  if (error.value) {
    toast.error(error.message || "Kumaş tipleri getirilirken hata oluştu");
  } else {
    fabricTypes.list = cloneDeep(data.value?.data);
  }
  fabricTypes.loading = false;
};
await fetchFabricTypes();

const fabricModels = reactive({
  loading: false,
  list: [],
});
const fetchFabricModels = async () => {
  fabricModels.loading = true;
  const { data, error }: any = await $axios("/FabricModel/FabricModelGetAll", {
    method: "GET",
    data: { size: -1 },
  });
  if (error.value) {
    toast.error(error.message || "Kumaş modelleri getirilirken hata oluştu");
  } else {
    fabricModels.list = cloneDeep(data.value?.data);
  }
  fabricModels.loading = false;
};
await fetchFabricModels();

const dialog = ref({
  show: false,
  loading: false,
  title: "Set Oluştur",
  type: "new",
});
const measurement = ref({
  show: false,
  loading: false,
  list: [],
  title: "Ölçü Ekle",
  type: "new",
  name: "",
  width: "",
  height: "",
  submit: async () => {
    measurement.value.loading = true;
    const { data, error }: any = await $axios("/Measurement", {
      method: "POST",
      data: {
        name: measurement.value.name,
        width: measurement.value.width,
        height: measurement.value.height,
      },
    }).catch((err: any) => {
      measurement.value.loading = false;
      toast.error("Ölçü eklenirken hata oluştu");
    });
    if (error.value) {
      toast.error(error.message || "Ölçü eklenirken hata oluştu");
    } else {
      toast.success("Ölçü başarıyla eklendi");
      measurement.value.show = false;
    }
    measurement.value.loading = false;
  },
});

const confirm = ref({
  show: false,
  title: "Set Sil!",
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

    confirm.value.title = "Set Sil!";
    confirm.value.body = `
            <p>
              <strong>${item.name}</strong> isimli seti silmek istediğinize emin misiniz?
            </p>
          `;
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
  totalCount: 0,
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

  await fetchFabricSetList(modelpool)
  search.value.loading.filter = false;
};
const handleResetFilter = async () => {
  search.value.filtered = false;
  search.value.startDate = null
  search.value.endDate = null
  await fetchFabricSetList();
};

const handlePageUpdate = async (page: number) => {
  tableOptions.value.page = page;
  await fetchFabricSetList();
};

const fetchFabricSetList = async (
  queryParams: object | undefined = {}
): Promise<void> => {
  const { data }: any = (await $axios("/SetFabricModel", {
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
    search.value.list = list.value;
    search.value.value = "";
  }
};

const fetchDepartmentList = async () => {
  const { data }: any = await $axios("/Department/GetDepartment", {
    method: "GET",
  }).catch((err: any) => {
    toast.error("Departmanlar getirilirken hata oluştu");
  });

  if (!data.value.succeeded) {
    toast.error(data.value.message || "Departmanlar getirilirken hata oluştu");
  } else {
    departmentList.value = data.value.data;
  }
};

const handleCreateFabricSet = () => {
  dialog.value.show = true;
  dialog.value.title = "Set Oluştur";
  dialog.value.type = "new";
  model.value = cloneDeep(newMockModel.value);
};

const handleSubmit = async () => {
  staffForm.value?.validate();
  if (staffForm.value?.isValid) {
    //     {
    //   "count": 0,
    //   "fabricModelId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //   "setFabricModelId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //   "measurements": [
    //     {
    //       "measurementId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //       "fabricSetModelId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    //     }
    //   ],
    //   "fabricTypeIds": [
    //     "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    //   ]
    // }
    console.log("model is => ", model.value);

    const mappedSetModels = await model.value.itemDetails.map((item: any) => {
        return {
          count: item.count,
          fabricModelId: item.fabricModel.id,
          fabricTypeIds: item.fabricTypeDTOs,
          measurements: item.measurements.map((measurement: any) => {
            return measurement.id
          }),
        };
      })
      if (mappedSetModels.length === 0) {
        toast.error("Set içeriği boş olamaz");
        return;
      }


    const sendpool = {
      "name": model.value.name,
      // "fabricSetModels": [
      //   {
      //     "count": 0,
      //     "fabricModelId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      //     "fabricTypeIds": [
      //       "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      //     ],
      //     "measurements": [
      //       "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      //     ]
      //   }
      // ]
      fabricSetModels: mappedSetModels,
    }

    dialog.value.loading = true;
    const url = dialog.value.type === "new" ? "/SetFabricModel" : "/OrderOwner";

    const { data, isFinished, error }: any = await $axios(url, {
      method: dialog.value.type === "new" ? "POST" : "PUT",
      data: sendpool,
    }).catch((err: any) => {
      dialog.value.loading = false;
      toast.error("Set eklenirken hata oluştu");
    });

    dialog.value.loading = false;
    if (!data.value.succeeded) {
      toast.error(data.value.message || "Set eklenirken hata oluştu");
    } else {
      console.log("data is => ", data);
      toast.success("Set başarıyla eklendi");
      await fetchFabricSetList();
      dialog.value.show = false;
    }
  }
};

const editItem = (item: any) => {
  console.log("item is => ", item);
  model.value = {
    ...model.value,
    ...item,
    id: item.id,
  };
  dialog.value.show = true;
  dialog.value.title = "Seti Düzenle";
  dialog.value.type = "edit";
};

const deleteItem = async (item: any) => {
  console.log("item is => ", item);
  loading.value.table = true;

  const url = "/SetFabricModel";

  const sendpool = { id: item.id };

  const response: any = await $axios(url, {
    method: "DELETE",
    data: sendpool,
  }).catch((err: any) => {
    loading.value.table = false;
    confirm.value.loading = false;
    toast.error("Set silinirken hata oluştu");
  });

  if (!response) return false;

  const { data, isFinished }: any = response;

  if (!data.value?.succeeded) {
    loading.value.table = false;
    toast.error(data.value.message || "Set silinirken hata oluştu");
    return false;
  } else {
    toast.success("Set başarıyla silindi");
    await fetchFabricSetList();
  }

  loading.value.table = false;
  return true;
};

const expanded: any = ref({});
const expandedRows = ref([]);

const handleGetRowDetails = async (expandedIds: any) => {
  console.log("expandedIds is => ", expandedIds);
  const newItem: any = Object.values(expandedIds).filter(
    (item: any) => !expanded.value[item]?.value
  );
  // toggle expanded value with expandedIds
  // if newItem is not included in expanded, add it
  // else remove it

  if (newItem.length) {
    expanded.value[newItem[0]] = {
      value: true,
      loaded: false,
      id: newItem[0],
      data: {},
    };
  } else {
    const findDiff = Object.keys(expanded.value).filter(
      (item) => !expandedIds.includes(item)
    );
    delete expanded.value[findDiff[0]];
  }

  for await (const expandedItem of Object.values(expanded.value) as {
    value: boolean;
    loading: boolean;
    loaded: boolean;
    id: number;
    data?: any;
  }[]) {
    if (!expandedItem.loaded) {
      // expandedItem.loading = true;
      // const result = await fetchRowDetails(expandedItem.id);
      // console.log("result is => ", result);
      // if (!result.succeeded) {
      //   toast.error(
      //     result.message || "Satır detayları getirilirken hata oluştu"
      //   );
      //   expandedItem.loaded = false;
      //   expandedItem.loading = false;
      //   return;
      // }
      // expandedItem.data = result.data.length <= 0 ? [] : result.data;
      // expandedItem.loaded = true;
      // expandedItem.loading = false;
    }
  }
};

const fetchRowDetails = async (id: number) => {
  console.log("id is => ", id);

  // const { data }: any = await $axios(
  //   "/FabricCapitoneOrderDeliveredDelivered/GetFabricCapitoneOrderDelivered",
  //   {
  //     method: "GET",
  //     params: {
  //       FabricCapitoneOrderId: id,
  //       size: -1,
  //     },
  //   }
  // ).catch((err: any) => {
  //   toast.error("Kumaş siparişleri getirilirken hata oluştu");
  // });
  // return data.value;
};

const fetchMeasurementList = async () => {
  const { data }: any = (await $axios("/Meansure", {
    method: "GET",
    params: {
      page: tableOptions.value.page,
      size: tableOptions.value.itemsPerPage,
    },
  }).catch((err: any) => {
    toast.error(err.message || "Ölçüler getirilirken hata oluştu");
  })) as any;
  if (!data.value.succeeded) {
    toast.error(data.value.message || "Ölçüler getirilirken hata oluştu");
  } else {
    measurement.value.list = data.value?.data;
    console.log("measurement.value.list", measurement.value.list);
  }
};

onMounted(async () => {
  loading.value.page = true;
  await fetchFabricSetList();
  await fetchDepartmentList();
  await fetchMeasurementList();

  loading.value.page = false;
  loading.value.table = false;
});
</script>

<style>
.page-set_management .v-expansion-panel .v-expansion-panel-title {
  padding: 0.05rem 1rem !important;
  font-size: 14px !important;
  font-weight: 500;
  border: 1px solid var(--bt-border-color) !important;
  border-bottom: 1px solid transparent !important;
}

.page-set_management .v-expansion-panel:last-child .v-expansion-panel-title {
  border-bottom: 1px solid var(--bt-border-color) !important;
}

.page-set_management .v-expansion-panel .v-expansion-panel-title--active {
  border-bottom: 1px solid var(--bt-border-color) !important;
}

.page-set_management .v-expansion-panel-text__wrapper {
  padding: 1rem 1rem !important;
  border: 1px solid var(--bt-border-color) !important;
  border-top: 0 !important;
}
</style>
