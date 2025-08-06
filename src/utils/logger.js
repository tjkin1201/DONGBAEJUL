/**
 * 로깅 유틸리티
 * 개발/프로덕션 환경에 따라 적절한 로깅 제공
 */

const isDevelopment = process.env.NODE_ENV === 'development' || __DEV__;

class Logger {
  static info(message, ...args) {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  static warn(message, ...args) {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  static error(message, error, ...args) {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error, ...args);
    }
    // 프로덕션에서는 에러 리포팅 서비스로 전송 가능
  }

  static debug(message, ...args) {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  static api(method, url, data, response) {
    if (isDevelopment) {
      console.group(`[API] ${method.toUpperCase()} ${url}`);
      if (data) console.log('Request:', data);
      if (response) console.log('Response:', response);
      console.groupEnd();
    }
  }
}

export default Logger;