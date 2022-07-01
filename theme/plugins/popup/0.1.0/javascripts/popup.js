;( function ( $ ) {
	'use strict';

	var settings = {
		url: null,
	    new: true,
	    name: null,
		center: 'screen', // true, screen || parent || undefined, null, '', false
	    top: 0,
	    left: 0,
	    width: 800,
	    height: 800,
	    status: false,
	    menubar: false,
	    toolbar: false,
	    location: false,
	    resizable: false,
	    scrollbars: false, // os x always adds scrollbars
	    onUnload: null,
	};

	$.fn.popup = function ( opts ) {
		var options = $.extend( {}, settings, opts );
		var win = window;

		return this.each( function ( ) {
    		// Center the window
		    if ( options.center === 'parent' ) {
				options.top  = win.screenY + Math.round( ( $( win ).height( ) - options.height ) / 2 );
				options.left = win.screenX + Math.round( ( $( win ).width( ) - options.width ) / 2 );
		    } else if ( options.center === true || options.center === 'screen' ) {
				/**
				 * 50px is a rough estimate for the height of the chrome above the take into account the current monitor the browser is on
				 * this works in Firefox, Chrome, but in IE there is a bug
				 * https://connect.microsoft.com/IE/feedback/details/856470/ie11-javascript-screen-height-still-gives-wrong-value-on-secondary-monitor
				 *
				 * IE reports the primary monitor resolution. So, if you have multiple monitors IE will
				 * ALWAYS return the resolution of the primary monitor. This is a bug, and there is an
				 * open ticket with IE for it. In chrome and firefox it returns the monitor that the
				 * browser is currently located on. If the browser spans multiple monitors, whichever
				 * monitor the browser has the most real estate on, is the monitor it returns the size for.
				 *
				 * What this means to the end users:
				 * If they have multiple monitors, and their multiple monitors have different resolutions,
				 * and they use internet explorer, and the browser is currently located on a secondary
				 * monitor, the centering will not be perfect as it will be based on the primary monitors
				 * resolution. As you can tell this is pretty edge case.
				 */
				var screen_left = ( typeof win.screenLeft !== 'undefined' ) ? win.screenLeft : screen.left;

				options.top  = ( ( screen.height - options.height ) / 2 ) - 50;
				options.left = screen_left + ( screen.width - options.width ) / 2;
		    }

		    var params = [];
		    params.push( 'top=' + options.top );
		    params.push( 'left=' + options.left );
		    params.push( 'height=' + options.height );
		    params.push( 'width=' + options.width );
		    params.push( 'status=' + ( options.status ? 'yes' : 'no' ) );
		    params.push( 'menubar=' + ( options.menubar ? 'yes' : 'no' ) );
		    params.push( 'toolbar=' + ( options.toolbar ? 'yes' : 'no' ) );
		    params.push( 'location=' + ( options.location ? 'yes' : 'no' ) );
		    params.push( 'resizable=' + ( options.resizable ? 'yes' : 'no' ) );
		    params.push( 'scrollbars=' + ( options.scrollbars ? 'yes' : 'no' ) );

			var random = new Date( ).getTime( );
			var name   = options.name || ( options.new ? 'popup_window_' + random : 'popup_window' );
			var popup  = win.open( options.url, name, params.join( ',' ) );

		    if ( options.onUnload && typeof options.onUnload === 'function' ) {
		      	var unloadInterval = setInterval( function ( ) {
		        	if ( !popup || popup.closed ) {
		          		clearInterval( unloadInterval );
		          		options.onUnload( );
		        	}
		      	}, 50 );
		    }

		    if ( popup && popup.focus ) {
		      	popup.focus( );
		    }

		    return popup;
		});
	};

	$.popup = function ( opts ) {
		return $( document ).popup( opts );
	};

	$( document ).on( 'click', '[data-toggle="popup"]', function ( e ) { e.preventDefault( );
	   	var self = $( this );
	   	var data = self.data( );

	   	if ( typeof data.url === 'undefined' ) {
	   		data.url = self.attr( 'href' );
	   	}

	   	self.popup( data );

	    return false;
	});
}( jQuery ));