
import { SocketIoConfig } from 'ngx-socket-io';

export const clients: Record<number, { name: string; id: number }> = {
    4200: {
        name: 'Alice Copperson',
        id: 0,
    },
    4201: {
        name: 'Bob Builder',
        id: 1,
    },
    // 4202: {
    //     name: 'Charlie Chaplin',
    //     id: 2,
    // },
}

export const numOfClients = Object.keys(clients).length;

export const cipherAlphabet1 = 'zyxwvutsrqponmlkihgfedcba';
export const cipherAlphabet2 = 'hgfedcbazyxwvutsrqponmlki';

export const initialKey = "00001111000111100010110100111100010010110101101001101001011110001000011110010110101001011011010011000011110100101110000111110000";
export const delta = [0xc3efe9db, 0x44626b02, 0x79e27c8a, 0x78df30ec, 0x715ea49e, 0xc785da0a, 0xe04ef22a, 0xe5c40957];

export const url = "http://localhost:3000";

export const socketConfig: SocketIoConfig = { url: 'http://localhost:3000', options: {} };