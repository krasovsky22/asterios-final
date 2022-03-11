import { collection, getDocs, query, where } from 'firebase/firestore';
import { database } from '@lib/firebase';

const getAllBosses = async () => {
  const bossesQuery = query(collection(database, 'bosses'));

  const querySnapshot = await getDocs(bossesQuery);
  return querySnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
};

export default getAllBosses;
