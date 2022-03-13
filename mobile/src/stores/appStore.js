import { useMemo } from 'react';
import { applySnapshot, types, flow } from 'mobx-state-tree';

import getAllBosses from '@lib/queries/getAllBosses';
import getAllServers from '@lib/queries/getAllServers';
import { ServerModel, RaidBossModel, ServerBossKillModel } from './models';
import subscribeForServerBossKills from '@lib/queries/subscribeForServerBossKills';

let store;

const Store = types
  .model({
    servers: types.array(ServerModel),
    bosses: types.array(RaidBossModel),
    serverKills: types.array(ServerBossKillModel),
  })
  .views((self) => ({
    getBossKill: (bossId) => {
      return self.serverKills.find(
        (serverKill) => serverKill.boss.id === bossId
      );
    },
  }))
  .actions((self) => ({
    setServerKills: (serverKills) => {
      const dataToSet = serverKills.map(({ bossId, serverId, ...rest }) => ({
        ...rest,
        boss: bossId,
        server: serverId,
      }));
      self.serverKills = dataToSet;
    },
  }))
  .actions((self) => {
    const loadServers = flow(function* () {
      const servers = yield getAllServers();
      self.servers = servers;
    });

    const loadBosses = flow(function* () {
      const bosses = yield getAllBosses();
      self.bosses = bosses;
    });

    const initializeDefaults = flow(function* () {
      yield loadServers();
      yield loadBosses();
    });

    const subscribeToServerKills = (serverId) => {
      return subscribeForServerBossKills(serverId, (bossesKills) => {
        self.setServerKills(bossesKills);
      });
    };

    return {
      loadBosses,
      loadServers,
      initializeDefaults,
      subscribeToServerKills,
    };
  });

export function initializeStore(snapshot = null) {
  const _store = store ?? Store.create();

  // If your page has Next.js data fetching methods that use a Mobx store, it will
  // get hydrated here, check `pages/ssg.tsx` and `pages/ssr.tsx` for more details
  if (snapshot) {
    applySnapshot(_store, snapshot);
  }
  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return _store;
  // Create the store once in the client
  if (!store) store = _store;

  return store;
}

export function useStore(initialState) {
  const store = useMemo(() => initializeStore(initialState), [initialState]);

  return store;
}
