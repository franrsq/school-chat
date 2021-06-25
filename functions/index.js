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

exports.sendMessage = functions.https.onCall((data, context) => {
  const groupId = data.groupId;
  const message = data.message;
  const mediaURL = data.mediaURL;
  const mediaType = data.mediaType;
  if ((!(typeof message === 'string') || message.length === 0) ||
    (!(typeof groupId === 'string') || groupId.length === 0)) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
      'arguments "message" containing the message to send and "groupId" containing the group.');
  }
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
      'while authenticated.');
  }

  const groupRef = db.collection('groups').doc(groupId);
  const messageRef = db.collection('user-message').doc(groupId).collection('messages').doc();
  return db.runTransaction(async (transaction) => {
    const groupDoc = await transaction.get(groupRef);
    if (!groupDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Group document does not exists');
    }
    if (!groupDoc.data().members.includes(context.auth.uid)) {
      throw new functions.https.HttpsError('not-found', 'User is not part of the group');
    }

    transaction.create(messageRef, {
      message: message,
      mediaURL: mediaURL,
      mediaType: mediaType,
      sentAt: admin.firestore.Timestamp.fromDate(new Date()),
      sentBy: context.auth.uid
    });
  });
});

exports.sendAdminMessage = functions.https.onCall((data, context) => {
  const groupId = data.groupId;
  const message = data.message;
  const mediaURL = data.mediaURL;
  const mediaType = data.mediaType;
  if ((!(typeof message === 'string') || message.length === 0) ||
    (!(typeof groupId === 'string') || groupId.length === 0)) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
      'arguments "message" containing the message to send and "groupId" containing the group.');
  }
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
      'while authenticated.');
  }

  const groupRef = db.collection('groups').doc(groupId);
  const messageRef = db.collection('admin-message').doc(groupId).collection('messages').doc();
  return db.runTransaction(async (transaction) => {
    const groupDoc = await transaction.get(groupRef);
    if (!groupDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Group document does not exists');
    }
    if (!groupDoc.data().admins.includes(context.auth.uid)) {
      throw new functions.https.HttpsError('not-found', 'User is not admin of the group');
    }

    transaction.create(messageRef, {
      message: message,
      mediaURL: mediaURL,
      mediaType: mediaType,
      sentAt: admin.firestore.Timestamp.fromDate(new Date()),
      sentBy: context.auth.uid
    });
  });
});

exports.markMessage = functions.https.onCall((data, context) => {
  const groupId = data.groupId;
  const messageId = data.messageId;

  if ((!(typeof groupId === 'string') || groupId.length === 0) ||
    (!(typeof messageId === 'string') || messageId.length === 0)) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
      'arguments "userId", "groupId", "messageId".');
  }
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
      'while authenticated.');
  }

  const todoRef = db.collection('to-do').doc(context.auth.uid)
    .collection('groups').doc(groupId).collection('messages').doc(messageId);
  const messageRef = db.collection('admin-message').doc(groupId).collection('messages').doc(messageId);
  return db.runTransaction(async (transaction) => {
    const messageDoc = await transaction.get(messageRef);
    if (!messageDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Message document does not exists');
    }

    transaction.create(todoRef, {
      marked: true
    });
  });
});

exports.unmarkMessage = functions.https.onCall((data, context) => {
  const groupId = data.groupId;
  const messageId = data.messageId;

  if ((!(typeof groupId === 'string') || groupId.length === 0) ||
    (!(typeof messageId === 'string') || messageId.length === 0)) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
      'arguments "userId", "groupId", "messageId".');
  }
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
      'while authenticated.');
  }

  return db.collection('to-do').doc(context.auth.uid)
    .collection('groups').doc(groupId).collection('messages').doc(messageId).delete();
});
