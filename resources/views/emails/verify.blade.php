<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #3d4852;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 30px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        h1 {
            color: #2d3748;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 16px;
        }
        p {
            color: #718096;
            font-size: 16px;
            margin-bottom: 16px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #3490dc;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 600;
            text-align: center;
            transition: background-color 0.2s, transform 0.1s;
            margin: 16px 0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .button:hover {
            background-color: #2779bd;
        }
        .button:focus {
            outline: 3px solid #bae6fd;
            background-color: #2779bd;
        }
        .button:active {
            transform: translateY(1px);
        }
        .link {
            color: #3490dc;
            text-decoration: none;
            word-break: break-all;
        }
        .link:hover {
            text-decoration: underline;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #b8c2cc;
            border-top: 1px solid #f1f5f8;
            padding-top: 20px;
        }
        @media (prefers-reduced-motion) {
            .button {
                transition: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="50" height="50">
              <path
                fill="#191d45"
                stroke-width="0"
                d="M6.11,8.86H1.89l.66-1.61h4.21l-.66,1.61ZM4.2,3.25l-.68,1.65h4.21l.68-1.65h-4.21ZM13.1,8.64c-.21.14-.47.28-.79.41-.26.11-.5.18-.71.23l1.48,3.52h1.76l-1.74-4.16ZM2.51,7.25h4.26M11.44,7.94,15.55,5.15l-2.33.4c-.12.02-.17.16-.09.25l.36.43c-.3.34-1,1.02-2.13,1.4-1.05.35-1.95.27-2.4.19l.11-.27.07-.18.86-2.03.97,2.19c.23-.06.5-.15.78-.29.26-.12.48-.25.66-.37-.52-1.24-.99-2.39-1.52-3.62h-1.81l-.68,1.65-.96,2.35-.66,1.61-.84,2.04h1.77l.54-1.39.11-.26c.56.13,1.69.31,3.04-.06,1.62-.44,2.61-1.42,3-1.84.08.1.16.19.25.29.08.09.22.06.26-.05l.36-1,.44-1.23c.04-.11-.06-.22-.17-.2ZM12.39,11.13H.96l-.69,1.67h12.81l-.69-1.67Z"
              />
            </svg>
        </div>
          
        
        <h1>Hello {{ $user->name }},</h1>
        <p>Thank you for registering. Please verify your email address to complete your account setup.</p>
        
        <p>To verify your email, please click the button below:</p>
        <div style="text-align: center;">
            <a href="{{ $webVerificationUrl }}" class="button" role="button" aria-label="Verify Email Address">Verify Email Address</a>
        </div>
        
        <p>If you're having trouble clicking the button, you can copy and paste the following URL into your web browser:</p>
        <p><a href="{{ $webVerificationUrl }}" class="link">{{ $webVerificationUrl }}</a></p>
        
        <p>If you did not create an account, no further action is required.</p>
        
        <div class="footer">
            <p>This email was sent by Your App Name. If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>