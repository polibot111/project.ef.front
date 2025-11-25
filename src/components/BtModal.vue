<template>
	<v-dialog v-model:model-value="refShow" :max-width="width" persistent>
		<template v-slot:default="{ isActive }">
			<v-card>
				<template #title>
					<div class="d-flex align-center">
						<slot name="title"
							><span class="headline">{{ title }}</span></slot
						>
						<v-spacer></v-spacer>
						<v-btn icon @click="handleCancel" size="small" elevation="0">
							<v-icon>mdi-close</v-icon>
						</v-btn>
					</div>
				</template>
				<slot name="content">
					<v-card-text>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
					</v-card-text>
				</slot>

				<v-card-actions v-if="!hideFooter">
					<slot name="actions">
						<v-btn color="gray" @click="handleCancel" :disabled="refLoading"> İptal </v-btn>
						<v-spacer />
						<v-btn color="primary" variant="flat" :disabled="refLoading" :loading="refLoading" @click="emit('save')">
							Kaydet
							<v-icon right class="ml-2">mdi-content-save-outline</v-icon>
						</v-btn>
					</slot>
				</v-card-actions>
			</v-card>
		</template>
	</v-dialog>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, computed } from "vue";
const props = defineProps({
  show: Boolean,
  title: String,
  loading: Boolean,
  width: {
    type: [String, Number],
    default: 500,
  },
  hideFooter: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:show", "update:loading", "save", "cancel"]);

const refShow: any = computed({
  get: () => props.show,
  set: (value: any) => emit("update:show", value),
});

const refLoading: any = computed({
  get: () => props.loading,
  set: (value: any) => emit("update:loading", value),
});

const handleCancel = () => {
  emit("update:show", false);
  emit("cancel");
};
</script>
