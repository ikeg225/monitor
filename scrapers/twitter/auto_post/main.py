import os
import json
import time
import spintax
import requests
import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
from requests_oauthlib import OAuth1Session

load_dotenv()

class AutoPost:
    def __init__(self, bearer_token, user_agent, email, proxies, api_key, api_secret, access_token, access_token_secret):
        self.bearer_token = bearer_token
        self.user_agent = user_agent
        self.email = email
        self.proxies = proxies
        self.api_key = api_key
        self.api_secret = api_secret
        self.access_token = access_token
        self.access_token_secret = access_token_secret
        self.rule_and_response = {}
        self.client = MongoClient(os.getenv('CONNECTION_STRING'))['clients']
    
    def bearer_oauth(self, r):
        r.headers["Authorization"] = f"Bearer {self.bearer_token}"
        r.headers["User-Agent"] = self.user_agent
        return r
    
    def get_rules(self):
        response = requests.get(
            "https://api.twitter.com/2/tweets/search/stream/rules", auth=self.bearer_oauth, proxies=self.proxies
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
            json=payload,
            proxies=self.proxies
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
            proxies=self.proxies
        )
        if response.status_code != 201:
            raise Exception(
                "Cannot add rules (HTTP {}): {}".format(response.status_code, response.text)
            )

    def get_new_rules(self):
        rules = []
        self.rule_and_response = {}
        for i in self.client['autoPost'].find_one({'email': self.email})['rules']:
            rules.append({'value': i[0] + " -is:reply", 'tag': i[2]})
            self.rule_and_response[i[2]] = i[1]
        return rules
    
    def reset_rules(self):
        rules = self.get_rules()
        self.delete_all_rules(rules)
        rules = self.get_new_rules()
        self.set_rules(rules)

    def get_stream(self):
        starting_time = datetime.datetime.now()
        response = requests.get(
            "https://api.twitter.com/2/tweets/search/stream", auth=self.bearer_oauth, stream=True, proxies=self.proxies
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
                self.reply_to_tweet(json_response)
    
    def reply_to_tweet(self, json_response):
        tweet_id = json_response['data']['id']
        reply = spintax.spin(self.rule_and_response[json_response['matching_rules'][0]['tag']])
        oauth = OAuth1Session(
            self.api_key,
            client_secret=self.api_secret,
            resource_owner_key=self.access_token,
            resource_owner_secret=self.access_token_secret,
        )
        response = oauth.post(
            "https://api.twitter.com/2/tweets",
            json={"text": reply, "reply": {"in_reply_to_tweet_id": tweet_id}},
        )
        if response.status_code != 201:
            print(
                "Cannot reply to tweet (HTTP {}): {} {}".format(
                    response.status_code, response.text, response.headers
                )
            )
            if 'rate limit exceeded' in response.text.lower() or 'rate limit exceeded' in response.headers.lower():                
                time.sleep(3600)
                self.reply_to_tweet(json_response)

        

    def reset_and_run(self):
        self.reset_rules()
        self.get_stream()