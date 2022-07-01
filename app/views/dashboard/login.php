<div class="container pt-200">
  	<div class="row justify-content-md-center">
  		<div class="col-5">
			<form action="<?php echo getUrl( 'login/auth', false, false, true ); ?>" method="post" autocomplete="off">
				<div class="card bg-light">
					<div class="card-header"><h4 class="m-0">User Login</h4></div>
					<div class="card-body">
						<?php foreach ( (array) Flash::get( 'login' ) as $message ) { ?>
							<div class="alert alert-<?php echo $message['class']; ?> alert-dismissible fade show" role="alert">
								<button type="button" class="close" data-dismiss="alert">&times;</button>

								<p class="m-0"><?php echo nl2br( $message['content'] ); ?></p>
							</div>
		                <?php } ?>

						<div class="form-group">
							<label for="field-username">Username</label>
							<div class="input-group">
								<div class="input-group-prepend">
									<div class="input-group-text"><i class="fas fa-user"></i></div>
								</div>
								<input type="text" name="username" id="field-username" class="form-control">
							</div>
						</div>

						<div class="form-group">
							<label for="field-password">Password</label>
							<div class="input-group">
								<div class="input-group-prepend">
									<div class="input-group-text"><i class="fas fa-key"></i></div>
								</div>
								<input type="password" name="password" id="field-password" class="form-control">
							</div>
						</div>
					</div>
					<div class="card-footer" align="right">
						<button type="submit" class="btn btn-primary">Login</button>
					</div>
				</div>
			</form>
		</div>
	</div>
</div>