;( function( window, QB, QB_CONFIG ) {
    'use strict';

    // GLOBAL VARIABLE
    window.QB_APP  = {};

    QB_APP.helpers = {};
    QB_APP.network = {};
    QB_APP.filter  = {
        'names': 'no _1977 inkwell moon nashville slumber toaster walden'
    };

    QB_APP.helpers.notifyIfUserLeaveCall = function ( session, userId, reason, title ) {
        var userRequest = _.findWhere( QB_APP.users, { 'id': +userId } ),
            userCurrent = _.findWhere( QB_APP.users, { 'id': +session.currentUserID } );

        /** It's for p2p call */
        if ( session.opponentsIDs.length === 1 ) {
            QB_APP.helpers.stateBoard.update({
                'title': 'p2p_call_stop',
                'property': {
                    'name': userRequest.full_name,
                    'currentName': userCurrent.full_name,
                    'reason': reason
                }
            });
        } else {
            /** It's for groups call */
            $( '.j-callee_status_' + userId ).text( title );
        }
    };

    QB_APP.helpers.changeFilter = function ( selector, filterName ) {
        $( selector ).removeClass( QB_APP.filter.names ).addClass( filterName );
    };

    QB_APP.helpers.getConStateName = function ( num ) {
        var answ;

        switch ( num ) {
            case QB.webrtc.PeerConnectionState.DISCONNECTED:
            case QB.webrtc.PeerConnectionState.FAILED:
            case QB.webrtc.PeerConnectionState.CLOSED:
                answ = 'DISCONNECTED';
                break;
            default:
                answ = 'CONNECTING';
        }

        return answ;
    };

    QB_APP.helpers.toggleRemoteVideoView = function ( userId, action ) {
        var $video = $( '#remote_video_' + userId );

        if ( !_.isEmpty( QB_APP.currentSession ) && $video.length ) {
            if ( action === 'show' ) {
                $video.parents( '.j-callee' ).removeClass( 'wait' );
            } else if ( action === 'hide' ) {
                $video.parents( '.j-callee' ).addClass( 'wait' );
            } else if ( action === 'clear' ) {
                /** detachMediaStream take videoElementId */
                QB_APP.currentSession.detachMediaStream( 'remote_video_' + userId );
                $video.parents( '.j-callee' ).removeClass( 'wait' );
            }
        }
    };

    /**
     * [getUui - generate a unique id]
     * @return {[string]} [a unique id]
     */
    function _getUui ( identifyAppId ) {
        var navigator_info = window.navigator;
        var screen_info = window.screen;
        var uid = navigator_info.mimeTypes.length;

        uid += navigator_info.userAgent.replace( /\D+/g, '' );
        uid += navigator_info.plugins.length;
        uid += screen_info.height || '';
        uid += screen_info.width || '';
        uid += screen_info.pixelDepth || '';
        uid += identifyAppId;

        return uid;
    }

    QB_APP.helpers.login = function ( data ) {
        var userRequiredParams = {
            login: data.login,
            password: data.password,
        };

        return new Promise( function ( resolve, reject ) {
            // Create QuickBlox Session
            QB.createSession( function ( csErr, csRes ) {
                if ( csErr ) {
                    reject( csErr );
                } else {
                    // Login to QuickBlox
                    QB.login( userRequiredParams, function ( loginErr, loginUser ) {
                        if ( loginErr ) {
                            // If the user not exists, create account
                            QB.users.create({
                                'login': userRequiredParams.login,
                                'password': userRequiredParams.password,
                                'full_name': data.name,
                                'tag_list': data.room,
                            }, function( createErr, createUser ) {
                                if ( createErr ) {
                                    console.log( '[create user] Error:', createErr );
                                    reject( createErr );
                                } else {
                                    QB.login( userRequiredParams, function ( reloginErr, reloginUser ) {
                                        if ( reloginErr ) {
                                            console.log( '[relogin user] Error:', reloginErr );
                                        } else {
                                            resolve( reloginUser );
                                        }
                                    });
                                }
                            });
                        } else {
                            // If the use exists, update account
                            if ( loginUser.user_tags !== data.room || loginUser.full_name !== data.name ) {
                                QB.users.update( loginUser.id, {
                                    'full_name': data.name,
                                    'tag_list': data.room,
                                }, function ( updateError, updateUser ) {
                                    if ( updateError ) {
                                        console.log( 'APP [update user] Error:', updateError );
                                        reject( updateError );
                                    } else {
                                        resolve( updateUser );
                                    }
                                });
                            } else {
                                resolve( loginUser );
                            }
                        }
                    });
                }
            });
        });
    };

    // Get User By Tags
    QB_APP.helpers.renderUsers = function ( ) {
        return new Promise( function( resolve, reject ) {
            var tpl = _.template( $( '#user_tpl' ).html( ) ),
                usersHTML = '',
                users = [];

            QB.users.get({ 'tags': [QB_APP.caller.user_tags], 'per_page': 100 }, function ( err, result ) {
                if ( err ) {
                    reject( err );
                } else {
                    _.each( result.items, function ( item ) {
                        users.push( item.user );

                        if ( item.user.id !== QB_APP.caller.id ) {
                            usersHTML += tpl( item.user );
                        }
                    });

                    if ( result.items.length < 2 ) {
                        reject({
                            'title': 'not found',
                            'message': 'Not found users by tag'
                        });
                    } else {
                        resolve({
                            'usersHTML': usersHTML,
                            'users': users
                        });
                    }
                }
            });
        });
    };

    // Get User By Id
    QB_APP.helpers.getUser = function ( id ) {
        return new Promise( function( resolve, reject ) {
            QB.users.get( id, function ( err, result ) {
                if ( err ) {
                    reject( err );
                } else {
                    resolve( result );
                }
            });
        });
    }

    QB_APP.helpers.getUsersStatus = function ( ) {
        var users = {};

        if ( QB_APP.calleesAnwered.length ) {
            users.accepted = QB_APP.calleesAnwered;
        }

        if ( QB_APP.calleesRejected.length ) {
            users.rejected = QB_APP.calleesRejected;
        }

        return users;
    };
} ( window, window.QB, window.QB_CONFIG ) );
