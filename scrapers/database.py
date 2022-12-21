import os
import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
from bson.timestamp import Timestamp

load_dotenv()

class Database:
    def __init__(self, collection_name):
        CONNECTION_STRING = os.getenv('CONNECTION_STRING')
        client = MongoClient(CONNECTION_STRING)
        self.client = client['keywordmonitor'][collection_name]
        self.last_checked = Timestamp(int(datetime.datetime.now(datetime.timezone.utc).timestamp()), 0)
    
    def database_changes(self):
        changes = []
        with self.client.watch([], start_at_operation_time=self.last_checked) as stream:
            while stream.alive:
                change = stream.try_next()
                if change is not None:
                    # need to handle other database operations
                    if change['operationType'] == 'insert':
                        changes.append((change['operationType'], change['keyword']))
                else:
                    stream.close()
        self.last_checked = Timestamp(int(datetime.datetime.now(datetime.timezone.utc).timestamp()), 0)
        return changes
    
    def get_client(self):
        return self.client
    
    def get_emails(self, keyword):
        return self.client.find_one({'keyword': keyword})['email']