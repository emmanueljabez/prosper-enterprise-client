import CryptoJSCore from 'crypto-js/core';
import Base64 from 'crypto-js/enc-base64';
import AES from 'crypto-js/aes';
import UTF8 from 'crypto-js/enc-utf8';
import Pkcs7 from 'crypto-js/pad-pkcs7';

// Constants for encryption keys
const aes_key: string = "boKbv4Jv3wYomYWeXT6DAA";
const aes_iv: string = "bSVRVmlkOyRtO3FdV0JqIQ==";

// Return type for encrypt function
interface EncryptResult {
    data: string;
}

// Define the encryption utility interface
interface EncryptionUtil {
    encrypt(plainText: string): EncryptResult;
    decrypt<T = any>(cipherText: unknown): T | "";
}

const encryptionUtil: EncryptionUtil = {
    encrypt(plainText: string): EncryptResult {
        const key = Base64.parse(aes_key);
        const iv = Base64.parse(aes_iv);

        // Encrypt the plaintext
        const cipherText = AES.encrypt(UTF8.parse(plainText), key, {
            iv: iv,
            mode: CryptoJSCore.mode.CBC,
            padding: Pkcs7
        });

        return {
            data: cipherText.toString()
        };
    },

    decrypt<T = any>(cipherText: unknown): T | "" {
        try {
            // Handle response object case
            let textToDecrypt: string;
            if (typeof cipherText === 'object' && cipherText !== null && 'data' in cipherText) {
                textToDecrypt = cipherText.data;
            } else if (typeof cipherText === 'string') {
                textToDecrypt = cipherText;
            } else {
                console.error('Decryption error: Unsupported input type', typeof cipherText);
                return "" as const;
            }

            if (!textToDecrypt) {
                console.error('Empty cipher text provided');
                return "" as const;
            }

            // Use consistent library approach (match your JS version)
            const key = Base64.parse(aes_key);
            const iv = Base64.parse(aes_iv);
            
            // Parse the Base64 string into bytes - using same method as encrypt
            const cipherBytes = Base64.parse(textToDecrypt);
            
            const decrypted = CryptoJSCore.AES.decrypt(
                {ciphertext: cipherBytes}, 
                key, 
                {
                    iv: iv,
                    mode: CryptoJSCore.mode.CBC,
                    padding: CryptoJSCore.pad.Pkcs7
                }
            );

            const decryptedString = decrypted.toString(UTF8);

            if(decryptedString) {
                return JSON.parse(decryptedString) as T;
            } else {
                return "" as const;
            }
        } catch (error) {
            console.error('Decryption error:', error);
            return "" as const;
        }
    }
};

export default encryptionUtil;