;( function ( window, QB, QB_CONFIG, QB_APP, $, Backbone ) {
    'use strict';

    $( function( ) {
        var sounds = {
            'call': document.getElementById( 'callingSignal' ),
            'end': document.getElementById( 'endCallSignal' ),
            'ringtone': document.getElementById( 'ringtoneSignal' ),
        };

        var recorder = null;
        var recorderTimeoutID = null;
        var recorderOpts = {
            onstart: function onStartRecord ( ) {
                $( '.j-record' ).addClass( 'active' );

                recorderTimeoutID = setTimeout( function ( ) {
                    if ( recorder ) {
                        recorder.stop( );
                    }
                }, 600000 ); // 10min
            },
            onstop: function ( blob ) {
                $( '.j-record' ).removeClass( 'active' );

                var down = confirm( 'Do you want to download video?' );

                if ( down ) {
                    recorder.download( 'QB_WEBrtc_sample' + Date.now( ), blob );
                }

                recorder = null;
                clearTimeout( recorderTimeoutID );
            },
            onerror: function ( error ) {
                console.error( 'Recorder error', error );
            }
        };

        var isAudio = false;

        var ui = {
            'income_call': '#income_call',
            'filterSelect': '.j-filter',
            'videoSourceFilter': '.j-video_source',
            'audioSourceFilter': '.j-audio_source',
            'bandwidthSelect': '.j-bandwidth',
            'insertOccupants': function ( ) {
                var $occupantsCont = $( '.j-users' );

                function cb ( $cont, res ) {
                    $cont.empty( ).append( res ).removeClass( 'wait' );
                }

                return new Promise( function ( resolve, reject ) {
                    $occupantsCont.addClass( 'wait' );

                    QB_APP.helpers.renderUsers( ).then( function( res ) {
                        cb( $occupantsCont, res.usersHTML );
                        resolve( res.users );
                    }, function( error ) {
                        cb( $occupantsCont, error.message );
                        reject( 'Not found users by tag' );
                    });
                });
            }
        };

        var call = {
            callTime: 0,
            callTimer: null,
            updTimer: function ( ) {
                this.callTime += 1000;

                $( '#timer' ).removeClass( 'invisible' ).text( new Date( this.callTime ).toUTCString( ).split( / / )[4] );
            }
        };

        var remoteStreamCounter = 0;

        var Router = Backbone.Router.extend({
            'routes': {
                'join': 'join',
                'dashboard': 'dashboard',
                '*query': 'relocated'
            },
            'container': $( '.page' ),
            'relocated': function ( ) {
                var path = QB_APP.caller ? 'dashboard' : 'join';

                QB_APP.router.navigate( path, { 'trigger': true } );
            },
            'join': function ( ) {

            },
            'dashboard': function ( ) {
                if ( _.isEmpty( QB_APP.caller ) ) {
                    QB_APP.router.navigate( 'join', { 'trigger': true } );
                    return false;
                }

                /** render page */
                this.container.removeClass( 'page-join' ).addClass( 'page-dashboard' ).find( '.j-dashboard' ).empty( );

                /** render skelet */
                $( '.j-dashboard' ).append( $( '#dashboard_tpl' ).html( ) );

                /** render stateBoard */
                QB_APP.helpers.stateBoard = new QB_APP.helpers.StateBoard( '.j-state_board', {
                    title: 'tpl_default',
                    property: {
                        'tag': QB_APP.caller.user_tags,
                        'name':  QB_APP.caller.full_name,
                    }
                });

                /** render users wrapper */
                /*$( '.j-users_wrap' ).append( $( '#users_tpl' ).html( ) );
                ui.insertOccupants( ).then( function( users ) {
                    QB_APP.users = users;
                }, function ( err ) {
                    console.warn( err );
                });*/

                /** render frames */
                var framesTpl = _.template( $( '#frames_tpl' ).html( ) );
                $( '.j-board' ).append( framesTpl({ 'nameUser': QB_APP.caller.full_name }) );

                // Hide a record button if browser not supported it
                if ( !QBMediaRecorder.isAvailable( ) ) {
                    $( '.j-record' ).hide( );
                }

                fillMediaSelects( );
            }
        });

        // INITIALIZE QUICKBLOX
        QB.init(
            QB_CONFIG.CREDENTIAL.appId,
            QB_CONFIG.CREDENTIAL.authKey,
            QB_CONFIG.CREDENTIAL.authSecret,
            QB_CONFIG.VARIABLES
        );

        // Check internet connection
        if ( !window.navigator.onLine ) {
            alert( 'ERROR: ' + QB_CONFIG.MESSAGES.no_internet ); return false;
        }

        // Before use WebRTC checking WebRTC is avaible
        if ( !QB.webrtc ) {
            alert( 'ERROR: ' + QB_CONFIG.MESSAGES.webrtc_not_avaible ); return false;
        }

        var statesPeerConn = _.invert( QB.webrtc.PeerConnectionState );

        QB_APP.caller          = {};
        QB_APP.callees         = {};
        QB_APP.calleesAnwered  = [];
        QB_APP.calleesRejected = [];
        QB_APP.users           = [];
        QB_APP.router          = new Router( );

        Backbone.history.start( );

        // TODO: Auto login
        var data = {
            room: QB_CONFIG.CREDENTIAL.appRoom,
            login: 'teacher0@gmail.com',
            password: '123456789',
            name: 'Teacher Test',
        };

        localStorage.setItem( 'data', JSON.stringify( data ) );

        QB_APP.helpers.login( data ).then( function ( user ) {
            QB_APP.caller = user;

            QB.chat.connect({
                jid: QB.chat.helpers.getUserJid( QB_APP.caller.id, QB_CONFIG.CREDENTIAL.appId ),
                password: data.password,
            }, function( err, res ) {
                if ( err ) {
                    if ( !_.isEmpty( QB_APP.currentSession ) ) {
                        QB_APP.currentSession.stop({ });
                        QB_APP.currentSession = {};
                    }

                    QB_APP.helpers.changeFilter( '#localVideo', 'no' );
                    QB_APP.helpers.changeFilter( '#main_video', 'no' );
                    QB_APP.mainVideo = 0;

                    $( ui.filterSelect ).val( 'no' );

                    QB_APP.calleesAnwered = [];
                    QB_APP.calleesRejected = [];

                    if ( call.callTimer ) {
                        $( '#timer' ).addClass( 'invisible' );
                        clearInterval( call.callTimer );
                        call.callTimer = null;
                        call.callTime = 0;
                        QB_APP.helpers.network = {};
                    }
                } else {
                    localStorage.setItem( 'isAuth', true );
                    QB_APP.router.navigate( 'dashboard', { trigger: true });
                }
            });
        }).catch( function ( error ) {
            console.error( error );
        });
        // END Auto Login

        /**
         * JOIN
         */
        /*$(document).on('submit','.j-join', function() {
            var $form = $(this),
                data = {
                    username: 'teacher',
                    room: 'powerenglish',
                };

            localStorage.setItem('data', JSON.stringify(data));

            // Check internet connection
            if ( !window.navigator.onLine ) {
                alert(QB_CONFIG.MESSAGES['no_internet']);
                return false;
            }

            if(localStorage.getItem('isAuth')) {
                $('#already_auth').modal();
                return false;
            }

            $form.addClass('join-wait');

            QB_APP.helpers.join(data).then(function(user) {
                QB_APP.caller = user;

                QB.chat.connect({
                    jid: QB.chat.helpers.getUserJid( QB_APP.caller.id, QB_CONFIG.CREDENTIAL.appId ),
                    // 'password': 'webAppPass'
                    // TODO: Change for specific user
                    password: '123456789',
                }, function(err, res) {
                    if(err) {
                        if(!_.isEmpty(QB_APP.currentSession)) {
                            QB_APP.currentSession.stop({});
                            QB_APP.currentSession = {};
                        }

                        QB_APP.helpers.changeFilter('#localVideo', 'no');
                        QB_APP.helpers.changeFilter('#main_video', 'no');
                        QB_APP.mainVideo = 0;

                        $(ui.filterSelect).val('no');
                        QB_APP.calleesAnwered = [];
                        QB_APP.calleesRejected = [];
                        if(call.callTimer) {
                            $('#timer').addClass('invisible');
                            clearInterval(call.callTimer);
                            call.callTimer = null;
                            call.callTime = 0;
                            QB_APP.helpers.network = {};
                        }
                    } else {
                        $form.removeClass('join-wait');
                        $form.trigger('reset');
                        localStorage.setItem('isAuth', true);
                        QB_APP.router.navigate('dashboard', { trigger: true });
                    }
                });
            }).catch(function(error) {
                console.error(error);
            });

            return false;
        });*/

        /**
         * DASHBOARD
         */
        /** REFRESH USERS */
        /*$(document).on('click', '.j-users__refresh', function() {
            var $btn = $(this);

            QB_APP.callees = {};
            $btn.prop('disabled', true);

            ui.insertOccupants().then(function(users) {
                QB_APP.users = users;

                $btn.prop('disabled', false);
            }, function() {
                $btn.prop('disabled', false);
            });
        });*/

        /** Check / uncheck user (callee) */
        $(document).on('click', '.j-user', function() {
            var $user = $(this),
                user = {
                    id: +$.trim( $user.data('id') ),
                    name: $.trim( $user.data('name') )
                };

            if( $user.hasClass('active') ) {
                delete QB_APP.callees[user.id];
                $user.removeClass('active');
            } else {
                QB_APP.callees[user.id] = user.name;
                $user.addClass('active');
            }
        });

        /** Call / End of call */
        $( document ).on( 'click', '.j-actions', function ( ) {
            var $btn               = $( this ),
                $videoSourceFilter = $( ui.videoSourceFilter),
                $audioSourceFilter = $( ui.audioSourceFilter),
                $bandwidthSelect   = $( ui.bandwidthSelect),
                bandwidth          = $.trim( $( ui.bandwidthSelect ).val( ) ),
                videoElems         = '',
                mediaParams        = {
                    'audio': {
                        deviceId: $audioSourceFilter.val( ) ? $audioSourceFilter.val( ) : undefined
                    },
                    'video': {
                        deviceId: $videoSourceFilter.val( ) ? $videoSourceFilter.val( ) : undefined
                    },
                    'options': {
                        'muted': true,
                        'mirror': true
                    },
                    'elemId': 'localVideo'
                };

            /** Hangup */
            if ( $btn.hasClass( 'hangup' ) ) {
                if ( !_.isEmpty( QB_APP.currentSession ) ) {
                    if ( recorder && recorderTimeoutID ) {
                        recorder.stop( );
                    }

                    QB_APP.currentSession.stop({ });
                    QB_APP.currentSession = {};
                    QB_APP.helpers.stateBoard.update({
                        'title': 'tpl_default',
                        'property': {
                            'tag': QB_APP.caller.user_tags,
                            'name':  QB_APP.caller.full_name,
                        }
                    });

                    return false;
                }
            } else {
                /** Check internet connection */
                if ( !window.navigator.onLine ) {
                    QB_APP.helpers.stateBoard.update({
                        'title': 'no_internet',
                        'isError': 'qb-error'
                    });
                    return false;
                }

                /** Check callee */
                if ( _.isEmpty( QB_APP.callees ) ) {
                    $( '#error_no_calles' ).modal( );
                    return false;
                }

                QB_APP.helpers.stateBoard.update({ 'title': 'create_session' });

                isAudio = $btn.data( 'call' ) === 'audio';

                QB_APP.currentSession = QB.webrtc.createNewSession( Object.keys( QB_APP.callees ), isAudio ? QB.webrtc.CallType.AUDIO : QB.webrtc.CallType.VIDEO, null, {'bandwidth': bandwidth});

                if ( isAudio ) {
                    mediaParams = {
                        audio: true,
                        video: false
                    };
                    document.querySelector( '.j-actions[data-call="video"]' ).setAttribute( 'hidden', true );
                    document.querySelector( '.j-caller__ctrl' ).setAttribute( 'hidden', true );
                } else {
                    document.querySelector( '.j-actions[data-call="audio"]' ).setAttribute( 'hidden', true );
                }

                QB_APP.currentSession.getUserMedia( mediaParams, function ( err, stream ) {
                    if ( err || !stream.getAudioTracks( ).length || ( isAudio ? false : !stream.getVideoTracks( ).length ) ) {
                        var errorMsg = '';

                        QB_APP.currentSession.stop({ });

                        QB_APP.helpers.stateBoard.update({
                            'title': 'tpl_device_not_found',
                            'isError': 'qb-error',
                            'property': {
                                'name': QB_APP.caller.full_name
                            }
                        });
                    } else {
                        var callParameters = {};

                        if ( isAudio ) {
                            callParameters.callType = 2;
                        }

                        // Call to users
                        var pushRecipients = [];
                        QB_APP.currentSession.call({ 'plan_id': 1, 'schedule_id': 2, 'teacher_id': 10 }, function ( ) {
                            if ( !window.navigator.onLine ) {
                                QB_APP.currentSession.stop({ });
                                QB_APP.helpers.stateBoard.update({
                                    'title': 'connect_error',
                                    'isError': 'qb-error'
                                });
                            } else {
                                var compiled = _.template( $( '#callee_video' ).html( ) );

                                QB_APP.helpers.stateBoard.update({ 'title': 'calling' });

                                sounds.call.play( );

                                Object.keys( QB_APP.callees ).forEach( function ( id, i, arr) {
                                    videoElems += compiled({
                                        'userID': id,
                                        'name': QB_APP.callees[id],
                                        'state': 'connecting'
                                    });
                                    pushRecipients.push( id );
                                });

                                $( '.j-callees' ).append( videoElems );

                                $bandwidthSelect.attr( 'disabled', true );
                                $btn.addClass( 'hangup' );
                            }
                        });

                        // and also send push notification about incoming call
                        // (corrently only iOS/Android users will receive it)
                        var params = {
                            notification_type: 'push',
                            user: { ids: pushRecipients },
                            environment: 'development', // environment, can be 'production' as well.
                            message: QB.pushnotifications.base64Encode( QB_APP.caller.full_name + ' is calling you' )
                        };

                        QB.pushnotifications.events.create( params, function ( err, response ) {
                            if ( err ) {
                                console.log(err);
                            } else {
                                // success
                                console.log("Push Notification is sent.");
                            }
                        });
                    }
                });
            }
        });

        /** DECLINE */
        $( document ).on( 'click', '.j-decline', function ( ) {
            if ( !_.isEmpty( QB_APP.currentSession ) ) {
                QB_APP.currentSession.reject({ });

                $( ui.income_call ).modal( 'hide' );
                sounds.ringtone.pause( );
            }
        });

        /** ACCEPT */
        $( document ).on( 'click', '.j-accept', function ( ) {
            isAudio = QB_APP.currentSession.callType === QB.webrtc.CallType.AUDIO;

            var $videoSourceFilter = $( ui.videoSourceFilter ),
                $audioSourceFilter = $( ui.audioSourceFilter ),
                mediaParams;

            if ( isAudio ) {
                mediaParams = {
                    audio: true,
                    video: false
                };
                document.querySelector( '.j-actions[data-call="video"]' ).setAttribute( 'hidden', true );
                document.querySelector( '.j-caller__ctrl' ).setAttribute( 'hidden', true );
            } else {
                mediaParams = {
                    audio: {
                        deviceId: $audioSourceFilter.val() ? $audioSourceFilter.val() : undefined
                    },
                    video: {
                        deviceId: $videoSourceFilter.val() ? $videoSourceFilter.val() : undefined
                    },
                    elemId: 'localVideo',
                    options: {
                        muted: true,
                        mirror: true
                    }
                };

                document.querySelector('.j-actions[data-call="audio"]').setAttribute('hidden', true);
            }

            var videoElems = '';

            $( ui.income_call ).modal( 'hide' );
            sounds.ringtone.pause( );

            QB_APP.currentSession.getUserMedia( mediaParams, function ( err, stream ) {
                if ( err || !stream.getAudioTracks( ).length || ( isAudio ? false : !stream.getVideoTracks( ).length ) ) {
                    var errorMsg = '';

                    QB_APP.currentSession.stop({ });

                    QB_APP.helpers.stateBoard.update({
                        'title': 'tpl_device_not_found',
                        'isError': 'qb-error',
                        'property': {
                            'name': QB_APP.caller.full_name
                        }
                    });
                } else {
                    var opponents = [QB_APP.currentSession.initiatorID],
                        compiled = _.template( $('#callee_video').html() );

                    $( '.j-actions' ).addClass( 'hangup' );
                    $( ui.bandwidthSelect ).attr( 'disabled', true );

                    /** get all opponents */
                    QB_APP.currentSession.opponentsIDs.forEach( function ( userID, i, arr ) {
                        if ( userID != QB_APP.currentSession.currentUserID ) {
                            opponents.push( userID );
                        }
                    });

                    opponents.forEach( function ( userID, i, arr ) {
                        var peerState = QB_APP.currentSession.connectionStateForUser( userID ),
                            userInfo = _.findWhere( QB_APP.users, { 'id': +userID } );

                        if ( ( document.getElementById( 'remote_video_' + userID ) === null ) ) {
                            videoElems += compiled({
                                'userID': userID,
                                'name': userInfo ? userInfo.full_name : 'userID ' + userID,
                                'state': QB_APP.helpers.getConStateName( peerState )
                            });

                            if ( peerState === QB.webrtc.PeerConnectionState.CLOSED ) {
                                QB_APP.helpers.toggleRemoteVideoView( userID, 'clear' );
                            }
                        }
                    });

                    $( '.j-callees' ).append( videoElems );

                    QB_APP.helpers.stateBoard.update({
                        'title': 'tpl_during_call',
                        'property': {
                            'name': QB_APP.caller.full_name
                        }
                    });
                    QB_APP.currentSession.accept({ });
                }
            });
        });

        /** CHANGE FILTER */
        $( document ).on( 'change', ui.filterSelect, function ( ) {
            var filterName = $.trim( $( this ).val( ) );

            QB_APP.helpers.changeFilter( '#localVideo', filterName );

            if ( !_.isEmpty( QB_APP.currentSession ) ) {
                QB_APP.currentSession.update({ 'filter': filterName });
            }
        });

        /** CHANGE SOURCE */
        $( document ).on( 'click', '.j-confirm_media', function ( ) {
            switchMediaTracks( );
        });

        $( document ).on( 'click', '.j-callees__callee__video', function ( ) {
            var $that = $( this ),
                userId = +( $( this ).data( 'user' ) ),
                activeClass = [];

            if ( QB_APP.currentSession.peerConnections[userId].stream && !$that.srcObject ) {
                if ( $that.hasClass( 'active' ) ) {
                    $that.removeClass( 'active' );

                    QB_APP.currentSession.detachMediaStream( 'main_video' );
                    QB_APP.helpers.changeFilter( '#main_video', 'no' );
                    QB_APP.mainVideo = 0;
                    remoteStreamCounter = 0;
                } else {
                    $( '.j-callees__callee_video' ).removeClass( 'active' );
                    $that.addClass( 'active' );

                    QB_APP.helpers.changeFilter( '#main_video', 'no' );

                    activeClass = _.intersection( $that.attr( 'class' ).split( /\s+/ ), QB_APP.filter.names.split( /\s+/ ) );

                    /** set filter to main video if exist */
                    if ( activeClass.length ) {
                        QB_APP.helpers.changeFilter( '#main_video', activeClass[0]);
                    }

                    QB_APP.currentSession.attachMediaStream( 'main_video', QB_APP.currentSession.peerConnections[userId].stream );
                    QB_APP.mainVideo = userId;
                }
            }
        });

        $( document ).on( 'click', '.j-caller__ctrl', function ( ) {
           var $btn = $( this ),
               isActive = $btn.hasClass( 'active' );

           if ( _.isEmpty( QB_APP.currentSession ) ) {
               return false;
           } else {
               if ( isActive ) {
                   $btn.removeClass( 'active' );
                   QB_APP.currentSession.unmute( $btn.data( 'target' ) );
               } else {
                   $btn.addClass( 'active' );
                   QB_APP.currentSession.mute( $btn.data( 'target' ) );
               }
           }
        });

        /** Video recording */
        $( document ).on( 'click', '.j-record', function ( ) {
            var $btn = $( this ),
                isActive = $btn.hasClass( 'active' );

            if ( _.isEmpty( QB_APP.currentSession ) ) {
                return false;
            } else if ( QBMediaRecorder.isAvailable( ) ) {
                if ( !isActive ) {
                    var connections = QB_APP.currentSession.peerConnections,
                        connection = connections[QB_APP.mainVideo],
                        connectionsCount = Object.keys( connections ).length;

                    if ( !connection || connectionsCount !== 1 ) {
                        return false;
                    }

                    recorder = new QBMediaRecorder( recorderOpts );
                    recorder.start( connection.stream );
                } else {
                    recorder.stop( );
                }
            }
        });

        /** LOGOUT */
        $( document ).on( 'click', '.j-logout', function ( ) {
            /*QB.users.delete(QB_APP.caller.id, function(err, user){
                if (!user) {
                    console.error('Can\'t delete user by id: '+QB_APP.caller.id+' ', err);
                }

                QB_APP.caller = {};
                QB_APP.users = [];

                QB.chat.disconnect();
                localStorage.removeItem('isAuth');
                localStorage.removeItem('data');
                QB_APP.router.navigate('join', {'trigger': true});
            });*/

            QB_APP.caller = {};
            QB_APP.users = [];

            QB.chat.disconnect( );
            localStorage.removeItem( 'isAuth' );
            localStorage.removeItem( 'data' );
            QB_APP.router.navigate( 'join', { 'trigger': true });
        });

        /** Close tab or browser */
        $( window ).on( 'beforeunload', function ( ) {
            localStorage.removeItem( 'isAuth' );
        });

        /**
         * QB Event listener.
         *
         * [Recommendation]
         * We recomend use Function Declaration
         * that SDK could identify what function(listener) has error
         *
         * Chat:
         * - onDisconnectedListener
         * WebRTC:
         * - onCallListener
         * - onCallStatsReport
         * - onUpdateCallListener
         *
         * - onAcceptCallListener
         * - onRejectCallListener
         * - onUserNotAnswerListener
         *
         * - onRemoteStreamListener
         *
         * - onStopCallListener
         * - onSessionCloseListener
         * - onSessionConnectionStateChangedListener
         *
         * - onDevicesChangeListener
         */

        QB.chat.onDisconnectedListener = function ( ) {
            console.log( 'onDisconnectedListener.' );
        };

        QB.webrtc.onCallStatsReport = function onCallStatsReport ( session, userId, stats, error ) {
            console.group( 'onCallStatsReport' );
                console.log( 'userId: ', userId );
                console.log( 'session: ', session );
                console.log( 'stats: ', stats );
            console.groupEnd( );

            if ( stats.remote.video.bitrate ) {
                $( '#bitrate_' + userId ).text( 'video bitrate: ' + stats.remote.video.bitrate );
            } else if (stats.remote.audio.bitrate) {
                $( '#bitrate_' + userId ).text( 'audio bitrate: ' + stats.remote.audio.bitrate );
            }
        };

        QB.webrtc.onSessionCloseListener = function onSessionCloseListener ( session ) {
            console.log( 'onSessionCloseListener: ', session );

            sounds.call.pause( );
            sounds.end.play( );

            $( '.j-actions' ).removeClass( 'hangup' );
            $( '.j-caller__ctrl' ).removeClass( 'active' );
            $( ui.bandwidthSelect ).attr( 'disabled', false );

            $( '.j-callees' ).empty( );
            $( '.frames_callee__bitrate' ).hide( );

            QB_APP.currentSession.detachMediaStream( 'main_video' );
            QB_APP.currentSession.detachMediaStream( 'localVideo' );

            remoteStreamCounter = 0;

            if ( session.opponentsIDs.length > 1 ) {
                QB_APP.helpers.stateBoard.update({
                    'title': 'tpl_call_stop',
                    'property': {
                        'name': QB_APP.caller.full_name
                    }
                });
            } else {
                QB_APP.helpers.stateBoard.update({
                    title: 'tpl_default',
                    property: {
                        'tag': QB_APP.caller.user_tags,
                        'name':  QB_APP.caller.full_name,
                    }
                });
            }

            if ( document.querySelector( '.j-actions[hidden]' ) ) {
                document.querySelector( '.j-actions[hidden]' ).removeAttribute( 'hidden' );
            }

            if ( document.querySelector( '.j-caller__ctrl' ) ) {
                document.querySelector( '.j-caller__ctrl' ).removeAttribute( 'hidden' );
            }
        };

        QB.webrtc.onUserNotAnswerListener = function onUserNotAnswerListener ( session, userId ) {
            console.group( 'onUserNotAnswerListener.' );
                console.log( 'UserId: ', userId );
                console.log( 'Session: ', session );
            console.groupEnd( );

            var opponent = _.findWhere( QB_APP.users, { 'id': + userId } );

            /** It's for p2p call */
            if ( session.opponentsIDs.length === 1 ) {
                QB_APP.helpers.stateBoard.update({
                    'title': 'p2p_call_stop',
                    'property': {
                        'name': opponent.full_name,
                        'currentName': QB_APP.caller.full_name,
                        'reason': 'not answered'
                    }
                });
            } else {
                $( '.j-callee_status_' + userId ).text( 'No Answer' );
            }
        };

        QB.webrtc.onCallListener = function onCallListener ( session, extension ) {
            console.group( 'onCallListener.' );
                console.log( 'Session: ', session );
                console.log( 'Extension: ', extension );
            console.groupEnd( );

            QB_APP.currentSession = session;

            QB_APP.helpers.getUser( session.initiatorID ).then( function ( result ) {
                QB_APP.users.push( result );

                $( ui.income_call ).modal( 'hide' );

                $( '.j-ic_initiator' ).text( result.full_name );

                // Check the current session state
                if ( QB_APP.currentSession.state !== QB.webrtc.SessionConnectionState.CLOSED ) {
                    $( ui.income_call ).modal( 'show' );
                    sounds.ringtone.play( );
                }
            });

            /*ui.insertOccupants( ).then( function ( users ) {
                QB_APP.users = users;
                var initiator = _.findWhere( QB_APP.users, { id: session.initiatorID } );
                QB_APP.callees = {};
                // close previous modal
                $( ui.income_call ).modal( 'hide' );

                $( '.j-ic_initiator' ).text( initiator.full_name );

                // check the current session state
                if ( QB_APP.currentSession.state !== QB.webrtc.SessionConnectionState.CLOSED ) {
                    $( ui.income_call ).modal( 'show' );
                    sounds.ringtone.play( );
                }
            });*/
        };

        QB.webrtc.onRejectCallListener = function onRejectCallListener ( session, userId, extension ) {
            console.group( 'onRejectCallListener.' );
                console.log( 'UserId: ' + userId );
                console.log( 'Session: ' + session );
                console.log( 'Extension: ' + JSON.stringify( extension ) );
            console.groupEnd( );

            var user = _.findWhere( QB_APP.users, { 'id': +userId } ),
                userCurrent = _.findWhere( QB_APP.users, { 'id': + session.currentUserID } );

            /** It's for p2p call */
            if ( session.opponentsIDs.length === 1 ) {
                QB_APP.helpers.stateBoard.update({
                    'title': 'p2p_call_stop',
                    'property': {
                        'name': user.full_name,
                        'currentName': userCurrent.full_name,
                        'reason': 'rejected the call'
                    }
                });
            } else {
                var userInfo = _.findWhere( QB_APP.users, { 'id': + userId } );
                QB_APP.calleesRejected.push( userInfo );
                $( '.j-callee_status_' + userId ).text( 'Rejected' );
            }
        };

        QB.webrtc.onStopCallListener = function onStopCallListener (session, userId, extension) {
            console.group( 'onStopCallListener.' );
                console.log( 'UserId: ', userId );
                console.log( 'Session: ', session );
                console.log( 'Extension: ', extension );
            console.groupEnd( );

            QB_APP.helpers.notifyIfUserLeaveCall( session, userId, 'hung up the call', 'Hung Up' );

            if ( recorder ) {
                recorder.stop( );
            }
        };

        QB.webrtc.onAcceptCallListener = function onAcceptCallListener ( session, userId, extension ) {
            console.group( 'onAcceptCallListener.' );
                console.log( 'UserId: ', userId );
                console.log( 'Session: ', session );
                console.log( 'Extension: ', extension );
            console.groupEnd( );

            var userInfo = _.findWhere( QB_APP.users, { 'id': + userId } ),
                filterName = $.trim( $( ui.filterSelect ).val( ) );

            sounds.call.pause( );
            QB_APP.currentSession.update( { 'filter': filterName } );

            /** update list of callee who take call */
            QB_APP.calleesAnwered.push( userInfo );

            if ( QB_APP.currentSession.currentUserID === QB_APP.currentSession.initiatorID ) {
                QB_APP.helpers.stateBoard.update({
                    'title': 'tpl_call_status',
                    'property': {
                        'users': QB_APP.helpers.getUsersStatus( )
                    }
                });
            }
        };

        QB.webrtc.onRemoteStreamListener = function onRemoteStreamListener ( session, userId, stream ) {
            console.group( 'onRemoteStreamListener.' );
                console.log( 'userId: ', userId );
                console.log( 'Session: ', session );
                console.log( 'Stream: ', stream );
            console.groupEnd( );

            var state = QB_APP.currentSession.connectionStateForUser( userId ),
                peerConnList = QB.webrtc.PeerConnectionState;

            if ( state === peerConnList.DISCONNECTED || state === peerConnList.FAILED || state === peerConnList.CLOSED ) {
                return false;
            }

            QB_APP.currentSession.peerConnections[userId].stream = stream;

            console.info( 'onRemoteStreamListener add video to the video element', stream );

            QB_APP.currentSession.attachMediaStream( 'remote_video_' + userId, stream );

            if ( remoteStreamCounter === 0 ) {
                $( '#remote_video_' + userId ).click( );

                QB_APP.mainVideo = userId;
                ++remoteStreamCounter;
            }

            if ( !call.callTimer ) {
                call.callTimer = setInterval( function ( ) {
                    call.updTimer.call( call );
                }, 1000 );
            }

            $( '.frames_callee__bitrate' ).show( );
        };

        QB.webrtc.onUpdateCallListener = function onUpdateCallListener ( session, userId, extension ) {
            console.group( 'onUpdateCallListener.' );
                console.log( 'UserId: ' + userId );
                console.log( 'Session: ' + session );
                console.log( 'Extension: ' + JSON.stringify( extension ) );
            console.groupEnd( );

            QB_APP.helpers.changeFilter( '#remote_video_' + userId, extension.filter );

            if ( +( QB_APP.mainVideo ) === userId ) {
                QB_APP.helpers.changeFilter( '#main_video', extension.filter );
            }
        };

        QB.webrtc.onSessionConnectionStateChangedListener = function onSessionConnectionStateChangedListener ( session, userId, connectionState ) {
            console.group( 'onSessionConnectionStateChangedListener.' );
                console.log( 'UserID:', userId );
                console.log( 'Session:', session );
                console.log( 'Сonnection state:', connectionState, statesPeerConn[connectionState] );
            console.groupEnd( );

            var connectionStateName = _.invert( QB.webrtc.SessionConnectionState )[connectionState],
                $calleeStatus = $( '.j-callee_status_' + userId ),
                isCallEnded = false;

            if ( connectionState === QB.webrtc.SessionConnectionState.CONNECTING ) {
                $calleeStatus.text(connectionStateName);
            }

            if ( connectionState === QB.webrtc.SessionConnectionState.CONNECTED ) {
                QB_APP.helpers.toggleRemoteVideoView( userId, 'show' );
                $calleeStatus.text( connectionStateName );
            }

            if ( connectionState === QB.webrtc.SessionConnectionState.COMPLETED ) {
                QB_APP.helpers.toggleRemoteVideoView( userId, 'show' );
                $calleeStatus.text( 'connected' );
            }

            if ( connectionState === QB.webrtc.SessionConnectionState.DISCONNECTED ) {
                QB_APP.helpers.toggleRemoteVideoView( userId, 'hide' );
                $calleeStatus.text( 'disconnected' );
            }

            if ( connectionState === QB.webrtc.SessionConnectionState.CLOSED ) {
                QB_APP.helpers.toggleRemoteVideoView( userId, 'clear' );

                if ( QB_APP.mainVideo === userId ) {
                    $( '#remote_video_' + userId ).removeClass( 'active' );

                    QB_APP.helpers.changeFilter( '#main_video', 'no' );
                    QB_APP.mainVideo = 0;
                }

                if ( !_.isEmpty( QB_APP.currentSession ) ) {
                    if ( Object.keys( QB_APP.currentSession.peerConnections ).length === 1 || userId === QB_APP.currentSession.initiatorID ) {
                        $( ui.income_call ).modal( 'hide' );
                        sounds.ringtone.pause( );
                    }
                }

                isCallEnded = _.every( QB_APP.currentSession.peerConnections, function ( i ) {
                    return i.iceConnectionState === 'closed';
                });

                /** remove filters */

                if ( isCallEnded ) {
                    QB_APP.helpers.changeFilter( '#localVideo', 'no' );
                    QB_APP.helpers.changeFilter( '#main_video', 'no' );

                    $( ui.filterSelect ).val( 'no' );

                    QB_APP.calleesAnwered = [];
                    QB_APP.calleesRejected = [];
                    QB_APP.network[userId] = null;
                }

                if ( QB_APP.currentSession.currentUserID === QB_APP.currentSession.initiatorID && !isCallEnded ) {
                    var userInfo = _.findWhere( QB_APP.users, { 'id': + userId } );

                    /** get array if users without user who ends call */
                    QB_APP.calleesAnwered = _.reject( QB_APP.calleesAnwered, function ( num ) { return num.id === + userId; } );
                    QB_APP.calleesRejected.push( userInfo );

                    QB_APP.helpers.stateBoard.update({
                       'title': 'tpl_call_status',
                       'property': {
                           'users': QB_APP.helpers.getUsersStatus( )
                        }
                    });
                }

                if ( _.isEmpty( QB_APP.currentSession ) || isCallEnded ) {
                    if ( call.callTimer ) {
                        $( '#timer' ).addClass( 'invisible' );
                        clearInterval( call.callTimer );
                        call.callTimer = null;
                        call.callTime = 0;
                        QB_APP.helpers.network = {};
                    }
                }
            }
        };

        QB.webrtc.onDevicesChangeListener = function onDevicesChangeListeners ( ) {
            fillMediaSelects( ).then( switchMediaTracks );
        };

        // private functions
        function closeConn ( userId ) {
            if ( recorder && recorderTimeoutID ) {
                recorder.stop( );
            }

            QB_APP.helpers.notifyIfUserLeaveCall( QB_APP.currentSession, userId, 'disconnected', 'Disconnected' );
            QB_APP.currentSession.closeConnection( userId );
        }

        function showMediaDevices ( kind ) {
            return new Promise( function ( resolve, reject ) {
                QB.webrtc.getMediaDevices( kind ).then( function( devices ) {
                    var isVideoInput = ( kind === 'videoinput' ),
                        $select = isVideoInput ? $( ui.videoSourceFilter ) : $( ui.audioSourceFilter );

                    $select.empty( );

                    if ( devices.length ) {
                        for ( var i = 0; i !== devices.length; ++i ) {
                            var deviceInfo = devices[i],
                                option = document.createElement( 'option' );

                            option.value = deviceInfo.deviceId;

                            if ( deviceInfo.kind === kind ) {
                                option.text = deviceInfo.label || ( isVideoInput ? 'Camera ' : 'Mic ' ) + ( i + 1 );
                                $select.append( option );
                            }
                        }

                        $( '.j-media_sources' ).removeClass( 'invisible' );
                    } else {
                        $( '.j-media_sources' ).addClass( 'invisible' );
                    }

                    resolve( );
                }).catch( function ( error ) {
                    console.warn( 'getMediaDevices', error );

                    reject( );
                });
            });
        }

        function fillMediaSelects ( ) {
            return new Promise( function( resolve, reject ) {
                navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true
                }).then( function ( stream ) {
                    showMediaDevices( 'videoinput' ).then( function ( ) {
                        return showMediaDevices( 'audioinput' );
                    }).then( function ( ) {
                        stream.getTracks( ).forEach( function ( track ) {
                            track.stop( );
                        });

                        resolve( );
                    });
                }).catch( function ( error ) {
                    console.warn( 'Video devices were shown without names (getUserMedia error)', error );

                    showMediaDevices( 'videoinput' ).then( function ( ) {
                        return showMediaDevices( 'audioinput' );
                    }).then( function ( ) {
                        resolve( );
                    });
                });
            });
        }

        function switchMediaTracks ( ) {
            if ( !document.getElementById( 'localVideo' ).srcObject || !QB_APP.currentSession ) {
                return true;
            }

            var audioDeviceId = $( ui.audioSourceFilter ).val( ) ? $( ui.audioSourceFilter ).val( ) : undefined,
                videoDeviceId = $( ui.videoSourceFilter ).val( ) ? $( ui.videoSourceFilter ).val( ) : undefined,
                deviceIds = {
                    audio: audioDeviceId,
                    video: videoDeviceId
                };

            var callback = function ( err, stream ) {
                if ( err || !stream.getAudioTracks( ).length ||
                    ( isAudio ? false : !stream.getVideoTracks( ).length )
                ) {
                    QB_APP.currentSession.stop({});

                    QB_APP.helpers.stateBoard.update({
                        'title': 'tpl_device_not_found',
                        'isError': 'qb-error',
                        'property': {
                            'name': QB_APP.caller.full_name
                        }
                    });
                }
            };

            QB_APP.currentSession.switchMediaTracks( deviceIds, callback );
        }
    });
} ( window, window.QB, window.QB_CONFIG, window.QB_APP, jQuery, Backbone ) );
