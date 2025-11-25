import { useAxios } from "@vueuse/integrations/useAxios";
import axios from "axios";
import { toast } from "vue3-toastify";

//const baseURL = "https://byozcetekstil.azurewebsites.net/api";
const baseURL = "https://localhost:7142/api";

export default function $axios(url: string, options: any = {}) {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      if (!response.data?.succeeded) {
        toast.error(response.data.message);
        return Promise.reject(response.data);
      }
      return response;
    },
    (error) => {
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        toast.error("Oturumunuz sona erdi. Lütfen tekrar giriş yapın.");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return useAxios(url, options, instance);
}

export { $axios };
