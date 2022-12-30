from urllib import request
from threading import Thread
import time 

def perform_web_requests(q, no_workers, instance):
    class Worker(Thread):
        def __init__(self, request_queue):
            Thread.__init__(self)
            self.queue = request_queue
            self.results = []

        def run(self):
            while True:
                content = self.queue.get()
                if content == "":
                    break
                try:
                    if instance:
                        proxy_support = request.ProxyHandler(instance['Proxy'])
                        opener = request.build_opener(proxy_support)
                        request.install_opener(opener)
                        req = request.Request(content, headers={
                            'User-Agent': instance['UserAgent']
                        })
                    else:
                        req = request.Request(content, headers={
                            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9'
                        })
                    response = request.urlopen(req)
                    self.results.append(response.read())
                    self.queue.task_done()
                except Exception as e:
                    print(e)
                    self.queue.insert(0, content)
                    time.sleep(30)

    # Workers keep working till they receive an empty string
    for _ in range(no_workers):
        q.put("")

    # Create workers and add tot the queue
    workers = []
    for _ in range(no_workers):
        worker = Worker(q)
        worker.start()
        workers.append(worker)
    # Join workers to wait till they finished
    for worker in workers:
        worker.join()

    # Combine results from all workers
    r = []
    for worker in workers:
        r.extend(worker.results)
    return r