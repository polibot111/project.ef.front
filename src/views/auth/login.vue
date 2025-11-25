<template>
  <div class="page-login">
    <v-card class="pa-10" elevation="0">
      <img
        src="/logo.png"
        alt="logo"
        class="mx-auto mb-10"
        style="max-width: 500px; margin-top: 50px"
      />

      <v-form
        ref="loginForm"
        fast-fail
        @submit.prevent="handleSubmit"
        style="min-width: 500px; text-align: left"
        :disabled="loading"
      >
        <v-text-field
          v-model="modelpool.email"
          :rules="[rules.required, rules.email]"
          label="E-Posta"
          elevation="0"
          variant="outlined"
          class="mb-3"
        />

        <v-text-field
          :type="password.show ? 'text' : 'password'"
          v-model="modelpool.password"
          :rules="[rules.required, rules.min6]"
          label="Şifre"
          elevation="0"
          variant="outlined"
          class="mb-3"
        >
          <template #append-inner>
            <v-btn
              @click="password.show = !password.show"
              elevation="0"
              size="small"
              icon
            >
              <v-icon>{{ password.show ? "mdi-eye-off" : "mdi-eye" }}</v-icon>
            </v-btn>
          </template>
        </v-text-field>
        <v-checkbox v-model="rememberMe" label="Beni Hatırla" class="mb-3" />

        <v-btn
          class="mt-2"
          color="primary"
          elevation="0"
          type="submit"
          block
          size="large"
          :disabled="loading"
          :loading="loading"
          >Giriş Yap</v-btn
        >
      </v-form>
    </v-card>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, watch } from "vue";
import { toast } from "vue3-toastify";
import { ref } from "vue";
import { useCookies } from "vue3-cookies";
import { useRouter } from "vue-router";
import { rules } from "../../../config/rules";
import $axios from "../../composables/axios";

const { cookies } = useCookies();
const router = useRouter();

const loginForm = ref();

const modelpool = ref({
  email: "",
  password: "",
});

const password = ref({
  value: "",
  show: false,
});

const rememberMe = ref(false);
const loading = ref(false);

onMounted(() => {
  const cookieRemember = JSON.parse(cookies.get("userMail"));

  if (cookieRemember) {
    const cookieMail = cookieRemember.replace(/['"]+/g, "");
    modelpool.value.email = cookieMail;
    rememberMe.value = true;
  }
});

watch(rememberMe, (value) => {
  if (value) {
    cookies.set("userMail", JSON.stringify(modelpool.value.email));
  } else {
    cookies.remove("userMail");
  }
});

async function handleSubmit(form: any) {
  if (!loginForm.value.isValid) {
    toast.error("Zorunlu alanları doldurun");
    return;
  }

  const tempUser = {
    email: "user@user.com",
    password: "123123",
  };

  loading.value = true;
  /**
   * Start api call
   */

  try {
    const result = await $axios('/Users/Login', {
      method: 'POST',
      data: modelpool.value
    })

    if (result.data.value.succeeded) {
      toast.success("Giriş başarılı");
      localStorage.setItem("token", result.data.value.data.token);
      localStorage.setItem("user", JSON.stringify(result.data.value.data));
      
      setTimeout(() => {
        router.push("/");
      }, 750);
    } else {
      toast.error(result.data.value.message || "Giriş başarısız");
    }
  } catch (error) {
    // toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
  } finally {
    loading.value = false;
  }

}
</script>
