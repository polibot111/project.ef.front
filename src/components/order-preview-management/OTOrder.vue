<template>
	<div class="comp-ot_order">
		<v-card elevation="0" class="border-0 ma-3">
			<v-card-title class=" text-primary pb-0 w-100 mx-0" style="font-size: 20px; font-weight: 600"
				><slot name="header">{{ props.title }}</slot></v-card-title
			>
			<v-card-text class="px-0 py-0 mt-0">
				<slot />
			</v-card-text>
		</v-card>
	</div>
</template>

<script lang="ts" setup>
const props = defineProps({
    title: String,
    item: Object,
})
</script>
