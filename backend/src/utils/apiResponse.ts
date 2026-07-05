class ApiResponse {
    statusCode: number;
    data: unknown;
    msg: string;
    success: boolean;

    constructor(
        statusCode: number,
        data: unknown,
        msg: string = "success",
    ) {
        this.statusCode = statusCode;
        this.data = data;
        this.msg = msg;
        this.success = statusCode < 400;
    }
}

export default ApiResponse;
