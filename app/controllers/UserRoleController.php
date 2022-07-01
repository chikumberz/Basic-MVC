<?php

	class UserRoleController extends Controller {

	    public function __construct ( ) {
	    	$this->setLayout( 'backend' );
	    	$this->assignToLayout( '__HEADER__', new View( '../helpers/includes/header', array( '__HEADER_HEAD__' => new View( '../helpers/includes/header.backend.head' ))));
	    	$this->assignToLayout( '__FOOTER__', new View( '../helpers/includes/footer' ) );
	    }

	    public function index ( ) {
	    	if ( !UserAuthUser::islogin( ) ) redirectTo( 'login', false, true );
	    	if ( !UserAuthUser::hasPermission( 'user-role-list' ) ) UserAuthUser::redirectPermission( 'dashboard' );

			$search = trim( $_GET['search'] );
			$page   = (int) $_GET['page'] > 0 ? $_GET['page'] : 1;
			$limit  = (int) $_GET['limit'] > 0 ? $_GET['limit'] : 20;
			$where  = '1';

			if ( $search ) {
				$where .= " AND role LIKE '%{$search}%' ";
			}

			$user_roles = UserRole::findAll( array(
		        'where'  => $where,
		        'order'  => 'created_on DESC',
		        'limit'  => $limit,
		        'offset' => ( $page - 1 ) * $limit
		    ));

		    $user_roles_cnt = UserRole::count( array(
		        'where'  => $where,
		    ));

		    $pagination    = new Pagination( $page, $user_roles_cnt, $limit );
		    $pagination->alwaysShowPagination( );
		    $pagination_no = $user_roles_cnt - ( ( $page - 1 ) * $limit );

	        $this->display( 'user-role/index', array(
				'user_roles'     => $user_roles,
				'user_roles_cnt' => $user_roles_cnt,
				'search'         => $search,
				'page'           => $page,
				'limit'          => $limit,
				'pagination'     => $pagination,
				'pagination_no'  => $pagination_no,
	        ));
	    }

	    public function add ( ) {
	    	if ( !UserAuthUser::islogin( ) ) redirectTo( 'login', false, true );
	    	if ( !UserAuthUser::hasPermission( 'user-role-add' ) ) UserAuthUser::redirectPermission( 'dashboard' );

			$STATUS      = UserRole::getAllStatus( );
			$PERMISSIONS = UserAuthUser::getAllPermissions( );

	    	$FORM = array_merge( array(
				'status_id' => UserRole::getStatus( 'Active' ),
	    	), (array) Flash::get( 'data' )[0] );

	    	$this->display( 'user-role/add', array(
				'FORM'        => $FORM,
				'STATUS'      => $STATUS,
				'PERMISSIONS' => $PERMISSIONS,
	        ));
	    }

	    public function edit ( $id = false ) {
	    	if ( !UserAuthUser::islogin( ) ) redirectTo( 'login', false, true );
	    	if ( !UserAuthUser::hasPermission( 'user-role-edit' ) ) UserAuthUser::redirectPermission( 'dashboard' );

			$USER_ROLE   = UserRole::findById( $id );
			$PERMISSIONS = UserAuthUser::getAllPermissions( );

	    	if ( !$USER_ROLE ) {
	    		redirectTo( 'user-role', array(
					'id'      => 'alert',
					'type'    => 10,
					'class'   => 'danger',
					'content' => 'User role not found.'
	    		), true );
	    	}

	    	$STATUS = UserRole::getAllStatus( );

	    	$FORM = array_merge( array(
				'role'        => $USER_ROLE->role,
				'permissions' => $USER_ROLE->getUserRolePermissions( ),
				'status_id'   => $USER_ROLE->status_id,
	    	), (array) Flash::get( 'data' )[0] );

	    	$this->display( 'user-role/edit', array(
				'FORM'        => $FORM,
				'STATUS'      => $STATUS,
				'PERMISSIONS' => $PERMISSIONS,
				'USER_ROLE'   => $USER_ROLE,
	        ));
	    }

	    public function save ( $id = false ) {
	    	if ( !UserAuthUser::islogin( ) ) redirectTo( 'login', false, true );

			global $__CONFIG__;

			$data = array_merge( ['id' => (int) $id], $_POST );

			if ( !array_key_exists( $data['status_id'], UserRole::getAllStatus( ) ) ) {
				redirectTo( true, array(
					'id'      => 'role',
					'type'    => 10,
					'class'   => 'danger',
					'content' => 'Invalid status.'
	    		), true );
			}

	    	if ( $this->store( $data ) ) {
	    		redirectTo( 'user-role', array(
					'id'      => 'alert',
					'type'    => 100,
					'class'   => 'success',
					'content' => 'Successfully save.'
	    		), true );
	    	} else {
	    		redirectTo( true, array(
					'id'      => 'user-role',
					'type'    => 10,
					'class'   => 'danger',
					'content' => 'Error occured while trying to save the user role.'
	    		), true );
	    	}
	    }

	    private function store ( $data ) {
    		$USER_ROLE = UserRole::findById( $data['id'] );

    		if ( !$USER_ROLE ) $USER_ROLE = new UserRole( );

			$USER_ROLE->role      = $data['role'];
			$USER_ROLE->status_id = $data['status_id'];

     		$SAVED = $USER_ROLE->save( );

     		if ( $SAVED ) {
	     		$USER_ROLE->deletePermissions( );

	     		foreach ( $data['permissions'] as $permission ) {
	     			$USER_ROLE_PERMISSION = new UserPermission( array(
						'user_role_id'       => $USER_ROLE->id,
						'user_permission_id' => $permission
	     			));

	     			$USER_ROLE_PERMISSION->save( );
	     		}
	     	}

     		return $SAVED;
    	}

    	public function delete ( $id = false ) {
    		if ( !UserAuthUser::islogin( ) ) redirectTo( 'login', false, true );
	    	if ( !UserAuthUser::hasPermission( 'user-role-delete' ) ) UserAuthUser::redirectPermission( 'dashboard' );

	    	$USER_ROLE = UserRole::findById( $id );

	    	if ( $USER_ROLE ) $USER_ROLE->erase( );

	    	redirectTo( 'user-role', array(
				'id'      => 'alert',
				'type'    => 100,
				'class'   => 'success',
				'content' => 'Successfully deleted.'
    		), true );
    	}

  	} // END UserRoleController Class