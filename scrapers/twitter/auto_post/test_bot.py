import os
from main import AutoPost
from dotenv import load_dotenv

load_dotenv()

bearer_token = os.getenv('TEST_BEARERTOKEN')
user_agent = os.getenv('TEST_USERAGENT')
email = os.getenv('TEST_EMAIL')
proxies = {
    "http": f"http://{os.getenv('TEST_PROXY')}",
    "https": f"http://{os.getenv('TEST_PROXY')}"
}
api_key = os.getenv('TEST_APIKEY')
api_secret = os.getenv('TEST_APISECRET')
access_token = os.getenv('TEST_ACCESSTOKEN')
access_token_secret = os.getenv('TEST_ACCESSTOKENSECRET')

auto_post = AutoPost(bearer_token, user_agent, email, proxies, api_key, api_secret, access_token, access_token_secret)
while True:
    auto_post.reset_and_run()

