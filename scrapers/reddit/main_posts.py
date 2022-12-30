from scrape import Scrape
import sys, math, datetime, time
sys.path.insert(0, r'../')
from monitor import Monitor
from database import Database

database = Database("reddit")
monitor = Monitor(database)

scrape = Scrape(database.get_current_id("redditPosts"), "t3")

def round_up(tm):
    upmins = math.ceil(float(tm.minute)/10)*10
    diffmins = upmins - tm.minute
    newtime = tm + datetime.timedelta(minutes=diffmins)
    newtime = newtime.replace(second=0)
    return newtime

while True:
    updates = database.database_changes()
    monitor.update_automation(updates)

    scrape.run()

    while scrape.queue.qsize() > 0:
        post = scrape.queue.get()
        keywords = monitor.find_keywords(post[0])
        monitor.notify_clients(keywords, post[0], post[1])
    database.update_current_id(scrape.get_last_id(), "redditPosts")

    current_time = datetime.datetime.now()
    time.sleep((round_up(current_time) - current_time).seconds + 5)