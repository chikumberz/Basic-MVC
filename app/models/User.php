<?php

	class User extends Database {
		const TABLE_NAME = 'user';

		public $id;
		public $username;
		public $password;
		public $password_salt;
		public $name;
		public $email;
		public $photo;
		public $quickblox_no;
		public $quickblox_id;
		public $quickblox_pw;
		public $status_id;
		public $is_login;
		public $last_login;
		public $last_active;
		public $created_on;
		public $updated_on;

		public static $__STATUS__ = array(
			10  => 'Inactive',
			100 => 'Active',
		);

		public function __construct ( $data = array( ) ) {
			parent::__construct( $data );

			$this->getUserRole( );
			$this->afterSave( );
		}

		public function beforeInsert ( ) {
			$this->created_on    = date( 'Y-m-d H:i:s' );
			$this->created_by_id = UserAuthUser::getId( );

			return true;
		}

		public function beforeUpdate ( ) {
			$this->updated_on    = date( 'Y-m-d H:i:s' );
			$this->updated_by_id = UserAuthUser::getId( );

			return true;
		}

		public function beforeSave ( ) {
			return true;
		}

		public function afterSave ( ) {
			$this->last_login_s  = strtotime( $this->last_login );
			$this->last_active_s = strtotime( $this->last_active );
			$this->created_on_s  = strtotime( $this->created_on );
			$this->updated_on_s  = strtotime( $this->updated_on );

			return true;
		}

		public function beforeDelete ( ) {
     		$this->deletePhoto( );

			return true;
		}

		public function deletePhoto ( ) {
			global $__CONFIG__;

     		if ( $this->photo ) unlink( $__CONFIG__['directory']['upload']['dir'] . 'user/photo/' . $this->photo );
     		else $__CONFIG__['directory']['theme']['images']['path'] . 'logo.png';

     		return true;
		}

		public function getUserRole ( ) {
			$this->user_role = UserRole::findById( $this->user_role_id );
		}

		public function getPhotoLink ( ) {
			global $__CONFIG__;

			$this->photo_link = ( $this->photo ) ? ( strpos( $this->photo, '://' ) ? $this->photo : $__CONFIG__['directory']['upload']['path'] . 'user/photo/' . $this->photo ) : $__CONFIG__['directory']['theme']['images']['path'] . 'logo.png';

			return $this->photo_link;
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

	} // END User Class