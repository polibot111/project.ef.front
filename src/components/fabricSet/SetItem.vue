<template>
	<v-expansion-panel size="small" :color="color" class="comp-set_item">
		<template v-slot:title>
			<v-row class="py-1">
				<v-col v-if="!refFabricModelName || !refCount" cols="12" sm="6">
					<v-subheader class="text-small-1">
						{{ props.title }}
					</v-subheader>
				</v-col>
				<v-col v-if="refFabricModelName" cols="12" sm="6">
					<v-subheader class="text-small-1">
						{{ refFabricModelName }}
					</v-subheader>
				</v-col>
				<v-col v-if="refCount" cols="12" sm="6">
					<v-subheader>Set Birim Adet: {{ refCount }} </v-subheader>
				</v-col>
			</v-row>
		</template>
		<template v-slot:text>
			<v-row class="">
				<v-col cols="12" sm="6">
					<v-text-field
						color="primary"
						class="bg-white"
						style="border-radius: 0.25rem"
						v-model="refCount"
						label="Birim Adet"
						:rules="[rules.required]"
						size="small"
						dense
						variant="outlined"
						:readonly="props.readonly"
						hide-details="auto" />
				</v-col>
				<v-col cols="12" sm="6">
					<v-autocomplete
						color="primary"
						class="bg-white"
						style="border-radius: 0.25rem"
						v-model="refFabricModelId"
						:items="refFabricModelsList"
						label="Ürün"
						variant="outlined"
						placeholder="Ürün Seçiniz"
						dense
						hide-details="auto"
						:rules="[rules.required]"
						:item-props="(item: any) => ({ item, title: item.name })"
						item-value="id"
						:loading="loading.fabricModels"
						no-data-text="Ürün bulunamadı"
						:readonly="props.readonly"
						@update:model-value="handleUpdateModelName" />
				</v-col>
				<v-col cols="12" sm="6">
					<!-- <v-autocomplete
						color="primary"
						class="bg-white"
						style="border-radius: 0.25rem"
						v-model="refFabricTypeId"
						:items="refFabricTypesList"
						label="Kumaş Tipi"
						variant="outlined"
						placeholder="Kumaş Tipi Seçiniz"
						multiple
						chips
						hide-details="auto"
						:rules="[rules.required]"
						:item-props="(item: any) => ({ item, title: item.name })"
						item-value="id"
						:loading="loading.fabricTypes"
						:readonly="props.readonly"
						no-data-text="Kumaş türü bulunamadı">
						<template #selection="{ item: chipItem }: any">
							<v-chip v-if="chipItem" color="primary" label>
								{{ chipItem.name }}
							</v-chip>
						</template>
					</v-autocomplete> -->

					<BtFabricTypeAutocomplete
						v-model="refFabricTypeId"
						:items="refFabricTypesList"
						label="Kumaş Tipi"
						:readonly="props.readonly"
						:rules="[rules.required]"
						placeholder="Kumaş Tipi Seçiniz"
						no-data-text="Kumaş tipi bulunamadı"
						multiple
						chips />
				</v-col>
				<v-col cols="12" sm="6">
					<div class="d-flex align-center">
						<v-tooltip v-if="!props.readonly" text="Yeni Ölçü Ekle" location="top">
							<template v-slot:activator="{ props }">
								<v-icon v-bind="props" class="me-2" color="success" size="small" @click="measurementDialog?.show()"> mdi-plus-circle-outline </v-icon>
							</template>
						</v-tooltip>
						<v-autocomplete
							color="primary"
							class="bg-white"
							style="border-radius: 0.25rem"
							v-model:model-value="refMeasurements"
							:items="refMeasurementList"
							label="Ölçü Tipi"
							variant="outlined"
							placeholder="Ölçü Seçiniz"
							multiple
							chips
							hide-details="auto"
							:rules="[rules.required]"
							:item-props="(item: any) => {
								console.log('item', item)
							return { item, title: `${item?.name} (${item?.width}x${item?.height})`, value: item?.id };
						}"
							:readonly="props.readonly"
							:loading="loading.measurement"
							no-data-text="Ölçü bulunamadı" />

						<v-tooltip v-if="isEdit" text="Ölçü Ekle" location="top">
							<template v-slot:activator="{ props }">
								<v-btn v-bind="props" color="primary" variant="tonal" size="small" icon class="ml-2 mt-1">
									<v-icon size="14px"> mdi-plus </v-icon>
								</v-btn>
							</template>
						</v-tooltip>
					</div>
				</v-col>
				<v-col v-if="props.showDelete" cols="12" class="py-0 mt-0 mb-3 text-right">
					<v-btn color="error" variant="flat" class="mt-2" @click="emit('remove')"> <v-icon> mdi-delete-outline </v-icon> Kaldır </v-btn>
				</v-col>
			</v-row>
		</template>
		<MeasurementDialog ref="measurementDialog" @refresh="fetchMeasurementList" />
	</v-expansion-panel>
</template>
<script lang="ts" setup>
import { computed, defineProps, defineEmits, ref } from "vue";
import { rules } from "../../../config/rules";
import BtFabricTypeAutocomplete from "../BtFabricTypeAutocomplete.vue";
import $axios from "../../composables/axios";
import { toast } from "vue3-toastify";
import MeasurementDialog from "../../components/MeasurementDialog.vue";
const measurementDialog = ref()

import { PropType } from "vue";

const props:any = defineProps({
	fabricModelsList: Object as PropType<any>,
	fabricTypesList: Object as PropType<any>,
	measurementList: Object as PropType<any>,

	fabricModelName: String,
	fabricModelId: String,
	fabricTypeId: Array,
	measurements: Array,
	count: [Number, String],
	title: String,
	color: {
		type: String,
		default: "white",
	},
	showDelete: {
		type: Boolean,
		default: false,
	},
	readonly: {
		type: Boolean,
		default: false,
	},
});
const emit = defineEmits([
	"update:fabricModelsList",
	"update:fabricTypesList",
	"update:measurementList",

	"update:fabricModelName",
	"update:fabricModelId",
	"update:fabricTypeId",
	"update:measurements",
	"update:count",
	"remove",
	"refresh:measurementList",
]);

const isEdit = ref(false);

function handleUpdateMeasurements(value: any) {
	console.log("value", value);
	// listenin id si, dışarıdan gelenin setFabricModelMeasurementId si aynı

	console.log("list", refMeasurementList.value);
	const findItems = refMeasurementList.value.filter((x: any) =>
		value.includes(x.id)
	);
	refMeasurements.value = findItems;
	console.log("findItems", findItems);
}

const refFabricModelName = computed({
	get: () => props.fabricModelName,
	set: (value) => {
		emit("update:fabricModelName", value);
	},
});

const refCount = computed({
	get: () => props.count,
	set: (value) => {
		emit("update:count", value);
	},
});

const refFabricModelId = computed({
	get: () => props.fabricModelId,
	set: (value) => {
		emit("update:fabricModelId", value);
	},
});

const refFabricTypeId = computed({
	get: () => props.fabricTypeId,
	set: (value) => {
		emit("update:fabricTypeId", value);
	},
});

const refMeasurements = computed({
	get: () => {
		return props.measurements.map((x: any) => {
			return props.measurementList.find((y:any) => y.id === (x?.measurementDTO?.id || x?.fabricSetModelMeasurementId))?.id
		});

	},
	set: (value: any[]) => {
		const newValue = value.map((x: any) => {
			const finded = props.measurementList.find((y:any) => y.id === x)
			return {
				...finded,
				fabricSetModelMeasurementId: x,
			};
		});
		emit("update:measurements", newValue);
	},
});

const refFabricModelsList = computed({
	get: () => props.fabricModelsList,
	set: (value) => {
		emit("update:fabricModelsList", value);
	},
});

const refFabricTypesList = computed({
	get: () => props.fabricTypesList,
	set: (value) => {
		emit("update:fabricTypesList", value);
	},
});

const refMeasurementList = computed({
	get: () => props.measurementList,
	set: (value) => {
		emit("update:measurementList", value);
	},
});

function handleUpdateModelName(event: any) {
	console.log("event", event);
	const finded = refFabricModelsList.value.find((x: any) => x.id === event);
	refFabricModelName.value = finded.name;
}

const loading = ref({
	fabricModels: false,
	fabricTypes: false,
	measurement: false,
});

const measurementList = ref({
    loading: false,
	items: [],
});

const fetchMeasurementList = async () => {
	emit('refresh:measurementList')
    // measurementList.value.loading = true
    // const { data, error }: any = await $axios("/Meansure", {
    //     method: "GET",
    //     params: {
    //         page: 1,
    //         size: -1,
    //     },
    // }).catch((err: any) => {
    //     toast.error(err.message || "Ölçüler getirilirken hata oluştu");
    //     measurementList.value.loading = false
    // });
    // if (error.value) {
    //     toast.error(error.message || "Ölçüler getirilirken hata oluştu");
    // } else {
    //     measurementList.value.items = data.value.data;
    // }
    // measurementList.value.loading = false
};
</script>

<style>
.comp-set_item .v-expansion-panel .v-expansion-panel-title {
	padding: 0.05rem 1rem !important;
	font-size: 14px !important;
	font-weight: 500;
	border: 1px solid var(--bt-border-color) !important;
	border-bottom: 1px solid transparent !important;
}

.comp-set_item .v-expansion-panel:last-child .v-expansion-panel-title {
	border-bottom: 1px solid var(--bt-border-color) !important;
}

.comp-set_item .v-expansion-panel .v-expansion-panel-title--active {
	border-bottom: 1px solid var(--bt-border-color) !important;
}

.comp-set_item .v-expansion-panel-text__wrapper {
	padding: 1rem 1rem !important;
	border: 1px solid var(--bt-border-color) !important;
	border-top: 0 !important;
}
</style>
