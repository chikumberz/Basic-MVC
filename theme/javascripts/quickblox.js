;( function ( $, _, QB ) {
	'use strict';

	String.prototype.format = function ( ) {
	  	return [...arguments].reduce( ( p, c ) => p.replace( /%s/, c ), this );
	};

	var app = {};
	app.own;
	app.settings = {
		app_id: false,
        app_auth_key: false,
        app_auth_secret: false,
        app_config: {
	        debug: {
	        	mode: 0
	        },
	        webrtc: {
	            answerTimeInterval: 30,
	            dialingTimeInterval: 5,
	            disconnectTimeInterval: 35,
	            statsReportTimeInterval: 5,
	        },
	        chatProtocol: {
	            active: 2 // set 1 to use BOSH, set 2 to use WebSockets (default)
	        },
	        streamManagement: {
	            enable: true
	        },
	    },
	    app_login: {
	    	login: false,
            password: false,
            name: false,
            room: 'default',
	    },
	    session: {},
        video: {
        	source: {
        		name: 'chat-video-source',
        	},
        	main: {
        		id: 'video_main',
        		container_id: 'chat-video-main',
        	},
        	local: {
        		id: 'video_local',
        		container_id: 'chat-video-local',
        	},
        	remote: {
        		id: 'video_remote',
        		container_id: 'chat-video-remote-container',
        	}
        },
        audio: {
        	source: {
        		name: 'chat-audio-source',
        	}
        },
        call: {
        	accept: false,
        	sounds: {
        		start: 'call-start-signal',
        		end: 'call-end-signal',
        		ring: 'call-ring-signal',
        	},
        	setting: {
        		id: 'modal-call-setting',
        		message: {
        			id: 'setting-message-container',
        			error: 'danger',
        			success: 'success',
        		},
        	}
        },
        chat: {
        	container_id: 'chat-dialog-container',
		    dialog: {
		    	limit: 15,
		    	types: {
			        chat: 3,
			        chat_group: 2,
			        chat_public: 1
			    },
		    	container_id: 'chat-dialog-list-container',
		    	last_message: {
			    	id: 'chat-info-last-message',
			    },
		    	last_message_name: {
			    	id: 'chat-info-last-message-name',
			    },
			    last_message_date: {
			    	id: 'chat-aditional-info-last-message-date',
			    },
			    last_message_counter: {
			    	id: 'chat-aditional-info-last-message-counter'
			    },
			    message: {
			    	id: 'chat-info-message',
			    	container_id: 'chat-dialog-message-list-container',
				    name: {
				    	id: 'chat-info-name',
				    },
				    date: {
				    	id: 'chat-aditional-info-message-date',
				    },
				    status: {
				    	id: 'chat-aditional-info-message-status',
				    	class: {
					    	sent: 'status-sent',
					    	seen: 'status-seen',
					    	missed: 'status-missed',
					    	recieved: 'status-recieved',
					    }
					},
					attachment: {
				        type: 'image',
				        body: '[attachment]',
						container_id: 'chat-info-message-attachment',
				        max_size: 2 * 1000000, // Set 2mb
				        max_size_message: 'Image is too large. Max size is 2 mb.'
				    },
					limit: 20,
	        		typing_timeout: 3,
			    }
		    },
		    notification_types: {
		        new_dialog: 1,
		        update_dialog: 2
		    },
        },
        messages: {
        	ok: 'Ok',
        	save: 'Save',
        	close: 'Close',
	        call_ring: 'Ringing...',
	        call_end: 'Call Ended',
	        call_reject: 'Rejected',
	        call_no_answer: 'No Answer',
	        call_connected: 'Connected',
	        call_connecting: 'Connecting...',
	        call_disconnected: 'Disconnected',

        	setting_title: 'Settings',
        	setting_error: 'Error on chaning devices setting',
        	setting_success: 'Devices setting has been changed.',
	        no_webrtc_title: 'WebRTC is not available',
	        no_webrtc_content: 'WebRTC is not available in your browser',
	        no_internet_title: 'No internt connection',
	        no_internet_content: 'Please check your Internet connection and try again',
	        no_microphone_title: 'Can\'t find microphone',
	        no_microphone_content: 'Connect your microphone and refresh the page to turn on mic. If your microphone is already connected, try restarting your browser.',
	        no_camera_title: 'Can\'t find camera',
	        no_camera: 'Connect your camera and refresh the page to turn on video. If your camera is already connected, try restarting your browser.',

	        user_not_found_title: 'Couldn\'t find user with the ID (%s)',
	        user_not_found_content: 'User is not existing. Please check the user ID.',

	        no_selected_dialog_title: 'No selected dialog',
	        no_selected_dialog_content: 'You need to select dialog first before sending messages.',

	        message_create_title: 'Create message with %s',
	        message_create_content: 'Are you sure you want to create mesage.',
	        message_status_seen: 'seen',
	        message_status_sent: 'sent',
	        message_status_missed: 'not sent',
	        message_status_recieved: 'recieved',
	    },
	    templates: {
	    	modal: '\
	    	<div class="modal fade" id="<% if ( typeof( id ) !== \'undefined\' ) { %><%= id %><% } else { %>default-modal<% } %>" tabindex="-1" data-backdrop="static" data-keyboard="false">\
				<div class="modal-dialog">\
					<div class="modal-content">\
						<% if ( typeof( title ) !== \'undefined\' ) { %>\
							<div class="modal-header">\
								<h5 class="modal-title"><%=title%></h5>\
							</div>\
						<% } %>\
						<% if ( typeof( content ) !== \'undefined\' ) { %><div class="modal-body"><%=content%></div><% } %>\
						<div class="modal-footer">\
							<% if ( typeof( buttons ) === \'object\' ) { %>\
				                <% _.each( buttons, function( el, i ) { %>\
				                    <button type="<% if ( typeof( type ) !== \'undefined\' ) { %><%= el.type %><% } else { %><%= \'button\' %><% } %>"\
				                    	<% if ( typeof( el.attributes ) === \'object\' ) { %>\
				                			<% _.each( el.attributes, function( a_val, a_key ) { %>\
												<%= a_key %>="<%= a_val %>"\
				                			<% }); %>\
										<% } %>\
				                    ><%= el.text %></button>\
				                <% }); %>\
				            <% } %>\
						</div>\
					</div>\
				</div>\
			</div>',
			alert: '\
			<div class="alert alert-<%= type %>">\
				<%= message %>\
			  	<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
			</div>',
			setting: '\
			<div id="<%= setting_message_container_id %>"></div>\
			<div class="form-group">\
			    <label for="field-<%= chat_audio_source_name %>" class="col-form-label">Microphone:</label>\
			    <select name="<%= chat_audio_source_name %>" id="field-<%= chat_audio_source_name %>" class="form-control"></select>\
		   	</div>\
			<div class="form-group">\
				<label for="field-<%= chat_video_source_name %>" class="col-form-label">Camera:</label>\
		    	<select name="<%= chat_video_source_name %>" id="field-<%= chat_video_source_name %>" class="form-control"></select>\
			</div>',
			wrapper: '\
			<div class="chat-container">\
				<div class="chat-audio" id="chat-audio-container">\
					<audio id="<%= call_start_signal %>" loop preload="auto">\
					    <source src="/quickblox/samples/webrtc/audio/calling.ogg" type="audio/ogg" />\
					    <source src="/quickblox/samples/webrtc/audio/calling.mp3" type="audio/mp3" />\
					</audio>\
					<audio id="<%= call_ring_signal %>" loop preload="auto">\
					    <source src="/quickblox/samples/webrtc/audio/ringtone.ogg" type="audio/ogg" />\
					    <source src="/quickblox/samples/webrtc/audio/ringtone.mp3" type="audio/mp3" />\
					</audio>\
					<audio id="<%= call_end_signal %>" preload="auto">\
					    <source src="/quickblox/samples/webrtc/audio/end_of_call.ogg" type="audio/ogg" />\
					    <source src="/quickblox/samples/webrtc/audio/end_of_call.mp3" type="audio/mp3" />\
					</audio>\
				</div>\
				<div class="chat-video" id="<%= video_main_container_id %>"><video id="<%= video_main_id %>" autoplay playsinline></video></div>\
			    <div class="chat-video" id="<%= video_local_container_id %>"><video id="<%= video_local_id %>" autoplay playsinline></video></div>\
			    <div class="chat-video" id="<%= video_remote_container_id %>"></div>\
				\
				<div class="chat-header">\
					<a href="#<%= call_setting_id %>" data-toggle="modal" class="btn btn-chat-setting float-right p-20"><i class="fas fa-cogs fs-30"></i></a>\
				</div>\
				\
				<div class="chat-content">\
					<div id="<%= chat_container_id %>" class="chat-dialog-container">\
						<div class="chat-dialog-sidebar">\
							<ul id="<%= chat_dialog_list_container_id %>" class="chat-dialog-list-container loading"></ul>\
						</div>\
						<div class="chat-dialog-message-content">\
							<div class="chat-dialog-message-notification"></div>\
							<ul id="<%= chat_dialog_message_list_container_id %>" class="chat-dialog-message-list-container"></ul>\
							<form name="chat-form-send-message" class="chat-form-send-message">\
								<textarea name="chat-message" placeholder="Type a message..."></textarea>\
							</form>\
						</div>\
					</div>\
				</div>\
				\
				<div class="chat-footer">\
				</div>\
			</div>',
			video_remote: '\
			<div id="call-video-remote-<%= params.user.id %>" class="chat-video-remote <% if ( params.type === 2 ) { %>d-none<% } %>">\
				<video class="chat-video" id="<%= id %>" onclick="$( this ).quickblox( \'setMainVideo\', <%= params.user.id %> );" autoplay playsinline></video>\
				<h4 class="chat-status"><span id="call-status-<%= params.user.id %>"><%= params.call_status %></span> / <span id="call-bitrate-<%= params.user.id %>"><%= params.call_bitrate %></span> kbps</h4>\
            </div>',
			call_start: '\
			<div id="call-start" class="call-container">\
				<div class="call">\
					<h1 id="call-name-<%= params.user.id %>" class="call-user"><%= params.user.full_name %></h1>\
					<h4 id="call-timer-<%= params.user.id %>" class="call-timer"></h4>\
					<h4 id="call-status-<%= params.user.id %>" class="call-status"><%= params.call_status %></h4>\
				</div>\
			  	<div class="call-actions">\
			  		<% if ( type === 1 ) { %>\
						<button type="button" class="btn-call-action btn-call-accept active" onclick="$( this ).quickblox( \'callAccept\' );"><i class="fas fa-phone-alt"></i></button>\
						<button type="button" class="btn-call-action btn-call-decline" onclick="$( this ).quickblox( \'callDecline\' );"><i class="fas fa-phone-slash"></i></button>\
					<% } else { %>\
						<button type="button" class="btn-call-action btn-call-book" data-toggle="modal" data-target="#power-book"><i class="fas fa-book-open"></i></button>\
				  		<% if ( params.call_type === 1 ) { %>\
							<button type="button" class="btn-call-action btn-call-video active" onclick="$( this ).quickblox( \'toggleMediaDevices\', \'video\' );"><i class="fas fa-video"></i></button>\
						<% } %>\
						<button type="button" class="btn-call-action btn-call-audio active" onclick="$( this ).quickblox( \'toggleMediaDevices\', \'audio\' );"><i class="fas fa-microphone"></i></button>\
						<button type="button" class="btn-call-action btn-call-end" onclick="$( this ).quickblox( \'callEnd\' );"><i class="fas fa-phone"></i></button>\
					<% } %>\
			  	</div>\
			</div>',
			call_end: '\
			<div id="call-end" class="call-container">\
				<div class="call">\
					<h1 id="call-name-<%= params.user.id %>" class="call-user"><%= params.user.full_name %></h1>\
					<h4 id="call-timer-<%= params.user.id %>" class="call-timer"></h4>\
					<h4 id="call-status-<%= params.user.id %>" class="call-status"><%= params.call_status %></h4>\
				</div>\
			  	<div class="call-actions">\
			  		<button type="button" class="btn-call-action btn-call-book" data-toggle="modal" data-target="#power-book"><i class="fas fa-book-open"></i></button>\
					<button type="button" class="btn-call-action btn-call-call active" onclick="$( this ).quickblox( \'call\', <%= params.user.id %>, <%= params.call_type %> );"><i class="fas fa-phone-alt"></i></button>\
					<button type="button" class="btn-call-action btn-call-close" onclick="$( this ).closest( \'.call-container\' ).fadeOut( \'fast\', function () { $( this ).remove( ); });"><i class="fas fa-times"></i></button>\
			  	</div>\
			</div>',
			chat_dialog_list: '\
			<li id="chat-dialog-list-<%= dialog.dialog_id %>" class="chat-dialog-list" data-dialog-id="<%= dialog.dialog_id %>" data-name="<%= dialog.name %>">\
				<a href="#<%= dialog.dialog_id %>" class="chat-dialog-list-link">\
					<div class="chat-dialog-list-avatar">\
						<% if ( dialog.type === 2 ) { %>\
							<i class="fas fa-users"></i>\
						<% } else { %>\
							<i class="fas fa-user"></i>\
						<% } %>\
					</div>\
					<div class="chat-dialog-list-info">\
						<h6 id="<%= chat_info_last_message_name_id %>" class="chat-info-last-message-name"><%= dialog.name %></h6>\
						<p id="<%= chat_info_last_message_id %>" class="chat-info-last-message"><%- dialog.last_message %></p>\
					</div>\
					<div class="chat-dialog-list-additional-info">\
						<span id="<%= chat_aditional_info_last_message_date_id %>" class="chat-aditional-info-last-message-date"><%= dialog.last_message_sent_on.format( \'ddd, MMM D h:mm a\' ) %></span>\
						<span id="<%= chat_aditional_info_last_message_counter_id %>" class="chat-aditional-info-last-message-counter <%= ( dialog.messages_unread_cnt ) ? "visible" : "" %>"><%= dialog.messages_unread_cnt %></span>\
					</div>\
				</a>\
			</li>',
			chat_dialog_message_list: '\
			<li id="chat-dialog-message-list-<%= dialog.dialog_id %>" class="chat-dialog-message-list <%= ( sender_type ) ? "me" : "them"  %>" data-dialog-message-id="<%= message.message_id %>" data-status="<%= message.status %>">\
				<div class="chat-dialog-message-list-avatar">\
					<% if ( dialog.type === 2 ) { %>\
						<i class="fas fa-users"></i>\
					<% } else { %>\
						<i class="fas fa-user"></i>\
					<% } %>\
				</div>\
				<div class="chat-dialog-message-list-info-container">\
					<div class="chat-dialog-message-list-info">\
						<h6 id="<%= chat_info_message_name_id %>" class="chat-info-name"><%- sender ? sender.full_name : message.sender_id %></h6>\
						<% if ( message.message_fill ) { %>\
							<div id="<%= chat_info_message_id %>" class="chat-info-message"><%= message.message_fill %></div>\
						<% } %>\
						<% if ( message.attachments.length ) { %>\
							<ul id="<%= chat_info_message_attachment_container_id %>" class="chat-info-message-attachment">\
								<% _.each( message.attachments, function ( attachment ) { %>\
									<li><img src="<%= attachment.src %>" class=""></li>\
								<% }); %>\
							</ul>\
						<% } %>\
					</div>\
					<div class="chat-dialog-message-list-additional-info">\
						<span id="<%= chat_aditional_info_message_date_id %>" class="chat-aditional-info-message-date"><%= message.sent_on.format( \'ddd, MMM D h:mm a\' ) %></span>\
						<span id="<%= chat_aditional_info_message_status_id %>" class="chat-aditional-info-message-status"><%= message.status %></span>\
					</div>\
				</div>\
			</li>',
	    },
	    methods: {
	    	// Caller
	    	call: function ( user_id, call_type, call_params ) {
	    		console.warn( 'CALL' );

				var audio_source = $( '[name="' + app.settings.audio.source.name + '"]' ).val( );
				var video_source = $( '[name="' + app.settings.video.source.name + '"]' ).val( );
				var bandwidth    = null;
				var media_params = {
	                audio: {
	                    deviceId: audio_source ? audio_source : undefined
	                },
	                video: {
                        deviceId: video_source ? video_source : undefined
                    },
	                options: {
	                    muted: true,
	                    mirror: true
	                },
	                elemId: app.settings.video.local.id
	            };

	            if ( typeof call_params !== 'object' ) {
	            	call_params = app.methods.callGetParams( call_params );
	            }

                if ( call_type === QB.webrtc.CallType.VIDEO ) {
                	app.own.find( '#' + app.settings.video.local.container_id ).fadeIn( );

                	if ( typeof user_id === 'array' ) {
	                	app.own.find( '#' + app.settings.video.remote.container_id ).fadeIn( );
	                }
                } else {
                	media_params.video = false;
                }

                app.methods.callSetParams( call_params );
                app.methods.getUserById( user_id ).then( function ( user ) {
                	if ( !_.find( app.variables.users, { id: user.id } ) ) {
            			app.variables.users.push( user );
            		}

            		if ( app.variables.templates.call_end ) {
            			if ( app.variables.templates.call_end.hasClass( 'modal' ) ) {
							app.variables.templates.call_end.modal( 'hide' );
						} else {
							app.variables.templates.call_end.remove( );
						}

						delete app.variables.templates.call_end;
					}

                	app.variables.session = QB.webrtc.createNewSession( [user.id], call_type === QB.webrtc.CallType.AUDIO ? QB.webrtc.CallType.AUDIO : QB.webrtc.CallType.VIDEO, null, { bandwidth: bandwidth } );
                	app.variables.session.getUserMedia( media_params, function ( error, stream ) {
	                    if ( error || !stream.getAudioTracks( ).length || ( call_type === QB.webrtc.CallType.AUDIO ? false : !stream.getVideoTracks( ).length ) ) {
	                        app.variables.session.stop({});

							if ( call_type === QB.webrtc.CallType.AUDIO && app.variables.audio.available == false ) {
			                	var modal_template = _.template( app.settings.templates.modal )({
					            	title: app.settings.messages.no_microphone_title,
					            	content: app.settings.messages.no_microphone_content,
					            	buttons: [
					            		{
						            		text: app.settings.messages.close,
						            		attributes: {
						            			class: 'btn btn-dark',
						            			'data-dismiss': 'modal',
						            		}
						            	}
					            	]
					            });

					            app.variables.templates.modal = $( modal_template );
					            app.variables.templates.modal.appendTo( app.own );
					            app.variables.templates.modal.modal( 'show' );
					            app.variables.templates.modal.on( 'hidden.bs.modal', function ( e ) {
					            	$( this ).remove( );

					            	delete app.variables.templates.modal;
					            });
			                }

			                if ( call_type === QB.webrtc.CallType.VIDEO && app.variables.video.available == false ) {
			                	var modal_template = _.template( app.settings.templates.modal )({
					            	title: app.settings.messages.no_camera_title,
					            	content: app.settings.messages.no_camera_content,
					            	buttons: [
					            		{
						            		text: app.settings.messages.close,
						            		attributes: {
						            			class: 'btn btn-dark',
						            			'data-dismiss': 'modal',
						            		}
						            	}
					            	]
					            });

					            app.variables.templates.modal = $( modal_template );
					            app.variables.templates.modal.appendTo( app.own );
					            app.variables.templates.modal.modal( 'show' );
					            app.variables.templates.modal.on( 'hidden.bs.modal', function ( e ) {
					            	$( this ).remove( );

					            	delete app.variables.templates.modal;
					            });
			                }
	                    } else {
	                        app.variables.session.call( call_params, function ( error ) {
	                            if ( window.navigator.onLine && !error ) {
	                            	var call_start_template = _.template( app.settings.templates.call_start )({
	                            		type: 0,
						            	params: {
						            		user: user,
						            		call_type: call_type,
						            		call_params: call_params,
						            		call_status: app.settings.messages.call_ring,
						            	},
						            });

		                            app.variables.templates.call_start = $( call_start_template );
		        					app.variables.templates.call_start.appendTo( app.own );

		        					app.own.removeClass( 'loading' );

		        					if ( app.variables.templates.call_start.hasClass( 'modal' ) ) {
										app.variables.templates.call_start.show( );
									} else {
										app.variables.templates.call_start.fadeIn( );
									}

		        					if ( typeof app.variables.templates.video_remote !== 'array' ) {
						            	app.variables.templates.video_remote = [];
						            }

									var video_remote_template = _.template( app.settings.templates.video_remote )({
										id: app.settings.video.remote.id + '_' + user.id,
						            	params: {
						            		user: user,
						            		call_type: call_type,
						            		call_params: call_params,
						            		call_status: 'CONNECTING',
						            		call_bitrate: 0,
						            	},
						            });

						            app.variables.templates.video_remote[user.id] = $( video_remote_template );
						            app.variables.templates.video_remote[user.id].appendTo( '#' + app.settings.video.remote.container_id );

						            $( '.call-name' ).text( user.full_name );

		        					app.settings.call.sounds.start.play( );
	                            } else {
	                            	app.variables.session.stop({});
	                            }
	                        });

	                        // and also send push notification about incoming call
	                        // (corrently only iOS/Android users will receive it)
	                        /*var params = {
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
	                        });*/
	                    }
	                });
                });
	    	},
	    	callAccept: function ( ) {
	    		console.warn( 'CALL ACCEPT' );

	            app.settings.call.sounds.ring.pause( );

	            var audio_source = $( '[name="' + app.settings.audio.source.name + '"]' ).val( );
				var video_source = $( '[name="' + app.settings.video.source.name + '"]' ).val( );
		    	var media_params = {
                    audio: {
                        deviceId: audio_source
                    },
                    video: {
                        deviceId: video_source
                    },
                    elemId: app.settings.video.local.id,
                    options: {
                        muted: true,
                        mirror: true
                    }
                };

	            if ( app.variables.session.callType === QB.webrtc.CallType.AUDIO ) {
	            	media_params.video = false;
	            }

	            app.variables.session.getUserMedia( media_params, function ( error, stream ) {
	                if ( error || !stream.getAudioTracks( ).length || ( app.variables.session.callType === QB.webrtc.CallType.AUDIO ? false : !stream.getVideoTracks( ).length ) ) {
	                    app.variables.session.stop({});

		                if ( app.variables.session.callType === QB.webrtc.CallType.AUDIO && app.variables.audio.available == false ) {
		                	var modal_template = _.template( app.settings.templates.modal )({
				            	title: app.settings.messages.no_microphone_title,
					           	content: app.settings.messages.no_microphone_content,
				            	buttons: [
				            		{
					            		text: app.settings.messages.close,
					            		attributes: {
					            			class: 'btn btn-dark',
					            			'data-dismiss': 'modal',
					            		}
					            	}
				            	]
				            });

				            app.variables.templates.modal = $( modal_template );
				            app.variables.templates.modal.appendTo( app.own );
				            app.variables.templates.modal.modal( 'show' );
				            app.variables.templates.modal.on( 'hidden.bs.modal', function ( e ) {
				            	$( this ).remove( );

				            	delete app.variables.templates.modal;
				            });
		                }

		                if ( app.variables.session.callType === QB.webrtc.CallType.VIDEO && app.variables.video.available == false ) {
		                	var modal_template = _.template( app.settings.templates.modal )({
		                		title: app.settings.messages.no_camera_title,
				            	content: app.settings.messages.no_camera_content,
				            	buttons: [
				            		{
					            		text: app.settings.messages.close,
					            		attributes: {
					            			class: 'btn btn-dark',
					            			'data-dismiss': 'modal',
					            		}
					            	}
				            	]
				            });

				            app.variables.templates.modal = $( modal_template );
				            app.variables.templates.modal.appendTo( app.own );
				            app.variables.templates.modal.modal( 'show' );
				            app.variables.templates.modal.on( 'hidden.bs.modal', function ( e ) {
				            	$( this ).remove( );

				            	delete app.variables.templates.modal;
				            });
		                }
	                } else {
						var user = _.find( app.variables.users, { id: +app.variables.session.initiatorID } );

	                	if ( app.variables.templates.call_start ) {
	                		if ( app.variables.templates.call_start.hasClass( 'modal' ) ) {
								app.variables.templates.call_start.modal( 'hide' );
							} else {
	                			app.variables.templates.call_start.remove( );
							}

							delete app.variables.templates.call_start;
	                	}

	                	var call_start_template = _.template( app.settings.templates.call_start )({
	                		type: 0,
			            	params: {
			            		user: user,
			            		call_type: app.variables.session.callType,
			            		call_status: app.settings.messages.call_ring,
			            	},
			            });

                        app.variables.templates.call_start = $( call_start_template );
    					app.variables.templates.call_start.appendTo( app.own );

						app.own.removeClass( 'loading' );

    					if ( app.variables.templates.call_start.hasClass( 'modal' ) ) {
							app.variables.templates.call_start.show( );
						} else {
							app.variables.templates.call_start.fadeIn( );
						}

	                	if ( typeof app.variables.templates.video_remote !== 'array' ) {
			            	app.variables.templates.video_remote = [];
			            }

						var video_remote_template = _.template( app.settings.templates.video_remote )({
							id: app.settings.video.remote.id + '_' + user.id,
			            	params: {
			            		user: user,
			            		call_type: app.variables.session.callType,
			            		call_status: 'CONNECTING',
			            		call_bitrate: 0,
			            	},
			            });

			            app.variables.templates.video_remote[user.id] = $( video_remote_template );
			            app.variables.templates.video_remote[user.id].appendTo( '#' + app.settings.video.remote.container_id );

			            app.own.find( '#' + app.settings.video.local.container_id ).fadeIn( );

	                    app.variables.session.accept({});
	                }
	            });
		    },
		    callDecline: function ( ) {
		    	console.warn( 'CALL DECLINE' );

		    	var user;

	    		if ( app.variables.session.currentUserID === app.variables.session.initiatorID  ) {
	    			user = _.find( app.variables.users, { id: +_.first( app.variables.session.opponentsIDs ) } );
	    		} else {
	    			user = _.find( app.variables.users, { id: +app.variables.session.initiatorID } );
	    		}

		    	if ( app.variables.templates.call_start ) {
		    		if ( app.variables.templates.call_start.hasClass( 'modal' ) ) {
						app.variables.templates.call_start.modal( 'hide' );
					} else {
						app.variables.templates.call_start.remove( );
					}

					delete app.variables.templates.call_start;
				}

		    	var call_end_template = _.template( app.settings.templates.call_end )({
	            	params: {
	            		user: user,
	            		call_type: app.variables.session.callType,
	            		call_status: app.settings.messages.call_end,
	            	},
	            });

                app.variables.templates.call_end = $( call_end_template );
				app.variables.templates.call_end.appendTo( app.own );

				if ( app.variables.templates.call_end.hasClass( 'modal' ) ) {
					app.variables.templates.call_end.on( 'shown.bs.modal', function ( ) {
						app.own.addClass( 'loading' );
					});
					app.variables.templates.call_end.modal( 'show' );
				} else {
					app.variables.templates.call_end.fadeIn( 'fast', function ( ) {
						// app.own.addClass( 'loading' );
					});
				}

		    	if ( !_.isEmpty( app.variables.session ) ) {
	                app.variables.session.reject({});
	            }
		    },
		    callEnd: function ( ) {
		    	console.warn( 'CALL END' );

				var user;

	    		if ( app.variables.session.currentUserID === app.variables.session.initiatorID  ) {
	    			user = _.find( app.variables.users, { id: +_.first( app.variables.session.opponentsIDs ) } );
	    		} else {
	    			user = _.find( app.variables.users, { id: +app.variables.session.initiatorID } );
	    		}

				if ( app.variables.templates.call_start ) {
					if ( app.variables.templates.call_start.hasClass( 'modal' ) ) {
						app.variables.templates.call_start.modal( 'hide' );
					} else {
						app.variables.templates.call_start.remove( );
					}

					delete app.variables.templates.call_start;
				}

		    	var call_end_template = _.template( app.settings.templates.call_end )({
	            	params: {
	            		user: user,
	            		call_type: app.variables.session.callType,
	            		call_status: app.settings.messages.call_end,
	            	},
	            });

                app.variables.templates.call_end = $( call_end_template );
				app.variables.templates.call_end.appendTo( app.own );

				if ( app.variables.templates.call_end.hasClass( 'modal' ) ) {
					app.variables.templates.call_end.modal( 'show' );
				} else {
					app.variables.templates.call_end.fadeIn( 'fast', function ( ) {
						// app.own.addClass( 'loading' );
					});
				}

				if ( app.variables.call.time ) {
                	app.variables.call.updateTimer.call( app.variables.call );
                }

				if ( !_.isEmpty( app.variables.session ) ) {
                    /*if ( recorder && recorderTimeoutID ) {
                        recorder.stop( );
                    }*/

                    app.variables.session.stop({});
                    app.variables.session = {};
                }
	    	},

	    	// Callee
	    	callListen: function ( session, extension ) {
		    	app.variables.session = session;

		    	app.methods.callSetParams( extension );
	            app.methods.getUsersById( _.union( session.opponentsIDs, [session.currentUserID, session.initiatorID] ) ).then( function ( users ) {
	            	_.each( users.items, function ( item, i ) {
	            		var user = item.user;

	            		if ( !_.find( app.variables.users, { id: +user.id } ) ) {
	            			app.variables.users.push( user );
	            		}
	            	});

	            	if ( session.initiatorID !== session.currentUserID ) {
		            	if ( QB.webrtc.SessionConnectionState.CLOSED !== app.variables.session.state ) {
		            		var user = _.find( app.variables.users, { id: session.initiatorID } );

		            		if ( user ) {
		            			$( '.call-name' ).text( user.full_name );

		            			if ( app.settings.call.accept ) {
	            					app.methods.callAccept( );
						        } else {
					           		if ( app.variables.templates.call_end ) {
										if ( app.variables.templates.call_end.hasClass( 'modal' ) ) {
											app.variables.templates.call_end.modal( 'hide' );
										} else {
											app.variables.templates.call_end.remove( );
										}

										delete app.variables.templates.call_end;
									}

						    		var call_start_template = _.template( app.settings.templates.call_start )({
						    			type: 1,
					                	params: {
					                		user: user,
					                		call_status: app.settings.messages.call_ring,
					                	},
					                });
					                app.variables.templates.call_start = $( call_start_template );
					                app.variables.templates.call_start.appendTo( app.own );

					                app.own.removeClass( 'loading' );

					                if ( app.variables.templates.call_start.hasClass( 'modal' ) ) {
										app.variables.templates.call_start.modal( 'show' );
									} else {
										app.variables.templates.call_start.fadeIn( );
									}

						    		app.settings.call.sounds.ring.play( );
					    		}
				        	}
		            	}
		            }
	            });
	    	},
	    	callStatus: function ( session, user_id, stats, error ) {
	    		if ( stats.remote.video.bitrate ) {
	            	app.variables.templates.video_remote[user_id].find( '#call-bitrate-' + user_id  ).text( stats.remote.video.bitrate );
	            } else if ( stats.remote.audio.bitrate ) {
	            	app.variables.templates.video_remote[user_id].find( '#call-bitrate-' + user_id  ).text( stats.remote.audio.bitrate );
           		}
	    	},
	    	callStream: function ( session, user_id, stream ) {
	    		var user                   = _.find( app.variables.users, { id: +user_id } );
				var connection_status      = app.variables.session.connectionStateForUser( user_id );
				var connection_status_list = QB.webrtc.PeerConnectionState;
				var connection_status_name = _.invert( connection_status_list )[connection_status];

	            if ( connection_status === connection_status_list.DISCONNECTED || connection_status === connection_status_list.FAILED || connection_status === connection_status_list.CLOSED ) {
	                return false;
	            }

	            app.variables.session.peerConnections[user_id].stream = stream;

	            if ( app.settings.app_config.debug ) {
		            console.info( 'onRemoteStreamListener add video to the video element', stream );
		        }

	            app.variables.session.attachMediaStream( app.settings.video.remote.id + '_' + user_id, stream );

	            if ( app.variables.video.remote.cnt === 0 ) {
	                app.methods.setMainVideo( user_id );
	            }

	            app.variables.video.remote.cnt++;
				app.variables.video.remote.list.push( user_id );

	            if ( !app.variables.call.timer ) {
	                app.variables.call.timer = setInterval( function ( ) {
	                    app.variables.call.updateTimer.call( app.variables.call );
	                }, 1000 );
	            }
	    	},
	    	callSession: function ( session, user_id, connection_state ) {
	    		var user                   = _.find( app.variables.users, { id: +user_id } );
				var user_current           = _.find( app.variables.users, { id: +session.currentUserID } );
				var connection_status_list = _.invert( QB.webrtc.SessionConnectionState );
				var connection_status_name = connection_status_list[connection_state];

				// CONNECTING
	            if ( QB.webrtc.SessionConnectionState.CONNECTING === connection_state ) {
					if ( app.variables.templates.call_start ) {
						app.variables.templates.call_start.find( '#call-status-' + user.id ).text( app.settings.messages.call_connecting );
					}

	                if ( typeof app.variables.templates.video_remote[user_id] !== 'undefined' ) {
						app.variables.templates.video_remote[user_id].find( '#call-status-' + user_id ).text( connection_status_name );
					}
	            }

	            // CONNECTED
	            if ( QB.webrtc.SessionConnectionState.CONNECTED === connection_state ) {
	            	if ( app.variables.templates.call_start ) {
						app.variables.templates.call_start.find( '#call-status-' + user.id ).text( app.settings.messages.call_connected );
					}

	                if ( typeof app.variables.templates.video_remote[user_id] !== 'undefined' ) {
						app.variables.templates.video_remote[user_id].find( '#call-status-' + user_id ).text( connection_status_name );
					}
	            }

	            // COMPLETED
	            if ( QB.webrtc.SessionConnectionState.COMPLETED === connection_state ) {
	            	if ( app.variables.templates.call_start ) {
						app.variables.templates.call_start.find( '#call-status-' + user.id ).text( app.settings.messages.call_connected );
					}

	                if ( typeof app.variables.templates.video_remote[user_id] !== 'undefined' ) {
						app.variables.templates.video_remote[user_id].find( '#call-status-' + user_id ).text( connection_status_list[2] );
					}
	            }

	            // DISCONNECTED
	            if ( QB.webrtc.SessionConnectionState.DISCONNECTED === connection_state ) {
					if ( app.variables.templates.call_start ) {
						app.variables.templates.call_start.find( '#call-status-' + user.id ).text( app.settings.messages.call_connecting );
					}

	                if ( typeof app.variables.templates.video_remote[user_id] !== 'undefined' ) {
						app.variables.templates.video_remote[user_id].find( '#call-status-' + user_id ).text( connection_status_list[4] );
					}
	            }

				// CLOSED
	            if ( QB.webrtc.SessionConnectionState.CLOSED === connection_state ) {
	                app.variables.session.detachMediaStream( app.settings.video.remote.id + '_' + user_id );

	                if ( app.variables.video.main.user_id === user_id ) {
	                    app.variables.video.main.user_id = null;
	                }

	                var IS_CALLED_ENDED = _.every( app.variables.session.peerConnections, function ( i ) {
	                    return i.iceConnectionState === 'closed';
	                });

	                if ( session.currentUserID === session.initiatorID && !IS_CALLED_ENDED ) {
	                    // Get array if users without user who ends call
	                    app.variables.call.users.answered = _.reject( app.variables.call.users.answered, function ( num ) { return num.id === +user_id; } );
	                    app.variables.call.users.rejected.push( user );
	                }
	            }
	    	},

	    	callUpdate: function ( session, user_id, extension ) {
	    		var user = _.find( app.variables.users, { id: +user_id });

	    		if ( !_.find( app.variables.call.users.answered, { id: +user.id } ) ) {
					app.variables.call.users.answered.push( user );
	    		}

	    		if ( user.id !== app.variables.user.id && !session.acceptCallTime ) {
		    		if ( app.variables.templates.call_start ) {
						if ( app.variables.templates.call_start.hasClass( 'modal' ) ) {
							app.variables.templates.call_start.modal( 'hide' );
						} else {
							app.variables.templates.call_start.remove( );
						}

						delete app.variables.templates.call_start;
					}
				}

				app.settings.call.sounds.ring.pause( );
				app.settings.call.sounds.start.pause( );
	    	},
		    callReject: function ( session, user_id, extension ) {
		    	console.warn( 'CALL REJECTED' );

		    	var user;

	    		if ( session.currentUserID === session.initiatorID  ) {
	    			user = _.find( app.variables.users, { id: +_.first( session.opponentsIDs ) } );
	    		} else {
	    			user = _.find( app.variables.users, { id: +session.initiatorID } );
	    		}

				app.variables.call.users.rejected.push( user );
				session.stop({});

				if ( app.variables.templates.call_end ) {
					if ( app.variables.templates.call_end.hasClass( 'modal' ) ) {
						app.variables.templates.call_end.modal( 'hide' );
					} else {
						app.variables.templates.call_end.remove( );
					}

					delete app.variables.templates.call_end;
				}

	           	var call_end_template = _.template( app.settings.templates.call_end )({
	            	params: {
	            		user: user,
	            		call_type: app.variables.session.callType,
	            		call_status: app.settings.messages.call_reject,
	            	},
	            });

                app.variables.templates.call_end = $( call_end_template );
				app.variables.templates.call_end.appendTo( app.own );

				if ( app.variables.templates.call_end.hasClass( 'modal' ) ) {
					app.variables.templates.call_end.on( 'shown.bs.modal', function ( ) {
						app.own.addClass( 'loading' );
					});
					app.variables.templates.call_end.modal( 'show' );
				} else {
					app.variables.templates.call_end.fadeIn( 'fast', function ( ) {
						// app.own.addClass( 'loading' );
					});
				}
		    },
		    callAnswered: function ( session, user_id, extension ) {
		    	console.warn( 'CALL ANSWERED' );

		    	var user = _.find( app.variables.users, { id: +user_id });

	            app.settings.call.sounds.start.pause( );

	            app.variables.call.users.answered.push( user );
		    },
		    callUnanswered: function ( session, user_id ) {
		    	console.warn( 'CALL UNANSWERED' );

		    	var user = _.find( app.variables.users, { id: +user_id } );

		    	if ( app.variables.templates.call_end ) {
					if ( app.variables.templates.call_end.hasClass( 'modal' ) ) {
						app.variables.templates.call_end.modal( 'hide' );
					} else {
						app.variables.templates.call_end.remove( );
					}

					delete app.variables.templates.call_end;
				}

	            var call_end_template = _.template( app.settings.templates.call_end )({
	            	params: {
	            		user: user,
	            		call_type: app.variables.session.callType,
	            		call_status: app.settings.messages.call_no_answer,
	            	},
	            });

                app.variables.templates.call_end = $( call_end_template );
				app.variables.templates.call_end.appendTo( app.own );

				if ( app.variables.templates.call_end.hasClass( 'modal' ) ) {
					app.variables.templates.call_end.on( 'shown.bs.modal', function ( ) {
						app.own.addClass( 'loading' );
					});
					app.variables.templates.call_end.modal( 'show' );
				} else {
					app.variables.templates.call_end.fadeIn( 'fast', function ( ) {
						// app.own.addClass( 'loading' );
					});
				}
		    },
	    	callStop: function ( session, user_id, connection_state ) {
		    	var user = _.find( app.variables.users, { id: +user_id } );

		    	if ( app.variables.templates.call_end ) {
					if ( app.variables.templates.call_end.hasClass( 'modal' ) ) {
						app.variables.templates.call_end.modal( 'hide' );
					} else {
						app.variables.templates.call_end.remove( );
					}

					delete app.variables.templates.call_end;
				}

				if ( user.id !== app.variables.user.id ) {
			    	var call_end_template = _.template( app.settings.templates.call_end )({
		            	params: {
		            		user: user,
		            		call_type: app.variables.session.callType,
		            		call_status: app.settings.messages.call_end,
		            	},
		            });

	                app.variables.templates.call_end = $( call_end_template );
					app.variables.templates.call_end.appendTo( app.own );

					if ( app.variables.templates.call_end.hasClass( 'modal' ) ) {
						app.variables.templates.call_end.on( 'shown.bs.modal', function ( ) {
							app.own.addClass( 'loading' );
						});
						app.variables.templates.call_end.modal( 'show' );
					} else {
						app.variables.templates.call_end.fadeIn( 'fast', function ( ) {
							// app.own.addClass( 'loading' );
						});
					}

					if ( app.variables.call.time ) {
	                	app.variables.call.updateTimer.call( app.variables.call );
	                }
	            }

                session.stop({});

                /*QB_APP.helpers.notifyIfUserLeaveCall( session, userId, 'hung up the call', 'Hung Up' );

	            if ( recorder ) {
	                recorder.stop( );
	            }*/
		    },
	    	callClose: function ( session ) {
	    		console.warn( 'CALL CLOSED' );

	    		var user;

	    		if ( session.currentUserID === session.initiatorID  ) {
	    			user = _.find( app.variables.users, { id: +_.first( session.opponentsIDs ) } );
	    		} else {
	    			user = _.find( app.variables.users, { id: +session.initiatorID } );
	    		}

	    		app.own.removeClass( 'has-video has-audio' );
	            app.own.find( '#' + app.settings.video.remote.container_id ).empty( );

	            app.variables.session.detachMediaStream( app.settings.video.main.id );
	            app.variables.session.detachMediaStream( app.settings.video.local.id );
	            app.variables.video.remote.cnt = 0;

	            if ( app.variables.templates.call_start ) {
	            	if ( app.variables.templates.call_start.hasClass( 'modal' ) ) {
						app.variables.templates.call_start.modal( 'hide' );
					} else {
						app.variables.templates.call_start.remove( );
					}

					delete app.variables.templates.call_start;
				}

				if ( session.initiatorID !== app.variables.user.id && session.acceptCallTime ) {
		            if ( !app.variables.templates.call_end ) {
		            	var call_end_template = _.template( app.settings.templates.call_end )({
			            	params: {
			            		user: user,
			            		call_type: app.variables.session.callType,
			            		call_status: app.settings.messages.call_end,
			            	},
			            });

	                    app.variables.templates.call_end = $( call_end_template );
						app.variables.templates.call_end.appendTo( app.own );

						if ( app.variables.templates.call_end.hasClass( 'modal' ) ) {
							app.variables.templates.call_end.on( 'shown.bs.modal', function ( ) {
								app.own.addClass( 'loading' );
							});
							app.variables.templates.call_end.modal( 'show' );
						} else {
							app.variables.templates.call_end.fadeIn( 'fast', function ( ) {
								// app.own.addClass( 'loading' );
							});
						}
		            }
		        }

            	app.settings.call.sounds.start.pause( );
            	app.settings.call.sounds.ring.pause( );
				app.settings.call.sounds.end.play( );

                var	IS_CALLED_ENDED = _.every( app.variables.session.peerConnections, function ( i ) {
                    return i.iceConnectionState === 'closed';
                });

                if ( IS_CALLED_ENDED ) {
					app.variables.call.users.answered = [];
					app.variables.call.users.rejected = [];
                }

                if ( _.isEmpty( app.variables.session ) || IS_CALLED_ENDED ) {
                    if ( app.variables.call.timer ) {
                       	clearInterval( app.variables.call.timer );
						app.variables.call.time  = 0;
						app.variables.call.timer = null;
                    }
                }
		    },

		    callSetParams: function ( params ) {
		    	app.variables.extension.params = params;
		    },
		    callGetParams: function ( ) {
		     	return app.variables.extension.params;
		    },
		    callWatchParams: function ( params ) {

		    },

		    // Message
		    chatLoad: function ( type, user_active_id ) {
		    	var container = app.variables.templates.wrapper.find( '#' + app.settings.chat.container_id ).addClass( 'visible' );

		    	container.find( '[name="chat-form-send-message"]' ).on( 'submit', function ( e ) { e.preventDefault();
		    		var self = $( this );

		    		self.find( '[name="chat-message"]' ).focus( );
		    	});

		    	container.find( '[name="chat-form-send-message"] [name="chat-message"]' ).on( 'input', function ( e ) {
					var self = $( this );

					if ( app.variables.chat.dialog_active_id ) {
						app.variables.chat.dialog_message.typing_time = Date.now( );

					    if ( !app.variables.chat.dialog_message.typing_timer ) {
					        app.methods.chatMessageSendStartTypingStatus( app.variables.chat.dialog_active_id );

					        app.variables.chat.dialog_message.typing_timer = setInterval( function ( ) {
					            if ( ( Date.now( ) - app.variables.chat.dialog_message.typing_time ) / 1000 >= app.settings.chat.dialog.message.typing_timeout ) {
					                app.methods.chatMessageSendStopTypingStatus( app.variables.chat.dialog_active_id );
					            }
					        }, 500 );
					    }
					}
		    	});

		    	container.find( '[name="chat-form-send-message"] [name="chat-message"]' ).on( 'keydown', function ( e ) {
					var self  = $( this );
					var value = self.val( ).trim( );

			        if ( e.keyCode === 13 ) {
			            if ( !e.ctrlKey && !e.shiftKey && !e.metaKey ) { e.preventDefault( );
							var dialog      = app.variables.chat.dialogs[app.variables.chat.dialog_active_id];
							var message     = {};
							var attachments = [];

							if ( !dialog ) {
								var modal_template = _.template( app.settings.templates.modal )({
					            	title: app.settings.messages.no_selected_dialog_title,
					            	content: app.settings.messages.no_selected_dialog_content,
					            	buttons: [
					            		{
						            		text: app.settings.messages.close,
						            		attributes: {
						            			class: 'btn btn-dark',
						            			'data-dismiss': 'modal',
						            		}
						            	}
					            	]
					            });

					            app.variables.templates.modal = $( modal_template );
					            app.variables.templates.modal.appendTo( app.own );
					            app.variables.templates.modal.modal( 'show' );
					            app.variables.templates.modal.on( 'hidden.bs.modal', function ( e ) {
					            	$( this ).remove( );

					            	delete app.variables.templates.modal;
					            });
							}

							message.body      = value;
							message.type      = dialog.type === 3 ? 'chat' : 'groupchat';
							message.markable  = 1;
							message.extension = {
				                dialog_id: dialog.dialog_id,
				                save_to_history: 1,
				            };

						    if ( Object.keys( attachments ).length ) {
						        message.extension.attachments = [];

						        for ( var attach in attachments ) {
						            message.extension.attachments.push({
						            	id: attach,
						            	type: app.settings.chat.dialog.message.attachment.type
						            });
						        }

						        message.body = app.settings.chat.dialog.message.attachment.body;
						    }

						    if ( !message.body ) return false;

						    message = app.methods.chatMessageSend( dialog.dialog_id, message );

						    if ( message.message_id ) {
						    	self.val( '' ).focus( );
						    }
			            }
			        }
			    });

				app.methods.chatDialogLoad( type, user_active_id );
		    },
		    chatDialogLoad: function ( type, user_active_id ) {
				var container = app.variables.templates.wrapper.find( '#' + app.settings.chat.dialog.container_id );
				var limit     = app.settings.chat.dialog.limit;
				var offset    = app.variables.chat.dialogs.length;
				var hash      = location.hash.substr( 1 );
				var user_id   = +user_active_id;

				if ( !_.find( app.variables.chat.users, { id: app.variables.user.id } ) ) {
					app.variables.chat.users.push({
	            		id: app.variables.user.id,
	            		full_name: app.variables.user.full_name,
					});
				}

		    	app.methods.getUserChats( type, offset, limit ).then( function ( dialogs ) {
		            _.each( dialogs.items, function ( dialog ) {
		            	var dialog = app.methods.chatDialogCompile( dialog );

		            	// Add to chat dialogs
		                if ( !app.variables.chat.dialogs[dialog.dialog_id] ) {
		                    app.variables.chat.dialogs[dialog.dialog_id] = dialog;
		                }

						// Add to chat users
						if ( dialog.type === app.settings.chat.dialog.types.chat ) {
							var user_id = dialog.occupants_id_list.filter( function ( id ) { if ( id !== app.variables.user.id ) return id; })[0];

							if ( !_.find( app.variables.chat.users, { id: user_id } ) ) {
			                	app.variables.chat.users.push({
			                		id: user_id,
			                		full_name: dialog.name,
								});
		                	}
		                }

		                // Chat dialog render
		                app.methods.chatDialogRender( dialog );
		            });

		            if ( user_id ) {
						var dialog  = _.find( Object.values( app.variables.chat.dialogs ), function ( dialog ) {
							return dialog.jid_or_user_id == user_id;
						});

		            	if ( dialog ) {
		            		app.variables.templates.chat_dialog_list[dialog.dialog_id].trigger( 'click' );
		            	} else {
			            	new Promise( function( resolve, reject ) {
			            		var user = _.find( app.variables.users, { id: user_id } );

		        				if ( user ) {
					            	resolve( user );
					            } else {
					            	app.methods.getUserById( user_id ).then( function ( user ) {
					            		app.variables.users.push( user );

					            		resolve( user );
					            	}).catch( function ( error ) {
					            		reject( error );
					            	});
					            }
		        			}).then( function ( user ) {
		        				var modal_template = _.template( app.settings.templates.modal )({
					            	title: app.settings.messages.message_create_title.format( user.full_name ),
					            	content: app.settings.messages.message_create_content,
					            	buttons: [
					            		{
						            		text: app.settings.messages.close,
						            		attributes: {
						            			class: 'btn btn-dark',
						            			'data-dismiss': 'modal',
						            		}
						            	},
						            	{
						            		text: app.settings.messages.ok,
						            		attributes: {
						            			class: 'btn btn-primary',
						            			onclick: ( '$( this ).quickblox( \'chatDialogCreate\', %s );' ).format( user.id ),
						            			'data-dismiss': 'modal',
						            		}
						            	}
					            	]
					            });

					            app.variables.templates.modal = $( modal_template );
					            app.variables.templates.modal.appendTo( app.own );
					            app.variables.templates.modal.modal( 'show' );
					            app.variables.templates.modal.on( 'hidden.bs.modal', function ( e ) {
					            	$( this ).remove( );

					            	delete app.variables.templates.modal;
					            });
		        			}).catch( function ( error ) {
			            		var modal_template = _.template( app.settings.templates.modal )({
					            	title: app.settings.messages.user_not_found_title.format( user_id ),
					            	content: app.settings.messages.user_not_found_content,
					            	buttons: [
					            		{
						            		text: app.settings.messages.close,
						            		attributes: {
						            			class: 'btn btn-dark',
						            			'data-dismiss': 'modal',
						            		}
						            	},
					            	]
					            });

					            app.variables.templates.modal = $( modal_template );
					            app.variables.templates.modal.appendTo( app.own );
					            app.variables.templates.modal.modal( 'show' );
					            app.variables.templates.modal.on( 'hidden.bs.modal', function ( e ) {
					            	$( this ).remove( );

					            	delete app.variables.templates.modal;
					            });
			            	});
			            }
		            } else if ( app.variables.templates.chat_dialog_list[hash] ) {
		               	app.variables.templates.chat_dialog_list[hash].trigger( 'click' );
		            } else if ( app.variables.templates.chat_dialog_list[app.variables.chat.dialog_active_id] ){
		               	app.variables.templates.chat_dialog_list[app.variables.chat.dialog_active_id].trigger( 'click' );
		            } else {
		            	app.variables.chat.dialog_active_id = null;
		            }

		            if ( dialogs.items.length < limit ) {
		                container.addClass( 'full' );
		            }

		            container.removeClass( 'loading' );
		    	});
		    },
		    chatDialogCreate: function ( user_id ) {
		    	var params = {
				  	type: app.settings.chat.dialog.types.chat,
				  	occupants_ids: [user_id]
				};

				return new Promise( function( resolve, reject ) {
		    		QB.chat.dialog.create( params, function ( error, dialog ) {
					  	if ( error ) {
					    	reject( error );
					  	} else {
					  		dialog = app.methods.chatDialogCompile( dialog );

					  		// Add to chat dialogs
			                if ( !app.variables.chat.dialogs[dialog.dialog_id] ) {
			                    app.variables.chat.dialogs[dialog.dialog_id] = dialog;
			                }

							// Add to chat users
							if ( dialog.type === app.settings.chat.dialog.types.chat ) {
								var user_id = dialog.occupants_id_list.filter( function ( id ) { if ( id !== app.variables.user.id ) return id; })[0];

								if ( !_.find( app.variables.chat.users, { id: user_id } ) ) {
				                	app.variables.chat.users.push({
				                		id: user_id,
				                		full_name: dialog.name,
									});
			                	}
			                }

					  		app.methods.chatDialogRender( dialog, true ).trigger( 'click' );

					  		resolve( dialog );
					  	}
					});
				});
		    },
		    chatDialogRender: function ( dialog, is_first ) {
				var container = app.variables.templates.wrapper.find( '#' + app.settings.chat.dialog.container_id );
				var limit     = app.settings.chat.dialog.limit;
				var offset    = app.variables.chat.dialogs.length;

				// Check if the templates are object, else create then
				if ( typeof app.variables.templates.chat_dialog_list !== 'object' ) {
	    			app.variables.templates.chat_dialog_list = {};
	    		}

                // Check if the dialog element is already created
    			if ( app.variables.templates.chat_dialog_list[dialog.dialog_id] ) {
    				var dialog_template = app.variables.templates.chat_dialog_list[dialog.dialog_id];

    				dialog_template.find( '#' + app.settings.chat.dialog.last_message.id ).text( dialog.last_message );
	                dialog_template.find( '#' + app.settings.chat.dialog.last_message_date.id ).text( dialog.last_message_sent_on.format( 'ddd, MMM D h:mm a' ) );
	                dialog_template.find( '#' + app.settings.chat.dialog.last_message_counter.id ).text( dialog.messages_unread_cnt );

	                if ( dialog.messages_unread_cnt > 0 ) {
	                	dialog_template.find( '#' + app.settings.chat.dialog.last_message_counter.id ).addClass( 'visible' );
	                } else {
	                	dialog_template.find( '#' + app.settings.chat.dialog.last_message_counter.id ).removeClass( 'visible' );
	                }

	                container.children( ).each( function ( i ) {
	                	var self = $( this );

	                	if ( self[0] == dialog_template[0] && i >= 5 ) {
	                		self.detach( ).prependTo( container );
	                	}
	                });
			    } else {
				    var chat_dialog_list_template = _.template( app.settings.templates.chat_dialog_list )({
				    	dialog: dialog,
						chat_info_last_message_id:  app.settings.chat.dialog.last_message.id,
				    	chat_info_last_message_name_id: app.settings.chat.dialog.last_message_name.id,
						chat_aditional_info_last_message_date_id: app.settings.chat.dialog.last_message_date.id,
						chat_aditional_info_last_message_counter_id:  app.settings.chat.dialog.last_message_counter.id,
				    });
				    app.variables.templates.chat_dialog_list[dialog.dialog_id] = $( chat_dialog_list_template );
				    app.variables.templates.chat_dialog_list[dialog.dialog_id].on( 'click', function ( e ) {
						var self      = $( this );
						var dialog    = app.variables.chat.dialogs[self.data( 'dialog-id' )];
						var container = app.variables.templates.wrapper.find( '#' + app.settings.chat.dialog.message.container_id );

						if ( dialog && dialog.dialog_id !== app.variables.chat.dialog_active_id ) {
							app.variables.chat.dialog_active_id = dialog.dialog_id;

							container.removeClass( 'full' ).empty( ).off( 'scroll' );

							app.methods.chatDialogMessageLoad( dialog.dialog_id );

							container.on( 'scroll', function ( e )  {
								var self   = $( this );
								var dialog = app.variables.chat.dialogs[app.variables.chat.dialog_active_id];

								if ( self.hasClass( 'loading' ) ) return false;

								if ( !dialog.messages_full ) {
									if ( self[0].scrollTop < ( self[0].scrollHeight * 0.25 ) ) {
										app.methods.chatDialogMessageLoad( dialog.dialog_id, true );
									}
								} else {
									self.off( 'scroll' );
								}
							});
						}

						if ( !self.hasClass( 'selected' ) ) {
							self.parent( ).children( ).removeClass( 'selected' );
							self.addClass( 'selected' );
						}

						window.location.hash = dialog.dialog_id;
				    });

				    if ( is_first ) {
				        app.variables.templates.chat_dialog_list[dialog.dialog_id].prependTo( container );
				    } else {
				       	app.variables.templates.chat_dialog_list[dialog.dialog_id].appendTo( container );
				    }
				}

			    return app.variables.templates.chat_dialog_list[dialog.dialog_id];
		    },
		    chatDialogMessageLoad: function ( dialog_id, more ) {
				var container = app.variables.templates.wrapper.find( '#' + app.settings.chat.dialog.message.container_id );
				var dialog    = app.variables.chat.dialogs[dialog_id];
				var limit     = app.settings.chat.dialog.message.limit;
				var offset    = dialog.messages.length;

				container.addClass( 'loading' );

				if ( typeof app.variables.templates.chat_dialog_message_list !== 'object' ) {
					app.variables.templates.chat_dialog_message_list = {};
	    		}

				if ( typeof app.variables.templates.chat_dialog_message_list[dialog.dialog_id] !== 'object' ) {
					app.variables.templates.chat_dialog_message_list[dialog.dialog_id] = {};
				}

				if ( dialog.messages.length > 0 && container.children( ).length <= 0 ) {
					_.each( dialog.messages, function ( message, i ) {
	               		// Chat dialog render old messages
	               		app.methods.chatDialogMessageRender( message );
	               	});

	               	app.helpers.scrollTo( container.removeClass( 'loading' ), 'bottom' );
				}

				if ( dialog.messages_offset == offset ) {
					return false;
				}

				if ( !dialog.messages.length || more ) {
					if ( !dialog.messages_full ) {
						dialog.messages_offset = offset;

			    		app.methods.getUserChatsMessages( dialog.dialog_id, offset, limit ).then( function ( messages ) {
				            if ( dialog.type === 1 ) {
				                // self.checkUsersInPublicDialogMessages( messages.items, offset );
				            } else {
				               	_.each( messages.items, function ( message, i ) {
				               		var message = app.methods.chatDialogMessageCompile( message );

				               		dialog.messages.push( message );

				               		// Chat dialog message render
				               		app.methods.chatDialogMessageRender( message );
				               	});
				            }

				            if ( messages.items.length < limit ) {
				                dialog.messages_full = true;
				                container.addClass( 'full' );
				            }

				            if ( !offset ) {
			                    app.helpers.scrollTo( container, 'bottom' );
			                }

				            container.removeClass( 'loading' );
						});
					}
				}
		    },
		    chatDialogMessageRender: function ( message, is_first ) {
				var container      = app.variables.templates.wrapper.find( '#' + app.settings.chat.dialog.message.container_id );
				var dialog         = app.variables.chat.dialogs[message.dialog_id];
				var sender         = _.find( app.variables.chat.users, { id: message.sender_id } );
				var sender_type    = app.variables.user.id == sender.id;
				var self_readed    = app.methods.chatCheckMessageIsReadedByMe( message );
				var self_delivered = app.methods.chatCheckMessageIsDeliveredToMe( message );

				if ( message.message === app.settings.chat.dialog.message.attachment.body ) {
			        message.message = '';
			    }

			    if ( !self_delivered || ( !sender_type && message.markable ) ) {
					app.methods.chatMessageSendDeliveredStatus( message.message_id, message.sender_id, message.dialog_id );
				}

			    if ( !self_readed || ( !sender_type && message.markable ) ) {
			        app.methods.chatMessageSendReadStatus( message.message_id, message.sender_id, message.dialog_id );

			        if ( dialog.messages_unread_cnt > 0 ) {
			        	dialog.messages_unread_cnt--;
			        }

	               	app.settings.methods.chatDialogRender( dialog );
			    }

				if ( message.notification_type ) {
					// TODO: Notification here
				} else {
					var chat_dialog_message_list_template = _.template( app.settings.templates.chat_dialog_message_list )({
				    	dialog: dialog,
				    	message: message,
				    	sender: sender,
				    	sender_type: sender_type,
						chat_info_message_id: app.settings.chat.dialog.message.id,
				    	chat_info_message_name_id: app.settings.chat.dialog.message.name.id,
						chat_info_message_attachment_container_id: app.settings.chat.dialog.message.attachment.container_id,
				    	chat_aditional_info_message_date_id: app.settings.chat.dialog.message.date.id,
						chat_aditional_info_message_status_id: app.settings.chat.dialog.message.status.id,
				    });

				    app.variables.templates.chat_dialog_message_list[dialog.dialog_id][message.message_id] = $( chat_dialog_message_list_template );
				    app.variables.templates.chat_dialog_message_list[dialog.dialog_id][message.message_id].addClass( message.status_class );

				    if ( is_first ) {
				    	app.variables.templates.chat_dialog_message_list[dialog.dialog_id][message.message_id].appendTo( container );
				    } else {
				    	app.variables.templates.chat_dialog_message_list[dialog.dialog_id][message.message_id].prependTo( container );
				    }
				}

				return app.variables.templates.chat_dialog_message_list[dialog.dialog_id][message.message_id];
			},
			chatDialogMessageListen: function ( user_id, message ) {
		    	if ( user_id === app.variables.user.id ) return false;

				message.sender_id    = user_id;
				message.recipient_id = app.variables.user.id;

				var container = app.variables.templates.wrapper.find( '#' + app.settings.chat.dialog.message.container_id );
				var dialog    = app.variables.chat.dialogs[message.dialog_id];
				var message   = app.settings.methods.chatDialogMessageCompile( message );

			    if ( dialog ) {
			    	var type = dialog.type === 1 ? 'public' : 'chat';

			        dialog.messages.unshift( message );
					dialog.last_message           = message.message;
					dialog.last_message_id        = message.message_id;
					dialog.last_message_sent_on   = message.sent_on;
					dialog.last_message_sent_on_t = message.sent_on_t;

					if ( app.variables.chat.dialog_active_id !== dialog.dialog_id ) {
						dialog.messages_unread_cnt++;
					}

			        if ( message.notification_type ) {
			            // return self.onNotificationMessage( user_id, message );
			        }

					app.settings.methods.chatDialogRender( dialog, true );

		            if ( app.variables.chat.dialog_active_id === dialog.dialog_id ) {
		               	app.settings.methods.chatDialogMessageRender( message, true );
		               	app.helpers.scrollTo( container, 'bottom' );
		            }
			    } else {
			        app.methods.getUserChatById( message.dialog_id ).then( function ( dialog ) {
						var dialog = app.methods.chatDialogCompile( dialog );
						var type   = dialog.type === 1 ? 'public' : 'chat';

			            app.variables.chat.dialogs[dialog.dialog_id] = dialog;
			        	app.settings.methods.chatDialogRender( dialog, true );
			        }).catch( function ( error ) {
			            console.error( error );
			        });
			    }
		    },
		    chatDialogMessageTypingListen: function ( is_typing, user_id, dialog_id ) {
				var dialog        = app.variables.chat.dialogs[dialog_id];
				var dialog_active = app.variables.chat.dialogs[app.variables.chat.dialog_active_id];

		    	if ( ( ( dialog && dialog.dialog_id === dialog_active.dialog_id ) || ( !dialog && dialog_active && dialog_active.jid_or_user_id === user_id ) ) && app.variables.user.id !== user_id ) {
		    		// TODO: Typing status starts here
		    	}
		    },
			chatDialogCompile: function ( dialog ) {
				var dlg = {};

				dlg._id                    = dialog._id;
				dlg.dialog_id              = dialog._id;
				dlg.user_id                = dialog.user_id;
				dlg.name                   = dialog.name;
				dlg.photo                  = dialog.photo;
				dlg.type                   = dialog.type;
				dlg.messages               = dialog.messages || [];
				dlg.messages_full          = false;
				dlg.messages_unread_cnt    = dialog.unread_messages_count;
				dlg.last_message           = dialog.last_message;
				dlg.last_message_fill      = app.helpers.fillMessage( dlg.last_message );
				dlg.last_message_id        = dialog.last_message_id;
				dlg.last_message_user_id   = dialog.last_message_user_id;
				dlg.last_message_sent_on_t = dialog.last_message_date_sent * 1000;
				dlg.last_message_sent_on   = moment( dlg.last_message_sent_on_t );
				dlg.occupants_id_list      = dialog.occupants_ids;
				dlg.created_at             = dialog.created_at || null;
				dlg.updated_at             = dialog.updated_at || null;
				dlg.xmpp_room_jid          = dialog.xmpp_room_jid || null;
				dlg.jid_or_user_id         = dialog.xmpp_room_jid || dialog.jidOrUserId || getRecipientUserId( dialog.occupants_ids );

				function getRecipientUserId ( users ) {
			        if ( users.length === 2 ) {
			            return users.filter( function ( user ) {
			                if ( user !== app.variables.user.id ) {
			                    return user;
			                }
			            })[0];
			        }
			    }

				return dlg;
			},
			chatDialogMessageCompile: function ( message ) {
				var msg = {};

				msg._id               = message._id || message.id;
				msg.dialog_id         = message.chat_dialog_id || message.extension.dialog_id ;
				msg.message_id        = message._id || message.id;
				msg.sender_id         = message.sender_id;
				msg.recipient_id      = message.recipient_id;
				msg.read_id_list      = message.read_ids;

				if ( !msg.read_id_list ) {
					msg.read_id_list = [];

					if ( +msg.sender_id ) {
						msg.read_id_list.push( msg.sender_id );
					}

					if ( +msg.recipient_id ) {
						msg.read_id_list.push( msg.recipient_id );
					}
				}

				msg.delivered_id_list = message.delivered_ids;

				if ( !msg.delivered_id_list ) {
					msg.delivered_id_list = [];

					if ( +msg.sender_id ) {
						msg.delivered_id_list.push( msg.sender_id );
					}

					if ( +msg.recipient_id ) {
						msg.delivered_id_list.push( msg.recipient_id );
					}
				}

				msg.read_cnt          = msg.read_id_list.length;
				msg.delivered_cnt     = msg.delivered_id_list.length;
				msg.type              = message.type || null;
				msg.status            = null;
				msg.status_class      = null;
				msg.message           = message.message || message.body;
				msg.message_fill      = app.helpers.fillMessage( msg.message );
				msg.attachments       = message.attachments || message.extension.attachments || [];
				msg.markable          = message.markable || false;
				msg.created_at        = message.created_at || new Date( ).toISOString( );
				msg.updated_at        = message.updated_at || null;
				msg.sent_on_t         = ( message.date_sent || message.extension.date_sent || new Date( ).getTime( ) / 1000 ) * 1000;
				msg.sent_on           = moment( msg.sent_on_t );
				msg.notification_type = message.notification_type || null;
				msg.original          = message;

				if ( msg.attachments ) {
			        var attachments = msg.attachments;

			        for ( var a = 0; a < attachments.length; a++ ) {
			            attachments[a].src = QB.content.publicUrl( attachments[a].id ) + '.json?token=' + app.settings.session.token;
			        }
			    }

			    if ( msg.sender_id === app.variables.user.id ) {
			    	if ( this.chatCheckMessageIsDeliveredToOccupants( msg ) ) {
			    		if ( this.chatCheckMessageIsReadedByOccupants( msg ) ) {
							msg.status       = app.settings.messages.message_status_seen;
							msg.status_class = app.settings.chat.dialog.message.status.class.seen;
			    		} else {
							msg.status       = app.settings.messages.message_status_recieved;
							msg.status_class = app.settings.chat.dialog.message.status.class.recieved;
			    		}
			    	} else {
						msg.status       = app.settings.messages.message_status_sent;
						msg.status_class = app.settings.chat.dialog.message.status.class.sent;
			    	}
			    }

				return msg;
		    },
		    chatMessageSend: function ( dialog_id, message ) {
				var container   = app.variables.templates.wrapper.find( '#' + app.settings.chat.dialog.message.container_id );
				var dialog      = app.variables.chat.dialogs[dialog_id];
				var message_str = JSON.parse( JSON.stringify( message ));

				message.id        = QB.chat.send( dialog.jid_or_user_id, message_str );
				message.sender_id = app.variables.user.id;
				message           = app.methods.chatDialogMessageCompile( message );

				dialog.last_message           = message.message;
				dialog.last_message_id        = message.message_id;
				dialog.last_message_sent_on   = message.sent_on;
				dialog.last_message_sent_on_t = message.sent_on_t;
				dialog.messages.unshift( message );

				app.settings.methods.chatDialogRender( dialog, true );

	            if ( app.variables.chat.dialog_active_id === dialog._id ) {
	               	app.settings.methods.chatDialogMessageRender( message, true );
	               	app.helpers.scrollTo( container, 'bottom' );
	            }

	            return message;
			},
			chatMessageSentListen: function ( message_lost, message_sent ) {
				var message = app.methods.chatDialogMessageCompile( message_lost || message_sent );

				if ( app.variables.chat.dialogs[message.dialog_id] ) {
					var message = _.find( app.variables.chat.dialogs[message.dialog_id].messages, { message_id: message.message_id } );

					if ( message ) {
						if ( message_lost ) {
					        // Message was not sent to the chat.
					        message.status = app.settings.messages.message_status_missed;
					        app.variables.templates.chat_dialog_message_list[message.dialog_id][message.message_id].addClass( app.settings.chat.dialog.message.status.class.missed );
					    } else {
					        // Message was sent to the chat but not delivered to che opponent.
					        message.status = app.settings.messages.message_status_sent;
					        app.variables.templates.chat_dialog_message_list[message.dialog_id][message.message_id].addClass( app.settings.chat.dialog.message.status.class.sent );
					    }

						app.variables.templates.chat_dialog_message_list[message.dialog_id][message.message_id].find( '#' + app.settings.chat.dialog.message.status.id ).text( message.status );
					}
				}
		    },
			chatMessageDeliveredStatusListen: function ( message_id, dialog_id, user_id ) {
				if ( app.variables.chat.dialogs[dialog_id] ) {
					var message = _.find( app.variables.chat.dialogs[dialog_id].messages, { message_id: message_id } );

					if ( message ) {
						message.status = app.settings.messages.message_status_recieved;
						app.variables.templates.chat_dialog_message_list[message.dialog_id][message.message_id].addClass( app.settings.chat.dialog.message.status.class.recieved );
						app.variables.templates.chat_dialog_message_list[message.dialog_id][message.message_id].find( '#' + app.settings.chat.dialog.message.status.id ).text( message.status );
					}
				}
		    },
			chatMessageReadStatusListen: function ( message_id, dialog_id, user_id ) {
				if ( app.variables.chat.dialogs[dialog_id] ) {
					var message = _.find( app.variables.chat.dialogs[dialog_id].messages, { message_id: message_id } );

					if ( message ) {
						message.status = app.settings.messages.message_status_seen;
						app.variables.templates.chat_dialog_message_list[message.dialog_id][message.message_id].addClass( app.settings.chat.dialog.message.status.class.seen );
						app.variables.templates.chat_dialog_message_list[message.dialog_id][message.message_id].find( '#' + app.settings.chat.dialog.message.status.id ).text( message.status );
					}
				}
		    },

		    setMainVideo: function ( user_id ) {
		    	var self = $( this ),
                activeClass = [];

	            if ( app.variables.session.peerConnections[user_id].stream && !self.srcObject ) {
					if ( app.variables.session.callType === QB.webrtc.CallType.AUDIO ) {
		            	app.own.addClass( 'has-audio' );
		            }

	            	if ( app.variables.session.callType === QB.webrtc.CallType.VIDEO ) {
		            	app.own.addClass( 'has-audio has-video' );
		            }

	                if ( self.hasClass( 'active' ) ) {
	                    self.removeClass( 'active' );

	                    app.variables.session.detachMediaStream( app.settings.video.main.id );
	                    app.variables.video.main.user_id = null;
	                } else {
	                    $( '.call-video' ).removeClass( 'active' );
	                    self.addClass( 'active' );

	                    app.variables.session.attachMediaStream( app.settings.video.main.id, app.variables.session.peerConnections[user_id].stream );
	                    app.variables.video.main.user_id = user_id;
	                }
	            }
		    },
		    fillMediaDevices: function ( ) {
	        	return new Promise( function( resolve, reject ) {
	        		var audio_source = $( '[name="' + app.settings.audio.source.name + '"]' );
					var video_source = $( '[name="' + app.settings.video.source.name + '"]' );

	        		app.variables.audio.available = false;
	        		app.variables.video.available = false;

	        		audio_source.prop( 'disabled', !app.variables.video.available );
	        		video_source.prop( 'disabled', !app.variables.video.available );

		        	navigator.mediaDevices.getUserMedia({
			            audio: true,
			        }).then( function ( stream ) {
			        	new Promise( function( resolve, reject ) {
							$( app.own ).quickblox( 'setMediaDevices', audio_source );

							app.variables.audio.available = true;

							audio_source.prop( 'disabled', !app.variables.audio.available );

						 	resolve( );
			            }).then( function ( ) {
							stream.getTracks( ).forEach( function ( track ) {
				                track.stop( );
				            });

				            navigator.mediaDevices.getUserMedia({
					            video: true
					        }).then( function ( stream ) {
					        	new Promise( function( resolve, reject ) {
									$( app.own ).quickblox( 'setMediaDevices', video_source, true );

									app.variables.video.available = true;

									video_source.prop( 'disabled', !app.variables.video.available );

								 	resolve( );
					            }).then( function ( ) {
									stream.getTracks( ).forEach( function ( track ) {
						                track.stop( );
						            });

						            resolve( );
					            });
							}).catch( function ( error ) {
					            console.warn( 'Video devices is not available.', error );
					        });
			            });
					}).catch( function ( error ) {
			            console.warn( 'Audio devices is not available.', error );

						var modal_template = _.template( app.settings.templates.modal )({
			            	title: app.settings.messages.no_microphone_title,
			            	content: app.settings.messages.no_microphone_content,
			            	buttons: [
			            		{
				            		text: app.settings.messages.close,
				            		attributes: {
				            			class: 'btn btn-dark',
				            			'data-dismiss': 'modal',
				            		}
				            	}
			            	]
			            });

			            app.variables.templates.modal = $( modal_template );
			            app.variables.templates.modal.appendTo( app.own );
			            app.variables.templates.modal.modal( 'show' );
			            app.variables.templates.modal.on( 'hidden.bs.modal', function ( e ) {
			            	$( this ).remove( );

			            	delete app.variables.templates.modal;
			            });
			        });

					resolve( );
			    });
	        },
		    toggleMediaDevices: function ( device ) {
		    	var self = $( this );

		    	if ( _.isEmpty( app.variables.session ) ) {
	               	return false;
	           	} else {
	               	if ( self.hasClass( 'active' ) ) {
	                   console.log( 'mute video' );
	                   self.removeClass( 'active' );
	                   app.variables.session.mute( device );
	               	} else {
	               		console.log( device );
	                   	self.addClass( 'active' );
	                   	app.variables.session.unmute( device );
	               	}
       			}
		    },
		    onBeforeLoad: function ( ) { return true; },
	    	onAfterLoad: function ( ) { return true; },
		},
		helpers: {
		    scrollTo: function ( element, position ) {
				var height        = element[0].offsetHeight;
				var height_scroll = element[0].scrollHeight;

			    if ( position === 'bottom' ) {
			        if ( ( height_scroll - height ) > 0 ) {
			            element.scrollTop( height_scroll );
			        }
			    } else if ( position === 'top' ) {
			        element.scrollTop( 0 );
			    } else if ( +position ) {
			        element.scrollTop( +position );
			    }
		    },
		    fillMessage: function ( str ) {
		    	var URL_REGEXP = /https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s\^\'\"\<\>\(\)]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s\^\'\"\<\>\(\)]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s\^\'\"\<\>\(\)]{2,}|www\.[a-zA-Z0-9]\.[^\s\^\'\"\<\>\(\)]{2,}/g;

		    	str = _.escape( str ).replace( URL_REGEXP, function ( match ) {
			        var url = (/^[a-z]+:/i).test( match ) ? match : 'https://' + match;

			        return '<a href="' + _.escape( url ) + '" target="_blank">' + _.escape( match ) + '</a>';
			    });

			    return str;
		    },
		}
	};

	app.variables = {
		user: null,
		users: [],
		session: null,
		extension: {
			p: null,
			get params ( ) {
			    return this.p;
			},
			set params ( v ) {
			    this.p = v;
			    app.methods.callWatchParams( v );
			},
		},
		network: {},
		connection: null,
		templates: {},
		video: {
        	available: false,
        	main: {
        		user_id: null
        	},
        	local: {
        		user_id: null
        	},
        	remote: {
        		cnt: 0,
        		list: [],
        	},
        },
        audio: {
        	available: false,
        },
		call: {
			users: {
    			answered: [],
    			rejected: [],
    		},
            time: 0,
            timer: null,
            updateTimer: function ( ) {
                this.time += 1000;

                $( '.call-timer' ).text( new Date( this.time ).toUTCString( ).split( / / )[4] );
            }
        },
        chat: {
        	users: [],
        	dialogs: [],
        	dialog_active_id: false,
        	dialog_message: {
        		typing_time: 0,
        		typing_timer: null,
        	}
        },
	};

	app.methods = {
        init: function ( opts ) {
			app.own              = this;
			app.settings         = $.extend( true, app.settings, opts );
			app.methods.onBeforeLoad( );

        	var wrapper_template = _.template( app.settings.templates.wrapper )({
        		video_main_id: app.settings.video.main.id,
        		video_main_container_id: app.settings.video.main.container_id,
        		video_local_id: app.settings.video.local.id,
        		video_local_container_id: app.settings.video.local.container_id,
        		video_remote_container_id: app.settings.video.remote.container_id,
        		call_start_signal: app.settings.call.sounds.start,
        		call_ring_signal: app.settings.call.sounds.ring,
        		call_end_signal: app.settings.call.sounds.end,
        		call_setting_id: app.settings.call.setting.id,
        		chat_container_id: app.settings.chat.container_id,
        		chat_dialog_list_container_id: app.settings.chat.dialog.container_id,
				chat_dialog_message_list_container_id: app.settings.chat.dialog.message.container_id,
        	});
        	app.variables.templates.wrapper = $( wrapper_template );
        	app.variables.templates.wrapper.appendTo( app.own ).fadeIn( );

        	var setting_template = _.template( app.settings.templates.modal )({
        		id: app.settings.call.setting.id,
        		title: app.settings.messages.setting_title,
        		content: _.template( app.settings.templates.setting )({
        			chat_audio_source_name: app.settings.audio.source.name,
					chat_video_source_name: app.settings.video.source.name,
        			setting_message_container_id: app.settings.call.setting.message.id,
        		}),
        		buttons: [
            		{
	            		text: app.settings.messages.close,
	            		attributes: {
	            			class: 'btn btn-dark',
	            			'data-dismiss': 'modal',
	            		}
	            	},
	            	{
	            		text: app.settings.messages.save,
	            		attributes: {
	            			class: 'btn btn-primary',
	            			onclick: '$( this ).quickblox( \'switchMediaDevices\' )',
	            		}
	            	}
            	]
        	});
        	app.variables.templates.setting = $( setting_template );
        	app.variables.templates.setting.appendTo( app.own );
        	app.variables.templates.setting.on( 'hide.bs.modal', function ( ) {
        		$( this ).find( '#' + app.settings.call.setting.message.id ).empty( );
        	});

        	for ( var sound_key in app.settings.call.sounds ) {
        		app.settings.call.sounds[sound_key] = document.getElementById( app.settings.call.sounds[sound_key] );
			};

	        QB.init(
	        	app.settings.app_id,
	        	app.settings.app_auth_key,
	        	app.settings.app_auth_secret,
	        	app.settings.app_config
	        );

	        app.variables.connection = _.invert( QB.webrtc.PeerConnectionState );

	        // Check internet connection
	        if ( !window.navigator.onLine ) {
	        	var modal_template = _.template( app.settings.templates.modal )({
	        		title: app.settings.messages.no_internet_title,
	        		content: app.settings.messages.no_internet_content,
	        		buttons: [
	            		{
		            		text: app.settings.messages.close,
		            		attributes: {
		            			class: 'btn btn-dark',
		            			'data-dismiss': 'modal',
		            		}
		            	}
	            	]
	        	});
	        	app.variables.templates.modal = $( modal_template );
	            app.variables.templates.modal.appendTo( app.own );
	            app.variables.templates.modal.modal( 'show' );
	            app.variables.templates.modal.on( 'hidden.bs.modal', function ( e ) {
	            	$( this ).remove( );

	            	delete app.variables.templates.modal;
	            });
	            return false;
	        }

	        // Check WebRTC is avaible
	        if ( !QB.webrtc ) {
	            var modal_template = _.template( app.settings.templates.modal )({
	        		title: app.settings.messages.no_webrtc_title,
	        		content: app.settings.messages.no_webrtc_content,
	        		buttons: [
	            		{
		            		text: app.settings.messages.close,
		            		attributes: {
		            			class: 'btn btn-dark',
		            			'data-dismiss': 'modal',
		            		}
		            	}
	            	]
	        	});
	        	app.variables.templates.modal = $( modal_template );
	            app.variables.templates.modal.appendTo( app.own );
	            app.variables.templates.modal.modal( 'show' );
	            app.variables.templates.modal.on( 'hidden.bs.modal', function ( e ) {
	            	$( this ).remove( );

	            	delete app.variables.templates.modal;
	            });
	            return false;
	        }

	        app.methods.fillMediaDevices( ).then( function ( ) {
		        if ( app.settings.app_login.room && app.settings.app_login.login && app.settings.app_login.password && app.settings.app_login.name ) {
			        app.methods.login({
			        	room: app.settings.app_login.room,
			        	login: app.settings.app_login.login,
			        	password: app.settings.app_login.password,
			        	name: app.settings.app_login.name,
			        }).then( function ( user ) {
			        	init( );
			        });
			    } else {
		    		init( );
			    }
		    });
        },
        login: function ( data ) {
        	if ( app.settings.app_login.room !== data.room  ) {
        		app.settings.app_login.room = data.room;
        	}

        	var login = new Promise( function ( resolve, reject ) {
	            // Create QuickBlox Session
            	QB.createSession( function ( error, session ) {
	                if ( error ) {
	                	reject( error );
	                } else {
	                	app.settings.session = session;

	                	// Login to QuickBlox
	                	QB.login({ login: data.login, password: data.password }, function ( error, user ) {
	                        if ( error ) {
	                            // If the user not exists, create account
	                            QB.users.create({
	                                'login': data.login,
	                                'password': data.password,
	                                'full_name': data.name,
	                                'tag_list': data.room,
	                            }, function( error, user ) {
	                                if ( error ) {
	                                    console.log( 'QUICKBLOX [Create User] ERROR:', error );
	                                    reject( error );
	                                } else {
	                                    QB.login({ login: data.login, password: data.password }, function ( error, user ) {
	                                        if ( error ) {
	                                            console.log( 'QUICKBLOX [Relogin User] ERROR:', error );
	                                            reject( error );
	                                        } else {
	                                        	app.settings.session.user_id = user.id;
	                                        	localStorage.setItem( 'QUICKBLOX_SESSION', JSON.stringify( app.settings.session ) );
	                                            resolve( user );
	                                        }
	                                    });
	                                }
	                            });
	                        } else {
	                            // If the user exists, update account
	                            if ( user.user_tags !== data.room || user.full_name !== data.name ) {
	                                QB.users.update( user.id, {
	                                    'full_name': data.name,
	                                    'tag_list': data.room,
	                                }, function ( error, user ) {
	                                    if ( error ) {
	                                        console.log( 'QUICKBLOX [Update User] ERROR:', error );
	                                        reject( error );
	                                    } else {
	                                    	app.settings.session.user_id = user.id;
	                                       	localStorage.setItem( 'QUICKBLOX_SESSION', JSON.stringify( app.settings.session ) );
	                                        resolve( user );
	                                    }
	                                });
	                            } else {
	                            	app.settings.session.user_id = user.id;
	                                localStorage.setItem( 'QUICKBLOX_SESSION', JSON.stringify( app.settings.session ) );
	                                resolve( user );
	                            }
	                        }
	                    });
	                }
	            });
	        });

	        login.then( function ( user ) {
	        	app.variables.user = user;
	        	app.variables.users.push( user );

	        	QB.chat.connect({
	                jid: QB.chat.helpers.getUserJid( app.variables.user.id, app.variables.appId ),
	                password: data.password,
	            }, function( error, result ) {
	                if ( error ) {
	                    if ( !_.isEmpty( app.variables.session ) ) {
	                        app.variables.session.stop({});
	                        app.variables.session = {};
	                    }

	                    if ( app.variables.call.timer ) {
	                        clearInterval( app.variables.call.timer );
	                        app.variables.call.time = 0;
	                        app.variables.call.timer = null;
	                    }
	                } else {
	                    localStorage.setItem( 'isQuickBloxAuth', true );
	                }
	            });
	        }).catch( function ( error ) {
	            console.error( 'QUICKBLOX [Chat Connect] ERROR:', error );
	        });

	        return login;
        },
        getMediaDevices: function ( kind ) {
            return new Promise( function ( resolve, reject ) {
                QB.webrtc.getMediaDevices( kind ).then( function( devices ) {
                    var devices_list = [];

                    if ( devices.length ) {
                        for ( var i = 0; i !== devices.length; ++i ) {
                            var device = devices[i];

                            if ( device.kind === kind ) {
                                devices_list.push( device );
                            }
                        }
                    }

                    resolve( devices_list );
                }).catch( function ( error ) {
                    console.warn( 'QUICKBLOX [getMediaDevices] ERROR:', error );

                    reject( error );
                });
            });
        },
        setMediaDevices: function ( input, is_video_input ) {
        	if ( typeof input === 'undefined' ) {
        		console.warn( 'QUICKBLOX [setMediaDevices] ERROR:', 'input is undefined.' ); return;
        	}

        	app.methods.getMediaDevices( ( is_video_input ? 'videoinput' : 'audioinput' ) ).then( function ( devices ) {
				input.empty( );

				if ( devices.length ) {
                    for ( var i = 0; i !== devices.length; ++i ) {
                        var device = devices[i];
                        var option = document.createElement( 'option' );

						option.value = device.deviceId;
						option.text  = device.label || ( is_video_input ? 'Camera ' : 'Mic ' ) + ( i + 1 );

						input.append( option );
					}
				}
			});
        },
        switchMediaDevices: function (  ) {
        	var audio_source = $( '[name="' + app.settings.audio.source.name + '"]' );
			var video_source = $( '[name="' + app.settings.video.source.name + '"]' );
			var alert_container = app.variables.templates.setting.find( '#' + app.settings.call.setting.message.id );

            if ( !app.variables.session ) {
				var alert_template  = _.template( app.settings.templates.alert )({
            		type: app.settings.call.setting.message.success,
            		message: app.settings.messages.setting_success,
            	});

            	alert_container.empty( );
            	alert_template = $( alert_template );
            	alert_template.appendTo( alert_container );

                return true;
            }

            var audio_device_id = audio_source.val( ) ? audio_source.val( ) : false;
            var video_device_id = video_source.val( ) ? video_source.val( ) : false;
            var device = {
                audio: audio_device_id,
                video: video_device_id
            };

            var callback = function ( error, stream ) {
                if ( error || !stream.getAudioTracks( ).length || ( app.variables.session.callType === QB.webrtc.CallType.AUDIO ? false : !stream.getVideoTracks( ).length ) ) {
                    app.variables.session.stop({});
                    console.error( 'Error on switching media devices.', error );

					var alert_template  = _.template( app.settings.templates.alert )({
	            		type: app.settings.call.setting.message.error,
	            		message: app.settings.messages.setting_error,
	            	});

	            	alert_container.empty( );
	            	alert_template = $( alert_template );
	            	alert_template.appendTo( alert_container );
                } else {
					var alert_template  = _.template( app.settings.templates.alert )({
	            		type: app.settings.call.setting.message.success,
	            		message: app.settings.messages.setting_success,
	            	});

	            	alert_container.empty( );
	            	alert_template = $( alert_template );
	            	alert_template.appendTo( alert_container );
                }
            };

            app.variables.session.switchMediaTracks( device, callback );
        },
        getUser: function ( ) {
        	return app.variables.user;
        },
        getUserById: function ( user_id ) {
	        return new Promise( function( resolve, reject ) {
	        	var user = _.find( app.variables.users, { id: user_id } )

	        	if ( user ) {
	        		resolve( user );
	        	} else {
	        		QB.users.get( user_id, function ( error, user ) {
		                if ( error ) {
		                    reject( error );
		                } else {
		                    resolve( user );
		                }
		            });
	        	}
	        });
	    },
	    getUsersById: function ( user_id, offset, limit ) {
	    	var params = {
	    		page: offset ? offset : 1,
	    		per_page: limit ? limit : 10,
	    		filter: {
		    		field: 'id',
		    		param: 'in',
		    		value: []
			    }
			};

			if ( typeof user_id === 'array' ) {
				params.filter.value = user_id;
			} else if ( typeof user_id === 'object' ) {
				params.filter.value = Object.values( user_id );
			} else {
				params.filter.value.push( user_id );
			}

	    	return new Promise( function( resolve, reject ) {
		    	QB.users.listUsers( params, function( error, users ) {
				  	if ( error ) {
					    reject( error );
					} else {
					    resolve( users );
					}
				});
			});
	    },
	    getUserChats: function ( type, offset, limit ) {
	    	var params = {
	            limit: limit,
	            skip: offset,
	            sort_desc: 'updated_at'
	        };

	        return new Promise( function ( resolve, reject ) {
		        if ( type === 'chat' ) {
		            params['type[in]'] = [app.settings.chat.dialog.types.chat, app.settings.chat.dialog.types.group_chat].join( ',' );
		        } else {
		            params.type = app.settings.chat.dialog.types.chat_public;
		        }

		        QB.chat.dialog.list( params, function ( error, dialogs ) {
		            if ( !error ) {
			            resolve( dialogs );
		            } else {
		            	reject( error );
		            }
		        });
		    });
	    },
	    getUserChatById: function ( dialog_id ) {
		    return new Promise ( function( resolve, reject ) {
		        QB.chat.dialog.list( { '_id': dialog_id }, function ( error, dialog ) {
		            if ( !error ) {
		            	var dialog = dialog.items[0];

			            if ( dialog ) {
			                resolve( dialog );
			            } else {
			                reject( new Error( 'Can\'t find dialog with this ID: ' + id ) );
			            }
		            } else {
		                reject( error );
		            }
		        });
		    });
		},
	    getUserChatsMessages: function ( dialog_id, offset, limit ) {
	    	var params = {
	            chat_dialog_id: dialog_id,
	            sort_desc: 'date_sent',
	            limit: limit,
	            skip: offset,
	            mark_as_read: 0,
	        };

	        return new Promise( function ( resolve, reject ) {
			    QB.chat.message.list( params, function ( error, messages ) {
			        if ( !error ) {
			            resolve( messages );
			        } else {
			        	reject( error );
			        }
			    });
		    });
	    },
	    getUserChatsMessagesTotalUnread: function (  ) {
	    	return new Promise( function ( resolve, reject ) {
		    	QB.chat.message.unreadCount( {}, function ( error, result ) {
				  	if ( error ) {
				 		resolve( error );
				  	} else {
				 		resolve( result.total );
				  	}
				});
			});
	    },

	    chatDialogCreate: function ( ) { this.app = app; return app.settings.methods.chatDialogCreate.apply( this, arguments ); },
	    chatMessageSend: function ( ) { this.app = app; return app.settings.methods.chatMessageSend.apply( this, arguments ); },
	    chatMessageSentListen: function ( ) { this.app = app; return app.settings.methods.chatMessageSentListen.apply( this, arguments ); },
		chatMessageDeliveredStatusListen: function ( ) { this.app = app; return app.settings.methods.chatMessageDeliveredStatusListen.apply( this, arguments ); },
		chatMessageReadStatusListen: function ( ) { this.app = app; return app.settings.methods.chatMessageReadStatusListen.apply( this, arguments ); },
		chatMessageSendReadStatus: function ( message_id, user_id, dialog_id ) {
		    QB.chat.sendReadStatus({
		        messageId: message_id,
		        userId: user_id,
		        dialogId: dialog_id
		    });
		},
		chatMessageSendDeliveredStatus: function ( message_id, user_id, dialog_id ) {
		    QB.chat.sendDeliveredStatus({
		        messageId: message_id,
		        userId: user_id,
		        dialogId: dialog_id
		    });
		},
		chatMessageSendStartTypingStatus: function ( dialog_id ) {
			var dialog = app.variables.chat.dialogs[dialog_id];

			QB.chat.sendIsTypingStatus( dialog.jid_or_user_id );
		},
		chatMessageSendStopTypingStatus: function ( dialog_id ) {
			var dialog = app.variables.chat.dialogs[dialog_id];

			QB.chat.sendIsStopTypingStatus( dialog.jid_or_user_id );

		    clearInterval( app.variables.chat.dialog_message.typing_timer );

			app.variables.chat.dialog_message.typing_time  = 0;
			app.variables.chat.dialog_message.typing_timer = null;
		},
		chatCheckMessageIsReadedByMe: function ( message ) {
		    return message.read_id_list.some( function ( id ) {
	            return id === app.variables.user.id;
	        });
		},
		chatCheckMessageIsReadedByOccupants: function ( message ) {
		    return message.read_id_list.some( function ( id ) {
	            return id !== app.variables.user.id;
	        });
		},
		chatCheckMessageIsDeliveredToMe: function ( message ) {
		    return message.delivered_id_list.some( function ( id ) {
	            return id === app.variables.user.id;
	        });
		},
		chatCheckMessageIsDeliveredToOccupants: function ( message ) {
		    return message.delivered_id_list.some( function ( id ) {
	            return id !== app.variables.user.id;
	        });
		},

	    call: function ( ) { this.app = app; return app.settings.methods.call.apply( this, arguments ); },
	    callEnd: function ( ) { this.app = app; return app.settings.methods.callEnd.apply( this, arguments ); },
	    callAccept: function ( ) { this.app = app; return app.settings.methods.callAccept.apply( this, arguments ); },
	    callDecline: function ( ) { this.app = app; return app.settings.methods.callDecline.apply( this, arguments ); },

	    callListen: function ( ) { this.app = app; return app.settings.methods.callListen.apply( this, arguments ); },
	    callStatus: function ( ) { this.app = app; return app.settings.methods.callStatus.apply( this, arguments ); },
	    callStream: function ( ) { this.app = app; return app.settings.methods.callStream.apply( this, arguments ); },
	    callSession: function ( ) { this.app = app; return app.settings.methods.callSession.apply( this, arguments ); },

	    callUpdate: function ( ) { this.app = app; return app.settings.methods.callUpdate.apply( this, arguments ); },
	    callReject: function ( ) { this.app = app; return app.settings.methods.callReject.apply( this, arguments ); },
	    callAnswered: function ( ) { this.app = app; return app.settings.methods.callAnswered.apply( this, arguments ); },
	    callUnanswered: function ( ) { this.app = app; return app.settings.methods.callUnanswered.apply( this, arguments ); },
	    callStop: function ( ) { this.app = app; return app.settings.methods.callStop.apply( this, arguments ); },
	    callClose: function ( ) { this.app = app; return app.settings.methods.callClose.apply( this, arguments ); },

	    callSetParams: function ( ) { this.app = app; return app.settings.methods.callSetParams.apply( this, arguments ); },
	    callGetParams: function ( ) { this.app = app; return app.settings.methods.callGetParams.apply( this, arguments ); },
	    callWatchParams: function ( ) { this.app = app; return app.settings.methods.callWatchParams.apply( this, arguments ); },

	    chatLoad: function ( ) { this.app = app; return app.settings.methods.chatLoad.apply( this, arguments ); },
	    chatDialogLoad: function ( ) { this.app = app; return app.settings.methods.chatDialogLoad.apply( this, arguments ); },
	    chatDialogRender: function ( ) { this.app = app; return app.settings.methods.chatDialogRender.apply( this, arguments ); },
	    chatDialogMessageLoad: function ( ) { this.app = app; return app.settings.methods.chatDialogMessageLoad.apply( this, arguments ); },
	    chatDialogMessageListen: function ( ) { this.app = app; return app.settings.methods.chatDialogMessageListen.apply( this, arguments ); },
	    chatDialogMessageTypingListen: function ( ) { this.app = app; return app.settings.methods.chatDialogMessageTypingListen.apply( this, arguments ); },
	    chatDialogMessageRender: function ( ) { this.app = app; return app.settings.methods.chatDialogMessageRender.apply( this, arguments ); },
	    chatDialogCompile: function ( ) { this.app = app; return app.settings.methods.chatDialogCompile.apply( this, arguments ); },
	    chatDialogMessageCompile: function ( ) { this.app = app; return app.settings.methods.chatDialogMessageCompile.apply( this, arguments ); },

	    setMainVideo: function ( ) { this.app = app; return app.settings.methods.setMainVideo.apply( this, arguments ); },
	    fillMediaDevices: function ( ) { this.app = app; return app.settings.methods.fillMediaDevices.apply( this, arguments ); },
	    toggleMediaDevices: function ( ) { this.app = app; return app.settings.methods.toggleMediaDevices.apply( this, arguments ); },
	    onBeforeLoad: function ( ) { this.app = app; return app.settings.methods.onBeforeLoad.apply( this, arguments ); },
	    onAfterLoad: function ( ) { this.app = app; return app.settings.methods.onAfterLoad.apply( this, arguments ); },
    };

    app.helpers = {
    	scrollTo: function ( ) { this.app = app; return app.settings.helpers.scrollTo.apply( this, arguments ); },
    	fillMessage: function ( ) { this.app = app; return app.settings.helpers.fillMessage.apply( this, arguments ); },
    };

    $.fn.quickblox = function ( method_or_options ) {
        if ( app.methods[method_or_options] ) {
            return app.methods[method_or_options].apply( this, Array.prototype.slice.call( arguments, 1 ) );
        } else if ( typeof method_or_options === 'object' || !method_or_options ) {
            return app.methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method_or_options + ' does not exist on jQuery.quickblox' );
        }
    };

    function init ( ) {
    	console.log( 'INITIALIZE QUICKBLOX' );
    	/**
         * QB Event listener.
         *
         * [Recommendation]
         * We recomend use Function Declaration
         * that SDK could identify what function(listener) has error
         *
         * Chat:
         * - onMessageListener
		 * - onMessageErrorListener (messageId, error)
		 * - onSentMessageCallback(messageLost, messageSent)
		 * - onMessageTypingListener
		 * - onDeliveredStatusListener (messageId, dialogId, userId);
		 * - onReadStatusListener (messageId, dialogId, userId);
		 *
		 * - onSystemMessageListener (message)
		 * - onContactListListener (userId, type)
		 *
		 * - onSubscribeListener (userId)
		 * - onConfirmSubscribeListener (userId)
		 * - onRejectSubscribeListener (userId)
		 * - onReconnectListener
		 * - onReconnectFailedListener
		 * - onDisconnectedListener
         *
         * WebRTC:
         * - onCallListener ( session, extension )
         * - onCallStatsReport ( session, user_id, stats, error )
         * - onUpdateCallListener ( session, user_id, extension )
         *
         * - onAcceptCallListener ( session, user_id, extension )
         * - onRejectCallListener ( session, user_id, extension )
         * - onUserNotAnswerListener ( session, user_id )
         * - onStopCallListener ( session, user_id, extension )
         *
         * - onRemoteStreamListener ( session, user_id, stream )
         * - onSessionCloseListener ( session )
         * - onSessionConnectionStateChangedListener ( session, user_id, connection_state )
         * - onDevicesChangeListener
         */

        // CHAT =============================================================================================================================================================
        QB.chat.onMessageListener = function ( user_id, message ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onMessageListener.' );
	                console.log( 'User ID:', user_id );
	                console.log( 'Message:', message );
	                console.log( 'Arguments:', arguments );
	            console.groupEnd( );
	        }

	        app.methods.chatDialogMessageListen.apply( app, arguments );
        };

        QB.chat.onMessageErrorListener = function ( message_id, error ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onMessageErrorListener.' );
	                console.log( 'Message ID:', message_id );
	                console.log( 'Error:', error );
	                console.log( 'Arguments:', arguments );
	            console.groupEnd( );
	        }
        };

        QB.chat.onSentMessageCallback = function ( message_lost, message_sent ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onSentMessageCallback.' );
	                console.log( 'Message Lost:', message_lost );
	                console.log( 'Message Sent:', message_sent );
	                console.log( 'Arguments:', arguments );
	            console.groupEnd( );
	        }

	        app.methods.chatMessageSentListen.apply( app, arguments );
        };

        QB.chat.onMessageTypingListener = function ( is_typing, user_id, dialog_id ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onMessageTypingListener.' );
	                console.log( 'Typing Status:', is_typing );
	                console.log( 'User ID:', user_id );
	                console.log( 'Dialog ID:', dialog_id );
	                console.log( 'Arguments:', arguments );
	            console.groupEnd( );
	        }

	        app.methods.chatDialogMessageTypingListen.apply( app, arguments );
        };

        QB.chat.onDeliveredStatusListener = function ( message_id, dialog_id, user_id ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onDeliveredStatusListener.' );
	                console.log( 'Message ID:', message_id );
	                console.log( 'Dialog ID:', dialog_id );
	                console.log( 'User ID:', user_id );
	                console.log( 'Arguments:', arguments );
	            console.groupEnd( );
	        }

	        app.methods.chatMessageDeliveredStatusListen.apply( app, arguments );
        };

        QB.chat.onReadStatusListener = function ( message_id, dialog_id, user_id ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onReadStatusListener.' );
	                console.log( 'Message ID:', message_id );
	                console.log( 'Dialog ID:', dialog_id );
	                console.log( 'User ID:', user_id );
	                console.log( 'Arguments:', arguments );
	            console.groupEnd( );
	        }

	        app.methods.chatMessageReadStatusListen.apply( app, arguments );
        };


        QB.chat.onSystemMessageListener = function ( message ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onSystemMessageListener.' );
	                console.log( 'Message:', message );
	                console.log( 'Arguments:', arguments );
	            console.groupEnd( );
	        }
        };

        QB.chat.onContactListListener = function ( user_id, type ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onContactListListener.' );
	                console.log( 'User ID:', user_id );
	                console.log( 'Type:', type );
	                console.log( 'Arguments:', arguments );
	            console.groupEnd( );
	        }
        };


        QB.chat.onSubscribeListener = function ( user_id ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onSubscribeListener.' );
	                console.log( 'User ID:', user_id );
	                console.log( 'Arguments:', arguments );
	            console.groupEnd( );
	        }
        };

        QB.chat.onConfirmSubscribeListener = function ( user_id ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onConfirmSubscribeListener.' );
	                console.log( 'User ID:', user_id );
	                console.log( 'Arguments:', arguments );
	            console.groupEnd( );
	        }
        };

        QB.chat.onRejectSubscribeListener = function ( user_id ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onRejectSubscribeListener.' );
	                console.log( 'User ID:', user_id );
	                console.log( 'Arguments:', arguments );
	            console.groupEnd( );
	        }
        };

        QB.chat.onReconnectListener = function ( ) {
        	if ( app.settings.app_config.debug ) {
        		console.group( 'onReconnectListener.' );
	            	console.log( 'Arguments:', arguments );
	            console.groupEnd( );
	        }
        };

        QB.chat.onReconnectFailedListener = function ( ) {
        	if ( app.settings.app_config.debug ) {
            	console.group( 'onReconnectFailedListener.' );
	            	console.log( 'Arguments:', arguments );
	            console.groupEnd( );
            }
        };

        QB.chat.onDisconnectedListener = function ( ) {
        	if ( app.settings.app_config.debug ) {
            	console.group( 'onDisconnectedListener.' );
	            	console.log( 'Arguments:', arguments );
	            console.groupEnd( );
            }
        };


        // CALL =============================================================================================================================================================
        QB.webrtc.onCallListener = function onCallListener ( session, extension ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onCallListener.' );
	                console.log( 'Session:', session );
	                console.log( 'Extension:', extension );
	            console.groupEnd( );
	        }

	        app.methods.callListen.apply( app, arguments );
        };

        QB.webrtc.onCallStatsReport = function onCallStatsReport ( session, user_id, stats, error ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onCallStatsReport' );
	                console.log( 'Session:', session );
	                console.log( 'User ID:', user_id );
	                console.log( 'Stats:', stats );
	            console.groupEnd( );
	        }

	        app.methods.callStatus.apply( app, arguments );
        };

        QB.webrtc.onUpdateCallListener = function onUpdateCallListener ( session, user_id, extension ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onUpdateCallListener.' );
	                console.log( 'Session:', session );
	                console.log( 'User ID:', user_id );
	                console.log( 'Extension:', JSON.stringify( extension ) );
	            console.groupEnd( );
	        }

	        app.methods.callUpdate.apply( app, arguments );
        };


        QB.webrtc.onAcceptCallListener = function onAcceptCallListener ( session, user_id, extension ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onAcceptCallListener.' );
	                console.log( 'Session:', session );
	                console.log( 'User ID:', user_id );
	                console.log( 'Extension:', extension );
	            console.groupEnd( );
	        }

	        app.methods.callAnswered.apply( app, arguments );
        };

        QB.webrtc.onRejectCallListener = function onRejectCallListener ( session, user_id, extension ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onRejectCallListener.' );
	                console.log( 'Session:', session );
	                console.log( 'User ID:', user_id );
	                console.log( 'Extension:', JSON.stringify( extension ) );
	            console.groupEnd( );
	        }

	        app.methods.callReject.apply( app, arguments );
        };

        QB.webrtc.onUserNotAnswerListener = function onUserNotAnswerListener ( session, user_id ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onUserNotAnswerListener.' );
	                console.log( 'Session:', session );
	                console.log( 'User ID:', user_id );
	            console.groupEnd( );
	        }

	        app.methods.callUnanswered.apply( app, arguments );
        };

        QB.webrtc.onStopCallListener = function onStopCallListener ( session, user_id, extension ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onStopCallListener.' );
	                console.log( 'Session:', session );
	                console.log( 'User ID:', user_id );
	                console.log( 'Extension:', extension );
	            console.groupEnd( );
	        }

	        app.methods.callStop.apply( app, arguments );
        };


        QB.webrtc.onRemoteStreamListener = function onRemoteStreamListener ( session, user_id, stream ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onRemoteStreamListener.' );
	                console.log( 'Session:', session );
	                console.log( 'User ID:', user_id );
	                console.log( 'Stream:', stream );
	            console.groupEnd( );
	        }

			app.methods.callStream.apply( app, arguments );
        };

        QB.webrtc.onSessionCloseListener = function onSessionCloseListener ( session ) {
        	if ( app.settings.app_config.debug ) {
        		console.group( 'onSessionCloseListener.' );
	                console.log( 'Session:', session );
	            console.groupEnd( );
            }

            app.methods.callClose.apply( app, arguments );
        };

        QB.webrtc.onSessionConnectionStateChangedListener = function onSessionConnectionStateChangedListener ( session, user_id, connection_state ) {
        	if ( app.settings.app_config.debug ) {
	            console.group( 'onSessionConnectionStateChangedListener.' );
	                console.log( 'Session:', session );
	                console.log( 'User ID:', user_id );
	                console.log( 'Сonnection List:', QB.webrtc.SessionConnectionState );
	                console.log( 'Сonnection State:', connection_state, _.invert( QB.webrtc.SessionConnectionState )[connection_state] );
	            console.groupEnd( );
	        }

			app.methods.callSession.apply( app, arguments );
        };

        QB.webrtc.onDevicesChangeListener = function onDevicesChangeListeners ( ) {
            app.methods.fillMediaDevices( ).then( function ( ) {
		    	app.methods.switchMediaDevices( );
		    });
        };

        app.methods.onAfterLoad( );
    }
}( jQuery, _, window.QB ));