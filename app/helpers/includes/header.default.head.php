<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=0.5, maximum-scale=0.5, minimum-scale=0.5, user-scalable=yes, target-densitydpi=device-dpi">

<title>JerryMarie</title>

<link type="text/css" rel="stylesheet" href="https://use.fontawesome.com/releases/v5.10.2/css/all.css">
<link type="text/css" rel="stylesheet" href="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>jquery-ui/1.12.1/stylesheets/jquery-ui.min.css">
<link type="text/css" rel="stylesheet" href="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>flickity/2.2.1/stylesheets/flickity.min.css">
<link type="text/css" rel="stylesheet" href="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>flickity/2.2.1/stylesheets/flickity-fullscreen.min.css">
<link type="text/css" rel="stylesheet" href="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>bootstrap/4.1.3/stylesheets/bootstrap.min.css">
<link type="text/css" rel="stylesheet" href="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>bootstrap-datetimepicker/4.17.47/stylesheets/bootstrap-datetimepicker.min.css">
<link type="text/css" rel="stylesheet" href="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>bootstrap-select/1.13.9/stylesheets/bootstrap-select.min.css">
<link type="text/css" rel="stylesheet" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css" /
<link type="text/css" rel="stylesheet" href="<?php echo $__CONFIG__['directory']['theme']['stylesheets']['path']; ?>spaces.css">
<link type="text/css" rel="stylesheet" href="<?php echo $__CONFIG__['directory']['theme']['stylesheets']['path']; ?>positions.css">
<link type="text/css" rel="stylesheet" href="<?php echo $__CONFIG__['directory']['theme']['stylesheets']['path']; ?>global.css">
<link type="text/css" rel="stylesheet" href="<?php echo $__CONFIG__['directory']['theme']['stylesheets']['path']; ?>custom.css">
<link type="text/css" rel="stylesheet" href="<?php echo $__CONFIG__['directory']['theme']['stylesheets']['path']; ?>style.css">

<script type="text/javascript" src="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>jquery/3.3.1/javascripts/jquery.min.js"></script>
<script type="text/javascript" src="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>moment/2.22.2/javascripts/moment-with-locales.min.js"></script>
<script type="text/javascript" src="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>moment/2.22.2/javascripts/moment-timezone-with-data.min.js"></script>
<script type="text/javascript" src="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>popper/1.14.6/javascripts/popper.min.js"></script>
<script type="text/javascript" src="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>popup/0.1.0/javascripts/popup.min.js"></script>
<script type="text/javascript" src="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>flickity/2.2.1/javascripts/flickity.min.js"></script>
<script type="text/javascript" src="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>flickity/2.2.1/javascripts/flickity-hash.min.js"></script>
<script type="text/javascript" src="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>flickity/2.2.1/javascripts/flickity-fullscreen.min.js"></script>
<script type="text/javascript" src="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>bootstrap/4.1.3/javascripts/bootstrap.min.js"></script>
<script type="text/javascript" src="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>bootstrap-select/1.13.9/javascripts/bootstrap-select.min.js"></script>
<script type="text/javascript" src="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>bootstrap-datetimepicker/4.17.47/javascripts/bootstrap-datetimepicker.min.js"></script>
<script type="text/javascript" src="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>bootstrap-validator/0.11.9/javascripts/bootstrap-validator.min.js"></script>
<script type="text/javascript" src="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>jquery-ui/1.12.1/javascripts/jquery-ui.min.js"></script>
<script type="text/javascript" src="<?php echo $__CONFIG__['directory']['theme']['plugins']['path']; ?>inputmask/1.14.15/javascripts/inputmask.min.js"></script>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js"></script>
<script type="text/javascript" src="<?php echo $__CONFIG__['directory']['theme']['javascripts']['path']; ?>global.js"></script>
<script type="text/javascript">
	var YMD             = '<?php echo date( 'Y-m-d' ); ?>';
	var url_suffix      = '<?php echo $__CONFIG__['common']['url_suffix']; ?>';
	var url_public      = '<?php echo $__CONFIG__['common']['url_public']; ?>';
	var url_private_key = '<?php echo $__CONFIG__['common']['url_private_key']; ?>';

	function getUrl ( url, data, hash, is_admin ) {
		if ( url.indexOf( '.' ) === -1 ) {
			if ( typeof data === 'object' && typeof data.url_suffix !== 'undefined' ) {
				url += data.url_suffix;
				delete data.url_suffix;
			} else {
				url += url_suffix;
			}
		}

		if ( hash ) {
			hash = '#' + hash;
		} else {
			hash = '';
		}

		if ( typeof is_admin === 'boolean' ) {
			is_admin = url_private_key;
		}

		return url_public.replace( /^\/|\/$/g, '' ) + ( is_admin ? '/' + is_admin + '/' : '/' ) + url + ( typeof data === 'object' ? '?' + $.param( data ) : '' ) + hash;
	}
</script>
