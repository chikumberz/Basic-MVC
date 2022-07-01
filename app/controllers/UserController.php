<?php

	class UserController extends Controller {

	    public function __construct ( ) {
	    	$this->setLayout( 'backend' );
	    	$this->assignToLayout( '__HEADER__', new View( '../helpers/includes/header', array( '__HEADER_HEAD__' => new View( '../helpers/includes/header.backend.head' ))));
	    	$this->assignToLayout( '__FOOTER__', new View( '../helpers/includes/footer' ) );
	    }

	    public function index ( ) {
	    	if ( !UserAuthUser::islogin( ) ) redirectTo( 'login', false, true );
	    	if ( !UserAuthUser::hasPermission( 'user-list' ) ) UserAuthUser::redirectPermission( 'dashboard' );
	    	$_SESSION['REDIRECT_INDEX_PARAMS'] = $_GET;

	    	$search = trim( $_GET['search'] );
			$page   = (int) $_GET['page'] > 0 ? $_GET['page'] : 1;
			$limit  = (int) $_GET['limit'] > 0 ? $_GET['limit'] : 20;
			$where  = '1';

			if ( $search ) {
				$where .= " AND username LIKE '%{$search}%' OR name LIKE '%{$search}%' OR email LIKE '%{$search}%' ";
			}

			$users = User::findAll( array(
		        'where'  => $where,
		        'order'  => 'created_on ASC',
		        'limit'  => $limit,
		        'offset' => ( $page - 1 ) * $limit
		    ));

		    $users_cnt = User::count( array(
		        'where'  => $where,
		    ));

		    $pagination    = new Pagination( $page, $users_cnt, $limit );
		    $pagination->alwaysShowPagination( );
		    $pagination_no = $users_cnt - ( ( $page - 1 ) * $limit );

	        $this->display( 'user/index', array(
				'users'         => $users,
				'users_cnt'     => $users_cnt,
				'search'        => $search,
				'page'          => $page,
				'limit'         => $limit,
				'pagination'    => $pagination,
				'pagination_no' => $pagination_no,
	        ));
	    }

	    public function add ( ) {
	    	if ( !UserAuthUser::islogin( ) ) redirectTo( 'login', false, true );
	    	if ( !UserAuthUser::hasPermission( 'user-add' ) ) UserAuthUser::redirectPermission( 'dashboard' );

	    	$ROLES = UserRole::findAll( array(
	    		'where' => 'status_id = :status_id',
	    		'order' => 'role ASC',
	    	), array(
	    		'status_id' => UserRole::getStatus( 'Active' )
	    	));

	    	$STATUS = User::getAllStatus( );

	    	$FORM = array_merge( array(
				'photo'     => 'Choose file...',
				'status_id' => User::getStatus( 'Active' ),
	    	), (array) Flash::get( 'data' )[0] );

	    	$this->display( 'user/add', array(
				'FORM'   => $FORM,
				'ROLES'  => $ROLES,
				'STATUS' => $STATUS,
	        ));
	    }

	    public function edit ( $id = false ) {
	    	if ( !UserAuthUser::islogin( ) ) redirectTo( 'login', false, true );
	    	if ( !UserAuthUser::hasPermission( 'user-edit' ) ) UserAuthUser::redirectPermission( 'dashboard' );

	    	$USER = User::findById( $id );

	    	if ( !$USER ) {
	    		redirectTo( 'user', array(
					'id'      => 'alert',
					'type'    => 10,
					'class'   => 'danger',
					'content' => 'User not found.'
	    		), true );
	    	}

	    	$ROLES = UserRole::findAll( array(
	    		'where' => 'status_id = :status_id',
	    		'order' => 'role ASC',
	    	), array(
	    		'status_id' => UserRole::getStatus( 'Active' )
	    	));

	    	$STATUS = User::getAllStatus( );

	    	$FORM = array_merge( array(
				'photo'        => $USER->photo ? $USER->photo : 'Choose file...',
				'username'     => $USER->username,
				'name'         => $USER->name,
				'email'        => $USER->email,
				'status_id'    => $USER->status_id,
				'user_role_id' => $USER->user_role_id,
	    	), (array) Flash::get( 'data' )[0] );

	    	$this->display( 'user/edit', array(
				'FORM'   => $FORM,
				'USER'   => $USER,
				'ROLES'  => $ROLES,
				'STATUS' => $STATUS,
	        ));
	    }

	    public function save ( $id = false ) {
	    	if ( !UserAuthUser::islogin( ) ) redirectTo( 'login', false, true );

			global $__CONFIG__;

			$data = array_merge( ['id' => (int) $id], $_POST, $_FILES );

			$ROLE = UserRole::findById( $data['user_role_id'] );

			if ( !$ROLE ) {
				redirectTo( true, array(
					'id'      => 'user',
					'type'    => 10,
					'class'   => 'danger',
					'content' => 'User role not found.'
	    		), true );
			}

			if ( !$id ) {
				if ( !$data['password'] ) {
					redirectTo( true, array(
						'id'      => 'teacher',
						'type'    => 10,
						'class'   => 'danger',
						'content' => 'Password required.'
		    		), true );
				}
			}

			if ( $data['password'] ) {
				if ( $data['password'] != $data['password_confirm'] ) {
					redirectTo( true, array(
						'id'      => 'user',
						'type'    => 10,
						'class'   => 'danger',
						'content' => 'Password did not match.'
		    		), true );
				}
			}

			if ( !array_key_exists( $data['status_id'], User::getAllStatus( ) ) ) {
				redirectTo( true, array(
					'id'      => 'user',
					'type'    => 10,
					'class'   => 'danger',
					'content' => 'Invalid status.'
	    		), true );
			}

			if ( $data['photo']['name'] ) {
				$file                  = $data['photo'];
				$file_path_upload      = $__CONFIG__['directory']['upload']['path'] . 'user/photo/';
				$file_directory_upload = $__CONFIG__['directory']['upload']['dir'] . 'user/photo/';
				$file_info             = preg_replace( '/[^a-zA-Z0-9_\-.]/', '', strtolower( $file['name'] ) );
				$file_info             = explode( '.', $file_info );
				$file_name             = $file_info[0];
				$file_extension        = $file_info[1];
				$file_tmp              = $file['tmp_name'];
				$file_size             = $file['size'];
				$file_soure_name       = $file_name . '.' . $file_extension;
				$file_soure            = $file_directory_upload . $file_soure_name;
				$file_distination_name = $file_name . '-' . time( ) . '.' . $file_extension;
				$file_distination      = $file_directory_upload . $file_distination_name;
				$file_url              = $file_path_upload . $file_distination_name;

				if ( !file_exists( $file_directory_upload ) ) {
					mkdir( $file_directory_upload, 0755, true );
				}

				if ( $file['error'] ) {
					redirectTo( true, array(
						'id'      => 'user',
						'type'    => 10,
						'class'   => 'danger',
						'content' => 'Error on uploading user photo.'
		    		), true );
				}

				if ( !preg_match( '(gif|jpe?g|png)', $file_extension ) ) {
					redirectTo( true, array(
						'id'      => 'user',
						'type'    => 10,
						'class'   => 'danger',
						'content' => 'Invalid file type. Only images is allowed.'
		    		), true );
				}

				if ( file_exists( $file_distination ) ) {
					redirectTo( true, array(
						'id'      => 'user',
						'type'    => 10,
						'class'   => 'danger',
						'content' => 'User photo already exists.'
		    		), true );
				}

				if ( move_uploaded_file( $file_tmp, $file_soure ) ) {
					image_resize( $file_soure, null, 750, 800, true, $file_distination );

					$data['photo'] = $file_distination_name;
				} else {
					redirectTo( true, array(
						'id'      => 'user',
						'type'    => 10,
						'class'   => 'danger',
						'content' => 'Error on uploading user photo.'
		    		), true );
				}
     		} else { unset( $data['photo'] ); }

	    	if ( $this->store( $data ) ) {
	    		redirectTo( 'user', array(
					'id'      => 'alert',
					'type'    => 100,
					'class'   => 'success',
					'data'    => $_SESSION['REDIRECT_INDEX_PARAMS'],
					'content' => 'Successfully save.'
	    		), true );
	    	} else {
	    		redirectTo( true, array(
					'id'      => 'user',
					'type'    => 10,
					'class'   => 'danger',
					'content' => 'Error occured while trying to save the user.'
	    		), true );
	    	}
	    }

	    private function store ( $data ) {
    		$USER = User::findById( $data['id'] );

    		if ( !$USER ) $USER = new User( );

			$USER->name         = $data['name'];
			$USER->email        = $data['email'];
			$USER->username     = $data['username'];
			$USER->status_id    = $data['status_id'];
			$USER->user_role_id = $data['user_role_id'];

			if ( $data['quickblox_no'] ) {
				$USER->quickblox_no = $data['quickblox_no'];
				$USER->quickblox_id = $data['quickblox_id'];
				$USER->quickblox_pw = $data['quickblox_pw'];
			}

			if ( $data['password'] ) {
				$hashed_password              = UserAuthUser::generateHashedPassword( $data['password'] );
				$hashed_password_salt         = UserAuthUser::generateHashedSalt( );
				$hashed_password_salt_combine = UserAuthUser::generateHashedPasswordSalt( $hashed_password, $hashed_password_salt );

				$USER->password      = $hashed_password_salt_combine;
				$USER->password_salt = $hashed_password_salt;
			}

     		if ( $data['photo'] ) {
     			if ( $USER->photo ) $USER->deletePhoto( );

     			$USER->photo = $data['photo'];
     		}

     		return $USER->save( );
    	}

    	public function delete ( $id = false ) {
    		if ( !UserAuthUser::islogin( ) ) redirectTo( 'login', false, true );
	    	if ( !UserAuthUser::hasPermission( 'user-delete' ) ) UserAuthUser::redirectPermission( 'dashboard' );

	    	$USER = User::findById( $id );

	    	if ( $USER ) $USER->erase( );

	    	redirectTo( 'user', array(
				'id'      => 'alert',
				'type'    => 100,
				'class'   => 'success',
				'data'    => $_SESSION['REDIRECT_INDEX_PARAMS'],
				'content' => 'Successfully deleted.'
    		), true );
    	}

  	} // END UserController Class