<div class="d-sm-flex align-items-center justify-content-between mb-20">
	<h1 class="h3 mb-0 fw-400 text-gray-800">Applicants</h1>
</div>

<p class="mb-40">
	This is where you can see the list of applicants specifically their names and personal information.
	<br>It would also show the reviews of their teaching style and performance.
</p>

<form action="<?php echo getUrl( "applicant/save/{$APPLICANT->id}", false, false, true ); ?>" method="post" enctype="multipart/form-data">
	<div class="card shadow">
	    <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between pos-r">
	      	<h6 class="m-0 fw-b text-primary">Edit Applicant</h6>
	    </div>
	    <div class="card-body">
			<?php foreach ( (array) Flash::get( 'applicant' ) as $message ) { ?>
				<div class="alert alert-<?php echo $message['class']; ?> alert-dismissible fade show" role="alert">
					<button type="button" class="close" data-dismiss="alert">&times;</button>

					<p class="m-0"><?php echo nl2br( $message['content'] ); ?></p>
				</div>
		    <?php } ?>

			<div class="row">
		    	<div class="col">
					<div class="form-group row">
						<label for="field-name" class="col-sm-3 col-form-label">Name</label>
						<div class="col-sm-5">
							<input type="text" name="name" value="<?php echo $FORM['name']; ?>" id="field-name" class="form-control">
						</div>
					</div>

					<div class="form-group row">
						<label for="field-facebook_url" class="col-sm-3 col-form-label">Facebook URL</label>
						<div class="col-sm-5">
							<input type="text" name="facebook_url" value="<?php echo $FORM['facebook_url']; ?>" id="field-facebook_url" class="form-control">
						</div>
					</div>

					<div class="form-group row">
						<label for="field-contact_no" class="col-sm-3 col-form-label">Contact #</label>
						<div class="col-sm-5">
							<input type="text" name="contact_no" value="<?php echo $FORM['contact_no']; ?>" id="field-contact_no" class="form-control">
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
					</div>
			    </div>
		  	</div>
	    </div>

	    <div class="card-footer t-a-r py-3">
	    	<a href="<?php echo getUrl( 'applicant', $_SESSION['REDIRECT_INDEX_PARAMS'], false, true ); ?>" class="btn btn-link">Cancel</a>
			<button type="submit" class="btn btn-primary w-150">Save</button>
	    </div>
	</div>
</form>
