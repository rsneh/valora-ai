export interface FastAPIErrorDetail {
  type: string;
  loc: (string | number)[];
  msg: string;
  input?: any;
  ctx?: Record<string, any>;
}

export interface FastAPIErrorResponse {
  detail: FastAPIErrorDetail[] | string;
}

export interface FormattedErrors {
  [key: string]: string;
}

export function handleFastAPIError(
  errorResponse: FastAPIErrorResponse | any
): FormattedErrors {
  const errors: FormattedErrors = {};

  if (!errorResponse || (!errorResponse.detail && !(errorResponse instanceof Error) && !errorResponse.message)) {
    errors.generic = 'An unexpected error occurred. Please try again.';
    return errors;
  }

  if (errorResponse.detail) { // FastAPI specific error structure
    if (typeof errorResponse.detail === 'string') {
      errors.generic = errorResponse.detail;
      return errors;
    }

    if (Array.isArray(errorResponse.detail)) {
      errorResponse.detail.forEach((err: FastAPIErrorDetail) => {
        if (err.loc && Array.isArray(err.loc) && err.loc.length > 0) {
          const fieldPath = err.loc.slice(1);
          const fieldName = fieldPath.length > 0 ? fieldPath.join('.') : err.loc[0].toString();
          if (errors[fieldName]) {
            errors[fieldName] = `${errors[fieldName]}; ${err.msg}`;
          } else {
            errors[fieldName] = err.msg;
          }
        } else {
          if (errors.generic) {
            errors.generic = `${errors.generic}; ${err.msg}`;
          } else {
            errors.generic = err.msg;
          }
        }
      });
      return errors;
    }
  }

  // Fallback for generic JavaScript Error objects or objects with a message property
  if (errorResponse instanceof Error && errorResponse.message) {
    errors.generic = errorResponse.message;
  } else if (typeof errorResponse.message === 'string') {
    errors.generic = errorResponse.message;
  } else if (typeof errorResponse === 'string') {
    errors.generic = errorResponse;
  } else {
    errors.generic = 'Invalid error response format from the server.';
  }
  return errors;
}
