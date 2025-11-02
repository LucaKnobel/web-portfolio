import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as email from '../src/utils/email.js';
import nodemailer from 'nodemailer';

// Mock nodemailer
vi.mock('nodemailer');

describe('Email Utilities', () => {
    const mockTransporter = {
        sendMail: vi.fn(),
        verify: vi.fn()
    };

    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks();
        (nodemailer.createTransport as any).mockReturnValue(mockTransporter);
        
        // Set up test environment variables
        process.env = {
            ...originalEnv,
            SMTP_HOST: 'smtp.test-server.example',
            SMTP_PORT: '587',
            SMTP_USER: 'test-user@example.com',
            SMTP_PASS: 'test-password-12345',
            SMTP_FROM: 'noreply@example.com',
            SMTP_TO: 'recipient@example.com'
        };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('sendContactEmail', () => {
        const validEmailData: email.EmailData = {
            firstName: 'Max',
            lastName: 'Mustermann',
            email: 'max@example.com',
            subject: 'Test Subject',
            message: 'This is a test message'
        };

        it('should send email successfully with all required fields', async () => {
            mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-123' });

            const result = await email.sendContactEmail(validEmailData);

            expect(result.success).toBe(true);
            expect(result.messageId).toBe('test-message-123');
            expect(result.error).toBeUndefined();
            expect(mockTransporter.sendMail).toHaveBeenCalledOnce();
        });

        it('should include optional company and phone fields', async () => {
            mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-123' });

            const dataWithOptionals: email.EmailData = {
                ...validEmailData,
                company: 'ACME Corporation',
                phone: '+41 76 123 45 67'
            };

            await email.sendContactEmail(dataWithOptionals);

            const call = mockTransporter.sendMail.mock.calls[0]?.[0];
            expect(call).toBeDefined();
            if (!call) return;
            
            expect(call.text).toContain('ACME Corporation');
            expect(call.text).toContain('+41 76 123 45 67');
            expect(call.html).toContain('ACME Corporation');
            expect(call.html).toContain('+41 76 123 45 67');
        });

        it('should format email with correct structure', async () => {
            mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-123' });

            await email.sendContactEmail(validEmailData);

            const call = mockTransporter.sendMail.mock.calls[0]?.[0];
            expect(call).toBeDefined();
            if (!call) return;
            
            // Check basic structure
            expect(call.from).toContain('Max Mustermann');
            expect(call.from).toContain(process.env.SMTP_FROM);
            expect(call.to).toBe(process.env.SMTP_TO);
            expect(call.replyTo).toBe('max@example.com');
            expect(call.subject).toBe('[Web-Portfolio] Test Subject');
        });

        it('should include sender info in email content', async () => {
            mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-123' });

            await email.sendContactEmail(validEmailData);

            const call = mockTransporter.sendMail.mock.calls[0]?.[0];
            expect(call).toBeDefined();
            if (!call) return;
            
            expect(call.text).toContain('Max Mustermann');
            expect(call.text).toContain('max@example.com');
            expect(call.text).toContain('Test Subject');
            expect(call.text).toContain('This is a test message');
            expect(call.html).toContain('Max Mustermann');
            expect(call.html).toContain('max@example.com');
        });

        it('should handle SMTP errors gracefully', async () => {
            const smtpError = new Error('SMTP connection failed');
            mockTransporter.sendMail.mockRejectedValue(smtpError);

            const result = await email.sendContactEmail(validEmailData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('SMTP connection failed');
            expect(result.messageId).toBeUndefined();
        });

        it('should handle unknown errors', async () => {
            mockTransporter.sendMail.mockRejectedValue('Unknown error');

            const result = await email.sendContactEmail(validEmailData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Unknown error during email sending');
        });

        it('should return error result when SMTP_HOST is missing', async () => {
            delete process.env.SMTP_HOST;

            const result = await email.sendContactEmail(validEmailData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Missing required SMTP configuration');
        });

        it('should return error result when SMTP_USER is missing', async () => {
            delete process.env.SMTP_USER;

            const result = await email.sendContactEmail(validEmailData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Missing required SMTP configuration');
        });

        it('should return error result when SMTP_PASS is missing', async () => {
            delete process.env.SMTP_PASS;

            const result = await email.sendContactEmail(validEmailData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Missing required SMTP configuration');
        });

        it('should return error result when SMTP_PORT is missing', async () => {
            delete process.env.SMTP_PORT;

            const result = await email.sendContactEmail(validEmailData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Missing required SMTP configuration');
        });

        it('should handle empty optional fields correctly', async () => {
            mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-123' });

            const dataWithEmptyOptionals: email.EmailData = {
                ...validEmailData,
                company: '',
                phone: ''
            };

            await email.sendContactEmail(dataWithEmptyOptionals);

            const call = mockTransporter.sendMail.mock.calls[0]?.[0];
            expect(call).toBeDefined();
            if (!call) return;
            
            expect(call.text).toContain('Company:');
            expect(call.text).toContain('Phone:');
        });

        it('should preserve message formatting', async () => {
            mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-123' });

            const multilineMessage = 'Line 1\nLine 2\nLine 3';
            await email.sendContactEmail({
                ...validEmailData,
                message: multilineMessage
            });

            const call = mockTransporter.sendMail.mock.calls[0]?.[0];
            expect(call).toBeDefined();
            if (!call) return;
            
            expect(call.text).toContain('Line 1\nLine 2\nLine 3');
        });

        it('should create transporter with correct settings from env', async () => {
            mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-123' });

            await email.sendContactEmail(validEmailData);

            expect(nodemailer.createTransport).toHaveBeenCalledWith({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT!, 10),
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        });
    });

    describe('validateEmailConfig', () => {
        it('should validate config successfully', async () => {
            mockTransporter.verify.mockResolvedValue(true);

            const isValid = await email.validateEmailConfig();

            expect(isValid).toBe(true);
            expect(mockTransporter.verify).toHaveBeenCalledOnce();
        });

        it('should return false on verification failure', async () => {
            mockTransporter.verify.mockRejectedValue(new Error('Verification failed'));

            const isValid = await email.validateEmailConfig();

            expect(isValid).toBe(false);
        });

        it('should return false when SMTP config is missing', async () => {
            delete process.env.SMTP_HOST;

            const isValid = await email.validateEmailConfig();

            expect(isValid).toBe(false);
        });

        it('should handle network errors', async () => {
            mockTransporter.verify.mockRejectedValue(new Error('ECONNREFUSED'));

            const isValid = await email.validateEmailConfig();

            expect(isValid).toBe(false);
        });

        it('should handle authentication errors', async () => {
            mockTransporter.verify.mockRejectedValue(new Error('Invalid credentials'));

            const isValid = await email.validateEmailConfig();

            expect(isValid).toBe(false);
        });
    });
});
