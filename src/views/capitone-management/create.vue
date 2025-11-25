<template>
	<div class="page-capitone_management-create">
		<v-form ref="capitoneForm" @submit.prevent>
			<v-row class="">
				<v-col cols="12" md="6">
					<v-card elevation="0" class="capitone-list-wrapper border-1 pa-3" :class="{ mobile: !mdAndUp }" :disabled="page.loading">
						<v-card-title class="mb-4 pa-0">
							<div class="d-flex align-center justify-space-between">
								<span>Kumaş Lisesi</span>
								<v-btn color="primary" variant="flat" flat @click="handleAddCapitoneList">
									<v-icon>mdi-plus</v-icon>
								</v-btn>
							</div>
							<transition name="fade" mode="out-in">
								<div v-if="sourceList.length > 0" class="d-flex align-center justify-space-between mt-2">
									<v-btn
										color="primary"
										variant="text"
										class="w-50"
										size="x-small"
										@click="
                      expandedItems = sourceList.map((_: any, i: any) => i)
                    ">
										<v-icon class="mr-1">mdi-arrow-expand-all</v-icon>
										Hepsini Aç
									</v-btn>
									<v-btn color="primary" variant="text" class="w-50" size="x-small" @click="expandedItems = []">
										<v-icon class="mr-1">mdi-arrow-collapse-all</v-icon>
										Hepsini Kapat
									</v-btn>
								</div>
							</transition>
						</v-card-title>
						<v-expansion-panels class="w-100" multiple v-model="expandedItems" eager>
							<!-- <transition-group name="fade" mode="out-in"> -->
							<BtCapitoneItem
								v-for="(item, index) in sourceList"
								:title="item.title"
								v-model:ball="item.ball"
								v-model:metre="item.metre"
								v-model:fabricTypeId="item.fabricTypeId"
								v-model:isValid="item.valid"
								:fabricTypeList="fabricTypes.noCapitoneList"
								:disabled="item.disabled"
								:is-expanded="expandedItems.includes(index)"
								class="w-100 mb-2 mx-2"
								@delete="expanded => {
                  expandedItems = expandedItems.filter(
                      (item: any) => item !== index
                    );
                    sourceList.splice(index, 1);
                }" />
							<!-- </transition-group> -->
						</v-expansion-panels>
					</v-card>
				</v-col>
				<v-col cols="12" md="1" class="text-center w-100 d-flex align-center justify-center" :style="`height: ${mdAndUp ? '374px' : '50px'}`">
					<v-icon>{{ mdAndUp ? "mdi-arrow-right" : "mdi-arrow-down" }}</v-icon>
				</v-col>
				<v-col cols="12" md="5">
					<v-card elevation="0" class="border-1 pa-3 text-left" :disabled="page.loading">
						<v-card-title class="mb-4 pa-0">
							<span>Gönderilecek Atölye</span>
						</v-card-title>
						<v-autocomplete
							v-model="targetModel.workshopId"
							:items="workshop.list"
							label="Atölye"
							variant="outlined"
							placeholder="Atölye Seçiniz"
							dense
							hide-details="auto"
							:rules="[rules.required]"
							:loading="workshop.loading"
							:item-props="(item: any) => ({ item, title: item.name })"
							item-value="id"
							no-data-text="Atölye bulunamadı"
							class="mb-5" />

						<v-divider class="mt-2 mb-5" />
						<!-- <v-autocomplete
							v-model="targetModel.capitoneFabricTypeId"
							:items="fabricTypes.list"
							label="Kumaş Tipi"
							variant="outlined"
							placeholder="Kumaş Tipi Seçiniz"
							class="mb-5"
							hide-details="auto"
							:rules="[rules.required]"
							:item-props="(item: any) => ({ item, title: item.comboboxValue })"
							item-value="id"
							no-data-text="Kumaş tipi bulunamadı">
							<template v-slot:item="{ item, props }:any">
								<v-list-item @click="refFabricTypeId = item.id">
									<v-list-item-title class="d-flex align-center gap-2">
										<span>{{props.item.code}}</span>
										<span>/</span>
										<span>{{props.item.name}}</span>
										<span>/</span>
										<div>
											<span class="color-square-mini" :style="`background-color: ${props.item.comboboxValue.split('/').pop()}`"></span>
											{{props.item.colorName}}
										</div>
									</v-list-item-title>
								</v-list-item>
							</template>
						</v-autocomplete> -->
<!-- 
						<v-autocomplete
							v-model="targetModel.capitoneFabricTypeId"
							:items="fabricTypes.list"
							label="Kumaş Türü"
							variant="outlined"
							placeholder="Kumaş Türü Seçiniz"
							dense
							hide-details="auto"
							:rules="[rules.required]"
							:item-props="(item: any) => ({ item, title: `${item.code} / ${item.name} / ${item.colorName}` })"
							item-value="id"
							class="mb-5"
							no-data-text="Kumaş türü bulunamadı">
							<template v-slot:item="{ item, props }:any">
								<v-list-item v-bind="props" class="d-flex align-center gap-2"
									><span class="color-square-mini" :style="`background-color: ${props.item.comboboxValue.split('/').pop()};`"></span
								></v-list-item>
							</template>
						</v-autocomplete> -->
            <BtFabricTypeAutocomplete
              v-model="targetModel.capitoneFabricTypeId"
              :items="fabricTypes.list"
              label="Kumaş Tipi"
              class="mb-5"
            />

						<v-text-field
							v-model="targetModel.meterCount"
							label="Metre"
							variant="outlined"
							dense
							hide-details="auto"
							:rules="[rules.required, rules.numeric]"
							class="mb-5" />
						<v-text-field
							v-model="targetModel.ballCount"
							label="Top"
							variant="outlined"
							dense
							hide-details="auto"
							:rules="[rules.required, rules.numeric]"
							class="mb-5" />
						<v-text-field
							v-model="targetModel.price"
							label="Fiyat"
							variant="outlined"
							dense
							hide-details="auto"
							:rules="[rules.required, rules.numeric]"
							:suffix="currentCurrency.symbol"
							class="mb-5" />

						<v-btn
							color="primary"
							elevation="0"
							@click="handleCreateCapitone"
							block
							class="mt-5"
							size="large"
							:disabled="
                !targetModel.workshopId ||
                !targetModel.capitoneFabricTypeId ||
                !targetModel.meterCount ||
                !targetModel.ballCount ||
                !targetModel.price ||
                sourceList.length <= 0 ||
                page.loading
              "
							:loading="page.loading">
							Kapitone Oluştur
						</v-btn>
					</v-card>
				</v-col>
			</v-row>
		</v-form>
	</div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { cloneDeep } from "lodash";
import { $axios } from "../../composables/axios";
import { toast } from "vue3-toastify";
import BtCapitoneItem from "../../components/capitone/BtCapitoneItem.vue";
import { rules } from "../../../config/rules";
import { useDisplay } from "vuetify";
import { useRouter } from "vue-router";
const router = useRouter();
import { currentCurrency } from "../../composables/useCurrentCurrency";
import BtFabricTypeAutocomplete from "../../components/BtFabricTypeAutocomplete.vue";

const { mdAndUp } = useDisplay();
const capitoneForm = ref();
const mockListModel = ref({
  title: "",
  ball: "",
  metre: "",
  fabricTypeId: null,
  disabled: false,
  valid: true,
  form: null,
});

const page = ref({
  loading: false,
});

const expandedItems: any = ref([]);

const targetModel = ref({
  capitoneFabricTypeId: null,
  price: null,
  meterCount: null,
  ballCount: null,
  workshopId: null,
  stationId: null,
  usedFabricForToWorkshops: [],
});
const sourceList: any = ref([]);
const fabricTypes = reactive({
  loading: false,
  list: [],
  noCapitoneList: [],
});
const fetchFabricTypes = async () => {
  fabricTypes.loading = true;
  const { data, error }: any = await $axios("/FabricTypes/GetFabricTypes", {
    method: "GET",
    params: { size: -1, isCapitone: true },
  });
  if (error.value) {
    toast.error(error.message || "Kumaş tipleri getirilirken hata oluştu");
  } else {
    fabricTypes.list = cloneDeep(data.value?.data);
  }
  const { data: noCapitoneData, error: noCapitoneError }: any = await $axios("/FabricTypes/GetFabricTypes", {
    method: "GET",
    params: { size: -1, isCapitone: false },
  });
  if (noCapitoneError.value) {
    toast.error(noCapitoneError.message || "Kumaş tipleri getirilirken hata oluştu");
  } else {
    fabricTypes.noCapitoneList = cloneDeep(noCapitoneData.value?.data);
  }

  fabricTypes.loading = false;
};
await fetchFabricTypes();

const workshop = reactive({
  loading: false,
  selected: null,
  list: [],
});

const stations = reactive({
  loading: false,
  selected: null,
  item: null,
  list: [],
}) as any;

const fetchStationList = async () => {
  stations.loading = true;
  const { data, error }: any = await $axios("/Parameters/GetSituation", {
    method: "GET",
    data: { size: -1 },
  });
  if (error.value) {
    toast.error(error.message || "Departmanlar getirilirken hata oluştu");
  } else {
    stations.list = cloneDeep(data.value?.data);
    stations.item = stations.list.find(
      (item: any) => item.name === "Kapitone"
    );
    console.log(stations.item);
    if (!stations.item?.id) {
      toast.error("Hata: #9297");
    }
  }
  stations.loading = false;
};

await fetchStationList();


const fetchWorkshopList = async () => {
  workshop.loading = true;
  const { data, error }: any = await $axios("/Workshop/GetWorkshops", {
    method: "GET",
    params: { size: -1, situationId: stations.item?.id },
  });
  if (error.value) {
    toast.error(error.message || "Atölyeler getirilirken hata oluştu");
  } else {
    workshop.list = cloneDeep(data.value?.data);
  }
  workshop.loading = false;
};
await fetchWorkshopList();


function handleAddCapitoneList() {
  sourceList.value.unshift(
    cloneDeep({
      ...mockListModel.value,
      title: "Kumaş " + (sourceList.value.length + 1),
    })
  );
  expandedItems.value = [];
}

async function handleCreateCapitone() {
  await capitoneForm.value.validate();
  const isValid = capitoneForm.value.isValid;
  expandedItems.value = [];

  if (!isValid) {
    const oldErrors: any = document.querySelectorAll(".border-red");

    for await (const item of oldErrors) {
      await item.classList.remove("border-red", "box-shadow-1-red");
    }

    const foundedErrorItems = capitoneForm.value.items.filter(
      (item: any) => !item.isValid
    );
    console.log(foundedErrorItems);
    for await (const item of foundedErrorItems) {
      const accordionItem = (await item.vm.parent.parent.parent.parent.parent
        .parent.parent.parent.parent.parent.vnode.el) as HTMLElement;
      await accordionItem.classList.add("border-red", "box-shadow-1-red");
    }
    // console.log(accordionItem, {accordionItem})
    // accordionItem.classList.add("border-red", "box-shadow-1-red")
    toast.error("Lütfen Zorunlu alanları doldurun");
    return;
  } else {
    const oldErrors: any = document.querySelectorAll(".border-red");

    for await (const item of oldErrors) {
      await item.classList.remove("border-red", "box-shadow-1-red");
    }
  }

  const modelpool = {
    ...targetModel.value,
    usedFabricForToWorkshops: sourceList.value.map((item: any) => ({
      ballCount: item.ball,
      meterCount: item.metre,
      fabricTypeId: item.fabricTypeId,
    })),
  };

  send(modelpool);
}

const send = async (modelpool: any) => {
  page.value.loading = true;
  const url = "/FabricCapitoneOrder/AddFabricCapitoneOrder";

  const { data, isFinished, error }: any = await $axios(url, {
    method: "POST",
    data: modelpool,
  }).catch((err: any) => {
    toast.error("Kumaş siparişi eklenirken hata oluştu");
    page.value.loading = false;
  });

  if (!data.value.succeeded) {
    toast.error(data.value.message || "Kumaş siparişi eklenirken hata oluştu");
    page.value.loading = false;
  } else {
    toast.success("Kumaş siparişi başarıyla eklendi");
    page.value.loading = false;
  }
};
</script>

<style>
.capitone-list-wrapper {
  height: 100%;
  max-height: calc(100dvh - 100px);
  overflow-y: scroll !important;
}

.capitone-list-wrapper.mobile {
  max-height: 50dvh !important;
}
</style>
