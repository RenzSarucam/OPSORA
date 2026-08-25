<?php

namespace Tests;

use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // CSRF is a browser/cookie concern already covered by manual and
        // end-to-end testing; feature tests here exercise auth/business
        // logic through the stateful API middleware without a real browser.
        $this->withoutMiddleware(ValidateCsrfToken::class);

        // EnsureFrontendRequestsAreStateful only starts a session (and thus
        // Sanctum's cookie-based auth) for requests whose Referer/Origin
        // matches a configured stateful domain — exactly like the real SPA.
        $this->withHeader('Referer', 'http://localhost:3000');
    }
}
