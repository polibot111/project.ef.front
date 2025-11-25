<template>
  <v-dialog v-model="refShow" :max-width="maxWidth">
    <template v-slot:default="{ isActive }">
      <v-card :title="title">
        <v-card-text>
          <slot name="content" />
        </v-card-text>

        <v-card-actions>
          <v-btn
            color="gray"
            variant="outlined"
            :disabled="loading"
            @click="emit('cancel')"
          >
            İptal
          </v-btn>
          <v-spacer></v-spacer>

          <v-btn
            :color="type"
            variant="flat"
            :loading="loading"
            :disabled="loading"
            @click="emit('save')"
          >
            Onayla
          </v-btn>
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
  type: {
    type: String,
    default: "info",
  },
  maxWidth: {
    type: [String, Number],
    default: "500",
  },
});
const emit = defineEmits(["update:show", "save", "cancel"]);

const refShow = computed({
  get: () => props.show,
  set: (value: any) => emit("update:show", value),
});
</script>
