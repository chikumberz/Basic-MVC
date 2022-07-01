<?php

	class UserRole extends Database {
		const TABLE_NAME = 'user_role';

		public $id;
		public $role;
		public $status_id;
		public $created_on;
		public $created_by_id;
		public $updated_on;
		public $updated_by_id;

		public static $__STATUS__ = array(
			10  => 'Inactive',
			100 => 'Active',
		);

		public function __construct ( $data = array( ) ) {
			parent::__construct( $data );

			$this->getUserRolePermissions( );
			$this->afterSave( );
		}

		public function beforeSave ( ) {
			return true;
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

		public function afterSave ( ) {
			$this->created_on_s  = strtotime( $this->created_on );
			$this->updated_on_s  = strtotime( $this->updated_on );

			return true;
		}

		public function beforeDelete ( ) {
			$this->deletePermissions( );

			return true;
		}

		public function deletePermissions ( ) {
			return UserPermission::delete( array(
     			'where' => 'user_role_id = :user_role_id'
     		), array(
     			'user_role_id' => $this->id
     		));
		}

		public function getUserRolePermissions ( ) {
			$user_role_permissions = UserPermission::findAll( array(
				'where' => 'user_role_id = :user_role_id',
			), array(
				'user_role_id' => $this->id
			));

			$this->user_role_permissions = array( );

			foreach ( $user_role_permissions as $key => $permission ) {
				$this->user_role_permissions[$permission->user_permission_id] = $permission;
			}

			return $this->user_role_permissions;
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

	} // END UserRole Class