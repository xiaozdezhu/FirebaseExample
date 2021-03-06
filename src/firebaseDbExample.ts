module main {
  let uid = ``;
  let idSuffix = (Math.random() + `xxxx`).substr(2);

  interface Command {
    type: "r" | "w";
    path: string;
    shouldSucceed: boolean;
    writeVal?: any;
  }
  let commands: Command[] = [];

  function db() { return firebase.database(); }

  function canRead(path: string) {
    commands.push({type: "r", path: path, shouldSucceed: true});
  }

  function cannotRead(path: string) {
    commands.push({type: "r", path: path, shouldSucceed: false});
  }

  function write(path: string, val: any) {
    commands.push({type: "w", path: path, shouldSucceed: true, writeVal: val});
  }

  function cannotWrite(path: string, val: any) {
    commands.push({type: "w", path: path, shouldSucceed: false, writeVal: val});
  }

  function prettyJson(obj: any): string {
    return JSON.stringify(obj, null, '  ')
  }
  function executeCommands() {
    if (commands.length == 0) {
      console.log(`Finished test successfully :)`);
      return;
    }
    let command = commands.shift();
    let path = command.path;
    let shouldSucceed = command.shouldSucceed;
    let writeVal = command.writeVal;
    if (command.type == "r") {
      db().ref(path).once('value', (snap) => {
        // successCallback
        if (!shouldSucceed) {
          console.error(`We managed to read path=`, path, ` but we should have failed!`);
        } else {
          console.log(`Reading path=`, path, ` returned `, snap.val());
          executeCommands();
        }
      }, (err: any) => {
        if (shouldSucceed) {
          console.error(`We failed to read path=`, path, ` but we should have succeeded!`);
        } else {
          console.log(`Reading path=`, path, ` failed as expected with err=`, err);
          executeCommands();
        }
      });
    } else {
      db().ref(path).set(writeVal, (err) => {
        let writeValJson = prettyJson(writeVal);
        // on complete
        if (!err) {
          if (!shouldSucceed) {
            console.error(`We managed to write path=`, path, ` writeVal=`, writeValJson, ` but we should have failed!`);
          } else {
            console.log(`Writing path=`, path, ` writeVal=`, writeValJson, ` succeeded.`);
            executeCommands();
          }
        } else {
          if (shouldSucceed) {
            console.error(`We failed to write path=`, path, ` writeVal=`, writeValJson, ` but we should have succeeded! err=`, err);
          } else {
            console.log(`Writing path=`, path, ` writeVal=`, writeValJson, ` failed as expected with err=`, err);
            executeCommands();
          }
        }
      });
    }
  }

  function addImage(id: string, width: number, height: number, isBoardImage: boolean) {
    write(`/gameBuilder/images/${id}${idSuffix}`, {
      name: `whatever`,
      width: width,
      height: height,
      sizeInBytes: 150000,
      isBoardImage: isBoardImage,
      downloadURL: `https://blabla.com`,
      cloudStoragePath: `images/-KuV-Y9TXnfnaZExRTli.gif`,
      uploaderEmail: `yoav@goo.bar`,
      uploaderUid: uid,
      createdOn: firebase.database.ServerValue.TIMESTAMP,
    });
  }


  function runGameBuilderTest() {
    canRead(`/gameBuilder/images`);
    canRead(`/gameBuilder/gameSpecs`);
    canRead(`/gameBuilder/images/boardImage${idSuffix}`);
    cannotWrite(`/gameBuilder/images/boardImage${idSuffix}`, 42);
    addImage(`boardImage`, 1024, 10, true);
    write(`/gameBuilder/images/boardImage${idSuffix}/downloadURL`, `https://blabla.com/sdfsdf`);
    cannotWrite(`/gameBuilder/images/boardImage${idSuffix}/downloadURL`, `http://blabla.com/sdfsdf`);
    cannotWrite(`/gameBuilder/images/boardImage${idSuffix}/width`, `1024`);
    cannotWrite(`/gameBuilder/images/boardImage${idSuffix}/width`, 1025);
    cannotWrite(`/gameBuilder/images/boardImage${idSuffix}/height`, 2);
    cannotWrite(`/gameBuilder/images/boardImage${idSuffix}/is_board_image`, 2);
    cannotWrite(`/gameBuilder/images/boardImage${idSuffix}/uploaderEmail`, `not_email@`);
    cannotWrite(`/gameBuilder/images/boardImage${idSuffix}/uploaderUid`, `not_email`);

    // Create a standard element
    addImage(`blokus_L_element`, 100, 100, false);
    write(`/gameBuilder/elements/standard${idSuffix}`, {
      uploaderEmail: `yoav@goo.bar`,
      uploaderUid: uid,
      createdOn: firebase.database.ServerValue.TIMESTAMP,
      width: 100,
      height: 100,
      images: [
        {imageId: `blokus_L_element${idSuffix}`},
      ],
      isDraggable: true,
      elementKind: 'standard',
      rotatableDegrees: 90,
      deckElements: [],
      isDrawable: true,
    });

    // Create a toggable element
    addImage(`reversiWhite`, 100, 100, false);
    addImage(`reversiBlack`, 100, 100, false);
    write(`/gameBuilder/elements/toggable${idSuffix}`, {
      uploaderEmail: `yoav@goo.bar`,
      uploaderUid: uid,
      createdOn: firebase.database.ServerValue.TIMESTAMP,
      width: 100,
      height: 100,
      images: [
        {imageId: `reversiWhite${idSuffix}`},
        {imageId: `reversiBlack${idSuffix}`},
      ],
      isDraggable: true,
      elementKind: 'toggable',
      rotatableDegrees: 360,
      deckElements: [],
      isDrawable: false,
    });

    // Create a dice element
    addImage(`diceSide1`, 100, 100, false);
    addImage(`diceSide2`, 100, 100, false);
    addImage(`diceSide3`, 100, 100, false);
    addImage(`diceSide4`, 100, 100, false);
    addImage(`diceSide5`, 100, 100, false);
    addImage(`diceSide6`, 100, 100, false);
    write(`/gameBuilder/elements/dice${idSuffix}`, {
      uploaderEmail: `yoav@goo.bar`,
      uploaderUid: uid,
      createdOn: firebase.database.ServerValue.TIMESTAMP,
      width: 100,
      height: 100,
      images: [
        {imageId: `diceSide1${idSuffix}`},
        {imageId: `diceSide2${idSuffix}`},
        {imageId: `diceSide3${idSuffix}`},
        {imageId: `diceSide4${idSuffix}`},
        {imageId: `diceSide5${idSuffix}`},
        {imageId: `diceSide6${idSuffix}`},
      ],
      isDraggable: true,
      elementKind: 'dice',
      rotatableDegrees: 360,
      deckElements: [],
      isDrawable: false,
    });

    // Create two card elements
    addImage(`publicFace`, 100, 100, false);
    addImage(`privateFace1`, 100, 100, false);
    addImage(`privateFace2`, 100, 100, false);
    write(`/gameBuilder/elements/card1${idSuffix}`, {
      uploaderEmail: `yoav@goo.bar`,
      uploaderUid: uid,
      createdOn: firebase.database.ServerValue.TIMESTAMP,
      width: 100,
      height: 100,
      images: [
        {imageId: `publicFace${idSuffix}`},
        {imageId: `privateFace1${idSuffix}`},
      ],
      isDraggable: true,
      elementKind: 'card',
      rotatableDegrees: 360,
      deckElements: [],
      isDrawable: true,
    });
    write(`/gameBuilder/elements/card2${idSuffix}`, {
      uploaderEmail: `yoav@goo.bar`,
      uploaderUid: uid,
      createdOn: firebase.database.ServerValue.TIMESTAMP,
      width: 100,
      height: 100,
      images: [
        {imageId: `publicFace${idSuffix}`},
        {imageId: `privateFace2${idSuffix}`},
      ],
      isDraggable: true,
      elementKind: 'card',
      rotatableDegrees: 360,
      deckElements: [],
      isDrawable: true,
    });

    // Create two deck elements (cardsDeck|piecesDeck)
    addImage(`deckArea`, 200, 200, false);
    write(`/gameBuilder/elements/cardsDeck${idSuffix}`, {
      uploaderEmail: `yoav@goo.bar`,
      uploaderUid: uid,
      createdOn: firebase.database.ServerValue.TIMESTAMP,
      width: 200,
      height: 200,
      images: [
        {imageId: `deckArea${idSuffix}`},
      ],
      isDraggable: false,
      elementKind: 'cardsDeck',
      rotatableDegrees: 360,
      deckElements: [
        { deckMemberElementId: `card1${idSuffix}` },
        { deckMemberElementId: `card2${idSuffix}` },
      ],
      isDrawable: false,
    });
    write(`/gameBuilder/elements/piecesDeck${idSuffix}`, {
      uploaderEmail: `yoav@goo.bar`,
      uploaderUid: uid,
      createdOn: firebase.database.ServerValue.TIMESTAMP,
      width: 200,
      height: 200,
      images: [
        {imageId: `deckArea${idSuffix}`},
      ],
      isDraggable: false,
      elementKind: 'piecesDeck',
      rotatableDegrees: 360,
      deckElements: [
        { deckMemberElementId: `card1${idSuffix}` },
        { deckMemberElementId: `card2${idSuffix}` },
      ],
      isDrawable: false,
    });

    addImage(`gameIcon50x50`, 50, 50, false);
    addImage(`gameIcon512x512`, 512, 512, false);
    write(`/gameBuilder/gameSpecs/gameSpec${idSuffix}`, {
      uploaderEmail: `yoav@goo.bar`,
      uploaderUid: uid,
      createdOn: firebase.database.ServerValue.TIMESTAMP,
      gameName: `Chess!`,
      gameIcon50x50: `gameIcon50x50${idSuffix}`,
      gameIcon512x512: `gameIcon512x512${idSuffix}`,
      wikipediaUrl: `https://en.wikipedia.org/wiki/Chess`,
      tutorialYoutubeVideo: ``,
      board: {
        imageId: `boardImage${idSuffix}`,
        backgroundColor: `FFFFFF`,
        maxScale: 1,
      },
      pieces: [
        {
          pieceElementId: `piecesDeck${idSuffix}`,
          initialState: {
            x: -99.9,
            y: 99.9,
            zDepth: 10000000000000000,
            currentImageIndex: 0
          },
          deckPieceIndex: -1,
        },
        {
          pieceElementId: `card1${idSuffix}`,
          initialState: {
            x: -99.9,
            y: 99.9,
            zDepth: 10000000000000000,
            currentImageIndex: 0
          },
          deckPieceIndex: 0,
        },
        {
          pieceElementId: `card2${idSuffix}`,
          initialState: {
            x: -99.9,
            y: 99.9,
            zDepth: 10000000000000000,
            currentImageIndex: 0
          },
          deckPieceIndex: 0,
        },
        {
          pieceElementId: `cardsDeck${idSuffix}`,
          initialState: {
            x: -99.9,
            y: 99.9,
            zDepth: 10000000000000000,
            currentImageIndex: 0
          },
          deckPieceIndex: -1,
        },
        {
          pieceElementId: `card1${idSuffix}`,
          initialState: {
            x: -99.9,
            y: 99.9,
            zDepth: 10000000000000000,
            currentImageIndex: 0
          },
          deckPieceIndex: 3,
        },
        {
          pieceElementId: `card2${idSuffix}`,
          initialState: {
            x: -99.9,
            y: 99.9,
            zDepth: 10000000000000000,
            currentImageIndex: 0
          },
          deckPieceIndex: 3,
        },
        {
          pieceElementId: `standard${idSuffix}`,
          initialState: {
            x: -99.9,
            y: 99.9,
            zDepth: 10000000000000000,
            currentImageIndex: 0
          },
          deckPieceIndex: -1,
        },
        {
          pieceElementId: `standard${idSuffix}`,
          initialState: {
            x: 5.9,
            y: 19.9,
            zDepth: 1,
            currentImageIndex: 0
          },
          deckPieceIndex: -1,
        },
        {
          pieceElementId: `toggable${idSuffix}`,
          initialState: {
            x: 5.9,
            y: 19.9,
            zDepth: 1,
            currentImageIndex: 1
          },
          deckPieceIndex: -1,
        },
        {
          pieceElementId: `dice${idSuffix}`,
          initialState: {
            x: 5.9,
            y: 19.9,
            zDepth: 1,
            currentImageIndex: 5
          },
          deckPieceIndex: -1,
        },
      ],
    });
  }

  function runGamePortalTest() {

    write(`/gamePortal/recentlyConnected/${idSuffix}`, {
      userId: uid,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    });
    cannotWrite(`/gamePortal/recentlyConnected/${idSuffix}`, null);
    
    cannotWrite(`/users/${uid}/privateButAddable/groups/groupId${idSuffix}`, {
      addedByUid: uid,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    });
    cannotWrite(`/users/${uid}/privateButAddable/groups/groupId${idSuffix}`, {
      addedByUid: uid,
    });
    cannotWrite(`/users/${uid}/privateButAddable/groups/groupId${idSuffix}`, {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    });
    write(`/gamePortal/groups/groupId${idSuffix}`, {
      participants: {
        [uid]: {participantIndex: 0},
        // TODO: add other users ids.
      },
      groupName: ``,
      createdOn: firebase.database.ServerValue.TIMESTAMP,
      // Not needed (and doesn't help anyway because firebase trims empty objects recursively):
      // messages: {},
    });
    cannotWrite(`/users/${uid}/privateButAddable/groups/groupId${idSuffix}`, {
      addedByUid: uid,
    });
    cannotWrite(`/users/${uid}/privateButAddable/groups/groupId${idSuffix}`, {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    });
    write(`/users/${uid}/privateButAddable/groups/groupId${idSuffix}`, {
      addedByUid: uid,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    });

    write(`/gamePortal/groups/groupId${idSuffix}/messages/messageId${idSuffix}`, {
      senderUid: uid,
      message: `message`,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    });
    
    write(`/gamePortal/groups/groupId${idSuffix}/matches/matchId${idSuffix}`, {
      gameSpecId: `gameSpec${idSuffix}`,
      createdOn: firebase.database.ServerValue.TIMESTAMP,
      lastUpdatedOn: firebase.database.ServerValue.TIMESTAMP,
      pieces: [
        {
          currentState: 
            {
              x: -99.9,
              y: 99.9,
              zDepth: 10000000000000000,
              currentImageIndex: 0
            },
        },
        {
          currentState: 
            {
              x: -99.9,
              y: 99.9,
              zDepth: 10000000000000000,
              currentImageIndex: 1
            },
        },
        // etc
      ]
    });
    // Updating a specific piece
    write(`/gamePortal/groups/groupId${idSuffix}/matches/matchId${idSuffix}/lastUpdatedOn`, firebase.database.ServerValue.TIMESTAMP);
    write(`/gamePortal/groups/groupId${idSuffix}/matches/matchId${idSuffix}/pieces/1/currentState`, 
    {
        x: 9.9,
        y: 42.9,
        zDepth: 23,
        currentImageIndex: 0
    });
    
    // Adding a review
    write(`/gamePortal/gameSpec/reviews/gameSpec${idSuffix}/${uid}`,
    {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      stars: 5,
    });
      
  }

  function runUserTest() {
    uid = firebase.auth().currentUser.uid;
    console.info("My uid=", uid);

    // Reading another user's data.
    canRead(`/users/userId${idSuffix}/publicFields`);
    cannotRead(`/users/userId${idSuffix}/privateFields`);
    cannotRead(`/users/userId${idSuffix}/privateButAddable`);
    cannotRead(`/users/userId${idSuffix}`);
    cannotWrite(`/users/userId${idSuffix}/publicFields/isConnected`, true);

    // Adding my user data.
    write(`/users/${uid}`, {
      publicFields: {
        avatarImageUrl: `https://foo.bar/avatar`,
        displayName: `Yoav Ziii`,
        isConnected: true,
        lastSeen: firebase.database.ServerValue.TIMESTAMP,
      },
      privateFields: {
        email: `yoav.zibin@yooo.goo`,
        createdOn: firebase.database.ServerValue.TIMESTAMP,
        phoneNumber: ``,
        facebookId: ``,
        googleId: ``,
        twitterId: ``,
        githubId: ``,
        //friends: {}, // Not needed: you can add it later.
      },
    });
    write(`/users/${uid}/publicFields/displayName`, `New name!`);

    runGameBuilderTest();
    runGamePortalTest();

    executeCommands();
  }

  function init() {
    let config = {
      apiKey: `AIzaSyA_UNWBNj7zXrrwMYq49aUaSQqygDg66SI`,
      authDomain: `testproject-a6dce.firebaseapp.com`,
      databaseURL: `https://testproject-a6dce.firebaseio.com`,
      projectId: `testproject-a6dce`,
      storageBucket: ``,
      messagingSenderId: `957323548528`
    };
    firebase.initializeApp(config);
    
    console.log(`firebase.auth().currentUser=`, firebase.auth().currentUser);
    firebase.auth().onAuthStateChanged(function (user: any) {
      console.log(`onAuthStateChanged user=`, user);
      if (user) {
        runUserTest();
        return;
      }
      // No auth user.
      cannotRead(`/gameBuilder/images/${idSuffix}`); // We must authenticate first.
    });
  }

  function login() {
    let provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider)
      .then(function(result) {
        console.info(result);
        // This gives you a Google Access Token. You can use it to access the Google API.
        //let token = result.credential.accessToken;
        // The signed-in user info.
        //let user = result.user;
        runUserTest();
      })
      .catch(function(error) {
        console.error(`Failed auth: `, error);
      });
  }
  document.getElementById('login').onclick = login;

  init();
}