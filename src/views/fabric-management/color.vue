<template>
	<div class="page-fabric_color">
		<v-data-table
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
			@update:page="fetchFabricColorList"
			@update:items-per-page="fetchFabricColorList">
			<template v-slot:top>
				<v-toolbar flat color="white">
					<v-spacer />
					<v-btn color="primary" variant="flat" @click="handleNewFabricModel">Yeni Ekle</v-btn>
				</v-toolbar>
			</template>
			<template v-slot:item.images="{ item }:any">
				<v-img v-if="item?.images?.[0]?.path" :src="item.images?.[0]?.path" width="32" height="32" class="rounded" cover />
			</template>

			<template v-slot:item.rgbCode="{ item }:any">
				<div v-if="item?.rgbCode">
					<span class="color-square mr-2" :style="`background: ${item.rgbCode}; `"></span>
					{{ item.rgbCode }}
				</div>
			</template>
			<template v-slot:item.isUsed="{ item }:any">
				<v-chip v-if="item?.isUsed" color="success" size="small"> Evet </v-chip>
				<v-chip v-else color="error" size="small"> Hayır </v-chip>
			</template>

			<template v-slot:item.actions="{ item }">
				<v-icon class="me-2" color="primary" size="small" @click="editItem(item)"> mdi-pencil-box-outline </v-icon>

				<v-icon size="small" color="error" @click="confirm.handlerShow(item)"> mdi-delete-outline</v-icon>
			</template>
			<template v-slot:no-data>
				<v-btn color="primary" @click="fetchFabricColorList"> Yenile </v-btn>
			</template>
		</v-data-table>
		<BtModal v-model:show="dialog.show" v-model:loading="dialog.loading" :title="dialog.title" @save="handleSubmit">
			<template #content>
				<v-card-text>
					<v-form ref="typeForm" @submit.prevent>
						<v-text-field v-model="model.name" label="İsim" elevation="0" variant="outlined" class="mb-3" :rules="[rules.required]" />
						<v-text-field
							v-if="!model.FormFile"
							v-model="model.rgbCode"
							label="Renk Kodu"
							elevation="0"
							variant="outlined"
							class="mb-3"
							:rules="[
								(v: string) => !!v || 'Zorunlu alan',
							  (v: string) => /^#([0-9A-F]{3}){1,2}$|^#([0-9A-F]{4}){1,2}$/i.test(v) || 'Geçerli bir Hex renk kodu girin. Ör: #000, #000000, #000F, #000000FF',
							]">
							<template #prepend>
								<v-btn flat size="small" :variant="!model.rgbCode ? 'outlined' : 'text'" :style="`background: ${model.rgbCode}; height: 50px`">
									<v-menu activator="parent" :close-on-content-click="false" :modes="['hex']">
										<div class="bt-picker">
											<v-color-picker v-model="model.rgbCode" hide-input hide-mode-switch hide-controls></v-color-picker>
										</div>
									</v-menu>
								</v-btn>
							</template>
						</v-text-field>

						<div v-if="!model.rgbCode" class="d-flex align-center mb-3 gap-3">
							<v-img
								v-if="model?.images?.[2]?.path"
								:src="model.images?.[2]?.path"
								width="96"
								height="96"
								class="rounded"
								style="max-width: 96px; max-height: 96px;" />
							<v-file-input
								v-model="model.FormFile"
								label="Resim Yükle"
								prepend-icon="mdi-camera"
								accept="image/*"
								variant="outlined"
								class="mb-3"
								clearable
								show-size
								:rules="[
									(v) => (v || model.FormFile) || 'Renk kodu veya resim yüklenmelidir',
									(v) => !v || v[0]?.size <= 10000000 || 'Dosya boyutu 10 MB\'den büyük olamaz'
								]">
								<template v-slot:selection="{ fileNames }">
									<template v-for="fileName in fileNames" :key="fileName">
										{{ fileName }}
									</template>
								</template>
							</v-file-input>
						</div>
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
import { ref, watchEffect, onMounted, watch } from "vue";
import { toast } from "vue3-toastify";
import { rules } from "../../../config/rules";

import BtModal from "../../components/BtModal.vue";
// import { useFetch } from "../../composables/useFetch";
import $axios from "../../composables/axios";
import ConfirmBox from "../../components/ConfirmBox.vue";

const headers:any = ref([
  { title: "İsim", value: "name", align: "start" },
  { title: "Resim", value: "images", align: "start", width: "64px" },
  { title: "Renk Kodu", value: "rgbCode", align: "start" },
  { title: 'Kullanım Durumu', value: 'isUsed', align: 'start' },
  { title: "İşlemler", value: "actions", align: "start", width: "80px" },
]);
const list = ref([]);
const typeForm = ref();
const loading = ref({
  table: true,
});
const model:any = ref({
  name: "",
  rgbCode: "",
  FormFile: null,
  id: null,
});

const dialog = ref({
  show: false,
  loading: false,
  title: "Kumaş Rengi Ekle",
  type: "new",
  pickerShow: false,
});

const confirm = ref({
  show: false,
  title: "Kumaş'ı Sil!",
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
    confirm.value.title = "Kumaş Rengi Sil";

    if(item.rgbCode) {
      confirm.value.body = `
          <p>
          <span
            class="color-square mr-1"
            style="background: ${item.rgbCode}; width: 20px; height: 20px; display: inline-block;"
          ></span>
          <strong>${item.name}</strong> isimli kumaş rengini silmek istediğinize emin misiniz?
        </p>
      `;
    } else {
      confirm.value.body = `
        <p>
          <strong>${item.name}</strong> isimli kumaş rengini silmek istediğinize emin misiniz?
        </p>
      `;
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

const fetchFabricColorList = async () => {
  const { data, error }: any = await $axios("/Color/GetColors", {
    method: "GET",
    params: {
      page: tableOptions.value.page,
      size: tableOptions.value.itemsPerPage,
      orderBy: "1",
    },
  });
  if (error.value) {
    toast.error(error.message || "Kumaş renkleri getirilirken hata oluştu");
  } else {
    list.value = data.value?.data;
  }
};

onMounted(async () => {
  await fetchFabricColorList();
  loading.value.table = false;
});

const handleNewFabricModel = () => {
  dialog.value.show = true;
  dialog.value.title = "Kumaş Rengi Ekle";
  dialog.value.type = "new";
  model.value = {
    name: "",
    rgbCode: "",
    FormFile: null,
    id: null,
  };
};

const handleSubmit = async () => {
  typeForm.value?.validate();
  if (typeForm.value?.isValid) {
    dialog.value.loading = true;
    const url =
      dialog.value.type === "new"
        ? "https://byozcetekstil.azurewebsites.net/api/Color/AddColors"
        : "/Color/UpdateColors";

    const formData = new FormData();
    formData.append('Name', model.value.name);
    if (model.value.rgbCode) {
      formData.append('RGBCode', model.value.rgbCode);
    }
    if (model.value.FormFile) {
      formData.append('FormFile', model.value.FormFile);
    }
    if(dialog.value.type === "edit") {
      formData.append('Id', model.value.id);
    }

    const { data, isFinished, error }: any = await $axios(url, {
      method: dialog.value.type === "new" ? "POST" : "PUT",
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).catch((err: any) => {
      dialog.value.loading = false;
      toast.error("Kumaş rengi eklenirken hata oluştu");
    });

    dialog.value.loading = false;
    if (!data.value.succeeded) {
      toast.error(data.value.message || "Kumaş rengi eklenirken hata oluştu");
    } else {
      toast.success("Kumaş rengi başarıyla eklendi");
      fetchFabricColorList();
      dialog.value.show = false;
    }
  }
};

const editItem = (item: any) => {
  model.value = { ...item, id: item.id };
  dialog.value.show = true;
  dialog.value.title = "Kumaş Rengi Düzenle";
  dialog.value.type = "edit";
};

const deleteItem = async (item: any) => {
  loading.value.table = true;
  const { data, isFinished }: any = await $axios("/Color/DeleteColors", {
    method: "DELETE",
    data: { id: item.id },
  }).catch((err: any) => {
    loading.value.table = false;
    confirm.value.loading = false;
    console.log("err => ", err);
    toast.error(err.response.data.message || "Kumaş rengi silinirken hata oluştu", {autoClose: 3000});
  });
  if (!data.value?.succeeded) {
    toast.error(data.value.message || "Kumaş rengi silinirken hata oluştu", {autoClose: 3000});
    return false;
  } else {
    toast.success("Kumaş rengi başarıyla silindi", {autoClose: 1000});
    await fetchFabricColorList();
  }
  loading.value.table = false;
  return true;
};
</script>

<style>
.page-fabric_color .color-square {
  display: inline-block;
  height: 22px;
  width: 22px;
  content: "";
  border-radius: 4px;
  border: 1px solid #ccc;
}

.bt-picker .v-color-picker-edit {
  display: none !important;
}
</style>
