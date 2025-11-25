<template>
  <div class="comp-bt_date_picker">
    <v-text-field
      v-model:model-value="formattedDate"
      ref="datePicker"
      type="text"
      flat
      variant="outlined"
      hide-details
      compact
      dense
      class="txt-search dense bg-white"
      :placeholder="placeholder"
      :label="label"
      readonly
    >
      <template v-slot:prepend-inner>
        <v-icon>mdi-calendar</v-icon>
      </template>
    </v-text-field>
    <v-menu
      :activator="datePicker"
      :close-on-content-click="false"
      style="border: 1px solid var(--bt-theme-border-color)"
      :disabled="disabled"
    >
      <div class="comp-bt_date_picker bt-picker">
        <v-date-picker
          :key="id + 'picker'"
          :id="id + 'picker'"
          v-model:model-value="date"
          :title="label + ' seçiniz'"
          :placeholder="label + ' seçiniz'"
          locale="tr"
          color="primary"
          header="Tarih Seçiniz"
          format="DD.MM.YYYY"
          :disabled="disabled"
          @update:model-value="handleFormatDate"
          :locales="{ tr: 'tr' }"
        ></v-date-picker>
      </div>
    </v-menu>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, watchEffect } from "vue";
import dayjs from "dayjs";
import { useDate } from "vuetify";

const formatDate = useDate();

const props = defineProps({
  id: String,
  label: String,
  placeholder: String,
  modelValue: {
    type: [String, Date],
    default: new Date(),
  },
  disabled: Boolean,
});
const emit = defineEmits(["update:modelValue", 'formatted']);

const datePicker = ref();
const date: any = ref();
const formattedDate = ref();


function handleFormatDate(newVal: any) {
  formattedDate.value = dayjs(newVal).format("DD.MM.YYYY");
  emit("update:modelValue", newVal);
}
watch(() => props.modelValue, (newVal) => {
  date.value = newVal
  if (newVal) formattedDate.value = dayjs(newVal).format("DD.MM.YYYY")
  else formattedDate.value = null
})
</script>
<style>
.comp-bt_date_picker.bt-picker {
  border: 1px solid var(--bt-theme-border-color);
  border-radius: 4px;
}
</style>
