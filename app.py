#!/usr/bin/python
from flask import Flask, request, render_template, url_for, redirect

app = Flask(__name__)
app.secret_key="testkey"

#-------------------- Pages --------------------
@app.route("/")
def index():
    return render_template("index.html")

if __name__=="__main__":
    app.debug=True
    app.run(host="0.0.0.0")
