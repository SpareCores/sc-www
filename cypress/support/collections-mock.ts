type StoredCollectionItem = Record<string, unknown> & { id: string };

const COLLECTIONS_PATH = /\/collections\/([^/]+)(?:\/([^/]+))?\/?$/;

function parseBody(body: unknown): Record<string, unknown> {
  if (typeof body === "string") {
    return body ? (JSON.parse(body) as Record<string, unknown>) : {};
  }
  return (body as Record<string, unknown> | undefined) ?? {};
}

export function mockCollectionsApi(): void {
  const store = new Map<string, Map<string, StoredCollectionItem>>();

  cy.intercept({ url: /\/collections\// }, (req) => {
    const match = COLLECTIONS_PATH.exec(new URL(req.url).pathname);
    if (!match) {
      req.reply(404, { detail: "Not found" });
      return;
    }

    const type = decodeURIComponent(match[1]);
    const items = store.get(type) ?? new Map<string, StoredCollectionItem>();
    store.set(type, items);
    const id = match[2] ? decodeURIComponent(match[2]) : undefined;

    switch (req.method) {
      case "OPTIONS":
        req.reply(204);
        return;
      case "GET":
        if (!id) {
          req.reply(200, [...items.values()]);
        } else if (items.has(id)) {
          req.reply(200, items.get(id));
        } else {
          req.reply(404, { detail: "Not found" });
        }
        return;
      case "PUT":
        if (id) {
          const item: StoredCollectionItem = {
            bookmarked_at:
              items.get(id)?.bookmarked_at ?? new Date().toISOString(),
            ...parseBody(req.body),
            id,
          };
          items.set(id, item);
          req.reply(200, item);
          return;
        }
        break;
      case "DELETE":
        if (id) {
          items.delete(id);
          req.reply(204);
          return;
        }
        break;
    }

    req.reply(405, { detail: "Method not allowed" });
  });
}
