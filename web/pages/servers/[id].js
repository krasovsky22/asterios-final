import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { SimpleGrid } from '@chakra-ui/react';
import { getSnapshot } from 'mobx-state-tree';

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

  useEffect(() => {
    const unsubscribe = subscribeToServerKills(serverId);

    return () => unsubscribe();
  }, [serverId, subscribeToServerKills]);

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <SimpleGrid columns={2} spacing={10} height="100%">
          {bosses.map((boss) => (
            <Raidboss key={boss.id} boss={boss} />
          ))}
        </SimpleGrid>
      </Layout>
    </>
  );
};

export default observer(Server);
