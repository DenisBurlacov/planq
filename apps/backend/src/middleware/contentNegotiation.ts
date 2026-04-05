import type { Request, Response, NextFunction } from 'express';

/** Simple object-to-XML serializer (no library needed) */
function toXml(obj: unknown, rootName = 'root'): string {
  function serialize(value: unknown, tagName: string): string {
    if (value === null || value === undefined) {
      return `<${tagName}/>`;
    }
    if (Array.isArray(value)) {
      return value.map(item => serialize(item, 'item')).join('');
    }
    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);
      const inner = entries.map(([k, v]) => serialize(v, k)).join('');
      return `<${tagName}>${inner}</${tagName}>`;
    }
    // Escape special XML characters
    const escaped = String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    return `<${tagName}>${escaped}</${tagName}>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>${serialize(obj, rootName)}`;
}

/**
 * Content negotiation middleware.
 * When Accept header includes application/xml, intercept JSON responses
 * and convert them to XML.
 */
export function contentNegotiation(req: Request, res: Response, next: NextFunction): void {
  const accept = req.headers.accept ?? '';
  if (!accept.includes('application/xml')) {
    next();
    return;
  }

  // Override res.json to intercept the response body
  res.json = function (body: unknown) {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    const xml = toXml(body, 'response');
    res.send(xml);
    return res;
  };

  next();
}
