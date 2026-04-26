/**
 * rehype-watch-cards
 *
 * Transforms the repeating markdown watch-entry pattern into a card layout:
 *
 *   <p><a href="LINK"><img ...></a>...</p> ← one or more linked images
 *   <p><strong>Specs:</strong></p>         ← specs label  (optional)
 *   <ul>...</ul>                           ← specs list
 *   <p><a href="LINK">Check Price</a></p>  ← CTA link
 *
 * →
 *
 *   <div class="watch-card-md">
 *     <a class="watch-card-md__img" href="LINK"><img ...></a>
 *     <div class="watch-card-md__body">
 *       <ul>...</ul>
 *       <a class="watch-card-md__btn" href="LINK" ...>Check Price</a>
 *     </div>
 *   </div>
 */

import { visit } from 'unist-util-visit';

export default function rehypeWatchCards() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || index == null) return;

      const imageEntries = getLinkedImageEntries(node);
      if (imageEntries.length === 0) return;

      const children = parent.children;

      // Collect the nodes that make up this card
      let cursor = index;
      const imageP = children[cursor]; // the <p><a><img></a>...</p>
      cursor++;

      // Skip whitespace text nodes
      while (cursor < children.length && isWhitespace(children[cursor])) cursor++;

      // Optional: <p><strong>Specs:</strong></p>
      if (cursor < children.length && isSpecsLabel(children[cursor])) {
        cursor++;
        while (cursor < children.length && isWhitespace(children[cursor])) cursor++;
      }

      // Required: <ul> specs list
      if (cursor >= children.length || children[cursor].tagName !== 'ul') return;
      const specsList = children[cursor];
      cursor++;
      while (cursor < children.length && isWhitespace(children[cursor])) cursor++;

      // Required: <p><a>Check Price</a></p>
      if (cursor >= children.length || !isCheckPriceLink(children[cursor])) return;
      const ctaP = children[cursor];
      cursor++;

      // Extract the CTA link node
      const ctaLink = ctaP.children.find(c => c.type === 'element' && c.tagName === 'a');
      const firstImageHref = imageEntries[0]?.href ?? '#';
      const galleryId = `watch-card-gallery-${index}`;
      const hasGallery = imageEntries.length > 1;

      // Build the card node
      const card = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['watch-card-md'] },
        children: [
          // Image side
          {
            type: 'element',
            tagName: 'div',
            properties: {
              className: ['watch-card-md__media'],
              dataGallery: hasGallery ? 'true' : 'false',
              dataGalleryId: galleryId,
              dataCurrentIndex: '0',
            },
            children: [
              {
                type: 'element',
                tagName: 'div',
                properties: { className: ['watch-card-md__viewer'] },
                children: [
                  {
                    type: 'element',
                    tagName: 'a',
                    properties: {
                      href: firstImageHref,
                      className: ['watch-card-md__img'],
                      rel: ['nofollow'],
                      target: '_blank',
                    },
                    children: imageEntries[0]?.img ? [imageEntries[0].img] : [],
                  },
                  ...(hasGallery ? [
                    {
                      type: 'element',
                      tagName: 'button',
                      properties: {
                        type: 'button',
                        className: ['watch-card-md__nav', 'watch-card-md__nav--prev'],
                        ariaLabel: 'Show previous watch color option',
                        disabled: true,
                      },
                      children: [{ type: 'text', value: '‹' }],
                    },
                    {
                      type: 'element',
                      tagName: 'button',
                      properties: {
                        type: 'button',
                        className: ['watch-card-md__nav', 'watch-card-md__nav--next'],
                        ariaLabel: 'Show next watch color option',
                      },
                      children: [{ type: 'text', value: '›' }],
                    },
                  ] : []),
                ],
              },
              ...(hasGallery ? [{
                type: 'element',
                tagName: 'div',
                properties: { className: ['watch-card-md__thumbs'] },
                children: imageEntries.map((entry, imageIndex) => ({
                  type: 'element',
                  tagName: 'button',
                  properties: {
                    type: 'button',
                    className: imageIndex === 0
                      ? ['watch-card-md__thumb', 'is-active']
                      : ['watch-card-md__thumb'],
                    dataIndex: String(imageIndex),
                    dataHref: entry.href,
                    ariaLabel: `Show watch color option ${imageIndex + 1}`,
                    ariaPressed: imageIndex === 0 ? 'true' : 'false',
                  },
                  children: entry.img ? [cloneNode(entry.img)] : [],
                })),
              }] : []),
            ],
          },
          // Body side
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['watch-card-md__body'] },
            children: [
              specsList,
              {
                type: 'element',
                tagName: 'a',
                properties: {
                  href: ctaLink?.properties?.href ?? firstImageHref,
                  className: ['watch-card-md__btn'],
                  rel: ['nofollow'],
                  target: '_blank',
                },
                children: ctaLink?.children?.length
                  ? ctaLink.children.map(cloneNode)
                  : [{ type: 'text', value: 'Check Price' }],
              },
            ],
          },
        ],
      };

      // Replace the matched nodes with the card
      const deleteCount = cursor - index;
      parent.children.splice(index, deleteCount, card);
    });
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLinkedImageEntries(node) {
  if (node.tagName !== 'p') return [];
  const realChildren = node.children.filter(c => c.type !== 'text' || c.value.trim());
  if (realChildren.length === 0) return [];

  const entries = realChildren.map((child) => {
    if (child.tagName !== 'a') return null;
    const imgChildren = child.children.filter(c => c.type !== 'text' || c.value.trim());
    if (imgChildren.length !== 1 || imgChildren[0].tagName !== 'img') return null;

    return {
      href: child.properties?.href ?? '#',
      img: cloneNode(imgChildren[0]),
    };
  });

  return entries.every(Boolean) ? entries : [];
}

function isSpecsLabel(node) {
  if (node.tagName !== 'p') return false;
  const real = node.children.filter(c => c.type !== 'text' || c.value.trim());
  if (real.length !== 1) return false;
  return real[0].tagName === 'strong';
}

function isCheckPriceLink(node) {
  if (node.tagName !== 'p') return false;
  const real = node.children.filter(c => c.type !== 'text' || c.value.trim());
  if (real.length === 0) return false;
  // Accept paragraphs where every non-whitespace child is a link (single or multiple CTAs)
  return real.every(c => c.tagName === 'a');
}

function isWhitespace(node) {
  return node.type === 'text' && !node.value.trim();
}

function cloneNode(node) {
  return JSON.parse(JSON.stringify(node));
}
