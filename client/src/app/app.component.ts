import {Component} from '@angular/core';
import {Stock} from './models/stock';

import {HttpService} from "./services/httpService/http.service";
import * as moment from 'moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  stock = new Stock('', '', '');
  modifiedStock = new Stock('', '', '');

  constructor(private http: HttpService) {
  }

  onSubmit() {
    this.modifiedStock.stockName = this.stock.stockName;
    this.modifiedStock.startDate = moment(this.stock.startDate).format('YYYY/MM/DD');
    this.modifiedStock.endDate = moment(this.stock.endDate).format('YYYY/MM/DD');

    this.http.postShareHoldingData(this.modifiedStock).subscribe((data: {}) => {
      console.log(data);
    })
  }
}
