import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import $axios from './axios'

export default function useMeasurementDialog() {
  const measurement = ref({
    show: false,
    loading: false,
    list: [],
    title: "Ölçü Ekle",
    type: "new",
    name: "",
    width: "",
    height: "",
  })

  const fetchMeasurementList = async (tableOptions: any) => {
    const { data }: any = await $axios("/Meansure", {
      method: "GET",
      params: {
        page: tableOptions.page,
        size: tableOptions.itemsPerPage,
      },
    }).catch((err: any) => {
      toast.error(err.message || "Ölçüler getirilirken hata oluştu")
    })

    if (!data.value.succeeded) {
      toast.error(data.value.message || "Ölçüler getirilirken hata oluştu")
    } else {
      measurement.value.list = data.value?.data
    }
  }

  const submitMeasurement = async () => {
    measurement.value.loading = true
    
    const { data, error }: any = await $axios("/Measurement", {
      method: "POST",
      data: {
        name: measurement.value.name,
        width: measurement.value.width,
        height: measurement.value.height,
      },
    }).catch((err: any) => {
      measurement.value.loading = false
      toast.error("Ölçü eklenirken hata oluştu")
    })

    if (error.value) {
      toast.error(error.message || "Ölçü eklenirken hata oluştu")
    } else {
      toast.success("Ölçü başarıyla eklendi")
      measurement.value.show = false
    }
    measurement.value.loading = false
  }

  const openDialog = () => {
    measurement.value = {
      ...measurement.value,
      show: true,
      name: "",
      width: "",
      height: "",
      type: "new",
      title: "Ölçü Ekle"
    }
  }

  const closeDialog = () => {
    measurement.value.show = false
  }

  return {
    measurement,
    fetchMeasurementList,
    submitMeasurement,
    show: openDialog,
    hide: closeDialog
  }
} 