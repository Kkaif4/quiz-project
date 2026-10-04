import React from "react";

interface JsonLdProps<T extends Record<string, unknown>> {
  data: T;
}

/**
 * High-performance Server Component that renders application/ld+json structured data.
 * Neutralizes stored XSS injection vectors by escaping raw '<' characters to unicode '\u003c'.
 */
export function JsonLd<T extends Record<string, unknown>>({
  data,
}: JsonLdProps<T>) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
