import firestore from '@react-native-firebase/firestore';

export default async function fetchAllServers() {
  const querySnapshots = await firestore()
    .collection('servers')
    .where('enabled', '==', true)
    .get();

  return querySnapshots.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  }));
}
