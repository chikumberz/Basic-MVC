class SpeedTest {
	constructor ( opts ) {
		var self = this;

		self.opts = {
			id: {
				ip: '#speedtest-ip',
				ping: '#speedtest-ping',
				jitter: '#speedtest-jitter',
				download: '#speedtest-download',
				download_meter: '#speedtest-download-meter',
				upload: '#speedtest-upload',
				upload_meter: '#speedtest-upload-meter',
			},
			color: {
				meter: '#eaeaea',
				upload: '#616161',
				download: '#6060AA',
				progress: '#eaeaea',
			},
			callback: function ( ) {},
		};

		if ( typeof opts === 'object' ) {
			self.opts = _.extend( self.opts, opts );
		}

		self.speedtest = new Speedtest( );
		self.speedtest.setParameter( 'telemetry_level', 'basic' );

		self.reset( );
	}

	format ( d ) {
	    d = Number( d );

	    if ( d < 10 ) return d.toFixed( 2 );
	    if ( d < 100 ) return d.toFixed( 1 );

	    return d.toFixed( 0 );
	}

	oscillate ( ) {
		return 1 + 0.02 * Math.sin( Date.now( ) / 100 );
	}

	mbpsToAmount ( v ) {
		return 1 - ( 1 / ( Math.pow( 1.3, Math.sqrt( v ) ) ) );
	}

	reset ( ) {
		var self = this;

		self.drawMeter( self.opts.id.download_meter, 0, self.opts.color.meter, self.opts.color.download, 0 );
		self.drawMeter( self.opts.id.upload_meter, 0, self.opts.color.meter, self.opts.color.upload, 0 );

		$( self.opts.id.ping ).text( '' );
		$( self.opts.id.jitter ).text( '' );
		$( self.opts.id.download ).text( '' );
		$( self.opts.id.upload ).text( '' );
	}

	toggle ( e ) {
		if ( this.speedtest.getState( ) == 3 ) {
			this.stop( e );
		} else {
			this.start( e );
		}
	}

	start ( e ) {
		var self    = this;
		var element = $( e );

		self.startAnimationFrame;
		self.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || ( function ( callback, element ) { setTimeout( callback, 1000 / 60 ); } );
		self.cancelAnimationFrame  = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

		function frame ( ) {
			self.startAnimationFrame = requestAnimationFrame( frame );
			self.drawMeterUpdate( );
		}

		self.startAnimationFrame = frame( );

		element.addClass( 'running' );

		self.speedtest.onupdate = function ( data ) {
            self.data = data;
		};

		self.speedtest.onend = function ( aborted ) {
            element.removeClass( 'running' );

            self.drawMeterUpdate( true );

            if ( !aborted ) {
            	self.opts.callback( self.data );
            }
		};

		self.speedtest.start( );
	}

	stop ( e ) {
		var self    = this;
		var element = $( e );

		self.speedtest.abort( );
		self.data = null;

		element.removeClass( 'running' );

		self.reset( );
	}

	drawMeter ( element, value, background_meter, foreground_meter, progress_value, progress_background ) {
		var self    = this;
		var element = $( element )[0];
		var context = element.getContext( '2d' );
		var pixel   = window.devicePixelRatio || 1;
		var width   = element.clientWidth * pixel;
		var height  = element.clientHeight * pixel;
		var size    = height * 0.0055;

		if ( element.width == width && element.height == height ) {
			context.clearRect( 0, 0, width, height );
		} else {
			element.width  = width;
			element.height = height;
		}

		// Background
		context.beginPath( );
		context.lineWidth   = 12 * size;
		context.strokeStyle = background_meter;
		context.arc( element.width / 2, element.height - 58 * size, element.height / 1.8 - context.lineWidth, -Math.PI * 1.1, Math.PI * 0.1 );
		context.stroke( );

		// Foreground
		context.beginPath( );
		context.lineWidth   = 12 * size;
		context.strokeStyle = foreground_meter;
		context.arc( element.width / 2, element.height - 58 * size, element.height / 1.8 - context.lineWidth, -Math.PI * 1.1, value * Math.PI * 1.2 - Math.PI * 1.1 );
		context.stroke( );

		if ( typeof progress_value !== 'undefined' ) {
			context.fillStyle = progress_background;
			context.fillRect( element.width * 0.3, element.height - 16 * size, element.width * 0.4 * progress_value, 4 * size );
		}
	}

	drawMeterUpdate ( forced ) {
		var self = this;

		if ( !forced && self.speedtest.getState( ) != 3 ) return;
		if ( self.data == null ) return;

		var ip       = self.data.clientIp;
		var status   = self.data.testState;
		var ping     = self.format( self.data.pingStatus );
		var jitter   = self.format( self.data.jitterStatus );
		var download = ( status == 1 && self.data.dlStatus == 0 ) ? '...' : self.format( self.data.dlStatus );
		var upload   = ( status == 3 && self.data.ulStatus == 0 ) ? '...' : self.format( self.data.ulStatus );

		$( self.opts.id.ip ).text( ip );
		$( self.opts.id.download ).text( download );

		self.drawMeter( self.opts.id.download_meter, self.mbpsToAmount( Number( self.data.dlStatus * ( status == 1 ? self.oscillate( ) : 1 ) ) ), self.opts.color.meter, self.opts.color.download, Number( self.data.dlProgress ), self.opts.color.progress );

		$( self.opts.id.upload ).text( upload );

		self.drawMeter( self.opts.id.upload_meter, self.mbpsToAmount( Number( self.data.ulStatus * ( status == 3 ? self.oscillate( ) : 1 ) ) ), self.opts.color.meter, self.opts.color.upload, Number( self.data.ulProgress ), self.opts.color.progress );

		$( self.opts.id.ping ).text( ping );
		$( self.opts.id.jitter ).text( jitter );
	}
}