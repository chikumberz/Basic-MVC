<?php

    function get_http_authorization_header ( ) {
        $headers = null;

        if ( isset( $_SERVER['Authorization'] ) ) {
            $headers = trim($_SERVER['Authorization'] );
        } else if ( isset( $_SERVER['HTTP_AUTHORIZATION'] ) ) { // Nginx or fast CGI
            $headers = trim( $_SERVER['HTTP_AUTHORIZATION'] );
        } else if ( function_exists( 'apache_request_headers' ) ) {
            $headers_request = apache_request_headers( );
            // Server-side fix for bug in old Android versions (a nice side-effect of this fix means we don't care about capitalization for Authorization)
            $headers_request = array_combine( array_map( 'ucwords', array_keys( $headers_request ) ), array_values( $headers_request ) );

            if ( isset( $headers_request['Authorization'] ) ) {
                $headers = trim( $headers_request['Authorization'] );
            }
        }

        return $headers;
    }

    function get_http_authorization_bearer_token ( ) {
        $headers = get_http_authorization_header( );

        if ( !empty( $headers ) ) {
            if ( preg_match( '/Bearer\s(\S+)/', $headers, $matches ) ) {
                return $matches[1];
            }
        }

        return null;
    }