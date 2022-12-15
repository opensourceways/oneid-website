export interface IObject<T = any> {
  [key: string]: T;
}

export interface LoginParams {
  client_id: string;
  redirect_uri: string;
  response_type?: string;
  scope?: string;
  state?: number;
  nonce?: number;
  lang?: string;
  response_mode?: string;
}
