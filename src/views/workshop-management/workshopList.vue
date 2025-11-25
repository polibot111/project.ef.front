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
			:page-text="tableOptions.pageText"
			:headers="headers"
			:items="search.list"
			:items-length="tableOptions.totalCount"
			show-current-page
			@update:page="handlePageUpdate"
			@update:items-per-page="handlePageUpdate">
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

					<v-spacer />
					<v-btn color="primary" variant="flat" @click="handleCreateManufacturer">Yeni Ekle</v-btn>
				</v-toolbar>
			</template>
			<template v-slot:item.workshopSituationDTOs="{ item, index }: any">
				<v-chip v-for="(station, index) in item.workshopSituationDTOs" :key="index" color="primary" class="ma-1" size="small">
					{{ station.situationDTO.situationName }}
				</v-chip>
			</template>
			<template v-slot:item.actions="{ item, index }">
				<v-tooltip location="top" text="İstasyonları düzenle">
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" class="me-2" color="info" size="small" @click="stationEdit.handleShow(item)">
							mdi-office-building-cog-outline
						</v-icon>
					</template>
				</v-tooltip>

				<v-tooltip location="top" text="Atöyle Düzenle">
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" class="me-2" color="primary" size="small" @click="editItem(item)"> mdi-pencil-box-outline </v-icon>
					</template>
				</v-tooltip>

				<v-tooltip location="top" text="Atölye Sil">
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" size="small" color="error" @click="confirm.handlerShow(item)"> mdi-delete-outline</v-icon>
					</template>
				</v-tooltip>
			</template>
			<template v-slot:no-data>
				<p class="text-subtitle-1 mt-10 mb-3">Kayıt bulunamadı</p>
			</template>
		</v-data-table-server>
		<BtModal v-model:show="dialog.show" v-model:loading="dialog.loading" :title="dialog.title" width="50vw" @save="handleSubmit">
			<template #content>
				<v-card-text class="mt-5">
					<v-form ref="customerForm" @submit.prevent>
						<v-row>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="model.name"
									label="Atölye Adı"
									:rules="[rules.required]"
									dense
									variant="outlined"
									hide-details="auto"></v-text-field>
							</v-col>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="model.telephone"
									label="Telefonu"
									:rules="[rules.required]"
									dense
									variant="outlined"
									hide-details="auto"></v-text-field>
							</v-col>
							<v-col cols="12" :sm="dialog.type === 'new' ? 6 : 12">
								<v-text-field
									v-model="model.contactPerson"
									label="Yetkili Kişi"
									:rules="[rules.required]"
									dense
									variant="outlined"
									hide-details="auto"></v-text-field>
							</v-col>
							<v-col v-if="dialog.type === 'new'" cols="12" sm="6">
								<v-autocomplete
									v-model="model.stationId"
									:items="station.list"
									label="İstasyon Listesi *"
									variant="outlined"
									placeholder="İstasyon Seçiniz"
									dense
									chips
									multiple
									hide-details="auto"
									:rules="[rules.required]"
									:loading="station.loading"
									:item-props="(item: any) => ({ item, title: item.name })"
									item-value="id"
									no-data-text="İstasyon bulunamadı"
									class="mb-5">
									<template #chip="{ item }">
										<v-chip color="primary" v-text="item.title" variant="flat" class="mr-2"></v-chip>
									</template>
								</v-autocomplete>
							</v-col>

							<v-col cols="12" sm="12">
								<v-textarea v-model="model.adress" label="Adres" dense variant="outlined" hide-details="auto"></v-textarea>
							</v-col>
							<v-col cols="12" sm="12">
								<v-textarea v-model="model.note" label="Atölye Notu" dense variant="outlined" hide-details="auto"></v-textarea>
							</v-col>
						</v-row>
					</v-form>
				</v-card-text>
			</template>
		</BtModal>
		<v-navigation-drawer v-model="stationEdit.show" location="bottom" temporary>
			<v-row>
				<v-col cols="12" sm="2" class="text-left mb-0 pb-0">
					<h3 class="text-h6 text-left">İstasyonlar</h3>
				</v-col>
				<v-col cols="12" sm="10" class="text-left mb-0 pb-0 text-right">
					<v-btn
						color="green"
						@click="stationEdit.modelList.unshift(cloneDeep(stationEdit.mockStation))"
						elevation="0"
						variant="flat"
						class=" text-center"
						>Ekle</v-btn
					>
				</v-col>
			</v-row>

			<v-divider class="my-5" />

			<v-row style=" min-height: 120px; max-height: 200px; overflow-y: auto;">
				<v-col cols="12" sm="4" v-for="(sItem, sIndex) of stationEdit.modelList" :key="sIndex" class="text-left">
					<v-autocomplete
						v-model="sItem.situationId"
						:items="station.filteredList"
						label="İstasyon"
						variant="outlined"
						placeholder="İstasyon Seçiniz"
						hide-details="auto"
						:rules="[rules.required]"
						:loading="station.loading"
						:item-props="(item: any) => ({ item, title: item.name, disabled: item.disabled })"
						item-value="id"
						no-data-text="İstasyon bulunamadı"
						class=""
						density="compact"
						hide-selected
						:readonly="!sItem.new"
						@update:model-value="handleDisableItems">
						<template #append>
							<v-tooltip v-if="sItem.new" location="top" text="Kaydet">
								<template v-slot:activator="{ props }">
									<v-btn
										v-bind="props"
										color="success"
										@click="stationEdit.submit(sItem)"
										elevation="0"
										variant="outlined"
										size="small"
										class="px-0 mr-3"
										height="40px">
										<v-icon size="large">mdi-content-save</v-icon>
									</v-btn>
								</template>
							</v-tooltip>
							<v-tooltip location="top" text="İstasyon Sil">
								<template v-slot:activator="{ props }">
									<v-icon v-bind="props" size="small" color="error" @click="stationEdit.preDelete(sItem)"> mdi-delete-outline</v-icon>
								</template>
							</v-tooltip>
						</template>
					</v-autocomplete>
				</v-col>
			</v-row>
		</v-navigation-drawer>
		<!-- <BtModal v-model:show="stationEdit.show" v-model:loading="stationEdit.loading" :title="stationEdit.title" width="50vw" @save="stationEdit.submit">
			<template #content>
				<v-card-text class="mt-5">
					<v-form ref="customerForm" @submit.prevent>
						<v-row style="max-height: 300px; overflow-y: auto;">
							<v-col cols="12" sm="12">
								<v-btn
									color="green"
									@click="stationEdit.modelList.unshift(cloneDeep(stationEdit.mockStation))"
									elevation="0"
									variant="flat"
									size="large"
									class="text-h6 text-center"
									>+</v-btn
								>
							</v-col>
							<v-col cols="12" sm="12" v-for="(sItem, sIndex) of stationEdit.modelList" :key="sIndex">
								<v-autocomplete
									v-model="sItem.situationId"
									:items="station.list"
									label="İstasyon"
									variant="outlined"
									placeholder="İstasyon Seçiniz"
									dense
									hide-details="auto"
									:rules="[rules.required]"
									:loading="station.loading"
									:item-props="(item: any) => ({ item, title: item.name })"
									item-value="id"
									no-data-text="İstasyon bulunamadı"
									class="">
									<template #append>
										<v-tooltip location="top" text="İstasyon Sil">
											<template v-slot:activator="{ props }">
												<v-icon v-bind="props" size="small" color="error" @click="stationEdit.preDelete(sItem)">
													mdi-delete-outline</v-icon
												>
											</template>
										</v-tooltip>
									</template>
								</v-autocomplete>
							</v-col>
						</v-row>
					</v-form>
				</v-card-text>
			</template>
		</BtModal> -->

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

const headers: any = ref([
  { title: "Atölye Adı", value: "name", align: "start" },
  { title: "İstasyonlar", value: "workshopSituationDTOs", align: "start" }, // istasyon situation
  { title: "Telefon", value: "telephone", align: "start" },
  { title: "Adres", value: "adress", align: "start" },
  { title: "Yetkili Kişi", value: "contactPerson", align: "start" },
  { title: "Not", value: "note", align: "start" },

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
const customerForm = ref();
const loading = ref({
  table: true,
  page: true,
});

const station = ref({
  list: [],
  filteredList: [] as any,
  loading: false,
});
const stationEdit = ref({
  show: false,
  loading: false,
  title: "İstasyonları Düzenle",
  type: "new",
  modelList: [] as any,

  mockStation: {
    situationId: "",
    situtationName: "",
    workshopSituationId: "",
    new: true
  },
  currentRow: null as any,
  handleShow: (item: any) => {
    stationEdit.value.show = true;
    stationEdit.value.title = "İstasyonları Düzenle";
    stationEdit.value.type = "edit";
    stationEdit.value.currentRow = item;
    stationEdit.value.modelList = item.workshopSituationDTOs.map((item: any) => {
      return {
        ...item.situationDTO,
        workshopSituationId: item.workshopSituationId,
        new: false
      };
    });

    station.value.filteredList = station.value.list.map((item: any) => {
      return {
        ...item,
        disabled: stationEdit.value.modelList.some((i: any) => i.situationId === item.id),
      };
    });
  },
  submit: async (sItem: any) => {
    const modelpool = {
      situationId: sItem.situationId,
      workshopId: stationEdit.value.currentRow.id,
      workshopSituationId: stationEdit.value.currentRow.workshopSituationDTOs.find((i: any) => i.workshopId === stationEdit.value.currentRow.id)?.workshopSituationId
    }

    const result = await $axios('/WorkshopSituation/AddWorkshopSituations', {
      method: "POST",
      data: {
        situationId: modelpool.situationId,
        workshopId: modelpool.workshopId,
      },
    }).catch((err: any) => {
      dialog.value.loading = false;
      toast.error("İstasyon eklenirken hata oluştu");
    });

    if (!result) {
      toast.error("İstasyon eklenirken hata oluştu");
    } else {
      toast.success("İstasyon başarıyla eklendi");
      stationEdit.value.modelList = stationEdit.value.modelList.map((i: any) => {
        if (i.situationId === sItem.situationId) {
          return {
            ...i,
            new: false,
          }
        }
        return i;
      });
      station.value.filteredList = station.value.list.map((item: any) => {
        return {
          ...item,
          disabled: stationEdit.value.modelList.some((i: any) => i.situationId === item.id),
        };
      });

      await fetchWorkshopList()

      stationEdit.value.show = false;


    }

  },
  preDelete: (item: any) => {
    const index = stationEdit.value.modelList.findIndex((i: any) => i.situationId === item.situationId);
    if (item.new) {
      stationEdit.value.modelList.splice(index, 1);
      station.value.filteredList = station.value.list.map((item: any) => {
        return {
          ...item,
          disabled: stationEdit.value.modelList.some((i: any) => i.situationId === item.id),
        };
      });
    } else {
      handleRemoveWorkshopStation(item, item, index);

    }
  },

});

const tempItem: any = ref(null)
const handleDisableItems = (value: any) => {
  tempItem.value = cloneDeep(stationEdit.value.currentRow);

  station.value.filteredList = station.value.list.map((item: any) => {
    return {
      ...item,
      disabled: stationEdit.value.modelList.some((i: any) => i.situationId === item.id),
    };
  });
};

const model: any = ref({
  id: "",
  name: null,
  adress: null,
  note: null,
  telephone: null,
  contactPerson: "",
});

const dialog = ref({
  show: false,
  loading: false,
  title: "Atölye Oluştur",
  type: "new",
});

const confirm:any = ref({
  show: false,
  title: "Atölye Sil!",
  body: ``,
  type: "error",
  item: null,
  loading: false,
  confirmType: '',
  handler: async (type: string) => {
    switch (type) {
      case "save": {

        if (confirm.value.confirmType === 'deleteStation') {
          confirm.value.loading = true;

          await deleteStation(confirm.value.item);
          confirm.value.loading = false;
          confirm.value.show = false;
          await fetchWorkshopList();
          stationEdit.value.modelList = stationEdit.value.modelList.filter((i: any) => i.situationId !== confirm.value.item.situationId);
          station.value.filteredList = station.value.list.map((item: any) => {
            return {
              ...item,
              disabled: stationEdit.value.modelList.some((i: any) => i.situationId === item.id),
            };
          });

          return
        }


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
    confirm.value.item = item;
    confirm.value.show = true;
    confirm.value.type = "error";

    confirm.value.title = "Atölye Sil!";
    confirm.value.body = `
        <p>
          <strong>${item.name}</strong> isimli atölyeyi silmek istediğinize emin misiniz?
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
  await fetchWorkshopList({
    startDate: dayjs(search.value.startDate).add(1, "day"),
    endDate: dayjs(search.value.endDate).add(1, "day"),
  });
  search.value.loading.filter = false;
};
const handleResetFilter = async () => {
  search.value.filtered = false;
  await fetchWorkshopList();
};

const handlePageUpdate = async (page: number) => {
  tableOptions.value.page = page;
  await fetchWorkshopList();
};

const fetchWorkshopList = async (
  queryParams: object | undefined = {}
): Promise<void> => {
  const { data }: any = (await $axios("/Workshop/GetWorkshops", {
    method: "GET",
    params: {
      page: tableOptions.value.page,
      size: tableOptions.value.itemsPerPage,
      ...queryParams,
    },
  }).catch((err: any) => {
    toast.error(err.message || "Atölyeler getirilirken hata oluştu");
  })) as any;
  if (!data.value.succeeded) {
    toast.error(data.value.message || "Atölyeler getirilirken hata oluştu");
  } else {
    list.value = data.value?.data;
    tableOptions.value.totalCount = data.value?.totalCount;
    // tableOptions.value.pageText = `Toplam Kayıt: ${data.value?.totalCount}`;
    search.value.list = list.value;
    search.value.value = "";
  }
};

const handleCreateManufacturer = () => {
  dialog.value.show = true;
  dialog.value.title = "Atölye Oluştur";
  dialog.value.type = "new";
  model.value = {
    name: "",
    telephone: "",
    adress: "",
    note: "",
    contactPerson: "",
  };
};

const handleSubmit = async () => {
  customerForm.value?.validate();
  if (customerForm.value?.isValid) {
    dialog.value.loading = true;
    const url =
      dialog.value.type === "new"
        ? "/Workshop/AddWorkshops"
        : "/Workshop/UpdateWorkshops";

    let sendpool: any = {
      "name": model.value.name,
      "telephone": model.value.telephone,
      "contactPerson": model.value.contactPerson,
      "note": model.value.note,
      "adress": model.value.adress,
    }
    if (dialog.value.type === 'new') {
      sendpool = {
        ...sendpool,
        "situationIds": model.value.stationId
      }
    } else {
      sendpool = {
        ...sendpool,
        "id": model.value.id
      }
    }

    const { data, isFinished, error }: any = await $axios(url, {
      method: dialog.value.type === "new" ? "POST" : "PUT",
      data: sendpool,
    }).catch((err: any) => {
      dialog.value.loading = false;
      toast.error("Atölye eklenirken hata oluştu");
    });

    dialog.value.loading = false;
    if (!data.value.succeeded) {
      toast.error(data.value.message || "Atölye eklenirken hata oluştu");

    } else {
      toast.success("Atölye başarıyla eklendi");
      await fetchWorkshopList();
      dialog.value.show = false;
    }
  }
};

const handleRemoveWorkshopStation = async (item: any, station: any, index: number, event?: any) => {

  confirm.value.item = station;
  confirm.value.show = true;
  confirm.value.title = "İstasyon Sil!";
  confirm.value.body = `
  <p>
    İstasyonu silmek istediğinize emin misiniz?
  </p>
`;
  confirm.value.type = "error";
  confirm.value.confirmType = "deleteStation";








}

const deleteStation = async (station: any) => {
  const { data, isFinished, error }: any = await $axios('/WorkshopSituation/DeleteWorkshopSituations', {
    method: "DELETE",
    data: {
      situationId: station.workshopSituationId,
    },
  }).catch((err: any) => {
    dialog.value.loading = false;
    toast.error("İstasyon silinirken hata oluştu");
  });

  if (!data.value.succeeded) {
    toast.error(data.value.message || "İstasyon silinirken hata oluştu");
  } else {
    toast.success("İstasyon başarıyla silindi");
    await fetchWorkshopList();
  }

}


const editItem = (item: any) => {
  model.value = {
    ...model.value,
    ...item,
    id: item.id,
  };
  dialog.value.show = true;
  dialog.value.title = "Atölyeyi Düzenle";
  dialog.value.type = "edit";
};

const deleteItem = async (item: any) => {
  loading.value.table = true;

  const url = "/Workshop/DeleteWorkshops";

  const sendpool = { id: item.id };

  const response: any = await $axios(url, {
    method: "DELETE",
    data: sendpool,
  }).catch((err: any) => {
    loading.value.table = false;
    confirm.value.loading = false;
    toast.error("Atölye silinirken hata oluştu");
  });

  if (!response) return false;

  const { data, isFinished }: any = response;

  if (!data.value?.succeeded) {
    loading.value.table = false;
    toast.error(data.value.message || "Atölye silinirken hata oluştu");
    return false;
  } else {
    toast.success("Atölye başarıyla silindi");
    await fetchWorkshopList();
  }

  loading.value.table = false;
  return true;
};

const fetchStationList = async () => {
  station.value.loading = true;
  const { data }: any = await $axios("/Parameters/GetSituation", {
    method: "GET",
  }).catch((err: any) => {
    station.value.loading = false;
    toast.error("İstasyonlar getirilirken hata oluştu");
  });
  if (!data.value.succeeded) {
    toast.error(data.value.message || "İstasyonlar getirilirken hata oluştu");
  } else {
    station.value.list = data.value?.data;
  }
  station.value.loading = false;
};

onMounted(async () => {
  loading.value.page = true;
  await fetchWorkshopList();
  await fetchStationList();

  loading.value.page = false;
  loading.value.table = false;
});
</script>

<style scoped>
.btn-clear-filter {}
</style>
