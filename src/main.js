import "./assets/main.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "alertifyjs/build/css/alertify.min.css";
import "alertifyjs/build/css/themes/default.min.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// 🔄 CORRECTO: primero crear la app
const app = createApp(App);

// ✅ Luego usar plugins
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const options = {
  position: "top-center",
  timeout: 1000,
  transition: "Vue-Toastification__fade",
  maxToasts: 3,
  newestOnTop: true,
};

app.use(router);
app.use(Toast, options);

// ✅ Finalmente montar
app.mount("#app");
