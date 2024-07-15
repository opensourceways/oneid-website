export const EMAIL_REG =
  /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,6}$/;

export const PHONE_REG = /^(\+[0-9]{7,15}|[0-9]{6,11})$/;

export const CODE_REG = /^[0-9]{6}$/;

export const USERNAME_REG = /^[a-zA-Z][a-zA-Z0-9_-]*[a-zA-Z0-9]$/;
export const USERNAME_REG1 = /^[a-zA-Z][a-zA-Z0-9\._-]*[a-zA-Z0-9]$/;
export const USERNAME_REPEAT_REG = /^(?!.*(-|_|\.){2}).+$/;

export const NICKNAME_REG =
  /^[a-zA-Z\u4e00-\u9fa5][0-9a-zA-Z_-\u4e00-\u9fa5]{1,18}[0-9a-zA-Z\u4e00-\u9fa5]$/;

export const COMPANYNAME_REG =
  /^[0-9a-zA-Z\u4e00-\u9fa5][0-9a-zA-Z,\.&\(\)（）\s\u4e00-\u9fa5]{0,98}[0-9a-zA-Z\.\u4e00-\u9fa5]$/;

export const PWD_REG =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@%\^\-_\=\+\[\{\}\]\:,\.\/\?])[\w!@%\^\-_\=\+\[\{\}\]\:,\.\/\?]{8,20}$/;

export const PWD_REPEAT_REG = /^(?!.*((.)\2{2})).+$/;
