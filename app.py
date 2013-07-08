#!/usr/bin/python
from flask import Flask, request, render_template, url_for, redirect
import sys
import popen2
import pymongo
import json,time

app = Flask(__name__)
app.secret_key="testkey"

#-------------------- Pages --------------------
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/getDateRange")
def getDateRange():
    cursor = collection.find({'stationName':'W 26 St & 8 Ave'})
    cursor.sort("timestamp")
    oldest=cursor[0]['timestamp']
    cursor.sort("timestamp",-1)
    newest=cursor[0]['timestamp']
    range={'min':oldest,'max':newest}
    return json.dumps(range)

@app.route("/getStation/")
@app.route("/getStation/<station>")
def getStation(station=None):
    if station==None:
        station='W 26 St & 8 Ave'
    # station = request.args.get('stationName','W 26 St & 8 Ave')
    secs = request.args.get('timestamp',time.time())
    cursor =collection.find({'stationName':station},{'availableBikes':1,'timestamp':1,'_id':0})
    cursor.sort("timestamp")
    stats=[x for x in cursor]
    cursor =collection.find({'stationName':station},{'_id':0})
    info=cursor[0]
    info['min']=stats[0]['timestamp']
    info['max']=stats[-1]['timestamp']
    data={'stationName':station,'info':info,'stats':stats}
    return json.dumps(data)


@app.route("/getstationdiff/<station>/<time>")
def getstationdiff(station=None,time=None):
    span=time-(1000*60*30)
    cursor=collection.find({'stationName':station,
                            'timestamp':{'$gt':span,'$lt':time+1}},{'_id':0})
    cursor.sort("timestamp")
    l= [x for x in cursor]
    dif = l[0]['availableBikes']-l[-1]['availableBikes']
    return json.dumps(dif)


@app.route("/getStations")
def getStations():
    stations =  db.command({'distinct':'stations','key':'stationName'})[
        'values']
    cursor = collection.find({'stationName':'W 26 St & 8 Ave'})
    cursor.sort("timestamp")
    newest=cursor[0]['timestamp']
    return json.dumps({'stations':stations,'newest':newest})


x = popen2.popen2("ssh -N -L 4321:localhost:27017 mongo.zamansky.net")
connection = pymongo.Connection("localhost",4321)
db=connection['citibike']
collection = db['stations']

if __name__=="__main__":
    app.debug=True
    app.run(host="0.0.0.0")
