import { init, open } from "libd2";

await init();
// 586870917 = reference seed : waypoint Black Marsh known (room 16)
const game = open({ seed: 586870917, difficulty: "hell" });

for (const id of [6, 20, 21, 22, 23, 24, 25]) {
  try {
    const a = game.area(id);
    console.log(`zone ${id} → exits to [${a.exits?.map(e => e.to?.id)}]`);
  } catch (e) {
    console.log(`zone ${id} → ERROR: ${e.message}`);
  }
}
game.close();