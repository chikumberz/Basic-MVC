<?php

	class Flash {
    	const SESSION_KEY = 'framework_flash';
	    private static $SESSION_VALUE = array( ); // Data that prevous page left in the Flash

	    /**
	     * Returns a specific variable from the Flash service.
	     *
	     * If the value is not found, NULL is returned instead.
	     * @todo Return false instead?
	     *
	     * @param string $key   Variable name
	     * @return mixed        Value of the variable stored in the Flash service.
	     */
	    public static function get ( $key ) {
	        return isset( self::$SESSION_VALUE[$key] ) ? self::$SESSION_VALUE[$key] : null;
	    }

	    /**
	     * Adds specific variable to the Flash service.
	     *
	     * This variable will be available on the next page unless removed with the
	     * removeVariable() or clear() methods.
	     *
	     * @param string $key   Variable name
	     * @param mixed $value  Variable value
	     */
	    public static function set ( $key, $value ) {
	        $_SESSION[self::SESSION_KEY][$key][] = $value;
	    }

	    /**
	     * Adds specific variable to the Flash service.
	     *
	     * This variable will be available on the current page only.
	     *
	     * @param string $key   Variable name
	     * @param mixed $value  Variable value
	     */
	    public static function setNow ( $key, $value ) {
	        self::$SESSION_VALUE[$key][] = $value;
	    }

	    /**
	     * Clears the Flash service.
	     *
	     * Data that previous pages stored will not be deleted, just the data that
	     * this page stored itself.
	     */
	    public static function clear ( ) {
	        $_SESSION[self::SESSION_KEY] = array( );
	    }

	    /**
	     * Initializes the Flash service.
	     *
	     * This will read flash data from the $_SESSION variable and load it into
	     * the self::previous array.
	     */
	    public static function init ( ) {
	        // Get flash data...
	        if ( !empty( $_SESSION[self::SESSION_KEY] ) && is_array( $_SESSION[self::SESSION_KEY] ) ) {
	            self::$SESSION_VALUE = $_SESSION[self::SESSION_KEY];
	        }

	        $_SESSION[self::SESSION_KEY] = array( );
	    }
	}

	/**
	 * Redirects this page to a specified URL.
	 *
	 * @param string $url
	 */
	function redirectTo ( $url = true, $msg = false, $is_admin = false ) {
		global $_GET, $_POST;

		$hash = false;

		if ( isset( $msg['hash'] ) ) {
			$hash = $msg['hash'];
		}

		if ( $url ) {
			if ( is_bool( $url ) && $url == true ) {
				$url  = $_SERVER['HTTP_REFERER'];
				$url .= $hash;
			} else {
				$url = getUrl( $url, $msg['data'], $hash, $is_admin );
			}

		    Flash::set( 'HTTP_REFERER', urlencode( $url ) );
		}

	 	if ( is_array( $msg ) && $msg['id'] ) {
			Flash::set( $msg['id'], $msg );
		}

		Flash::set( 'data', array_merge( (array) $_GET, (array) $_POST ) );

	    header( 'Location: ' . $url );
	    exit( );
	}