import type { AxiosRequestConfig, Canceler } from "axios";
import axios from "axios";
import { isFunction } from "lodash-es";

// 存储请求与取消令牌的键值对列表
let pendingMap = new Map<string, Canceler>();

export const getPendingUrl = (config: AxiosRequestConfig) =>
  [config.method, config.url].join("&");

export default class AxiosCancel {
  // 添加请求到列表
  addPending(config: AxiosRequestConfig) {
    this.removePending(config);
    const url = getPendingUrl(config);
    config.cancelToken =
      config.cancelToken ||
      new axios.CancelToken((cancel) => {
        if (!pendingMap.has(url)) {
          pendingMap.set(url, cancel);
        }
      });
  }

  // 移除请求
  removePending(config: AxiosRequestConfig) {
    const url = getPendingUrl(config);

    if (pendingMap.has(url)) {
      const cancel = pendingMap.get(url);
      if (cancel) cancel(url);
      pendingMap.delete(url);
    }
  }

  // 移除所有请求
  removeAllPending() {
    pendingMap.forEach((cancel) => {
      cancel && isFunction(cancel) && cancel();
    });
    pendingMap.clear();
  }

  // 重置请求列表
  reset(): void {
    pendingMap = new Map<string, Canceler>();
  }
}
