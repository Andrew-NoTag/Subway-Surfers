import os
from flask import Flask, jsonify
import requests


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Homepage route
    @app.route('/')
    def homepage():
        return '''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Subway Surfers</title>
        </head>
        <body>
            <h1>Welcome to Subway Surfers</h1>
            <p>Click the links below to access the MTA Subway Realtime Feeds:</p>
            <ul>
                <!-- <li><a href="/mta/elevator">MTA Elevator Data</a></li> -->
                <li><a href="/mta/feeds/ace">ACE Line</a></li>
                <li><a href="/mta/feeds/bdfm">BDFM Line</a></li>
                <li><a href="/mta/feeds/g">G Line</a></li>
                <li><a href="/mta/feeds/jz">JZ Line</a></li>
                <li><a href="/mta/feeds/nqrw">NQRW Line</a></li>
                <li><a href="/mta/feeds/l">L Line</a></li>
                <li><a href="/mta/feeds/1234567s">1234567S Line</a></li>
                <li><a href="/mta/feeds/sir">SIR Line</a></li>
            </ul>
        </body>
        </html>
        '''

    # Routes for Subway Realtime Feeds
    @app.route('/mta/feeds/<line>')
    def get_subway_feed(line):
        feeds = {
            'ace': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',
            'bdfm': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm',
            'g': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g',
            'jz': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz',
            'nqrw': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw',
            'l': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l',
            '1234567s': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',
            'sir': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-si'
        }
        url = feeds.get(line)
        if not url:
            return jsonify({'error': 'Invalid line specified'}), 404
        try:
            response = requests.get(url)
            return response.text
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    # Route to fetch MTA Elevator data

    # @app.route('/mta/elevator')
    # def get_subway():
    #     url = 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fnyct_ene.xml'
    #     try:
    #         response = requests.get(url)
    #         return response.text
    #     except Exception as e:
    #         return jsonify({'error': str(e)}), 500

    return app
