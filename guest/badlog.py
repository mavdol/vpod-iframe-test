import time
import datetime
import os

LOG_FILE = "/var/log/bad.log"
INTERVAL = 2

def main():
    f = open(LOG_FILE, "a", buffering=1)
    pid = os.getpid()
    while True:
        f.write(f"{datetime.datetime.now().isoformat()} INFO pid={pid} test-payload={'x'*40}\n")
        f.flush()
        os.fsync(f.fileno())
        time.sleep(INTERVAL)

if __name__ == "__main__":
    main()
