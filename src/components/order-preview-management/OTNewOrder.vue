<template>
	<BtModal
		class="comp-ot_new_order"
		v-model:show="refShow"
		v-model:loading="refLoading"
		:title="refTitle"
		:width="props.modalType !== 'addOrder' ? '100%' : '600px'"
		@save="$emit('save', modelpool)">
		<template #content>
			<v-row>
				<v-col v-if="props.modalType !== 'addOrder'" cols="12" sm="6">
					<v-card color="primary" variant="outlined" elevation="0" class="mx-3">
						<v-card-text class="">
							<v-form ref="customerForm" @submit.prevent>
								<v-row>
									<v-col cols="12" sm="6">
										<v-autocomplete
											color="primary"
											class="bg-white"
											density="compact"
											style="border-radius: 0.25rem"
											v-model="modelpool.personel"
											:items="personelList.items"
											label="Personel"
											variant="outlined"
											placeholder="Personel Seçininiz"
											dense
											:loading="personelList.loading"
											:disabled="personelList.loading"
											hide-details="auto"
											:rules="[rules.required]"
											:item-props="(item: any) => ({ item, title: item.name })"
											item-value="id"
											no-data-text="Personel listesi bulunamadı" />
									</v-col>
									<v-col cols="12" sm="6">
										<v-autocomplete
											color="primary"
											class="bg-white"
											density="compact"
											style="border-radius: 0.25rem"
											v-model="modelpool.customer"
											:items="customerList.items"
											:loading="customerList.loading"
											:disabled="customerList.loading"
											label="Müşteri"
											variant="outlined"
											placeholder="Müşteri Seçininiz"
											dense
											hide-details="auto"
											:rules="[rules.required]"
											:item-props="(item: any) => ({ item, title: item.name })"
											item-value="id"
											no-data-text="Müşteri listesi bulunamadı" />
									</v-col>
									<v-col cols="12" sm="12">
										<v-textarea
											color="primary"
											density="compact"
											v-model="modelpool.note"
											label="Sipariş Notu"
											dense
											variant="outlined"
											hide-details="auto"></v-textarea>
									</v-col>
								</v-row>
							</v-form>
						</v-card-text>
					</v-card>
				</v-col>

				<v-col cols="12" :sm="props.modalType !== 'addOrder' ? 6 : 12">
					<v-card
						color="primary"
						variant="outlined"
						elevation="0"
						class="mx-3"
						style="height: 255px; overflow-y: auto;"
						:disabled="props.modalType === 'edit'">
						<v-card-text class="d-flex flex-column">
							<div class="mb-5 d-flex justify-space-between">
								<h3>Set Ekle</h3>
								<v-btn color="primary" elevation="0" @click="modelpool.sets.push(cloneDeep(mockSet))">+</v-btn>
							</div>

							<div class="d-flex gap-1" v-for="set of modelpool.sets">
								<v-autocomplete
									color="primary"
									class="bg-white"
									style="border-radius: 0.25rem; max-height: 40px;"
									v-model="set.setId"
									:items="setList.items"
									:loading="setList.loading"
									:disabled="setList.loading"
									label="Set"
									variant="outlined"
									placeholder="Set Seçininiz"
									density="compact"
									hide-details
									:rules="[rules.required]"
									:item-props="(item: any) => ({ item, title: item.name })"
									item-value="id"
									no-data-text="Set listesi bulunamadı" />
								<v-text-field density="compact" variant="outlined" v-model="set.count" placeholder="Adet" max-width="100px" />
								<v-btn
									color="error"
									elevation="0"
									variant="tonal"
									height="40px"
									size="small"
									@click="modelpool.sets.splice(modelpool.sets.indexOf(set), 1)">
									<v-icon>mdi-delete-outline</v-icon>
								</v-btn>
							</div>
						</v-card-text>
					</v-card>
				</v-col>

				<v-col cols="12" sm="12">
					<v-card color="primary" variant="outlined" elevation="0" class="mx-3" style="min-height: 232px; max-height: 600px; overflow-y: auto;">
						<v-card-text class="d-flex flex-column">
							<div class="mb-5 d-flex justify-space-between">
								<h3>Ürün Ekle</h3>
								<v-btn color="primary" elevation="0" :disabled="props.modalType === 'edit'" @click="modelpool.orderList.push(cloneDeep(mockOrder))"
									>+</v-btn
								>
							</div>
							<div>
								<v-expansion-panels v-model="orderActivePanel" class="w-100 d-block">
									<template v-for="order of modelpool.orderList">
										<div>
											<v-expansion-panel class="w-100 mb-3 pb-0" elevation="0" color="primary" variant="tonal">
												<template #title>
													<div class="d-flex justify-space-between align-center w-100">
														<h3>Ürün: {{ order?.fabricModel?.name || '' }}</h3>
														<v-dialog v-model="order.showDeleteConfirm" persistent max-width="340">
															<template v-slot:activator="{ props }">
																<v-btn color="error" elevation="0" size="x-small" icon v-bind="props">
																	<v-icon size="small">mdi-delete-outline</v-icon>
																</v-btn>
															</template>
															<v-card>
																<v-card-title class="text-h6">Silmek istediğinize emin misiniz?</v-card-title>
																<v-card-actions>
																	<v-spacer></v-spacer>
																	<v-btn color="gray" variant="text" @click="order.showDeleteConfirm = false">İptal</v-btn>
																	<v-btn color="error" variant="tonal" @click="modelpool.orderList.splice(modelpool.orderList.indexOf(order), 1)"
																		>Sil</v-btn
																	>
																</v-card-actions>
															</v-card>
														</v-dialog>
													</div>
												</template>
												<template #text>
													<div class="mx-2 my-3">
														<v-row class="mt-3">
															<v-col cols="12" sm="6">
																<v-autocomplete
																	color="primary"
																	class="bg-white"
																	density="compact"
																	style="border-radius: 0.25rem"
																	v-model="order.fabricModel"
																	:items="fabricModelList.items"
																	:loading="fabricModelList.loading"
																	:disabled="fabricModelList.loading || props.modalType === 'edit'"
																	label="Ürün"
																	variant="outlined"
																	placeholder="Ürün seçininiz"
																	dense
																	hide-details="auto"
																	:rules="[rules.required]"
																	:item-props="(item: any) => ({ item, title: item.name })"
																	return-object
																	no-data-text="Ürün listesi bulunamadı"
															/></v-col>
															<v-col cols="12" sm="6">
																<BtFabricTypeAutocomplete
																	v-model="order.fabricTypes"
																	:items="fabricTypeList.items"
																	:loading="fabricTypeList.loading"
																	:disabled="fabricTypeList.loading || props.modalType === 'edit'"
																	label="Kumaş Tipi"
																	placeholder="Kumaş tipi seçininiz"
																	:rules="[rules.required]"
																	return-object
																	multiple
																	chips
																	density="compact"
																	no-data-text="Kumaş tipi listesi bulunamadı" />
															</v-col>
															<v-col cols="12" sm="12">
																<v-divider class="mb-6" />
																<div>
																	<v-btn
																		color="primary"
																		variant="tonal"
																		elevation="0"
																		:disabled="order.measurements.length === measurementList.items.length || props.modalType === 'edit'"
																		@click="order.measurements.push(cloneDeep(mockMeasurement))"
																		>+</v-btn
																	>
																</div>

																<v-row class="w-100 mt-2">
																	<v-col cols="12" xl="4" v-for="mItem of order.measurements">
																		<div class="d-flex gap-1 align-center">
																			<v-tooltip text="Yeni Ölçü Ekle" location="top">
																				<template v-slot:activator="{ props }">
																					<v-icon v-bind="props" class="me-2" color="success" size="small" @click="measurementDialog?.show()">
																						mdi-plus-circle-outline
																					</v-icon>
																				</template>
																			</v-tooltip>
																			<v-autocomplete
																				color="primary"
																				class="bg-white"
																				style="border-radius: 0.25rem; max-height: 40px;"
																				v-model="mItem.measurementId"
																				:items="measurementList.items"
																				:loading="measurementList.loading"
																				:disabled="measurementList.loading || props.modalType === 'edit'"
																				label="Ölçü"
																				variant="outlined"
																				placeholder="Ölçü Seçininiz"
																				density="compact"
																				hide-details
																				:rules="[rules.required]"
																				:item-props="(item: any) => ({ item, title: item.name })"
																				item-value="id"
																				no-data-text="Ölçü listesi bulunamadı" />
																			<v-text-field
																				density="compact"
																				variant="outlined"
																				v-model="mItem.count"
																				placeholder="Adet"
																				max-width="100px"
																				:disabled="props.modalType === 'edit'"
																				hide-details="auto" />
																			<v-btn
																				color="error"
																				elevation="0"
																				variant="tonal"
																				height="40px"
																				size="small"
																				:disabled="props.modalType === 'edit'"
																				@click="order.measurements.splice(order.measurements.indexOf(mItem), 1)">
																				<v-icon>mdi-delete-outline</v-icon>
																			</v-btn>
																		</div>
																	</v-col>
																</v-row>
															</v-col>
														</v-row>
													</div>
													<!-- measurements -->
												</template>
											</v-expansion-panel>
										</div>
									</template>
								</v-expansion-panels>
							</div>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
			<MeasurementDialog ref="measurementDialog" @refresh="fetchMeasurementList" />
		</template>
	</BtModal>
</template>
<script lang="ts" setup>
import { defineProps, defineEmits, computed, reactive, ref, onMounted, watch } from "vue";
import { rules } from "../../../config/rules";
import BtModal from '../BtModal.vue';
import { cloneDeep } from 'lodash';
import $axios from "../../composables/axios";
import { toast } from "vue3-toastify";
import BtFabricTypeAutocomplete from "../BtFabricTypeAutocomplete.vue";
import MeasurementDialog from "../../components/MeasurementDialog.vue";

const measurementDialog = ref()
const props = defineProps({
    show: Boolean,
    loading: Boolean,
    title: String,
    modalType: String,
    item: {
        type: Object,
        default: () => {},
    }
});
const emit = defineEmits(['save', 'update:show', 'update:loading', 'update:title']);

const refShow = computed({
    get: () => props.show,
    set: (value: any) => emit('update:show', value),
});
const refLoading = computed({
    get: () => props.loading,
    set: (value: any) => emit('update:loading', value),
});
const refTitle = computed({
    get: () => props.title,
    set: (value: any) => emit('update:title', value),
});

const mockSet: any = reactive({
    setId: null,
    count: null,
});
const mockMeasurement: any = reactive({
    measurementId: null,
    count: null,
});

watch(() => refShow.value, (newVal: boolean) => {
    if (!newVal) {
        modelpool.personel = null;
        modelpool.customer = null;
        modelpool.note = null;
        modelpool.sets = [];
        modelpool.orderList = [];
    }
})
const mockOrder: any = reactive({
    fabricModel: null,
    fabricTypes: [],
    measurements: [cloneDeep(mockMeasurement)],
});

const modelpool: any = reactive({
    personel: null,
    customer: null,
    note: null,
    sets: [],
    orderList: [],

});

const orderActivePanel: any = ref(null);
const personelList = ref({
    loading: false,
    items: [],
});
const customerList = ref({
    loading: false,
    items: [],
});
const setList = ref({
    loading: false,
    items: [],
});
const fabricTypeList = ref({
    loading: false,
    items: [],
});
const fabricModelList = ref({
    loading: false,
    items: [],
});
const measurementList = ref({
    loading: false,
    items: [],
});

const fetchStaffList = async (): Promise<void> => {
    personelList.value.loading = true;
    const { data }: any = (await $axios("/OrderOwner", {
        method: "GET",
        params: {
            page: 1,
            size: -1
        },
    }).catch((err: any) => {
        console.log("err is => ", err);
        toast.error(err.message || "Personel listesi getirilirken hata oluştu");
    })) as any;
    if (!data.value.succeeded) {
        console.log("data.value", data.value);
        toast.error(data.value.message || "Personel listesi getirilirken hata oluştu");
    } else {
        personelList.value.items = data.value.data;
    }

    personelList.value.loading = false;
};

const fetchCustomerList = async (): Promise<void> => {
    customerList.value.loading = true;
    const { data }: any = (await $axios("/Customer/GetCustomers", {
        method: "GET",
        params: {
            page: 1,
            size: -1
        },
    }).catch((err: any) => {
        console.log("err is => ", err);
        toast.error(err.message || "Müşteri listesi getirilirken hata oluştu");
    })) as any;
    if (!data.value.succeeded) {
        console.log("data.value", data.value);
        toast.error(data.value.message || "Müşteri listesi getirilirken hata oluştu");
    } else {
        customerList.value.items = data.value.data;
    }
    customerList.value.loading = false;
};

const fetchFabricSetList = async (): Promise<void> => {
    const { data }: any = (await $axios("/SetFabricModel", {
        method: "GET",
        params: {
            page: 1,
            size: -1
        },
    }).catch((err: any) => {
        toast.error(err.message || "Set listesi getirilirken hata oluştu");
    })) as any;
    if (!data.value.succeeded) {
        toast.error(data.value.message || "Set listesi getirilirken hata oluştu");
    } else {
        setList.value.items = data.value.data;
    }

    setList.value.loading = false;
};

const fetchFabricTypeList = async () => {
    fabricTypeList.value.loading = true
    const { data, isFinished }: any = await $axios("/FabricTypes/GetFabricTypes", {
        method: "GET",
        params: {
            page: 1,
            size: -1,
        },
    }).catch((err: any) => {
        fabricTypeList.value.loading = false
        toast.error("Kumaş tipleri getirilirken hata oluştu")
    })
    if (!data.value.succeeded) {
        toast.error(data.value.succeeded || "Kumaş tipleri getirilirken hata oluştu")
    } else {
        fabricTypeList.value.items = data.value.data
    }

    fabricTypeList.value.loading = false
}

const fetchMeasurementList = async () => {
    measurementList.value.loading = true
    const { data, error }: any = await $axios("/Meansure", {
        method: "GET",
        params: {
            page: 1,
            size: -1,
        },
    }).catch((err: any) => {
        toast.error(err.message || "Ölçüler getirilirken hata oluştu");
        measurementList.value.loading = false
    });
    if (error.value) {
        toast.error(error.message || "Ölçüler getirilirken hata oluştu");
    } else {
        measurementList.value.items = data.value.data;
    }
    measurementList.value.loading = false
};

const fetchFabricModelList = async () => {
    fabricModelList.value.loading = true
    const { data, error }: any = await $axios("/FabricModel/FabricModelGetAll", {
        method: "GET",
        params: {
            page: 1,
            size: -1,
        },
    }).catch((err: any) => {
        toast.error(err.message || "Kumaş modelleri getirilirken hata oluştu");
        fabricModelList.value.loading = false
    });
    if (error.value) {
        toast.error(error.message || "Kumaş tipleri getirilirken hata oluştu");
    } else {
        fabricModelList.value.items = data.value.data;
    }
    fabricModelList.value.loading = false
};


onMounted(() => {
    fetchStaffList();
    fetchCustomerList();
    fetchFabricSetList();
    fetchFabricTypeList();
    fetchMeasurementList();
    fetchFabricModelList();

    if (props.modalType === 'edit' && props.item) {
        const { ownerId,customerId,orderNotes }: any = props.item;
        modelpool.value  = {
            personel: ownerId,
            customer: customerId,
            note: orderNotes,
            sets: [],
            orderList: [],

        };

    }
})
</script>

<style>
.comp-ot_new_order .v-expansion-panel .v-expansion-panel-text__wrapper {
    padding: 0;
    padding-inline: 0.25rem;
    margin: 0;
}

.comp-ot_new_order .v-expansion-panel {
    border: 1px solid rgba(var(--v-theme-primary), 0.2) !important;
    box-shadow: 0 0 5px rgba(var(--v-theme-primary), 0.08) !important;
    padding-bottom: 0.25rem;
}

.comp-ot_new_order .v-expansion-panel-title {
    background-color: rgba(125, 29, 96, 0.3) !important;
    color: rgb(var(--v-theme-primary)) !important;
}
</style>
