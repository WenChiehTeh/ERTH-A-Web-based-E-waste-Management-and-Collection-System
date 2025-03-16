let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 3.6390, lng: 103.6869 },
    zoom: 7.5,
  });

  const collectionPoints = [
    { lat: 5.4112, lng: 100.3288, name: "ERTH Drop-off 24/7 Georgetown", address: "Hin Bus Depot, 31A Jalan Gurdwara, 10300 George Town, Penang" },
    { lat: 1.4946, lng: 103.8198, name: "ERTH Collection Point in Johor Bahru", address: "No. 15, Jalan Permas 10/7, Bandar Baru Permas Jaya, 81750 Masai, Johor" },
    { lat: 3.1703, lng: 101.6653, name: "ERTH Drop-off 24/7 Kuala Lumpur", address: "Lot 1C, Level G1 (A4 Entrance), Publika Shopping Gallery, Solaris Dutamas, 50480 Kuala Lumpur" },
    { lat: 2.9255, lng: 101.6611, name: "ERTH Drop-off 24/7 Cyberjaya", address: "G-3A, Ground Floor, Kanvas Retail @ Prima 15, Jalan Teknokrat 6, 63000 Cyberjaya, Selangor" }
  ];

  collectionPoints.forEach(point => {
    const marker = new google.maps.Marker({
      position: { lat: point.lat, lng: point.lng },
      map: map,
      title: point.name,
    });

    marker.addListener("click", () => {
      const infowindow = new google.maps.InfoWindow({
        content: `<b>${point.name}</b><br>${point.address}`,
      });
      infowindow.open({
        anchor: marker,
        map,
        shouldFocus: false,
      });
    });
  });
}

document.getElementById("searchButton").addEventListener("click", geocodeAddress);

function geocodeAddress() {
  const address = document.getElementById("addressInput").value;
  const geocoder = new google.maps.Geocoder();

  geocoder.geocode({ 'address': address }, (results, status) => {
    if (status === 'OK') {
      map.setCenter(results[0].geometry.location);
      map.setZoom(100);

      new google.maps.Marker({
        position: results[0].geometry.location,
        map: map,
        title: "Searched Location"
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}