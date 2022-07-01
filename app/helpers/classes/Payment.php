<?php
	
	class Payment {
		private static $api_url       = 'https://test.oppwa.com/v1/payments';

		private static $api_id        = '8ac7a4c86783997f01678bf54b550b29'; 
		private static $api_password  = '4barYkztR4'; 
		private static $api_entity_id = '8ac7a4c86783997f01678bf81dad0b31'; 

		protected static $curl_handle  = false;

		public static function pay ( $data = array( ) ) {
			if ( empty( $data ) ) return false;

			$data['authentication.userId']   = self::$api_id;
			$data['authentication.password'] = self::$api_password;
			$data['authentication.entityId'] = self::$api_entity_id;

			self::$curl_handle = curl_init( );

			curl_setopt( self::$curl_handle, CURLOPT_URL, self::$api_url );
			curl_setopt( self::$curl_handle, CURLOPT_POST, 1 );
			curl_setopt( self::$curl_handle, CURLOPT_POSTFIELDS, http_build_query( $data ) );
			curl_setopt( self::$curl_handle, CURLOPT_SSL_VERIFYPEER, false ); // this should be set to true in production
			curl_setopt( self::$curl_handle, CURLOPT_RETURNTRANSFER, true );

			return self::_result( );
		}

		public static function status ( $id = false ) {
			if ( !$id ) return false;

			$data['authentication.userId']   = self::$api_id;
			$data['authentication.password'] = self::$api_password;
			$data['authentication.entityId'] = self::$api_entity_id;

			self::$curl_handle = curl_init( );

			curl_setopt( self::$curl_handle, CURLOPT_URL, self::$api_url . "/{$id}?" . http_build_query( $data ) );
			curl_setopt( self::$curl_handle, CURLOPT_CUSTOMREQUEST, 'GET' );
			curl_setopt( self::$curl_handle, CURLOPT_SSL_VERIFYPEER, false ); // this should be set to true in production
			curl_setopt( self::$curl_handle, CURLOPT_RETURNTRANSFER, true );

			return self::_result( );
		}

		private static function _result ( ) {
			$curl_result = curl_exec( self::$curl_handle );
			$curl_error  = curl_error( self::$curl_handle );

			curl_close( self::$curl_handle ); self::$curl_handle = false;

			if ( $curl_error ) {
	            return (object) array( 'error' => "CURL Error #: {$curl_error}" );
	        } else {
	            return json_decode( $curl_result );
	        }
		}	
	}