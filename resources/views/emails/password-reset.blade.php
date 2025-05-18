<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset PIN</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 30px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        h1 {
            color: #111827;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 16px;
        }
        p {
            color: #4b5563;
            font-size: 16px;
            margin-bottom: 16px;
        }
        .pin-box {
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            background-color: #e0e7ff;
            padding: 10px 20px;
            display: inline-block;
            border-radius: 6px;
            margin: 20px auto;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
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
        <p>We received a request to reset your password. Use the following 6-digit PIN:</p>
        
        <div class="pin-box">{{ $pin }}</div>
        
        <p>This PIN is valid for 60 minutes. Do not share it with anyone.</p>
        
        <p>If you did not request a password reset, please ignore this email.</p>
        
        <div class="footer">
            <p>This email was sent by {{ config('app.name') }}. If you need help, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
