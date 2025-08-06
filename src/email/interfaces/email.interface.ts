export interface EmailTemplate {
  name: string;
  subject: string;
  htmlTemplate: string;
  textTemplate?: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailQueueJob {
  to: string;
  subject: string;
  template?: string;
  templateData?: Record<string, any>;
  html?: string;
  text?: string;
  priority?: 'low' | 'normal' | 'high';
  delay?: number;
}
