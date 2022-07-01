<?php

	class UserAuthUser extends User {
		const SESSION_KEY   = 'USER_AUTH_USER';

		static protected $user                    = false;
		static protected $user_id                 = false;
		static protected $user_is_login           = false;
		static protected $user_is_active          = false;
		static protected $user_login_failure_max  = 3;
		static protected $user_login_failure_time = 1800;
		static protected $user_permissions        = array(
			'user' => array(
				'User',
				'user-list'   => 'List',
				'user-add'    => 'Add',
				'user-edit'   => 'Edit',
				'user-delete' => 'Delete',
			),
			'role' => array(
				'User Role',
				'user-role-list'   => 'List',
				'user-role-add'    => 'Add',
				'user-role-edit'   => 'Edit',
				'user-role-delete' => 'Delete',
			),
			'applicant' => array(
				'Applicant',
				'applicant-list'   => 'List',
				'applicant-add'    => 'Add',
				'applicant-edit'   => 'Edit',
				'applicant-delete' => 'Delete',
			),
		);

		public static function load ( ) {
			$user  = false;

			if ( isset( $_SESSION[self::SESSION_KEY] ) && isset( $_SESSION[self::SESSION_KEY]['id'] ) ) {
				$user = self::findById( $_SESSION[self::SESSION_KEY]['id'] );
			}

			if ( $user ) {
				return self::setInfos( $user );
			} else {
				return self::logout( );
			}
		}

		public static function login ( $username = false, $password = false ) {
			if ( $username && $password ) {
				$USER = self::findBy( 'username = :username OR email = :username', array( 'username' => $username ) );

				if ( is_object( $USER ) ) {
					$password_protected      = $USER->password;
					$password_protected_salt = $USER->password_salt;
					$password                = self::generateHashedPassword( $password );
					$password_public         = self::generateHashedPasswordSalt( $password, $password_protected_salt );

					if ( $password_protected == $password_public ) {
						if ( $USER->status_id == self::getStatus( 'Active' ) ) {
							return self::setInfos( $USER  );
						}
					}
				}
			}

			self::setLoginFailureCnt( );

			return false;
		}

		public static function logout (  ) {
			if ( self::isLogin( ) ) {
				$user_data = new User( array(
					'id'          => (int) self::getId( ),
					'is_login'    => (int) false,
					'last_login'  => date( 'Y-m-d H:i:s' ),
					'last_active' => date( 'Y-m-d H:i:s' )
				));
				$user_data->save( );
			}

			unset( $_SESSION[self::SESSION_KEY] );

			self::$user           = false;
			self::$user_id        = false;
			self::$user_is_active = false;
			self::$user_is_login  = false;

			return true;
		}

		public static function getLoginFailureMax ( ) {
			return self::$user_login_failure_max;
		}

		public static function getLoginFailureCnt ( ) {
			return (int) $_COOKIE['USER_LOGIN_FAILURE_CNT'];
		}

		public static function setLoginFailureCnt ( ) {
			setcookie( 'USER_LOGIN_FAILURE_CNT',
				(
					isset( $_COOKIE['USER_LOGIN_FAILURE_CNT'] )
						? $_COOKIE['USER_LOGIN_FAILURE_CNT'] + 1
						: 1
				),
				time( ) + self::$user_login_failure_time
			);
		}

		public static function unsetLoginFailureCnt ( ) {
			setcookie( 'USER_LOGIN_FAILURE_CNT', 0, time( ) - self::$user_login_failure_time );
		}

		public static function isLoginFailureCntExceededMax ( ) {
			return ( self::getLoginFailureCnt( ) >= self::$user_login_failure_max ) ? true : false;
		}

		public static function setInfos ( $user ) {
			$_SESSION[self::SESSION_KEY]['id']          = $user->id;
			$_SESSION[self::SESSION_KEY]['last_login']  = $user->last_login;
			$_SESSION[self::SESSION_KEY]['last_active'] = date( 'Y-m-d H:i:s' );

			self::$user           = $user;
			self::$user_id        = $user->id;
			self::$user_is_login  = true;
			self::$user_is_active = ( $user->status_id == self::getStatus( 'Active' ) ) ? true : false;

			$user_data = new User( array(
				'id'          => (int) $user->id,
				'is_login'    => (int) true,
				'last_login'  => date( 'Y-m-d H:i:s' ),
				'last_active' => date( 'Y-m-d H:i:s' ),
			));
			$user_data->save( );

			return self::$user_is_login;
		}

		public static function getUser ( $key = false ) {
			if ( $key ) {
				if ( isset( self::$user->$key ) ) {
					return self::$user->$key;
				} else {
					return false;
				}
			} else {
				return self::$user;
			}
		}

		public static function getToken ( ) {
			return self::$user_token;
		}

		public static function getTokenIssued ( ) {
			return self::$user_token_iat;
		}

		public static function getTokenExpiration ( ) {
			return self::$user_token_exp;
		}

		public static function getId (  ) {
			return self::$user_id;
		}

		public static function isLogin ( ) {
			return self::$user_is_login;
		}

		public static function isActive ( ) {
			return self::$user_is_active;
		}

		public static function getAllPermissions ( ) {
			return self::$user_permissions;
		}

		public static function hasPermission ( $permission ) {
			$user_role = self::$user->user_role;

			if ( is_object( $user_role ) ) {
				$user_role_permissions = self::$user->user_role->user_role_permissions;

				if ( !empty( $user_role_permissions ) ) {
					if ( array_key_exists( $permission, $user_role_permissions ) ) {
						return true;
					}
				}
			}

			return false;
		}

		public static function redirectPermission ( $url, $admin = true, $message = 'You don\'t have permission to access.' ) {
			redirectTo( $url, array(
				'id'      => 'alert',
				'type'    => 10,
				'class'   => 'danger',
				'content' => $message
			), $admin );

			return;
		}

		public static function generateHashedPassword ( $password ) {
			return self::generateHashed( $password );
		}

		public static function generateHashedSalt ( $max = 32 ) {
			$base = rand( 0, 1000000 ) . microtime( true ) . rand( 0, 1000000 ) . rand( 0, microtime( true ) );
			$salt = self::generateHashed( $base );

			if ( $max < 32 ) {
				$salt = substr( $salt, 0, $max );
			}

			if ( $max > 32 ) {
				$salt = substr( $salt, 0, $max );
			}

			return $salt;
		}

		public static function generateHashedPasswordSalt ( $password, $salt ) {
			return self::generateHashed( $password . $salt );
		}

		public static function generateHashed ( $value ) {
			return hash( 'sha512', $value );
		}

	} // END UserAuthUser Class