import { Injectable } from '@angular/core';
import { initialKey, delta } from 'config';

@Injectable({
  providedIn: 'root'
})
export class LeaCipherService {

  private key: string = initialKey;
  private deltaBits: number[] = delta.map((hex) => parseInt(hex.toString(2).padStart(32, '0'), 2));
  private numberOfRounds = 24;
  constructor() { }

  cipherMessage(message: string): string {
    const messageBits = message//this.stringToBits(message);
    const bitBlocks32Message = this.splitInto32BitBlocks(messageBits);
    const ciphered128BitBlocks: string[] = [];

    if (bitBlocks32Message.length % 4 != 0) {
      const padding = 4 - bitBlocks32Message.length % 4;
      for (let i = 0; i < padding; i++) {
        bitBlocks32Message.push(''.padStart(32, '0'));
      }
    }
    // 32 * 4 = 128 32 bit blocks 4 of them
    for (let i = 0; i < bitBlocks32Message.length; i += 4) {

      const bitBlocks32Key = this.splitInto32BitBlocks(this.key);
      const roundKeys = this.keySchedule(bitBlocks32Key);

      let XBitBlocks32: number[] = [];
      for (let j = 0; j < 4; j++) {
        XBitBlocks32.push(parseInt(bitBlocks32Message[i + j], 2));
      }

      for (let j = 0; j < this.numberOfRounds; j++) {

        XBitBlocks32[3] = this.rotation(this.modularAddition(this.xor(XBitBlocks32[2], roundKeys[j][4]), this.xor(XBitBlocks32[3], roundKeys[j][5])), 3, true);
        XBitBlocks32[2] = this.rotation(this.modularAddition(this.xor(XBitBlocks32[1], roundKeys[j][2]), this.xor(XBitBlocks32[2], roundKeys[j][3])), 5, true);
        XBitBlocks32[1] = this.rotation(this.modularAddition(this.xor(XBitBlocks32[0], roundKeys[j][0]), this.xor(XBitBlocks32[1], roundKeys[j][1])), 9, false);

        j++;
        XBitBlocks32[0] = this.rotation(this.modularAddition(this.xor(XBitBlocks32[3], roundKeys[j][4]), this.xor(XBitBlocks32[0], roundKeys[j][5])), 3, true);
        XBitBlocks32[3] = this.rotation(this.modularAddition(this.xor(XBitBlocks32[2], roundKeys[j][2]), this.xor(XBitBlocks32[3], roundKeys[j][3])), 5, true);
        XBitBlocks32[2] = this.rotation(this.modularAddition(this.xor(XBitBlocks32[1], roundKeys[j][0]), this.xor(XBitBlocks32[2], roundKeys[j][1])), 9, false);

        j++;
        XBitBlocks32[1] = this.rotation(this.modularAddition(this.xor(XBitBlocks32[0], roundKeys[j][4]), this.xor(XBitBlocks32[1], roundKeys[j][5])), 3, true);
        XBitBlocks32[0] = this.rotation(this.modularAddition(this.xor(XBitBlocks32[3], roundKeys[j][2]), this.xor(XBitBlocks32[0], roundKeys[j][3])), 5, true);
        XBitBlocks32[3] = this.rotation(this.modularAddition(this.xor(XBitBlocks32[2], roundKeys[j][0]), this.xor(XBitBlocks32[3], roundKeys[j][1])), 9, false);

        j++;
        XBitBlocks32[2] = this.rotation(this.modularAddition(this.xor(XBitBlocks32[1], roundKeys[j][4]), this.xor(XBitBlocks32[2], roundKeys[j][5])), 3, true);
        XBitBlocks32[1] = this.rotation(this.modularAddition(this.xor(XBitBlocks32[0], roundKeys[j][2]), this.xor(XBitBlocks32[1], roundKeys[j][3])), 5, true);
        XBitBlocks32[0] = this.rotation(this.modularAddition(this.xor(XBitBlocks32[3], roundKeys[j][0]), this.xor(XBitBlocks32[0], roundKeys[j][1])), 9, false);
      }

      let cipheredBitBlock128 = '';
      for (let j = 0; j < 4; j++) {
        cipheredBitBlock128 += XBitBlocks32[j].toString(2).padStart(32, '0');
      }
      ciphered128BitBlocks.push(cipheredBitBlock128);
    }

    return ciphered128BitBlocks.join('\n');
  }

  decipherMessage(messageBits: string): string {
    const bitBlocks32Message = this.splitInto32BitBlocks(messageBits);
    const deciphered128BitBlocks: string[] = [];
    for (let i = 0; i < bitBlocks32Message.length; i += 4) {

      const bitBlocks32Key = this.splitInto32BitBlocks(this.key);
      const roundKeys = this.keySchedule(bitBlocks32Key);

      let XBitBlocks32: number[] = [];
      for (let j = 0; j < 4; j++) {
        XBitBlocks32.push(parseInt(bitBlocks32Message[i + j], 2));
      }

      for (let j = this.numberOfRounds - 1; j >= 0; j--) {

        XBitBlocks32[0] = this.xor(this.modularSubtraction(this.rotation(XBitBlocks32[0], 9, true), this.xor(XBitBlocks32[3], roundKeys[j][0])), roundKeys[j][1]);
        XBitBlocks32[1] = this.xor(this.modularSubtraction(this.rotation(XBitBlocks32[1], 5, false), this.xor(XBitBlocks32[0], roundKeys[j][2])), roundKeys[j][3]);
        XBitBlocks32[2] = this.xor(this.modularSubtraction(this.rotation(XBitBlocks32[2], 3, false), this.xor(XBitBlocks32[1], roundKeys[j][4])), roundKeys[j][5]);

        j--;
        XBitBlocks32[3] = this.xor(this.modularSubtraction(this.rotation(XBitBlocks32[3], 9, true), this.xor(XBitBlocks32[2], roundKeys[j][0])), roundKeys[j][1]);
        XBitBlocks32[0] = this.xor(this.modularSubtraction(this.rotation(XBitBlocks32[0], 5, false), this.xor(XBitBlocks32[3], roundKeys[j][2])), roundKeys[j][3]);
        XBitBlocks32[1] = this.xor(this.modularSubtraction(this.rotation(XBitBlocks32[1], 3, false), this.xor(XBitBlocks32[0], roundKeys[j][4])), roundKeys[j][5]);

        j--;
        XBitBlocks32[2] = this.xor(this.modularSubtraction(this.rotation(XBitBlocks32[2], 9, true), this.xor(XBitBlocks32[1], roundKeys[j][0])), roundKeys[j][1]);
        XBitBlocks32[3] = this.xor(this.modularSubtraction(this.rotation(XBitBlocks32[3], 5, false), this.xor(XBitBlocks32[2], roundKeys[j][2])), roundKeys[j][3]);
        XBitBlocks32[0] = this.xor(this.modularSubtraction(this.rotation(XBitBlocks32[0], 3, false), this.xor(XBitBlocks32[3], roundKeys[j][4])), roundKeys[j][5]);

        j--;
        XBitBlocks32[1] = this.xor(this.modularSubtraction(this.rotation(XBitBlocks32[1], 9, true), this.xor(XBitBlocks32[0], roundKeys[j][0])), roundKeys[j][1]);
        XBitBlocks32[2] = this.xor(this.modularSubtraction(this.rotation(XBitBlocks32[2], 5, false), this.xor(XBitBlocks32[1], roundKeys[j][2])), roundKeys[j][3]);
        XBitBlocks32[3] = this.xor(this.modularSubtraction(this.rotation(XBitBlocks32[3], 3, false), this.xor(XBitBlocks32[2], roundKeys[j][4])), roundKeys[j][5]);
      }

      let decipheredBitBlock128 = '';
      for (let j = 0; j < 4; j++) {
        decipheredBitBlock128 += XBitBlocks32[j].toString(2).padStart(32, '0');
      }
      deciphered128BitBlocks.push(decipheredBitBlock128);
    }

    const decipheredBits = deciphered128BitBlocks.join('');
    const decipheredMessage = this.bitsToString(decipheredBits);
    return decipheredMessage;
  }

  private keySchedule(bitBlocks32Key: string[]): number[][] {
    const roundKeys: number[][] = Array.from({ length: this.numberOfRounds }, () => Array(6).fill(0));
    let TBlocks: number[] = [];
    // 128 bit original key - can vary so upper bound is not fixed
    for (let i = 0; i < bitBlocks32Key.length; i++) {
      TBlocks.push(parseInt(bitBlocks32Key[i], 2));
    }

    for (let i = 0; i < this.numberOfRounds; i++) {
      const temp = this.rotation(this.deltaBits[i % 4], i, false);

      roundKeys[i][0] = TBlocks[0] = this.rotation(this.modularAddition(TBlocks[0], temp), 1, false);
      roundKeys[i][1] = roundKeys[i][3] = roundKeys[i][5] = TBlocks[1] = this.rotation(this.modularAddition(TBlocks[1], this.rotation(temp, 1, false)), 3, false);
      roundKeys[i][2] = TBlocks[2] = this.rotation(this.modularAddition(TBlocks[2], this.rotation(temp, 2, false)), 6, false);
      roundKeys[i][4] = TBlocks[3] = this.rotation(this.modularAddition(TBlocks[3], this.rotation(temp, 3, false)), 11, false);
    }
    // 192 bit round keys
    return roundKeys;
  }

  private xor(bitBlock1: number, bitBlock2: number): number {
    const xor = bitBlock1 ^ bitBlock2;
    return xor >>> 0;
  }

  private modularAddition(bitBlock1: number, bitBlock2: number): number {
    const sum = bitBlock1 + bitBlock2;
    const moduo = sum & 0xffffffff;
    const result = moduo >>> 0;

    return result;
  }

  private modularSubtraction(bitBlock1: number, bitBlock2: number): number {
    const subtraction = bitBlock1 - bitBlock2;
    const moduo = subtraction & 0xffffffff;
    const result = moduo >>> 0;

    return result;
  }

  private rotation(bitBlock: number, position: number, right: boolean): number {
    let rotatedBits = 0;

    if (right) {
      rotatedBits = ((bitBlock >>> position) | (bitBlock << (32 - position))) & 0xffffffff;
    }
    else {
      rotatedBits = ((bitBlock << position) | (bitBlock >>> (32 - position))) & 0xffffffff;
    }
    rotatedBits = rotatedBits >>> 0;

    return rotatedBits;
  }

  private bitsToString(bits: string): string {
    let result = '';

    for (let i = 0; i < bits.length; i += 7) {
      const charCode = parseInt(bits.substring(i, i + 7), 2);
      const char = String.fromCharCode(charCode);
      result += char;
    }

    return result;
  }

  private stringToBits(message: string): string {
    let result = '';

    for (let i = 0; i < message.length; i++) {
      const charCode = message.charCodeAt(i);
      const binaryRepresentation = charCode.toString(2).padStart(7, '0');
      result += binaryRepresentation;
    }

    return result;
  }

  private splitInto32BitBlocks(bits: string): string[] {
    const blockSize = 32;
    const result: string[] = [];
    bits = bits.padEnd(blockSize, '0');

    for (let i = 0; i < bits.length; i += blockSize)
      result.push(bits.substring(i, i + blockSize));

    return result;
  }

}
