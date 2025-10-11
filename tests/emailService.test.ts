import { describe, it, expect, beforeEach } from 'vitest';

interface EmailData {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
    company?: string;
    phone?: string;
}

interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

interface EmailService {
    sendEmail: (data: EmailData) => Promise<EmailResult>;
    validateConfig: () => Promise<boolean>;
}

/**
 * Test Mock Email Service (completely isolated)
 */
class TestMockEmailService implements EmailService {
    private sentEmails: EmailData[] = [];
    private shouldFail = false;
    private delay = 10;

    async sendEmail(data: EmailData): Promise<EmailResult> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, this.delay));

        if (this.shouldFail) {
            return { success: false, error: 'Mock failure' };
        }

        this.sentEmails.push(data);
        return { success: true, messageId: `mock-${Date.now()}-${this.sentEmails.length}` };
    }

    async validateConfig(): Promise<boolean> {
        return !this.shouldFail;
    }

    // Test helpers
    getSentEmails(): EmailData[] {
        return [...this.sentEmails];
    }

    reset(): void {
        this.sentEmails = [];
        this.shouldFail = false;
        this.delay = 10;
    }

    setFailure(shouldFail: boolean): void {
        this.shouldFail = shouldFail;
    }

    setDelay(ms: number): void {
        this.delay = ms;
    }
}

describe('EmailService', () => {
    let service: TestMockEmailService;
    const sampleEmailData: EmailData = {
        firstName: 'Max',
        lastName: 'Mustermann',
        email: 'max@example.com',
        subject: 'Test Subject',
        message: 'Test message content',
        company: 'Test Company',
        phone: '+41 76 123 45 67'
    };

    beforeEach(() => {
        service = new TestMockEmailService();
        service.reset();
    });

    describe('sendEmail', () => {
        it('should send email successfully', async () => {
            const result = await service.sendEmail(sampleEmailData);

            expect(result.success).toBe(true);
            expect(result.messageId).toMatch(/^mock-\d+-1$/);
            expect(result.error).toBeUndefined();
        });

        it('should record sent emails', async () => {
            await service.sendEmail(sampleEmailData);

            const sentEmails = service.getSentEmails();
            expect(sentEmails).toHaveLength(1);
            expect(sentEmails[0]).toEqual(sampleEmailData);
        });

        it('should handle multiple emails', async () => {
            const email1 = { ...sampleEmailData, subject: 'First Email' };
            const email2 = { ...sampleEmailData, subject: 'Second Email' };

            await service.sendEmail(email1);
            await service.sendEmail(email2);

            const sentEmails = service.getSentEmails();
            expect(sentEmails).toHaveLength(2);
            expect(sentEmails[0]?.subject).toBe('First Email');
            expect(sentEmails[1]?.subject).toBe('Second Email');
        });

        it('should handle emails without optional fields', async () => {
            const minimalEmail: EmailData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                subject: 'Minimal Email',
                message: 'Just the required fields'
            };

            const result = await service.sendEmail(minimalEmail);

            expect(result.success).toBe(true);

            const sentEmails = service.getSentEmails();
            expect(sentEmails[0]).toEqual(minimalEmail);
        });

        it('should fail when configured to fail', async () => {
            service.setFailure(true);

            const result = await service.sendEmail(sampleEmailData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Mock failure');
            expect(result.messageId).toBeUndefined();
        });

        it('should not record emails that fail to send', async () => {
            service.setFailure(true);

            await service.sendEmail(sampleEmailData);

            const sentEmails = service.getSentEmails();
            expect(sentEmails).toHaveLength(0);
        });

        it('should generate unique message IDs', async () => {
            const results = await Promise.all([
                service.sendEmail({ ...sampleEmailData, subject: 'Email 1' }),
                service.sendEmail({ ...sampleEmailData, subject: 'Email 2' }),
                service.sendEmail({ ...sampleEmailData, subject: 'Email 3' })
            ]);

            const messageIds = results.map(r => r.messageId);
            const uniqueIds = new Set(messageIds);

            expect(uniqueIds.size).toBe(3); // All IDs should be unique
        });
    });

    describe('validateConfig', () => {
        it('should validate config successfully by default', async () => {
            const isValid = await service.validateConfig();
            expect(isValid).toBe(true);
        });

        it('should fail validation when set to fail', async () => {
            service.setFailure(true);

            const isValid = await service.validateConfig();
            expect(isValid).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle concurrent email sending', async () => {
            const emails = Array.from({ length: 5 }, (_, i) => ({
                ...sampleEmailData,
                subject: `Concurrent Email ${i + 1}`
            }));

            const promises = emails.map(email => service.sendEmail(email));
            const results = await Promise.all(promises);

            // All should succeed
            results.forEach(result => {
                expect(result.success).toBe(true);
            });

            // All should be recorded
            const sentEmails = service.getSentEmails();
            expect(sentEmails).toHaveLength(5);
        });

        it('should handle empty string values gracefully', async () => {
            const emailWithEmptyStrings: EmailData = {
                firstName: '',
                lastName: '',
                email: 'test@example.com',
                subject: '',
                message: '',
                company: '',
                phone: ''
            };

            const result = await service.sendEmail(emailWithEmptyStrings);
            expect(result.success).toBe(true);
        });

        it('should simulate network delays', async () => {
            service.setDelay(50);

            const startTime = Date.now();
            await service.sendEmail(sampleEmailData);
            const endTime = Date.now();

            expect(endTime - startTime).toBeGreaterThanOrEqual(45); // Allow some tolerance
        });
    });
});