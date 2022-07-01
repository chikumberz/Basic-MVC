// firebase sample code snippets from https://firebase.google.com/docs/cloud-messaging/js/client
// [START initialize_firebase_in_sw]
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.14.6/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.14.6/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
	apiKey: 'AIzaSyDnHIyPt2wopjJZGSpuV5J63kba-_lN0gk',
	projectId: 'powerenglish-a0b6a',
	appId: '1:480518241630:web:bb8d5f05d8ed3de86ae3cf',
    messagingSenderId: '480518241630'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging( );
// [END initialize_firebase_in_sw]

messaging.setBackgroundMessageHandler( function ( payload ) {
    console.log( '[twilio-call-sw.js] Received background message', payload );

    const data = payload.data;

    Object.keys( data ).forEach( function ( key ) {
        try {
            data[key] = JSON.parse( data[key] );
        } catch ( e ) {};
    });

    serialize = function ( obj, prefix ) {
        var str = [], p;

        for ( p in obj ) {
            if ( obj.hasOwnProperty( p ) ) {
                var k = prefix ? prefix + '[' + p + ']' : p, v = obj[p];

                str.push(( v !== null && typeof v === 'object' ) ? serialize( v, k ) : encodeURIComponent( k ) + '=' + encodeURIComponent( v ));
            }
        }

        return str.join( '&' );
    }

    const query = serialize( data );

    // Customize notification here
    const notification_title   = 'Calling';
    const notification_options = {
        icon: '/powerenglish/theme/images/logo.png',
        body: data.twi_body,
        data: data,
        vibrate: [200, 100, 200, 100, 200, 100, 200],
    };

    clients.matchAll({
       type: 'window',
       includeUncontrolled: true
    }).then( clnts => {
        let client;

        for ( const clnt of clnts ) {
            const url = new URL( clnt.url );

            if ( url.pathname == '/powerenglish/tutor.html' ) {
                client = clnt;
                break;
            }
        }

        if ( client ) {
            addEventListener( 'notificationclick', event => {
                client.focus( );
                client.postMessage( data );
            });

            return self.registration.showNotification( notification_title, notification_options );
        }
    });
});
