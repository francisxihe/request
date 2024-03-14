import axios, {
  AxiosRequestConfig,
  AxiosInstance,
  AxiosResponse,
  AxiosError,
} from "axios";
import {
  AxiosRequestConfigRetry,
  RequestOptions,
  Result,
} from "../types/axios";
import { CreateAxiosOptions } from "./AxiosTransform";
import AxiosCancel from "./AxiosCancel";
import { cloneDeep, isFunction } from "lodash-es";

function isAsyncfunction(data: unknown) {
  return (
    Object.prototype.toString.call(data).slice(8, -1).toLowerCase() ===
    "asyncfunction"
  );
}

export default class CoreRequest {
  private instance: AxiosInstance;

  private readonly options: CreateAxiosOptions;

  constructor(options: CreateAxiosOptions) {
    this.options = options;
    this.instance = axios.create(options);
    this.initInterceptors();
  }

  // 创建实例
  private createAxios(config: CreateAxiosOptions): void {
    this.instance = axios.create(config);
  }

  // 重新配置实例
  resetAxiosConfig(config: CreateAxiosOptions): void {
    if (!this.instance) return;
    this.createAxios(config);
  }

  // 设置请求头
  setHeader(headers: Record<string, string>): void {
    if (!this.instance) return;
    Object.assign(this.instance.defaults.headers, headers);
  }

  // 获取数据处理
  private getTransform() {
    const { transform } = this.options;
    return transform;
  }

  // 初始化拦截器
  private initInterceptors() {
    const transform = this.getTransform();
    if (!transform) return;

    const {
      requestInterceptors,
      requestInterceptorsCatch,
      responseInterceptors,
      responseInterceptorsCatch,
    } = transform || {};

    const axiosCancel = new AxiosCancel();

    this.instance.interceptors.request.use((config: AxiosRequestConfig) => {
      // @ts-ignore
      // 如果忽略重复请求开启，则直接返回
      const { ignoreRepeatRequest } = config.requestOptions;
      const ignoreRepeat =
        ignoreRepeatRequest ?? this.options.requestOptions?.ignoreRepeatRequest;

      if (!ignoreRepeat) axiosCancel.addPending(config);

      if (requestInterceptors && isFunction(requestInterceptors)) {
        config = requestInterceptors(config, this.options);
      }
      return config;
    }, undefined);

    // 请求拦截器错误处理
    if (requestInterceptorsCatch && isFunction(requestInterceptorsCatch)) {
      this.instance.interceptors.request.use(
        undefined,
        requestInterceptorsCatch
      );
    }

    // 响应拦截器
    this.instance.interceptors.response.use((response: AxiosResponse) => {
      if (response) axiosCancel.removePending(response.config);
      if (responseInterceptors && isFunction(responseInterceptors)) {
        response = responseInterceptors(response);
      }
      return response;
    }, undefined);

    // 响应错误拦处理
    if (
      responseInterceptorsCatch &&
      (isAsyncfunction(responseInterceptorsCatch) ||
        isFunction(responseInterceptorsCatch))
    ) {
      this.instance.interceptors.response.use(
        undefined,
        responseInterceptorsCatch
      );
    }
  }

  // 发送请求
  async request<T = any>(
    config: AxiosRequestConfigRetry,
    options?: RequestOptions
  ): Promise<T> {
    let conf: CreateAxiosOptions = cloneDeep(config);
    const transform = this.getTransform();

    const { requestOptions } = this.options;
    const opt: RequestOptions = { ...requestOptions, ...options };

    const { beforeRequestHook, transformRequestHook, requestCatchHook } =
      transform || {};

    // 请求前Hook，可以修改请求配置
    if (beforeRequestHook && isFunction(beforeRequestHook)) {
      conf = beforeRequestHook(conf, opt);
    }
    conf.requestOptions = opt;

    return new Promise<T>((resolve, reject) => {
      this.instance
        .request<any, AxiosResponse<Result>>(!config.retryCount ? conf : config)
        .then((response: AxiosResponse<Result>) => {
          if (transformRequestHook && isFunction(transformRequestHook)) {
            try {
              const ret = transformRequestHook(response, opt);
              resolve(ret);
            } catch (error) {
              reject(error || new Error("transformRequestHook error"));
            }
            return;
          }
          resolve(response as unknown as Promise<T>);
        })
        .catch((error: Error | AxiosError) => {
          if (requestCatchHook && isFunction(requestCatchHook)) {
            reject(requestCatchHook(error, opt));
            return;
          }
          reject(error);
        });
    });
  }

  get<T = any>(
    config: AxiosRequestConfig,
    options?: RequestOptions
  ): Promise<T> {
    return this.request({ ...config, method: "GET" }, options);
  }

  post<T = any>(
    config: AxiosRequestConfig,
    options?: RequestOptions
  ): Promise<T> {
    return this.request({ ...config, method: "POST" }, options);
  }

  put<T = any>(
    config: AxiosRequestConfig,
    options?: RequestOptions
  ): Promise<T> {
    return this.request({ ...config, method: "PUT" }, options);
  }

  delete<T = any>(
    config: AxiosRequestConfig,
    options?: RequestOptions
  ): Promise<T> {
    return this.request({ ...config, method: "DELETE" }, options);
  }

  patch<T = any>(
    config: AxiosRequestConfig,
    options?: RequestOptions
  ): Promise<T> {
    return this.request({ ...config, method: "PATCH" }, options);
  }
}
