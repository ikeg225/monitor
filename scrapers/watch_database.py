import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
platforms = set(['twitter', 'hackernews', 'reddit', 'lobster'])
db = MongoClient(os.getenv('CONNECTION_STRING'))['keywordmonitor']

with db.watch([], full_document='updateLookup') as stream:
    for change in stream:
        collection = change['ns']['coll']
        if collection in platforms:
            if change['operationType'] == 'insert':
                db['changes' + collection.capitalize()].insert_one({'operationType': 'insert', 'keyword': change['fullDocument']['keyword']})
            elif change['operationType'] == 'update' and len(change['fullDocument']['email']) == 0:
                db['changes' + collection.capitalize()].insert_one({'operationType': 'delete', 'keyword': change['fullDocument']['keyword']})
