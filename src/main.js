import { createApp } from "vue";
import { router } from "./router/index";
import App from "./App.vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faChevronRight,
  faChevronLeft,
  faChevronDown,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
const app = createApp(App);
library.add(faChevronRight, faChevronLeft, faChevronDown, faSearch);
app.component("font-awesome-icon", FontAwesomeIcon);

app.use(router).mount("#app");
