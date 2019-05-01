import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Stock} from "../../models/stock";

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  apiURL: string = 'http://127.0.0.1:5000/';
  // Http Options
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  constructor(private http: HttpClient) {
  }

  // HttpClient API postShareHoldingData() method
  postShareHoldingData(stock): Observable<Stock> {
    return this.http.post<Stock>(this.apiURL + 'shareholding_data', JSON.stringify(stock), this.httpOptions);
  }
}
