import { useMemo } from 'react';
import { applySnapshot, types, flow } from 'mobx-state-tree';

import { ServerModel, RaidBossModel, ServerBossKillModel } from './models';
import getAllServers from '@lib/queries/getAllServers';

let store;

const Store = types
  .model({
    servers: types.array(ServerModel),
    bosses: types.array(RaidBossModel),
    serverKills: types.array(ServerBossKillModel),

    isInitialized: false,
  })
  .actions((self) => {
    const afterCreate = flow(function* () {
      const servers = yield getAllServers();
      self.servers = servers;
      self.isInitialized = true;
    });
    return {
      afterCreate,
    };
  });

export function initializeStore(snapshot = null) {
  console.log('execuiting initialize', snapshot, store);

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

  console.log('current store', store);

  return store;
}

export function useStore(initialState) {
  const store = useMemo(() => initializeStore(initialState), [initialState]);

  return store;
}
