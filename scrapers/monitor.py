import ahocorasick

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
            keywords_found.add(keyword[1])
        return keywords_found

    def update_automation(self, updates):
        # need to handle other operations
        for update in updates:
            if update[0] == 'insert':
                self.automation.add_word(update[1], update[1])
                self.automation.make_automaton()
    
    def send_email(self, keywords_found, text, url):
        for keyword in keywords_found:
            emails = self.client.get_emails(keyword)
            for email in emails:
                print(email, keyword, text, url)        