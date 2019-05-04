import {Component} from "@angular/core";
import {Stock} from "./models/stock";

import {HttpService} from "./services/httpService/http.service";
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from "moment";
import * as d3 from "d3";
import * as dc from "dc";
import * as crossfilter from "crossfilter2";

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

  constructor(private http: HttpService, private spinner: NgxSpinnerService) {
    this.minDate = new Date('May 01, 2018 00:00:00');
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate() - 1);
  }

  onSubmit() {
    this.spinner.show();
    this.modifiedStock.stockName = this.stock.stockName;
    this.modifiedStock.startDate = moment(this.stock.startDate).format('YYYY/MM/DD');
    this.modifiedStock.endDate = moment(this.stock.endDate).format('YYYY/MM/DD');

    this.validateDates(this.modifiedStock.startDate, this.modifiedStock.endDate);
    if (!this.isValidDate) return;
    this.http.postShareHoldingData(this.modifiedStock).subscribe((response: {}) => {
      this.createLineChart(response);
    })
  }

  validateDates(sDate: string, eDate: string) {
    this.isValidDate = true;
    if ((sDate != null && eDate != null) && (eDate) <= (sDate)) {
      this.error = 'End date should be greater than start date.';
      this.isValidDate = false;
      this.spinner.hide();
    }
  }

  createLineChart(rawData) {
    // var data = [
    //   {bank: "HSBC", date: "2019/04/01", percentage: "21.56"}, {bank: "HSBC", date: "2019/04/01", percentage: "21.56"},
    //   {bank: "HSBC", date: "2019/04/01", percentage: "21.56"}, {bank: "HSBC", date: "2019/04/06", percentage: "21.56"},
    //   {bank: "HSBC", date: "2019/04/20", percentage: "21.56"}, {bank: "HSBC", date: "2019/04/20", percentage: "21.56"},
    //   {bank: "HSBC", date: "2019/04/20", percentage: "21.56"}, {bank: "HSBC", date: "2019/04/20", percentage: "21.56"},
    //   {bank: "SC", date: "2019/04/06", percentage: "21.56"}, {bank: "SC", date: "2019/04/06", percentage: "22.56"},
    //   {bank: "SC", date: "2019/04/01", percentage: "21.56"}, {bank: "SC", date: "2019/04/06", percentage: "22.56"}]

    var data = d3.csvParse(rawData);

    var chart = dc.seriesChart("#chart");
    var ndx, runDimension, runGroup;
    var parseDate = d3.timeParse("%Y/%m/%d");
    var x = data.map(function (d) {
      return d.date = parseDate(d.date);
    });
    var minDate = d3.min(d3.values(x));
    var maxDate = d3.max(d3.values(x));

    data.forEach(function(x) {
      x.percentage = x.percentage.replace('%', '');
    })

    ndx = crossfilter(data);
    runDimension = ndx.dimension(function (d) {
      return [d.bank, d.date];
    });
    runGroup = runDimension.group().reduceSum(function (d) {
      return +d.percentage;
    });

    var colors = ["#1b70fc", "#faff16", "#d50527", "#158940", "#f898fd", "#24c9d7", "#cb9b64", "#866888", "#22e67a", "#e509ae",
      "#9dabfa", "#437e8a", "#b21bff", "#ff7b91", "#94aa05", "#ac5906", "#82a68d", "#fe6616", "#7a7352", "#f9bc0f", "#b65d66"];

    chart
      .width(1000)
      .height(800)
      .chart(function (c) {
        return dc.lineChart(c).curve(d3.curveCardinal);
      })
      .x(d3.scaleTime().domain([minDate, maxDate]).range([100, 500]))
      .brushOn(false)
      .clipPadding(10)
      .elasticY(true)
      .dimension(runDimension)
      .group(runGroup)
      //.mouseZoomable(true)
      .seriesAccessor(function (d) {
        return d.key[0];
      })
      .keyAccessor(function (d) {
        return +d.key[1];
      })
      .valueAccessor(function (d) {
        return +d.value;
      })
      .ordinalColors(colors)
      .title(function(d) {
        return d.key[0] + ": " + d.value + "%";
      })
      .legend(dc.legend().x(800).y(30).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70))
      .xAxis()
      .tickValues(data.map(function(d) { return new Date(d.date)}))
      .tickFormat(d3.timeFormat("%Y/%m/%d"));

    dc.renderAll();
    this.spinner.hide();
  }
}

