import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { getSnapshot } from 'mobx-state-tree';
import { initializeStore, useStore } from '@stores/appStore';
import { useRouter } from 'next/router';

export async function getStaticProps() {
  const store = initializeStore();
  await store.loadServers();

  return { props: { initialState: getSnapshot(store) } };
}

const Home = (props) => {
  const router = useRouter();
  const { servers } = useStore();

  useEffect(() => {
    if (servers.length > 0) {
      router.push(`/servers/${servers[0].id}`, undefined, { shallow: true });
    }
  }, [servers]);

  return <div>Loading...</div>;
};

export default observer(Home);
