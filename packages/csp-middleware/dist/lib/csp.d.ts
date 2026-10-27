import type { Middleware, RequestContext } from '@remix-run/fetch-router';
import { ContentSecurityPolicy, type ContentSecurityPolicyInit } from '@remix-run/headers/content-security-policy';
import { CspNonce } from './nonce.ts';
/** A single static CSP, either serialized or expressed as directives. */
export type CspPolicy = string | ContentSecurityPolicyInit | ContentSecurityPolicy;
/** Values available while creating a request's policy, before downstream handlers run. */
export interface CspPolicyContext {
    /** Cryptographically random nonce, shared with internal renders of this document. */
    nonce: string;
    /** Current router request context. */
    context: RequestContext;
}
/** Creates a policy using the current request's nonce and context. */
export type CspPolicyFactory = (context: CspPolicyContext) => CspPolicy | Promise<CspPolicy>;
/** Policy and response configuration for CSP middleware. */
export interface CspOptions {
    /** A static policy or a factory evaluated before downstream handlers run. */
    policy: CspPolicy | CspPolicyFactory;
    /** Send Content-Security-Policy-Report-Only instead of an enforcing header (default false). */
    reportOnly?: boolean;
    /**
     * Named URLs to add to `Reporting-Endpoints` on responses accepted by `filter`.
     * Reference a name with the policy's `reportTo` directive. Relative URLs are supported.
     * Existing endpoint names are preserved unless configured here with a different URL.
     * Names must be structured field keys; URLs must contain only printable ASCII characters.
     */
    reportingEndpoints?: Readonly<Record<string, string>>;
    /**
     * Select responses that receive this policy (default all responses).
     * Runs after downstream handlers, before adding policy and reporting endpoint headers.
     * Returning false preserves the original response. The nonce and policy are still
     * established before downstream handlers run.
     */
    filter?: (response: Response) => boolean;
}
/**
 * Establishes a request nonce and appends a CSP to responses accepted by the optional filter.
 * Existing policies retain their enforcement or reporting mode. No default directives are added.
 * @param options The required policy and optional response configuration.
 * @returns Middleware providing the nonce read by `getCspNonce()` and the CSP response header.
 */
export declare function csp(options: CspOptions): Middleware<{
    key: typeof CspNonce;
    value: string;
}>;
//# sourceMappingURL=csp.d.ts.map