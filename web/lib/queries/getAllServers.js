import { collection, getDocs, query, where } from 'firebase/firestore';
import { database } from '@lib/firebase';

const getAllServers = async () => {
  const serversQuery = query(
    collection(database, 'servers'),
    where('enabled', '==', true)
  );

  const querySnapshot = await getDocs(serversQuery);
  return querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
};

export default getAllServers;
