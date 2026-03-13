import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { ClientConfig, RequestOptions, VidFlowError, ApiError } from './types';

/**
 * Base VidFlow Client
 * Provides common functionality for all VidFlow services
 */
export class VidFlowClient {
  protected readonly client: AxiosInstance;
  protected readonly config: Required<ClientConfig>;

  constructor(config: ClientConfig) {
    this.config = {
      baseUrl: config.baseUrl || 'https://api.vidflow.app',
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      version: config.version || 'v1',
      apiKey: config.apiKey || '',
    };

    this.client = this.createClient();
  }

  /**
   * Create axios client with default config
   */
  private createClient(): AxiosInstance {
    const instance = axios.create({
      baseURL: `${this.config.baseUrl}/api/${this.config.version}`,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `VidFlow-SDK/${this.config.version}`,
      },
    });

    // Request interceptor
    instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add API key if provided
        if (this.config.apiKey) {
          config.headers = config.headers || {};
          config.headers['X-API-Key'] = this.config.apiKey;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // Response interceptor
    instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError<ApiError>) => {
        return Promise.reject(this.handleError(error));
      }
    );

    return instance;
  }

  /**
   * Handle API errors
   */
  protected handleError(error: AxiosError<ApiError>): VidFlowError {
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      const err = new VidFlowError(apiError.message, apiError.code);
      err.details = apiError.details;
      err.requestId = apiError.requestId;
      return err;
    }

    // Network errors
    if (error.code === 'ECONNABORTED') {
      return new VidFlowError('Request timeout', 'TIMEOUT');
    }

    if (!error.response) {
      return new VidFlowError('Network error', 'NETWORK_ERROR');
    }

    // Unknown error
    return new VidFlowError(error.message, 'UNKNOWN_ERROR');
  }

  /**
   * Make GET request with retry logic
   */
  public async get<T>(url: string, options?: RequestOptions): Promise<T> {
    const config: AxiosRequestConfig = {
      timeout: options?.timeout || this.config.timeout,
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const response = await this.client.get<T>(url, config);
        return response.data;
      } catch (error: unknown) {
        lastError = error as Error;

        // Don't retry on client errors (4xx)
        if (axios.isAxiosError(error) && error.response && 'status' in error.response) {
          const status = (error.response as { status: number }).status;
          if (status >= 400 && status < 500) {
            throw error;
          }
        }

        // Wait before retrying
        if (attempt < this.config.retries) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError;
  }

  /**
   * Make POST request with retry logic
   */
  public async post<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const config: AxiosRequestConfig = {
      timeout: options?.timeout || this.config.timeout,
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
      } catch (error: unknown) {
        lastError = error as Error;

        // Don't retry on client errors (4xx)
        if (axios.isAxiosError(error) && error.response && 'status' in error.response) {
          const status = (error.response as { status: number }).status;
          if (status >= 400 && status < 500) {
            throw error;
          }
        }

        // Wait before retrying
        if (attempt < this.config.retries) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError;
  }

  /**
   * Make PUT request
   */
  public async put<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const config: AxiosRequestConfig = {
      timeout: options?.timeout || this.config.timeout,
    };

    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Make DELETE request
   */
  public async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    const config: AxiosRequestConfig = {
      timeout: options?.timeout || this.config.timeout,
    };

    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Utility method to sleep
   */
  public sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get client configuration
   */
  getConfig(): Readonly<Required<ClientConfig>> {
    return { ...this.config };
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }
}
