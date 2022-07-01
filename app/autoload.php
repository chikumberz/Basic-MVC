<?php
	if ( !session_start( ) ) {
		@session_start( );
	}

	require_once( 'Framework.php' );

	function getUrl ( $url = '', $data = false, $hash = '', $is_admin = false ) {
		global $__CONFIG__;

		$domain = rtrim( $__CONFIG__['common']['url_public'], '/' );

		if ( $url && !strpos( '.', $url ) ) {
			if ( isset( $data['url_suffix'] ) ) {
				$url .= $data['url_suffix'];
				unset( $data['url_suffix'] );
			} else {
				$url .= $__CONFIG__['common']['url_suffix'];
			}
		} else if ( !$url ) {
			$url .= $__CONFIG__['common']['url_suffix'];
		}

		/*if ( isset( $data['use_ssl'] ) && $data['use_ssl'] == true ) {
			$domain = str_replace( 'https', 'http', $domain );
		}*/

		if ( $hash ) {
			$hash = "#{$hash}";
		}

		return $domain . ( $is_admin ? "/{$__CONFIG__['common']['url_private_key']}/" : '/' ) . $url . ( $data ? '?' . http_build_query( $data ) : '' ) . $hash;
	}

	function generateRandomKey ( $length = 10 ) {
		$str               = '';
		$characters        = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_-abcdefghijklmnopqrstuvwxyz';
		$characters_length = strlen( $characters );

	    for ( $i = 0; $i < $length; $i++ ) {
	        $str .= $characters[rand(0, $characters_length - 1)];
	    }

	    return $str;
	}

	$default_routes = array (
		'/tutor'                                                  => 'tutor',
		'/tutor/'                                                 => 'tutor',
		'/tutor/login/auth'                                       => 'tutor/loginAuth',
		'/tutor/login/auth/'                                      => 'tutor/loginAuth',
		'/tutor/schedule/get'                                     => 'tutor/scheduleGet',
		'/tutor/schedule/view/:num'                               => 'tutor/scheduleView/$1',
		'/tutor/schedule/save/:num'                               => 'tutor/scheduleSave/$1',
		'/tutor/:any'                                             => 'tutor/$1',

		"/{$__CONFIG__['common']['url_private_key']}"             => 'Dashboard',
		"/{$__CONFIG__['common']['url_private_key']}/"            => 'Dashboard',
		"/{$__CONFIG__['common']['url_private_key']}/login"       => 'Dashboard/login',
		"/{$__CONFIG__['common']['url_private_key']}/login/"      => 'Dashboard/login',
		"/{$__CONFIG__['common']['url_private_key']}/login/auth"  => 'Dashboard/loginAuth',
		"/{$__CONFIG__['common']['url_private_key']}/login/auth/" => 'Dashboard/loginAuth',
		"/{$__CONFIG__['common']['url_private_key']}/logout"      => 'Dashboard/logout',
		"/{$__CONFIG__['common']['url_private_key']}/logout/"     => 'Dashboard/logout',
		"/{$__CONFIG__['common']['url_private_key']}/:any"        => '$1',
		"/:any"                                                   => 'default/$1',
		''                                                        => 'default',
	);

	Dispatcher::addRoute( $default_routes );
	UserAuthUser::load( );

	function main ( ) {
		global $__DB_CONFIG__, $__CONFIG__;
		// get the uri string from the query
   		$uri = $_SERVER['QUERY_STRING'];

   		// Make sure special characters are decoded (support non-western glyphs like japanese)
   		$uri = urldecode( $uri );

   		if ( !$__CONFIG__['common']['use_mod_rewrite'] && strpos( $uri, '?' ) !== false ) {
	        $_GET = array( ); // empty $_GET array since we're going to rebuild it

			list( $uri, $get_var ) = explode( '?', $uri );
			$exploded_get          = explode( '&', $get_var );

	        if ( count( $exploded_get ) )  {
	            foreach ( $exploded_get as $get ) {
	                list( $key, $value ) = explode( '=', $get );
	                $_GET[$key] = $value;
	            }
	        }
	    }
	    // We're NOT using mod_rewrite, and there's no question mark wich points to GET variables in combination with site root.
	    else if ( !$__CONFIG__['common']['use_mod_rewrite'] && ( strpos( $uri, '&' ) !== false || strpos( $uri, '=' ) !== false ) ) {
	        $uri = '/';
	    }

	    if ( $__CONFIG__['common']['use_mod_rewrite'] && array_key_exists( 'PAGE', $_GET ) ) {
	        $uri = $_GET['PAGE']; unset( $_GET['PAGE'] );
	    }
	    // We're using mod_rewrite but don't have a WOLFPAGE entry, assume site root.
	    else if ( $__CONFIG__['common']['use_mod_rewrite'] ) {
	    	$uri = '/';
	    }
	    // TODO: evaluate
	    else if ( !$__CONFIG__['common']['use_mod_rewrite'] && array_key_exists( 'PAGE', $_GET ) ) {
	    	$uri = $_GET['PAGE']; unset( $_GET['PAGE'] );
	    }

	    // Needed to allow for ajax calls to backend
	    if ( array_key_exists( 'PAGEAJAX', $_GET ) ) {
	        $uri = "/{$__CONFIG__['common']['url_private_key']}{$_GET['PAGEAJAX']}"; unset( $_GET['PAGEAJAX'] );
	    }

	    // Remove suffix page if founded
    	if ( $__CONFIG__['common']['url_suffix'] !== '' and $__CONFIG__['common']['url_suffix'] !== '/' ) {
        	$uri = preg_replace( '#^(.*)(' . $__CONFIG__['common']['url_suffix'] . '|.json)$#i', '$1', $uri );
    	}

    	// define( 'CURRENT_URI', trim( $uri, '/' ) );

    	if ( $uri != null && $uri[0] != '/' ) $uri = '/'. $uri;

    	if ( Dispatcher::hasRoute( $uri ) ) {
	        Observer::notify( 'dispatch_route_found', $uri );
	        Dispatcher::dispatch( $uri );
	        exit;
	    } else {
	    	page_not_found( );
	    }
	}

	ob_start( );
	main( );
	ob_end_flush( );