import os
from flask import Flask, jsonify, render_template
import requests
import xml.etree.ElementTree as ET
from google.transit import gtfs_realtime_pb2
from datetime import datetime


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
        return render_template('homepage.html')

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
            response.raise_for_status()

            # Parse Protobuf data
            feed = gtfs_realtime_pb2.FeedMessage()
            feed.ParseFromString(response.content)

            # Extract relevant data
            data = []
            for entity in feed.entity:
                if entity.HasField('trip_update'):
                    trip_update = entity.trip_update
                    data.append({
                        'trip_id': trip_update.trip.trip_id,
                        'start_time': trip_update.trip.start_time,
                        'start_date': trip_update.trip.start_date,
                        'stop_time_updates': [
                            {
                                'stop_id': stop_time_update.stop_id,
                                'arrival_time': datetime.utcfromtimestamp(stop_time_update.arrival.time).strftime('%Y-%m-%d %H:%M:%S') if stop_time_update.HasField('arrival') else None,
                                'departure_time': datetime.utcfromtimestamp(stop_time_update.departure.time).strftime('%Y-%m-%d %H:%M:%S') if stop_time_update.HasField('departure') else None
                            }
                            for stop_time_update in trip_update.stop_time_update
                        ]
                    })

            return render_template('subway_feed.html', line=line.upper(), data=data)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    # test subway data as backend
    @app.route('/<line>')
    def get_subway(line):
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
            response.raise_for_status()

            # Parse Protobuf data
            feed = gtfs_realtime_pb2.FeedMessage()
            feed.ParseFromString(response.content)

            # Extract relevant data
            data = []
            for entity in feed.entity:
                if entity.HasField('trip_update'):
                    trip_update = entity.trip_update
                    data.append({
                        'trip_id': trip_update.trip.trip_id,
                        'start_time': trip_update.trip.start_time,
                        'start_date': trip_update.trip.start_date,
                        'stop_time_updates': [
                            {
                                'stop_id': stop_time_update.stop_id,
                                'arrival_time': datetime.utcfromtimestamp(stop_time_update.arrival.time).strftime('%Y-%m-%d %H:%M:%S') if stop_time_update.HasField('arrival') else None,
                                'departure_time': datetime.utcfromtimestamp(stop_time_update.departure.time).strftime('%Y-%m-%d %H:%M:%S') if stop_time_update.HasField('departure') else None
                            }
                            for stop_time_update in trip_update.stop_time_update
                        ]
                    })

            return data
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
