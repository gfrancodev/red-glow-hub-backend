export interface ErrorFormat {
  code: string; // ex: "PL-0500"
  identifier: string; // ex: "INTERNAL_ERROR"
  message: string; // ex: "Internal Server Error"
  description?: string; // texto técnico (logs)
  status: number; // HTTP status
}

export interface ErrorResponse {
  success: boolean;
  code: string;
  error: {
    id: string;
    status: number;
    name: string;
    details: {
      timestamp: string;
      path: string;
      message: string;
      [key: string]: unknown;
    };
  };
}

export interface ExceptionConfig<T extends readonly ErrorFormat[] = readonly ErrorFormat[]> {
  errors: T;
}

export type ErrorIdentifier<T extends readonly ErrorFormat[]> = T[number]['identifier'];
export type InferErrorIdentifiers<T> =
  T extends ExceptionConfig<infer U> ? U[number]['identifier'] : never;
