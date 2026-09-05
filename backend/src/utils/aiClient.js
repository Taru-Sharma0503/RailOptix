const config = require('../config/env');
const { ServiceUnavailableError, ValidationError, AppError } = require('./errors');

class AIClient {
  constructor() {
    this.baseUrl = (config.aiServiceUrl || process.env.AI_SERVICE_URL || 'http://localhost:8000').replace(/\/+$/, '');
    this.defaultTimeoutMs = 15000;
  }

  async request(path, options = {}) {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const timeoutMs = options.timeoutMs || this.defaultTimeoutMs;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {}),
    };

    const fetchOptions = {
      method: options.method || 'GET',
      headers,
      signal: controller.signal,
    };

    if (options.body) {
      fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      if (!response.ok) {
        const errorMessage = data?.detail || data?.message || data?.error || `AI Engine returned HTTP ${response.status}`;
        if (response.status >= 400 && response.status < 500) {
          throw new ValidationError(`AI Engine validation error: ${typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage}`);
        } else {
          throw new ServiceUnavailableError(`AI Engine error (${response.status}): ${typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage}`);
        }
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);

      // Re-throw AppError / ServiceUnavailableError / ValidationError
      if (err instanceof AppError) {
        throw err;
      }

      if (err.name === 'AbortError') {
        throw new ServiceUnavailableError(`AI Engine request timed out after ${timeoutMs}ms`);
      }

      if (err.code === 'ECONNREFUSED' || err.message?.includes('fetch failed') || err.message?.includes('connect')) {
        throw new ServiceUnavailableError(`AI Engine is unavailable at ${this.baseUrl}`);
      }

      throw new ServiceUnavailableError(`AI Engine communication error: ${err.message}`);
    }
  }

  async get(path, options = {}) {
    return this.request(path, { ...options, method: 'GET' });
  }

  async post(path, body, options = {}) {
    return this.request(path, { ...options, method: 'POST', body });
  }
}

module.exports = new AIClient();
