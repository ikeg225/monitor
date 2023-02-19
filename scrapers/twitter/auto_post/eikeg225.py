import os
from main import AutoPost
from dotenv import load_dotenv

load_dotenv()

bearer_token = os.getenv('EIKEG225_BEARERTOKEN')
user_agent = os.getenv('EIKEG225_USERAGENT')
email = os.getenv('EIKEG225_EMAIL')
proxies = {
    "http": f"http://{os.getenv('EIKEG225_PROXY')}",
    "https": f"http://{os.getenv('EIKEG225_PROXY')}"
}
api_key = os.getenv('EIKEG225_APIKEY')
api_secret = os.getenv('EIKEG225_APISECRET')
access_token = os.getenv('EIKEG225_ACCESSTOKEN')
access_token_secret = os.getenv('EIKEG225_ACCESSTOKENSECRET')

auto_post = AutoPost(bearer_token, user_agent, email, proxies, api_key, api_secret, access_token, access_token_secret)
while True:
    auto_post.reset_and_run()

