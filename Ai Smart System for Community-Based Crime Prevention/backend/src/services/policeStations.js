const STATIONS = [
  {
    id: "st_001",
    name: "Central Police Station",
    address: "Main Road, City Center",
    latitude: 12.9716,
    longitude: 77.5946,
    phone: "+91-100"
  },
  {
    id: "st_002",
    name: "North Zone Police Station",
    address: "Ring Road, North District",
    latitude: 12.998,
    longitude: 77.589,
    phone: "+91-100"
  },
  {
    id: "st_003",
    name: "South Community Police Station",
    address: "Lake View, South District",
    latitude: 12.9352,
    longitude: 77.6245,
    phone: "+91-100"
  },
  {
    id: "st_004",
    name: "East Patrol Station",
    address: "Tech Corridor, East District",
    latitude: 12.9851,
    longitude: 77.708,
    phone: "+91-100"
  },
  {
    id: "st_005",
    name: "West Safety Station",
    address: "Market Square, West District",
    latitude: 12.9722,
    longitude: 77.534,
    phone: "+91-100"
  }
];

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function distanceInKm(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export function listPoliceStations() {
  return STATIONS;
}

export function findNearestStation(latitude, longitude) {
  const stationWithDistance = STATIONS.map((station) => {
    const distanceKm = distanceInKm(
      latitude,
      longitude,
      station.latitude,
      station.longitude
    );

    return { ...station, distanceKm: Number(distanceKm.toFixed(2)) };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  return stationWithDistance[0] || null;
}
