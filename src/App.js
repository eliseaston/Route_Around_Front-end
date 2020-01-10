/*global google*/
import React from 'react';
import logo from './logo.svg';
import './App.css';
import { GoogleMap, GoogleApiWrapper, Marker, InfoWindow, Polyline, DirectionsRenderer, GoogleMapReact } from 'google-maps-react';
import CurrentLocation from './CurrentLocation';

export class MapContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stores: [
        { lat: 51.5178767, lng: -0.0762007 },
        { lat: 51.52581606811841, lng: -0.06343865245844427 },
        { lat: 51.5337592191676, lng: -0.07620069999995849 },
        { lat: 51.52581606811841, lng: -0.08896274754147271 },
        { lat: 51.5178767, lng: -0.0762007 }
      ],
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},
    }
    this.handleChange = this.handleChange.bind(this);
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

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    alert('Ready for your route??');
  }

  render() {
    // bellow code isn't breaking anything and was an attempt to get the app to route betwen points
    const apiIsLoaded = (map,maps) => {
      const directionsService = new maps.DirectionsService();
      const directionsDisplay = new maps.DirectionsRenderer();
      directionsService.route({
        origin: this.state.stores[0],
        destination: this.state.stores[1],
        travelMode: 'WALKING'
      }, (response, status) => {
        if (status === 'OK') {
          directionsDisplay.setDirections(response);
          console.log(response.routes[0].overview_path, 'Ruta')
          const routePolyline = new google.maps.Polyline({
            path: response.routes[0].overview_path
          });
          routePolyline.setMap(map);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });
    };
    // end of code snippet

    return (
      <div className='App'>
      <div>
        <h1>Route Around App</h1>
      <div>
      <form className='App' onSubmit={this.handleSubmit}>
        <label>
          Post Code:
          <input
            name="postCode"
            type="text"
            value={this.state.postCode}
            onChange={this.handleInputChange} />
        </label>
        <br />
        <br />
        <label>
          5 kilometers:
          <input
            name="5km"
            type="checkbox"
            checked={this.state.distance5}
            onChange={this.handleInputChange} />
        </label>
        <br />
        <label>
          10 kilometers:
          <input
            name="10km"
            type="checkbox"
            checked={this.state.distance10}
            onChange={this.handleInputChange} />
        </label>
        <br />
        <br />
        <input type="submit" value="GO!" />
        <br />
      </form>
      <div>
        <CurrentLocation yesIWantToUseGoogleMapApiInternals centerAroundCurrentLocation google={this.props.google} onGoogleApiLoaded={({ map, maps }) => apiIsLoaded(map, maps)}>
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
          {this.displayMarkers()}
          <Polyline path={this.state.stores} options={{ strokeColor: '#c94c4c'}}/>
        </CurrentLocation>
      </div>
      </div>
      </div>
      </div>
    );
  }
}

// export default App;
export default GoogleApiWrapper({
  apiKey: 'AIzaSyDro0XKEZYd8mj42cXWVukmO0WKJstaAYs'
})(MapContainer);
