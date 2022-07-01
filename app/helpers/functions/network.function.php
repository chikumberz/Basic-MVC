<?php

    function get_network_client_ip ( ) {
        switch ( true ) {
            case ( !empty( $_SERVER['HTTP_X_REAL_IP'] ) ) : return $_SERVER['HTTP_X_REAL_IP'];
            case ( !empty( $_SERVER['HTTP_CLIENT_IP'] ) ) : return $_SERVER['HTTP_CLIENT_IP'];
            case ( !empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) : return $_SERVER['HTTP_X_FORWARDED_FOR'];
            default : return $_SERVER['REMOTE_ADDR'];
        }
    }

    function network_match ( $network, $ip ) {
        $network = str_replace( ' ', '', trim( $network ) );
        $ip      = str_replace( ' ', '', trim( $ip ) );

        if ( strpos( $network, '*' ) !== false ) {
            if (strpos( $network, '/' ) !== false ) {
                $asParts = explode('/', $network);
                $network = @ $asParts[0];
            }

            $nCount  = substr_count( $network, '*' );
            $network = str_replace( '*', '0', $network );

            if ( $nCount == 1 ) {
                $network .= '/24';
            } else if ( $nCount == 2 ) {
                $network .= '/16';
            } else if ( $nCount == 3 ) {
                $network .= '/8';
            } else if ( $nCount > 3 ) {
                return true; // if *.*.*.*, then all, so matched
            }
        } else {
            if ( $ip == $network ) {
                return true;
            } else {
                return false;
            }
        }

        $d = strpos( $network, '-' );

        if ( $d === false ) {
            $ip_arr = explode( '/', $network );

            if ( !preg_match( "@\d*\.\d*\.\d*\.\d*@", $ip_arr[0], $matches ) ) {
                $ip_arr[0] .= ".0";    // Alternate form 194.1.4/24
            }

            $network_long = ip2long( $ip_arr[0] );
            $x            = ip2long( $ip_arr[1] );
            $mask         = long2ip( $x ) == $ip_arr[1] ? $x : ( 0xffffffff << ( 32 - $ip_arr[1] ) );
            $ip_long      = ip2long( $ip );

            return ( $ip_long & $mask ) == ( $network_long & $mask );
        } else {
            $from = trim( ip2long( substr( $network, 0, $d ) ) );
            $to   = trim( ip2long( substr( $network, $d + 1 ) ) );
            $ip   = ip2long( $ip );

            return ( $ip >= $from and $ip <= $to );
        }
    }