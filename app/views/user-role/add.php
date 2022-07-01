<div class="d-sm-flex align-items-center justify-content-between mb-20">
	<h1 class="h3 mb-0 fw-400 text-gray-800">User Roles</h1>
</div>

<p class="mb-40">
	Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nihil, facilis, optio! Labore quas sunt, eligendi magnam alias.
	<br>Voluptatem vero consequuntur, itaque aperiam optio voluptatum quia ad cum veritatis, esse reiciendis.
</p>

<form action="<?php echo getUrl( 'user-role/save', false, false, true ); ?>" method="post" enctype="multipart/form-data">
	<div class="card shadow">
	    <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between pos-r">
	      	<h6 class="m-0 fw-b text-primary">Add User Role</h6>
	    </div>

	    <div class="card-body">
			<?php foreach ( (array) Flash::get( 'user-role' ) as $message ) { ?>
				<div class="alert alert-<?php echo $message['class']; ?> alert-dismissible fade show" role="alert">
					<button type="button" class="close" data-dismiss="alert">&times;</button>

					<p class="m-0"><?php echo nl2br( $message['content'] ); ?></p>
				</div>
		    <?php } ?>

			<div class="row">
		    	<div class="col">
			    	<div class="form-group row">
						<label for="field-role" class="col-sm-3 col-form-label">Role</label>
						<div class="col-sm-5">
							<input type="text" name="role" value="<?php echo $FORM['role']; ?>" id="field-role" class="form-control">
						</div>
						<small class="col-sm-4 d-flex align-items-center text-muted">Use only alphanumeric characters. </small>
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
						<small class="col-sm-4 d-flex align-items-center text-muted"></small>
					</div>

					<div class="form-group row">
						<label for="field-status_id" class="col-sm-3 col-form-label">Permissions</label>
						<div class="col-sm-9">
							<div class="custom-control custom-checkbox">
							  	<input type="checkbox" class="custom-control-input" id="field-check-all" class="">
							  	<label class="custom-control-label" for="field-check-all">Check/Uncheck All</label>
							</div>

							<hr>

							<div class="row">
								<?php foreach ( $PERMISSIONS as $p_key => $permission_groups ) { ?>
									<div class="col-2">
										<h6><?php echo $permission_groups[0]; ?></h6>
										<dl>
											<?php foreach ( $permission_groups as $p_key => $permission ) { ?>
												<?php if ( !is_numeric( $p_key ) ) { ?>
													<dd>
														<div class="custom-control custom-checkbox">
														  	<input type="checkbox" name="permissions[]" value="<?php echo $p_key; ?>" id="field-<?php echo $p_key; ?>" class="custom-control-input permissions">
														  	<label class="custom-control-label" for="field-<?php echo $p_key; ?>"><?php echo $permission; ?></label>
														</div>
													</dd>
												<?php } ?>
											<?php } ?>
										</dl>
									</div>
								<?php } ?>
							</div>
						</div>
					</div>
			    </div>
		  	</div>
	    </div>

	    <div class="card-footer t-a-r py-3">
	    	<a href="<?php echo getUrl( 'user-role', false, false, true ); ?>" class="btn btn-link">Cancel</a>
			<button type="submit" class="btn btn-primary w-150">Save</button>
	    </div>
	</div>
</form>

<script type="text/javascript">
	$( document ).ready( function ( $ ) {
		$( '#field-check-all' ).on( 'change', function ( ) {
			var self = $( this );

			if ( self.is( ':checked' ) ) {
				$( '.permissions' ).prop( 'checked', true );
			} else {
				$( '.permissions' ).prop( 'checked', false );
			}
		});
	});
</script>