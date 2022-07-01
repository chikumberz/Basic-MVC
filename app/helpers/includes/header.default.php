<!DOCTYPE html>
<html lang="en">
	<head><?php echo $__HEADER_HEAD__; ?></head>
	<body>
		<?php
		 	$__ALERT_GLOBAL__ =	Flash::get( 'alert' );

			if ( $__ALERT_GLOBAL__[0] ) {
		?>
			<div class="modal fade z-1000000" id="alert-global-modal">
			    <div class="modal-dialog">
			        <div class="modal-content">
			        	<?php if ( !$__ALERT_GLOBAL__[0]['custom'] ) { ?>
				            <div class="modal-header">
				                <h5 class="modal-title"><?php echo $__ALERT_GLOBAL__[0]['title'] ? $__ALERT_GLOBAL__[0]['title'] : $__CONFIG__['common']['title']; ?></h5>
				                <button type="button" class="close fs-52" data-dismiss="modal">&times;</button>
				            </div>

				            <div class="modal-body">
				                <p class="mb-0"><?php echo $__ALERT_GLOBAL__[0]['content']; ?></p>
				            </div>

				            <div class="modal-footer">
				                <button type="button" class="btn btn-default fs-28 p-3 pl-5 pr-5" data-dismiss="modal">Close</button>
				            </div>
			           <?php } else { echo $__ALERT_GLOBAL__[0]['content']; } ?>
			        </div>
			    </div>
			</div>

			<script type="text/javascript">
			    $( document ).ready( function ( ) {
			        $( '#alert-global-modal' ).modal({
			            show : true,
			            keyboard: false,
			            backdrop: 'static',
			        });

			        $( '#alert-global-modal' ).on( 'hidden.bs.modal', function ( ) {
			        	if ( window.opener && window.opener !== window ) {
			        		// TODO: Need to check for admin conflict
			        		// window.close( );
			        	}
			        });
			    });
			</script>
		<?php } ?>
