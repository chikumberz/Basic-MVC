<?php

	class DefaultController extends Controller {

	    public function __construct ( ) {
	    	$this->setLayout( 'blank' );
	    	$this->assignToLayout( '__HEADER__', new View( '../helpers/includes/header.default', array( '__HEADER_HEAD__' => new View( '../helpers/includes/header.default.head' ))));
	    	$this->assignToLayout( '__FOOTER__', new View( '../helpers/includes/footer' ) );
	    }

	    public function blank ( ) {
	        $this->display( 'default/blank' );
	    }

	    public function index ( ) {
	        $this->display( 'default/index' );
	    }

	    public function apply ( ) {
	        $this->display( 'default/apply' );
	    }

	    public function finish ( ) {
	        $this->display( 'default/finish' );
	    }

	    public function save ( ) {
	    	global $__CONFIG__;

			$data = array_merge( $_POST, $_FILES );

			$validator = new FormValidator( );
			$validator->addValidation( 'name', 'req', 'Name is required.' );
			$validator->addValidation( 'facebook_url', 'req', 'Facebook URL is required.' );
			$validator->addValidation( 'contact_no', 'req', 'Contact number is invalid.' );

			$__FORM_ERROR__ = false;

		    if ( !$validator->validateForm( ) ) {
		        foreach ( $validator->getErrors( ) as $error ) {
		           Flash::set( 'apply', array(
		                'type'    => 10,
		                'class'   => 'danger',
		                'content' => $error
		            ));
		        }

		        $__FORM_ERROR__ = true;
		    }

		    if ( $__FORM_ERROR__ ) redirectTo( true );

			if ( $this->store( $data ) ) {
	    		redirectTo( 'finish' );
	    	} else {
	    		redirectTo( true, array(
					'id'      => 'alert',
					'type'    => 10,
					'class'   => 'danger',
					'content' => 'Error occured while trying to save yout information.'
	    		));
	    	}
	    }

	    private function store ( $data ) {
    		$APPLICANT = Applicant::findById( $data['id'] );

    		if ( !$APPLICANT ) $APPLICANT = new Applicant( );

			$APPLICANT->name         = $data['name'];
			$APPLICANT->facebook_url = $data['facebook_url'];
			$APPLICANT->contact_no   = $data['contact_no'];
			$APPLICANT->status_id    = 0;

     		return $APPLICANT->save( );
    	}

	    public function img ( ) {
	    	global $__CONFIG__;

			$url     = $_GET['url'];
			$width   = (int) $_GET['w'];
			$height  = (int) $_GET['h'];
			$use_ssl = (int) $_GET['use_ssl'];

			if ( !$url ) page_not_found( );
			if ( !$width ) return false;
			if ( !$height ) return false;
			if ( !$use_ssl ) $url = str_replace( 'https', 'http', $url );

			$url_check = getimagesize( $url );

			// Check URL if it's an image
			if ( !in_array( $url_check[2], array( IMAGETYPE_JPEG, IMAGETYPE_PNG ) ) ) {
				page_not_found( );
			}

			$file                  = basename( $url );
			$file_path_upload      = $__CONFIG__['directory']['upload']['path'] . 'tmp/';
			$file_directory_upload = $__CONFIG__['directory']['upload']['dir'] . 'tmp/';
			$file_info             = preg_replace( '/[^a-zA-Z0-9_\-.]/', '', strtolower( $file ) );
			$file_info             = explode( '.', $file_info );
			$file_name             = $file_info[0];
			$file_extension        = $file_info[1];
			$file_soure_name       = $file_name . '.' . $file_extension;
			$file_soure            = $file_directory_upload . $file_soure_name;
			$file_distination_name = $file_name . '-' . $width . 'x' . $height . '.' . $file_extension;
			$file_distination      = $file_directory_upload . $file_distination_name;
			$file_url              = $file_path_upload . $file_distination_name;

			if ( !file_exists( $file_directory_upload ) ) {
				mkdir( $file_directory_upload, 0777, true );
			}

			if ( !file_exists( $file_distination ) ) {
				try {
				    $content = file_get_contents( $url );

				    if ( $content === false ) {
				        page_not_found( );
				    }
				} catch ( Exception $e ) {
				    page_not_found( );
				}

				// Sample File: echo urlencode( "http://192.168.0.99/powerenglish/upload/book/page/image/photo-1503431128871-cd250803fa41-1571291527.jpg" );
	    		image_resize( null, $content, $width, $height, true, $file_distination, false );
			}

			$file_distination_mime = image_type_to_mime_type( exif_imagetype( $file_distination ) );

			$fp = fopen( $file_distination, 'rb' );

			header( "Content-type: {$file_distination_mime}" );
			header( "Content-Length: " . filesize( $file_distination ) );

			fpassthru( $fp );

	    	exit();
	    }

  	} // END DefaultController Class