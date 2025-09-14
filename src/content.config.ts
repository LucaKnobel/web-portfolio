import { defineCollection, z } from "astro:content";

const careerSchema = z.object({
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

export const collections = {
  career: defineCollection({ type: "data", schema: z.array(careerSchema) }),
  education: defineCollection({ type: "data", schema: z.array(educationSchema) }),
};