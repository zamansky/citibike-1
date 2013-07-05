import sys
import popen2


x = popen2.popen2("ssh -N -L 4321:localhost:27017 mongo.zamansky.net")
import pymongo

connection = pymongo.Connection("localhost",4321)
db=connection['citibike']
collection = db['stations']

cursor = collection.find({'stationName':'W 26 St & 8 Ave'})
print cursor.count()
