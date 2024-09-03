import { getPublicKey } from '../api/api-login';
import { sm2 } from 'sm-crypto-v2';
import forge from 'node-forge';
/**
 * @word 要加密的内容
 * @keyWord String  服务器随机返回的关键字
 *  */
export function rsaEncrypt(word: string, keyWord: string): string {
  if (import.meta.env?.VITE_COMMUNITY === 'opengauss') {
    const key = `-----BEGIN PUBLIC KEY-----\n${keyWord}\n-----END PUBLIC KEY-----`;
    const publicKey = forge.pki.publicKeyFromPem(key);
    const buffer = forge.util.createBuffer(word, 'utf8');
    const bytes = buffer.getBytes();
    return forge.util.bytesToHex(
      publicKey.encrypt(bytes, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
          md: forge.md.sha1.create(),
        },
      })
    );
  }
  const cipherMode = 1;
  return sm2.doEncrypt(word, keyWord, cipherMode);
}

export function getRsaEncryptWord(
  word: string | string[]
): Promise<string | string[]> {
  return new Promise((resolve, reject) => {
    const param = import.meta.env?.VITE_IS_OPENMERLIN ? {} : {
      community: import.meta.env?.VITE_COMMUNITY,
    };
    getPublicKey(param).then((res) => {
      const publicKey = res?.data?.sm2?.publicKey || res?.data;
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
