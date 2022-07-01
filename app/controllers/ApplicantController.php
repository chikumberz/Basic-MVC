<?php

	class ApplicantController extends Controller {

	    public function __construct ( ) {
	    	$this->setLayout( 'backend' );
	    	$this->assignToLayout( '__HEADER__', new View( '../helpers/includes/header', array( '__HEADER_HEAD__' => new View( '../helpers/includes/header.backend.head' ))));
	    	$this->assignToLayout( '__FOOTER__', new View( '../helpers/includes/footer' ) );
	    }

	    public function index ( ) {
	    	if ( !UserAuthUser::islogin( ) ) redirectTo( 'login', false, true );
	    	if ( !UserAuthUser::hasPermission( 'applicant-list' ) ) UserAuthUser::redirectPermission( 'dashboard' );
	    	$_SESSION['REDIRECT_INDEX_PARAMS'] = $_GET;

	    	$search = trim( $_GET['search'] );
			$page   = (int) $_GET['page'] > 0 ? $_GET['page'] : 1;
			$limit  = (int) $_GET['limit'] > 0 ? $_GET['limit'] : 20;
			$where  = '1';

			if ( $search ) {
				$where .= " AND name LIKE '%{$search}%' OR contact_no LIKE '%{$search}%' ";
			}

			$applicants = Applicant::findAll( array(
		        'where'  => $where,
		        'order'  => 'status_id ASC, created_on ASC',
		        'limit'  => $limit,
		        'offset' => ( $page - 1 ) * $limit
		    ));

		    $applicants_cnt = Applicant::count( array(
		        'where'  => $where,
		    ));

		    $pagination    = new Pagination( $page, $applicants_cnt, $limit );
		    $pagination->alwaysShowPagination( );
		    $pagination_no = $applicants_cnt - ( ( $page - 1 ) * $limit );

	        $this->display( 'applicant/index', array(
				'applicants'      => $applicants,
				'applicants_cnt'  => $applicants_cnt,
				'search'        => $search,
				'page'          => $page,
				'limit'         => $limit,
				'pagination'    => $pagination,
				'pagination_no' => $pagination_no,
	        ));
	    }

	    public function autocomplete ( ) {
	    	$this->checkHttpRequestMethod( 'AJAX' );

	    	if ( UserAuthUser::islogin( ) ) {
				$applicants_list = array( );
				$keyword         = $_GET['term'];
				$where           = ' 1 ';

	    		if ( $keyword ) {
	    			$where .= " AND name LIKE '{$keyword}%' ";
	    		}

	    		$applicants = Applicant::findAll( array(
			        'where'  => $where,
			        'column' => 'id, name',
			        'order'  => 'name ASC',
			        'limit'  => 10,
			        'offset' => 0
			    ));

			    foreach ( $applicants as $applicant ) {
			    	$applicants_list[] = array(
						'id'    => $applicant->id,
						'label' => $applicant->name,
			    	);
			    }

	    		$this->sendHttpResponse( null, $applicants_list );
	    	}

	    	$this->sendHttpResponse( 'User is not login.', null, 190 );
	    }

	    public function add ( ) {
	    	if ( !UserAuthUser::islogin( ) ) redirectTo( 'login', false, true );
	    	if ( !UserAuthUser::hasPermission( 'applicant-add' ) ) UserAuthUser::redirectPermission( 'dashboard' );

	    	$STATUS = Applicant::getAllStatus( );

	    	$FORM = array_merge( array(
				'photo'     => 'Choose file...',
				'video'     => 'Choose file...',
				'status_id' => Applicant::getStatus( 'Active' ),
	    	), (array) Flash::get( 'data' )[0] );

	    	$this->display( 'applicant/add', array(
				'FORM'   => $FORM,
				'STATUS' => $STATUS,
	        ));
	    }

	    public function edit ( $id = false ) {
	    	if ( !UserAuthUser::islogin( ) ) redirectTo( 'login', false, true );
	    	if ( !UserAuthUser::hasPermission( 'applicant-edit' ) ) UserAuthUser::redirectPermission( 'dashboard' );

	    	$APPLICANT = Applicant::findById( $id );

	    	if ( !$APPLICANT ) {
	    		redirectTo( 'applicant', array(
					'id'      => 'alert',
					'type'    => 10,
					'class'   => 'danger',
					'content' => 'User not found.'
	    		), true );
	    	}

	    	$STATUS = Applicant::getAllStatus( );

	    	$FORM = array_merge( array(
				'name'         => $APPLICANT->name,
				'facebook_url' => $APPLICANT->facebook_url,
				'contact_no'   => $APPLICANT->contact_no,
				'status_id'    => $APPLICANT->status_id,
	    	), (array) Flash::get( 'data' )[0] );

	    	$this->display( 'applicant/edit', array(
				'FORM'      => $FORM,
				'STATUS'    => $STATUS,
				'APPLICANT' => $APPLICANT,
	        ));
	    }

	    public function save ( $id = false ) {
	    	if ( !UserAuthUser::islogin( ) ) redirectTo( 'login', false, true );

			global $__CONFIG__;

			$data = array_merge( ['id' => (int) $id], $_POST, $_FILES );

			if ( !array_key_exists( $data['status_id'], Teacher::getAllStatus( ) ) ) {
				redirectTo( true, array(
					'id'      => 'applicant',
					'type'    => 10,
					'class'   => 'danger',
					'content' => 'Invalid status.'
	    		), true );
			}

	    	if ( $this->store( $data ) ) {
	    		redirectTo( 'applicant', array(
					'id'      => 'alert',
					'type'    => 100,
					'class'   => 'success',
					'data'    => $_SESSION['REDIRECT_INDEX_PARAMS'],
					'content' => 'Successfully save.'
	    		), true );
	    	} else {
	    		redirectTo( true, array(
					'id'      => 'applicant',
					'type'    => 10,
					'class'   => 'danger',
					'content' => 'Error occured while trying to save the applicant.'
	    		), true );
	    	}
	    }

	    private function store ( $data ) {
    		$APPLICANT = Applicant::findById( $data['id'] );

    		if ( !$APPLICANT ) $APPLICANT = new Applicant( );

			$APPLICANT->name         = $data['name'];
			$APPLICANT->facebook_url = $data['facebook_url'];
			$APPLICANT->contact_no   = $data['contact_no'];
			$APPLICANT->status_id    = $data['status_id'];

     		return $APPLICANT->save( );
    	}

    	public function delete ( $id = false ) {
    		if ( !UserAuthUser::islogin( ) ) redirectTo( 'login', false, true );
	    	if ( !UserAuthUser::hasPermission( 'applicant-delete' ) ) UserAuthUser::redirectPermission( 'dashboard' );

	    	$APPLICANT = Applicant::findById( $id );

	    	if ( $APPLICANT ) $APPLICANT->erase( );

	    	redirectTo( 'applicant', array(
				'id'      => 'alert',
				'type'    => 100,
				'class'   => 'success',
				'data'    => $_SESSION['REDIRECT_INDEX_PARAMS'],
				'content' => 'Successfully deleted.'
    		), true );
    	}

  	} // END ApplicantController Class