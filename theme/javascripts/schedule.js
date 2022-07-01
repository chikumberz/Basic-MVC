class Schedule {
	constructor ( opts ) {
		var self = this;

		if ( typeof opts === 'object' ) {
			self.opts = opts;
		} else {
			return false;
		}

		self.display( ).then( function ( result ) {
			var data_last_created = _.max( result.data, function ( data ) { return data.created_on_s; });

			if ( typeof data_last_created === 'object' ) {
				self.opts.created_on = data_last_created.created_on;
			} else {
				self.opts.created_on = result.datetime;
			}

			setInterval( function ( ) {
				self.display( ).then( function ( result ) {
					var data_last_created = _.max( result.data, function ( data ) { return data.created_on_s; });

					if ( typeof data_last_created === 'object' ) {
						self.opts.created_on = data_last_created.created_on;
					} else {
						self.opts.created_on = result.datetime;
					}

					_.each( result.data, function ( data ) {
						notify( 'New Schedule', 'You have a new schedule from ' + data.student.name + '.', function ( ) {
			    			$.popup({
			   					url: getUrl( 'tutor/schedule/view/' + data.id ),
			   					width: 1000,
			   				});
			    		});
					});
				});
			}, self.opts.interval );
		});
	}

	load ( ) {
		var self = this;

		return new Promise( function( resolve, reject ) {
			$.ajax({
				url: getUrl( 'tutor/schedule/get' ),
				type: 'POST',
				data: {
					start_on: self.opts.start_on,
					created_on: self.opts.created_on,
				},
				dataType: 'json',
			}).done( function ( result ) {
				resolve( result );
			}).fail( function ( error ) {
				reject( error );
			});
		});
	}

	display ( ) {
		var self = this;

		return new Promise( function( resolve, reject ) {
			self.load( ).then( function ( result ) {
				_.each( result.data, function ( data ) {
					var status         = 'none';
					var class_start_on = moment.tz( data.class_start_on, result.timezone );
					var class_end_on   = moment.tz( data.class_end_on, result.timezone );

					if ( data.status_id == 10 ) {
						status = 'reserve';
					} else if ( data.status_id == 90 ) {
						status = 'ready';
					} else if ( data.status_id == 100 ) {
						status = 'present';
					} else if ( data.status_id == 110 ) {
						status = 'cancel';
					} else if ( data.status_id == 111 ) {
						status = 'absent';
					}

					var template = _.template( $( self.opts.template_id ).html( ) )({
						sid: data.class_end_on_s,
						name: data.student.name,
						class_url: getUrl( 'tutor/schedule/view/' + data.id ),
						class_status: status,
						class_time: data.class_time,
						class_start_on: class_start_on.format( 'HH:mm' ),
						class_end_on: class_end_on.add( 1, 'seconds' ).format( 'HH:mm' ),
						tag_new: ( self.opts.created_on ) ? true : false,
					});

					$( self.opts.container_id ).append( template );
					$( self.opts.container_id ).children( 'li' ).sort( function ( a, b ) {
					    return parseInt( a.dataset.sid ) - parseInt( b.dataset.sid );
					}).appendTo( self.opts.container_id );
				});

				resolve( result );
			});
		});
	}
}
