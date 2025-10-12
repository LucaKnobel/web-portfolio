import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const careerSchema = z.object({
  id: z.string(),
  organizationName: z.string(),
  organizationWebsite: z.string().url(),
  title: z.string(),
  employmentRate: z.string(),
  period: z.object({
    start: z.string(),
    end: z.string(),
  }),
  responsibilities: z.array(z.string()),
  keySkills: z.array(z.string()),
});

const educationSchema = z.object({
  id: z.string(),
  organizationName: z.string(),
  organizationWebsite: z.string().url(),
  title: z.string(),
  studyMode: z.string(),
  period: z.object({
    start: z.string(),
    end: z.string(),
  }),
  keySkills: z.array(z.string()),
  finalGrade: z.union([z.string(), z.number()]),
});

const career = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/career" }),
  schema: z.array(careerSchema),
});

const education = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/education" }),
  schema: z.array(educationSchema),
});

const projects = defineCollection({
  loader: glob({ 
    pattern: "**/*.md", 
    base: "./src/content/projects",
    generateId: ({ entry }) => {
      /* Preserve directory structure in ID: "de/bashnet" and "en/bashnet" */
      return entry.replace(/\.md$/, "");
    }
  }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    lang: z.string(),
    tags: z.array(z.string()),
    cover: image(), 
    url: z.string().url(),
  }),
});

const privacyPolicy = defineCollection({
  loader: glob({ pattern: "**/*.md",
  base: "./src/content/privacy",
  generateId: ({ entry }) => {
      return entry.replace(/\.md$/, "");
    } }),
  
});

export const collections = { 
  career,
  education,
  projects,
  privacyPolicy,
};