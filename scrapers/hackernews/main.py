import time
from scrape import Scrape
from datetime import datetime
import sys
sys.path.insert(0, r'../')
from monitor import Monitor
from database import Database

scrape_hackernews = Scrape(34077592)
database_hackernews = Database('hackernews')
monitor_hackernews = Monitor(database_hackernews)

while True:
    start_break = datetime.now()
    updates = database_hackernews.database_changes()
    monitor_hackernews.update_automation(updates)
    while scrape_hackernews.queue.qsize() > 0:
        post = scrape_hackernews.queue.get()
        keywords = monitor_hackernews.find_keywords(post[0])
        monitor_hackernews.notify_clients(keywords, post[0], post[1])
    end_break = datetime.now()

    sleep_time = (end_break - start_break).seconds
    if sleep_time < 180:
        time.sleep(180 - sleep_time)

    scrape_hackernews.run()