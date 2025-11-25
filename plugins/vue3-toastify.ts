// plugins/vue3-toastify.ts
import { toast } from "vue3-toastify"
import Vue3Toastify, { type ToastContainerOptions } from "vue3-toastify"

export default {
  install: (app, options) => {
    // Plugin code goes here
    app.config.globalProperties.$toast = toast

    app.use(Vue3Toastify, {
      autoClose: 1500,
    } as ToastContainerOptions)
  },
}
