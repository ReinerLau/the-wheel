import { onBeforeUnmount } from "vue";
import { getToken } from "../utils/auth";

export default () => {
  let websocket: WebSocket;

  function initWebsocket(onMessage: (e) => void) {
    const token = getToken();
    websocket = new WebSocket(`wss://${window.location.host}/alarm`, [token]);
    initCallback(onMessage);
  }

  onBeforeUnmount(() => {
    close();
  });

  function close() {
    websocket.close();
  }

  function initCallback(onMessage: (e) => void) {
    websocket.onmessage = onMessage ? onMessage : null;
    window.onbeforeunload = () => close();
  }

  return {
    initWebsocket,
  };
};
