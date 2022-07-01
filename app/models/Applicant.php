<?php

	class Applicant extends Database {
		const TABLE_NAME = 'applicant';

		public $id;
		public $name;
		public $facebook_url;
		public $contact;
		public $status_id;
		public $created_on;

		public static $__STATUS__ = array(
			0   => 'Pending',
			10  => 'Contacted',
			100 => 'Done',
		);

		public function __construct ( $data = array( ) ) {
			parent::__construct( $data );
		}

		public function beforeInsert ( ) {
			$this->created_on    = date( 'Y-m-d H:i:s' );

			return true;
		}

		public function beforeUpdate ( ) {
			$this->updated_on    = date( 'Y-m-d H:i:s' );

			return true;
		}

		public function beforeSave ( ) {
			return true;
		}

		public function afterSave ( ) {
			return true;
		}

		public static function getAllStatus (  ) {
			return self::$__STATUS__;
		}

		public static function getStatusByKey ( $key = false ) {
			$status = self::getAllStatus( );

			if ( array_key_exists( $key, $status ) ) {
				return $status[$key];
			}

			return false;
		}

		public static function getStatus ( $needle = false ) {
			return array_search( $needle, self::getAllStatus( ) );
		}

	} // END Applicant Class