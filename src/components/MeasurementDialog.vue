<template>
  <BtModal 
    v-model:show="dialog.show" 
    v-model:loading="dialog.loading" 
    :title="dialog.title" 
    @save="handleSubmit">
    <template #content>
      <v-card-text>
        <v-form ref="typeForm" @submit.prevent>
          <v-text-field 
            v-model="model.name" 
            label="Ölçü Adı" 
            elevation="0" 
            variant="outlined" 
            class="mb-3" 
            :rules="[rules.required]" 
          />
          <v-text-field 
            v-model="model.width" 
            label="En" 
            elevation="0" 
            variant="outlined" 
            class="mb-3" 
            :rules="[rules.required]" 
          />
          <v-text-field 
            v-model="model.height" 
            label="Boy" 
            elevation="0" 
            variant="outlined" 
            class="mb-3" 
            :rules="[rules.required]" 
          />
        </v-form>
      </v-card-text>
    </template>
  </BtModal>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import { rules } from '../../config/rules'
import BtModal from './BtModal.vue'
import $axios from '../composables/axios'

const emit = defineEmits(['refresh'])

const dialog = ref({
  show: false,
  loading: false,
  title: "Ölçü Ekle",
  type: "new"
})

const model = ref({
  name: "",
  width: "",
  height: "",
})

const typeForm = ref()

const show = () => {
  dialog.value.show = true
  dialog.value.title = "Ölçü Ekle"
  dialog.value.type = "new"
  model.value = {
    name: "",
    width: "",
    height: "",
  }
}

const edit = (item: any) => {
  model.value = { ...item, id: item.id }
  dialog.value.show = true
  dialog.value.title = "Ölçü Düzenle"
  dialog.value.type = "edit"
}

const handleSubmit = async () => {
  typeForm.value?.validate()
  if (typeForm.value?.isValid) {
    dialog.value.loading = true
    const url = "/Meansure"

    const { data }: any = await $axios(url, {
      method: dialog.value.type === "new" ? "POST" : "PUT",
      data: model.value,
    }).catch((err: any) => {
      dialog.value.loading = false
      toast.error("Ölçü eklenirken hata oluştu")
    })

    dialog.value.loading = false
    if (!data.value.succeeded) {
      toast.error(data.value.message || "Ölçü eklenirken hata oluştu")
    } else {
      toast.success(dialog.value.type === "new" ? 'Ölçü başarıyla eklendi' : 'Ölçü başarıyla güncellendi')
      emit('refresh')
      dialog.value.show = false
    }
  }
}

defineExpose({
  show,
  edit
})
</script> 