class ApiError extends Error {
  constructor(
    statusCode,                         // The HTTP status code for the error
    message = "Something Went Wrong",   // Default error message if none is provided
    errors = [],                        // Optional array to store additional error details
    stack = ""                          // Optional stack trace for debugging
  ) {
    super(message);  // Call the parent (Error) constructor with the message
    this.statusCode = statusCode;  // HTTP status code (e.g., 400, 404, 500)
    this.data = null;              // Optional field for additional data (can be set later)
    this.message = message;        // The error message
    this.success = false;          // Indicates that the API call was unsuccessful
    this.errors = errors;          // Stores additional error details (e.g., validation errors)

    // If a custom stack trace is provided, use it; otherwise, capture the current stack trace
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);  // Captures the stack trace
    }
  }
}

export { ApiError };  // Export the class for use in other files
