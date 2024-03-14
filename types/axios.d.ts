import { AxiosRequestConfig } from "axios";

export interface RequestOptions {
  apiUrl?: string;
  apiPrefix?: string;
  withToken?: boolean;
  ignoreRepeatRequest?: boolean;
  isReturnNativeResponse?: boolean;
  isTransformResponse?: boolean;
  joinPrefix?: boolean;
  joinParamsToUrl?: boolean;
  retry?: {
    count: number;
    delay: number;
  };
}

export interface Result<T = any> {
  data: T;
  code: number;
}

export interface AxiosRequestConfigRetry extends AxiosRequestConfig {
  retryCount?: number;
}
