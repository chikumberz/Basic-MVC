<div class="wrapper pt-5">
    <div class="row">
        <div class="col-12 col-lg-6 offset-lg-3">
            <h4 class="mt-5 text-center">Apply Now!</h4>
            <p class="text-center mb-5r">
                We will contact you as soon as posible
            </p>

            <?php foreach ( (array) Flash::get( 'apply' ) as $message ) { ?>
                <div class="alert alert-<?php echo $message['class']; ?> alert-dismissible fade show" role="alert">
                    <button type="button" class="close fs-52" data-dismiss="alert">&times;</button>

                    <p class="m-0"><?php echo nl2br( $message['content'] ); ?></p>
                </div>
            <?php } ?>

            <form action="<?php echo getUrl( 'save' ); ?>" method="post" data-toggle="validator">
                <div class="form-group mb-3">
                    <label for="field-name" class="mb-4">FULL NAME</label>
                    <input type="text" class="form-control" name="name" id="field-name" class="h-100" required>
                    <div class="help-block with-errors"></div>
                </div>

                <div class="form-group mb-3">
                    <label for="field-facebook-url" class="mb-4">FACEBOOK URL</label>
                    <input type="text" class="form-control" name="facebook_url" id="field-facebook-url" required>
                    <div class="help-block with-errors"></div>
                    <small id="facebook-url-help" data-toggle="collapse" data-target="#facebook-url-help-content" class="form-text c-ff3d5c text-right">HOW TO GET FACEBOOK URL?</small>

                    <div id="facebook-url-help-content" class="collapse">
                        <br>
                        <ol>
                            <li>Open Facebook on your mobile device, navigate to the profile page, and tap the three dots.</li>
                            <li>
                                Tap Copy Link to Profile.
                                <br>
                                <br>
                                <p class="text-center"><img src="theme/images/fb-1.jpg" alt="" style="max-width: 70%;"></p>
                            </li>
                            <li>
                                The link has been copied to your clipboard. Tap OK to exit the screen.
                                <br>
                                <br>
                                <p class="text-center"><img src="theme/images/fb-2.jpg" alt="" style="max-width: 70%;"></p>
                            </li>
                        </ol>
                    </div>
                </div>

                <div class="form-group mb-5">
                    <label for="field-contact" class="mb-4">MOBILE NUMBER</label>
                    <input type="text" class="form-control" name="contact_no" id="field-contact" class="" required>
                    <div class="help-block with-errors"></div>
                </div>

                <div class="form-group">
                    <button type="submit" class="btn btn-block btn-submit mb-5">SUBMIT APPLICATION</button>

                    <a href="<?php echo getUrl( 'index' ); ?>" class="btn-block c-606466"><i class="fas fa-chevron-left"></i> GO BACK</a>
                </div>
            </form>

        </div>
    </div>
</div>