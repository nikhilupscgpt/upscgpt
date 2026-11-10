import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

/**
 * Sanitize schema for markdown that may contain embedded raw HTML
 * (AI-generated notes, Google-Doc ingested content, admin-authored content).
 *
 * Based on GitHub's `defaultSchema` (which already strips script/style/iframe/
 * object/embed/form/meta/base/link, every on* handler, `style` attributes and
 * javascript:/data: URLs), extended with the extra formatting tags our content
 * uses and an unrestricted `className` so `<span class="…">` / `<div class="…">`
 * keep their styling. `style` attributes are intentionally NOT allowed.
 *
 * `clobberPrefix` is left at the default (`user-content-`) so raw `id`/`name`
 * attributes can't clobber DOM globals; none of the rendering components rely
 * on in-content anchor ids.
 */
export const markdownSanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'mark',
    'u',
    'small',
    'big',
    'abbr',
    'cite',
    'dfn',
    'caption',
    'col',
    'colgroup',
    'figure',
    'figcaption',
    'time',
    'wbr',
  ],
  // Drop <style>/<script> including their text content (instead of leaving raw CSS text behind).
  strip: [...(defaultSchema.strip || []), 'style'],
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] || []), 'className'],
  },
};

/** Use as `rehypePlugins={SAFE_REHYPE_PLUGINS}` on <ReactMarkdown>. Sanitize must run after raw. */
export const SAFE_REHYPE_PLUGINS = [rehypeRaw, [rehypeSanitize, markdownSanitizeSchema]];
