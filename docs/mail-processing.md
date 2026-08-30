# Mail Processing & Rate Limiting Flow

This document details how contact form submissions are validated, rate limited, and dispatched as emails.

## Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant Action as sendMail Action
    participant UseCase as buildSendEmail Use Case
    participant Limiter as In-Memory Rate Limiter
    participant Template as Email Template
    participant Sender as Email Sender (SMTP)

    User->>Action: Submit Contact Form
    Action->>Action: Validate Input (contactFormSchema)
    Action->>UseCase: Execute sendEmail(data)

    UseCase->>Limiter: tryAcquire() Slot
    alt Daily Limit Exceeded (>= 10)
        Limiter-->>UseCase: null
        UseCase-->>Action: Throw RateLimitExceededError
        Action-->>User: 429 TOO_MANY_REQUESTS
    else Slot Available (< 10)
        Limiter-->>UseCase: RateLimitReservation
        UseCase->>Template: buildEmailTemplate(data)
        Template-->>UseCase: { html, text }
        UseCase->>Sender: send(data)

        alt SMTP Dispatch Succeeds
            Sender-->>UseCase: { success: true, messageId }
            UseCase-->>Action: EmailResult
            Action-->>User: 200 { success: true }
        else SMTP Dispatch Fails
            Sender-->>UseCase: { success: false, error }
            UseCase->>Limiter: release(reservation)
            UseCase-->>Action: Throw EmailSendError
            Action-->>User: 400 BAD_REQUEST
        end
    end
```

## Step-by-Step Flow Explanation

1. **Client Submission & Input Validation**:
   - The user submits the contact form.
   - Astro validates the form input using `contactFormSchema` ([src/server/infrastructure/validation/contact-form-validation.ts](../src/server/infrastructure/validation/contact-form-validation.ts)).
   - Honeypot validation ensures the `website` field is empty.

2. **Rate Limiting Check (`tryAcquire`)**:
   - The `buildSendEmail` use case calls `rateLimiter.tryAcquire()`.
   - The in-memory rate limiter tracks sent emails per Swiss calendar day (`Europe/Zurich`).
   - Up to **10 emails** per day are permitted.
   - If 10 slots are already used, a `RateLimitExceededError` is thrown, which maps to `TOO_MANY_REQUESTS` (HTTP 429).

3. **Template Formatting & Sanitization**:
   - The message content is passed to `buildEmailTemplate`.
   - Input strings are HTML-escaped (`<`, `>`, `&`, `"`, `'`) to prevent XSS/HTML injection inside HTML email clients.

4. **Email Dispatch**:
   - Depending on the environment (`import.meta.env.DEV`), `composition.ts` selects either:
     - **Development**: `EtherealEmailSender` (creates a mock Ethereal SMTP account and logs a preview URL).
     - **Production**: `NodemailerEmailSender` (sends email via Infomaniak SMTP configured with `astro:env/server`).

5. **Error Handling & Slot Release**:
   - If SMTP dispatch fails, `rateLimiter.release(reservation)` is called to refund the daily slot.
   - `handleActionError` catches errors and returns structured Astro `ActionError` responses.
