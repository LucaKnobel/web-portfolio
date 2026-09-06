import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const httpsUrl = z.url({
  protocol: /^https$/,
  error: "URL must be a valid HTTPS URL",
});

const projectLanguage = z.enum(["de", "en"]);
const projectDate = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Date must use the YYYY-MM format");

const careerSchema = z.object({
  id: z.string(),
  organizationName: z.string(),
  organizationWebsite: httpsUrl,
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
  organizationWebsite: httpsUrl,
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
    },
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: projectDate,
      lang: projectLanguage,
      tags: z.array(z.string()),
      cover: image(),
      url: httpsUrl.optional(),
    }),
});

const privacyPolicy = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/privacy",
    generateId: ({ entry }) => {
      return entry.replace(/\.md$/, "");
    },
  }),
});

export const collections = {
  career,
  education,
  projects,
  privacyPolicy,
};
