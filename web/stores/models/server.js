import { types } from "mobx-state-tree";

const ServerModel = types.model({
  id: types.identifier,
  name: types.string,
  enabled: types.boolean,
  asteriosId: types.number,
});

export default ServerModel;
