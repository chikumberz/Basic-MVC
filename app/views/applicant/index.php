<div class="d-sm-flex align-items-center justify-content-between mb-20">
	<h1 class="h3 mb-0 fw-400 text-gray-800">Applicants</h1>
</div>

<p class="mb-40">
	This is where you can see the list of applicants specifically their names and personal information.
	<br>It would also show the reviews of their teaching style and performance.
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

					<a href="<?php echo getUrl( 'applicant/add', false, false, true ); ?>" class="btn btn-info d-none"><i class="fas fa-pencil-alt fa-sm fa-fw mr-5 text-gray-400"></i> Add</a>
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
					<th class="bs-0">Name</th>
					<th class="bs-0">Facebook URL</th>
					<th class="bs-0">Contact #</th>
					<th class="bs-0">Status</th>
					<th class="bs-0">Created On</th>
					<th class="bs-0" width="200">Action</th>
				</tr>

				<?php foreach ( $applicants as $applicant ) { ?>
					<tr>
						<td align="left"><?php echo $pagination_no--; ?></td>
						<td><?php echo $applicant->name; ?></td>
						<td><?php echo $applicant->facebook_url; ?></td>
						<td><?php echo $applicant->contact_no; ?></td>
						<td><?php echo $applicant::getStatusByKey( $applicant->status_id ); ?></td>
						<td><?php echo $applicant->created_on; ?></td>
						<td>
							<div class="btn-group">
							  	<a href="<?php echo getUrl( "applicant/edit/{$applicant->id}", false, false, true ); ?>" class="btn btn-secondary" data-toggle="tooltip" data-placement="bottom" title="Edit"><i class="fas fa-pencil-alt"></i></a>
							  	<a href="<?php echo getUrl( "applicant/delete/{$applicant->id}", false, false, true ); ?>" class="btn btn-danger" data-toggle="tooltip" data-placement="bottom" title="Delete" onclick="return confirm( 'Are you sure to delete this record?' );"><i class="fas fa-trash-alt"></i></a>
							</div>
						</td>
					</tr>
				<?php } ?>
			</table>

			<div class="t-a-c"><?php echo $pagination->parse( ); ?></div>
	    </div>
	</div>
</form>