from scrape import Scrape
import sys, math, datetime, time, os
from dotenv import load_dotenv
sys.path.insert(0, r'../')
from monitor import Monitor
from database import Database

load_dotenv()

database = Database("reddit")
monitor = Monitor(database)

scrape_posts = Scrape(database.get_current_id("redditPosts"), "t3")
scrape_comments = Scrape(database.get_current_id("redditComments"), "t1")

def round_up(tm):
    upmins = math.ceil(float(tm.minute)/10)*10
    diffmins = upmins - tm.minute
    newtime = tm + datetime.timedelta(minutes=diffmins)
    newtime = newtime.replace(second=0)
    return newtime

while True:
    scrape_posts.run()

    print("here")

    updates = database.database_changes()
    monitor.update_automation(updates)
    while scrape_posts.queue.qsize() > 0:
        post = scrape_posts.queue.get()
        keywords = monitor.find_keywords(post[0])
        monitor.notify_clients(keywords, post[0], post[1])
    database.update_current_id(scrape_posts.get_last_id(), "redditPosts")

    print("here2")

    scrape_comments.run(instances=[{
        "UserAgent": "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        "Proxy": {
            "http": f"http://{os.getenv('PROXY1')}",
            "https": f"http://{os.getenv('PROXY1')}"
        }
    }, {
        "UserAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1944.0 Safari/537.36",
        "Proxy": {
            "http": f"http://{os.getenv('PROXY2')}",
            "https": f"https://{os.getenv('PROXY2')}"
        }
    }, {
        "UserAgent": "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; ja-jp) AppleWebKit/531.22.7 (KHTML, like Gecko) Version/4.0.5 Safari/531.22.7",
        "Proxy": {
            "http": f"http://{os.getenv('PROXY3')}",
            "https": f"https://{os.getenv('PROXY3')}"
        }
    }])

    print("here3")

    updates = database.database_changes()
    monitor.update_automation(updates)
    while scrape_comments.queue.qsize() > 0:
        post = scrape_comments.queue.get()
        keywords = monitor.find_keywords(post[0])
        monitor.notify_clients(keywords, post[0], post[1])
    database.update_current_id(scrape_comments.get_last_id(), "redditComments")
    
    print("here4")

    current_time = datetime.datetime.now()
    time.sleep((round_up(current_time) - current_time).seconds + 5)