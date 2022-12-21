import time
from scrape import Scrape
from datetime import datetime
import sys
sys.path.insert(0, r'../')
from monitor import Monitor
from database import Database

scrape_hackernews = Scrape(34076499)
database_hackernews = Database('hackernews')
monitor_hackernews = Monitor(database_hackernews)

while True:
    start_break = datetime.now()
    updates = database_hackernews.database_changes()
    monitor_hackernews.update_automation(updates)
    while scrape_hackernews.queue.qsize() > 0:
        post = scrape_hackernews.queue.get()
        keywords = monitor_hackernews.find_keywords(post[0])
        monitor_hackernews.send_email(keywords, post[0], post[1])
    end_break = datetime.now()

    sleep_time = (end_break - start_break).seconds
    print("Sleep time run: ", sleep_time)
    if sleep_time < 180:
        time.sleep(180 - sleep_time)

    start_break = datetime.now()
    scrape_hackernews.run()
    end_break = datetime.now()
    print("Scrape time: ", (end_break - start_break).seconds)
    print("Queue Size:", scrape_hackernews.queue.qsize())
