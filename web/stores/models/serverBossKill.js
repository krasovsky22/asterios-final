import { types } from "mobx-state-tree";

import RaidBossModel from "./raidboss";
import ServerModel from "./server";

const ServerBossKillModel = types.model({
  link: types.string,
  guid: types.string,
  title: types.string,
  pubDate: types.string,
  content: types.string,
  isoDate: types.string,
  contentSnippet: types.string,
  boss: types.reference(types.late(() => RaidBossModel)),
  server: types.reference(types.late(() => ServerModel)),
});

export default ServerBossKillModel;
