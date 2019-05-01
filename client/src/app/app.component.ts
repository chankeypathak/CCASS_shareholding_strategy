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
  minDate: Date;
  maxDate: Date;
  isValidDate: boolean;
  error: string;

  constructor(private http: HttpService) {
    this.minDate = new Date('May 01, 2018 00:00:00');
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate() - 1);
  }

  onSubmit() {
    this.modifiedStock.stockName = this.stock.stockName;
    this.modifiedStock.startDate = moment(this.stock.startDate).format('YYYY/MM/DD');
    this.modifiedStock.endDate = moment(this.stock.endDate).format('YYYY/MM/DD');

    this.validateDates(this.modifiedStock.startDate, this.modifiedStock.endDate);
    if(!this.isValidDate) return;
    this.http.postShareHoldingData(this.modifiedStock).subscribe((data: {}) => {
      console.log(data);
    })
  }

  validateDates(sDate: string, eDate: string){
    this.isValidDate = true;
    if((sDate != null && eDate !=null) && (eDate) <= (sDate)){
      this.error='End date should be greater than start date.';
      this.isValidDate = false;
    }
  }
}
