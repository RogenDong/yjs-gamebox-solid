import { Title } from "@solidjs/meta";
import { clientOnly } from "@solidjs/start";

const GameBox = clientOnly(() => import("~/components/gamebox/chinese-chess-box/chinese-chess-box"));

export default function Xiangqi() {
  return (
    <main>
      <Title>中国象棋</Title>
      <GameBox />
    </main>
  );
}
