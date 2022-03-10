import Head from 'next/head';
import { observer } from 'mobx-react-lite';
import { getSnapshot } from 'mobx-state-tree';
import { initializeStore, useStore } from '@stores/appStore';

import Layout from '@components/layout';

export function getStaticProps() {
  console.log('executing get static props');
  const store = initializeStore();

  console.log('aaaa');
  return { props: { initialState: getSnapshot(store) } };
}

const Home = (props) => {
  const { servers } = useStore();
  console.log('in home page', servers, props);
  return (
    <Layout>
      <>
        <Head>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          <div>
            <pre>{JSON.stringify(getSnapshot(servers))}</pre>
          </div>
        </main>

        <footer>
          <div>Footer</div>
        </footer>
      </>
    </Layout>
  );
};

export default observer(Home);
