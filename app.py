import csv
import io

import requests
from bs4 import BeautifulSoup
from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

URL = "http://www.hkexnews.hk/sdw/search/searchsdw.aspx"


@app.route('/shareholding_data', methods=['POST'])
def get_shareholding_data_for_stock_code():
    if request.method == 'POST':
        request_data = request.get_json()
        output = io.StringIO()
        get_data_for_date(request_data.get('stockName'), request_data.get('startDate'), output)
        get_data_for_date(request_data.get('stockName'), request_data.get('endDate'), output)
        return output.getvalue()


def get_data_for_date(ticker, data_date, output):
    print("data_date", data_date)
    with requests.Session() as s:
        s.headers = {"User-Agent": "Mozilla/5.0"}
        res = s.get(URL)
        soup = BeautifulSoup(res.text, "lxml")
        payload = {item['name']: item.get('value', '') for item in soup.select("input[name]")}
        payload['__EVENTTARGET'] = 'btnSearch'
        payload['txtStockCode'] = ticker
        payload['txtParticipantID'] = ''
        payload['txtShareholdingDate'] = data_date
        req = s.post(URL, data=payload, headers={"User-Agent": "Mozilla/5.0"})
        soup_obj = BeautifulSoup(req.text, "lxml")

        for items in soup_obj.select("table tbody tr"):
            data = [item.get_text(strip=True).split(':')[1] for item in items.select("td")]
            writer = csv.writer(output, quoting=csv.QUOTE_NONNUMERIC)
            writer.writerow([data_date] + data)


if __name__ == "__main__":
    app.run()
