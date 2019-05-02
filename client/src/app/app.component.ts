import {Component} from "@angular/core";
import {Stock} from "./models/stock";

import {HttpService} from "./services/httpService/http.service";
import * as moment from "moment";
import * as d3 from "d3";

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
    if (!this.isValidDate) return;
    this.http.postShareHoldingData(this.modifiedStock).subscribe((data: {}) => {
      console.log(data)
      this.createLineChart(data);
    })
  }

  validateDates(sDate: string, eDate: string) {
    this.isValidDate = true;
    if ((sDate != null && eDate != null) && (eDate) <= (sDate)) {
      this.error = 'End date should be greater than start date.';
      this.isValidDate = false;
    }
  }

  createLineChart(rawData) {
    var data = d3.csvParse(rawData);

    var parseTime = d3.timeParse("%Y/%m/%d");

    var data = [{
      address: "HSBC WEALTH BUSINESS SERVICES 8/F TOWER 2 & 3 HSBC CENTRE 1 SHAM MONG ROAD KOWLOON",
      date: "2019/05/01",
      name_of_participant: "THE HONGKONG AND SHANGHAI BANKING",
      percentage: "2%",
      pid: "C00019",
      shareholding: "819,360,131"
    },
    {
      address: "HSBC WEALTH BUSINESS SERVICES 8/F TOWER 2 & 3 HSBC CENTRE 1 SHAM MONG ROAD KOWLOON",
      date: "2019/05/02",
      name_of_participant: "THE HONGKONG AND SHANGHAI BANKING",
      percentage: "3%",
      pid: "C00019",
      shareholding: "819,360,131"
    },
    {
      address: "HSBC WEALTH BUSINESS SERVICES 8/F TOWER 2 & 3 HSBC CENTRE 1 SHAM MONG ROAD KOWLOON",
      date: "2019/05/04",
      name_of_participant: "THE HONGKONG AND SHANGHAI BANKING",
      percentage: "4%",
      pid: "C00019",
      shareholding: "819,360,131"
    }]

    console.log(data);
    var width = 500;
    var height = 300;
    var margin = 50;
    var duration = 250;

    var lineOpacity = "0.25";
    var lineOpacityHover = "0.85";
    var otherLinesOpacityHover = "0.1";
    var lineStroke = "1.5px";
    var lineStrokeHover = "2.5px";

    var circleOpacity = '0.85';
    var circleOpacityOnLineHover = "0.25"
    var circleRadius = 3;
    var circleRadiusHover = 6;


    /* Format Data */
    data.forEach(function (d) {
      d.date = parseTime(d.date);
      d.percentage = d.percentage.replace('%', '');
    });

    /* Scale */
    var xScale = d3.scaleTime()
      .domain(d3.extent(data, function (d) {
        return d.date;
      }))
      .range([0, width]);

    var yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.percentage)])
      .range([height - margin, 0]);

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    /* Add SVG */
    var svg = d3.select("#chart").append("svg")
      .attr("width", (width + margin) + "px")
      .attr("height", (height + margin) + "px")
      .append('g')
      .attr("transform", `translate(${margin}, ${margin})`);


    /* Add line into SVG */
    var line = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.percentage));

    let lines = svg.append('g')
      .attr('class', 'lines');

    lines.selectAll('.line-group')
      .data(data).enter()
      .append('g')
      .attr('class', 'line-group')
      .append('path')
      .attr('class', 'line')
      .attr('d', d => line(d.percentage))
      .style('stroke', (d, i) => color(i))
      .style('opacity', lineOpacity);


    /* Add circles in the line */
    lines.selectAll("circle-group")
      .data(data).enter()
      .append("g")
      .style("fill", (d, i) => color(i))
      .selectAll("circle")
      .data(d => d).enter()
      .append("g")
      .attr("class", "circle")
      .on("mouseover", function (d) {
        d3.select(this)
          .style("cursor", "pointer")
          .append("text")
          .attr("class", "text")
          .text(`${d.percentage}`)
          .attr("x", d => xScale(d.date) + 5)
          .attr("y", d => yScale(d.percentage) - 10);
      })
      .on("mouseout", function (d) {
        d3.select(this)
          .style("cursor", "none")
          .transition()
          .duration(duration)
          .selectAll(".text").remove();
      })
      .append("circle")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.percentage))
      .attr("r", circleRadius)
      .style('opacity', circleOpacity)
      .on("mouseover", function (d) {
        d3.select(this)
          .transition()
          .duration(duration)
          .attr("r", circleRadiusHover);
      })
      .on("mouseout", function (d) {
        d3.select(this)
          .transition()
          .duration(duration)
          .attr("r", circleRadius);
      });


    /* Add Axis into SVG */
    var xAxis = d3.axisBottom(xScale).ticks(5);
    var yAxis = d3.axisLeft(yScale).ticks(5);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${height - margin})`)
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append('text')
      .attr("y", 15)
      .attr("transform", "rotate(-90)")
      .attr("fill", "#000")
      .text("Total values");
  }
}
