;( function ( window ) {
    'use strict';

    const QB_CREDENTIAL = {
        appId: 77062,
        appRoom: 'powerenglish',
        authKey: 'xEWCGEwrUeQC53-',
        authSecret: 'NqXaxgpJV3v6-MG',
    };

    const QB_VARIABLES = {
        debug: true,
        webrtc: {
            answerTimeInterval: 30,
            dialingTimeInterval: 5,
            disconnectTimeInterval: 35,
            statsReportTimeInterval: 5,
        }
    };

    const QB_MESSAGES = {
        login: 'Login as any user on this computer and another user on another computer.',
        create_session: 'Creating a session...',
        connect: 'Connecting...',
        connect_error: 'Something went wrong with the connection. Check internet connection or user info and try again.',
        login_as: 'Logged in as ',
        title_login: 'Choose a user to login with:',
        title_callee: 'Choose users to call:',
        calling: 'Calling...',
        webrtc_not_avaible: 'WebRTC is not available in your browser',
        no_internet: 'Please check your Internet connection and try again',
    };

    window.QB_CONFIG = {
        CREDENTIAL: QB_CREDENTIAL,
        VARIABLES: QB_VARIABLES,
        MESSAGES: QB_MESSAGES,
    };
} ( window ) );
