<div class="d-sm-flex align-items-center justify-content-between mb-20">
	<h1 class="h3 mb-0 fw-400 text-gray-800">Users</h1>
</div>

<p class="mb-40">
	This includes all users of the application and the role that they play in its maintenance, update and successful usage.
</p>

<form action="<?php echo getUrl( "user/save/{$USER->id}", false, false, true ); ?>" method="post" enctype="multipart/form-data">
	<div class="card shadow">
	    <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between pos-r">
	      	<h6 class="m-0 fw-b text-primary">Edit User</h6>

	      	<img src="<?php echo ( $USER->photo ) ? $USER->getPhotoLink( ) : $__CONFIG__['directory']['theme']['images']['path'] . 'logo.png'; ?>" alt="" id="user-photo" width="150px" height="150px" class="bg-ffffff p-5 pos-a pos-b-5 pos-r-20 bc-dcdcdc bs-1 br-3 mb-10" style="object-fit: cover;">
	    </div>
	    <div class="card-body">
			<?php foreach ( (array) Flash::get( 'user' ) as $message ) { ?>
				<div class="alert alert-<?php echo $message['class']; ?> alert-dismissible fade show" role="alert">
					<button type="button" class="close" data-dismiss="alert">&times;</button>

					<p class="m-0"><?php echo nl2br( $message['content'] ); ?></p>
				</div>
		    <?php } ?>

			<div class="row">
		    	<div class="col">
		    		<div class="form-group row">
						<label for="field-photo" class="col-sm-3 col-form-label">Photo</label>
						<div class="col-sm-5">
							<div class="custom-file">
							  	<input type="file" name="photo" accept="image/jpeg,image/png" id="field-photo" class="custom-file-input">
							  	<label class="custom-file-label" for="field-photo"><?php echo $FORM['photo']; ?></label>
							</div>
						</div>
						<small class="col-sm-4 d-flex align-items-center text-muted">You can only upload images that has jpg, jpeg and png extension.</small>
			    	</div>

			    	<div class="form-group row">
						<label for="field-username" class="col-sm-3 col-form-label">Username</label>
						<div class="col-sm-5">
							<input type="text" name="username" value="<?php echo $FORM['username']; ?>" id="field-username" class="form-control">
						</div>
						<small class="col-sm-4 d-flex align-items-center text-muted">Use only alphanumeric characters and contains of 6 - 10 characters. </small>
					</div>

					<div class="form-group row">
						<label for="field-password" class="col-sm-3 col-form-label">Password</label>
						<div class="col-sm-5">
							<input type="password" name="password" value="<?php echo $FORM['password']; ?>" id="field-password" class="form-control">
						</div>
					</div>

					<div class="form-group row">
						<label for="field-password_confirm" class="col-sm-3 col-form-label">Confirm Password</label>
						<div class="col-sm-5">
							<input type="password" name="password_confirm" value="<?php echo $FORM['password_confirm']; ?>" id="field-password_confirm" class="form-control">
						</div>
					</div>

					<div class="form-group row">
						<label for="field-name" class="col-sm-3 col-form-label">Name</label>
						<div class="col-sm-5">
							<input type="text" name="name" value="<?php echo $FORM['name']; ?>" id="field-name" class="form-control">
						</div>
					</div>

					<div class="form-group row">
						<label for="field-email" class="col-sm-3 col-form-label">E-mail</label>
						<div class="col-sm-5">
							<input type="email" name="email" value="<?php echo $FORM['email']; ?>" id="field-email" class="form-control">
						</div>
					</div>

					<div class="form-group row">
						<label for="field-description" class="col-sm-3 col-form-label">Role</label>
						<div class="col-sm-5">
							<select name="user_role_id" id="field-description" class="form-control custom-select">
								<?php foreach ( $ROLES as $role ) { ?>
									<option value="<?php echo $role->id; ?>" <?php if ( $role->id == $FORM['user_role_id'] ) echo 'selected'; ?>><?php echo $role->role; ?></option>
								<?php } ?>
							</select>
						</div>
					</div>

					<div class="form-group row">
						<label for="field-status_id" class="col-sm-3 col-form-label">Status</label>
						<div class="col-sm-5">
							<select name="status_id" id="field-status_id" class="form-control custom-select">
								<?php foreach ( $STATUS as $status_key => $status ) { ?>
									<option value="<?php echo $status_key; ?>" <?php if ( $status_key == $FORM['status_id'] ) echo 'selected'; ?>><?php echo $status; ?></option>
								<?php } ?>
							</select>
						</div>
						<small class="col-sm-4 d-flex align-items-center text-muted">Note: Tagging as inactive the user can no longer login.</small>
					</div>
			    </div>
		  	</div>
	    </div>

	    <div class="card-footer t-a-r py-3">
	    	<a href="<?php echo getUrl( 'user', $_SESSION['REDIRECT_INDEX_PARAMS'], false, true ); ?>" class="btn btn-link">Cancel</a>
			<button type="submit" class="btn btn-primary w-150">Save</button>
	    </div>
	</div>
</form>

<script type="text/javascript">
	$( document ).ready( function ( $ ) {
	    $( '#field-photo' ).on( 'change', function ( e ) {
	        var reader = new FileReader( );

			reader.onload = function ( e ) {
			    $( '#user-photo' ).attr( 'src', e.target.result );
			}


	        if ( this.files && this.files[0] ) {
	            reader.readAsDataURL( this.files[0] );

	        	$( this ).next( 'label' ).text( this.files[0].name );
	        }
	    });
	});
</script>