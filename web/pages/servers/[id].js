import Head from 'next/head';
import { observer } from 'mobx-react-lite';
import { getSnapshot } from 'mobx-state-tree';
import { initializeStore, useStore } from '@stores/appStore';

import Layout from '@components/layout';

export async function getStaticProps() {
  const store = initializeStore();
  await store.loadServers();

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

const Server = (props) => {
  const { servers } = useStore();
  return (
    <Layout>
      <>
        <Head>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          <div>Test</div>
        </main>

        <footer>
          <div>Footer</div>
        </footer>
      </>
    </Layout>
  );
};

export default observer(Server);
