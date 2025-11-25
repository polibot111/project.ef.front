<template>
	<v-card color="primary" variant="tonal" class="comp-ot_order_item" style="width: 100%; max-width: calc(calc(100% / 4) - 1.75rem); min-width: 192px;">
		<v-card-title class="font-weight-bold text-xs"></v-card-title>
		<v-card-text class="d-flex flex-column text-subtitle-2" style="font-weight: 500;">
			<div><strong>Ölçü Adı: </strong><span>{{ props.name }}</span></div>
			<div><strong>Ölçü Boyutu: </strong><span>{{ props.size }}</span></div>
			<div><strong>Adet: </strong><span>{{props.count}}</span></div>
		</v-card-text>
	</v-card>
</template>

<script lang="ts" setup>
import {computed, defineProps, ref} from 'vue'

const props = defineProps({
	size: String,
	name: String,
	count: [Number,String],
})
</script>

<style></style>
