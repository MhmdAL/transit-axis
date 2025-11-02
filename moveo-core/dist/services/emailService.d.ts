export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare class EmailService {
    private static instance;
    private transporter;
    private constructor();
    static getInstance(): EmailService;
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendActivationEmail(email: string, activationCode: string, userName: string): Promise<boolean>;
    sendPasswordResetEmail(email: string, resetCode: string, userName: string): Promise<boolean>;
}
declare const _default: EmailService;
export default _default;
//# sourceMappingURL=emailService.d.ts.map