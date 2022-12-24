import sys
import datetime
sys.path.insert(0, r'../')
from database import Database
from monitor import Monitor
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

database = Database("twitter")
monitor = Monitor(database)
db = MongoClient(os.getenv('CONNECTION_STRING'))['keywordmonitor']

while True:
    starting_time = datetime.datetime.now()
    updates = database.database_changes()
    monitor.update_automation(updates)

    for document in db['stream_tweets'].find({}):
        if datetime.datetime.now() - starting_time > datetime.timedelta(minutes=5):
            break
        keywords = monitor.find_keywords(document['text'])
        monitor.notify_clients(keywords, document['text'], 'https://twitter.com/_/status/' + document['id'])
        db['stream_tweets'].delete_one({'_id': document['_id']})