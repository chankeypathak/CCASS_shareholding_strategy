import csv
import io

import requests
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

URL = "http://www.hkexnews.hk/sdw/search/searchsdw.aspx"

PID_BANK_MAPPING = {
    'C00019': 'HSBC',
    'B01490': 'HSBC',
    'B01078': 'SC',
    'C00039': 'SC',
    'C00010': 'CITI',
    'B01451': 'GS',
    'B01323': 'DB',
    'C00074': 'DB',
    'B01224': 'ML',
    'B01554': 'MACQ',
    'C00102': 'MACQ',
    'B01491': 'CS',
    'C00100': 'JPM',
    'B01504': 'JPM',
    'B01110': 'JPM',
    'B01161': 'UBS',
    'B01366': 'UBS',
    'B01299': 'BNP',
    'C00064': 'BNP',
    'C00093': 'BNP',
    'C00015': 'DBS',
    'C00016': 'DBS',
    'B01274': 'MS',
    'B01138': 'CLSA',
    'B01076': 'BARC',
    'B01781': 'BARC',
    'C00005': 'BARC',
    'C00098': 'BARC',
}


@app.route('/shareholding_data', methods=['POST'])
def get_shareholding_data_for_stock_code():
    if request.method == 'POST':
        request_data = request.get_json()
        output = io.StringIO()
        output.write('date,bank,pid,percentage\r\n')
        get_data_for_date(request_data.get('stockName'), request_data.get('startDate'), output)
        get_data_for_date(request_data.get('stockName'), request_data.get('endDate'), output)
        return jsonify(output.getvalue())


def get_data_for_date(ticker, data_date, output):
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

            # Skip data unrelated to mentioned banks, and only store date, bank_name, pid, percentage
            if data[0] in PID_BANK_MAPPING:
                print([data_date, PID_BANK_MAPPING[data[0]], data[0], data[3], data[4]])
                writer.writerow([data_date, PID_BANK_MAPPING[data[0]], data[0], data[4]])


if __name__ == "__main__":
    app.run('0.0.0.0', '5000')
