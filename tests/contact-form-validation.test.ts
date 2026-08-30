import { describe, it, expect } from "vitest";
import { contactFormSchema } from "@/server/infrastructure/validation/contact-form-validation.js";

describe("contactFormSchema", () => {
  const validPayload = {
    firstName: "Max",
    lastName: "Mustermann",
    email: "max.mustermann@example.com",
    subject: "Project Inquiry",
    message: "Hello, I would like to discuss a project.",
    privacy: "true",
    website: "",
  };

  it("parses valid form input successfully", () => {
    const result = contactFormSchema.safeParse(validPayload);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.firstName).toBe("Max");
      expect(result.data.privacy).toBe(true);
      expect(result.data.email).toBe("max.mustermann@example.com");
    }
  });

  it("fails when required fields are missing", () => {
    const invalidPayload = { ...validPayload, firstName: "A" };
    const result = contactFormSchema.safeParse(invalidPayload);

    expect(result.success).toBe(false);
  });

  it("fails when email is invalid", () => {
    const invalidPayload = { ...validPayload, email: "not-an-email" };
    const result = contactFormSchema.safeParse(invalidPayload);

    expect(result.success).toBe(false);
  });

  it("fails when privacy policy is not agreed to", () => {
    const invalidPayload = { ...validPayload, privacy: false };
    const result = contactFormSchema.safeParse(invalidPayload);

    expect(result.success).toBe(false);
  });

  it("fails when honeypot website field is filled out", () => {
    const botPayload = { ...validPayload, website: "http://spam-bot.com" };
    const result = contactFormSchema.safeParse(botPayload);

    expect(result.success).toBe(false);
  });
});
