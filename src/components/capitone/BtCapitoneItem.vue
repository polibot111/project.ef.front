<template>
	<div class="comp-bt-capitone_item">
		<v-expansion-panel elevation="0" class="border-1" :class="{ 'border-red box-shadow-1-red': refIsValid === false }">
			<v-expansion-panel-title v-if="selectedFabricName || refBall || refMetre">
				<v-row style="line-height: 1.3;">
					<v-col cols="12" md="6" class="py-1"> <strong>Top Sayısı:</strong> {{ refBall ? refBall : "" }} </v-col>
					<v-col cols="12" md="6" class="py-1"> <strong>Metre:</strong> {{ refMetre ? refMetre : "" }} </v-col>
					<v-col cols="12" md="12" class="py-1">
						<strong>Kumaş Tipi:</strong>
						{{ selectedFabricName ? selectedFabricName : selectedFabricName }}
					</v-col>
				</v-row>
				<template v-slot:actions="{ expanded }">
					<div class="d-flex align-center">
						<v-icon :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"></v-icon>
						<v-btn icon @click="emit('delete', !props.isExpanded)" color="error" elevation="0" variant="outlined" size="x-small" class="ml-3">
							<v-icon>mdi-trash-can-outline</v-icon>
						</v-btn>
					</div>
				</template>
			</v-expansion-panel-title>
			<v-expansion-panel-title v-else>
				<strong>{{ title }}</strong>
				<template v-slot:actions="{ expanded }">
					<div class="d-flex align-center">
						<v-icon :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"></v-icon>
						<v-btn icon @click="emit('delete', !props.isExpanded)" color="error" elevation="0" variant="outlined" size="x-small" class="ml-3">
							<v-icon>mdi-trash-can-outline</v-icon>
						</v-btn>
					</div>
				</template>
			</v-expansion-panel-title>
			<v-expansion-panel-text class="text-left">
				<v-row class="pt-2">
					<v-col cols="12" md="6">
						<v-text-field
							v-model="refBall"
							label="Top"
							variant="outlined"
							dense
							hide-details="auto"
							:rules="[rules.required, rules.numeric]"
							:disabled="props.disabled"></v-text-field>
					</v-col>
					<v-col cols="12" md="6">
						<v-text-field
							v-model="refMetre"
							label="Metre"
							variant="outlined"
							dense
							hide-details="auto"
							:rules="[rules.required, rules.numeric]"
							:disabled="props.disabled"></v-text-field>
					</v-col>
					<v-col cols="12" md="12">
						<BtFabricTypeAutocomplete
							v-model="refFabricTypeId"
							:items="fabricTypeList"
							label="Kumaş Tipi"
							:disabled="props.disabled"
							:rules="[rules.required]"
							placeholder="Kumaş Tipi Seçiniz"
							no-data-text="Kumaş tipi bulunamadı" />
					</v-col>
				</v-row>
			</v-expansion-panel-text>
		</v-expansion-panel>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { rules } from "../../../config/rules";
import BtFabricTypeAutocomplete from "../BtFabricTypeAutocomplete.vue";

const props = defineProps({
  title: String,
  disabled: Boolean,
  ball: [String, Number],
  metre: [String, Number],
  fabricTypeId: [String, Number],
  fabricTypeList: Array,
  isExpanded: Boolean,
  isValid: Boolean,
}) as any;

const emit = defineEmits([
  "update:ball",
  "update:metre",
  "update:fabricTypeId",
  "update:isValid",
  "delete",
]);

const selectedFabricType: any = ref(null);

const refIsValid = computed({
  get: () => props.isValid,
  set: (value: any) => emit("update:isValid", value),
});

const refBall = computed({
  get: () => props.ball,
  set: async (value: any) => emit("update:ball", value),
});

const refMetre = computed({
  get: () => props.metre,
  set: async (value: any) => emit("update:metre", value),
});

const refFabricTypeId = computed({
  get: () => props.fabricTypeId,
  set: async (value: any) => {
    selectedFabricType.value = props.fabricTypeList.find(
      (item: any) => item.id === value
    );

    return emit("update:fabricTypeId", value);
  },
});
const selectedFabricName = computed(
  () =>
    props.fabricTypeList.find((item: any) => item.id === props.fabricTypeId)
      ?.name
);
onMounted(() => {});
</script>
