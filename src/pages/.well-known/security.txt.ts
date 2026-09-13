import type { APIRoute } from "astro";

/**
 * RFC 9116 security.txt (https://www.rfc-editor.org/rfc/rfc9116).
 * `Expires` is a fixed date, not "now + 1 year" - the whole point of the
 * field is to force a manual review; a rolling date would never go stale.
 * Bump it whenever this file is revisited, at most one year out.
 */
const EXPIRES = "2027-09-13T00:00:00.000Z";

const getSecurityTxt = (canonicalURL: URL) => `\
Contact: mailto:web-portfolio@lucaknobel.ch
Expires: ${EXPIRES}
Preferred-Languages: de, en
Canonical: ${canonicalURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const canonicalURL = new URL(".well-known/security.txt", site);
  return new Response(getSecurityTxt(canonicalURL), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
