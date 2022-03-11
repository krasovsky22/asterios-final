import { types } from "mobx-state-tree";

import RaidBossModel from "./raidboss";
import ServerModel from "./server";

const ServerBossKillModel = types
  .model({
    link: types.string,
    guid: types.string,
    title: types.string,
    pubDate: types.string,
    content: types.string,
    isoDate: types.string,
    contentSnippet: types.string,
    boss: types.reference(types.late(() => RaidBossModel)),
    server: types.reference(types.late(() => ServerModel)),

    isSpawning: types.optional(types.boolean, false),
    isSpawned: types.optional(types.boolean, false),
    isChestVisible: types.optional(types.boolean, false),
  })
  .views((self) => ({
    get killedAt() {
      const killedAt = new Date(self.isoDate);

      return `${killedAt.toLocaleDateString()} ${killedAt.toLocaleTimeString()}`;
    },

    get respawnStartTime() {
      const respawnStartTime = new Date(self.isoDate);
      respawnStartTime.setTime(
        respawnStartTime.getTime() + 18 * 60 * 60 * 1000
      );

      return respawnStartTime.toLocaleString();
    },

    get respawnEndTime() {
      const respawnEndTime = new Date(self.isoDate);
      respawnEndTime.setTime(respawnEndTime.getTime() + 30 * 60 * 60 * 1000);

      return respawnEndTime.toLocaleString();
    },

    get checkIsVisibleUntil() {
      const checkEndTime = new Date(self.isoDate);
      checkEndTime.setTime(checkEndTime.getTime() + 3 * 60 * 1000);

      return checkEndTime;
    },
  }))
  .actions((self) => ({
    setIsSpawning: (isSpawning) => {
      self.isSpawning = isSpawning;
    },
    setIsSpawned: (isSpawned) => {
      self.isSpawned = isSpawned;
    },
    setIsChestVisible: (isChestVisible) => {
      self.isChestVisible = isChestVisible;
    },
  }))
  .actions((self) => {
    let interval;

    const afterCreate = () => {
      interval = setInterval(() => {
        const { isoDate } = self;

        if (!isoDate) {
          return;
        }
        const killedAt = new Date(isoDate);
        const now = new Date();

        const respawnStartTime = new Date(isoDate);
        respawnStartTime.setTime(killedAt.getTime() + 18 * 60 * 60 * 1000);

        const respawnEndTime = new Date(isoDate);
        respawnEndTime.setTime(killedAt.getTime() + 30 * 60 * 60 * 1000);

        const checkEndTime = new Date(isoDate);
        checkEndTime.setTime(killedAt.getTime() + 3 * 60 * 1000);

        self.setIsSpawned(now > respawnEndTime);
        self.setIsChestVisible(now < checkEndTime);
        self.setIsSpawning(now > respawnStartTime && now < respawnEndTime);
      }, 1000);
    };

    const beforeDestroy = () => {
      clearInterval(interval);
    };

    return {
      afterCreate,
      beforeDestroy,
    };
  });

export default ServerBossKillModel;
