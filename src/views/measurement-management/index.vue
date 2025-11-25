<template>
	<div class="page-measurement_management">
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
			:loading="loading.table"
			show-current-page
			@update:page="handlePageUpdate"
			@update:items-per-page="handlePerPageUpdate"
			:items-length="tableOptions.totalCount">
			<template v-slot:top>
				<v-toolbar flat color="white">
					<v-spacer />
					<v-btn color="primary" variant="flat" @click="measurementDialog?.show()">Yeni Ekle</v-btn>
				</v-toolbar>
			</template>
			<template v-slot:item.actions="{ item }">
				<v-icon class="me-2" color="primary" size="small" @click="measurementDialog?.edit(item)"> mdi-pencil-box-outline </v-icon>

				<v-icon size="small" color="error" @click="confirm.handlerShow(item)"> mdi-delete-outline</v-icon>
			</template>
			<template v-slot:no-data>
				<v-btn color="primary" @click="fetchMeasurementList"> Yenile </v-btn>
			</template>
		</v-data-table-server>
		<MeasurementDialog 
			ref="measurementDialog"
			@refresh="fetchMeasurementList"
		/>
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
import { ref, watchEffect, onMounted, watch } from "vue";
import { toast } from "vue3-toastify";
import { rules } from "../../../config/rules";

import BtModal from "../../components/BtModal.vue";
// import { useFetch } from "../../composables/useFetch";
import $axios from "../../composables/axios";
import ConfirmBox from "../../components/ConfirmBox.vue";
import MeasurementDialog from "../../components/MeasurementDialog.vue";

const measurementDialog = ref()

const headers:any = ref([
  { title: "Ölçü Adı", value: "name", align: "start" },
  { title: "En", value: "width", align: "start" },
  { title: "Boy", value: "height", align: "start" },
  { title: "İşlemler", value: "actions", align: "start", width: "80px" },
]);
const list = ref([]);
const typeForm = ref();
const loading = ref({
  table: true,
});
const model = ref({
  name: "",
  width: "",
  height: "",
});

const dialog = ref({
  show: false,
  loading: false,
  title: "Ölçü Ekle",
  type: "new",
  pickerShow: false,
});

const confirm = ref({
  show: false,
  title: "Ölçü'yü Sil!",
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
  handlerShow: (item: any) => {
    console.log("iterm is => ", item);
    confirm.value.item = item;
    confirm.value.show = true;
    confirm.value.type = "error";
    confirm.value.title = "Ölçü Sil";
    confirm.value.body = `
        <p>
          <strong>${item.name}</strong> isimli ölçüyü silmek istediğinize emin misiniz?
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

const handlePageUpdate = async (page: number) => {
  tableOptions.value.page = page
  await fetchMeasurementList()
}
const handlePerPageUpdate = async (itemsPerPage: number) => {
  tableOptions.value.itemsPerPage = itemsPerPage
  await fetchMeasurementList()
}

const fetchMeasurementList = async () => {
  const { data, error }: any = await $axios("/Meansure", {
    method: "GET",
    params: {
      page: tableOptions.value.page,
      size: tableOptions.value.itemsPerPage,
    },
  });
  if (error.value) {
    toast.error(error.message || "Ölçüler getirilirken hata oluştu");
  } else {
    list.value = data.value?.data;
  }
};

onMounted(async () => {
  await fetchMeasurementList();
  loading.value.table = false;
});

const handleNewFabricModel = () => {
  dialog.value.show = true;
  dialog.value.title = "Ölçü Ekle";
  dialog.value.type = "new";
  model.value = {
    name: "",
    width: "",
    height: "",
  };
};

const handleSubmit = async () => {
  typeForm.value?.validate();
  if (typeForm.value?.isValid) {
    dialog.value.loading = true;
    const url =
      dialog.value.type === "new" ? "/Meansure" : "/Meansure";

    const { data, isFinished, error }: any = await $axios(url, {
      method: dialog.value.type === "new" ? "POST" : "PUT",
      data: model.value,
    }).catch((err: any) => {
      dialog.value.loading = false;
      toast.error("Ölçü eklenirken hata oluştu");
    });

    dialog.value.loading = false;
    if (!data.value.succeeded) {
      toast.error(data.value.message || "Ölçü eklenirken hata oluştu");
    } else {
      toast.success(dialog.value.type === "new" ? 'Ölçü başarıyla eklendi' : 'Ölçü başarıyla güncellendi');
      fetchMeasurementList();
      dialog.value.show = false;
    }
  }
};

const editItem = (item: any) => {
  model.value = { ...item, id: item.id };
  dialog.value.show = true;
  dialog.value.title = "Ölçü Düzenle";
  dialog.value.type = "edit";
};

const deleteItem = async (item: any) => {
  loading.value.table = true;
  const { data, isFinished }: any = await $axios("/Meansure", {
    method: "DELETE",
    data: { id: item.id },
  }).catch((err: any) => {
    loading.value.table = false;
    confirm.value.loading = false;
    toast.error("Ölçü silinirken hata oluştu");
  });
  if (!data.value?.succeeded) {
    toast.error(data.value.message || "Ölçü silinirken hata oluştu");
    return false;
  } else {
    toast.success("Ölçü başarıyla silindi");
    await fetchMeasurementList();
  }
  loading.value.table = false;
  return true;
};
</script>

<style>
.page-measurement_management .measurement-square {
  display: inline-block;
  height: 22px;
  width: 22px;
  content: "";
  border-radius: 4px;
  border: 1px solid #ccc;
}

.bt-picker .v-measurement-picker-edit {
  display: none !important;
}
</style>
