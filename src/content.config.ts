import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const postSchema = z.object({
  title: z.string(),
  seoTitle: z.string().optional(),
  date: z.coerce.date(),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  description: z.string().optional(),
  heroImage: z.string().optional(),
  author: z.string().optional(),
  draft: z.boolean().default(false),
  ratingTotal:       z.number().optional(),
  ratingDialCase:    z.number().optional(),
  ratingDial:        z.number().optional(),
  ratingCase:        z.number().optional(),
  ratingComfort:     z.number().optional(),
  ratingWearability: z.number().optional(),
  ratingPrice:       z.number().optional(),
  price:             z.number().optional(),
  priceCurrency:     z.string().optional(),
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

const alternatives = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/alternatives' }),
  schema: postSchema,
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: postSchema,
});

export const collections = { reviews, guides, comparisons, alternatives, pages };
