<template>
  <div class="page-fabric_model">
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
      @update:page="fetchFabricModelList"
      @update:items-per-page="fetchFabricModelList"
    >
      <template v-slot:top>
        <v-toolbar flat color="white">
          <v-spacer />
          <v-btn color="primary" variant="flat" @click="handleNewFabricModel"
            >Yeni Ekle</v-btn
          >
        </v-toolbar>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon
          class="me-2"
          color="primary"
          size="small"
          @click="editItem(item)"
        >
          mdi-pencil-box-outline
        </v-icon>

        <v-icon size="small" color="error" @click="confirm.handlerShow(item)">
          mdi-delete-outline</v-icon
        >
      </template>
      <template v-slot:no-data>
        <v-btn color="primary" @click="fetchFabricModelList"> Yenile </v-btn>
      </template>
    </v-data-table>
    <BtModal
      v-model:show="dialog.show"
      v-model:loading="dialog.loading"
      :title="dialog.title"
      @save="handleSubmit"
    >
      <template #content>
        <v-card-text>
          <v-form ref="typeForm" @submit.prevent>
            <v-text-field
              v-model="model.name"
              label="İsim"
              elevation="0"
              variant="outlined"
              class="mb-3"
              :rules="[rules.required]"
            />
            <v-text-field
              v-model="model.code"
              label="Kod"
              elevation="0"
              variant="outlined"
              class="mb-3"
              :rules="[rules.required]"
            />
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
      @cancel="confirm.handler('cancel')"
    >
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
import ConfirmBox from "../../components/ConfirmBox.vue";

import BtModal from "../../components/BtModal.vue";
// import { useFetch } from "../../composables/useFetch";
import $axios from "../../composables/axios";

const headers:any = ref([
  { title: "İsim", value: "name", align: "start" },
  { title: "Kod", value: "code", align: "start" },
  { title: "İşlemler", value: "actions", align: "start", width: "80px" },
]);
const list = ref([]);
const typeForm = ref();
const loading = ref({
  table: true,
});
const model = ref({
  name: "",
  code: "",
});

const dialog = ref({
  show: false,
  loading: false,
  title: "Ürün Ekle",
  type: "new",
});

const confirm = ref({
  show: false,
  title: "Ürün Sil!",
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
    confirm.value.title = "Sil";
    confirm.value.body = `
        <p>
          <strong>${item.name}</strong> isimli ve <strong>${item.code}</strong> kodlu ürünü silmek istediğinize emin misiniz?
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
});

const fetchFabricModelList = async () => {
  const { data, error }: any = await $axios("/FabricModel/FabricModelGetAll", {
    method: "GET",
    params: {
      page: tableOptions.value.page,
      size: tableOptions.value.itemsPerPage,
    },
  });
  if (error.value) {
    toast.error(error.message || "Kumaş tipleri getirilirken hata oluştu");
  } else {
    list.value = data.value?.data;
  }
};

onMounted(async () => {
  await fetchFabricModelList();
  loading.value.table = false;
});

const handleNewFabricModel = () => {
  dialog.value.show = true;
  dialog.value.title = "Ürün Ekle";
  dialog.value.type = "new";
  model.value = {
    name: "",
    code: "",
  };
};

const handleSubmit = async () => {
  typeForm.value?.validate();
  if (typeForm.value?.isValid) {
    dialog.value.loading = true;
    const url =
      dialog.value.type === "new"
        ? "/FabricModel/AddFabricModel"
        : "/FabricModel/UpdateFabricModel";

    const { data, isFinished, error }: any = await $axios(url, {
      method: dialog.value.type === "new" ? "POST" : "PUT",
      data: model.value,
    }).catch((err: any) => {
      dialog.value.loading = false;
      toast.error("Ürün eklenirken hata oluştu");
    });

    dialog.value.loading = false;
    if (!data.value.succeeded) {
      toast.error(data.value.message || "Ürün eklenirken hata oluştu");
    } else {
      toast.success("Ürün başarıyla eklendi");
      fetchFabricModelList();
      dialog.value.show = false;
    }
  }
};

const editItem = (item: any) => {
  model.value = { ...item, id: item.id };
  dialog.value.show = true;
  dialog.value.title = "Ürün Düzenle";
  dialog.value.type = "edit";
};

const deleteItem = async (item: any) => {
  loading.value.table = true;
  const { data, isFinished }: any = await $axios(
    "/FabricModel/DeleteFabricModel",
    {
      method: "DELETE",
      data: { id: item.id },
    }
  ).catch((err: any) => {
    loading.value.table = false;
    confirm.value.loading = false;
    toast.error("Ürün silinirken hata oluştu");
  });
  if (!data.value?.succeeded) {
    loading.value.table = false;
    return false;
    toast.error(data.value.message || "Ürün silinirken hata oluştu");
  } else {
    toast.success("Ürün başarıyla silindi");
    await fetchFabricModelList();
  }

  loading.value.table = false;
  return true
};
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
