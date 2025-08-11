import { eventHandler } from "vinxi/http";
import { YCrossws } from "../server/crossws";

const yc = new YCrossws();

export default eventHandler({
  handler(req) {},
  websocket: {
    async open(peer) {
      yc.onOpen(peer);
    },
    async message(peer, message) {
      yc.onMessage(peer, message);
    },
    async close(peer, details) {
      yc.onClose(peer);
    },
    async error(peer, error) {},
  },
});
