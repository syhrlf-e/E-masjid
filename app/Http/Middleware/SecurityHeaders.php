<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        // Define allowed sources for Vite Dev Server (for development environments)
        // Note: CSP parser in browsers strictly handles IPv6 brackets.
        $viteHost = "http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*";

        // To completely avoid Vite HMR blocked by CSP in Local Development,
        // we conditionally apply CSP only on Production.
        if (config('app.env') === 'production') {
             $response->headers->set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' ws: wss:; frame-ancestors 'none';");
        } else {
             // In local environment, completely disable CSP to avoid interfering with Vite HMR
             // Browser's CSP parser often trips on "ws://[::1]:5173" and varying dynamic ports.
        }

        return $response;
    }
}
