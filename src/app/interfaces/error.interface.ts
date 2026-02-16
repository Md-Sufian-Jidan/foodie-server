export interface TErrorSources {
    path: string;
    message: string;
}

export interface TGenericErrorResponse {
    statusCode?: number;
    success: boolean;
    message: string;
    errorSources: TErrorSources[];
    stack?: string;
    error?: unknown
}