import type {
  AccountInfo,
  SilentRequest,
  IPublicClientApplication,
} from "@azure/msal-browser";

export class ApiClient {
  private instance: IPublicClientApplication;
  private account: AccountInfo;
  public baseURL: string;
  private scopes: string[];
  private authority: string;

  constructor(
    instance: IPublicClientApplication,
    account: AccountInfo,
    config: {
      baseURL?: string;
      scopes?: string[];
      authority?: string;
    } = {},
  ) {
    this.instance = instance;
    this.account = account;
    this.baseURL = config.baseURL || "http://localhost:8000/api";
    this.scopes = config.scopes || [
      "api://78637b4f-3088-4520-adba-bd9809392f9e/user_impersonation",
    ];
    this.authority =
      config.authority ||
      "https://login.microsoftonline.com/d267408e-f179-4c25-a9f7-e52293bafeae";
  }

  async getAccessToken(): Promise<string> {
    const tokenRequest: SilentRequest = {
      scopes: this.scopes,
      authority: this.authority,
      account: this.account,
    };

    const { accessToken } =
      await this.instance.acquireTokenSilent(tokenRequest);
    return accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const accessToken = await this.getAccessToken();
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async streamPost(endpoint: string, data?: unknown): Promise<Response> {
    const accessToken = await this.getAccessToken();
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<T> {
    const accessToken = await this.getAccessToken();
    const url = `${this.baseURL}${endpoint}`;

    const formData = new FormData();
    formData.append('audio_file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
