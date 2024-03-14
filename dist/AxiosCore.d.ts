import { AxiosRequestConfig } from "axios";
import { AxiosRequestConfigRetry, RequestOptions } from "../types/axios";
import { CreateAxiosOptions } from "./AxiosTransform";
export default class CoreRequest {
    private instance;
    private readonly options;
    constructor(options: CreateAxiosOptions);
    private createAxios;
    resetAxiosConfig(config: CreateAxiosOptions): void;
    setHeader(headers: Record<string, string>): void;
    private getTransform;
    private initInterceptors;
    request<T = any>(config: AxiosRequestConfigRetry, options?: RequestOptions): Promise<T>;
    get<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T>;
    post<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T>;
    put<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T>;
    delete<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T>;
    patch<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T>;
}
