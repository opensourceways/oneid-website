export type SelectTabKey = 'userinfo' | 'binding' | 'security';

export type AccountOperateKey =
  | 'confirm_bind_email'
  | 'bind_email'
  | 'modify_email'
  | 'unbind_email'
  | 'bind_phone'
  | 'modify_phone'
  | 'unbind_phone'
  | 'delete'
  | 'unbind_github'
  | 'unbind_gitee';
type AccountType = 'email' | 'phone' | 'github' | 'gitee';
type AccountField = 'change' | 'verify';
type Callback<T> = (data: T) => void;

export interface BindAccountParams {
  account_type: AccountType;
  account?: string;
  code: string;
}

interface CodeParams {
  account_type: AccountType;
  field?: AccountField;
}

export interface QueryCodeParams extends CodeParams {
  account?: string;
  captchaVerification?: string;
}

export interface AccountDialogConfig extends CodeParams {
  key: AccountOperateKey;
  header: string;
  content?: string;
  oldaccount?: {
    label: string;
    placeholder?: string;
  };
  oldcode?: {
    label: string;
    placeholder?: string;
    getCode?: Callback<QueryCodeParams>;
  };
  account?: {
    label: string;
    placeholder?: string;
  };
  code?: {
    label: string;
    placeholder?: string;
    getCode?: Callback<QueryCodeParams>;
  };
  confirm: Callback<BindAccountParams>;
}

export type AllAccountDialogConfig<T = AccountDialogConfig> = {
  [key in AccountOperateKey]?: T;
};
