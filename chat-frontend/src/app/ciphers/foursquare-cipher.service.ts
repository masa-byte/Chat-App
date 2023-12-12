import { Injectable } from '@angular/core';
import { cipherAlphabet1, cipherAlphabet2 } from 'config';

@Injectable({
  providedIn: 'root'
})
export class FoursquareCipherService {

  private plainMatrix1: string[] = [];
  private plainMatrix2: string[] = [];
  private cipherMatrix1: string[] = [];
  private cipherMatrix2: string[] = [];
  private n: number = 5;

  constructor() {
    this.populateMatrices();
  }

  private populateMatrices(): void {
    // this algorithm treats 'j' as 'i'
    // it could be solved with a dictionary which keeps track of which j's were replaced with i's and then save that info in the message
    // but I don't think it is necessary for now
    const alphabet = 'abcdefghiklmnopqrstuvwxyz';
    let index;
    for (let i = 0; i < this.n; i++) {
      for (let j = 0; j < this.n; j++) {
        index = i * this.n + j;
        this.plainMatrix1[index] = alphabet[index];
        this.plainMatrix2[index] = alphabet[index];
        this.cipherMatrix1[index] = cipherAlphabet1[index];
        this.cipherMatrix2[index] = cipherAlphabet2[index];
      }
    }
  }

  private getLetterPosition(letter: string, plainMatrixNumber: number | null, cipherMatrixNumber: number | null): number[] {
    let matrix: string[];
    if (plainMatrixNumber != null)
      matrix = plainMatrixNumber == 1 ? this.plainMatrix1 : this.plainMatrix2;
    else if (cipherMatrixNumber != null)
      matrix = cipherMatrixNumber == 1 ? this.cipherMatrix1 : this.cipherMatrix2;

    const index = matrix!.indexOf(letter);
    if (index == -1)
      return [-1, -1];

    const i = Math.floor(index / this.n);
    const j = index % this.n;
    return [i, j];
  }

  cipherMessage(message: string): string {
    if (message.length % 2 == 1)
      message += 'x';

    const bigrams: string[] = [];

    for (let i = 0; i < message.length - 1; i += 2)
      bigrams.push(message[i] + message[i + 1]);

    let cipheredMessage: string = '';
    let bigFirstLetter: boolean = false;
    let bigSecondLetter: boolean = false;
    let firstLetter: string;
    let secondLetter: string;
    let cipheredLetter: string;
    let firstLetterPosition: number[];
    let secondLetterPosition: number[];

    for (const bigram of bigrams) {
      bigFirstLetter = false;
      bigSecondLetter = false;
      firstLetter = bigram[0];
      secondLetter = bigram[1];

      if (firstLetter == firstLetter.toUpperCase()) {
        firstLetter = firstLetter.toLowerCase();
        bigFirstLetter = true;
      }
      if (secondLetter == secondLetter.toUpperCase()) {
        secondLetter = secondLetter.toLowerCase();
        bigSecondLetter = true;
      }

      if (firstLetter == 'j')
        firstLetter = 'i';
      if (secondLetter == 'j')
        secondLetter = 'i';

      firstLetterPosition = this.getLetterPosition(firstLetter, 1, null);
      secondLetterPosition = this.getLetterPosition(secondLetter, 2, null);

      if (firstLetterPosition[0] == -1 || secondLetterPosition[0] == -1) {
        cipheredMessage += bigram;
        continue;
      }

      cipheredLetter = this.cipherMatrix1[firstLetterPosition[0] * this.n + secondLetterPosition[1]];
      bigFirstLetter ? cipheredMessage += cipheredLetter.toUpperCase() : cipheredMessage += cipheredLetter;
      cipheredLetter = this.cipherMatrix2[secondLetterPosition[0] * this.n + firstLetterPosition[1]];
      bigSecondLetter ? cipheredMessage += cipheredLetter.toUpperCase() : cipheredMessage += cipheredLetter;
    }

    return cipheredMessage;
  }

  decipherMessage(message: string): string {
    if (message.length % 2 == 1)
      message += 'x';

    const bigrams: string[] = [];

    for (let i = 0; i < message.length - 1; i += 2)
      bigrams.push(message[i] + message[i + 1]);

    let decipheredMessage: string = '';
    let bigFirstLetter: boolean = false;
    let bigSecondLetter: boolean = false;
    let firstLetter: string;
    let secondLetter: string;
    let decipheredLetter: string;
    let firstLetterPosition: number[];
    let secondLetterPosition: number[];

    for (const bigram of bigrams) {
      bigFirstLetter = false;
      bigSecondLetter = false;
      firstLetter = bigram[0];
      secondLetter = bigram[1];

      if (firstLetter == firstLetter.toUpperCase()) {
        firstLetter = firstLetter.toLowerCase();
        bigFirstLetter = true;
      }
      if (secondLetter == secondLetter.toUpperCase()) {
        secondLetter = secondLetter.toLowerCase();
        bigSecondLetter = true;
      }

      if (firstLetter == 'j')
        firstLetter = 'i';
      if (secondLetter == 'j')
        secondLetter = 'i';

      firstLetterPosition = this.getLetterPosition(firstLetter, null, 1);
      secondLetterPosition = this.getLetterPosition(secondLetter, null, 2);

      if (firstLetterPosition[0] == -1 || secondLetterPosition[0] == -1) {
        decipheredMessage += bigram;
        continue;
      }

      decipheredLetter = this.plainMatrix1[firstLetterPosition[0] * this.n + secondLetterPosition[1]];
      bigFirstLetter ? decipheredMessage += decipheredLetter.toUpperCase() : decipheredMessage += decipheredLetter;
      decipheredLetter = this.plainMatrix2[secondLetterPosition[0] * this.n + firstLetterPosition[1]];
      bigSecondLetter ? decipheredMessage += decipheredLetter.toUpperCase() : decipheredMessage += decipheredLetter;
    }

    return decipheredMessage;
  }
}
