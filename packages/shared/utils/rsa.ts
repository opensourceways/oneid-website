import { getPublicKey } from '../api/api-login';
import JsEncrypt from 'jsencrypt';
/**
 * @word 要加密的内容
 * @keyWord String  服务器随机返回的关键字
 *  */
export function rsaEncrypt(word: string, keyWord: string): string {
  const encrypt = new JsEncrypt();
  encrypt.setPublicKey(keyWord);
  return encrypt.encrypt(word) || '';
}

export function getRsaEncryptWord(
  word: string | string[]
): Promise<string | string[]> {
  return new Promise((resolve, reject) => {
    getPublicKey({ community: import.meta.env?.VITE_COMMUNITY }).then((res) => {
      const publicKey = res?.data?.rsa?.publicKey || res?.data;
      if (publicKey) {
        const keyword = publicKey.includes('-----BEGIN PUBLIC KEY-----')
          ? publicKey.slice(27, -26)
          : publicKey;
        if (Array.isArray(word)) {
          resolve(word.map((item) => rsaEncrypt(item, keyword)));
        } else {
          resolve(rsaEncrypt(word, keyword));
        }
      } else {
        reject(new Error('publicKey error'));
      }
    });
  });
}
