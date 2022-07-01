document.addEventListener( 'DOMContentLoaded', function ( ) {
		if ( !Notification ) {
			alert( 'Desktop notifications not available in your browser. Try Chrome.' );
			return;
		}

		if ( Notification.permission !== 'granted' ) {
			Notification.requestPermission( );
		}
});

function notify ( title, message, callback ) {
 	if ( Notification.permission !== 'granted' ) {
  		Notification.requestPermission( );
 	} else {
  		var notification = new Notification( title, {
   			icon: 'https://www.powerenglishedu.tk/powerenglish/theme/images/logo.png',
   			body: message,
  		});

  		if ( typeof callback === 'function' ) {
  			notification.onclick = callback;
  		}
 	}
};

$.fn.stars = function ( ) {
    return $( this ).each( function ( ) {
        // Get the value
        var val = parseFloat( $( this ).html( ) );
        console.log( val );
        // Make sure that the value is in 0 - 5 range, multiply to get width
        var size = Math.max( 0, ( Math.min( 5, val ) ) ) * 16;
        // Create stars holder
        var $span = $( '<span />' ).width( size );
        // Replace the numerical value with stars
        $( this ).html( $span );
    });
}

$( function ( ) {
	$.extend( true, $.fn.datetimepicker.defaults, {
	    icons: {
			time: 'far fa-clock',
			date: 'far fa-calendar-alt',
			up: 'fas fa-arrow-up',
			down: 'fas fa-arrow-down',
			previous: 'fas fa-chevron-left',
			next: 'fas fa-chevron-right',
			today: 'fas fa-calendar-check',
			clear: 'far fa-trash-alt',
			close: 'far fa-times-circle'
	    }
  	});

	$( window ).on( 'load', function( ) {
	    $( '.preloader' ).delay( 2000 ).fadeOut( );
	    $( '.preloader' ).on( 'click', function ( ) {
	    	$( this ).fadeOut( );
	    });
	});

	$( '[data-toggle="tooltip"]' ).tooltip( );
	$( 'select[multiple="multiple"]' ).selectpicker( );

	$( '.spinner' ).spinner({
		min: 0,
	});

	$( '.datepicker' ).daterangepicker({
		singleDatePicker: true,
	    showDropdowns: true,
	    timePicker: false,
	    timePicker24Hour: true,
	    timePickerSeconds: true,
	    autoApply: true,
	    opens: 'left',
	    // startDate: moment( ),
	    // endDate: moment( ),
	    locale: {
      		format: 'YYYY-MM-DD'
	    }
	});

	$( '.datetimepicker' ).daterangepicker({
	    singleDatePicker: true,
	    showDropdowns: true,
	    timePicker: true,
	    timePicker24Hour: true,
	    timePickerSeconds: true,
	    autoApply: true,
	    opens: 'left',
	    // startDate: moment( ),
	    // endDate: moment( ),
	    locale: {
      		format: 'YYYY-MM-DD HH:mm:ss'
	    }
  	});
});