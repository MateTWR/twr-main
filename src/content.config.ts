import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  description: z.string().optional(),
  heroImage: z.string().optional(),
  author: z.string().optional(),
  draft: z.boolean().default(false),
});

const reviews = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/reviews' }),
  schema: postSchema,
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: postSchema,
});

const comparisons = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/comparisons' }),
  schema: postSchema,
});

const misc = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/misc' }),
  schema: postSchema,
});

export const collections = { reviews, guides, comparisons, misc };
