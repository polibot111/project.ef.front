import { createApp } from "vue";
import App from "./App.vue";
import DayJsAdapter from "@date-io/dayjs";
import { tr } from 'vuetify/locale'
import "./style.css";

import "./demos/ipc";
import router from "./router";
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const vuetify = createVuetify({
  
  directives,
  locale: {
    locale: 'tr',
    fallback: 'tr',
    messages: { tr },
  },
  date: {
    adapter: DayJsAdapter,
    locale: { name: 'tr-TR' }
  },
  components: {
    ...components,
    VAutocomplete: {
      ...components.VAutocomplete,
    },
    VDatePicker: {
      ...components.VDatePicker,
      props: {
        ...components.VDatePicker.props,
        format: "DD.MM.YYYY HH:mm:ss",
      },
    },
  },
});

// import { globalCookiesConfig } from "vue3-cookies";
// globalCookiesConfig({
//   expireTimes: "30d",
//   path: "/",
//   domain: "",
//   secure: true,
//   sameSite: "None",
// });

createApp(App)
  .use(router)
  .use(vuetify)
  // .use(globalCookiesConfig)
  .mount("#app")
  .$nextTick(() => {
    // postMessage({ payload: "removeLoading" }, "*");
  });
