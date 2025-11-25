<template>
  <div class="page-department">
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
      @update:page="handlePageUpdate"
      @update:items-per-page="handlePageUpdate"
    >
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
            clearable
          ></v-text-field>

          <v-spacer />
          <v-btn color="primary" variant="flat" @click="handleCreateDepartment"
            >Yeni Ekle</v-btn
          >
        </v-toolbar>
      </template>

      <template v-slot:item.actions="{ item, index }">
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
        <p class="text-subtitle-1 mt-10 mb-3">Kayıt bulunamadı</p>
      </template>
    </v-data-table-server>
    <BtModal
      v-model:show="dialog.show"
      v-model:loading="dialog.loading"
      :title="dialog.title"
      width="50vw"
      @save="handleSubmit"
    >
      <template #content>
        <v-card-text class="mt-5">
          <v-form ref="staffForm" @submit.prevent>
            <v-row>
              <v-col cols="12" sm="12">
                <v-text-field
                  v-model="model.name"
                  label="Departman Adı"
                  :rules="[rules.required]"
                  dense
                  variant="outlined"
                  hide-details="auto"
                ></v-text-field>
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
      @cancel="confirm.handler('cancel')"
    >
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
  { title: "Departman Adı", value: "name", align: "start" },
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
const loading = ref({
  table: true,
  page: true,
});

const model: any = ref({
  id: "",
  name: "",
  telephone: "",
  adress: "",
  note: "",
  department: "",
  statu: true,
});

const dialog = ref({
  show: false,
  loading: false,
  title: "Departman Oluştur",
  type: "new",
});

const confirm = ref({
  show: false,
  title: "Departman Sil!",
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

    confirm.value.title = "Departman Sil!";
    confirm.value.body = `
              <p>
                <strong>${item.name}</strong> isimli departmanı silmek istediğinize emin misiniz?
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

const handlePageUpdate = async (page: number) => {
  tableOptions.value.page = page;
  await fetchDepartmentList();
};

const fetchDepartmentList = async (
  queryParams: object | undefined = {}
): Promise<void> => {
  const { data }: any = (await $axios("/Department/GetDepartment", {
    method: "GET",
    params: {
      page: tableOptions.value.page,
      size: tableOptions.value.itemsPerPage,
      ...queryParams,
    },
  }).catch((err: any) => {
    console.log("err is => ", err);
    toast.error(err.message || "Departmanlar getirilirken hata oluştu");
  })) as any;
  if (!data.value.succeeded) {
    console.log("data.value", data.value);
    toast.error(data.value.message || "Departmanlar getirilirken hata oluştu");
  } else {
    list.value = data.value?.data;
    tableOptions.value.totalCount = data.value?.totalCount;
    search.value.list = list.value;
    search.value.value = "";
  }
};

const handleCreateDepartment = () => {
  dialog.value.show = true;
  dialog.value.title = "Departman Oluştur";
  dialog.value.type = "new";
  model.value = {
    name: "",
  };
};

const handleSubmit = async () => {
  staffForm.value?.validate();
  if (staffForm.value?.isValid) {
    dialog.value.loading = true;
    const url =
      dialog.value.type === "new"
        ? "/Department/AddDepartment"
        : "/Department/UpdateDepartment";

    const { data, isFinished, error }: any = await $axios(url, {
      method: dialog.value.type === "new" ? "POST" : "PUT",
      data: model.value,
    }).catch((err: any) => {
      dialog.value.loading = false;
      toast.error("Departman eklenirken hata oluştu");
    });

    dialog.value.loading = false;
    if (!data.value.succeeded) {
      toast.error(data.value.message || "Departman eklenirken hata oluştu");
    } else {
      console.log("data is => ", data);
      toast.success("Departman başarıyla eklendi");
      await fetchDepartmentList();
      dialog.value.show = false;
    }
  }
};

const editItem = (item: any) => {
  model.value = {
    ...model.value,
    ...item,
    id: item.id,
  };
  dialog.value.show = true;
  dialog.value.title = "Departman Düzenle";
  dialog.value.type = "edit";
};

const deleteItem = async (item: any) => {
  console.log("item is => ", item);
  loading.value.table = true;

  const url = "/Department/DeleteDepartment";

  const sendpool = { id: item.id };

  const response: any = await $axios(url, {
    method: "DELETE",
    data: sendpool,
  }).catch((err: any) => {
    loading.value.table = false;
    confirm.value.loading = false;
    toast.error("Departman silinirken hata oluştu");
  });

  if (!response) return false;

  const { data, isFinished }: any = response;

  if (!data.value?.succeeded) {
    loading.value.table = false;
    toast.error(data.value.message || "Departman silinirken hata oluştu");
    return false;
  } else {
    toast.success("Departman başarıyla silindi");
    await fetchDepartmentList();
  }

  loading.value.table = false;
  return true;
};

onMounted(async () => {
  loading.value.page = true;
  await fetchDepartmentList();

  loading.value.page = false;
  loading.value.table = false;
});
</script>

<style scoped>
.btn-clear-filter {
}
</style>
