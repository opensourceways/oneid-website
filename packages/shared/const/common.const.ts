export const EMAIL_REG =
  /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,6}$/;

export const PHONE_REG = /^1[0-9]{10}$/;

export const USERNAME_REG1 = /[`~!@#$%\^&\*\(\)\=\+\|\{\};:'\",<>\/\\\?\[\]\s]/;
export const USERNAME_REG = /^[a-zA-Z][a-zA-Z0-9_]*[a-zA-Z0-9]$/;

export const NICKNAME_REG =
  /^[a-zA-Z\u4e00-\u9fa5][0-9a-zA-Z_\u4e00-\u9fa5]{1,18}[0-9a-zA-Z\u4e00-\u9fa5]$/;

export const COMPANYNAME_REG =
  /^[0-9a-zA-Z\u4e00-\u9fa5][0-9a-zA-Z,\.&\(\)（）\s\u4e00-\u9fa5]{0,98}[0-9a-zA-Z\.\u4e00-\u9fa5]$/;

export const PWD_REG =
  /^(?![a-zA-Z]+$)(?![0-9]+$)(?![\W_]+$)[a-zA-Z0-9\W_]{6,}$/;
