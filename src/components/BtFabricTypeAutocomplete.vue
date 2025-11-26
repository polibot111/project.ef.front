<template>
	<v-autocomplete
		v-model:model-value="refFabricTypeId"
		:items="items"
		:label="label"
		:variant="variant"
		:placeholder="placeholder"
		:dense="dense"
		:hide-details="hideDetails"
		:rules="rules"
		:item-props="(item: FabricTypeItem) => ({ item })"
		:item-value="itemValue"
		:class="classes"
		:no-data-text="noDataText"
		:disabled="disabled"
		:loading="loading"
		:custom-filter="customFilterWrapper"
		:chips="chips"
		:multiple="multiple"
		@update:loading="handleLoadingChange">
		<template v-slot:item="{ item: { raw }, props }">
			<v-list-item v-bind="props">
				<template #title>
					<div class="d-flex gap-2 align-center">
						<span>{{ raw.code }}</span>
						<span>/</span>
						<span>{{ raw.name }}</span>
					</div>
				</template>
				<template #subtitle>
					<v-list-item-title class="d-flex align-center gap-2">
						<div class="d-flex align-center gap-1">
							<span v-if="!raw?.colorUrl" class="color-square-mini" :style="`background-color: ${raw?.comboboxValue?.split('/')?.pop()}`"></span>
								<v-img v-else :src="BASE_URL + (raw?.colorUrl || raw?.color?.images?.[2]?.path)" width="14px" class="rounded border border-gray" />
							{{ raw.colorName || raw?.color?.name }}
						</div>
					</v-list-item-title>
				</template>
			</v-list-item>
		</template>
		<template #selection="{ item }">
			<div class="d-flex gap-2 align-center">
				<span>{{ item.raw.code }}</span>
				<span>/</span>
				<span class="">{{ item.raw.name }}</span>
				<span>/</span>
				<div class="d-flex align-center gap-2">
					<span
						v-if="item.raw?.comboboxValue?.split('/')?.pop()"
						class="color-square-mini"
						:style="`background-color: ${item.raw?.comboboxValue?.split('/')?.pop()}`"></span>
						<v-img v-else :src="BASE_URL + (item.raw?.colorUrl || item.raw?.color?.images?.[2]?.path)" width="22px" class="rounded" />
					{{ item.raw.colorName || item.raw?.color?.name }}
				</div>
			</div>
		</template>
		<template #chip="{ item: chipItem }: any">
			<v-chip
				v-if="chipItem && chipItem.props.item?.comboboxValue?.split('/')?.pop()?.trim()"
				:color="chipItem.props.item?.comboboxValue?.split('/')?.pop()?.trim()"
				label
				variant="flat">
				<div class="d-flex align-center gap-2">
					<span>{{ chipItem.raw.code }}</span>
					<span>/</span>
					<span class="">{{ chipItem.raw.name }}</span>
					<span>/</span>
					<div class="d-flex align-center gap-2">
						{{ chipItem?.raw?.colorName || chipItem?.raw?.color?.name }}
					</div>
				</div>
			</v-chip>
			<v-chip v-else class="d-flex align-center gap-2" label variant="outlined">
				<v-img :src="BASE_URL + (chipItem.raw?.colorUrl || chipItem.raw?.color?.images?.[2]?.path)" width="16px" class="rounded py-2 mr-1" />
				<span v-if="chipItem.raw.comboboxValue">{{ chipItem.raw.comboboxValue }}</span>
				<span v-else>{{ chipItem.raw.code }} | {{ chipItem.raw.name }} | {{ chipItem.raw.colorName || chipItem.raw?.color?.name }}</span>
			</v-chip>
		</template>
	</v-autocomplete>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
const BASE_URL = import.meta.env.VITE_BASE_URL;

interface FabricTypeItem {
  id: string | number;
  code: string;
  name: string;
  colorName: string;
  comboboxValue: string;
}

interface AutocompleteItem {
  raw: FabricTypeItem;
}

const props = withDefaults(defineProps<{
  modelValue?: string | number | null;
  items?: FabricTypeItem[] | any[];
  label?: string;
  variant?: 'outlined' | 'plain' | 'filled' | 'underlined' | 'solo' | 'solo-inverted' | 'solo-filled';
  placeholder?: string;
  dense?: boolean;
  hideDetails?: boolean | 'auto';
  rules?: Array<(value: any) => boolean | string>;
  itemValue?: string;
  classes?: string | object | string[];
  noDataText?: string;
  disabled?: boolean;
  loading?: boolean;
  chips?: boolean;
  multiple?: boolean;
}>(), {
  modelValue: '',
  items: () => [],
  label: 'Kumaş Tipi',
  variant: 'outlined',
  placeholder: 'Kumaş Tipi Seçiniz',
  dense: true,
  hideDetails: 'auto',
  rules: () => [],
  itemValue: 'id',
  classes: '',
  noDataText: 'Kumaş tipi bulunamadı',
  disabled: false,
  loading: false,
  chips: false,
  multiple: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number],
  'update:loading': [value: boolean],
  'update:itemValue': [value: string | number],
}>();

const refFabricTypeId = computed({
  get: () => props.modelValue,
  set: (value: string | number) => emit('update:modelValue', value)
});

const customFilter = (item: any, query: string): boolean => {
  const searchText = query.toLowerCase();
  console.log('custom filter', item, query);
  return (
    item.code.toLowerCase().includes(searchText) ||
    item.name.toLowerCase().includes(searchText) ||
    item.colorName.toLowerCase().includes(searchText) ||
	item.comboboxValue.toLowerCase().includes(searchText)
  );
};

const customFilterWrapper = (item: any, search: string, fullItem:any) => {
  console.log('custom filter wrapper', item, search, fullItem);
  return customFilter(fullItem.raw, search);
};

const handleLoadingChange = (isLoading: boolean): void => {
  emit('update:loading', isLoading);
};
</script>
