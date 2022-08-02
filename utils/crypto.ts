import crypto from 'crypto'

const AES_METHOD = 'aes-256-cbc';
const IV_LENGTH = 16;

class Crypto {
    key: string;
    constructor() {
        this.key=process.env.SECRET as string
    }

    encrypt(text: string) {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(AES_METHOD, Buffer.from(this.key), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    decrypt(text: string) {
        try {
            let textParts = text.split(':');
            let iv = Buffer.from(textParts.shift()||"", 'hex');
            let encryptedText = Buffer.from(textParts.join(':'), 'hex');
            let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.key), iv);
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        } catch(err) {
            return "";
        }
    }
}
export default new Crypto();