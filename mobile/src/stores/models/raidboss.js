import { types } from "mobx-state-tree";

const RaidBossModel = types.model({
  id: types.identifier,
  name: types.string,
  command: types.string,
  floor: types.maybeNull(types.number),
});

export default RaidBossModel;
