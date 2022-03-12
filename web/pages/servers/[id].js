import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { getSnapshot } from 'mobx-state-tree';
import { SimpleGrid, useMediaQuery } from '@chakra-ui/react';

import Layout from '@components/layout';
import { Raidboss } from '@components/Raidboss';
import { initializeStore, useStore } from '@stores/appStore';

export async function getStaticProps() {
  const store = initializeStore();
  await store.initializeDefaults();

  return { props: { initialState: getSnapshot(store) } };
}

export async function getStaticPaths() {
  const store = initializeStore();
  await store.loadServers();

  return {
    paths: store.servers.map((server) => ({
      params: { id: server.id.toString() },
    })),

    fallback: true, // false or 'blocking'
  };
}

const Server = () => {
  const { query } = useRouter();
  const { id: serverId } = query;

  const { subscribeToServerKills, bosses } = useStore();
  const [isNotTablet = true] = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    const unsubscribe = subscribeToServerKills(serverId);

    return () => unsubscribe();
  }, [serverId, subscribeToServerKills]);

  return (
    <Layout>
      <SimpleGrid
        key={isNotTablet ? 2 : 1}
        columns={{ base: 1, sm: 2 }}
        spacing={isNotTablet ? 10 : 5}
        height="100%"
      >
        {bosses.map((boss) => (
          <Raidboss key={boss.id} boss={boss} isMobileView={!isNotTablet} />
        ))}
      </SimpleGrid>
    </Layout>
  );
};

export default observer(Server);
