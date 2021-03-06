<?php
	define( 'DS', DIRECTORY_SEPARATOR );

	global $__DB_CONFIG__, $__CONFIG__;

	$__CONFIG__ = array( );

	require_once( __DIR__ . '/variables/configurations/common.php' );

	define( 'ROOT_PATH', 		$__CONFIG__['common']['url_public'] );
	define( 'ROOT_DIRECTORY', 	__DIR__ . '/../' );

	require_once( __DIR__ . '/variables/configurations/directory.php' );
	require_once( __DIR__ . '/variables/configurations/mail.php' );

	require_once( $__CONFIG__['directory']['app']['variables']['configurations']['dir'] . 'database.php' );

	// Initialize Debug
	error_reporting( ( $__CONFIG__['common']['debug'] ? ( E_ALL & ~( E_STRICT | E_NOTICE ) ) : 0 ) );

	// Initialize Time
	ini_set( 'date.timezone', $__CONFIG__['common']['timezone'] );

	if ( function_exists( 'date_default_timezone_set' ) ) {
	    date_default_timezone_set( $__CONFIG__['common']['timezone'] );
	} else {
	    putenv( 'TZ=' . $__CONFIG__['common']['timezone'] );
	}

	/**
	 * The Dispatcher class is responsible for mapping urls/routes to Controller methods.
	 *
	 * Each route that has the same number of directory components as the current
	 * requested url is tried, and the first method that returns a response with a
	 * non false/non null value will be returned via the Dispatcher::dispatch() method.
	 *
	 * For example:
	 *
	 * A route string can be a literal uri such as '/pages/about' or can contain
	 * wildcards (:any or :num) and/or regex like '/blog/:num' or '/page/:any'.
	 *
	 * <code>
	 * Dispatcher::addRoute(array(
	 *      '/' => 'page/index',
	 *      '/about' => 'page/about,
	 *      '/blog/:num' => 'blog/post/$1',
	 *      '/blog/:num/comment/:num/delete' => 'blog/deleteComment/$1/$2'
	 * ));
	 * </code>
	 *
	 * Visiting /about/ would call PageController::about(),
	 * visiting /blog/5 would call BlogController::post(5)
	 * visiting /blog/5/comment/42/delete would call BlogController::deleteComment(5,42)
	 *
	 * The dispatcher is used by calling Dispatcher::addRoute() to setup the route(s),
	 * and Dispatcher::dispatch() to handle the current request and get a response.
	 */
	final class Dispatcher {
		private static $routes        = array( );
		private static $params        = array( );
		private static $status        = array( );
		private static $requested_url = '';

	    /**
	     * Adds a route.
	     *
	     * @param string $route         A route string.
	     * @param string $destination   URI that the request should be sent to.
	     */
	    public static function addRoute ( $route, $destination = null ) {
	        if ( $destination != null && !is_array( $route ) ) {
	            $route = array( $route => $destination );
	        }

	        self::$routes = array_merge( self::$routes, $route );
	    }

	    /**
	     * Checks if a route exists for a specified URI.
	     *
	     * @param string $requested_url
	     * @return boolean Returns true when a route was found, otherwise false.
	     */
	    public static function hasRoute ( $requested_url ) {
	        if ( !self::$routes || count( self::$routes ) == 0 ) {
	            return false;
	        }

	        foreach ( self::$routes as $route => $uri ) {
	            // Convert wildcards to regex
	            if ( strpos( $route, ':' ) !== false ) {
	                $route = str_replace( ':any', '(.+)', str_replace(':num', '([0-9]+)', $route ) );
	            }

	            // Does the regex match?
	            if ( preg_match( '#^' . $route . '$#', $requested_url ) ) {
	                // Do we have a back-reference?
	                if ( strpos( $uri, '$' ) !== false && strpos( $route, '(' ) !== false ) {
	                    $uri = preg_replace( '#^'.$route.'$#', $uri, $requested_url );
	                }

	                self::$params = self::splitUrl( $uri );

	                // We found it, so we can break the loop now!
	                return true;
	            }
	        }

	        return false;
	    }

	    /**
	     * Splits a URL into an array of its components.
	     *
	     * @param string $url   A URL.
	     * @return array        An array of URL components.
	     */
	    public static function splitUrl ( $url ) {
	        return preg_split( '/\//', $url, -1, PREG_SPLIT_NO_EMPTY );
	    }

	    /**
	     * Handles the request for a URL and provides a response.
	     *
	     * @param string $requested_url The URL that was requested.
	     * @param string $default       Default URL to access if now URL was requested.
	     * @return string               A response.
	     */
	    public static function dispatch( $requested_url = null, $default = null ) {
	        Flash::init( );

	        // If no url passed, we will get the first key from the _GET array
	        // that way, index.php?/controller/action/var1&email=example@example.com
	        // requested_url will be equal to: /controller/action/var1
	        if ( $requested_url === null ) {
	            $pos = strpos( $_SERVER['QUERY_STRING'], '&' );

	            if ( $pos !== false ) {
	                $requested_url = substr( $_SERVER['QUERY_STRING'], 0, $pos );
	            } else {
	                $requested_url = $_SERVER['QUERY_STRING'];
	            }
	        }

	        // If no URL is requested (due to someone accessing admin section for the first time)
	        // AND $default is set. Allow for a default tab.
	        if ( $requested_url == null && $default != null ) {
	            $requested_url = $default;
	        }

	        // Requested url MUST start with a slash (for route convention)
	        if ( strpos( $requested_url, '/' ) !== 0 ) {
	            $requested_url = '/' . $requested_url;
	        }

	        self::$requested_url = $requested_url;

	        // This is only trace for debugging
	        self::$status['requested_url'] = $requested_url;

	        // Make the first split of the current requested_url
	        self::$params = self::splitUrl( $requested_url );

	        // Do we even have any custom routing to deal with?
	        if ( count( self::$routes ) === 0 ) {
	            return self::executeAction( self::getController( ), self::getAction( ), self::getParams( ) );
	        }

	        // Is there a literal match? If so we're done
	        if ( isset( self::$routes[$requested_url] ) ) {
	            self::$params = self::splitUrl( self::$routes[$requested_url] );

	            return self::executeAction( self::getController( ), self::getAction( ), self::getParams( ) );
	        }

	        // Loop through the route array looking for wildcards
	        foreach ( self::$routes as $route => $uri ) {
	        // Convert wildcards to regex
	            if ( strpos( $route, ':' ) !== false ) {
	                $route = str_replace( ':any', '(.+)', str_replace( ':num', '([0-9]+)', $route ) );
	            }
	            // Does the regex match?
	            if ( preg_match( '#^' . $route . '$#', $requested_url ) ) {
	            	// Do we have a back-reference?
	                if ( strpos( $uri, '$' ) !== false && strpos( $route, '(') !== false ) {
	                    $uri = preg_replace( '#^' . $route . '$#', $uri, $requested_url );
	                }

	                self::$params = self::splitUrl( $uri );
	                // We found it, so we can break the loop now!
	                break;
	            }
	        }

	        return self::executeAction( self::getController( ), self::getAction( ), self::getParams( ) );
	    } // Dispatch

	    /**
	     * Returns the currently requested URL.
	     *
	     * @return string The currently requested URL.
	     */
	    public static function getCurrentUrl ( ) {
	        return self::$requested_url;
	    }

	    /**
	     * Returns a reference to a controller class.
	     *
	     * @return string Reference to controller.
	     */
	    public static function getController ( $key = false ) {
	        // Check for settable default controller
	        // if it's a plugin and not activated, revert to Wolf hardcoded default
	        if ( isset( self::$params[0] ) && self::$params[0] == 'plugin' ) {
	            $loaded_plugins = Plugin::$plugins;

	            if ( isset( self::$params[1] ) && !isset( $loaded_plugins[self::$params[1]] ) ) {
	                unset( self::$params[0] );
	                unset( self::$params[1] );
	            }
	        }

	        if ( isset( self::$params[0] ) ) {
		        if ( $key == true ) {
		        	$controller = str_replace( '_', '-', Inflector::underscore( self::$params[0] ) );
		        } else {
		        	$controller = lcfirst( Inflector::camelize( str_replace( '-', '_', self::$params[0] ) ) );
		        }
	        } else {
	        	$controller = DEFAULT_CONTROLLER;
	        }

	        return $controller;
	    }

	    /**
	     * Returns the action that was requested from a controller.
	     *
	     * @return string Reference to a controller's action.
	     */
	    public static function getAction ( ) {
	    	if ( isset( self::$params[1] ) ) {
		        if ( $key == true ) {
		        	$action = str_replace( '_', '-', Inflector::underscore( self::$params[1] ) );
		        } else {
		        	$action = lcfirst( Inflector::camelize( str_replace( '-', '_', self::$params[1] ) ) );
		        }
	        } else {
	        	$action = DEFAULT_ACTION;
	        }

	        return $action;
	    }

	    /**
	     * Returns an array of parameters that should be passed to an action.
	     *
	     * @return array The action's parameters.
	     */
	    public static function getParams ( ) {
	        return array_slice( self::$params, 2 );
	    }

	    /**
	     * ???
	     *
	     * @todo Finish docblock
	     *
	     * @param <type> $key
	     * @return <type>
	     */
	    public static function getStatus ( $key = null ) {
	        return ( $key === null ) ? self::$status: ( isset( self::$status[$key] ) ? self::$status[$key]: null );
	    }

	    /**
	     * Executes a specified action for a specified controller class.
	     *
	     * @param string $controller
	     * @param string $action
	     * @param array $params
	     */
	    public static function executeAction ( $controller, $action, $params ) {
			self::$status['controller'] = $controller;
			self::$status['action']     = $action;
			self::$status['params']     = implode( ', ', $params );

			$controller_class      = Inflector::camelize( $controller );
			$controller_class_name = $controller_class . 'Controller';

	        // Get an instance of that controller
	        if ( class_exists( $controller_class_name ) ) {
	            $controller = new $controller_class_name ( );
	        }

	        if ( !$controller instanceof Controller ) {
	            throw new Exception( "Class '{$controller_class_name}' does not extends Controller class!" );
	        }

	        // Execute the action
	        $controller->execute( $action, $params );
	    }
	} // END Dispatcher Class

	/**
	 * The View class is used to generate output based on a template.
	 *
	 * The class takes a template file after which you can assign properties to the
	 * template. These properties become available as local variables in the
	 * template.
	 *
	 * You can then call the display() method to get the output of the template,
	 * or just call print on the template directly thanks to PHP 5's __toString()
	 * magic method.
	 *
	 * Usage example:
	 *
	 * echo new View('my_template',array(
	 *               'title' => 'My Title',
	 *               'body' => 'My body content'
	 *              ));
	 *
	 * Template file example (in this case my_template.php):
	 *
	 * <html>
	 * <head>
	 *   <title><?php echo $title;?></title>
	 * </head>
	 * <body>
	 *   <h1><?php echo $title;?></h1>
	 *   <p><?php echo $body;?></p>
	 * </body>
	 * </html>
	 *
	 * You can also use Helpers in the template by loading them as follows:
	 *
	 * use_helper('HelperName', 'OtherHelperName');
	 */
	class View {
	    private $file;           // String of template file
	    private $vars = array( ); // Array of template variables

	    /**
	     * Constructor for the View class.
	     *
	     * The class constructor has one mandatory parameter ($file) which is the
	     * path to a template file and one optional paramater ($vars) which allows
	     * you to make local variables available in the template.
	     *
	     * The View class automatically adds ".php" to the $file argument.
	     *
	     * @param string $file  Absolute path or path relative to the templates dir.
	     * @param array $vars   Array of key/value pairs to be made available in the template.
	     */
	    public function __construct ( $file, $vars = false ) {
	    	global $__CONFIG__;

	        if ( strpos( $file, '/' ) === 0 || strpos( $file, ':' ) === 1 ) {
	            $this->file = $file . '.php';
	        } else {
	            $this->file = $__CONFIG__['directory']['app']['views']['dir'] . ltrim( $file, '/' ) . '.php';
	        }

	        if ( !file_exists( $this->file ) ) {
	            throw new Exception( "View '{$this->file}' not found!" );
	        }

	        if ( $vars !== false ) {
	            $this->vars = $vars;
	        }
	    }

	    /**
	     * Assigns a specific variable to the template.
	     *
	     * @param mixed $name   Variable name.
	     * @param mixed $value  Variable value.
	     */
	    public function assign ( $name, $value = null ) {
	        if ( is_array( $name ) ) {
	            array_merge( $this->vars, $name );
	        } else {
	            $this->vars[$name] = $value;
	        }
	    }

	    /**
	     * Returns the output of a parsed template as a string.
	     *
	     * @return string Content of parsed template.
	     */
	    public function render ( ) {
	    	global $__CONFIG__;

	        ob_start( );
	        extract( $this->vars, EXTR_SKIP );
	        include $this->file;

	        $content = ob_get_clean( );

	        return $content;
	    }

	    /**
	     * Displays the rendered template in the browser.
	     */
	    public function display( ) { echo $this->render( ); }

	    /**
	     * Returns the parsed content of a template.
	     *
	     * @return string Parsed content of the view.
	     */
	    public function __toString ( ) { return $this->render( ); }
	} // END View Class


	/**
	 * A main controller class to be subclassed.
	 *
	 * The Controller class should be the parent class of all of your Controller
	 * sub classes which contain the business logic of your application like:
	 *      - render a blog post,
	 *      - log a user in,
	 *      - delete something and redirect,
	 *      - etc.
	 *
	 * Using the Dispatcher class you can define what URIs/routes map to which
	 * Controllers and their methods.
	 *
	 * Each Controller method should either:
	 *      - return a string response
	 *      - redirect to another method
	 */
	class Controller {
		protected $layout      = false;
		protected $layout_vars = array();

	    /**
	     * Executes a specified action/method for this Controller.
	     *
	     * @param string $action
	     * @param array $params
	     */
	    public function execute ( $action, $params ) {
	    	// it's a private method of the class or action is not a method of the class
	        if ( substr( $action, 0, 1 ) == '_' || !method_exists( $this, $action ) ) {
	            throw new Exception( "Action '{$action}' is not valid!" );
	        }

	        call_user_func_array( array( $this, $action ), $params );
	    }

	    /**
	     * Sets which layout to use for output.
	     *
	     * @param string $layout
	     */
	    public function setLayout ( $layout ) {
	        $this->layout = $layout;
	    }

	    /**
	     * Assigns a set of key/values pairs to a layout.
	     *
	     * @param mixed $var    An array of key/value pairs or the name of a single variable.
	     * @param string $value The value of the single variable.
	     */
	    public function assignToLayout ( $var, $value ) {
	        if ( is_array( $var ) ) {
	            array_merge( $this->layout_vars, $var );
	        } else {
	            $this->layout_vars[$var] = $value;
	        }
	    }

	    /**
	     * Renders the output.
	     *
	     * @todo Remove? Is this proper OO/good idea?
	     *
	     * @param string $view  Name of the view to render
	     * @param array $vars   Array of variables
	     * @return View
	     */
	    public function render ( $view, $vars = array( ) ) {
	        if ( $this->layout ) {
	            $this->layout_vars['__CONTENT__'] = new View( $view, $vars );

	            return new View( '../layouts/' . $this->layout, $this->layout_vars );
	        } else {
	            return new View( $view, $vars );
	        }
	    }

	    /**
	     * Displays a rendered layout.
	     *
	     * @todo Remove? Is this proper OO/good idea?
	     *
	     * @param <type> $view
	     * @param <type> $vars
	     * @param <type> $exit
	     */
	    public function display ( $view, $vars = array( ), $exit = true ) {
	        echo $this->render( $view, $vars );

	        if ( $exit ) exit;
	    }

	    /**
	     * Renders a JSON encoded response and returns that as a string
	     *
	     * @param mixed $data_to_encode The data being encoded.
	     * @return string               The JSON representation of $data_to_encode.
	     */
	    public function renderJSON ( $data_to_encode ) {
	        if ( function_exists( 'json_encode' ) ) {
                return json_encode( $data_to_encode );
            } else {
                throw new Exception( 'No function or class found to render JSON.' );
            }
	    }

	    public function setHttpStatusCode ( $code, $description ) {
	    	$protocol = isset( $_SERVER['SERVER_PROTOCOL'] ) ? $_SERVER['SERVER_PROTOCOL'] : 'HTTP/1.0';

            header( "{$protocol} {$code}  {$description}" );
	    }

	    public function checkHttpRequestMethod ( $method = 'GET' ) {
	    	if ( get_request_method( ) != $method ) $this->sendHttpRequestUnauthorized( );
	    }

	    public function sendHttpRequestUnauthorized ( ) {
	    	return $this->sendHttpResponse( 'Unauthorized Request.', null, 500, 500, 'Unauthorized Request' );
	    }

	    public function sendHttpResponse ( $message = '', $data = null, $status = 200, $http_code = 200, $http_message = 'OK' ) {
	    	$this->setHttpStatusCode( $http_code, $http_message );

			$data = array(
				'data'        => $data,
				'date'        => date( 'Y-m-d' ),
				'time'        => date( 'H:i:s' ),
				'datetime'    => date( 'Y-m-d H:i:s' ),
				'timeszone'   => date_default_timezone_get( ),
				'timestamp_s' => time( ),
				'status'      => $status,
				'message'     => $message,
				'GET'         => $_GET,
				'POST'        => $_POST,
			);

	    	exit( $this->renderJSON( $data ) );
	    }

	} // END Controller Class

	/**
	 * The Observer class allows for a simple but powerful event system.
	 *
	 * Example of watching/handling an event:
	 *      // Connecting your event hangling function to an event.
	 *      Observer::observe('page_edit_after_save', 'my_simple_observer');
	 *
	 *      // The event handling function
	 *      function my_simple_observer($page) {
	 *          // do what you want to do
	 *          var_dump($page);
	 *      }
	 *
	 * Example of generating an event:
	 *
	 *      Observer::notify('my_plugin_event', $somevar);
	 *
	 */
	final class Observer {
	    static protected $events = array( );

	    /**
	     * Allows an event handler to watch/handle for a spefied event.
	     *
	     * @param string $event_name    The name of the event to watch for.
	     * @param string $callback      The name of the function handling the event.
	     */
	    public static function observe ( $event_name, $callback ) {
	        if ( !isset( self::$events[$event_name] ) ) {
	            self::$events[$event_name] = array( );
	        }

	        self::$events[$event_name][$callback] = $callback;
	    }

	    /**
	     * Allows an event handler to stop watching/handling a specific event.
	     *
	     * @param string $event_name    The name of the event.
	     * @param string $callback      The name of the function handling the event.
	     */
	    public static function stopObserving ( $event_name, $callback ) {
	        if ( isset( self::$events[$event_name][$callback] ) ) {
	            unset( self::$events[$event_name][$callback] );
	        }
	    }

	    /**
	     * Clears all registered event handlers for a specified event.
	     *
	     * @param string $event_name
	     */
	    public static function clearObservers ( $event_name ) {
	        self::$events[$event_name] = array( );
	    }

	    /**
	     * Returns a list of all event handlers handling a specified event.
	     *
	     * @param string $event_name
	     * @return array An array of names for event handlers.
	     */
	    public static function getObserverList ( $event_name ) {
	        return ( isset( self::$events[$event_name] ) ) ? self::$events[$event_name] : array( );
	    }

	    /**
	     * Generates an event with the specified name.
	     *
	     * Note: if your event does not need to process the return values from any
	     *       observers, use this instead of getObserverList().
	     *
	     * @param string $event_name
	     */
	    public static function notify ( $event_name ) {
	        $args = array_slice( func_get_args( ), 1 ); // remove event name from arguments

	        foreach ( self::getObserverList( $event_name ) as $callback ) {
	            // XXX For some strange reason, this works... figure out later.
	            // @todo FIXME Make this proper PHP 5.3 stuff.
	            $Args = array( );
	            foreach ( $args as $k => &$arg ) {
	                $Args[$k] = &$arg;
	            }

	            call_user_func_array( $callback, $args );
	        }
	    }
	}

	/**
	 * The AutoLoader class is an OO hook into PHP's __autoload functionality.
	 *
	 * You can add use the AutoLoader class to add singe and multiple files as well
	 * entire folders.
	 *
	 * Examples:
	 *
	 * Single Files   - AutoLoader::addFile('Blog','/path/to/Blog.php');
	 * Multiple Files - AutoLoader::addFile(array('Blog'=>'/path/to/Blog.php','Post'=>'/path/to/Post.php'));
	 * Whole Folders  - AutoLoader::addFolder('path');
	 *
	 * When adding an entire folder, each file should contain one class having the
	 * same name as the file without ".php" (Blog.php should contain one class Blog)
	 *
	 */
	class AutoLoader {
		protected static $files   = array( );
		protected static $folders = array( );

	    /**
	     * Adds a (set of) file(s) for autoloading.
	     *
	     * Examples:
	     *      AutoLoader::addFile('Blog','/path/to/Blog.php');
	     *      AutoLoader::addFile(array('Blog'=>'/path/to/Blog.php','Post'=>'/path/to/Post.php'));
	     *
	     * @param mixed $class_name Classname or array of classname/path pairs.
	     * @param mixed $file       Full path to the file that contains $class_name.
	     */
	    public static function addFile ( $class_name, $file = null ) {
	        if ( $file == null && is_array( $class_name ) ) {
	            self::$files = array_merge( self::$files, $class_name );
	        } else {
	            self::$files[$class_name] = $file;
	        }
	    }

	    /**
	     * Adds an entire folder or set of folders for autoloading.
	     *
	     * Examples:
	     *      AutoLoader::addFolder('/path/to/classes/');
	     *      AutoLoader::addFolder(array('/path/to/classes/','/more/here/'));
	     *
	     * @param mixed $folder Full path to a folder or array of paths.
	     */
	    public static function addFolder ( $folder ) {
	        if ( !is_array( $folder ) ) {
	            $folder = array( $folder );
	        }
	        self::$folders = array_merge( self::$folders, $folder );
	    }

	    /**
	     * Loads a requested class.
	     *
	     * @param string $class_name
	     */
	    public static function load ( $class_name ) {
	        if ( isset( self::$files[$class_name] ) ) {
	            if ( file_exists( self::$files[$class_name] ) ) {
	                require self::$files[$class_name];
	                return;
	            }
	        } else {
	            foreach ( self::$folders as $folder ) {
					$folder = rtrim( $folder, DIRECTORY_SEPARATOR );
					$file   = $folder . DIRECTORY_SEPARATOR . $class_name . '.php';

	                if ( file_exists( $file ) ) {
	                    require $file;
	                    return;
	                }
	            }
	        }

	        throw new Exception( "AutoLoader could not find file for '{$class_name}'." );
	    }
	} // END AutoLoader Class

	if ( !function_exists( '__autoload' ) ) {
	    AutoLoader::addFolder( array(
	    	$__CONFIG__['directory']['app']['models']['dir'],
	    	$__CONFIG__['directory']['app']['controllers']['dir'],
	    	$__CONFIG__['directory']['app']['helpers']['classes']['dir'],
	    ));

	    spl_autoload_register( function ( $class_name ) {
	        try {
	            AutoLoader::load( $class_name );
	        } catch ( Exception $e ) {
	            throw $e;
	        }
	    });
	}

	// Load Helper Functions
	$load_helper_functions = array( 'network', 'http', 'mail', 'image' );

	foreach ( $load_helper_functions as $function ) {
		require_once( $__CONFIG__['directory']['app']['helpers']['functions']['dir'] . $function . '.function.php' );
	}

	// Load Helper Libraries
	$load_libraries = array( 'phpmailer/Exception', 'phpmailer/PHPMailer', 'phpmailer/SMTP' );

	foreach ( $load_libraries as $library ) {
		require_once( $__CONFIG__['directory']['app']['helpers']['libraries']['dir'] . $library . '.php' );
	}

	if ( array_key_exists( $__CONFIG__['database']['use'], $__CONFIG__['database']['connections'] ) ) {
		$__DB_CONFIG__ = $__CONFIG__['database']['connections'][$__CONFIG__['database']['use']];

		try {
		    $__DB_CONNECTION__ = new PDO( 'mysql:host=' . $__DB_CONFIG__['host'] . ';port=' . $__DB_CONFIG__['port'] . ';dbname=' . $__DB_CONFIG__['name'], $__DB_CONFIG__['username'], $__DB_CONFIG__['password'] );
		    $__DB_CONNECTION__->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

		    Database::connection( $__DB_CONNECTION__ );
		    Database::getConnection( )->exec( 'SET CHARACTER SET utf8' );

		} catch ( PDOException $e ) {
		    echo 'DB CONNECTION ERROR: ' . $e->getMessage( );
		    die( );
		}
	} else {
		echo 'DB CONNECTION ERROR: No connection has been set.';
		die( );
	}

	Flash::init( );

	/**
	 * Displays a "404 - page not found" message and exits.
	 */
	function page_not_found ( ) {
		global $__DB_CONFIG__, $__CONFIG__;

	    Observer::notify( 'page_not_found' );

	    header( 'HTTP/1.0 404 Not Found' );
	    echo new View( '404', array(
	    	'url_public' => $__CONFIG__['common']['url_public']
	    ));
	    exit;
	}

	/**
	 * Retrieves the request method used to access this page.
	 *
	 * @return string Possible values: GET, POST or AJAX
	 */
	function get_request_method ( ) {
	    if ( isset( $_SERVER['HTTP_X_REQUESTED_WITH'] ) && $_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest' ) {
	        return 'AJAX';
	    } else {
	        return $_SERVER['REQUEST_METHOD'];
	    }
	}

	/**
	 * Provides a nice print out of the stack trace when an exception is thrown.
	 *
	 * @param Exception $e Exception object.
	 */
	function framework_exception_handler ( $e ) {
		global $__DB_CONFIG__, $__CONFIG__;

	    if ( !$__CONFIG__['common']['debug'] ) page_not_found( );

	    echo '<style>h1,h2,h3,p,td {font-family:Verdana; font-weight:lighter;}</style>';
	    echo '<h1>Uncaught '.get_class( $e ).'</h1>';
	    echo '<h2>Description</h2>';
	    echo '<p>'.$e->getMessage( ).'</p>';
	    echo '<h2>Location</h2>';
	    echo '<p>Exception thrown on line <code>'
	    . $e->getLine( ) . '</code> in <code>'
	    . $e->getFile( ) . '</code></p>';
	    echo '<h2>Stack trace</h2>';

	    $traces = $e->getTrace( );

	    if ( count( $traces ) > 1) {
	        echo '<pre style="font-family:Verdana; line-height: 20px">';

	        $level = 0;
	        foreach ( array_reverse( $traces ) as $trace ) {
	            ++$level;

	            if ( isset( $trace['class'] ) ) echo $trace['class'] . '&rarr;';

	            $args = array( );

	            if ( !empty( $trace['args'] ) ) {
	                foreach ( $trace['args'] as $arg ) {
	                    if ( is_null( $arg ) ) $args[] = 'null';
	                    else if ( is_array( $arg ) ) $args[] = 'array['.sizeof( $arg ).']';
	                        else if ( is_object( $arg ) ) $args[] = get_class( $arg ).' Object';
	                            else if ( is_bool( $arg ) ) $args[] = $arg ? 'true' : 'false';
	                                else if ( is_int( $arg ) ) $args[] = $arg;
	                                    else {
	                                        $arg = htmlspecialchars( substr( $arg, 0, 64 ) );
	                                        if ( strlen( $arg ) >= 64 ) $arg .= '...';
	                                        $args[] = "'". $arg ."'";
	                                    }
	                }
	            }

	            echo '<strong>' . $trace['function'] . '</strong>(' . implode( ', ', $args ) . ')  ';
	            echo 'on line <code>' . ( isset( $trace['line'] ) ? $trace['line'] : 'unknown' ) . '</code> ';
	            echo "in <code>" . ( isset( $trace['file'] ) ? $trace['file'] : 'unknown' ) . "</code>\n";
	            echo str_repeat( '   ', $level );
	        }

	        echo '</pre><hr/>';
	    }

		$dispatcher_status                   = Dispatcher::getStatus( );
		$dispatcher_status['request method'] = get_request_method( );

	    debug_table( $dispatcher_status, 'Dispatcher status' );

	    if ( !empty( $_GET ) ) debug_table( $_GET, 'GET' );
	    if ( !empty( $_POST ) ) debug_table( $_POST, 'POST' );
	    if ( !empty( $_COOKIE ) ) debug_table( $_COOKIE, 'COOKIE' );

	    debug_table( $_SERVER, 'SERVER' );
	}

	/**
	 * Prints an HTML table with debug information.
	 *
	 * @param <type> $array
	 * @param <type> $label
	 * @param <type> $key_label
	 * @param <type> $value_label
	 */
	function debug_table ( $array, $label, $key_label = 'Variable', $value_label = 'Value' ) {
	    echo '<table cellpadding="3" cellspacing="0" style="margin: 1em auto; border: 1px solid #000; width: 90%;">';
	    echo '<thead><tr><th colspan="2" style="font-family: Verdana, Arial, sans-serif; background-color: #2a2520; color: #fff;">' . $label . '</th></tr>';
	    echo '<tr><td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">' . $key_label . '</td>'.
	         '<td style="border-bottom: 1px solid #000;">' . $value_label . '</td></tr></thead>';

	    foreach ( $array as $key => $value ) {
	        if ( is_null( $value ) ) $value = 'null';
	        else if ( is_array( $value ) ) $value = 'array[' . sizeof( $value ) . ']';
	            else if ( is_object( $value ) ) $value = get_class( $value ) . ' Object';
	                else if ( is_bool( $value ) ) $value = $value ? 'true' : 'false';
	                    else if ( is_int( $value ) ) $value = $value;
	                        else {
	                            $value = htmlspecialchars( substr( $value, 0, 64 ) );
	                            if ( strlen( $value ) >= 64 ) $value .= ' &hellip;';
	                        }

	        echo '<tr><td><code>' . $key . '</code></td><td><code>' . $value . '</code></td></tr>';
	    }

	    echo '</table>';
	}

	set_exception_handler( 'framework_exception_handler' );