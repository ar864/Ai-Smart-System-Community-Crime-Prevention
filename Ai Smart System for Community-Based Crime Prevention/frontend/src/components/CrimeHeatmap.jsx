import { useEffect } from "react";
import L from "leaflet";
import "leaflet.heat";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";

function HeatOverlay({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      return undefined;
    }

    const heatPoints = points.map((point) => [
      point.lat,
      point.lng,
      Math.min(1, point.severity / 5)
    ]);

    const layer = L.heatLayer(heatPoints, {
      radius: 30,
      blur: 26,
      minOpacity: 0.4,
      maxZoom: 17,
      gradient: {
        0.2: "#22c55e",
        0.4: "#fde047",
        0.7: "#f97316",
        1: "#dc2626"
      }
    }).addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, points]);

  return null;
}

function FitToPoints({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      map.setView([12.9716, 77.5946], 11);
      return;
    }

    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14);
      return;
    }

    const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng]));
    map.fitBounds(bounds.pad(0.25));
  }, [map, points]);

  return null;
}

export default function CrimeHeatmap({ incidents }) {
  const points = incidents
    .filter((item) => item.location?.latitude && item.location?.longitude)
    .map((item) => ({
      id: item._id,
      title: item.title,
      area: item.location?.area || "Unknown",
      lat: Number(item.location.latitude),
      lng: Number(item.location.longitude),
      severity: Number(item.severity || 1)
    }));

  return (
    <section className="card">
      <h2>Crime Heatmap Visualization</h2>
      {points.length === 0 ? (
        <p>Add incidents with latitude and longitude to view hotspot map.</p>
      ) : null}

      <div className="osm-map-wrapper">
        <MapContainer center={[12.9716, 77.5946]} zoom={11} className="osm-map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <HeatOverlay points={points} />
          <FitToPoints points={points} />

          {points.map((point) => (
            <CircleMarker
              key={point.id}
              center={[point.lat, point.lng]}
              radius={Math.max(6, point.severity * 2)}
              pathOptions={{ color: "#7f1d1d", fillColor: "#dc2626", fillOpacity: 0.75 }}
            >
              <Popup>
                <strong>{point.title}</strong>
                <br />
                Area: {point.area}
                <br />
                Severity: {point.severity}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <p className="hint">OpenStreetMap heat intensity reflects incident severity and density.</p>
    </section>
  );
}
