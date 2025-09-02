/*
 * @Author: reiner850593913 lk850593913@gmail.com
 * @Date: 2022-08-27 21:20:59
 * @LastEditors: reiner850593913 lk850593913@gmail.com
 * @LastEditTime: 2022-09-04 00:17:59
 * @FilePath: \robot-management-web\src\store\modules\app.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import Cookies from "js-cookie";

export const useAppStore = defineStore("app", () => {
  const sidebar = reactive({
    opened: Cookies.get("sidebarStatus")
      ? !!+Cookies.get("sidebarStatus")
      : true,
    withoutAnimation: false,
  });

  function closeSideBar(withoutAnimation) {
    Cookies.set("sidebarStatus", 0);
    sidebar.opened = false;
    sidebar.withoutAnimation = withoutAnimation;
  }
  function toggleSideBar() {
    sidebar.opened = !sidebar.opened;
    sidebar.withoutAnimation = false;
    if (sidebar.opened) {
      Cookies.set("sidebarStatus", 1);
    } else {
      Cookies.set("sidebarStatus", 0);
    }
  }

  const device = ref("desktop");

  return {
    sidebar,
    device,
    closeSideBar,
    toggleSideBar,
  };
});
