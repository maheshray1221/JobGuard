class ApiResponse {
    statusCode: number;
    data: unknown;
    msg: string;
    success: boolean;

    constructor(
        statusCode: number,
        data: unknown,
        msg: string = "success",
        success: boolean = true,
    ) {
        this.statusCode = statusCode;
        this.data = data;
        this.msg = msg;
        this.success = statusCode < 400;
    }
}

export default ApiResponse;