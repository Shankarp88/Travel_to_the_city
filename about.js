var map, places, infoWindow;
var markers = [];
var autocomplete;
var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
var hostnameRegexp = new RegExp('^https?://.+?/');

var countries = {
  'au': {
    center: {lat: -25.3, lng: 133.8},
    zoom: 4
  },
  'br': {
    center: {lat: -14.2, lng: -51.9},
    zoom: 3
  },
  'ca': {
    center: {lat: 62, lng: -110.0},
    zoom: 3
  },
  'fr': {
    center: {lat: 46.2, lng: 2.2},
    zoom: 5
  },
  'de': {
    center: {lat: 51.2, lng: 10.4},
    zoom: 5
  },
  'mx': {
    center: {lat: 23.6, lng: -102.5},
    zoom: 4
  },
  'nz': {
    center: {lat: -40.9, lng: 174.9},
    zoom: 5
  },
  'it': {
    center: {lat: 41.9, lng: 12.6},
    zoom: 5
  },
  'za': {
    center: {lat: -30.6, lng: 22.9},
    zoom: 5
  },
  'es': {
    center: {lat: 40.5, lng: -3.7},
    zoom: 5
  },
  'pt': {
    center: {lat: 39.4, lng: -8.2},
    zoom: 6
  },
  'us': {
    center: {lat: 37.1, lng: -95.7},
    zoom: 3
  },
  'uk': {
    center: {lat: 54.8, lng: -4.6},
    zoom: 5
  }
};

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: countries['us'].zoom,
    center: countries['us'].center,
    mapTypeControl: false,
    panControl: false,
    zoomControl: false,
    streetViewControl: false
  });

  infoWindow = new google.maps.InfoWindow({
    content: document.getElementById('info-content')
  });

  // Create the autocomplete object and associate it with the UI input control.
  autocomplete = new google.maps.places.Autocomplete(
      /** @type {!HTMLInputElement} */ (
          document.getElementById('autocomplete')), {
        types: ['(cities)'],
      });
  places = new google.maps.places.PlacesService(map);

  autocomplete.addListener('place_changed', onPlaceChanged);

  // Add a DOM event listener to react when the user selects a country.
  document.getElementById('country').addEventListener(
      'change', setAutocompleteCountry);
}

// When the user selects a city, get the place details for the city and
// zoom the map in on the city.
function onPlaceChanged() {
  var place = autocomplete.getPlace();
  if (place.geometry) {
    map.panTo(place.geometry.location);
    map.setZoom(15);
    search();
  } else {
    document.getElementById('autocomplete').placeholder = 'Enter a city';
  }
}

// Search for tourist attractions in the selected city, within the viewport of the map.
function search() {
  var search = {
    bounds: map.getBounds(),
    types: ['tourist_attraction']
  };

  places.nearbySearch(search, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      clearResults();
      clearMarkers();
      // Create a marker for each attraction found, and
      // assign a letter of the alphabetic to each marker icon.
      for (var i = 0; i < results.length; i++) {
        var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
        var markerIcon = MARKER_PATH + markerLetter + '.png';
        // Use marker animation to drop the icons incrementally on the map.
        markers[i] = new google.maps.Marker({
          position: results[i].geometry.location,
          animation: google.maps.Animation.DROP,
          icon: markerIcon
        });
        // If the user clicks a location marker, show the details of that place
        // in an info window.
        markers[i].placeResult = results[i];
        google.maps.event.addListener(markers[i], 'click', showInfoWindow);
        setTimeout(dropMarker(i), i * 100);
        addResult(results[i], i);
      }
    }
  });
}

function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    if (markers[i]) {
      markers[i].setMap(null);
    }
  }
  markers = [];
}

function setAutocompleteCountry() {
  var country = document.getElementById('country').value;
  if (country == 'all') {
    map.setCenter({lat: 15, lng: 0});
    map.setZoom(2);
  } else {
    map.setCenter(countries[country].center);
    map.setZoom(countries[country].zoom);
  }
  clearResults();
  clearMarkers();
}

function dropMarker(i) {
  return function() {
    markers[i].setMap(map);
  };
}

function addResult(result, i) {
  var results = document.getElementById('results');
  var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
  var markerIcon = MARKER_PATH + markerLetter + '.png';

  var tr = document.createElement('tr');
  tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
  tr.onclick = function() {
    google.maps.event.trigger(markers[i], 'click');
  };

  var title = document.createElement('tr');
  var icon = document.createElement('img');
  var firstPhoto = result.photos[0];
  var photo = document.createElement('img');
  photo.classList.add('photo');
  photo.src = firstPhoto.getUrl();
  icon.src = markerIcon;
  icon.setAttribute('class', 'placeIcon');
  icon.setAttribute('className', 'placeIcon');
  var name = document.createTextNode(result.name);
  title.appendChild(icon);
  title.appendChild(name);
  tr.appendChild(title);
  tr.appendChild(photo);
  results.appendChild(tr);
}

function clearResults() {
  var results = document.getElementById('results');
  while (results.childNodes[0]) {
    results.removeChild(results.childNodes[0]);
  }
}

// Get the place details for an attraction. Show the information in an info window,
// anchored on the marker for the attraction that the user selected.
function showInfoWindow() {
  var marker = this;
  places.getDetails({placeId: marker.placeResult.place_id},
      function(place, status) {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          return;
        }
        infoWindow.open(map, marker);
        buildIWContent(place);
      });
}

// Load the place information into the HTML elements used by the info window.
function buildIWContent(place) {
  document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
      'src="' + place.icon + '"/>';
  document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
      '">' + place.name + '</a></b>';
  document.getElementById('iw-address').textContent = place.vicinity;

  if (place.formatted_phone_number) {
    document.getElementById('iw-phone-row').style.display = '';
    document.getElementById('iw-phone').textContent =
        place.formatted_phone_number;
  } else {
    document.getElementById('iw-phone-row').style.display = 'none';
  }

  if (place.rating) {
    var ratingHtml = '';
    for (var i = 0; i < 5; i++) {
      if (place.rating < (i + 0.5)) {
        ratingHtml += '&#10025;';
      } else {
        ratingHtml += '&#10029;';
      }
    document.getElementById('iw-rating-row').style.display = '';
    document.getElementById('iw-rating').innerHTML = ratingHtml;
    }
  } else {
    document.getElementById('iw-rating-row').style.display = 'none';
  }

  if (place.website) {
    var fullUrl = place.website;
    var website = hostnameRegexp.exec(place.website);
    if (website === null) {
      website = 'http://' + place.website + '/';
      fullUrl = website;
    }
    document.getElementById('iw-website-row').style.display = '';
    document.getElementById('iw-website').textContent = website;
  } else {
    document.getElementById('iw-website-row').style.display = 'none';
  }
}

$(function () {
    $('#picker').datetimepicker();
  });
  
  var weatherButton = document.getElementById('weatherbutton')
  weatherButton.addEventListener('click', function () {
    var weathercontainer = document.getElementById('weather')
    var city = document.getElementById("Search").value

    axios.get(`http://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=22e96771fcd3de05e9991d8fb79ebb4a`)
    
    
      .then(function (response) {
        var test = (response);
        console.log(response.data.city)
        test.data.list.map(function (values) {
          console.log(test.data.list)
          var text = document.createElement('div');
          text.setAttribute('id', 'wez-type')
          text.setAttribute('style', "color:black")
          var text7 = document.createElement('p');
          var text1 = document.createElement('p');
          var text2 = document.createElement('p');
          var text3 = document.createElement('p');
          var text4 = document.createElement('p');
          var text5 = document.createElement('p');
          var text6 = document.createElement('p');
          var text7 = document.createElement('p');
    
          text.innerHTML = 'City :' + test.data.city.name;
          text7.innerHTML = 'Date :' + values.dt_txt;
          text1.innerHTML = 'Temprature :' + values.main.temp;
          text2.innerHTML = `Feels like : ${values.main.feels_like}`;
          text3.innerHTML = 'Temp Max :' + values.main.temp_max;
          text4.innerHTML = 'Temp Min :' + values.main.temp_min;
          text5.innerHTML = 'Pressure :' + values.main.pressure;
          text6.innerHTML = 'Humidity :' + values.main.humidity;
          weathercontainer.appendChild(text)
          text.appendChild(text7)
          text.appendChild(text1)
          text.appendChild(text2)
          text.appendChild(text3)
          text.appendChild(text4)
          text.appendChild(text5)
          text.appendChild(text6)
        })
      })
      .catch(err => {
        console.log(err);
      });
    
})