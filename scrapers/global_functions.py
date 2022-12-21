import time
from datetime import datetime
from monitor import Monitor
from database import Database

class Global:
    def __init__(self, platform):
        self.platform = platform
        self.database = Database(self.platform)
        exec(f'from {self.platform}.scrape import Scrape', globals())
        self.scrape = Scrape(self.database.get_current_id())
        self.monitor = Monitor(self.database)

    def main_run(self):
        while True:
            start_break = datetime.now()
            updates = self.database.database_changes()
            self.monitor.update_automation(updates)
            while self.scrape.queue.qsize() > 0:
                post = self.scrape.queue.get()
                keywords = self.monitor.find_keywords(post[0])
                self.monitor.notify_clients(keywords, post[0], post[1])
            self.database.update_current_id(self.scrape.get_last_id())
            end_break = datetime.now()

            sleep_time = (end_break - start_break).seconds
            if sleep_time < 180:
                time.sleep(180 - sleep_time)

            self.scrape.run()