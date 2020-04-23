from app import app
from flask import render_template
import json


@app.route('/')
@app.route('/index')
def index():
    with open('app\\SRabilities.json','r') as f:
        sr_dict = json.load(f)
    user = {'username': 'Colin'}
    return render_template('index.html', title='Home', user=user, sr=sr_dict)


