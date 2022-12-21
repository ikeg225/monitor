import queue
import requests

class Scrape:
    api = 'https://hacker-news.firebaseio.com/v0/'
    item = 'https://news.ycombinator.com/item?id='

    def __init__(self, id):
        self.queue = queue.Queue()
        self.last_id = id
    
    def max_post(self):
        return int(requests.get(self.api + 'maxitem.json').text)
    
    def get_post(self, post_id):
        return requests.get(self.api + 'item/' + str(post_id) + '.json').json()
    
    def add_post(self, max_id):
        for i in range(self.last_id, max_id + 1):
            post = self.get_post(i)
            if post:
                if 'title' in post:
                    self.queue.put((post['title'].lower(), self.item + str(post['id'])))
                elif 'text' in post:
                    self.queue.put((post['text'].lower(), self.item + str(post['id'])))
        self.last_id = max_id + 1
    
    def get_last_id(self):
        return self.last_id
        
    def run(self):
        max_post_static = self.max_post()
        if self.last_id < max_post_static:
            self.add_post(max_post_static)