const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Parser = require( "rss-parser");

const initialBosses = require( "./initial-data/bosses");
const initialServers = require( "./initial-data/servers");

admin.initializeApp();
const parser = new Parser();

const bossesCollection = admin.firestore().collection("bosses");
const serversCollection = admin.firestore().collection("servers");
const serversBossesKillsCollection = admin
    .firestore()
    .collection("servers-bosses-kills");

const loadServersFromFirestore = async () => {
  const serversRecords = await serversCollection.get().then((snapshot) =>
    snapshot.docs.reduce((carry, doc) => {
      Object.assign(carry, {[doc.id]: doc.data()});
      return carry;
    }, {}),
  );

  // if nothing in database, insert initial data
  if (Object.values(serversRecords).length === 0) {
    await Promise.all(
        initialServers.map((server) => serversCollection.doc().set(server)),
    );

    return await serversCollection.get().then((snapshot) =>
      snapshot.docs.reduce((carry, doc) => {
        Object.assign(carry, {[doc.id]: doc.data()});
        return carry;
      }, {}),
    );
  }

  return serversRecords;
};

const loadBossesFromFirestore = async () => {
  const bossesRecords = await bossesCollection.get().then((snapshot) =>
    snapshot.docs.reduce((carry, doc) => {
      Object.assign(carry, {[doc.id]: doc.data()});
      return carry;
    }, {}),
  );

  // if nothing in database, insert initial data
  if (Object.values(bossesRecords).length === 0) {
    await Promise.all(
        initialBosses.map((boss) => bossesCollection.doc().set(boss)),
    );

    return await bossesCollection.get().then((snapshot) =>
      snapshot.docs.reduce((carry, doc) => {
        const bossData = doc.data();
        Object.assign(carry, {[doc.id]: bossData});
        return carry;
      }, {}),
    );
  }

  return bossesRecords;
};

exports.parseMainFeed = functions.https.onRequest(async (req, res) => {
  const servers = await loadServersFromFirestore();
  const bosses = await loadBossesFromFirestore();

  Object.keys(servers).forEach(async (serverKey) => {
    const server = servers[serverKey];

    const URL = `https://asterios.tm/index.php?cmd=rss&serv=${server.asteriosId}&id=keyboss&out=xml`;
    const feed = await parser.parseURL(URL);

    const {items} = feed;
    if (!items) {
      // eslint-disable-next-line max-len
      res
          .status(500)
          .json({error: "Unable to get last build date from Asterios"});
      return;
    }

    const prevBossKills =
      await serversBossesKillsCollection
          .where("serverId", "==", serverKey)
          .get()
          .then((snapshot) =>
            snapshot.docs.reduce((carry, doc) => {
              Object.assign(carry, {[doc.id]: doc.data()});
              return carry;
            }, {}),
          );

    Object.keys(bosses).forEach(async (bossKey) => {
      const boss = bosses[bossKey];
      const bossData = items.find((item) =>
        item.title?.includes(boss.name),
      );

      if (!bossData) {
        return;
      }

      Object.assign(bossData, {serverId: serverKey, bossId: bossKey});

      const prevKillRef = Object.keys(prevBossKills).find((prevBossKey) => {
        const prevKill = prevBossKills[prevBossKey];

        return prevKill.bossId === bossKey;
      });

      // doesnt have any prev kills, just store it
      if (!prevKillRef) {
        serversBossesKillsCollection.doc().set(bossData);
        return;
      }

      if (bossData.pubDate) {
        const prevPubDate = new Date(prevBossKills[prevKillRef].pubDate);
        const currentPubDate = new Date(bossData.pubDate);

        if (prevPubDate < currentPubDate) {
          console.log(`New ${boss.name} kill detected. Updating...`);

          await serversBossesKillsCollection.doc(prevKillRef).set(bossData);
        } else {
          console.log(`No new kills detected for ${boss.name}...`);
        }
      }
    });
  });

  res.json({success: true});
});
