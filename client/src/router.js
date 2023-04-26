import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/about",
      name: "about",
      component: () => import("./views/About.vue")
    },
    {
      path: "/new-page",
      name: "newpage",
      component: () => import("./views/NewPage.vue")
    },
    {
      path: "/drawing",
      name: "drawing",
      component: () => import("./views/Drawing.vue")
    },
    {
      path: "/tester",
      name: "tester",
      component: () => import("./views/Tester.vue")
    }
  ]
});
