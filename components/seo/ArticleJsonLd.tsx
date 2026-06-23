/**
 * Renders schema.org Article JSON-LD as an inline <script> tag. Server-component
 * friendly — pass a fully-resolved path (e.g. "/work/liner") and an absolute
 * image path; the helper prepends SITE_URL where needed so crawlers see
 * absolute URLs in the schema.
 *
 * Used on every case study to give Google + LinkedIn + Twitter a structured
 * record (headline, image, dates, author) that powers richer search and share
 * previews than the page <meta> tags alone.
 */

const SITE_URL = "https://www.nltstudio7.space";
const AUTHOR = { "@type": "Person", name: "Yuan Fang", url: SITE_URL } as const;

function absolutize(pathOrUrl: string): string {
  return pathOrUrl.startsWith("http") ? pathOrUrl : `${SITE_URL}${pathOrUrl}`;
}

export function ArticleJsonLd({
  url,
  headline,
  description,
  image,
  datePublished,
  dateModified,
}: {
  /** Path or absolute URL of the case study (e.g. "/work/liner"). */
  url: string;
  headline: string;
  description: string;
  /** Path or absolute URL of the OG/share image (1200×630 preferred). */
  image: string;
  /** ISO date string (YYYY-MM-DD is fine). */
  datePublished: string;
  /** ISO date string; defaults to datePublished. */
  dateModified?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    image: absolutize(image),
    url: absolutize(url),
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: AUTHOR,
    publisher: AUTHOR,
    mainEntityOfPage: { "@type": "WebPage", "@id": absolutize(url) },
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
