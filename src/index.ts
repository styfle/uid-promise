// the file extension is needed for ESM
import { UIDCHARS } from './chars.js';

export const uid = (len: number) =>
  new Promise<string>(async (resolve, reject) => {
    if (!Number.isInteger(len)) {
      reject(
        new TypeError('You must supply a length integer to `uid-promise`.'),
      );
      return;
    }

    if (len <= 0) {
      reject(new Error('You must supply a length integer greater than zero'));
      return;
    }

    const isWebCryptoFuncDefined =
      typeof globalThis.crypto?.getRandomValues === 'function';

    const randomBytes = isWebCryptoFuncDefined
      ? // the file extensions are needed for ESM
        await import('./web-random-bytes.js').then((mod) => mod.randomBytes)
      : await import('./node-random-bytes.js').then((mod) => mod.randomBytes);

    randomBytes(len, (err, buf) => {
      if (err) {
        return reject(err);
      }
      const str = [];
      let rand;
      for (let i = 0; i < buf.length; i++) {
        rand = buf[i];
        while (rand > 248) {
          try {
            rand = randomBytes(1)[0];
          } catch (err) {
            reject(err);
          }
        }
        str.push(UIDCHARS[rand % UIDCHARS.length]);
      }
      resolve(str.join(''));
    });
  });
