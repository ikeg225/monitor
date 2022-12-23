import os
import datetime
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

class Database:
    def __init__(self, collection_name):
        CONNECTION_STRING = os.getenv('CONNECTION_STRING')
        self.clientDB = MongoClient(CONNECTION_STRING)
        self.collection_name = collection_name
        self.client = self.clientDB['keywordmonitor'][collection_name]
    
    def database_changes(self):
        changes = []
        for document in self.clientDB['keywordmonitor']['changes' + self.collection_name.capitalize()].find({}):
            changes.append((document['operationType'], document['keyword']))
            self.clientDB['keywordmonitor']['changes' + self.collection_name.capitalize()].delete_one({'_id': document['_id']})
        return changes
    
    def get_client(self):
        return self.client
    
    def get_emails(self, keyword):
        return self.client.find_one({'keyword': keyword})['email']
    
    def get_current_id(self):
        return self.clientDB['keywordmonitor']['last_id'].find_one({'platform': self.collection_name})['lastID']
    
    def update_current_id(self, id):
        self.clientDB['keywordmonitor']['last_id'].update_one({'platform': self.collection_name}, {'$set': {'lastID': id}})