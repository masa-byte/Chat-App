import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { encryptionUrl } from 'src/config';

@Injectable({
  providedIn: 'root'
})
export class ShaHashService {

  constructor(private http: HttpClient) { }

  async hashFile(message: string): Promise<string> {
    try {
      const response = await lastValueFrom(this.http.post(encryptionUrl + "/sha", { message }, { responseType: 'text' }));
      return response as string;
    } catch (error) {
      console.error('Error encrypting file', error);
      return '';
    }
  }
}
