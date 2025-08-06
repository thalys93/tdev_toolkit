export interface ApiResponse<T = any> {
  data?: T;
  status: string;
  code: number;
  key: string;
  message?: string;
}

export interface ApiErrorResponse {
  error: string;
  status: string;
  code: number;
  key: string;
  message?: string;
  details?: any;
}

export class ApiResponseBuilder {
  static success<T>(
    data: T,
    status: string,
    code: number,
    key: string,
    message?: string,
  ): ApiResponse<T> {
    return {
      data,
      status,
      code,
      key,
      message,
    };
  }

  static error(
    error: string,
    status: string,
    code: number,
    key: string,
    message?: string,
    details?: any,
  ): ApiErrorResponse {
    return {
      error,
      status,
      code,
      key,
      message,
      details,
    };
  }
}

// Constantes para padronizar as chaves dos módulos
export const API_KEYS = {
  CORE: {
    SYSTEM_CHECK: 'core.system-check',
    CLOUDINARY_SIGNATURE: 'core.cloudinary-signature',
  },
  EMAIL: {
    HEALTH: 'email.health',
    SEND: 'email.send',
    SEND_TEMPLATE: 'email.send-template',
    SEND_WELCOME: 'email.send-welcome',
    SEND_PASSWORD_RESET: 'email.send-password-reset',
    SEND_NOTIFICATION: 'email.send-notification',
    SEND_TEST: 'email.send-test',
    GET_TEMPLATES: 'email.templates',
    GET_TEMPLATE_INFO: 'email.template-info',
  },
  PAYMENT: {
    CREATE: 'payment.create',
    WEBHOOK_STRIPE: 'payment.webhook-stripe',
    WEBHOOK_MERCADOPAGO: 'payment.webhook-mercadopago',
    WEBHOOK_ABACATEPAY: 'payment.webhook-abacatepay',
  },
} as const;

// Status padrões
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  VALIDATION_ERROR: 'validation_error',
  NOT_FOUND: 'not_found',
  INTERNAL_ERROR: 'internal_error',
  WEBHOOK_PROCESSED: 'webhook_processed',
  WEBHOOK_IGNORED: 'webhook_ignored',
} as const;

// Tipo para os valores de status
export type ApiStatusType = (typeof API_STATUS)[keyof typeof API_STATUS];
