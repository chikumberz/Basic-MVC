;( function ( $, _ ) {
	'use strict';

	String.prototype.format = function ( ) {
	  	return [...arguments].reduce( ( p, c ) => p.replace( /%s/, c ), this );
	};

	var app = {};
	app.own;
	app.settings = {
		twilio: {
			url: {
				video: '//cornsilk-pug-3914.twil.io/video-token',
				sync: '//cornsilk-pug-3914.twil.io/sync-token',
				notif_send: '//cornsilk-pug-3914.twil.io/notif-send',
				notif_bind: '//cornsilk-pug-3914.twil.io/notif-bind',
			}
		},
		firebase: {
			config: {
				apiKey: 'AIzaSyDnHIyPt2wopjJZGSpuV5J63kba-_lN0gk',
				authDomain: 'powerenglish-a0b6a.firebaseapp.com',
				databaseURL: 'https://powerenglish-a0b6a.firebaseio.com',
				projectId: 'powerenglish-a0b6a',
				storageBucket: 'powerenglish-a0b6a.appspot.com',
				messagingSenderId: '480518241630',
				appId: '1:480518241630:web:bb8d5f05d8ed3de86ae3cf',
				measurementId: 'G-Z8VVJY7P5R',
			}
		},
		identity: {
			id: '00000000',
			name: 'Benjamin Taluyo'
		},
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
	        message_call_exist_title: 'Existing Call...',
	        message_call_exist_content: 'Cannot make a call because call activity is still ongoing. Please close/end the call first before create a call.',
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
					<audio id="<%= call_start_signal %>" loop preload="auto" playsinline>\
					    <source src="/quickblox/samples/webrtc/audio/calling.ogg" type="audio/ogg" />\
					    <source src="/quickblox/samples/webrtc/audio/calling.mp3" type="audio/mp3" />\
					</audio>\
					<audio id="<%= call_ring_signal %>" loop preload="auto" playsinline>\
					    <source src="/quickblox/samples/webrtc/audio/ringtone.ogg" type="audio/ogg" />\
					    <source src="/quickblox/samples/webrtc/audio/ringtone.mp3" type="audio/mp3" />\
					</audio>\
					<audio id="<%= call_end_signal %>" preload="auto" playsinline>\
					    <source src="/quickblox/samples/webrtc/audio/end_of_call.ogg" type="audio/ogg" />\
					    <source src="/quickblox/samples/webrtc/audio/end_of_call.mp3" type="audio/mp3" />\
					</audio>\
				</div>\
				<div class="chat-video" id="<%= video_main_container_id %>"><video id="<%= video_main_id %>" autoplay playsinline></video></div>\
			    <div class="chat-video" id="<%= video_local_container_id %>"></div>\
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
				<h4 class="chat-status"><span id="call-status-<%= params.user.id %>"><%= params.call_status %></span></h4>\
            </div>',
			call_start: '\
			<div id="call-start" class="call-container">\
				<div class="call">\
					<h1 id="call-name-<%= params.user.id %>" class="call-user"><%= params.user.name %></h1>\
					<h4 id="call-timer-<%= params.user.id %>" class="call-timer"></h4>\
					<h4 id="call-status-<%= params.user.id %>" class="call-status"><%= params.call_status %></h4>\
				</div>\
			  	<div class="call-actions">\
			  		<% if ( type === 1 ) { %>\
						<button type="button" class="btn-call-action btn-call-accept active" onclick="$( this ).twilio( \'callAccept\' );"><i class="fas fa-phone-alt"></i></button>\
						<button type="button" class="btn-call-action btn-call-decline" onclick="$( this ).twilio( \'callDecline\' );"><i class="fas fa-phone-slash"></i></button>\
					<% } else if ( type === 2 ) { %>\
						<button type="button" class="btn-call-action btn-call-decline" onclick="$( this ).twilio( \'callDecline\' );"><i class="fas fa-phone-slash"></i></button>\
					<% } else { %>\
						<button type="button" class="btn-call-action btn-call-book" data-toggle="modal" data-target="#power-book"><i class="fas fa-book-open"></i></button>\
						<!--<button type="button" class="btn-call-action btn-call-video active" onclick="$( this ).twilio( \'toggleMediaDevices\', \'video\' );"><i class="fas fa-video"></i></button>-->\
						<button type="button" class="btn-call-action btn-call-audio active" onclick="$( this ).twilio( \'toggleMediaDevices\', \'audio\' );"><i class="fas fa-microphone"></i></button>\
						<button type="button" class="btn-call-action btn-call-end" onclick="$( this ).twilio( \'callEnd\' );"><i class="fas fa-phone"></i></button>\
					<% } %>\
			  	</div>\
			</div>',
			call_end: '\
			<div id="call-end" class="call-container">\
				<div class="call">\
					<h1 id="call-name-<%= params.user.id %>" class="call-user"><%= params.user.name %></h1>\
					<h4 id="call-timer-<%= params.user.id %>" class="call-timer"></h4>\
					<h4 id="call-status-<%= params.user.id %>" class="call-status"><%= params.call_status %></h4>\
				</div>\
			  	<div class="call-actions">\
			  		<button type="button" class="btn-call-action btn-call-book" data-toggle="modal" data-target="#power-book"><i class="fas fa-book-open"></i></button>\
					<button type="button" class="btn-call-action btn-call-call active" onclick="$( this ).twilio( \'call\', \'<%= params.user.id %>\', \'<%= params.user.name %>\', \'<%= params.book.id %>\', \'<%= params.schedule.id %>\', \'<%= params.schedule.student_id %>\', \'<%= params.schedule.teacher_id %>\', \'<%= params.room %>\' );"><i class="fas fa-phone-alt"></i></button>\
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
	    	call: function ( id, name, book_id, schedule_id, student_id, teacher_id, room ) {
	    		console.warn( 'CALL' );

	    		if ( window.localStorage.getItem( 'CALL' ) ) {
	    			var modal_template = _.template( app.settings.templates.modal )({
		            	title: app.settings.messages.message_call_exist_title,
		            	content: app.settings.messages.message_call_exist_content,
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

	            	return;
	    		}

	    		var data = {
	    			room: {
	    				name: room || 'PE' + new Date( ).getTime( ) + 'T'
	    			},
	    			book: {
	    				id: book_id,
	    				page: 0
	    			},
	    			schedule: {
	    				id: schedule_id,
	    				student_id: student_id,
	    				teacher_id: teacher_id,
	    			},
	    			caller: app.methods.getUser( ),
	    			callee: {
		    			id: id,
		    			name: name,
		    		},
	    		};

				var caller  = data.caller;
				var callee  = data.callee;
				var user    = caller.id == app.methods.getUserId( ) ? callee : caller;
				var message = app.methods.getUserName( ) + ' is calling you!';

	    		app.methods.removeCallEndTmpl( );
	    		app.methods.sendTwilioNotification( id, message, data ).then( result => {
					var session  = { status: 1, status_msg: 'onConnectTeacher', data: data };
					var database = app.variables.firebase.database.ref( '/room/' + data.room.name );

					database.set( session, error => {
	    				if ( error ) {
	    					console.error( 'Twilio Sync Unexpected Error:', error );
	    				} else {
	    					console.log( 'The Document was successfully created:', session );

							app.variables.call.status           = true;
							app.variables.call.session          = session;
							app.variables.call.unanswered_timer = setTimeout( app.variables.call.unansweredStartTimer, app.variables.call.unanswered_time );

							/*Twilio.Video.createLocalVideoTrack( ).then( track => {
							  	$( '#' + app.settings.video.local.container_id ).append( $( track.attach( ) ).attr( 'id', app.settings.video.local.id ) );
							}).catch( error => {
								console.error( 'Twilio Video Unexpected Error:', error );
							});*/

					    	var call_start_template = _.template( app.settings.templates.call_start )({
					    		type: 0,
					        	params: {
					        		user: callee,
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

							if ( typeof app.variables.templates.video_remote !== 'object' ) {
					        	app.variables.templates.video_remote = {};
					        }

					        var video_remote_template = _.template( app.settings.templates.video_remote )({
								id: app.settings.video.remote.id + '_' + callee.id,
					        	params: {
					        		user: callee,
					        		call_status: 'CONNECTING',
					        	},
					        });

					        app.variables.templates.video_remote[callee.id] = $( video_remote_template );
					        app.variables.templates.video_remote[callee.id].appendTo( '#' + app.settings.video.remote.container_id );

							app.settings.call.sounds.start.play( );

							database.on( 'value', snapshot => {
								app.methods.callSession( snapshot.val( ) );
							});
	    				}
	    			});
	    		}, error => {
	    			console.error( error );
	    		});
	    	},
	    	callEnd: function ( ) {
		    	console.warn( 'CALL END' );

                app.variables.firebase.database.ref( '/room/' + app.variables.call.session.data.room.name ).once( 'value' ).then( snapshot => {
					var session = snapshot.val( );

					if ( session ) {
						session.status     = 0;
						session.status_msg = 'onDropTeacher';

						snapshot.ref.update( session );
					}
				});
	    	},
	    	callAccept: function ( ) {
	    		console.warn( 'CALL ACCEPT' );

				app.variables.firebase.database.ref( '/room/' + app.variables.call.session.data.room.name ).once( 'value' ).then( snapshot => {
                	var session = snapshot.val( );

                	if ( session ) {
						session.status     = 101;
						session.status_msg = 'onAcceptTeacher';

						app.variables.call.status = true;

						snapshot.ref.update( session );
					}
				});
	    	},
	    	callDecline: function ( ) {
	    		console.warn( 'CALL DECLINE' );

	    		app.methods.callReject( );
	    	},



	    	callListen: function ( data ) {
		    	console.warn( 'CALL LISTEN' );

				var caller = data.caller;
				var callee = data.callee;
				var user   = caller.id == app.methods.getUserId( ) ? callee : caller;

				if ( window.localStorage.getItem( 'CALL' ) ) return false;

		    	app.methods.removeCallEndTmpl( );
				var session  = { status: 1, status_msg: 'onConnectTeacher', data: data };
				var database = app.variables.firebase.database.ref( '/room/' + data.room.name );

				database.set( session, error => {
    				if ( error ) {
    					console.error( 'Twilio Firebase Database Unexpected Error:', error );
    				} else {
    					console.log( 'Twilio Firebase Database Created:', session );

						app.variables.call.session          = session;
						app.variables.call.unanswered_timer = setTimeout( app.variables.call.endStartTimer, app.variables.call.end_time );

						/*Twilio.Video.createLocalVideoTrack( ).then( track => {
						  	$( '#' + app.settings.video.local.container_id ).append( $( track.attach( ) ).attr( 'id', app.settings.video.local.id ) );
						}).catch( error => {
							console.error( 'Twilio Video Unexpected Error:', error );
						});*/

				    	var call_start_template = _.template( app.settings.templates.call_start )({
				    		type: 1,
				        	params: {
				        		user: caller,
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

						if ( typeof app.variables.templates.video_remote !== 'object' ) {
				        	app.variables.templates.video_remote = {};
				        }

				        var video_remote_template = _.template( app.settings.templates.video_remote )({
							id: app.settings.video.remote.id + '_' + caller.id,
				        	params: {
				        		user: caller,
				        		call_status: 'CONNECTING',
				        	},
				        });

				        app.variables.templates.video_remote[caller.id] = $( video_remote_template );
				        app.variables.templates.video_remote[caller.id].appendTo( '#' + app.settings.video.remote.container_id );

						app.settings.call.sounds.ring.play( );

						database.on( 'value', snapshot => {
							app.methods.callSession( snapshot.val( ) );
						});
    				}
    			});
		    },
		    callSession: function ( data ) {
			  	console.log( 'Twilio Firebase Database Update:', data );

			  	if ( data ) {
			  		window.localStorage.setItem( 'CALL', 100 );

					app.methods.callSetData( data );
					app.methods.callWatchData( data );

					var caller = app.variables.call.session.data.caller;
					var callee = app.variables.call.session.data.callee;
					var user   = caller.id == app.methods.getUserId( ) ? callee : caller;

					// CONNECTING
		            if ( app.variables.call.session.status == 1 ) {
						if ( app.variables.templates.call_start ) {
							app.variables.templates.call_start.find( '#call-status-' + callee.id ).text( app.settings.messages.call_connecting );
						}

		                if ( typeof app.variables.templates.video_remote !== 'undefined' && typeof app.variables.templates.video_remote[callee.id] !== 'undefined' ) {
							app.variables.templates.video_remote[callee.id].find( '#call-status-' + callee.id ).text( app.settings.messages.call_connecting );
						}
		            }

		            // CONNECTED
		            if ( app.variables.call.session.status == 100 || app.variables.call.session.status == 101 ) {
		            	if ( app.variables.call.session.status == 100 ) {
							app.methods.callAnswered( );
		            	} else if ( app.variables.call.session.status == 101 ) {
		            		app.methods.callReceived( );
		            	}
		            }

		            // CLOSED
		            if ( app.variables.call.session.status == 0 || app.variables.call.session.status == 20 ) {
		            	app.methods.callClose( );
		            }
		        }
		    },



	    	callReceived: function ( ) {
	    		console.warn( 'CALL RECEIVED' );

	    		if ( !app.variables.call.status ) {
	    			app.methods.removeCallStartTmpl( );
					app.settings.call.sounds.ring.pause( );
					app.own.removeClass( 'loading' );

					return;
	    		}

	    		var caller = app.variables.call.session.data.caller;
				var callee = app.variables.call.session.data.callee;
				var user   = caller.id == app.methods.getUserId( ) ? callee : caller;

		    	app.methods.getTwilioVideoToken( ).then( result => {
					if ( result.token ) {
						var audio_source = $( '[name="' + app.settings.audio.source.name + '"]' );
						var video_source = $( '[name="' + app.settings.video.source.name + '"]' );

						var audio_device_id = audio_source.val( ) ? audio_source.val( ) : 'default';
			            var video_device_id = video_source.val( ) ? video_source.val( ) : 'default';

			            Twilio.Video.createLocalTracks({
			            	audio: {
				      			deviceId: { exact: audio_device_id }
			            	},
			            	/*video: {
				      			deviceId: { exact: video_device_id }
			            	}*/
					    }).then( tracks => {
							Twilio.Video.connect( result.token, {
								name: app.variables.call.session.data.room.name,
								audio: true,
								video: false,
								tracks: tracks,
								maxAudioBitrate: 16000,
							}).then( room => {
								app.variables.user        = app.settings.identity;
								app.variables.twilio.room = Twilio.Room = room;

								room.participants.forEach( app.methods.checkTwilioParticipantConnected );
							  	room.on( 'participantConnected', app.methods.checkTwilioParticipantConnected );

							  	room.on( 'participantDisconnected', app.methods.checkTwilioParticipantDisconnected );
							  	room.once( 'disconnected', error => room.participants.forEach( app.methods.checkTwilioParticipantDisconnected ) );

							  	app.methods.removeCallStartTmpl( );
								app.settings.call.sounds.ring.pause( );

								var call_start_template = _.template( app.settings.templates.call_start )({
				            		type: 0,
					            	params: {
					            		user: caller,
					            		call_status: app.settings.messages.call_connected,
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

								if ( !app.variables.call.answered_timer ) {
					                app.variables.call.answered_timer = setInterval( function ( ) {
					                    app.variables.call.answeredUpdateTimer.call( app.variables.call );
					                }, 1000 );
					            }

							  	// app.variables.call.users.answered.push( user );
							}, error => {
							  	console.error( 'Twilio Video Unexpected Error:', error );
							});
						}, error => {
						  	console.error( 'Twilio Video Unexpected Error:', error );
						});
					} else {
						console.error( 'Twilio Video Unexpected Error:', 'No access token detected' );
					}
				});
		    },
		    callReject: function ( ) {
		    	console.warn( 'CALL REJECT' );

				app.variables.firebase.database.ref( '/room/' + app.variables.call.session.data.room.name ).once( 'value' ).then( snapshot => {
                	var session = snapshot.val( );

                	if ( session ) {
						session.status     = 20;
						session.status_msg = 'onDeclineTeacher';

						app.variables.call.status = true;

						snapshot.ref.update( session );
					}
				});
		    },
	    	callAnswered: function ( ) {
		    	console.warn( 'CALL ANSWERED' );

		    	var caller = app.variables.call.session.data.caller;
				var callee = app.variables.call.session.data.callee;
				var user   = caller.id == app.methods.getUserId( ) ? callee : caller;

		    	app.methods.getTwilioVideoToken( ).then( result => {
					if ( result.token ) {
						var audio_source = $( '[name="' + app.settings.audio.source.name + '"]' );
						var video_source = $( '[name="' + app.settings.video.source.name + '"]' );

						var audio_device_id = audio_source.val( ) ? audio_source.val( ) : 'default';
			            var video_device_id = video_source.val( ) ? video_source.val( ) : 'default';

			            Twilio.Video.createLocalTracks({
			            	audio: {
				      			deviceId: { exact: audio_device_id }
			            	},
			            	/*video: {
				      			deviceId: { exact: video_device_id }
			            	}*/
					    }).then( tracks => {
							Twilio.Video.connect( result.token, {
								name: app.variables.call.session.data.room.name,
								audio: true,
								video: false,
								tracks: tracks,
								maxAudioBitrate: 16000
							}).then( room => {
								app.variables.user        = app.settings.identity;
								app.variables.twilio.room = Twilio.Room = room;

								room.participants.forEach( app.methods.checkTwilioParticipantConnected );
							  	room.on( 'participantConnected', app.methods.checkTwilioParticipantConnected );

							  	room.on( 'participantDisconnected', app.methods.checkTwilioParticipantDisconnected );
							  	room.once( 'disconnected', error => room.participants.forEach( app.methods.checkTwilioParticipantDisconnected ) );

							  	app.methods.removeCallStartTmpl( );
								app.settings.call.sounds.start.pause( );

								var call_start_template = _.template( app.settings.templates.call_start )({
				            		type: 0,
					            	params: {
					            		user: callee,
					            		call_status: app.settings.messages.call_connected,
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

								if ( !app.variables.call.answered_timer ) {
					                app.variables.call.answered_timer = setInterval( function ( ) {
					                    app.variables.call.answeredUpdateTimer.call( app.variables.call );
					                }, 1000 );
					            }

							  	// app.variables.call.users.answered.push( user );
							}, error => {
							  	console.error( 'Twilio Video Unexpected Error:', error );
							});
						}, error => {
						  	console.error( 'Twilio Video Unexpected Error:', error );
						});
					} else {
						console.error( 'Twilio Video Unexpected Error:', 'No access token detected' );
					}
				});
		    },
	    	callUnanswered: function (  ) {
		    	console.warn( 'CALL UNANSWERED' );

		    	app.variables.firebase.database.ref( '/room/' + app.variables.call.session.data.room.name ).once( 'value' ).then( snapshot => {
                	var session = snapshot.val( );
					var caller = session.data.caller;
					var callee = session.data.callee;
					var user   = caller.id == app.methods.getUserId( ) ? callee : caller;

					session.status     = 0;
					session.status_msg = 'onDropTeacher';

			    	app.methods.removeCallEndTmpl( );

		            var call_end_template = _.template( app.settings.templates.call_end )({
		            	params: {
		            		user: callee,
		            		room: app.variables.call.session.data.room.name,
		            		book: app.variables.call.session.data.book,
		            		schedule: app.variables.call.session.data.schedule,
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

						});
					}

					snapshot.ref.update( session );
				});
		    },
		    callClose: function ( forced ) {
		    	console.warn( 'CALL CLOSE' );

		    	if ( !app.variables.call.status ) {
		    		app.own.removeClass( 'has-video has-audio' );
            		app.own.find( '#' + app.settings.video.remote.container_id ).empty( );
            		app.methods.removeCallStartTmpl( );

		    		return app.methods.callTerminate( );
		    	}

		    	app.variables.firebase.database.ref( '/room/' + app.variables.call.session.data.room.name ).once( 'value' ).then( snapshot => {
					var session = snapshot.val( );
					var caller  = session.data.caller;
					var callee  = session.data.callee;
					var user    = caller.id == app.methods.getUserId( ) ? callee : caller;

					snapshot.ref.off( );
					snapshot.ref.remove( ).then( () => {
						console.log( 'Twilio Firebase Database Session Removed' );

				    	app.own.removeClass( 'has-video has-audio' );
	            		app.own.find( '#' + app.settings.video.remote.container_id ).empty( );
	            		app.methods.removeCallStartTmpl( );

						if ( !app.variables.templates.call_end ) {
			            	var call_end_template = _.template( app.settings.templates.call_end )({
				            	params: {
				            		user: user,
				            		room: app.variables.call.session.data.room.name,
				            		book: app.variables.call.session.data.book,
		            				schedule: app.variables.call.session.data.schedule,
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

			            app.settings.call.sounds.end.play( );

						app.methods.callTerminate( );
					});
			  	});
		    },
		    callTerminate: function ( ) {
		    	console.warn( 'CALL TERMINATE' );

		    	app.settings.call.sounds.start.pause( );
            	app.settings.call.sounds.ring.pause( );

				if ( app.variables.call.answered_time ) {
                	app.variables.call.answeredUpdateTimer.call( app.variables.call );
                }

				if ( app.variables.call.answered_timer ) {
                   	clearInterval( app.variables.call.answered_timer );
					app.variables.call.answered_time  = 0;
					app.variables.call.answered_timer = null;
                }

                if ( app.variables.call.unanswered_timer ) {
					clearInterval( app.variables.call.unanswered_timer );
					app.variables.call.unanswered_timer = null;
				}

                if ( !_.isEmpty( app.variables.session ) ) {
                    app.variables.session = null;
                }

                if ( !_.isEmpty( app.variables.twilio.room ) ) {
                	app.variables.twilio.room.disconnect( );
                	app.variables.twilio.room = null;
                }

                app.variables.call.status = false;

				window.localStorage.removeItem( 'CALL' );
		    },

		    callSetData: function ( data ) {
		    	app.variables.call.session = data;
		    },
		    callGetData: function ( ) {
		     	return app.variables.call.session;
		    },
		    callWatchData: function ( data ) {

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
							$( app.own ).twilio( 'setMediaDevices', audio_source );

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
									$( app.own ).twilio( 'setMediaDevices', video_source, true );

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
		    	var localParticipant = app.variables.twilio.room.localParticipant;

		    	if ( _.isEmpty( app.variables.call.session ) ) {
	               	return false;
	           	} else {
	           		if ( device === 'video' ) {
	           			if ( self.hasClass( 'active' ) ) {
	           				localParticipant.videoTracks.forEach( function ( videoTracks ) {
						        videoTracks.track.disable( );
						    });
	           			} else {
	           				localParticipant.videoTracks.forEach( function ( videoTracks ) {
						        videoTracks.track.enable( );
						    });
	           			}
	           		} else if ( device === 'audio' ) {
           				if ( self.hasClass( 'active' ) ) {
		                  	self.removeClass( 'active' );

						    localParticipant.audioTracks.forEach( function ( audioTrack ) {
						        audioTrack.track.disable( );
						    });
		               	} else {
		                   	self.addClass( 'active' );

						    localParticipant.audioTracks.forEach( function ( audioTrack ) {
						        audioTrack.track.enable( );
						    });
	               		}
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
		firebase: {
			app: null,
			analytics: null,
			database: null,
			messaging: null,
		},
		twilio: {
			sync: null,
			room: null,
		},
		user: null,
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
    		status: false,
    		session: null,
            answered_time: 0,
            answered_timer: null,
            answeredUpdateTimer: function ( ) {
                this.answered_time += 1000;

                $( '.call-timer' ).text( new Date( this.answered_time ).toUTCString( ).split( / / )[4] );
            },
            unanswered_time: 30000,
            unanswered_timer: null,
            unansweredStartTimer: function ( ) {
				if ( app.variables.call.session.status == 1  ) {
					app.methods.callUnanswered( );
				}
			},
			end_time: 30000,
            end_timer: null,
            endStartTimer: function ( ) {
				if ( app.variables.call.session.status == 1  ) {
					app.methods.callEnd( );
				}
			}
        },
	};

	app.methods = {
        init: function ( opts ) {
			app.own            = this;
			app.settings       = $.extend( true, app.settings, opts );
			app.variables.user = app.settings.identity;
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
	            			onclick: '$( this ).twilio( \'switchMediaDevices\' )',
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

	        // Check WebRTC is available
	        if ( !Twilio.Video.isSupported ) {
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
	        	init( );
		    });
        },
        getTwilioVideoToken: function ( ) {
        	return new Promise( function ( resolve, reject ) {
        		$.ajax({
					url: app.settings.twilio.url.video,
					data: { i: app.methods.getUserId( ), r: app.variables.call.session.data.room.name },
					dataType: 'json',
				}).then( result => {
					resolve( result );
				}, error => {
					reject( error );
				});
        	});
        },
        setTwilioNotificationToken ( token ) {
        	return new Promise( function ( resolve, reject ) {
        		$.ajax({
					url: app.settings.twilio.url.notif_bind,
					data: {
						i: app.methods.getUserId( ),
						type: 'fcm',
						token: token,
					},
					dataType: 'json',
				}).then( result => {
					resolve( result );
				}, error => {
					reject( error );
				});
        	});
        },
        sendTwilioNotification ( id, msg, data ) {
        	return new Promise( function ( resolve, reject ) {
        		$.ajax({
					url: app.settings.twilio.url.notif_send,
					data: { i: id, msg: msg, data: JSON.stringify( data || {} ) },
					dataType: 'json',
				}).then( result => {
					resolve( result );
				}, error => {
					reject( error );
				});
        	});
        },
        checkTwilioParticipantConnected ( participant ) {
        	console.log( 'Participant "%s" connected', participant.identity );

        	const $div = $( '<div />', {
        		id: participant.sid,
        	});

		  	participant.on( 'trackSubscribed', track => app.methods.checkTwilioParticipantTrackSubscribed( $div, participant, track ) );
		  	participant.on( 'trackUnsubscribed', app.methods.checkTwilioParticipantTrackIUnsubscribed );

		  	participant.tracks.forEach( publication => {
			    if (publication.isSubscribed ) {
			      	app.methods.checkTwilioParticipantTrackSubscribed( $div, participant, publication.track );
			    }
		  	});

		  	if ( typeof app.variables.templates.video_remote[participant.identity] !== 'undefined' ) {
				app.variables.templates.video_remote[participant.identity].find( '#call-status-' + participant.identity ).text( app.settings.messages.call_connected );
			}

		  	if ( typeof app.variables.templates.video_remote[participant.identity] !== 'undefined' ) {
				app.variables.templates.video_remote[participant.identity].append( $div );
			}
        },
        checkTwilioParticipantDisconnected ( participant ) {
        	console.log( 'Participant "%s" disconnected', participant.identity );

        	app.variables.firebase.database.ref( '/room/' + app.variables.call.session.data.room.name ).once( 'value' ).then( snapshot => {
				var session = snapshot.val( );

				if ( session ) {
					session.status     = 0;
					session.status_msg = 'onDropTeacher';

					snapshot.ref.update( session );
				}
			});

			if ( typeof app.variables.templates.video_remote[participant.identity] !== 'undefined' ) {
				app.variables.templates.video_remote[participant.identity].find( '#call-status-' + participant.identity ).text( app.settings.messages.call_disconnected );
			}

  			$( participant.sid ).remove( );
        },
        checkTwilioParticipantTrackSubscribed ( $div, participant, track ) {
        	if ( track.kind == 'audio' ) {
        		$div.append( $( track.attach( ) ).addClass( 'chat-audio' ) );
        	} else if ( track.kind == 'video' ) {
        		$div.append( $( track.attach( ) ).addClass( 'chat-video' ).attr( 'onclick', '$( this ).twilio( \'setMainVideo\', \'' + participant.identity + '\' );' ) );
        	}
        },
        checkTwilioParticipantTrackIUnsubscribed ( track ) {
        	track.detach( ).forEach( element => element.remove( ) );
        },
        getMediaDevices: function ( kind ) { // DONE
            return new Promise( function ( resolve, reject ) {
                navigator.mediaDevices.enumerateDevices( ).then( function( devices ) {
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
                    console.warn( 'TWILIO [getMediaDevices] ERROR:', error );

                    reject( error );
                });
            });
        },
        setMediaDevices: function ( input, is_video_input ) { // DONE
        	if ( typeof input === 'undefined' ) {
        		console.warn( 'TWILIO [setMediaDevices] ERROR:', 'input is undefined.' ); return;
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

            if ( !app.variables.room ) {
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

            Twilio.Video.createLocalTracks({
            	audio: {
	      			deviceId: { exact: audio_device_id }
            	},
            	video: {
	      			deviceId: { exact: video_device_id }
            	}
		    }).then( stream => {
		    	stream.forEach( track => {
		    		if ( track.kind == 'audio' ) {
		    			app.methods.getUser( ).audioTracks.forEach( publication => {
							publication.track.stop( );
							publication.unpublish( );
						});

						app.methods.getUser( ).publishTrack( track );
		    		} else if ( track.kind == 'video' ) {
		    			app.methods.getUser( ).videoTracks.forEach( publication => {
							publication.track.stop( );
							publication.unpublish( );
						});

						app.methods.getUser( ).publishTrack( track );
		    		}
		    	});

		    	var alert_template  = _.template( app.settings.templates.alert )({
            		type: app.settings.call.setting.message.success,
            		message: app.settings.messages.setting_success,
            	});

            	alert_container.empty( );
            	alert_template = $( alert_template );
            	alert_template.appendTo( alert_container );
		    }, error => {
		    	console.error( 'Error on switching media devices.', error );

				var alert_template  = _.template( app.settings.templates.alert )({
            		type: app.settings.call.setting.message.error,
            		message: app.settings.messages.setting_error,
            	});

            	alert_container.empty( );
            	alert_template = $( alert_template );
            	alert_template.appendTo( alert_container );
		    });
        },
        getUser: function ( ) {
        	return app.variables.user;
        },
        getUserId: function ( ) {
	        return app.variables.user.id;
	    },
	    getUserName: function ( ) {
	        return app.variables.user.name;
	    },

	    removeCallStartTmpl: function ( ) {
	    	if ( app.variables.templates.call_start ) {
    			if ( app.variables.templates.call_start.hasClass( 'modal' ) ) {
					app.variables.templates.call_start.modal( 'hide' );
				} else {
					app.variables.templates.call_start.remove( );
				}

				delete app.variables.templates.call_start;
			}
	    },

	    removeCallEndTmpl: function ( ) {
	    	if ( app.variables.templates.call_end ) {
    			if ( app.variables.templates.call_end.hasClass( 'modal' ) ) {
					app.variables.templates.call_end.modal( 'hide' );
				} else {
					app.variables.templates.call_end.remove( );
				}

				delete app.variables.templates.call_end;
			}
	    },

	    call: function ( ) { this.app = app; return app.settings.methods.call.apply( this, arguments ); },
	    callEnd: function ( ) { this.app = app; return app.settings.methods.callEnd.apply( this, arguments ); },
	    callAccept: function ( ) { this.app = app; return app.settings.methods.callAccept.apply( this, arguments ); },
	    callDecline: function ( ) { this.app = app; return app.settings.methods.callDecline.apply( this, arguments ); },

	    callListen: function ( ) { this.app = app; return app.settings.methods.callListen.apply( this, arguments ); },
	    callSession: function ( ) { this.app = app; return app.settings.methods.callSession.apply( this, arguments ); },

	    callReceived: function ( ) { this.app = app; return app.settings.methods.callReceived.apply( this, arguments ); },
	    callReject: function ( ) { this.app = app; return app.settings.methods.callReject.apply( this, arguments ); },
	    callAnswered: function ( ) { this.app = app; return app.settings.methods.callAnswered.apply( this, arguments ); },
	    callUnanswered: function ( ) { this.app = app; return app.settings.methods.callUnanswered.apply( this, arguments ); },
	    callClose: function ( ) { this.app = app; return app.settings.methods.callClose.apply( this, arguments ); },
	    callTerminate: function ( ) { this.app = app; return app.settings.methods.callTerminate.apply( this, arguments ); },

	    callSetData: function ( ) { this.app = app; return app.settings.methods.callSetData.apply( this, arguments ); },
	    callGetData: function ( ) { this.app = app; return app.settings.methods.callGetData.apply( this, arguments ); },
	    callWatchData: function ( ) { this.app = app; return app.settings.methods.callWatchData.apply( this, arguments ); },

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

    $.fn.twilio = function ( method_or_options ) {
        if ( app.methods[method_or_options] ) {
            return app.methods[method_or_options].apply( this, Array.prototype.slice.call( arguments, 1 ) );
        } else if ( typeof method_or_options === 'object' || !method_or_options ) {
            return app.methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method_or_options + ' does not exist on jQuery.twilio' );
        }
    };

    function init ( ) {
    	console.log( 'INITIALIZED' );

		app.variables.firebase.app       = firebase.initializeApp( app.settings.firebase.config );
		app.variables.firebase.analytics = app.variables.firebase.app.analytics( );
		app.variables.firebase.database  = app.variables.firebase.app.database( );
		app.variables.firebase.messaging = app.variables.firebase.app.messaging( );

		if ( 'serviceWorker' in navigator ) {
			// window.addEventListener( 'load', async () => {
				navigator.serviceWorker.addEventListener( 'message', event => {
					if ( typeof event.data.firebaseMessaging === 'undefined' ) {
				  		app.methods.callListen( event.data );
					}
				});

				navigator.serviceWorker.register( '/powerenglish/theme/javascripts/twilio-call-sw.js' ).then( registration => {
					console.log( 'Twilio Firebase Service Worker Registered.' );

			      	app.variables.firebase.messaging.useServiceWorker( registration );
			      	app.variables.firebase.messaging.requestPermission( ).then( () => {
					    app.variables.firebase.messaging.getToken( ).then( token => {
					        if ( token ) {
					        	app.methods.setTwilioNotificationToken( token );
					        } else {
					            console.error( 'Twilio Firebase no instance ID token available. Request permission to generate one.' );
					        }
					    }, error => {
					        console.log( 'Twilio Firebase an error occurred while retrieving token:', error );
					    });

						app.variables.firebase.messaging.onTokenRefresh( () => {
						  	app.variables.firebase.messaging.getToken( ).then( token => {
							    if ( token ) {
							    	app.methods.setTwilioNotificationToken( token );
						            console.log( 'Twilio Firebase refreshed token received:', token );
						        } else {
						           	console.error( 'Twilio Firebase no instance ID token available. Request permission to generate one.' );
						        }
						  	}, error => {
							    console.log( 'Twilio Firebase unable to retrieve refreshed token:', error );
						  	});
						});
					}, error => {
					    console.log( 'Twilio Firebase unable to get permission to notify:', error );
					});

					app.variables.firebase.messaging.onMessage( payload => {
						var data = payload.data;

						Object.keys( data ).forEach( function ( key ) {
							try {
						  		data[key] = JSON.parse( data[key] );
						  	} catch ( e ) {};
						});

						window.focus( );

						app.methods.callListen( data );
					});
			    });
			// });
	  	}

    	app.methods.onAfterLoad( );
    }
}( jQuery, _ ));