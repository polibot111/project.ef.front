<template>
	<div class="page-to_workshop_order_list">
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
			show-expand
			expand-on-click
			@update:page="handlePageUpdate"
			@update:items-per-page="handlePageUpdate"
			v-model:expanded.sync="expandedRowOptions.rowDetails"
			@update:expanded="handleGetRowDetails">
			<template v-slot:top>
				<v-toolbar flat color="white" class="d-flex gap-2 align-center flex-wrap">
					<!-- Sipariş önizleme kodu,  Sipariş kodu, İstasyon, Set Adı, Tarih filtresi -->
					<div class="d-flex gap-2 align-center w-100">
						<div class="d-flex gap-2 align-center overflow-x-auto pb-4 pt-4">
							<v-text-field
								v-model="filter.masterOrderCode"
								label="Sipariş önizleme kodu"
								placeholder="Sipariş önizleme kodu"
								compact
								dense
								size="small"
								hide-details
								prepend-inner-icon="mdi-magnify"
								class="txt-search dense bg-white"
								style="max-width: 230px; min-width: 230px"
								variant="outlined"
								clearable></v-text-field>
							<v-text-field
								v-model="filter.orderCode"
								label="Sipariş kodu"
								placeholder="Sipariş kodu"
								compact
								dense
								size="small"
								hide-details
								prepend-inner-icon="mdi-magnify"
								class="txt-search dense bg-white"
								style="max-width: 230px; min-width: 230px"
								variant="outlined"
								clearable></v-text-field>
							<v-autocomplete
								color="primary"
								class="bg-white"
								style="border-radius: 0.25rem; max-height: 40px; min-width: 200px;"
								max-width="300px"
								v-model:model-value="filter.stationId"
								:items="station.list"
								label="İstasyon"
								variant="outlined"
								placeholder="İstasyon Seçininiz"
								density="compact"
								hide-details
								:loading="filter.loading"
								:disabled="filter.loading || loading.page"
								:item-props="(item: any) => ({ item, title: item.name, disabled: item.disabled })"
								item-value="id"
								clearable
								no-data-text="İstasyon listesi bulunamadı" />
							<v-autocomplete
								color="primary"
								class="bg-white"
								style="border-radius: 0.25rem; max-height: 40px; min-width: 200px;"
								max-width="300px"
								v-model:model-value="filter.set"
								:items="fabricSetList"
								label="Set Adı"
								variant="outlined"
								placeholder="Set Adı Seçininiz"
								density="compact"
								hide-details
								:loading="filter.loading"
								:disabled="filter.loading || loading.page"
								:item-props="(item: any) => ({ item, title: item.name, disabled: item.disabled })"
								item-value="id"
								clearable
								no-data-text="Set listesi bulunamadı" />

							<div
								class="position-relative d-flex align-center rounded border-primary"
								:class="[{ 'bg-primary-opacity-1 border-1': search.filtered }]">
								<BtDatePicker
									key="startDate"
									id="startDate"
									v-model="filter.startDate"
									label="Başlangıç Tarihi"
									placeholder="Başlangıç Tarihi"
									class="txt-search mr-2"
									style="width: 200px"
									:disabled="filter.loading || loading.page"></BtDatePicker>
								<BtDatePicker
									key="endDate"
									id="endDate"
									v-model="filter.endDate"
									label="Bitiş Tarihi"
									placeholder="Bitiş Tarihi"
									class="txt-search mr-2"
									style="width: 200px"
									:disabled="filter.loading || loading.page"></BtDatePicker>
							</div>
						</div>
						<v-btn color="primary" variant="flat" class="mb-4 mt-4" @click="handleFilter">
							<v-icon class="mr-1">mdi-filter-outline</v-icon> Filtreyi Uygula
						</v-btn>
						<v-tooltip
							v-if="filter.startDate || filter.endDate || filter.stationId || filter.set || filter.orderCode"
							text="Filtreyi Temizle"
							location="top">
							<template v-slot:activator="{ props }">
								<v-btn v-bind="props" color="error" variant="flat" class="mb-2 mt-2" @click="handleResetFilter">
									<v-icon class="">mdi-filter-remove-outline</v-icon>
								</v-btn>
							</template>
						</v-tooltip>
					</div>

					<!-- <v-btn color="orange" variant="tonal" @click="handleExportToPDF('all')" class="mr-2 ml-2">
						<v-icon left>mdi-file-pdf-box</v-icon>
						PDF
					</v-btn>
					<v-btn color="green" variant="tonal" class="mr-2" @click="handleExportToExcel('all')">
						<v-icon left>mdi-file-excel</v-icon>
						Excel
					</v-btn> -->

					<!-- <v-spacer /> -->
					<!-- <v-btn color="primary" variant="flat" @click="handleCreateManufacturer">Yeni Ekle11</v-btn> -->
				</v-toolbar>
			</template>
			<template v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }">
				<tr style="background-color: rgba(0,0,0, 0.1);">
					<td :colspan="columns.length">
						<VBtn :icon="isGroupOpen(item) ? '$expand' : '$next'" size="small" variant="text" @click="toggleGroup(item)"></VBtn>
						<strong>{{ item.value }}</strong>
					</td>
				</tr>
			</template>

			<template v-slot:item.orderDate="{ item, index }: any">
				{{ dayjs(item.orderDate).format("DD.MM.YYYY") }}
			</template>
			<template v-slot:item.fabricModelDTO="{ item, index, headers }: any">
				{{ item.fabricModelAndTypeDTOs.fabricModelDTO.name }}
			</template>
			<template v-slot:item.fabricTypeDTOs="{ item, index, headers }: any">
				<div class="d-flex align-center flex-wrap">
					<template v-for="(fabricType, index) in item?.fabricModelAndTypeDTOs?.fabricTypeDTOs" :key="index">
						<v-chip v-if="fabricType?.color?.rgbCode" size="x-small" :color="fabricType?.color?.rgbCode" variant="flat" class="ma-1">
							{{ fabricType?.name }} : {{ fabricType?.color?.name }}
						</v-chip>
						<v-tooltip v-else :width="128" :height="128" location="top" content-class="pa-0">
							<template v-slot:activator="{ props }">
								<v-chip v-bind="props" class="d-flex align-center" size="x-small" variant="outlined" color="primary py-2">
									<v-img
										:src="fabricType?.color?.images?.[2]?.path || fabricType?.color?.images?.[0]?.path"
										width="16"
										height="16"
										class="rounded mr-1"
										cover />
									{{ fabricType?.name }} : {{ fabricType?.color?.name }}
								</v-chip>
							</template>
							<v-img :src="fabricType?.color?.images?.[0]?.path" width="128" height="128" cover class="rounded border shadow-sm border-gray" />
						</v-tooltip>
					</template>
				</div>
			</template>
			<template v-slot:item.isComplatedToWorkshopOrder="{ item }: any">
				<v-chip :color="item.isComplatedToWorkshopOrder ? 'success' : 'error'" label>
					{{ item.isComplatedToWorkshopOrder ? "Evet" : "Hayır" }}
				</v-chip>
			</template>
			<template v-slot:item.actions="{ item, index }:any">
				<v-tooltip
					:color="item.isComplatedToWorkshopOrder ? 'success' : 'error'"
					:text="item.isComplatedToWorkshopOrder ? 'Tamamlandı Kaldır' : 'Tamamla'"
					location="top">
					<template v-slot:activator="{ props }">
						<v-icon
							v-if="!loadingIsArrived[item.id]"
							v-bind="props"
							class="me-2"
							:color="!item.isComplatedToWorkshopOrder ? 'info' : 'error'"
							size="small"
							@click="toggleCompletedOrder(item)"
							:loading="loadingIsArrived[item.id]">
							{{ !item.isComplatedToWorkshopOrder ? "mdi-check-circle" : "mdi-close-circle" }}
						</v-icon>
						<v-progress-circular v-else :width="2" size="14" color="info" v-bind="props" indeterminate class="me-2" />
					</template>
				</v-tooltip>

				<v-tooltip v-if="!item.isComplatedToWorkshopOrder" location="top" text="Başka Atölye ye Transfer Et">
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" class="me-2" color="info" :size="24" @click="toWorkshop.showDialog({ item })"> mdi-home-switch-outline </v-icon>
					</template>
				</v-tooltip>

				<v-tooltip v-if="!item.isComplatedToWorkshopOrder" location="top" text="Atöyle Düzenle">
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" class="me-2" color="primary" size="small" @click="editItem(item)"> mdi-pencil-box-outline </v-icon>
					</template>
				</v-tooltip>
				<v-tooltip v-if="!item.isComplatedToWorkshopOrder" location="top" text="Kullanılan Kumaşları ">
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" size="small" color="pink" @click="usedFabricDialog.handlerShow(item)"> mdi-tshirt-crew-outline </v-icon>
					</template>
				</v-tooltip>

				<v-tooltip v-if="!item.isComplatedToWorkshopOrder" location="top" text="Atölye Sil">
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" size="small" color="error" @click="confirm.handlerShow(item)"> mdi-delete-outline</v-icon>
					</template>
				</v-tooltip>

				<v-tooltip color="orange" text="PDF'e Aktar" location="top">
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" class="me-2" color="orange" size="small" @click="handleExportToPDF('selected', item)"> mdi-file-pdf-box </v-icon>
					</template>
				</v-tooltip>
				<v-tooltip color="green" text="Excel'e Aktar" location="top">
					<template v-slot:activator="{ props }">
						<v-icon v-bind="props" class="me-2" color="green" size="small" @click="handleExportToExcel('selected', item)">
							mdi-file-excel-outline
						</v-icon>
					</template>
				</v-tooltip>
			</template>
			<template v-slot:no-data>
				<p class="text-subtitle-1 mt-10 mb-3">Kayıt bulunamadı</p>
			</template>

			<template v-slot:expanded-row="{ columns, item, isExpanded, index: expandedIndex }: any">
				<tr style="background: var(--bt-expanded-row-bg)">
					<td :colspan="columns.length" class="py-4">
						<transition name="fade" mode="out-in">
							<div class="w-100 h-100">
								<v-expansion-panels
									size="small"
									elevation="0"
									multiple
									color="gray"
									v-model="expanded.detail1[item.toWorkshopOrderId]"
									style=" overflow-y: auto">
									<v-expansion-panel class="w-100 mb-3" elevation="0" v-for="orderItemWorkshopGroup of item.orderItemWorkshopGroupByOrder">
										<template #title>
											<div class="d-flex align-center justify-space-between w-100 mx-3">
												<div>
													{{ orderItemWorkshopGroup.measurement.name }} - ({{ orderItemWorkshopGroup.measurement.width }} x
													{{ orderItemWorkshopGroup.measurement.height }})
												</div>
											</div>
										</template>
										<template #text>
											<div>
												<h3 class="font-weight-semi-bold mb-3 mt-3">Siparişler</h3>
												<div class="d-flex gap-3 flex-wrap">
													<v-expansion-panels multiple class="w-100" v-model="expanded.detail2[orderItemWorkshopGroup.id]">
														<v-expansion-panel
															v-for="orderItemWorkshop of orderItemWorkshopGroup.orderItemWorkshops"
															:key="orderItemWorkshop.id"
															class="mb-2">
															<v-expansion-panel-title>
																<div class="d-flex align-center justify-space-between w-100 mr-5">
																	<div class="d-flex align-center">
																		<strong style="min-width: 110px;">Toplam Ürün</strong>
																		<span>: {{ orderItemWorkshop.count }}</span>
																	</div>
																	<div class="d-flex align-center">
																		<strong style="min-width: 110px;">İşlemde</strong>
																		<span>: {{orderItemWorkshop.islem.value}}</span>
																	</div>
																	<div class="d-flex align-center">
																		<strong style="min-width: 110px;">Eksik</strong>
																		<span>: {{orderItemWorkshop.eksik.value}}</span>
																	</div>
																	<div class="d-flex align-center">
																		<strong style="min-width: 110px;">İade</strong>
																		<span>: {{orderItemWorkshop.iade.value}}</span>
																	</div>
																	<div class="d-flex align-center">
																		<strong style="min-width: 110px;">Tamamlandı</strong>
																		<span>: {{orderItemWorkshop.tamamalandi.value}}</span>
																	</div>
																	<div class="d-flex align-center">
																		<strong style="min-width: 110px;">Sevk</strong>
																		<span>: {{orderItemWorkshop.sevk}}</span>
																	</div>
																</div>
															</v-expansion-panel-title>
															<v-expansion-panel-text>
																<div class="orderItemWorkshopGroup-square d-flex gap-3 flex-column">
																	<div class="d-flex gap-2 align-center justify-center">
																		<template v-for="processType of processTypeList" :key="processType.id">
																			<v-tooltip v-if="!item.isComplatedToWorkshopOrder" location="top" :text="processType.name + ' Ekle'">
																				<template v-slot:activator="{ props }">
																					<v-btn
																						size="small"
																						variant="outlined"
																						:color="processType.name === 'Tamamlandı' ? 'success' : processType.name === 'Sevk' ? 'info' : processType.name === 'İade' ? 'error' : processType.name === 'Eksik' ? 'warning' : 'primary'"
																						class="text-center"
																						@click="handleProcessType(processType, orderItemWorkshop, orderItemWorkshopGroup, 'add')"
																						v-bind="props">
																						<div class="d-flex align-center justify-content-center">
																							<v-icon
																								size="small"
																								class=""
																								>{{ processType?.icon || processType.name === "Tamamlandı" ? "mdi-check" : processType.name === "Sevk" ? "mdi-truck" : processType.name === "İade" ? "mdi-undo" : processType.name === "Eksik" ? "mdi-alert-circle" : "mdi-cog" }}</v-icon
																							>
																						</div>
																					</v-btn>
																				</template>
																			</v-tooltip>
																		</template>
																		<v-tooltip v-if="!item.isComplatedToWorkshopOrder" location="top" text="Depo'ya Gönder">
																			<template v-slot:activator="{ props }">
																				<v-btn
																					size="small"
																					variant="outlined"
																					color="info"
																					@click="handleStorageAction(sendToStorageProcessType, orderItemWorkshop, orderItemWorkshopGroup, 'add', item)"
																					v-bind="props">
																					<v-icon>mdi-send</v-icon>
																				</v-btn>
																			</template>
																		</v-tooltip>
																	</div>
																	<v-expansion-panels
																		v-model="processDetailExpandedRows"
																		@update:model-value="getProcessTypeDetails($event, orderItemWorkshop)">
																		<v-expansion-panel
																			v-for="processType of processTypeList"
																			:key="processType.id"
																			@update:model-value="getProcessTypeDetails(processType, orderItemWorkshop)">
																			<v-expansion-panel-title>
																				<div class="d-flex align-center">
																					<strong style="min-width: 110px;">{{ processType.name }}</strong>
																				</div>
																			</v-expansion-panel-title>
																			<v-expansion-panel-text>
																				<v-data-table-server
																					:headers="processTypeDetailColumns"
																					:items="processTypeDetailItems"
																					:loading="processTypeDetailLoading"
																					:items-length="processType.totalCount"
																					loading-text="Yükleniyor..."
																					no-data-text="Kayıt bulunamadı"
																					:items-per-page="999999999999"
																					hide-default-footer>
																					<template v-slot:item.actions="{ item: deepItem, index }:any">
																						<v-tooltip v-if="!item.isComplatedToWorkshopOrder" location="top" text="Düzenle">
																							<template v-slot:activator="{ props }">
																								<v-icon
																									size="small"
																									color="primary"
																									@click="handleProcessType(deepItem, orderItemWorkshop, orderItemWorkshopGroup, 'edit')"
																									v-bind="props"
																									>mdi-pencil-box-outline</v-icon
																								>
																							</template>
																						</v-tooltip>
																						<v-tooltip v-if="!item.isComplatedToWorkshopOrder" location="top" text="Sil">
																							<template v-slot:activator="{ props }">
																								<v-icon
																									size="small"
																									color="error"
																									@click="handleDeleteProcessType(deepItem, orderItemWorkshop, orderItemWorkshopGroup)"
																									v-bind="props"
																									>mdi-delete-outline</v-icon
																								>
																							</template>
																						</v-tooltip>
																					</template>
																				</v-data-table-server>
																			</v-expansion-panel-text>
																		</v-expansion-panel>
																	</v-expansion-panels>
																	<!-- <div>
																		<div class="d-flex align-center">
																			<strong style="min-width: 110px;">İşlemde</strong>
																			<span>: {{orderItemWorkshop.islem}}</span>
																		</div>
																		<div class="d-flex align-center">
																			<strong style="min-width: 110px;">Eksik</strong>
																			<span>: {{orderItemWorkshop.eksik}}</span>
																		</div>
																		<div class="d-flex align-center">
																			<strong style="min-width: 110px;">İade</strong>
																			<span>: {{orderItemWorkshop.iade}}</span>
																		</div>
																		<div class="d-flex align-center">
																			<strong style="min-width: 110px;">Tamamlandı</strong>
																			<span>: {{orderItemWorkshop.tamamalandi}}</span>
																		</div>
																		<div class="d-flex align-center">
																			<strong style="min-width: 110px;">Sevk</strong>
																			<span>: {{orderItemWorkshop.sevk}}</span>
																		</div>
																	</div> -->
																</div>
															</v-expansion-panel-text>
														</v-expansion-panel>
													</v-expansion-panels>
												</div>
											</div>
										</template>
									</v-expansion-panel>
								</v-expansion-panels>
							</div>
							<!-- <v-skeleton-loader v-else type="table-row@5"></v-skeleton-loader> -->
						</transition>
					</td>
				</tr>
			</template>
		</v-data-table-server>

		<BtModal
			class="comp-to_workshop_dialog"
			v-model:show="toWorkshop.show"
			v-model:loading="toWorkshop.loading"
			width="100%"
			max-width="925px"
			hide-footer
			@save="toWorkshop.save">
			<template #title> {{ toWorkshop.title }} </template>
			<template #content>
				<div class="mx-6 mt-3 mb-6">
					<div class="d-flex gap-3 align-center mb-3">
						<v-autocomplete
							color="primary"
							class="bg-white"
							style="border-radius: 0.25rem; max-height: 40px;"
							max-width="300px"
							v-model="fromPool.stationId"
							:items="station.list"
							label="İstasyon"
							variant="outlined"
							placeholder="İstasyon Seçininiz"
							density="compact"
							hide-details
							:disabled="true"
							:rules="[rules.required]"
							:item-props="(item: any) => ({ item, title: item.name, disabled: item.disabled })"
							item-value="id"
							no-data-text="İstasyon listesi bulunamadı" />
						<v-icon>mdi-arrow-right</v-icon>
						<v-autocomplete
							color="primary"
							class="bg-white"
							style="border-radius: 0.25rem; max-height: 40px;"
							max-width="300px"
							v-model="fromPool.workshopId"
							:items="workshop.allList"
							:disabled="true"
							label="Atölye"
							variant="outlined"
							placeholder="Atölye Seçininiz"
							density="compact"
							hide-details
							:rules="[rules.required]"
							:item-props="(item: any) => ({ item, title: item.name, disabled: item.disabled })"
							item-value="id"
							no-data-text="Atölye listesi bulunamadı" />
					</div>
					<div class="d-flex gap-3 align-center">
						<v-autocomplete
							color="primary"
							class="bg-white"
							style="border-radius: 0.25rem; max-height: 40px;"
							max-width="300px"
							v-model="station.data"
							:items="station.list"
							:loading="station.loading"
							label="Hedef İstasyon"
							variant="outlined"
							placeholder="İstasyon Seçininiz"
							density="compact"
							hide-details
							:disabled="toWorkshop.loading"
							:rules="[rules.required]"
							:item-props="(item: any) => ({ item, title: item.name, disabled: item.disabled })"
							item-value="id"
							no-data-text="İstasyon listesi bulunamadı"
							@update:model-value="workshop.getWorkshopList" />
						<v-icon>mdi-arrow-right</v-icon>
						<v-autocomplete
							color="primary"
							class="bg-white"
							style="border-radius: 0.25rem; max-height: 40px;"
							max-width="300px"
							v-model="workshop.data"
							:items="workshop.list"
							:loading="workshop.loading"
							:disabled="!workshop.list || workshop.list.length <= 0 || toWorkshop.loading"
							label="Hedef Atölye"
							variant="outlined"
							placeholder="Hedef Atölye Seçininiz"
							density="compact"
							hide-details
							:rules="[rules.required]"
							:item-props="(item: any) => ({ item, title: item.name, disabled: item.disabled })"
							item-value="id"
							no-data-text="Hedef Atölye listesi bulunamadı"
							multiple
							chips
							@update:model-value="workshop.setWorkshop" />
					</div>
					<v-divider class="my-6" />
					<VTextField
						type="number"
						v-model="fromPool.unitPrice"
						:label="`${workshop.allList.find((x: any) => x.id == fromPool.workshopId).name} - ${station.list.find((y: any) => fromPool.stationId === y.id)?.name}: Yapılacak Ödemenin Birim Fiyatı`"
						density="compact"
						variant="outlined"
						hide-details="auto"
						persistent-hint
						:suffix="currentCurrency.symbol"
						class="mb-6"
						@update:model-value="toWorkshop.updateUnitPriceAll($event)">
					</VTextField>
					<v-expansion-panels eager>
						<v-expansion-panel v-for="wItem of workshop.data" :title="`${workshop.list.find((x: any) => x.id === wItem).name}`">
							<v-expansion-panel-text>
								<div>
									<div class="d-flex gap-3 align-center justify-space-between">
										<div><strong>Sipariş Kodu :</strong> {{ toWorkshop.item.orderCode }}</div>
										<div>
											<strong>Ürün :</strong> {{ toWorkshop.item.fabricModelAndTypeDTOs.fabricModelDTO.code }} |
											{{ toWorkshop.item.fabricModelAndTypeDTOs.fabricModelDTO.name }}
										</div>
									</div>
									<div class="mt-6"></div>
								</div>
								<VCard color="" variant="outlined" elevation="0" class="px-6 pb-6 mt-6" style="border-color: rgba(var(--v-theme-primary), 0.7);">
									<h4 class="mt-6 mb-6 text-primary" style="font-weight: 600;">Kumaş Tipi</h4>
									<div v-for="fabricTypes of toWorkshop.tempModel?.[wItem]?.fabricTypes">
										<div v-if="fabricTypes?.name" class="d-flex gap-3 mb-3">
											<div style="width: 120px">{{ fabricTypes.name }}</div>
											<VTextField
												type="number"
												:value="fabricTypes.tempMeter"
												@update:model-value="toWorkshop.addFabricType($event, 'meter', fabricTypes)"
												label="Metre"
												density="compact"
												variant="outlined"
												:disabled="toWorkshop.loading"
												hide-details="auto"
												persistent-hint
												:hint="`En Fazla ${fabricTypes.stockMeterCount} Metre Eklenebilir`">
											</VTextField>
											<VTextField
												type="number"
												:value="fabricTypes.tempBall"
												@update:model-value="toWorkshop.addFabricType($event, 'ball', fabricTypes)"
												label="Top"
												density="compact"
												variant="outlined"
												:disabled="toWorkshop.loading"
												hide-details="auto"
												persistent-hint
												:hint="`En Fazla ${fabricTypes.stockBallCount} Top Eklenebilir`"></VTextField>
										</div>
									</div>
								</VCard>

								<v-divider class="my-6" />
								<VCard color="" variant="outlined" elevation="0" class="px-6" style="border-color: rgba(var(--v-theme-primary), 0.7);">
									<h4 class="mt-6 mb-6 text-primary" style="font-weight: 600;">Sipariş Ölçüleri</h4>

									<div v-for="orderItem of toWorkshop.tempModel?.[wItem]?.orderItemWorkshopGroupByOrder">
										<div class="d-flex gap-3 mb-3">
											<v-expansion-panels :eager="true">
												<v-expansion-panel
													:title="`${orderItem.measurement.name} - ${orderItem.measurement.width} x ${orderItem.measurement.height}`">
													<v-expansion-panel-text>
														<div v-for="OIWorkshopItem of orderItem.orderItemWorkshops" class="d-flex gap-3 align-start">
															<VTextField
																type="number"
																v-model:value="OIWorkshopItem.tempCount"
																@update:model-value="handleCalculateTempCount($event, OIWorkshopItem, wItem)"
																label="Adet"
																density="compact"
																variant="outlined"
																:disabled="toWorkshop.loading"
																class="mb-3"
																hide-details="auto"
																persistent-hint
																width="50%"
																:hint="`En Fazla ${OIWorkshopItem.tamamalandi.value - OIWorkshopItem.sevk} Adet Eklenebilir`">
															</VTextField>
															<VTextField
																type="number"
																v-model="OIWorkshopItem.tempTotalPrice"
																label="Toplam Fiyat"
																density="compact"
																variant="outlined"
																class="mb-3"
																hide-details="auto"
																persistent-hint
																readonly
																width="50%"
																suffix="₺"
																:hint="`Birim fiyatı ${fromPool.unitPrice}${currentCurrency.symbol}`">
															</VTextField>
														</div>
													</v-expansion-panel-text>
												</v-expansion-panel>
											</v-expansion-panels>
										</div>
									</div>
								</VCard>
							</v-expansion-panel-text>
						</v-expansion-panel>
					</v-expansion-panels>

					<div class="footer mt-6 d-flex align-center justify-space-between">
						<VBtn color="gray" elevation="0" variant="flat" @click="toWorkshop.show = false" :disabled="toWorkshop.loading">İptal</VBtn>

						<VBtn color="primary" elevation="0" variant="flat" @click="toWorkshop.save" :loading="toWorkshop.loading" :disabled="toWorkshop.loading"
							>Kaydet</VBtn
						>
					</div>
				</div>
			</template>
		</BtModal>

		<BtModal
			class="comp-to_workshop_dialog_edit"
			v-model:show="edit.show"
			v-model:loading="edit.loading"
			width="100%"
			max-width="925px"
			hide-footer
			@save="edit.save">
			<template #title>{{ edit.title }}</template>
			<template #content>
				<div>
					<div>lorem</div>
				</div>
			</template>
		</BtModal>

		<BtModal
			class="comp-to_workshop_dialog_edit"
			v-model:show="actions.show"
			v-model:loading="actions.loading"
			width="100%"
			max-width="925px"
			@save="actions.save"
			@cancel="actions.cancel">
			<template #title>{{ actions.title }}</template>
			<template #content>
				<div class="mx-6 mt-3 mb-6">
					<div class="d-flex gap-3 align-center mb-3" style="">
						<v-autocomplete
							v-if="actions.processType.key === 'storage'"
							v-model="storage.selected"
							:items="storage.list"
							label="Depo"
							variant="outlined"
							:hide-details="false"
							item-value="id"
							item-title="name"
							class="w-100" />
						<v-text-field
							v-if="actions.processType.key !== 'storage'"
							v-model="actions.newValue"
							:label="`${actions.processType.name} Adedi`"
							variant="outlined"
							type="number"
							suffix="Adet"
							persistent-hint
							@update:model-value="actions.handleUpdateValue"
							class="w-100"
							:hint="`En Fazla ${actions.maxCount} Adet Eklenebilir`" />
						<v-text-field
							v-else
							v-model="actions.newValue"
							label="Adet"
							variant="outlined"
							type="number"
							suffix="Adet"
							persistent-hint
							@update:model-value="actions.handleUpdateValue"
							class="w-100" />
					</div>
					<v-text-field
						v-if="actions.processType.key === 'storage'"
						v-model="actions.newProcessPrice"
						label="Fiyatı"
						variant="outlined"
						type="number"
						:suffix="currentCurrency.symbol"
						persistent-hint
						class="w-100"
						:hide-details="false" />
				</div>
			</template>
		</BtModal>

		<ConfirmBox
			v-model:show="usedFabricDialog.show"
			:title="usedFabricDialog.title"
			:type="usedFabricDialog.type"
			:loading="usedFabricDialog.loading"
			:max-width="800"
			@save="usedFabricDialog.handler('save')"
			@cancel="usedFabricDialog.handler('cancel')">
			<template #content>
				<VCard color="" variant="outlined" elevation="0" class="px-6 pb-6 mt-6" style="border-color: rgba(var(--v-theme-primary), 0.7);">
					<h4 class="mt-6 mb-6 text-primary" style="font-weight: 600;">Kumaş Tipi</h4>
					<div v-for="fabricTypes of usedFabricDialog.result">
						<div v-if="fabricTypes?.name" class="d-flex gap-3 mb-3 align-center">
							<div style="width: 180px">
								<small
									><strong class="d-block">{{ fabricTypes.code }}</strong></small
								>
								{{ fabricTypes.name }}
							</div>
							<VTextField
								type="number"
								:value="fabricTypes.tempMeter"
								@update:model-value="usedFabricDialog.addFabricType($event, 'meter', 'tempMeter', fabricTypes)"
								label="Metre"
								density="compact"
								variant="outlined"
								:disabled="usedFabricDialog.loading"
								hide-details="auto"
								persistent-hint
								:hint="`En Fazla ${fabricTypes.stockMeterCount} Metre Eklenebilir`">
							</VTextField>
							<VTextField
								type="number"
								:value="fabricTypes.tempBall"
								@update:model-value="usedFabricDialog.addFabricType($event, 'ball', 'tempBall', fabricTypes)"
								label="Top"
								density="compact"
								variant="outlined"
								:disabled="usedFabricDialog.loading"
								hide-details="auto"
								persistent-hint
								:hint="`En Fazla ${fabricTypes.stockBallCount} Top Eklenebilir`"></VTextField>
						</div>
					</div>
				</VCard>
			</template>
		</ConfirmBox>

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
import { currentCurrency } from "../../composables/useCurrentCurrency";
import { useExport } from "../../composables/useExport"
import { computed } from "vue";

const { exportToExcel, exportToPDF } = useExport('Atölye Siparişleri')



const headers: any = ref([
  { title: "Sipariş Kodu", value: "orderCode", align: "start" },
  { title: "Atölye", value: "workshopName", align: "start", minWidth: "120px" },
  { title: "Personel", value: "ownerName", align: "start", minWidth: "120px" },
  { title: "Müşteri", value: "customerName", align: "start", minWidth: "120px" },
  { title: "İstasyon", value: "situationName", align: "start", minWidth: "120px" },
  { title: "Ürün", value: "fabricModelDTO", align: "start", minWidth: "120px" },
  { title: "Kumaş Tipi", value: "fabricTypeDTOs", align: "start", minWidth: "350px" },
  { title: "Tamamlandı", value: "isComplatedToWorkshopOrder", align: "start", minWidth: "120px" },
  { title: "Sipariş Tarihi", value: "orderDate", align: "start" },
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

const station: any = ref({
  list: [],
  filteredList: [] as any,
  loading: false,
});
const fromPool: any = ref({
  stationId: "",
  workshopId: "",
  unitPrice: 0,
});
const stationEdit = ref({
  show: false,
  loading: false,
  title: "İstasyonları Düzenle",
  type: "new",
  modelList: [] as any,

  mockStation: {
    situationId: "",
    situtationName: "",
    workshopSituationId: "",
    new: true
  },
  currentRow: null as any,
  handleShow: (item: any) => {
    stationEdit.value.show = true;
    stationEdit.value.title = "İstasyonları Düzenle";
    stationEdit.value.type = "edit";
    stationEdit.value.currentRow = item;
    stationEdit.value.modelList = item.workshopSituationDTOs.map((item: any) => {
      return {
        ...item.situationDTO,
        workshopSituationId: item.workshopSituationId,
        new: false
      };
    });

    station.value.filteredList = station.value.list.filter((x: any) => x.name !== 'Kapitone').map((item: any) => {
      return {
        ...item,
        disabled: stationEdit.value.modelList.some((i: any) => i.situationId === item.id),
      };
    });
  },
  submit: async (sItem: any) => {
    const modelpool = {
      situationId: sItem.situationId,
      workshopId: stationEdit.value.currentRow.id,
      workshopSituationId: stationEdit.value.currentRow.workshopSituationDTOs.find((i: any) => i.workshopId === stationEdit.value.currentRow.id)?.workshopSituationId
    }

    const result = await $axios('/WorkshopSituation/AddWorkshopSituations', {
      method: "POST",
      data: {
        situationId: modelpool.situationId,
        workshopId: modelpool.workshopId,
      },
    }).catch((err: any) => {
      dialog.value.loading = false;
      toast.error("İstasyon eklenirken hata oluştu");
    });

    if (!result) {
      toast.error("İstasyon eklenirken hata oluştu");
    } else {
      toast.success("İstasyon başarıyla eklendi");
      stationEdit.value.modelList = stationEdit.value.modelList.map((i: any) => {
        if (i.situationId === sItem.situationId) {
          return {
            ...i,
            new: false,
          }
        }
        return i;
      });
      station.value.filteredList = station.value.list.map((item: any) => {
        return {
          ...item,
          disabled: stationEdit.value.modelList.some((i: any) => i.situationId === item.id),
        };
      });

      await fetchToWorkshopList()

      stationEdit.value.show = false;


    }

  },
  preDelete: (item: any) => {
    const index = stationEdit.value.modelList.findIndex((i: any) => i.situationId === item.situationId);
    if (item.new) {
      stationEdit.value.modelList.splice(index, 1);
      station.value.filteredList = station.value.list.map((item: any) => {
        return {
          ...item,
          disabled: stationEdit.value.modelList.some((i: any) => i.situationId === item.id),
        };
      });
    } else {
      handleRemoveWorkshopStation(item, item, index);

    }
  },

});
const expanded: any = ref({
  detail1: {},
  detail2: {}
})
const expandedRows: any = ref([])
const expandedRowOptions: any = ref([]) as any

const processTypeList: any = ref([])
const processDetailExpandedRows: any = ref([])

const tempItem: any = ref(null)
const handleDisableItems = (value: any) => {
  tempItem.value = cloneDeep(stationEdit.value.currentRow);

  station.value.filteredList = station.value.list.map((item: any) => {
    return {
      ...item,
      disabled: stationEdit.value.modelList.some((i: any) => i.situationId === item.id),
    };
  });
};

const model: any = ref({
  id: "",
  name: null,
  adress: null,
  note: null,
  telephone: null,
  contactPerson: "",
});

const dialog = ref({
  show: false,
  loading: false,
  title: "Atölye Oluştur",
  type: "new",
});

const usedFabricDialog: any = ref({
  show: false,
  title: "Kumaş Tanımla!",
  body: ``,
  type: "error",
  item: null,
  loading: false,
  confirmType: '',
  result: null,
  handler: async (type: string) => {
    switch (type) {
      case "save": {
        const modelPool = usedFabricDialog.value.result.map((fabricType: any) => ({
          usedFabricBallCount: fabricType.tempBall || 0,
          usedFabricMeterCount: fabricType.tempMeter || 0,
          workShopOrderId: usedFabricDialog.value.item.toWorkshopOrderId,
          fabricCapitoneOrderId: null,
          fabricTypeId: fabricType.id,
          transportationRecordId: null
        })).filter((item: any) => item.usedFabricBallCount > 0 || item.usedFabricMeterCount > 0);

        if (modelPool.length > 0) {
          const responses = await Promise.allSettled(modelPool.map((model: any) => 
            $axios('/UsedFabric', {
              method: 'POST',
              data: model
            })
          ));

          const successResponses = responses.filter(response => 
            response.status === 'fulfilled' && response.value?.data?.value?.succeeded
          );

          if (successResponses.length > 0) {
            toast.success("Kumaşlar başarıyla kaydedildi");
            usedFabricDialog.value.show = false;
          } else {
            toast.error("Kumaşlar kaydedilirken hata oluştu");
          }
        } else {
          toast.warning("Lütfen en az bir kumaş miktarı girin");
        }


        break;
      }
      case "cancel": {
        usedFabricDialog.value.show = false;
        usedFabricDialog.value.item = null;
        usedFabricDialog.value.title = "";
        usedFabricDialog.value.result = null;


        break;
      }
      default:
        break;
    }
  },
  handlerShow: async (item: any, type?: string, otherItem?: any) => {
    usedFabricDialog.value.item = item;
    usedFabricDialog.value.show = true;
    usedFabricDialog.value.type = "error";

    usedFabricDialog.value.title = "Kumaş Tanımla!";

    const mappedModel = item.fabricModelAndTypeDTOs.fabricTypeDTOs.map((x:any)=> x.id)
    let qs = mappedModel.map((x:any)=> `fabricTypeIds=${x}`).join('&')


    const result = await $axios('/FabricStock/GetFabricStockInWorkshopOrder?' + qs, {
      method: 'GET',
    }).catch((err: any) => {
      toast.error(err.message || "Kumaşlar getirilirken hata oluştu")
    })

    if (result?.data.value.succeeded) {
      usedFabricDialog.value.result = result.data.value.data.map((x:any)=> ({
        ...x,
        tempMeter: 0,
        tempBall: 0
      }))
    }
  },
  addFabricType: (value: any, type: string, tempType: string, fabricType: any) => {

    if (type === 'meter' && parseInt(value) > parseInt(fabricType.stockMeterCount)) {
      fabricType.tempMeter = parseInt(fabricType.stockMeterCount)
    } else if (type === 'ball' && parseInt(value) > parseInt(fabricType.stockBallCount)) {
      fabricType.tempBall = parseInt(fabricType.stockBallCount)
    } else if (value < 0) {
      fabricType[tempType] = 0
    } else {
      fabricType[tempType] = parseInt(value)
    }
  },
});
const confirm: any = ref({
  show: false,
  title: "Atölye Sil!",
  body: ``,
  type: "error",
  item: null,
  loading: false,
  confirmType: '',
  handler: async (type: string) => {
    switch (type) {
      case "save": {

        if (confirm.value.confirmType === 'deleteStation') {
          confirm.value.loading = true;

          await deleteStation(confirm.value.item);
          confirm.value.loading = false;
          confirm.value.show = false;
          await fetchToWorkshopList();
          stationEdit.value.modelList = stationEdit.value.modelList.filter((i: any) => i.situationId !== confirm.value.item.situationId);
          station.value.filteredList = station.value.list.map((item: any) => {
            return {
              ...item,
              disabled: stationEdit.value.modelList.some((i: any) => i.situationId === item.id),
            };
          });

          return
        }


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
    confirm.value.item = item;
    confirm.value.show = true;
    confirm.value.type = "error";

    confirm.value.title = "Atölye Sil!";
    confirm.value.body = `
        <p>
          <strong>${item.workshopName}</strong> isimli atölyedeki ve sipariş numarası <strong>${item.orderCode}</strong> olan siparişleri silmek istediğinize emin misiniz?
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
      search.value.list = list.value.map((x: any) => ({ ...x, id: x.toWorkshopOrderId }));
      expandedRowOptions.value = []
      expandedRowOptions.value.rowDetails = list.value.map((item: any) => ({
        [item.toWorkshopOrderId]: false
      }))
    }
  },
});

const storage: any = ref({
  list: [],
  loading: false,
  selected: null,
  getStorageList: async () => {
    storage.value.loading = true
    const { data }:any = await $axios('/Storage/GetStorage', { method: 'GET', params: { size: -1 } }).catch((err: any) => {
      toast.error(err.response.data.message || err.response.data.Message || err.message || 'Depolar getirilirken hata oluştu')
      storage.value.loading = false
    })

    storage.value.list = data.value?.data
    storage.value.loading = false
  }
})

const actions: any = ref({
  show: false,
  loading: false,
  title: 'İşlemler',
  newValue: null,
  processType: null,
  item: null,
  processId: null,
  maxCount: null,
  save: async () => {
    console.log('actions.value.newValue', actions.value.newValue)
    if (actions.value.newValue === null || actions.value.newValue === '') {
      toast.error('İşlem adedi boş bırakılamaz')
      return
    }

    actions.value.loading = true
    console.log('actions.value.processType', actions.value.processType)
    console.log('actions.value.item', actions.value.item)
    if (actions.value.type === 'edit') {

    const result:any = await $axios('/Process/UpdateProcess', {
      method: 'PUT',
      data: {
        processCount: actions.value.newValue,
        id: actions.value.processId,
        //     count: actions.value.newValue


        // processCount: actions.value.newValue,
        // processTypeId: actions.value.processType.id,
        // orderItemWorkshopId: actions.value.item.id
      }
    }).catch((err: any) => {
      toast.error(err.message || "İşlem güncellenirken hata oluştu")
      actions.value.loading = false
    })

    if (!result.data.value.succeeded) {
      toast.error(result.data.value.message || "İşlem güncellenirken hata oluştu")
      actions.value.loading = false
      return
      }
    }
    if (actions.value.type === 'add' && actions.value.processType.key !== 'storage') {
      const result:any = await $axios('/Process/AddProcess', {
        method: 'POST',
        data: {
          processCount: actions.value.newValue,
          processTypeId: actions.value.processId,
          orderItemWorkshopId: actions.value.item.id
        }
      }).catch((err: any) => {
        console.log('error add', err)
        toast.error(err.response.data.message || err.response.data.Message || err.message || "İşlem eklenirken hata oluştu")
        actions.value.loading = false
      })

      console.log('result add', result)

      if (!result.data.value.succeeded && !result.data.value.Succeeded) {
        toast.error(result.data.value.message || result.data.value.Message || "İşlem eklenirken hata oluştu")
        actions.value.loading = false
        return
      }

      await getProcessTypeDetails(actions.value.item.id, actions.value.item)




    } else if (actions.value.type === 'add' && actions.value.processType.key === 'storage') {
      console.log('storage add', masterOrder.value)
      const result:any = await $axios('/OrderStorage/WorkshopToStorage', {
        method: 'POST',
        data: {
//           {
//   "storageId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//   "orderItemWorkshops": [
//     {
//       "price": 12,
//       "fromWorkShopId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//       "fromToWorkshopOrderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//       "situationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//       "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//       "orderItemWorkshops": [
//         {
//           "fromOrderItemWorkshopId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//           "orderItemsId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//           "count": 0,
//           "meansurementId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
//         }
//       ]
//     }
//   ]
// }
          storageId: storage.value.selected || null,
          // TODO NOT: storage id getirildi. diğer parametreleri de getirmeli.
          orderItemWorkshops: [{
            price: actions.value.newProcessPrice || 0 , /* -- */
            fromWorkShopId: masterOrder.value.workshopId || null, /* -- */
            fromToWorkshopOrderId: masterOrder.value.toWorkshopOrderId || null,/* -- */
            situationId: masterOrder.value.situationId,
            orderId: masterOrder.value.orderId,
            orderItemWorkshops:  masterOrder.value.orderItemWorkshopGroupByOrder.map((x: any) => x.orderItemWorkshops.map((y:any) => ({
              fromOrderItemWorkshopId: y.id,
              orderItemsId: y.orderItemId,
              count: actions.value.newValue || 0,
              meansurementId: x.measurement.id
            }))).flat()

          }]
        }
      }).catch((err: any) => {
        console.log('error storage', err)
        toast.error(err?.response?.data?.message || err?.data?.message || err.message || "Depoya gönderilirken hata oluştu")
        actions.value.loading = false
      })

      const error:any = result.data.value.error
      if(error){
        toast.error(error.message || "Depoya gönderilirken hata oluştu")
        actions.value.loading = false
        return
      }

      actions.value.loading = false
      actions.value.show = false
      actions.value.newValue = null
      toast.success('İşlem başarıyla kaydedildi', {autoClose: 1000})


    }


    // await fetchProcessDetails(actions.value.item.id, actions.value.item.orderItemId)

    const temp1 = cloneDeep(expanded.value)
    const temp2 = cloneDeep(expandedRowOptions.value.rowDetails)
    await fetchToWorkshopList()



      expanded.value = temp1
      expandedRowOptions.value = {
        ...expandedRowOptions.value,
        rowDetails: temp2
      }




    actions.value.loading = false
    actions.value.show = false
    actions.value.newValue = null
    toast.success('İşlem başarıyla kaydedildi')
    // setTimeout(() => {
    //   actions.value.loading = false
    //   actions.value.show = false
    //   actions.value.newValue = null
    //   toast.success('İşlem başarıyla kaydedildi')
    // }, 1000)
  },
  cancel: () => {
    actions.value.show = false
    actions.value.newValue = null
  },
  handleUpdateValue: (value: any) => {
    if (value < 0) {
      actions.value.newValue = 0
    } else if (actions.value.maxCount && value > actions.value.maxCount) {
      actions.value.newValue = actions.value.maxCount
    } else {
      actions.value.newValue = value
    }
  }
})

// const getOrderItem = async (orderItemId: any) => {
//   const { data }: any = (await $axios("/ToWorkshopOrder/GetAllToWorkshopOrder", {
//     method: "GET",
//   }).catch((err: any) => {
//     toast.error(err.message || "Atölyeler getirilirken hata oluştu");
//   })) as any;
// }

const processTypeDetailLoading = ref(false)
const processTypeDetailItems = ref([])
const processTypeDetailColumns = ref([{
  title: 'İşlem Adı',
  value: 'processName'
},
{
  title: 'Adet',
  value: 'processCount'
},
{
  title: '',
  value: 'actions'
}
])

const getProcessTypeDetails = async (expandedItemIndex: any, orderItemWorkshop: any) => {
  const processType = processTypeList.value[expandedItemIndex]
  if (!processType?.id) return
  processTypeDetailLoading.value = true
  console.log('processType', processType)
  console.log('orderItemWorkshop', orderItemWorkshop)
  const result = await $axios('/Process/GetProcess', {
    method: 'GET',
    params: { OrderItemWorkshopId: orderItemWorkshop.id, processTypeId: processType.id, size: -1 }
  })
  processTypeDetailLoading.value = false
  processTypeDetailItems.value = result.data.value.data
  console.log('getted', processTypeDetailItems.value)
}
const sendToStorageProcessType = reactive({
  key: 'storage',
  name: 'Depo\'ya gönder',
  value: {
    id: '',
    name: 'Depo\'ya gönder',
    count: 0,
  }
})
const masterOrder: any = ref(null)

const handleStorageAction: any = (processType: any, orderItemWorkshop: any, orderItemWorkshopGroup: any, type: string, item: any) => {
  console.log('handleStorageAction', processType, orderItemWorkshop, orderItemWorkshopGroup, type)
  actions.value.show = true
  actions.value.title = `İşlem Seçimi - ${processType?.name || processType?.processName}`
  actions.value.type = type
  actions.value.processType = {
    ...processType,
    id: processType.processTypeId,
    name: processType?.name || processType?.processName
  }
  actions.value.item = orderItemWorkshop
  actions.value.processId = processType.id
  masterOrder.value = item

  const orderItemWorkshopValues = Object.entries(orderItemWorkshop).map(([key, value]) => ({key: key, value}))


  const findMaxCountItem:any = orderItemWorkshopValues.find((x: any) => x.key === 'tamamalandi')
    actions.value.maxCount = findMaxCountItem.value.value
}

const handleProcessType: any = (processType: any, orderItemWorkshop: any, orderItemWorkshopGroup: any, type: string) => {
  console.log('handleProcessType', processType, orderItemWorkshop, orderItemWorkshopGroup, type)
  actions.value.show = true
  actions.value.title = `İşlem Seçimi - ${processType?.name || processType?.processName}`
  actions.value.type = type
  actions.value.processType = {
    ...processType,
    id: processType.processTypeId,
    name: processType?.name || processType?.processName
  }
  actions.value.item = orderItemWorkshop
  actions.value.processId = processType.id


  const orderItemWorkshopValues = Object.entries(orderItemWorkshop).map(([key, value]) => ({key: key, value}))
  const findProcessTypeItem = orderItemWorkshopValues.find((x: any) => x.value.id === processType.id)


  if(findProcessTypeItem?.key === "tamamalandi" ||findProcessTypeItem?.key === 'iade'){
    const findMaxCountItem:any = orderItemWorkshopValues.find((x: any) => x.key === 'islem')
    actions.value.maxCount = findMaxCountItem.value.value
  } else if (findProcessTypeItem?.key === 'eksik') {
    const findMaxCountItem:any = orderItemWorkshopValues.find((x: any) => x.key === 'islem')
    actions.value.maxCount = findMaxCountItem.value.value
  } else if (findProcessTypeItem?.key === 'islem') {
    actions.value.maxCount = orderItemWorkshop.count
  } else if (processType.key === 'storage') {
    const findMaxCountItem:any = orderItemWorkshopValues.find((x: any) => x.key === 'tamamalandi')
    console.log('max tamamlandi', findMaxCountItem)
    actions.value.maxCount = findMaxCountItem.value.value
  }
}

const handleDeleteProcessType = async (item: any, orderItemWorkshop: any, orderItemWorkshopGroup: any) => {
  console.log('handleDeleteProcessType', item, orderItemWorkshop, orderItemWorkshopGroup)
  // actions.value.processId
  // Process/DeleteProcess
  const {data}:any = await $axios('/Process/DeleteProcess', {
    method: 'DELETE',
    data: { id: item.id }
  }).catch((err: any) => {
  console.log('error delete', err)
    toast.error(err.response.data.message || err.response.data.Message || err.message || 'İşlem silinirken hata oluştu')
  })
  if(data.value.succeeded || data.value.Succeeded){
    toast.success('İşlem başarıyla silindi')
    processTypeDetailItems.value = processTypeDetailItems.value.filter((x: any) => x.id !== item.id)
  } else {
    console.log('error delete data', data)
    toast.error(data.value.message || data.value.Message || 'İşlem silinirken hata oluştu')
  }

  // await fetchProcessDetails(orderItemWorkshop.id, orderItemWorkshop.orderItemId)
  await getProcessTypeDetails(orderItemWorkshop.id, orderItemWorkshop)
  await fetchToWorkshopList()

}

const fetchProcessDetails = async (orderItemWorkshopId: any, orderItemId:any) => {
//   const expandedRowOptions: any = ref([]) as any

// const processTypeList: any = ref([])
// const processDetailExpandedRows: any = ref([])



  const {data}:any = await $axios('/ToWorkshopOrder/GetOrderItemWorkshopProcess', {
    method: 'GET',
    params: { orderItemId, workshopOrderId: orderItemWorkshopId, size: -1 }
  })

}
const workshop: any = ref({
  data: null,
  list: [],
  allList: [],
  loading: false,
  getAllWorkshopList: async () => {
    workshop.value.loading = true;
    const { data, error }: any = await $axios("/Workshop/GetWorkshops", {
      method: "GET",
      params: { size: -1 },
    });
    if (error.value) {
      toast.error(error.message || "Atölyeler getirilirken hata oluştu");
    } else {
      workshop.value.allList = data.value?.data.map((x: any) => ({ ...x, tempUnitPrice: 0 }));
    }
    workshop.value.loading = false;
  },
  getWorkshopList: async (stationId: any, OIWorkshopItem?: any) => {
    toWorkshop.value.tempModel = {}
    workshop.value.data = null;
    workshop.value.loading = true;
    toWorkshop.value.modelpool.situationId = stationId
    const { data, error }: any = await $axios("/Workshop/GetWorkshops", {
      method: "GET",
      params: { size: -1, situationId: stationId },
    });
    if (error.value) {
      toast.error(error.message || "Atölyeler getirilirken hata oluştu");
    } else {
      if (OIWorkshopItem) {
        OIWorkshopItem.workshopList = data.value?.data
      } else {
        workshop.value.list = data.value?.data;
      }
    }
    workshop.value.loading = false;
  },
  setWorkshop: async (workshopId: any) => {
    for await (const wId of workshopId) {
      const workshopName = await workshop.value.allList.find((x: any) => x.id === wId).name
      const newFabricTypes = await [...toWorkshop.value.item.fabricModelAndTypeDTOs.fabricTypeDTOs.map((x: any) => ({ ...x, tempMeter: null, tempBall: null }))]
      const newOrderItemWorkshopGroupByOrder = [...await toWorkshop.value.item.orderItemWorkshopGroupByOrder.map((x: any) => ({ ...x, count: null, orderItemWorkshops: x.orderItemWorkshops.map((y: any) => ({ ...y, tempCount: 0, tempTotalPrice: 0 })) }))]

      toWorkshop.value.tempModel = {
        ...toWorkshop.value?.tempModel,

        [wId]: {
          name: workshopName,
          orderCode: toWorkshop.value.item.orderCode,
          displayName: `${toWorkshop.value.item.fabricModelAndTypeDTOs.fabricModelDTO.code}|${toWorkshop.value.item.fabricModelAndTypeDTOs.fabricModelDTO.name}`,
          fabricTypes: newFabricTypes,
          orderItemWorkshopGroupByOrder: cloneDeep(newOrderItemWorkshopGroupByOrder),
          totalPrice: 0
        }
      }
    }
  }
})

const toWorkshop: any = ref({
  show: false,
  loading: false,
  title: "Atölyeye Gönder",
  tempModel: null,
  mockUsedFabrics: {
    meterCount: null,
    ballCount: null,
    fabricTypeId: ''
  },
  mockOrderItemWorkshops: {
    fromOrderItemWorkshopId: null,
    orderItemsId: '',
    count: 0,
    meansurementId: ''
  },
  mockOrderRequests: {
    price: null,
    fromWorkShopId: null,
    toWorkShopId: '',
    fromToWorkshopOrderId: null,
    orderId: '',
    orderItemWorkshops: [],
    usedFabrics: []
  },
  item: {
    orderOwnerId: "",
    situationId: "",
    toWorkshopOrderRequests: []
  },
  modelpool: {
    orderOwnerId: "",
    situationId: "",
    toWorkshopOrderRequests: []
  },
  showDialog: async (payload: any) => {
    toWorkshop.value.item = payload.item
    toWorkshop.value.show = true
    toWorkshop.value.modelpool.orderOwnerId = payload.item.ownerId
    toWorkshop.value.modelpool.toWorkshopOrderRequests = [cloneDeep(toWorkshop.value.mockOrderRequests)]

    fromPool.value.stationId = payload.item.situationId
    fromPool.value.workshopId = payload.item.workshopId
    const updateFabricTypeDTOs = cloneDeep(payload.item.fabricModelAndTypeDTOs.fabricTypeDTOs.map((item: any) => {
      return item.id
    }))

    let qs = ''
    updateFabricTypeDTOs.forEach((item: any) => {
      qs += `fabricTypeIds=${item}&`
    })

    const result = await $axios('/FabricStock/GetFabricStockInWorkshopOrder?' + qs, {
      method: 'GET',
    }).catch((err: any) => {
      toast.error(err.message || "Atölyeye gönderilirken hata oluştu")
    })

    if (result?.data.value.succeeded) {
      const responseFabricTypes = result.data.value.data
      payload.item.fabricModelAndTypeDTOs.fabricTypeDTOs = payload.item.fabricModelAndTypeDTOs.fabricTypeDTOs.map((item: any) => {
        return responseFabricTypes.find((x: any) => x.id === item.id)

      })
      payload.item.orderItemWorkshopGroupByOrder = payload.item.orderItemWorkshopGroupByOrder.map((item: any) => {
        item.orderItemWorkshops = item.orderItemWorkshops.map((item2: any) => {
          item2.targetStationId = ''
          item2.targetWorkshopId = ''
          item2.loading = {
            targetWorkshopId: false,
            targetStationId: false
          }
          item2.workshopList = []
          return item2
        })
        return item
      })
      toWorkshop.value.item = payload.item

    }
  },
  save: async (payload: any) => {
    toWorkshop.value.loading = true

    if (!toWorkshop.value.modelpool.orderOwnerId) {
      toWorkshop.value.loading = false
      toast.error("Personel seçimi yapmalısınız")
      return
    }
    if (!toWorkshop.value.modelpool.situationId) {
      toWorkshop.value.loading = false
      toast.error("İstasyon seçimi yapmalısınız")
      return
    }

    interface OrderItemWorkshop {
      id: string
      tempTotalPrice: string
      tempCount: string
    }

    interface WorkshopGroup {
      orderItemWorkshops: OrderItemWorkshop[]
      orderItemId: string
      measurement: {
        id: string
      }
    }

    interface FabricType {
      id: string
      tempMeter: number
      tempBall: number
    }

    interface WorkshopModel {
      orderItemWorkshopGroupByOrder: WorkshopGroup[]
      fabricTypes: FabricType[]
    }

    const promises = workshop.value.data.map((wItem: string) => {
      const workshopModel = toWorkshop.value.tempModel[wItem] as WorkshopModel
      

      const requestData = {
        orderOwnerId: toWorkshop.value.modelpool.orderOwnerId,
        situationId: station.value.data,
        toWorkshopOrderRequests: [{
          price: workshopModel.orderItemWorkshopGroupByOrder
            .flatMap((group: WorkshopGroup) => group.orderItemWorkshops)
            .reduce((total: number, item: OrderItemWorkshop) =>
              total + (parseFloat(item.tempTotalPrice) || 0), 0),
          fromWorkShopId: fromPool.value.workshopId,
          toWorkShopId: wItem,
          fromToWorkshopOrderId: toWorkshop.value.item.toWorkshopOrderId,
          orderId: toWorkshop.value.item.orderId,
          orderItemWorkshops: workshopModel.orderItemWorkshopGroupByOrder
            .flatMap((group: WorkshopGroup) =>
              group.orderItemWorkshops.map((item: OrderItemWorkshop) => ({
                fromOrderItemWorkshopId: item.id,
                orderItemsId: group.orderItemId,
                count: parseFloat(item.tempCount) || 0,
                meansurementId: group.measurement.id
              }))).filter((x:any) => x.count > 0),
          usedFabrics: workshopModel.fabricTypes.map((fabric: FabricType) => ({
            meterCount: fabric.tempMeter || 0,
            ballCount: fabric.tempBall || 0,
            fabricTypeId: fabric.id
          }))
        }]
      }

      console.log('lgogogogogogogoo', requestData)
      console.log('lgogogogogogogoo22', toWorkshop.value.item)
      return $axios('/ToWorkshopOrder/AddToWorkshopOrderPreview', {
        method: 'POST',
        data: requestData
      })
    })

    const result = await Promise.allSettled(promises)
    console.log('result is => ', result)
    const errors: any = result.filter((x: any) => x.status === 'rejected')
    if (errors.length > 0) {
      toast.error(errors?.[0]?.reason?.response?.data?.message || errors?.[0]?.reason?.message || "Atölyeye gönderilirken hata oluştu")
      toWorkshop.value.loading = false
      return
    }

    await

    toast.success("Atölyeye gönderildi")
    toWorkshop.value.loading = false
    // clear the temp model
    toWorkshop.value.tempModel = null

    clearSendModelsInDialog()
    toWorkshop.value.show = false
  },
  updateUnitPriceAll: (value: any) => {
    Object.values(toWorkshop.value.tempModel).forEach((workshop: any) => {
      workshop.orderItemWorkshopGroupByOrder.forEach((orderItem: any) => {
        orderItem.orderItemWorkshops = orderItem.orderItemWorkshops.map((y: any) => ({
          ...y,
          tempTotalPrice: (y.tempCount * value).toFixed(2)
        }))
      })
    })
  },
  addFabricType: (value: any, type: string, fabricType: any) => {
    if (toWorkshop.value.modelpool.toWorkshopOrderRequests.length === 0) {
      toWorkshop.value.modelpool.toWorkshopOrderRequests.push(cloneDeep(toWorkshop.value.mockOrderRequests))
    }

    const findIndex = toWorkshop.value.modelpool.toWorkshopOrderRequests[0].usedFabrics?.findIndex((x: any) => x.fabricTypeId === fabricType.id) || null
    if (findIndex === -1) {
      toWorkshop.value.modelpool.toWorkshopOrderRequests[0].usedFabrics.push({
        meterCount: 0,
        ballCount: 0,
        fabricTypeId: fabricType.id
      })
    }
    const findIndex2 = toWorkshop.value.modelpool.toWorkshopOrderRequests[0].usedFabrics?.findIndex((x: any) => x.fabricTypeId === fabricType.id)
    if (type === 'meter') {
      toWorkshop.value.modelpool.toWorkshopOrderRequests[0].usedFabrics[findIndex2].meterCount = value > fabricType.stockMeterCount ? fabricType.stockMeterCount : value
      fabricType.tempMeter = value > fabricType.stockMeterCount ? fabricType.stockMeterCount : value
    } else {
      toWorkshop.value.modelpool.toWorkshopOrderRequests[0].usedFabrics[findIndex2].ballCount = value > fabricType.stockBallCount ? fabricType.stockBallCount : value
      fabricType.tempBall = value > fabricType.stockBallCount ? fabricType.stockBallCount : value
    }
  },
  addOrderItem: (value: any, orderItem: any) => {
    if (toWorkshop.value.modelpool.toWorkshopOrderRequests.length === 0) {
      toWorkshop.value.modelpool.toWorkshopOrderRequests.push(cloneDeep(toWorkshop.value.mockOrderRequests))
    }

    const availableCount = orderItem.count - orderItem.countInWorkshop

    const findIndex = toWorkshop.value.modelpool.toWorkshopOrderRequests[0].orderItemWorkshops?.findIndex((x: any) => x.meansurementId === orderItem.measurementDTO.id) || null
    if (findIndex === -1) {
      toWorkshop.value.modelpool.toWorkshopOrderRequests[0].orderItemWorkshops.push({
        fromOrderItemWorkshopId: null,
        orderItemsId: orderItem.id,
        count: 0,
        meansurementId: orderItem.measurementDTO.id
      })
    }
    const findIndex2 = toWorkshop.value.modelpool.toWorkshopOrderRequests[0].orderItemWorkshops?.findIndex((x: any) => x.meansurementId === orderItem.measurementDTO.id)
    toWorkshop.value.modelpool.toWorkshopOrderRequests[0].orderItemWorkshops[findIndex2].count = value > availableCount ? availableCount : value
    orderItem.tempCount = value > availableCount ? availableCount : value
  },
})

const handleCalculateTempCount = ($event: any, OIWorkshopItem: any, workshopItem: any) => {
  if ($event > OIWorkshopItem.count) {
    OIWorkshopItem.tempCount = OIWorkshopItem.count
  } else {
    OIWorkshopItem.tempCount = $event
  }

  OIWorkshopItem.tempTotalPrice = (parseFloat(OIWorkshopItem.tempCount) * parseFloat(fromPool.value.unitPrice)).toFixed(2)
}

const clearSendModelsInDialog = () => {
  fromPool.value.unitPrice = 0
  station.value.data = null
  workshop.value.data = null
  toWorkshop.value.item = null
}

const edit: any = ref({
  show: false,
  loading: false,
})

const handleFilter = async () => {
  filter.value.loading = true;
  await fetchToWorkshopList({
    startDate: dayjs(filter.value.startDate).add(1, "day"),
    endDate: dayjs(filter.value.endDate).add(1, "day"),
    masterOrderCode: filter.value.masterOrderCode,
    stationId: filter.value.stationId,
    set: filter.value.set,
  });
  filter.value.loading = false;
};
const handleResetFilter = async () => {
  filter.value.startDate = null
  filter.value.endDate = null
  filter.value.masterOrderCode = null
  filter.value.stationId = null
  filter.value.set = null
  filter.value.orderCode = null

  loading.value.page = true

  await fetchToWorkshopList();
  loading.value.page = false

};

const handlePageUpdate = async (page: number) => {
  tableOptions.value.page = page;
  await fetchToWorkshopList();
};

const fetchToWorkshopList = async (
  queryParams: object | undefined = {}
): Promise<void> => {
  const sendpool:any = {}
  if (filter.value.startDate && dayjs(filter.value.startDate).isValid()) {
    sendpool.startDate = dayjs(filter.value.startDate).add(1, "day")
  }
  if (filter.value.endDate && dayjs(filter.value.endDate).isValid()) {
    sendpool.endDate = dayjs(filter.value.endDate).add(1, "day")
  }
  if (filter.value.masterOrderCode) sendpool.masterOrderCode = filter.value.masterOrderCode
  if (filter.value.stationId) sendpool.situationId = filter.value.stationId
  if (filter.value.set) sendpool.set = filter.value.set
  if(filter.value.orderCode) sendpool.orderCode = filter.value.orderCode
  const { data }: any = (await $axios("/ToWorkshopOrder/GetAllToWorkshopOrder", {
    method: "GET",
    params: {
      ...sendpool,
      page: tableOptions.value.page,
      size: tableOptions.value.itemsPerPage,
    },
  }).catch((err: any) => {
    toast.error(err?.response?.data?.message || err?.data?.message || err.message || "Atölyeler getirilirken hata oluştu");
  })) as any;
  if (!data.value.succeeded) {
    toast.error(data.value.message || "Atölyeler getirilirken hata oluştu");
  } else {
    list.value = data.value?.data;
    tableOptions.value.totalCount = data.value?.totalCount;
    search.value.list = list.value.map((x: any) => ({ ...x, id: x.toWorkshopOrderId }));

    search.value.value = "";
  }
};




const handleRemoveWorkshopStation = async (item: any, station: any, index: number, event?: any) => {

  confirm.value.item = station;
  confirm.value.show = true;
  confirm.value.title = "İstasyon Sil!";
  confirm.value.body = `
  <p>
    İstasyonu silmek istediğinize emin misiniz?
  </p>
`;
  confirm.value.type = "error";
  confirm.value.confirmType = "deleteStation";
}

const deleteStation = async (station: any) => {
  const { data, isFinished, error }: any = await $axios('/WorkshopSituation/DeleteWorkshopSituations', {
    method: "DELETE",
    data: {
      situationId: station.workshopSituationId,
    },
  }).catch((err: any) => {
    dialog.value.loading = false;
    toast.error("İstasyon silinirken hata oluştu");
  });

  if (!data.value.succeeded) {
    toast.error(data.value.message || "İstasyon silinirken hata oluştu");
  } else {
    toast.success("İstasyon başarıyla silindi");
    await fetchToWorkshopList();
  }
}

const editItem = (item: any) => {

  edit.value.show = true;
  edit.value.title = "Atölye İşini Düzenle";
  edit.value.type = "edit";
};

const deleteItem = async (item: any) => {
  loading.value.table = true;

  const url = "/ToWorkshopOrder/DeleteToWorkshopOrder";
  console.log('deleted item', item)

  const sendpool = { id: item.toWorkshopOrderId };

  const response: any = await $axios(url, {
    method: "DELETE",
    data: sendpool,
  }).catch((err: any) => {
    loading.value.table = false;
    confirm.value.loading = false;
    toast.error("Atölye silinirken hata oluştu");
  });

  if (!response) return false;

  const { data, isFinished }: any = response;

  if (!data.value?.succeeded) {
    loading.value.table = false;
    toast.error(data.value.message || "Atölye silinirken hata oluştu");
    return false;
  } else {
    toast.success("Atölye başarıyla silindi");
    await fetchToWorkshopList();
  }

  loading.value.table = false;
  return true;
};

const fetchStationList = async () => {
  station.value.loading = true;
  const { data }: any = await $axios("/Parameters/GetSituation", {
    method: "GET",
  }).catch((err: any) => {
    station.value.loading = false;
    toast.error("İstasyonlar getirilirken hata oluştu");
  });
  if (!data.value.succeeded) {
    toast.error(data.value.message || "İstasyonlar getirilirken hata oluştu");
  } else {
    station.value.list = data.value?.data.filter((x: any) => x.name !== 'Kapitone');
  }
  station.value.loading = false;
};

const handleGetRowDetails = async (expandedIds: any) => {
  console.log("expandedIds is => ", expandedIds)
  // const newItem: any = Object.values(expandedIds).filter((item: any) => !expanded.value[item]?.value)
  // // toggle expanded value with expandedIds
  // // if newItem is not included in expanded, add it
  // // else remove it

  // if (newItem.length) {
  //   expanded.value[newItem[0]] = {
  //     value: true,
  //     loaded: false,
  //     id: newItem[0],
  //     data: {},
  //   }
  // } else {
  //   const findDiff = Object.keys(expanded.value).filter((item) => !expandedIds.includes(item))
  //   delete expanded.value[findDiff[0]]
  // }

  // for await (const expandedItem of Object.values(expanded.value) as {
  //   value: boolean
  //   loading: boolean
  //   loaded: boolean
  //   id: number
  //   data?: any
  // }[]) {
  //   console.log('expanded item is => ', expandedItem)
  //   if (!expandedItem.loaded) {
  //     expandedItem.loading = true
  //     const result = await fetchRowDetails(expandedItem.id)
  //     console.log("result is detailll => ", result)
  //     if (!result.succeeded) {
  //       toast.error(result.message || "Satır detayları getirilirken hata oluştu")
  //       expandedItem.loaded = false
  //       expandedItem.loading = false
  //       return
  //     }
  //     expandedItem.data = result.data.length <= 0 ? [] : result.data
  //     expandedItem.loaded = true
  //     expandedItem.loading = false
  //   }
  // }
}

const fetchProcessTypeList = async () => {
  const { data }: any = await $axios("/Parameters/GetProcessTypes", {
    method: "GET",
  }).catch((err: any) => {
    toast.error("İşlem tipi listesi getirilirken hata oluştu");
  });
  if (!data.value.succeeded) {
    toast.error(data.value.message || "İşlem tipi listesi getirilirken hata oluştu");
  } else {
    processTypeList.value = data.value?.data;
  }
}

const handleExportToExcel = async (exportType: 'all' | 'selected' = 'all', item?: any) => {
  const exportItems = exportType === 'selected'
    ? [item]
    : search.value.list


    const columnMappings = [
    { key: 'orderCode', label: 'Sipariş Kodu', formatter: (value:any) => value?.toString() },
    {
      key: 'workshopName',
      label: 'Atölye Adı'
    },
    {
      key: 'ownerName',
      label: 'Personel Adı',
    },
    {
      key: 'customerName',
      label: 'Müşteri Adı',
    },
    {
      key: 'fabricModelAndTypeDTOs.fabricModelDTO.code',
      label: 'Ürün Kodu',
    },
    {
      key: 'fabricModelAndTypeDTOs.fabricModelDTO.name',
      label: 'Ürün Adı',
    },
    {
      key: 'fabricModelAndTypeDTOs.fabricTypeDTOs',
      label: 'Kumaş Tipleri',
      formatter: (item: any) =>
        {
          // Group fabrics by name, merging colors for same-named fabrics
          const fabricGroups = item.reduce((acc: any, fabric: any) => {
            const existingFabric = acc.find((f: any) => f.name === fabric.name);
            if (existingFabric) {
              // If fabric with same name exists, add color if not already present
              if (!existingFabric.colors.includes(fabric.color.name)) {
                existingFabric.colors.push(fabric.color.name);
              }
            } else {
              // If fabric doesn't exist, add new entry
              acc.push({
                name: fabric.name,
                colors: [fabric.color.name]
              });
            }
            return acc;
          }, []);

          // Format the grouped fabrics
          return fabricGroups.map((fabric: any) =>
            `${fabric.name} (${fabric.colors.join(', ')})`
          ).join(', ')
        }
    },
    {
      key: 'orderDate',
      label: 'Sipariş Tarihi',
      formatter: (value: any) => dayjs(value).format("DD.MM.YYYY")
    }
  ]

  // Fetch detailed data for expanded rows if needed
// Define expanded column mappings for detailed view
const expandedColumnMappings = [
    { key: 'measurement.name', label: 'Ölçü Adı' },
    { key: 'measurement.width', label: 'Genişlik' },
    { key: 'measurement.height', label: 'Yükseklik' },
    { key: 'count', label: 'Adet' },
    { key: 'orderItemWorkshops', label: 'Toplam Adet', formatter: (item: any) => item.map((x: any) => x.count).reduce((acc: number, curr: number) => acc + curr, 0) },
    { key: 'orderItemWorkshops', label: 'İşlemde', formatter: (item: any) => item.map((x:any) => x.islem.value).reduce((acc: number, curr: number) => acc + curr, 0) },
    { key: 'orderItemWorkshops', label: 'Tamamlandı', formatter: (item: any) => item.map((x:any) => x.tamamalandi.value).reduce((acc: number, curr: number) => acc + curr, 0) },
    { key: 'orderItemWorkshops', label: 'İade', formatter: (item: any) => item.map((x:any) => x.iade.value).reduce((acc: number, curr: number) => acc + curr, 0) },
    { key: 'orderItemWorkshops', label: 'Eksik', formatter: (item: any) => item.map((x:any) => x.eksik.value).reduce((acc: number, curr: number) => acc + curr, 0) },
    { key: 'orderItemWorkshops', label: 'Sevk', formatter: (item: any) => item.map((x:any) => x.sevk).reduce((acc: number, curr: number) => acc + curr, 0) },
  ]

  const expandedDetails = exportItems.flatMap((item: any) => (item.orderItemWorkshopGroupByOrder))
  console.log('expandedDetails is 1111=> ', expandedDetails)
  // Call the exportToExcel function from useExport composable
  await exportToExcel(exportItems, expandedDetails, exportType, columnMappings, expandedColumnMappings)
}

const handleExportToPDF = async (exportType: 'all' | 'selected' = 'all', item?: any) => {
  const exportItems = exportType === 'selected'
    ? [item]
    : search.value.list

  const columnMappings = [
    { key: 'orderCode', label: 'Sipariş Kodu', formatter: (value:any) => value?.toString() },
    {
      key: 'workshopName',
      label: 'Atölye Adı'
    },
    {
      key: 'ownerName',
      label: 'Personel Adı',
    },
    {
      key: 'customerName',
      label: 'Müşteri Adı',
    },
    {
      key: 'fabricModelAndTypeDTOs.fabricModelDTO.code',
      label: 'Ürün Kodu',
    },
    {
      key: 'fabricModelAndTypeDTOs.fabricModelDTO.name',
      label: 'Ürün Adı',
    },
    {
      key: 'fabricModelAndTypeDTOs.fabricTypeDTOs',
      label: 'Kumaş Tipleri',
      formatter: (item: any) =>
        {
          // Group fabrics by name, merging colors for same-named fabrics
          const fabricGroups = item.reduce((acc: any, fabric: any) => {
            const existingFabric = acc.find((f: any) => f.name === fabric.name);
            if (existingFabric) {
              // If fabric with same name exists, add color if not already present
              if (!existingFabric.colors.includes(fabric.color.name)) {
                existingFabric.colors.push(fabric.color.name);
              }
            } else {
              // If fabric doesn't exist, add new entry
              acc.push({
                name: fabric.name,
                colors: [fabric.color.name]
              });
            }
            return acc;
          }, []);

          // Format the grouped fabrics
          return fabricGroups.map((fabric: any) =>
            `${fabric.name} (${fabric.colors.join(', ')})`
          ).join(', ')
        }
    },
    {
      key: 'orderDate',
      label: 'Sipariş Tarihi',
      formatter: (value: any) => dayjs(value).format("DD.MM.YYYY")
    }
  ]

  // Fetch detailed data for expanded rows if needed
  // let expandedDetails: any[] = []
  // if (exportType === 'selected' && item) {
  //   try {
  //     const { data }: any = await $axios('/ToWorkshopOrder/GetOrderItemWorkshopProcess', {
  //       method: 'GET',
  //       params: {
  //         orderItemId: item.orderItemId,
  //         workshopOrderId: item.toWorkshopOrderId,
  //         size: -1
  //       }
  //     })

  //     if (data.value?.succeeded) {
  //       expandedDetails = data.value.data
  //     }
  //   } catch (error) {
  //     console.error('Error fetching expanded details:', error)
  //   }
  // }

  // Define expanded column mappings for detailed view
  const expandedColumnMappings = [
    { key: 'measurement.name', label: 'Ölçü Adı' },
    { key: 'measurement.width', label: 'Genişlik' },
    { key: 'measurement.height', label: 'Yükseklik' },
    { key: 'count', label: 'Adet' },
    { key: 'orderItemWorkshops', label: 'Toplam Adet', formatter: (item: any) => item.map((x: any) => x.count).reduce((acc: number, curr: number) => acc + curr, 0) },
    { key: 'orderItemWorkshops', label: 'İşlemde', formatter: (item: any) => item.map((x:any) => x.islem.value).reduce((acc: number, curr: number) => acc + curr, 0) },
    { key: 'orderItemWorkshops', label: 'Tamamlandı', formatter: (item: any) => item.map((x:any) => x.tamamalandi.value).reduce((acc: number, curr: number) => acc + curr, 0) },
    { key: 'orderItemWorkshops', label: 'İade', formatter: (item: any) => item.map((x:any) => x.iade.value).reduce((acc: number, curr: number) => acc + curr, 0) },
    { key: 'orderItemWorkshops', label: 'Eksik', formatter: (item: any) => item.map((x:any) => x.eksik.value).reduce((acc: number, curr: number) => acc + curr, 0) },
    { key: 'orderItemWorkshops', label: 'Sevk', formatter: (item: any) => item.map((x:any) => x.sevk).reduce((acc: number, curr: number) => acc + curr, 0) },
  ]

  const expandedDetails = exportItems.flatMap((item: any) => (item.orderItemWorkshopGroupByOrder))
  console.log('expandedDetails is 1111=> ', expandedDetails)
  exportToPDF(exportItems, undefined, exportType, columnMappings, expandedColumnMappings, expandedDetails)
}

watch(() => toWorkshop.value.show, (value) => {
  if (!value) {
    clearSendModelsInDialog()
  }
}, { deep: true })


const filter:any = ref({
  masterOrderCode: null,
  stationId: null,
  set: null,
  startDate: null,
  endDate: null,
  loading: false,
})

const fabricSetList:any = ref([])

const fetchFabricSetList = async () => {
  filter.value.loading = true
  const { data }: any = await $axios("/SetFabricModel", {
    method: "GET",
    params: {
      page: 1,
      size: -1
    }
  }).catch((err: any) => {
    toast.error("Set listesi getirilirken hata oluştu");
  })
  if (data.value?.succeeded) {
    fabricSetList.value = data.value?.data
  } else {
    toast.error(data.value?.message || "Set listesi getirilirken hata oluştu");
  }
  filter.value.loading = false
}

const loadingIsArrived:any = ref({})

const toggleCompletedOrder = async (item:any) => {
  console.log('item is => ', item)
  loadingIsArrived.value[item.id] = true
  // /FabricOrder/UpdateArriveFabricOrders

  const { data, isFinished, error }: any = await $axios("/ToWorkshopOrder/UpdateComplatedToWorkshopOrder", {
    method: "PUT",
    data: { id: item.toWorkshopOrderId, complated: !item.isComplatedToWorkshopOrder },
  }).catch((err: any) => {
    toast.error("İşlem tamamlanırken hata oluştu");
    loadingIsArrived.value[item.id] = false
  })

  if (!data.value.succeeded) {
    toast.error(data.value.message || "Kumaş siparişi tamamlanırken hata oluştu")
  } else {
    toast.success("Kumaş siparişi başarıyla tamamlandı", { autoClose: 1000 })
    await fetchToWorkshopList()
  }
  loadingIsArrived.value[item.id] = false
}

onMounted(async () => {
  loading.value.page = true;
  await fetchProcessTypeList();
  await fetchToWorkshopList();
  await fetchStationList();
  await workshop.value.getAllWorkshopList();
  await storage.value.getStorageList();
  await fetchFabricSetList()

  loading.value.page = false;
  loading.value.table = false;
});
</script>

<style scoped>
.btn-clear-filter {}

.orderItemWorkshopGroup-square {
  border: 1px solid rgb(var(--v-theme-primary));
  border-radius: 0.5rem;
  padding: 0.5rem;
}
</style>
