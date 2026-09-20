import { defineCollection, z } from 'astro:content';

const subjectsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    subject: z.string(),
    professional: z.string(),
    chapter: z.string(),
    topic: z.string(),
    subtopic: z.string(),
    questions: z.array(z.object({
      id: z.string(),
      clusterId: z.string().optional(),
      canonical: z.boolean().default(true),
      type: z.enum(["SAQ", "LAQ", "PBQ"]),
      question: z.string(),
      marks: z.number().optional(),
      batchYears: z.array(z.string()),
      yearKnown: z.boolean().default(true),
      tags: z.array(z.string()).optional(),
      questionImages: z.array(z.string()).optional(),
      variants: z.array(z.object({
        batchYear: z.string(),
        paper: z.string().optional(),
        text: z.string()
      })).optional(),
      answer: z.object({
        status: z.enum(["draft", "review", "verified"]),
        content: z.string().optional(),
        images: z.array(z.string()).optional(),
        contributorCount: z.number().default(1),
        references: z.array(z.string()).optional(),
        lastUpdated: z.string().optional()
      }).optional()
    }))
  })
});

export const collections = {
  'subjects': subjectsCollection,
};
