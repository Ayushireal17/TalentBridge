<?php
return [
    "gemini" => [
        "key"     => env("GEMINI_API_KEY"),
        "model"   => env("GEMINI_MODEL", "gemini-1.5-flash"),
        "timeout" => (int) env("GEMINI_TIMEOUT", 60),
    ],
    "mailgun" => ["domain" => env("MAILGUN_DOMAIN"), "secret" => env("MAILGUN_SECRET")],
];
