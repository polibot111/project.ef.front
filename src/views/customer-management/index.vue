<template>
  <div class="page-customer_management">
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
          <v-divider vertical class="mx-3 my-5"></v-divider>

          <div
            class="position-relative d-flex align-center pa-2 rounded border-primary"
            :class="[{ 'bg-primary-opacity-1 border-1': search.filtered }]"
          >
            <BtDatePicker
              key="startDate"
              id="startDate"
              v-model="search.startDate"
              label="Başlangıç Tarihi"
              placeholder="Başlangıç Tarihi"
              class="txt-search mr-2"
              style="width: 200px"
              :disabled="search.loading.filter"
            ></BtDatePicker>
            <BtDatePicker
              key="endDate"
              id="endDate"
              v-model="search.endDate"
              label="Bitiş Tarihi"
              placeholder="Bitiş Tarihi"
              class="txt-search mr-2"
              style="width: 200px"
              :disabled="search.loading.filter"
            ></BtDatePicker>
            <v-tooltip
              v-if="search.filtered"
              text="Filtreyi Temizle"
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  color="gray"
                  variant="tonal"
                  class="px-1 btn-clear-filter"
                  @click="handleResetFilter"
                  style="min-width: 30px"
                  :disabled="search.loading.filter"
                >
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
                  style="min-width: 30px !important"
                >
                  <v-icon>mdi-filter-outline</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>

          <v-spacer />
          <v-btn color="primary" variant="flat" @click="handleCreateCustomer"
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
          <v-form ref="customerForm" @submit.prevent>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="model.name"
                  label="Ad, Soyad"
                  :rules="[rules.required]"
                  dense
                  variant="outlined"
                  hide-details="auto"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="model.telephone"
                  label="Telefon"
                  dense
                  variant="outlined"
                  hide-details="auto"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-textarea
                  v-model="model.address"
                  label="Adres"
                  dense
                  variant="outlined"
                  hide-details="auto"
                ></v-textarea>
              </v-col>
              <v-col cols="12" sm="6">
                <v-textarea
                  v-model="model.note"
                  label="Müşteri Notu"
                  dense
                  variant="outlined"
                  hide-details="auto"
                ></v-textarea>
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
  { title: "Müşteri Adı", value: "name", align: "start" },
  { title: "Telefon", value: "telephone", align: "start" },
  { title: "Adres", value: "address", align: "start" },
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
  title: "Müşteri Oluştur",
  type: "new",
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

    confirm.value.title = "Müşteri Sil!";
    confirm.value.body = `
          <p>
            <strong>${item.name}</strong> isimli müşteriyi silmek istediğinize emin misiniz?
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

  await fetchCustomerList(modelpool)
  search.value.loading.filter = false;
};
const handleResetFilter = async () => {
  search.value.filtered = false;
  search.value.startDate = null
  search.value.endDate = null
  await fetchCustomerList();
};

const handlePageUpdate = async (page: number) => {
  tableOptions.value.page = page;
  await fetchCustomerList();
};

const fetchCustomerList = async (
  queryParams: object | undefined = {}
): Promise<void> => {
  const { data }: any = (await $axios("/Customer/GetCustomers", {
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
  dialog.value.title = "Müşteri Oluştur";
  dialog.value.type = "new";
  model.value = {
    name: "",
    telephone: "",
    address: "",
    note: "",
  };
};

const handleSubmit = async () => {
  customerForm.value?.validate();
  if (customerForm.value?.isValid) {
    dialog.value.loading = true;
    const url =
      dialog.value.type === "new"
        ? "/Customer/AddCustomers"
        : "/Customer/UpdateCustomers";

    const { data, isFinished, error }: any = await $axios(url, {
      method: dialog.value.type === "new" ? "POST" : "PUT",
      data: model.value,
    }).catch((err: any) => {
      dialog.value.loading = false;
      toast.error("Müşteri eklenirken hata oluştu");
    });

    dialog.value.loading = false;
    if (!data.value.succeeded) {
      toast.error(data.value.message || "Müşteri eklenirken hata oluştu");
    } else {
      console.log("data is => ", data);
      toast.success("Müşteri başarıyla eklendi");
      await fetchCustomerList();
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
  dialog.value.title = "Müşteriyi Düzenle";
  dialog.value.type = "edit";
};

const deleteItem = async (item: any) => {
  console.log("item is => ", item);
  loading.value.table = true;

  const url = "/Customer/DeleteCustomers";

  const sendpool = { id: item.id };

  const response: any = await $axios(url, {
    method: "DELETE",
    data: sendpool,
  }).catch((err: any) => {
    loading.value.table = false;
    confirm.value.loading = false;
    toast.error("Müşteri silinirken hata oluştu");
  });

  if (!response) return false;

  const { data, isFinished }: any = response;

  if (!data.value?.succeeded) {
    loading.value.table = false;
    toast.error(data.value.message || "Müşteri silinirken hata oluştu");
    return false;
  } else {
    toast.success("Müşteri başarıyla silindi");
    await fetchCustomerList();
  }

  loading.value.table = false;
  return true;
};

onMounted(async () => {
  loading.value.page = true;
  await fetchCustomerList();

  loading.value.page = false;
  loading.value.table = false;
});
</script>

<style scoped>
.btn-clear-filter {
}
</style>
