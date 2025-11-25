import { createRouter, createWebHistory } from "vue-router"
import routes from "./pages"
import { ref } from "vue"

// **TODO: authentication logic**
const isAuthenticated = ref(false)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {

  const user = localStorage.getItem('user')  
  isAuthenticated.value = !!user
  console.log('middleware isAuthenticated', isAuthenticated.value)


  if (to.name !== "login" && !isAuthenticated.value) next({ name: "login" })
  else if (to.name === "login" && isAuthenticated.value) next({ name: "home" })
  else next()
})

export default router
