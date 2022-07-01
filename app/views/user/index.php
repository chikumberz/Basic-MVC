<div class="d-sm-flex align-items-center justify-content-between mb-20">
	<h1 class="h3 mb-0 fw-400 text-gray-800">Users</h1>
</div>

<p class="mb-40">
	This includes all users of the application and the role that they play in its maintenance, update and successful usage.
</p>

<form name="filter" method="get">
	<div class="card shadow">
	    <div class="card-header">
	    	<div class="row">
				<div class="col-auto mr-auto form-inline">
					<div class="form-group mr-10">
				    	<label for="field-search" class="mr-10">Filter:</label>
				    	<input type="text" name="search" value="<?php echo $search; ?>" id="field-search" class="form-control w-500">
				  	</div>

					<button type="submit" class="btn btn-secondary mr-10"><i class="fas fa-search fa-sm fa-fw mr-5 text-gray-400"></i> Search</button>

					<a href="<?php echo getUrl( 'user/add', false, false, true ); ?>" class="btn btn-info"><i class="fas fa-pencil-alt fa-sm fa-fw mr-5 text-gray-400"></i> Add</a>
			  	</div>

				<div class="col-auto form-inline">
			  		<div class="form-group">
				    	<label for="field-limit" class="mr-10">Page Rows:</label>
				    	<select name="limit" class="custom-select" id="field-limit" onchange="document.forms['filter'].submit( );">
							<option value="5" <?php if ( $limit == 5 ) echo 'selected'; ?>>5</option>
							<option value="10" <?php if ( $limit == 10 ) echo 'selected'; ?>>10</option>
							<option value="20" <?php if ( $limit == 20 ) echo 'selected'; ?>>20</option>
							<option value="50" <?php if ( $limit == 50 ) echo 'selected'; ?>>50</option>
							<option value="100" <?php if ( $limit == 100 ) echo 'selected'; ?>>100</option>
				    	</select>
				  	</div>
				</div>
			</div>
	    </div>

	    <div class="card-body">
	    	<div class="t-a-c"><?php echo $pagination->parse( ); ?></div>

			<table width="100%" class="table t-a-c">
				<tr>
					<th class="bs-0 t-a-l">#</th>
					<th class="bs-0">Photo</th>
					<th class="bs-0">Username</th>
					<th class="bs-0">Name</th>
					<th class="bs-0">E-mail</th>
					<th class="bs-0">Role</th>
					<th class="bs-0">Status</th>
					<th class="bs-0">Is Login</th>
					<th class="bs-0">Last Login</th>
					<th class="bs-0">Last Active</th>
					<th class="bs-0" width="200">Action</th>
				</tr>

				<?php foreach ( $users as $user ) { ?>
					<tr>
						<td align="left"><?php echo $pagination_no--; ?></td>
						<td><img src="<?php echo $user->getPhotoLink( ); ?>" alt="" class="rounded-circle w-55 h-55 bc-dcdcdc bs-1 p-2 shadow-sm" style="object-fit: cover;"></td>
						<td><a href="<?php echo getUrl( "user/edit/{$user->id}", false, false, true ); ?>"><?php echo $user->username; ?></a></td>
						<td><?php echo $user->name; ?></td>
						<td><?php echo $user->email; ?></td>
						<td><?php echo $user->user_role->role; ?></td>
						<td><?php echo $user::getStatusByKey( $user->status_id ); ?></td>
						<td><?php echo $user->is_login ? 'Yes' : 'No'; ?></td>
						<td><?php echo $user->last_login; ?></td>
						<td><?php echo $user->last_active; ?></td>
						<td>
							<div class="btn-group">
							  	<a href="<?php echo getUrl( "user/edit/{$user->id}", false, false, true ); ?>" class="btn btn-secondary" data-toggle="tooltip" data-placement="bottom" title="Edit"><i class="fas fa-pencil-alt"></i></a>
							  	<a href="<?php echo getUrl( "user/delete/{$user->id}", false, false, true ); ?>" class="btn btn-danger" data-toggle="tooltip" data-placement="bottom" title="Delete" onclick="return confirm( 'Are you sure to delete this record?' );"><i class="fas fa-trash-alt"></i></a>
							</div>
						</td>
					</tr>
				<?php } ?>
			</table>

			<div class="t-a-c"><?php echo $pagination->parse( ); ?></div>
	    </div>
	</div>
</form>