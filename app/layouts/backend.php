<?php echo $__HEADER__; ?>

	<div class="wrapper">
		<ul class="sidebar navbar-nav" id="sidebar-accordion">
			<li>
				<a href="#" class="sidebar-brand d-flex align-items-center justify-content-center">
					<div class="sidebar-brand-icon"><img src="<?php echo $__CONFIG__['directory']['theme']['images']['path']; ?>logo-white.png" width="50" alt=""></div>
					<div class="sidebar-brand-text">JerryMarie</div>
				</a>
			</li>

			<li class="nav-item"><hr class="sidebar-divider"></li>
			<li class="nav-item <?php if ( Dispatcher::getController( true ) == 'dashboard' ) echo 'active'; ?>">
				<a href="<?php echo getUrl( 'dashboard', false, false, true ); ?>" class="nav-link <?php if ( Dispatcher::getController( true ) == 'dashboard' ) echo 'active'; ?>">
		          	<i class="fas fa-fw fa-tachometer-alt"></i>
		          	<span>Dashboard</span>
		      	</a>
			</li>

			<li class="nav-item"><hr class="sidebar-divider"></li>
			<li class="nav-item">
				<a href="<?php echo getUrl( 'applicant', false, false, true ); ?>" class="nav-link <?php if ( Dispatcher::getController( true ) == 'applicant' ) echo 'active'; ?>">
		          	<i class="fas fa-fw fa-user-tie"></i>
		          	<span>Applicants</span>
		      	</a>
			</li>


			<li class="nav-item"><hr class="sidebar-divider"></li>
			<li class="nav-item">
		      	<a href="#collapse-user" class="nav-link <?php if ( !in_array( Dispatcher::getController( true ), ['user'] ) ) echo 'collapsed'; ?>" data-toggle="collapse">
		          	<i class="fas fa-users"></i>
		          	<span>Users</span>
		          	<i class="fas fa-angle-up fs-18 lh-26 float-right"></i>
		      	</a>

		      	<div id="collapse-user" class="sidebar-sub collapse <?php if ( in_array( Dispatcher::getController( true ), ['user', 'user-role'] ) ) echo 'show'; ?>" data-parent="#sidebar-accordion">
		         	<div class="collapse-inner">
			            <a href="<?php echo getUrl( 'user', false, false, true ); ?>" class="collapse-item <?php if ( Dispatcher::getController( true ) == 'user' ) echo 'active'; ?>"><i class="fas fa-circle fs-6 va-m mr-10"></i><span class="va-m">Lists</span></a>
			            <a href="<?php echo getUrl( 'user-role', false, false, true ); ?>" class="collapse-item <?php if ( Dispatcher::getController( true ) == 'user-role' ) echo 'active'; ?>"><i class="fas fa-circle fs-6 va-m mr-10"></i><span class="va-m">Roles</span></a>
		          	</div>
		        </div>
			</li>
		</ul>

		<div class="main d-flex flex-column">
			<nav class="header navbar navbar-expand navbar-light shadow">
				<ul class="navbar-nav ml-auto">
					<li class="nav-item dropdown no-arrow">
		              	<a href="#" class="nav-link d-flex align-items-center h-70" id="user-dropdown" data-toggle="dropdown">
		                	<span class="mr-10 d-none d-lg-inline text-gray-600 small"><?php echo UserAuthUser::getUser( 'name' ); ?></span>
		                	<img class="rounded-circle" src="<?php echo ( UserAuthUser::getUser( 'photo' ) ) ? ( strpos( UserAuthUser::getUser( 'photo' ), '://' ) ? UserAuthUser::getUser( 'photo' ) : $__CONFIG__['directory']['upload']['path'] . 'user/photo/' . UserAuthUser::getUser( 'photo' ) ) : $__CONFIG__['directory']['theme']['images']['path'] . 'logo.png'; ?>" width="40px" height="40px">
		              	</a>

		              	<div class="dropdown-menu dropdown-menu-right bc-dcdcdc bs-1 shadow animated--grow-in" aria-labelledby="user-dropdown">
		                	<a href="<?php echo getUrl( 'user/edit/' . UserAuthUser::getId( ), false, false, true ); ?>" class="dropdown-item pl-15 pr-15"><i class="fas fa-user fa-sm fa-fw mr-10 text-gray-400"></i> Profile</a>
	                		<a href="#" class="dropdown-item pl-15 pr-15"><i class="fas fa-cogs fa-sm fa-fw mr-10 text-gray-400"></i> Settings</a>
			                <div class="dropdown-divider"></div>
			                <a href="<?php echo getUrl( 'logout', false, false, true ); ?>" class="dropdown-item pl-15 pr-15"><i class="fas fa-sign-out-alt fa-sm fa-fw mr-10 text-gray-400"></i> Logout</a>
		              	</div>
		            </li>
				</ul>
			</nav>

			<div class="content-wrapper">
				<div class="content">
					<?php echo $__CONTENT__; ?>
				</div>
			</div>
		</div>
	</div>

	<link type="text/css" rel="stylesheet" href="<?php echo $__CONFIG__['directory']['theme']['stylesheets']['path']; ?>backend.css">

<?php echo $__FOOTER__; ?>