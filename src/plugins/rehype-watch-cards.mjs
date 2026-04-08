/**
 * rehype-watch-cards
 *
 * Transforms the repeating markdown watch-entry pattern into a card layout:
 *
 *   <p><a href="LINK"><img ...></a></p>   ← linked image
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

      // Match: <p> whose only child is <a> whose only child is <img>
      if (!isLinkedImageParagraph(node)) return;

      const children = parent.children;

      // Collect the nodes that make up this card
      let cursor = index;
      const imageP = children[cursor]; // the <p><a><img></a></p>
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

      // Extract the affiliate href from the linked image
      const imageLink = imageP.children.find(c => c.type === 'element' && c.tagName === 'a');
      const imgHref = imageLink?.properties?.href ?? '#';

      // Extract the img node
      const imgNode = imageLink?.children?.find(c => c.type === 'element' && c.tagName === 'img');

      // Extract the CTA link node
      const ctaLink = ctaP.children.find(c => c.type === 'element' && c.tagName === 'a');

      // Build the card node
      const card = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['watch-card-md'] },
        children: [
          // Image side
          {
            type: 'element',
            tagName: 'a',
            properties: {
              href: imgHref,
              className: ['watch-card-md__img'],
              rel: ['nofollow'],
              target: '_blank',
            },
            children: imgNode ? [imgNode] : [],
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
                  href: ctaLink?.properties?.href ?? imgHref,
                  className: ['watch-card-md__btn'],
                  rel: ['nofollow'],
                  target: '_blank',
                },
                children: [{ type: 'text', value: 'Check Price' }],
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

function isLinkedImageParagraph(node) {
  if (node.tagName !== 'p') return false;
  const realChildren = node.children.filter(c => c.type !== 'text' || c.value.trim());
  if (realChildren.length !== 1) return false;
  const a = realChildren[0];
  if (a.tagName !== 'a') return false;
  const imgChildren = a.children.filter(c => c.type !== 'text' || c.value.trim());
  return imgChildren.length === 1 && imgChildren[0].tagName === 'img';
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
  if (real.length !== 1) return false;
  const a = real[0];
  if (a.tagName !== 'a') return false;
  const text = a.children.find(c => c.type === 'text');
  return text?.value?.toLowerCase().includes('check price') ||
         text?.value?.toLowerCase().includes('check') ||
         text?.value?.toLowerCase().includes('buy') ||
         text?.value?.toLowerCase().includes('shop');
}

function isWhitespace(node) {
  return node.type === 'text' && !node.value.trim();
}
