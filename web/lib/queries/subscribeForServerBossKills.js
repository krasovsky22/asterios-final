import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { database } from '@lib/firebase';

const subscribeForServerBossKills = (serverId, callback) => {
  const q = query(
    collection(database, 'servers-bosses-kills'),
    where('serverId', '==', serverId)
  );
  return onSnapshot(q, (querySnapshot) => {
    const bossesKills = querySnapshot.docs.map((doc) => ({ ...doc.data() }));

    callback(bossesKills);
  });
};

export default subscribeForServerBossKills;
