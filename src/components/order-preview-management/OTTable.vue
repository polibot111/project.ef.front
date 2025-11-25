<template>
	<div class="comp-ot_table">
		<v-data-table-server
			style=" border-radius:0.25rem; padding: 2px; margin: 2px;"
			align="start"
			v-model:items-per-page="props.itemsPerPage"
			v-model:page="props.page"
			:items-per-page-options="props.itemsPerPageOptions"
			:items-per-page-text="props.itemsPerPageText"
			:items-per-page-all="props.itemsPerPageAll"
			:page-text="props.pageText"
			:headers="refHeaders"
			:items="items"
			:items-length="props.totalCount"
			show-current-page
			:hide-default-footer="props.disableFooter"
			density="compact"
			:loading="refLoading"
			:loading-text="props.loadingText"
			:item-value="props.itemValue"
			:group-by="props.groupBy"
			show-expand
			expand-on-click
			@update:page="$emit('page:update', $event)"
			@update:items-per-page="$emit('items-per-page:update')">
			<template v-slot:headers="{ columns, isSorted, getSortIcon, toggleSort }:any">
				<tr class="header-tr" style="border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem;">
					<template v-for="column in columns" :key="column.key">
						<td
							:style="`max-width: ${column?.maxWidth || 'max-content'}; min-width: ${column?.minWidth || 'max-content'}`"
							:class="`text-${column.align} text-primary`">
							<span class="mr-2 cursor-pointer font-weight-bold" @click="() => toggleSort(column)">{{ column.title }}</span>
						</td>
					</template>
				</tr>
			</template>

			<template v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }">
				<tr
					style="background-color: rgba(0,0,0, 0.1);"
					@click="toggleGroup(item)"
					class="cursor-pointer"
					:class="{'bg-primary ml-5': isGroupOpen(item)}">
					<td :colspan="columns.length">
						<VBtn :icon="isGroupOpen(item) ? '$expand' : '$next'" size="small" variant="text"></VBtn>
						<strong>{{ item.value }} ({{ item.items.length }})</strong>
					</td>
				</tr>
			</template>

			<template v-slot:item.fabricTypeDtos="{ item }: any">
				<div class="d-flex flex-wrap gap-1">
					<template v-for="subItem of item.fabricTypeDtos">
						<div class="d-flex align-center">
							<v-chip v-if="subItem?.color?.rgbCode" size="x-small" :color="subItem?.color?.rgbCode" variant="flat" class="ma-1">
								{{subItem?.color?.name }}
							</v-chip>
							<v-tooltip v-else :width="128" :height="128" location="top" content-class="pa-0">
								<template v-slot:activator="{ props }">
									<v-chip v-bind="props" class="d-flex align-center" size="x-small" variant="outlined" color="primary py-2">
										<v-img
											:src="subItem?.color?.images?.[2]?.path || subItem?.color?.images?.[0]?.path"
											width="16"
											height="16"
											class="rounded mr-1"
											cover />
										{{subItem?.color?.name }}
									</v-chip>
								</template>
								<v-img :src="subItem?.color?.images?.[0]?.path" width="128" height="128" cover class="rounded border shadow-sm border-gray" />
							</v-tooltip>
						</div>
					</template>
				</div>
			</template>
			<template v-slot:item.totalCountInStorage="{ item }: any">
				{{ item.orderStorageDTOs.reduce((acc:any, x:any) => acc + x.orderTotalCountInStorage, 0) }}
			</template>

			<template v-slot:item.fabricModelDto="{ item }: any"> {{ item.fabricModelDto?.code }} | {{ item.fabricModelDto?.name }} </template>
			<template v-slot:item.fabricModelAndTypeDTO.fabricModelDTO="{ item }: any">
				{{ props.headers.find((h:any) => h.value === 'fabricModelAndTypeDTO.fabricModelDTO')?.formatter?.(item.fabricModelAndTypeDTO.fabricModelDTO) || (item.fabricModelAndTypeDTO.fabricModelDTO.code ? `${item.fabricModelAndTypeDTO.fabricModelDTO.code} | ${item.fabricModelAndTypeDTO.fabricModelDTO.name}` :  item.fabricModelAndTypeDTO.fabricModelDTO.name) }}
			</template>
			<template v-slot:item.fabricModelAndTypeDTO.fabricTypeDTOs="{ item }: any">
				<div v-for="type of item.fabricModelAndTypeDTO.fabricTypeDTOs" class="d-flex align-center py-1">
					<v-chip v-if="type.color.rgbCode" size="x-small" :color="type.color.rgbCode" variant="flat" class="ma-1">
						{{ type.code }} {{ type.name }} ({{ type?.color?.name }})
					</v-chip>
					<v-tooltip v-else :width="128" :height="128" location="top" content-class="pa-0">
						<template v-slot:activator="{ props }">
							<v-chip v-bind="props" class="d-flex align-center" size="x-small" variant="outlined" color="primary py-2">
								<v-img
									:src="type.color?.images?.[2]?.path || type.color?.images?.[0]?.path"
									width="16"
									height="16"
									class="rounded mr-1"
									cover />
								{{ type.code }} {{ type.name }} ({{ type?.color?.name }})
							</v-chip>
						</template>
						<v-img :src="type.color?.images?.[0]?.path" width="128" height="128" cover class="rounded border shadow-sm border-gray" />
					</v-tooltip>
				</div>


<!-- 				
				<v-chip
					v-for="type of item.fabricModelAndTypeDTO.fabricTypeDTOs"
					:key="type.id"
					size="x-small"
					:color="type.color?.rgbCode"
					variant="flat"
					class="ma-1">
					{{ props.headers.find((h:any) => h.value === 'fabricModelAndTypeDTO.fabricTypeDTOs')?.formatter?.(item.fabricModelAndTypeDTO.fabricTypeDTOs) || `${type.code} ${type.name} (${type.color?.name})` }}
				</v-chip> -->
			</template>

			<template v-slot:item.actions="{ item, index }:any">
				<div>
					<v-tooltip v-if="!item.isCompleted" text="Atölye'ye Gönder" location="top">
						<template v-slot:activator="{ props }">
							<v-icon v-bind="props" class="me-3" color="info" size="small" @click="$emit('send:toWorkshop', {item, $event})"> mdi-factory</v-icon>
						</template>
					</v-tooltip>
					<v-tooltip :text="!item.isCompleted ? 'Teslim Et' : 'Teslim Etmeyi Geri Al'" location="top">
						<template v-slot:activator="{ props }">
							<v-icon v-if="!item.deliverLoading" v-bind="props" class="me-2" color="purple" size="small" @click="$emit('deliver',item, $event)">
								{{ !item.isCompleted ? 'mdi-truck-delivery-outline' : 'mdi-check-circle-outline' }}
							</v-icon>
							<v-progress-circular v-else :size="18" :width="3" class="me-2" color="primary" indeterminate />
						</template>
					</v-tooltip>
					<v-tooltip v-if="!item.fabricSetModelId" text="Ölçü Düzenle" location="top">
						<template v-slot:activator="{ props }">
							<v-icon v-bind="props" class="me-2" color="purple" size="small" @click="$emit('edit:measurement', {item, $event})"> mdi-ruler </v-icon>
						</template>
					</v-tooltip>
					<!-- <v-tooltip text="Düzenle" location="top">
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" class="me-2" color="primary" size="small" @click="$emit('edit', {item, $event})"> mdi-pencil-box-outline </v-icon>
					</template>
				</v-tooltip> -->
					<v-tooltip text="Sil" location="top">
						<template v-slot:activator="{ props }">
							<v-icon v-bind="props" size="small" color="error" @click="$emit('delete', {item, $event})"> mdi-delete-outline</v-icon>
						</template>
					</v-tooltip>
				</div>
			</template>
			<template v-slot:item.exportColumn="{ item }">
				<v-tooltip text="PDF'e Aktar" location="top">
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" size="small" color="orange" class="mx-1" @click="$emit('export:pdf', {item, $event})"> mdi-file-pdf-box</v-icon>
					</template>
				</v-tooltip>
				<v-tooltip text="Excel'e Aktar" location="top">
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" size="small" color="green" class="mx-1" @click="$emit('export:excel', {item, $event})"> mdi-file-excel</v-icon>
					</template>
				</v-tooltip>
			</template>
			<template v-slot:no-data>
				<p class="text-subtitle-1 mt-10 mb-3">Kayıt bulunamadı</p>
			</template>

			<template v-slot:expanded-row="{ item }:any">
				<td :colspan="props.headers.length + 1" class="pb-1">
					<OTOrder v-if="props.type !== 'storage-send'">
						<template #header>
							<div class="d-flex gap-6 align-start">
								<v-row class="align-start mb-5" style="width: 60%;">
									<v-col cols="12" class="mb-0">
										<div class="d-flex w-100 gap-6">
											<div class="w-100">
												<!-- <div>Sipariş Numarası: {{ item.orderNumber }}</div> -->
												<v-card min-height="100%" elevation="0" class="ml-0 pl-0">
													<v-card-text class="mx-2 d-flex gap-3 align-center ml-0 pl-0" style="max-height: 90px; overflow-y: auto;">
														<h6 style="font-size: 18px; font-weight: 600;" class="">Sipariş Numarası:</h6>
														<div class="" style="font-size: 1rem; margin-top: 2px;">{{ item.orderNumber }}</div>
													</v-card-text>
												</v-card>
											</div>
											<div style="height: auto;" class="w-100">
												<v-card min-height="100%" elevation="0">
													<v-card-text style="max-height: 90px; overflow-y: auto;" class="mx-2 d-flex gap-3 ml-0 pl-0">
														<h6 style="font-size: 18px; font-weight: 600;" class="">Ürün:</h6>
														<div class="" style="font-size: 1rem;margin-top: 2px;">{{ item.fabricModelDto.name }}</div>
													</v-card-text>
												</v-card>
											</div>
										</div>
									</v-col>
									<v-col cols="12" class="py-0">
										<v-divider class="mb-6"></v-divider>
										<div class="d-flex flex-wrap gap-6 pl-0 align-start">
											<OTOrderItem
												v-for="order of item.orderItemsDto"
												:name="order.measurementDTO.name"
												:count="order.count"
												class="mb-0"
												:size="`${order.measurementDTO.width}x${order.measurementDTO.height}`" />
										</div>
									</v-col>
								</v-row>
								<v-row class="mt-0" style="max-width: 40%">
									<v-col cols="12" class="pt-0">
										<v-card color="primary" variant="outlined">
											<v-card-text class="mx-2" style="min-height: 210px; overflow-y: auto;">
												<h6 style="font-size: 18px; font-weight: 600; min-width: 110px;" class="mb-3 text-black">Kumaş Tipleri:</h6>
												<div class="d-flex gap-1 flex-column" style="max-height: 340px; overflow: auto;">
													<div
														v-for="ftItem of item.fabricTypeDtos"
														style="font-size: 1rem; border-radius:6px; background-color:rgba(var(--v-theme-primary), 0.1)"
														class="d-flex w-100 gap-2  text-primary pa-2 align-center">
														<div style="white-space: wrap; word-wrap: break-word; line-height: 1.14; border: 1px" class="">{{ ftItem.name }}</div>
														<div
															class="text-subtitle-2"
															style="flex: 1 1 auto; max-width: 100%; word-break: break-all; white-space: normal; text-align: right;">
															<!-- <v-chip :color="ftItem.color.rgbCode" variant="flat" size="x-small">
																{{ ftItem.color.name }}
															</v-chip> -->
															<div class="d-flex align-center">
																<v-chip v-if="ftItem.color?.rgbCode" size="x-small" :color="ftItem.color.rgbCode" variant="flat" class="ma-1">
																	{{ ftItem.color.name }}
																</v-chip>
																<v-tooltip v-else :width="128" :height="128" location="top" content-class="pa-0">
																	<template v-slot:activator="{ props }">
																		<v-chip v-bind="props" class="d-flex align-center" size="x-small" variant="outlined" color="primary py-2">
																			<v-img
																				:src="ftItem.color?.images?.[2]?.path || ftItem.color?.images?.[0]?.path"
																				width="16"
																				height="16"
																				class="rounded mr-1"
																				cover />
																			{{ ftItem.color.name }}
																		</v-chip>
																	</template>
																	<v-img
																		:src="ftItem.color?.images?.[0]?.path"
																		width="128"
																		height="128"
																		cover
																		class="rounded border shadow-sm border-gray" />
																</v-tooltip>
															</div>
														</div>
													</div>
												</div>
											</v-card-text>
										</v-card>
									</v-col>
								</v-row>
							</div>
						</template>
					</OTOrder>
					<OTOrder v-else-if="props.type === 'storage-send'">
						<template #header>
							<div class="d-flex gap-6 align-start">
								<v-row class="align-start mb-5" style="width: 60%;">
									<v-col cols="12" class="py-0">
										<v-divider class="mb-6"></v-divider>
										<div class="d-flex flex-wrap gap-6 pl-0 ma-0 align-start">
											<v-data-table-server
												:items="item.orderStorageDTOs"
												:items-length="-1"
												:headers="props.thirdDeepHeaders"
												:header-props="{ class: 'bg-primary' }"
												class="rounded border"
												density="compact"
												:items-per-page="-1"
												hide-default-footer
												show-expand
												expand-on-click>
												<template v-slot:item.actions="{ item:actionItem, index }:any">
													<div>
														<v-tooltip text="Sil" location="top">
															<template v-slot:activator="{ props }">
																<v-icon v-bind="props" size="small" color="error" @click="$emit('storage:delete', {item,actionItem, $event})">
																	mdi-delete-outline</v-icon
																>
															</template>
														</v-tooltip>
													</div>
												</template>

												<template v-slot:expanded-row="{ item:thirdDeepItem }:any">
													<td :colspan="props.headers.length + 1" class="pa-3">
														<v-data-table-server
															:items="thirdDeepItem.orderStorageItemDTOs"
															:items-length="-1"
															:headers="[{title: 'Toplam Adet', value: 'totalCount'}]"
															:header-props="{ class: 'bg-grey-lighten-1' }"
															class="rounded border"
															density="compact"
															:items-per-page="-1"
															hide-default-footer
															show-expand
															expand-on-click>
															<template v-slot:expanded-row="{ item:fourthDeepItem }:any">
																<td :colspan="props.headers.length + 1" class="pa-3">
																	<v-data-table-server
																		:items="fourthDeepItem.orderStorageItemInOrderStorageDTOs"
																		:items-length="-1"
																		:headers="[
																			{title: 'Adet', value: 'count'},
																			{title: 'Ölçü Adı', value: 'measurement.name'},
																			{title: 'Yükseklik', value: 'measurement.height'},
																			{title: 'Genişlik', value: 'measurement.width'},
																			{title: '', value: 'actions'}
																		]"
																		:header-props="{ class: 'bg-grey-lighten-3' }"
																		class="rounded border"
																		density="compact"
																		:items-per-page="-1"
																		hide-default-footer
																		:show-expand="false">
																		<!-- <template v-slot:expanded-row="{ item:fifthDeepItem }:any">
																			<td :colspan="props.headers.length + 1" class="pa-3">
																				
																			</td>
																		</template> -->

																		<template v-slot:item.actions="{ item:actionItem, index }:any">
																			<div>
																				<v-tooltip text="Düzenle" location="top">
																					<template v-slot:activator="{ props }">
																						<v-icon
																							v-bind="props"
																							class="me-2"
																							color="primary"
																							size="small"
																							@click="$emit('edit:measurement', {item,actionItem, thirdDeepItem,fourthDeepItem, $event})">
																							mdi-pencil-box-outline
																						</v-icon>
																					</template>
																				</v-tooltip>
																				<v-tooltip text="Sil" location="top">
																					<template v-slot:activator="{ props }">
																						<v-icon
																							v-bind="props"
																							size="small"
																							color="error"
																							@click="$emit('measure:delete', {item,actionItem, thirdDeepItem,fourthDeepItem, $event})">
																							mdi-delete-outline</v-icon
																						>
																					</template>
																				</v-tooltip>
																			</div>
																		</template>
																	</v-data-table-server>
																</td>
															</template>
														</v-data-table-server>
													</td>
												</template>
											</v-data-table-server>
										</div>
									</v-col>
								</v-row>
								<!-- <v-row class="mt-0" style="max-width: 40%">
									<v-col cols="12" class="pt-0">
										<v-card color="primary" variant="outlined">
											<v-card-text class="mx-2" style="min-height: 210px; overflow-y: auto;">
												<h6 style="font-size: 18px; font-weight: 600; min-width: 110px;" class="mb-3 text-black">Kumaş Tipleri:</h6>
												<div class="d-flex gap-1 flex-column" style="max-height: 340px; overflow: auto;">
													<div
														v-for="ftItem of item.fabricTypeDtos"
														style="font-size: 1rem; border-radius:6px; background-color:rgba(var(--v-theme-primary), 0.1)"
														class="d-flex w-100 gap-2  text-primary pa-2 align-center">
														<div style="white-space: wrap; word-wrap: break-word; line-height: 1.14; border: 1px" class="">{{ ftItem.name }}</div>
														<div
															class="text-subtitle-2"
															style="flex: 1 1 auto; max-width: 100%; word-break: break-all; white-space: normal; text-align: right;">
															<v-chip :color="ftItem.color.rgbCode" variant="flat" size="x-small">
																{{ ftItem.color.name }}
															</v-chip>
														</div>
													</div>
												</div>
											</v-card-text>
										</v-card>
									</v-col>
								</v-row> -->
							</div>
						</template>
					</OTOrder>
				</td>
			</template>
		</v-data-table-server>
	</div>
</template>

<script lang="ts" setup>
import {computed, defineProps, ref} from 'vue'
import OTOrder from './OTOrder.vue'
import OTOrderItem from './OTOrderItem.vue'


import $axios from "../../composables/axios"

const props:any = defineProps({
    headers: {
        type: Array,
        default: () => [{ text: '#', value: 'actions' }],
    },
    items: Array,
	type: {
		type: String,
		default: 'other'
	},
	groupBy: {
		type: Array,
		default: () => []
	},
	thirdDeepHeaders: {
		type: Array,
		default: () => []
	},

    loading: Boolean,


    itemsPerpage: Number,
    itemsPerPageOptions: Array,
    itemsPerPageText: String,
    itemsPerPageAll: String,
    pageText: String,
    totalCount: Number,
	itemValue: {
		type: String,
		default: 'id'
	},

    showDelete: {
        type: Boolean,
        default: true,
    },
    showEdit: {
        type: Boolean,
        default: true,
    },
    disableFooter: {
        type: Boolean,
        default: false,
    },

})


const refHeaders = computed({
    get: () => props.headers,
    set: (value:any) => (props.headers = value)
})

const refLoading = computed({
    get: () => props.loading,
    set: (value:any) => (props.loading = value)
})

const emit = defineEmits(['edit', 'delete', 'page:update', 'items-per-page:update', 'deliver', 'edit:measurement', 'send:toWorkshop', 'export:pdf', 'export:excel', 'measure:edit', 'measure:delete', 'storage:delete'])
// Color List
const colorList = ref([])
const colorHexList: any = ref({})
  const { data, isFinished } = await $axios("/Color/GetColors")

  if (data.value.succeeded) {
    colorList.value = data.value.data

    colorHexList.value = data.value.data.reduce((acc: any, item: any) => {
      acc[item.id] = item
      return acc
    }, {})
  }
</script>

<style>
.page-order_preview_management-preview .header-tr {
    background-color: rgba(var(--v-theme-primary), 0.07);
}
.page-order_preview_management-preview table {
  border: 1px solid rgba(var(--v-theme-primary), 0.3);
  margin-left: 0;
  border-radius: 0.25rem;
  padding-bottom: 8px;
}
</style>
