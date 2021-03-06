from crawler.comp.comp import basicParams
from crawler.crawler import realtimeBigIndexCrawler


bigIndexParams = {
    'currentTime': basicParams['currentTime'],
    'isDay': basicParams['isDay'],
    'isNight': basicParams['isNight'],
    'isheadless': True,
    'dayOfWeek' : basicParams['dayOfWeek'],
    'crawlHTMLTimes' : 1000,
}

# crawl realtime bigIndex
realtimeBigIndexCrawler(bigIndexParams)

