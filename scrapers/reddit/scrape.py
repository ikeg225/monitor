class Scrape:
    def __init__(self, last_id, url):
        self.last_id = last_id
        self.url = url
    
    def to_base_36(self, s):
        BS = "0123456789abcdefghijklmnopqrstuvwxyz"
        res = ""
        while s:
            res += BS[s%36]
            s //= 36
        return res[::-1] or "0"

    def links_to_request(self, current_id):
        current_id_10 = int(current_id, base=36)
        link = self.url + "t3_" + self.to_base_36(current_id_10)
        for i in range(current_id_10 + 1, current_id_10 + 101):
            link += ",t3_" + self.to_base_36(i)
        self.last_id = self.to_base_36(current_id_10 + 101)
        return link
    

scrape = Scrape(1, "https://api.reddit.com/api/info.json?id=")

print(scrape.links_to_request("90ythp"))