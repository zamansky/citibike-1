import sys
import popen2


x = popen2.popen2("ssh -N -L 4321:localhost:27017 mongo.zamansky.net")
import pymongo

connection = pymongo.Connection("localhost",4321)
db=connection['citibike']
collection = db['stations']

cursor = collection.find({'stationName':'W 26 St & 8 Ave'})
cursor.sort("timestamp")
oldest=cursor[0]['timestamp']
cursor.sort("timestamp",-1)
newest=cursor[0]['timestamp']
#s = [x for x in cursor]
#print s
#bikes = [ x['availableBikes'] for x in s]
#print bikes
#print len(s)

stations =  db.command({'distinct':'stations','key':'stationName'})[
    'values']
#print stations

span=newest-60*30



for s in stations:
    cursor=collection.find({'stationName':s,
                            'timestamp':{'$gt':span,'$lt':newest+1}})
    cursor.sort("timestamp")
    l= [x for x in cursor]
    #print len(l)
    dif = l[0]['availableBikes']-l[-1]['availableBikes']
    print l[0]['stationName'],dif
    print "--------------------------------------------------"
