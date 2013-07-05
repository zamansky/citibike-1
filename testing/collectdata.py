#!/usr/bin/python
import json
import urllib2
import pymongo
from time import sleep
import time,datetime

url = 'http://citibikenyc.com/stations/json'
#connection = pymongo.Connection()
#db = connection['citibike']
#collection = db['station_status']

response = urllib2.urlopen(url)
x =response.read()
data = json.loads(x)
print data.keys()
t = data['executionTime']
s = time.strptime(str(t),"%Y-%m-%d %I:%M:%S %p")
secs=time.mktime(s)
stations = data['stationBeanList']
l=[]
for s in stations:
    s['timestamp']=secs
    l.append(s)
