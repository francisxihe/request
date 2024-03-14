import { AxiosError } from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type { RequestOptions, Result } from "../types/axios";
interface CreateAxiosOptions extends AxiosRequestConfig {
    authenticationScheme?: string;
    transform?: AxiosTransform;
    requestOptions?: RequestOptions;
}
declare abstract class AxiosTransform {
    beforeRequestHook?: (config: AxiosRequestConfig, options: RequestOptions) => AxiosRequestConfig;
    transformRequestHook?: (res: AxiosResponse<Result>, options: RequestOptions) => any;
    requestCatchHook?: (e: Error | AxiosError, options: RequestOptions) => Promise<any>;
    requestInterceptors?: (config: AxiosRequestConfig, options: CreateAxiosOptions) => AxiosRequestConfig;
    responseInterceptors?: (res: AxiosResponse) => AxiosResponse;
    requestInterceptorsCatch?: (error: AxiosError) => void;
    responseInterceptorsCatch?: (error: AxiosError) => void;
}
export type { CreateAxiosOptions };
export default AxiosTransform;
