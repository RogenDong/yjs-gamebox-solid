import { Title } from "@solidjs/meta";
import { json } from "@solidjs/router";
import { clientOnly, GET } from "@solidjs/start";

const GameBox = clientOnly(() => import("~/components/gamebox/xiangqi/game-box"));

export default function Xiangqi() {
  return (
    <main>
      <Title>中国象棋</Title>
      <GameBox />
    </main>
  );
}
