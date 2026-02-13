<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>LNU SIMS {{ config('app.version') }}</title>
        <link rel="icon" href="{{ asset('favicon.ico') }}">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

        @viteReactRefresh
        @vite('resources/js/main.jsx')
    </head>
    <body>
        <div id="root"></div>
    </body>
</html>