
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


# Get station info based on a stat (min or max diff
@app.route("/getStat/")
@app.route("/getStat/<type>")
def getStat(type="diffmin"):
    # first get the latest timestamp
    cursor = collection.find({},{"_id":0,'timestamp':1})
    cursor.sort("timestamp",-1)
    t = cursor[0]['timestamp']
    cursor = collection.find({'timestamp':t},{'_id':0})
    cursor.sort('diff')
    if type=="diffmin":
        result = cursor[0]
    else:
        result = cursor[cursor.count()-1]
    return json.dumps(result)



#get a single station by name
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
    cursor =collection.find({'stationName':station,'timestamp':stats[-1]['timestamp']},{'_id':0})
    info=cursor[0]
    info['min']=stats[0]['timestamp']
    info['max']=stats[-1]['timestamp']
    data={'stationName':station,'info':info,'stats':stats}
    return json.dumps(data)


# Get all of the stations
@app.route("/getStations")
def getStations():
    #stations =  db.command({'distinct':'stations','key':'stationName'})[n
    #    'values']
    #cursor = collection.find({'stationName':'W 26 St & 8 Ave'})
    #cursor.sort("timestamp")
    #newest=cursor[0]['timestamp']
    stations = [x for x in db.stationinfo.find({},{'_id':0})]
    return json.dumps({'stations':stations})


x = popen2.popen2("ssh -N -L 4321:localhost:27017 mongo.zamansky.net")
connection = pymongo.Connection("localhost",4321)
db=connection['citibike']
collection = db['stations']

if __name__=="__main__":
    app.debug=True
    app.run(host="0.0.0.0")
