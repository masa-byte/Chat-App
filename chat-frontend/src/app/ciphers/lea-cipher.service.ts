import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { encryptionUrl } from 'src/config';

@Injectable({
  providedIn: 'root'
})
export class LeaCipherService {

  constructor(private http: HttpClient) { }

  async encryptMessage(message: string): Promise<string> {
    try {
      const response = await lastValueFrom(this.http.post(encryptionUrl + "/lea/encrypt", { message }, { responseType: 'text' }));
      return response as string;
    } catch (error) {
      console.error('Error encrypting message', error);
      return '';
    }
  }

  async decryptMessage(message: string): Promise<string> {
    try {
      const response = await lastValueFrom(this.http.post(encryptionUrl + "/lea/decrypt", { message }, { responseType: 'text' }));
      return response as string;
    } catch (error) {
      console.error('Error encrypting message', error);
      return '';
    }
  }
}
