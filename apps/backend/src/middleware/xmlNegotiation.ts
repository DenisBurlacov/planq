import type { Request, Response, NextFunction } from 'express';

/**
 * Convert a JavaScript value to well-formed XML string.
 * Handles objects, arrays, primitives, null, and nested structures.
 */
function toXml(value: unknown, rootTag = 'response'): string {
  const escape = (str: string): string =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  function serialize(val: unknown, tag: string): string {
    if (val === null || val === undefined) {
      return `<${tag}/>`;
    }

    if (Array.isArray(val)) {
      // Singularize tag for items: "items" -> "item", default "element"
      const itemTag = tag.endsWith('s') ? tag.slice(0, -1) : 'element';
      return `<${tag}>${val.map(item => serialize(item, itemTag)).join('')}</${tag}>`;
    }

    if (typeof val === 'object' && val instanceof Date) {
      return `<${tag}>${escape(val.toISOString())}</${tag}>`;
    }

    if (typeof val === 'object') {
      const entries = Object.entries(val as Record<string, unknown>);
      const inner = entries.map(([key, v]) => serialize(v, key)).join('');
      return `<${tag}>${inner}</${tag}>`;
    }

    if (typeof val === 'boolean' || typeof val === 'number') {
      return `<${tag}>${String(val)}</${tag}>`;
    }

    return `<${tag}>${escape(String(val))}</${tag}>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>${serialize(value, rootTag)}`;
}

/**
 * Content negotiation middleware.
 * When the client sends `Accept: application/xml`, intercepts JSON responses
 * and transforms them to XML.
 */
export function xmlNegotiation(req: Request, res: Response, next: NextFunction): void {
  const acceptHeader = req.headers.accept ?? '';
  const wantsXml = acceptHeader.includes('application/xml') || acceptHeader.includes('text/xml');

  if (req.method !== 'GET' || !wantsXml) {
    next();
    return;
  }

  // Override res.json to intercept the response body
  const originalJson = res.json.bind(res);

  res.json = function xmlJsonOverride(body: unknown) {
    // Only transform successful responses (2xx)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const xml = toXml(body);
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.send(xml);
      return res;
    }
    return originalJson(body);
  };

  next();
}
