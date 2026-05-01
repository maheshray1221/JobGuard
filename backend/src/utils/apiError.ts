class ApiError extends Error {
    statusCode: number;
    data: null;
    msg: string;
    success: boolean;
    errors: string[];

    constructor(
        statusCode: number,
        msg: string = "something went wrong",
        errors: string[] = [],
        stack: string = ""
    ) {
        super(msg);
        this.statusCode = statusCode;
        this.data = null;
        this.msg = msg;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;