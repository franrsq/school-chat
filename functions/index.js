const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.createChat = functions.https.onCall((data, context) => {
  const name = data.name;
  const imageURL = data.imageURL ? data.imageURL : null;
  if (!(typeof name === 'string') || name.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
      'one arguments "name" containing the name of the group to add.');
  }
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
      'while authenticated.');
  }

  const userRef = db.collection('users').doc(context.auth.uid);
  const groupRef = db.collection('groups').doc();

  return db.runTransaction((transaction => {
    return transaction.get(userRef).then((userDoc) => {
      if (!userDoc) {
        throw 'User document does not exists!';
      }

      let groups = userDoc.data().groups ? userDoc.data().groups : [];
      groups.push(groupRef.id);

      transaction.create(groupRef, {
        name: name,
        imageURL: imageURL,
        createdAt: admin.firestore.Timestamp.fromDate(new Date()),
        createdBy: context.auth.uid,
        members: [context.auth.uid],
        admins: [context.auth.uid]
      });

      transaction.update(userRef, { groups: groups });
    });
  })).then(() => {
    console.log('New group created');
    return {}
  }).catch((error) => {
    if (error instanceof functions.https.HttpsError) throw error;
    console.error("Error: ", error)
    throw new functions.https.HttpsError(
      "unknown",
      "There was an unknown error."
    );
  });
});

exports.joinChat = functions.https.onCall((data, context) => {
  const chatId = data.chatId;
  if (!(typeof chatId === 'string') || chatId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
      'one arguments "name" containing the name of the group to add.');
  }
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
      'while authenticated.');
  }

  const userRef = db.collection('users').doc(context.auth.uid);
  const groupRef = db.collection('groups').doc(chatId);

  return db.runTransaction((async (transaction) => {
    const groupDoc = await transaction.get(groupRef);
    if (!groupDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Group document does not exists');
    }
    const userDoc = await transaction.get(userRef);
    if (!userDoc) {
      throw 'User document does not exists!';
    }

    let groups = userDoc.data().groups ? userDoc.data().groups : [];
    if (groups.includes(chatId)) {
      throw new functions.https.HttpsError('already-exists', 'You already are part of this group');
    }
    groups.push(chatId);
    transaction.update(userRef, { groups: groups });

    let members = groupDoc.data().members ? groupDoc.data().members : [];
    if (members.includes(context.auth.uid)) {
      throw new functions.https.HttpsError('already-exists', 'You already are part of this group');
    }
    members.push(context.auth.uid);
    transaction.update(groupRef, { members: members });
  })).then(() => {
    console.log('User joined a group');
    return {}
  }).catch((error) => {
    if (error instanceof functions.https.HttpsError) throw error;
    console.error("Error: ", error)
    throw new functions.https.HttpsError(
      "unknown",
      "There was an unknown error."
    );
  });
});
