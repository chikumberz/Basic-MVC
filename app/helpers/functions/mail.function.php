<?php
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    function mail_normal ( $name, $email, $subject, $body ) {
        global $__CONFIG__;

        $header  = "From: \"{$__CONFIG__['mail']['from_name']}\" <{$__CONFIG__['mail']['from_email']}>\r\n";
        $header .= "Bcc: {$__CONFIG__['mail']['from_email']}\r\n";
        $header .= "Return-Path: {$__CONFIG__['mail']['from_email']}\r\n";
        $header .= "Reply-To: {$__CONFIG__['mail']['from_email']}\r\n";
        $header .= "MIME-Version: 1.0\r\n";
        $header .= "X-Mailer: PHP/ " . phpversion( ) . "\r\n";
        $header .= "Content-Type: text/html\r\n";
        $header .= "Content-Transfer-Encoding: base64\r\n";

        $to      = "\"{$name}\" <{$email}>";
        $content = rtrim( chunk_split( base64_encode( $body ) ) );

        @mail( $to, $subject, $content, $header );
    }

	function mail_smtp ( $name, $email, $subject, $body ) {
        global $__CONFIG__;

        $mail = new PHPMailer( );

        $mail->IsSMTP( ); // telling the class to use SMTP
        $mail->SMTPDebug  = false;
        $mail->SMTPSecure = 'tls';
        $mail->SMTPAuth   = true; // turn on SMTP authentication
        $mail->Host       = $__CONFIG__['mail']['host']; // SMTP server
        $mail->Port       = $__CONFIG__['mail']['port'];
        $mail->Username   = $__CONFIG__['mail']['username']; // SMTP username
        $mail->Password   = $__CONFIG__['mail']['password']; // SMTP password

        $mail->setFrom( $__CONFIG__['mail']['from_email'], $__CONFIG__['mail']['from_name'] );
        $mail->addAddress( $email, $name );
        $mail->addBCC( $__CONFIG__['mail']['from_email'] );

        $mail->isHTML( true );
        $mail->Subject = $subject;
        $mail->Body    = $body;

        if ( !$mail->Send( ) ) {
            echo 'Mailer Error: ' . $mail->ErrorInfo;
            return false;
        } else {
            return true;
        }
    }

