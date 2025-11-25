<template>
	<div class="page-fabric_type">
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
			:items-length="tableOptions.totalCount"
			:loading="loading.table"
			show-current-page
			@update:page="handlePageUpdate"
			@update:items-per-page="handlePerPageUpdate">
			<template v-slot:top>
				<v-toolbar flat color="white">
					<v-spacer />
					<v-btn color="primary" variant="flat" @click="handleNewFabricType">Yeni Ekle</v-btn>
				</v-toolbar>
			</template>

			<template v-slot:item.colorName="{ item }: any">
				<!-- <div class="d-flex align-center">
					<div style="width: 22px; height: 22px;" class="mr-2">
						<span
							v-if="colorHexList[item.colorId]?.rgbCode"
							class="color-square mr-2"
							:style="`background: ${colorHexList[item.colorId]?.rgbCode}; `"></span>
						<v-img
							v-else-if="colorHexList[item.colorId]?.images[1]?.path"
							:src="colorHexList[item.colorId]?.images[1]?.path"
							width="22px"
							height="22px"
							class="rounded d-inline-block mr-2" />
					</div>
					<div>{{ colorHexList[item.colorId]?.name }}</div>
				</div> -->
				<div class="d-flex align-center">
					<v-chip v-if="colorHexList[item.colorId]?.rgbCode" size="x-small" :color="colorHexList[item.colorId]?.rgbCode" variant="flat" class="ma-1">
						{{ colorHexList[item.colorId]?.name }}
					</v-chip>
					<v-tooltip v-else :width="128" :height="128" location="top" content-class="pa-0">
						<template v-slot:activator="{ props }">
							<v-chip v-bind="props" class="d-flex align-center" size="x-small" variant="outlined" color="primary py-2">
								<v-img :src="colorHexList[item.colorId]?.images?.[0]?.path" width="16" height="16" class="rounded mr-1" cover />
								{{ colorHexList[item.colorId]?.name }}
							</v-chip>
						</template>
						<v-img :src="colorHexList[item.colorId]?.images?.[0]?.path" width="128" height="128" cover class="rounded border shadow-sm border-gray" />
					</v-tooltip>
				</div>
			</template>
			<template v-slot:item.isCapitone="{ item }: any">
				<v-icon v-if="item.isCapitone" color="green"> mdi-check-circle-outline </v-icon>
				<v-icon v-else color="error"> mdi-close-circle-outline </v-icon>
			</template>
			<template v-slot:item.actions="{ item }">
				<v-icon class="me-2" color="primary" size="small" @click="editItem(item)"> mdi-pencil-box-outline </v-icon>

				<v-icon size="small" color="error" @click="confirm.handlerShow(item)"> mdi-delete-outline</v-icon>
			</template>
			<template v-slot:no-data>
				<v-btn color="primary" @click="fetchFabricTypeList"> Yenile </v-btn>
			</template>
		</v-data-table-server>
		<BtModal v-model:show="dialog.show" v-model:loading="dialog.loading" :title="dialog.title" @save="handleSubmit">
			<template #content>
				<v-card-text>
					<v-form ref="typeForm" @submit.prevent>
						<v-autocomplete
							v-model="search.query"
							v-model:items="search.items"
							:loading="search.loading"
							:search-input.sync="search.searchInput"
							label="Kumaş Ara ve Seç"
							elevation="0"
							variant="outlined"
							class="mb-3"
							hide-no-data
							hide-selected
							item-title="displayName"
							item-value="id"
							hide-details="auto"
							@update:search="search.handleSearch"
							@update:model-value="search.select">
						</v-autocomplete>
						<v-divider class="mb-6 mt-6" />
						<v-text-field v-model="model.name" label="İsim" elevation="0" variant="outlined" class="mb-3" />
						<!-- <v-text-field v-model="model.code" label="Kod" elevation="0" variant="outlined" class="mb-3" /> -->
						<v-text-field
							type="number"
							v-model="model.denierCount"
							label="Tel Denye Sayısı"
							elevation="0"
							variant="outlined"
							class="mb-3"
							:rules="[rules.required]" />
						<v-text-field
							type="number"
							v-model="model.grammage"
							label="Gramaj"
							elevation="0"
							variant="outlined"
							class="mb-3"
							:rules="[rules.required]" />
						<v-text-field
							type="number"
							v-model="model.width"
							label="Genişlik(En)"
							elevation="0"
							variant="outlined"
							class="mb-3"
							:rules="[rules.required]" />

						<v-autocomplete
							v-model="model.colorId"
							:items="colorList"
							label="Renk"
							elevation="0"
							variant="outlined"
							class="mb-3"
							item-value="id"
							item-title="name"
							:rules="[rules.required]">
							<template #prepend>
								<v-icon color="primary" size="small" @click="colorDialog.show = true"> mdi-plus-circle-outline </v-icon>
							</template>
							<template v-slot:chip="{ props, item }: any">
								<v-list-item v-bind="props">
									<template #prepend>
										<span v-if="item.raw.rgbCode" class="color-square mr-2" :style="`background: ${item.raw.rgbCode}; `"></span>
										<v-img
											v-else-if="item.raw.images?.[2]?.path"
											:src="item.raw.images?.[2]?.path"
											width="22"
											height="22"
											class="rounded mr-2"
											cover />
									</template>
									{{ item.raw.name }}
								</v-list-item>
							</template>

							<template v-slot:item="{ props, item }: any">
								<v-list-item v-bind="props">
									<template #prepend>
										<span v-if="item.raw.rgbCode" class="color-square mr-2" :style="`background: ${item.raw.rgbCode}; `"></span>
										<v-img
											v-else-if="item.raw.images?.[2]?.path"
											:src="item.raw.images?.[2]?.path || item.raw?.images?.[0]?.path"
											width="22"
											height="22"
											class="rounded mr-2"
											cover />
									</template>
									<!-- {{ item.raw.name }} -->
								</v-list-item>
							</template>
						</v-autocomplete>
						<div class="d-flex gap-3 align-center">
							<span class="mr-3">Kapiton mu?</span>
							<v-switch
								color="green"
								base-color="red"
								v-model="model.isCapitone"
								:label="model.isCapitone ? 'Evet' : 'Hayır'"
								dense
								hide-details></v-switch>
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
		<BtModal v-model:show="colorDialog.show" v-model:loading="colorDialog.loading" :title="colorDialog.title" @save="handleSaveColor">
			<template #content>
				<v-card-text>
					<v-form ref="colorForm" @submit.prevent>
						<v-text-field v-model="colorModel.name" label="İsim" elevation="0" variant="outlined" class="mb-3" :rules="[rules.required]" />
						<v-text-field
							v-if="!colorModel.FormFile"
							v-model="colorModel.rgbCode"
							label="Renk Kodu"
							elevation="0"
							variant="outlined"
							class="mb-3"
							:rules="[
								
							]">
							<template #prepend>
								<v-btn
									flat
									size="small"
									:variant="!colorModel.rgbCode ? 'outlined' : 'text'"
									:style="`background: ${colorModel.rgbCode}; height: 50px`">
									<v-menu activator="parent" :close-on-content-click="false" :modes="['hex']">
										<div class="bt-picker">
											<v-color-picker v-model="colorModel.rgbCode" hide-input hide-mode-switch hide-controls></v-color-picker>
										</div>
									</v-menu>
								</v-btn>
							</template>
						</v-text-field>

						<div v-if="!colorModel.rgbCode" class="d-flex align-center mb-3 gap-3">
							<v-img
								v-if="colorModel?.images?.[2]?.path"
								:src="colorModel.images?.[2]?.path"
								width="96"
								height="96"
								class="rounded"
								style="max-width: 96px; max-height: 96px;" />
							<v-file-input
								v-model="colorModel.FormFile"
								label="Resim Yükle"
								prepend-icon="mdi-camera"
								accept="image/*"
								variant="outlined"
								class="mb-3"
								clearable
								show-size
								:rules="[
									(v) => (v || colorModel.rgbCode) || 'Renk kodu veya resim yüklenmelidir',
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
	</div>
</template>

<script lang="ts" setup>
import { ref, watchEffect, onMounted, watch } from "vue"
import { toast } from "vue3-toastify"
import { rules } from "../../../config/rules"
import { debounce } from "lodash"
import ConfirmBox from "../../components/ConfirmBox.vue"

import BtModal from "../../components/BtModal.vue"
// import { useFetch } from "../../composables/useFetch";
import $axios from "../../composables/axios"

const headers: any = ref([
  { title: "Kod", value: "code", align: "start" },
  { title: "İsim", value: "name", align: "start" },
  { title: "Tel Denye Sayısı", value: "denierCount", align: "start" },
  { title: "Gramaj", value: "grammage", align: "start" },
  { title: "Genişlik(En)", value: "width", align: "start" },
  { title: "Renk Adı", value: "colorName", align: "start" },
  { title: "Kapiton mu", value: "isCapitone", align: "start" },
  { title: "İşlemler", value: "actions", align: "start", width: "80px" },
])
const list = ref([])
const typeForm = ref()
const loading = ref({
  table: true,
})
const model: any = ref({
  name: "",
  code: "",
  denierCount: "",
  grammage: "",
  width: "",
  colorId: null,
  isCapitone: false,
})
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
        confirm.value.loading = true
        const isSuccess = await deleteItem(confirm.value.item)
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
  handlerShow: (item: any) => {
    console.log("iterm is => ", item)
    confirm.value.item = item
    confirm.value.show = true
    confirm.value.type = "error"
    confirm.value.title = "Kumaş Tipi Sil"
    confirm.value.body = `
      <p>
        <strong>${item.name}</strong> isimli ve <strong>${item.code}</strong> kodlu ürünü silmek istediğinize emin misiniz?
      </p>
    `
  },
})

const dialog = ref({
  show: false,
  loading: false,
  title: "Kumaş Tipi Ekle",
  type: "new",
})

const tableOptions = ref({
  itemsPerPageText: "Sayfa başına satır:",
  itemsPerPageAll: "Hepsi",
  pageText: "Toplam Kayıt: {2}",
  noDataText: "Kayıt bulunamadı",
  itemsPerPageOptions: [10, 15, 20, 25, 30],
  itemsPerPage: 10,
  page: 1,
  totalCount: 0,
})

const colorList = ref([])
const colorHexList: any = ref({})
const { data, isFinished } = await $axios("/Color/GetColors")
const search = ref({
  query: null,
  items: [],
  loading: false,
  searchInput: null,
  handleSearch: debounce(async (value: string) => {
    console.log("search params is => ", value)
    if (!value) {
      search.value.items = []
      return
    }

    search.value.loading = true
    const { data, isFinished }: any = await $axios("/FabricTypes/GetFabricTypeByNameOrCode", {
      method: "GET",
      params: {
        fabricTypeByNameOrCode: value,
      },
    }).catch((err: any) => {
      search.value.loading = false
    })
    if (data?.value?.succeeded) {
      search.value.items = data?.value?.data || []
      console.log("search items is => ", data)
      console.log("search items length is => ", search.value.items.length)
    }
    search.value.loading = false
  }, 500),
  select: (id: any) => {
    const item:any = search.value.items.find((item: any) => item.id === id)
    console.log("selected value is => ", item)
    model.value = {
      name: item.name,
      code: item.code,
      denierCount: item.denierCount,
      grammage: item.grammage,
      width: item.width,
      colorId: item.colorId,
      isCapitone: item.isCapitone,
    }
    search.value.query = item.displayName
    search.value.items = []
    search.value.searchInput = null
  },
})

if (data.value.succeeded) {
  colorList.value = data.value.data

  colorHexList.value = data.value.data.reduce((acc: any, item: any) => {
    acc[item.id] = item
    return acc
  }, {})
}

const fetchColorList = async () => {
  const { data, isFinished }: any = await $axios("/Color/GetColors")
  if (data.value.succeeded) {
    colorList.value = data.value.data

    colorHexList.value = data.value.data.reduce((acc: any, item: any) => {
      acc[item.id] = item
      return acc
    }, {})
  }
}

const fetchFabricTypeList = async () => {
  loading.value.table = true
  const { data, isFinished }: any = await $axios("/FabricTypes/GetFabricTypes", {
    method: "GET",
    params: {
      page: tableOptions.value.page,
      size: tableOptions.value.itemsPerPage,
    },
  }).catch((err: any) => {
    loading.value.table = false
    toast.error("Kumaş tipleri getirilirken hata oluştu")
  })
  if (!data.value.succeeded) {
    toast.error(data.value.succeeded || "Kumaş tipleri getirilirken hata oluştu")
  } else {
    list.value = data.value?.data
    tableOptions.value.totalCount = data.value?.totalCount
  }

  loading.value.table = false
}

const handlePageUpdate = async (page: number) => {
  tableOptions.value.page = page
  await fetchFabricTypeList()
}
const handlePerPageUpdate = async (itemsPerPage: number) => {
  tableOptions.value.itemsPerPage = itemsPerPage
  await fetchFabricTypeList()
}

onMounted(async () => {
  await fetchFabricTypeList()
  loading.value.table = false
  search.value.loading = false
})

const handleNewFabricType = () => {
  dialog.value.show = true
  dialog.value.title = "Kumaş Tipi Ekle"
  dialog.value.type = "new"
  model.value = {
    name: "",
    code: "",
    denierCount: "",
    grammage: "",
    width: "",
    colorId: null,
  }
  search.value.query = null
  search.value.items = []
  search.value.searchInput = null
}

const handleSubmit = async () => {
  typeForm.value?.validate()
  if (typeForm.value?.isValid) {
    dialog.value.loading = true
    const url = dialog.value.type === "new" ? "/FabricTypes/AddFabricTypes" : "/FabricTypes/UpdateFabricTypes"
    const response: any = await $axios(url, {
      method: dialog.value.type === "new" ? "POST" : "PUT",
      data: model.value,
    }).catch((err: any) => {
      dialog.value.loading = false
      toast.error(err?.response?.data?.message || "Kumaş tipi eklenirken hata oluştu")
    })
    console.log('response is => ', response)

    const { data, isFinished }: any = response

    dialog.value.loading = false
    if (!data.value.succeeded) {
      toast.error(data.value.message || "Kumaş tipi eklenirken hata oluştu")
    } else {
      toast.success("Kumaş tipi başarıyla eklendi", {autoClose: 1000})
      await fetchFabricTypeList()
      dialog.value.show = false
    }
  }
}

const editItem = (item: any) => {
  model.value = { ...item }
  search.value.query = null
  search.value.items = []
  search.value.searchInput = null


  dialog.value.show = true
  dialog.value.title = "Kumaş Tipi Düzenle"
  dialog.value.type = "edit"
}

const deleteItem = async (item: any) => {
  loading.value.table = true
  const { data, isFinished }: any = await $axios("/FabricTypes/DeleteFabricTypes", {
    method: "DELETE",
    data: { id: item.id },
  }).catch((err: any) => {
    loading.value.table = false
    confirm.value.loading = false
    toast.error("Kumaş tipi silinirken hata oluştu")
  })
  if (!data.value?.succeeded) {
    toast.error(data.value.message || "Kumaş tipi silinirken hata oluştu")
    return false
  } else {
    toast.success("Kumaş tipi başarıyla silindi")
    await fetchFabricTypeList()
  }

  loading.value.table = false
  return true
}


const colorDialog:any = ref({
  show: false,
  loading: false,
  title: "Kumaş Rengi Ekle",
  type: "new",
  pickerShow: false,
});

const colorModel:any = ref({
  name: "",
  rgbCode: "",
  FormFile: null,
  id: null,
})

const colorForm = ref()

const handleSaveColor = async () => {
  colorForm.value?.validate();
  if (colorForm.value?.isValid) {
    colorDialog.value.loading = true;
    const url =
      colorDialog.value.type === "new"
        ? "/Color/AddColors"
        : "/Color/UpdateColors";

    const formData = new FormData();
    formData.append('Name', colorModel.value.name);
    if (colorModel.value.rgbCode) {
      formData.append('RGBCode', colorModel.value.rgbCode);
    }
    if (colorModel.value.FormFile) {
      formData.append('FormFile', colorModel.value.FormFile);
    }
    if(colorDialog.value.type === "edit" && colorModel.value.id) {
      formData.append('Id', colorModel.value.id);
    }

    const { data, isFinished, error }: any = await $axios(url, {
      method: colorDialog.value.type === "new" ? "POST" : "PUT",
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).catch((err: any) => {
      colorDialog.value.loading = false;
      toast.error("Kumaş rengi eklenirken hata oluştu");
    });

    colorDialog.value.loading = false;
    if (!data.value.succeeded) {
      toast.error(data.value.message || "Kumaş rengi eklenirken hata oluştu");
    } else {
      toast.success("Kumaş rengi başarıyla eklendi");

      colorModel.value = {
        name: "",
        rgbCode: "",
        FormFile: null,
        id: null,
      };
      await fetchColorList();
      colorDialog.value.show = false;
    }
  }
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
