import webbrowser
from lxml.html
import requests
page = requests.get("http://www.bing.com/search?count=10&q=site:linkedin.com%20%E2%80%9C%20location%20*%20San%20Francisco%20Bay%20Area%E2%80%9D%20%22current%20*%20okta%22&first=&FORM=PORE", new=1, autoraise=True)
tree = html.fromstring(page.text)