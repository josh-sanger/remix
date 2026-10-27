import { ContentSecurityPolicy, } from '@remix-run/headers/content-security-policy';
import { CspNonce, getCspNonce } from './nonce.js';
/**
 * Establishes a request nonce and appends a CSP to responses accepted by the optional filter.
 * Existing policies retain their enforcement or reporting mode. No default directives are added.
 * @param options The required policy and optional response configuration.
 * @returns Middleware providing the nonce read by `getCspNonce()` and the CSP response header.
 */
export function csp(options) {
    let { policy, filter } = options;
    let reportingEndpoints = serializeReportingEndpoints(options.reportingEndpoints ?? {});
    let headerName = options.reportOnly
        ? 'Content-Security-Policy-Report-Only'
        : 'Content-Security-Policy';
    let staticPolicy = typeof policy === 'function' ? undefined : ContentSecurityPolicy.from(policy).toString();
    return async (context, next) => {
        let nonce = getCspNonce(context) ?? createNonce();
        context.set(CspNonce, nonce);
        let header = typeof policy === 'function'
            ? ContentSecurityPolicy.from(await policy({ nonce, context })).toString()
            : staticPolicy;
        let response = await next();
        if (filter && !filter(response))
            return response;
        let headers = new Headers(response.headers);
        if (header)
            headers.append(headerName, header);
        if (reportingEndpoints) {
            let existing = headers.get('Reporting-Endpoints')?.trim();
            // Structured field dictionaries use the last value for duplicate endpoint names.
            headers.set('Reporting-Endpoints', existing ? `${existing}, ${reportingEndpoints}` : reportingEndpoints);
        }
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
        });
    };
}
function serializeReportingEndpoints(endpoints) {
    return Object.entries(endpoints)
        .map(([name, url]) => {
        if (!/^[a-z*][a-z0-9_.*-]*$/.test(name)) {
            throw new TypeError(`Invalid reporting endpoint name: ${JSON.stringify(name)}`);
        }
        if (/[^\x20-\x7e]/.test(url)) {
            throw new TypeError(`Invalid reporting endpoint URL for ${name}: use printable ASCII or percent-encoding`);
        }
        return `${name}=${JSON.stringify(url)}`;
    })
        .join(', ');
}
function createNonce() {
    let bytes = crypto.getRandomValues(new Uint8Array(16));
    return btoa(String.fromCharCode(...bytes));
}
