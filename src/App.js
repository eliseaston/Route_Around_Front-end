/*global google*/
import React from 'react';
import './App.css';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import { CopyToClipboard } from 'react-copy-to-clipboard'

export class MapContainer extends React.Component {
  constructor(props) {
    super(props);
    const { lat, lng } = this.props.initialCenter
    this.state = {
      darkMode: false,
      stores: [],
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},
      postCode: '',
      distance: 0,
      actualDistance: 0,
      geocoder: {},
      postCodeCoords: {},
      currentLocation: {
        lat: lat,
        lng: lng
      }
    }
    this.handlePostcodeChange = this.handlePostcodeChange.bind(this);
    this.handleDistanceChange = this.handleDistanceChange.bind(this);
    this.handleToggleDarkMode = this.handleToggleDarkMode.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  onMarkerClick = (props, marker, e) =>
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });


  onClose = props => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      });
    }
  };

  displayMarkers = () => {
    return this.state.stores.map((store, index) => {
      return <Marker key={index} id={index} position={{
       lat: store.lat,
       lng: store.lng
     }}
     onClick={() => console.log("You clicked me!")} />
    })
  }

  getCoordinates = async (postcode) => {
    const locator = new google.maps.Geocoder();
    const coords = await new Promise(function(resolve, reject) {
      locator.geocode({ 'address': postcode }, function(results, status) {
        resolve(results);
      })
    })
    return { lat: coords[0].geometry.location.lat(), lng: coords[0].geometry.location.lng() }
  }


  computeTotalDistance = async (coordsData) => {
    var directionsService = new google.maps.DirectionsService();
    var directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true, draggable: false, map: map, panel: document.getElementById('right-panel')});
    var center = new google.maps.LatLng(51.5178767, -0.0762007);

    var mapOptions = {
      center: center,
      zoom: 17
    };

    var map = new google.maps.Map(document.getElementById('map'), mapOptions);

    directionsRenderer.setMap(map);

    let actualDistance = await new Promise((resolve, reject) => {
      directionsService.route({
        origin: new google.maps.LatLng(coordsData[0]),
        destination: new google.maps.LatLng(coordsData[0]),
        waypoints: [
          {location: new google.maps.LatLng(coordsData[1])},
          {location: new google.maps.LatLng(coordsData[2])},
          {location: new google.maps.LatLng(coordsData[3])}
        ],
        avoidHighways: true,
        travelMode: 'WALKING',
        region: 'gb'
      }, function (result, _status) {
        var total = 0;
        var route = result.routes[0];
        for (var i = 0; i < route.legs.length; i++) {
          total += route.legs[i].distance.value;
        }
        resolve(total / 1000);
      })
    });

    return actualDistance
  };

  getRoute  = (data) => {
    fetch('https://routearound-back.herokuapp.com/generate-waypoint-coordinates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    .then((response) => {
      return response.json();
    }).then(async (coordsData) => {
      let actualDistance = await this.computeTotalDistance(coordsData);
      return { stores: coordsData, actualDistance: actualDistance }
    })
    .then((data) => {
      this.setState({stores: data.stores, actualDistance: data.actualDistance})
    })

  }

  setCurrentLocation = async () => {
    if (this.props.centerAroundCurrentLocation) {
      if (navigator && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          const coords = pos.coords;
          this.setState({
            currentLocation: {
              lat: coords.latitude,
              lng: coords.longitude
            }
          });
        });
      }
    }
  }


  handlePostcodeChange(event) {
    this.setState({postCode: event.target.value});
  }

  handleDistanceChange(event) {
    this.setState({distance: event.target.value});
  }

  handleToggleDarkMode(event) {
    let darkMode = this.state.darkMode
    this.setState({darkMode: !darkMode})
  }

  handleSubmit(event) {
    event.preventDefault()
    if (this.state.postCode ==='') { alert('Generating route for ' + this.state.distance + 'km, based on your current location')
    var data = {
      'coordinates': this.state.currentLocation,
      'distance': this.state.distance
    }
    this.getRoute(data)
  } else {
    this.getCoordinates(this.state.postCode)
    .then(result => {
      alert('Generating route for ' + this.state.distance + 'km');
      this.setState({postCodeCoords: result});
      var data = {
        'coordinates': this.state.postCodeCoords,
        'distance': this.state.distance
      }
      this.getRoute(data);
    })
    .catch(error => {
      alert('Ooops! Something went wrong! Please check your START LOCATION and DISTANCE and try again')
    })
  }
};


  componentDidMount() {
    this.setCurrentLocation();

    var directionsRenderer = new google.maps.DirectionsRenderer();
    var center = new google.maps.LatLng(this.state.currentLocation.lat, this.state.currentLocation.lng)
    var mapOptions = {
      center: center,
      zoom: 16
    }
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsRenderer.setMap(map);
  }

  componentDidUpdate() {

    var directionsService = new google.maps.DirectionsService();

    var directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true, draggable: false, map: map, panel: document.getElementById('#')});
    var center = new google.maps.LatLng(this.state.currentLocation.lat, this.state.currentLocation.lng)
    var mapOptions1 = {

      center: center,
      zoom: 16
    }
    var mapOptions2 = {
      center: center,
      zoom: 16,
      styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
          ]
    }


    if (this.state.darkMode) {
        document.body.classList.add('dark-mode');
        var map = new google.maps.Map(document.getElementById('map'), mapOptions2);
    } else {
        document.body.classList.remove('dark-mode');
        var map = new google.maps.Map(document.getElementById('map'), mapOptions1);
    }
    var image1 = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    var markerStart = new google.maps.Marker({position: this.state.stores[0], icon: image1})
    var markerCurrent = new google.maps.Marker({position: this.state.currentLocation})
    markerStart.setMap(map);
    markerCurrent.setMap(map);
    directionsRenderer.setMap(map);

    directionsService.route({
      origin: new google.maps.LatLng(this.state.stores[0]),
      destination: new google.maps.LatLng(this.state.stores[0]),
      waypoints: [
        {location: new google.maps.LatLng(this.state.stores[1])},
        {location: new google.maps.LatLng(this.state.stores[2])},
        {location: new google.maps.LatLng(this.state.stores[3])}
      ],
      avoidHighways: true,
      travelMode: 'WALKING',
      region: 'gb'
    }, function (result, status) {
      directionsRenderer.setDirections(result);
    })
  }

  render() {
    return (
      <div className='App'>
        <div className="nonMapApp">
          <div className="container" id="banner">
            <div className="row border-bottom">
              <div className="col-10">
                <h1>Route Around</h1>
              </div>
              <div className="col">
                <button className="btn btn-light btn-sm" onClick={this.handleToggleDarkMode}><span className="oi oi-moon"></span></button>
              </div>
            </div>
          </div>
          <form className='form' onSubmit={this.handleSubmit}>
            <div className="form-group">
              <div className="container">
                <div className="row">
                  <div className="col">
                    Start location:
                  </div>
                  <div className="col-7">
                    <input
                      className="form-control"
                      name="postCode"
                      type="text"
                      value={this.state.postCode}
                      onChange={this.handlePostcodeChange}/>
                    <small id="emailHelp" className="form-text text-muted">For current location, leave blank</small>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    Kilometres:
                  </div>
                  <div className="col-7">
                    <input
                      className="form-control"
                      name="distance"
                      type="number"
                      value={this.state.distance}
                      onChange={this.handleDistanceChange} />
                  </div>
                </div>
                <br />
                <div className="row" id="buttonRow">
                  <button type="submit" className="btn btn-light btn-lg btn-block border" id="planRoute">Plan my route!</button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="container-fluid border-bottom" id="map">
          <div id='map'>
            <Map yesIWantToUseGoogleMapApiInternals centerAroundCurrentLocation google={this.props.google}>
              <Marker onClick={this.onMarkerClick} name={'current location'} />
              <InfoWindow
                marker={this.state.activeMarker}
                visible={this.state.showingInfoWindow}
                onClose={this.onClose}
              >
                <div>
                  <h4>{this.state.selectedPlace.name}</h4>
                </div>
              </InfoWindow>
              <Marker
                    icon="https://www.robotwoods.com/dev/misc/bluecircle.png"
                    position={this.state.currentLocation}
                />
              {this.displayMarkers()}
            </Map>
          </div>
        </div>
        <div className="container" id="totalDistance">
          <div className="row">
            Total Route Distance:
            <div className="col">
            <span id="total">{this.state.actualDistance}</span> km</div>
          </div>
        </div>
      </div>
    );
  }
}

// export default App;
export default GoogleApiWrapper({
  apiKey: 'AIzaSyDro0XKEZYd8mj42cXWVukmO0WKJstaAYs&callback='
})(MapContainer);

MapContainer.defaultProps = {
  zoom: 16,
  initialCenter: {
    lat: 51.5178767,
    lng: -0.0762007
  },
  centerAroundCurrentLocation: true,
  visible: true
};
