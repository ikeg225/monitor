import os
import boto3
import ahocorasick
from dotenv import load_dotenv
from botocore.exceptions import ClientError

load_dotenv()

class Monitor:
    def __init__(self, client):
        self.client = client
        self.automation = ahocorasick.Automaton()
        for word in client.get_client().distinct('keyword'):
            self.automation.add_word(word, word)
        self.automation.make_automaton()
    
    def find_keywords(self, text):
        keywords_found = set()
        for keyword in self.automation.iter(text):
            if keyword[1].startswith("#"):
                if keyword[0] + 1 >= len(text) or not (text[keyword[0] + 1].isalnum() or text[keyword[0] + 1] == "_"):
                    keywords_found.add(keyword[1])
            else:
                index, found_hashtag = keyword[0] - len(keyword[1]), False
                while index >= 0 and (text[index].isalnum() or text[index] == "_" or text[index] == "#"):
                    if text[index] == "#":
                        found_hashtag = True
                        break
                    index -= 1
                if not found_hashtag:
                    keywords_found.add(keyword[1])
        return keywords_found

    def update_automation(self, updates):
        # delete keywords
        for update in updates:
            if update[0] == 'insert':
                self.automation.add_word(update[1], update[1])
                self.automation.make_automaton()
    
    def send_email(self, recipient, subject, body_text, body_html):
        charset = "UTF-8"
        client = boto3.client('ses',region_name=os.getenv('AWS_REGION'))
        try:
            response = client.send_email(
                Destination={
                    'ToAddresses': [
                        recipient,
                    ],
                },
                Message={
                    'Body': {
                        'Html': {
                            'Charset': charset,
                            'Data': body_html,
                        },
                        'Text': {
                            'Charset': charset,
                            'Data': body_text,
                        },
                    },
                    'Subject': {
                        'Charset': charset,
                        'Data': subject,
                    },
                },
                Source=os.getenv('SENDER'),
            )
        except ClientError as e:
            print(e.response['Error']['Message'])

    def notify_clients(self, keywords_found, text, url):
        for keyword in keywords_found:
            emails = self.client.get_emails(keyword)
            for email in emails:
                body_text = (
                "Your keyword was found in a post!\n"
                f"Keyword: {keyword}\n"
                f"Post: {text}\n"
                f"Link: {url}"
                )

                body_html = f"""
                <html>
                <head></head>
                <body>
                <p><b>Your keyword was found in a post!</b></p>
                <p><b>Keyword:</b> {keyword}</p>
                <p><b>Post:</b> {text}</p>
                <p><b>Link: </b><a href='{url}'>{url}</a></p>
                </body>
                </html>
                """

                self.send_email(email, f"Keyword Found: {keyword}", body_text, body_html)