import os
import json
import requests
import datetime
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

class Scrape:
    def __init__(self):
        self.client = MongoClient(os.getenv('CONNECTION_STRING'))['keywordmonitor']
    
    def bearer_oauth(self, r):
        r.headers["Authorization"] = f"Bearer {os.getenv('BEARERTOKEN')}"
        r.headers["User-Agent"] = "keywordMonitorStreamApp"
        return r
    
    def get_rules(self):
        response = requests.get(
            "https://api.twitter.com/2/tweets/search/stream/rules", auth=self.bearer_oauth
        )
        if response.status_code != 200:
            raise Exception(
                "Cannot get rules (HTTP {}): {}".format(response.status_code, response.text)
            )
        return response.json()
    
    def delete_all_rules(self, rules):
        if rules is None or "data" not in rules:
            return None

        ids = list(map(lambda rule: rule["id"], rules["data"]))
        payload = {"delete": {"ids": ids}}
        response = requests.post(
            "https://api.twitter.com/2/tweets/search/stream/rules",
            auth=self.bearer_oauth,
            json=payload
        )
        if response.status_code != 200:
            raise Exception(
                "Cannot delete rules (HTTP {}): {}".format(
                    response.status_code, response.text
                )
            )
    
    def set_rules(self, rules):        
        payload = {"add": rules}
        response = requests.post(
            "https://api.twitter.com/2/tweets/search/stream/rules",
            auth=self.bearer_oauth,
            json=payload,
        )
        if response.status_code != 201:
            raise Exception(
                "Cannot add rules (HTTP {}): {}".format(response.status_code, response.text)
            )

    def get_new_rules(self, keywords):
        rules = []
        rule = {'value': ''}
        for keyword in keywords:
            if ' ' in keyword:
                keyword = f'"{keyword}"'
            if len(rule['value']) + len(' OR ') + len(keyword) <= 512:
                if rule['value'] == '':
                    rule['value'] = keyword
                else:
                    rule['value'] += f' OR {keyword}'
            else:
                rules.append(rule)
                rule = {'value': keyword}
        rules.append(rule)
        return rules
    
    def get_twitter_keywords(self):
        return self.client['twitter'].distinct('keyword')

    def reset_rules(self):
        rules = self.get_rules()
        self.delete_all_rules(rules)
        rules = self.get_new_rules(self.get_twitter_keywords())
        self.set_rules(rules)

    def get_stream(self):
        starting_time = datetime.datetime.now()
        response = requests.get(
            "https://api.twitter.com/2/tweets/search/stream", auth=self.bearer_oauth, stream=True,
        )
        if response.status_code != 200:
            raise Exception(
                "Cannot get stream (HTTP {}): {} {}".format(
                    response.status_code, response.text, response.headers
                )
            )
        for response_line in response.iter_lines():
            if datetime.datetime.now() - starting_time > datetime.timedelta(minutes=5):
                return
            if response_line:
                json_response = json.loads(response_line)
                self.client['stream_tweets'].insert_one({'id': json_response['data']['id'], 'text': json_response['data']['text']})
    
    def reset_and_run(self):
        self.reset_rules()
        self.get_stream()

twitter_scraper = Scrape()
while True:
    twitter_scraper.reset_and_run()