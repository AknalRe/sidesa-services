import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';

interface MapPlace {
  id: string;
  title: string;
  kind?: string;
  category?: string;
  address?: string;
  lat?: number | null;
  lng?: number | null;
}

interface VillageBoundaryMapProps {
  kodeDesa?: string | null;
  villageName: string;
  lat?: number | null;
  lng?: number | null;
  places?: MapPlace[];
  heightClass?: string;
}

function createPinIcon(color: string) {
  return L.divIcon({
    className: 'sidesa-map-pin',
    html: `<div style="width:16px;height:16px;border-radius:9999px;background:${color};border:3px solid #ffffff;box-shadow:0 2px 6px rgba(15,23,42,0.35);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
}

export const VillageBoundaryMap: React.FC<VillageBoundaryMapProps> = ({
  kodeDesa,
  villageName,
  lat,
  lng,
  places = [],
  heightClass = 'h-[420px] sm:h-[480px]',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [geoInfo, setGeoInfo] = useState<{ kode?: string; hasBoundary?: boolean }>({});

  useEffect(() => {
    if (!containerRef.current) return;

    const initLat = Number.isFinite(Number(lat)) && Number(lat) !== 0 ? Number(lat) : -7.610556;
    const initLng = Number.isFinite(Number(lng)) && Number(lng) !== 0 ? Number(lng) : 112.472453;

    const map = L.map(containerRef.current, {
      center: [initLat, initLng],
      zoom: 14,
      scrollWheelZoom: false,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors · Wilayah API',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);

    // Centroid / Balai Desa marker
    const centerMarker = L.marker([initLat, initLng], { icon: createPinIcon('#0069b6') })
      .bindPopup(`<strong>${villageName}</strong><br/><span style="font-size:11px;color:#475569;">Titik Pusat Wilayah Desa</span>`)
      .addTo(layerGroup);

    // POI / Potensi / Wisata markers
    places.forEach((pl) => {
      const pLat = Number(pl.lat);
      const pLng = Number(pl.lng);
      if (!Number.isFinite(pLat) || !Number.isFinite(pLng) || (pLat === 0 && pLng === 0)) return;
      const color = pl.kind === 'WISATA' ? '#10b981' : pl.kind === 'POTENSI' ? '#f59e0b' : '#0b2a57';
      L.marker([pLat, pLng], { icon: createPinIcon(color) })
        .bindPopup(
          `<div style="min-width:160px;">
            <div style="font-size:10px;font-weight:700;color:#0069b6;text-transform:uppercase;">${pl.kind || 'POI'} · ${pl.category || ''}</div>
            <div style="font-weight:800;color:#0f172a;margin-top:2px;">${pl.title}</div>
            ${pl.address ? `<div style="font-size:11px;color:#475569;margin-top:2px;">${pl.address}</div>` : ''}
          </div>`
        )
        .addTo(layerGroup);
    });

    let cancelled = false;
    if (kodeDesa && kodeDesa.trim()) {
      api
        .getWilayahDetail(kodeDesa.trim())
        .then((detail) => {
          if (cancelled || !mapRef.current || !detail) return;
          const coords = detail.coordinates;
          if (coords?.lat && coords?.lng) {
            centerMarker.setLatLng([Number(coords.lat), Number(coords.lng)]);
          }
          if (Array.isArray(detail.boundary) && detail.boundary.length > 0) {
            const poly = L.polygon(detail.boundary as L.LatLngExpression[][], {
              color: '#0069b6',
              weight: 2.5,
              fillColor: '#099cff',
              fillOpacity: 0.16,
            }).addTo(layerGroup);
            poly.bindTooltip(`Batas Wilayah ${villageName} (${detail.kode})`, { sticky: true });
            const bounds = poly.getBounds();
            if (bounds.isValid()) {
              mapRef.current.fitBounds(bounds, { padding: [24, 24] });
            }
            setGeoInfo({ kode: detail.kode, hasBoundary: true });
          } else if (coords?.lat && coords?.lng) {
            mapRef.current.setView([Number(coords.lat), Number(coords.lng)], 14);
            setGeoInfo({ kode: detail.kode, hasBoundary: false });
          }
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
      map.remove();
      mapRef.current = null;
    };
  }, [kodeDesa, villageName, lat, lng, places]);

  return (
    <div className="space-y-2">
      <div className={`w-full ${heightClass} rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative z-10`}>
        <div ref={containerRef} className="w-full h-full" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0069b6] inline-block" />
            <span>Batas &amp; Pusat Desa</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0b2a57] inline-block" />
            <span>Fasilitas (POI)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Potensi Desa</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Wisata</span>
          </span>
        </div>
        {geoInfo.kode && (
          <span className="font-mono text-slate-600">
            Kode Wilayah: <strong>{geoInfo.kode}</strong> {geoInfo.hasBoundary ? '· Polygon Batas Aktif' : ''}
          </span>
        )}
      </div>
    </div>
  );
};
