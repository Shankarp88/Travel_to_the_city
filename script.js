$(function () {
    $('#picker').datetimepicker();
  });
  
  
  var weatherButton =document.getElementById('weatherbutton')
  weatherButton.addEventListener('click', function () {
    var moviescontaienr = document.getElementById('movie-cont')
    var city = 'Atlanta'
    
    axios.get(`http://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=22e96771fcd3de05e9991d8fb79ebb4a`)
    
      .then(function (response) {
        var test = (response);
        console.log(response.data.city)
        test.data.list.map(function (values) {
          console.log(test.data.list)
          var text = document.createElement('div');
          text.setAttribute('id', 'wez-type')
          text.setAttribute('style', "color:powderblue")
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
          moviescontaienr.appendChild(text)
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