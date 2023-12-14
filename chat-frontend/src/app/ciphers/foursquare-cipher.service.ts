import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { encryptionUrl } from 'src/config';

@Injectable({
  providedIn: 'root'
})
export class FoursquareCipherService {

  constructor(private http: HttpClient) { }

  async encryptMessage(message: string): Promise<string> {
    try {
      const response = await lastValueFrom(this.http.post(encryptionUrl + "/fs/encrypt", { message }, { responseType: 'text' }));
      return response as string;
    } catch (error) {
      console.error('Error encrypting message', error);
      return '';
    }
  }

  async decryptMessage(message: string): Promise<string> {
    try {
      const response = await lastValueFrom(this.http.post(encryptionUrl + "/fs/decrypt", { message }, { responseType: 'text' }));
      return response as string;
    } catch (error) {
      console.error('Error encrypting message', error);
      return '';
    }
  }
}
