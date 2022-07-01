<?php

	class DashboardController extends Controller {

	    public function __construct ( ) {
	    	$this->setLayout( 'backend' );
	    	$this->assignToLayout( '__HEADER__', new View( '../helpers/includes/header', array( '__HEADER_HEAD__' => new View( '../helpers/includes/header.backend.head' ))));
	    	$this->assignToLayout( '__FOOTER__', new View( '../helpers/includes/footer' ) );
	    }

	    public function index ( ) {
	    	if ( !UserAuthUser::islogin( ) ) redirectTo( 'login', false, true );

	        $this->display( 'dashboard/index' );
	    }

	    public function login ( ) {
	     	if ( UserAuthUser::islogin( ) ) redirectTo( 'dashboard', false, true );

	     	$this->setLayout( 'blank' );
	        $this->display( 'dashboard/login' );
	    }

	    public function loginAuth ( ) {
	    	if ( UserAuthUser::islogin( ) ) redirectTo( 'dashboard', false, true );

	    	if ( isset( $_POST['username'] ) && isset( $_POST['password'] ) ) {
	    		$username = $_POST['username'];
	    		$password = $_POST['password'];

	    		if ( UserAuthUser::login( $username, $password ) ) {
	    			redirectTo( 'dashboard', false, true );
	    		} else {
		    		redirectTo( 'login', array(
						'id'      => 'login',
						'type'    => 10,
						'class'   => 'danger',
						'content' => 'Invalid username or password.'
		    		), true );
		    	}
		    }

	    	redirectTo( 'login', false, true );
	    }

	    public function logout ( ) {
	     	if ( !UserAuthUser::islogin( ) ) redirectTo( 'dashboard', false, true );

	     	UserAuthUser::logout( );

	     	redirectTo( 'login', false, true );
	    }

  	} // END DashboardController Class