import sys, queue, requests, json
sys.path.insert(0, r'../')
from web_workers import perform_web_requests

class Scrape:
    def __init__(self, last_id, content_type):
        self.last_id = last_id
        self.url = "https://api.reddit.com/api/info.json?id="
        self.content_type = content_type
        self.user_agent = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9"
        }
        self.queue = queue.Queue()
        self.max_id = self.get_max_id()
    
    def get_last_id(self):
        return self.last_id
    
    def to_base_36(self, s):
        BS = "0123456789abcdefghijklmnopqrstuvwxyz"
        res = ""
        while s:
            res += BS[s%36]
            s //= 36
        return res[::-1] or "0"
    
    def get_max_id(self):
        if self.content_type == "t3":
            response = requests.get("https://api.reddit.com/r/all/new.json", headers=self.user_agent)
            return response.json()["data"]["after"][3:]
        elif self.content_type == "t1":
            response = requests.get("https://www.reddit.com/r/all/comments/.json", headers=self.user_agent)
            return response.json()["data"]["after"][3:]

    def links_to_request(self):
        last_id_10 = int(self.last_id, base=36)
        link = self.url + f"{self.content_type}_{self.last_id}"
        url_end = min(last_id_10 + 100, int(self.max_id, base=36))
        for i in range(last_id_10 + 1, url_end):
            link += f",{self.content_type}_{self.to_base_36(i)}"
        self.last_id = self.to_base_36(url_end)
        return link
    
    def make_request_list(self):
        link_queue, did_break = queue.Queue(), False
        for _ in range(300 if self.content_type == "t1" else 295):
            if self.last_id == self.max_id:
                did_break = True
                break
            link_queue.put(self.links_to_request())
        return link_queue, did_break
    
    def scrape_links(self, instance={}):
        link_queue, did_break = self.make_request_list()
        results = perform_web_requests(link_queue, 10, instance)
        for result in results:
            for child in json.loads(result)["data"]["children"]:
                if self.content_type == "t3":
                    self.queue.put((child["data"]["title"] + child["data"]["selftext"], 'https://www.reddit.com' + child["data"]["permalink"]))
                elif self.content_type == "t1":
                    self.queue.put((child["data"]["body"], 'https://www.reddit.com' + child["data"]["permalink"]))
        return did_break
    
    def run(self, instances=[]):
        self.max_id = self.get_max_id()
        if not instances:
            self.scrape_links()
        else:
            for instance in instances:
                links = self.scrape_links(instance)
                if links:
                    break