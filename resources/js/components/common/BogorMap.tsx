import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

type LayerType = 'kabupaten' | 'kecamatan' | 'kelurahan';

const LAYER_CONFIGS = {
  kabupaten: {
    url: '/admin_kab.json',
    nameField: 'NKAB',
    label: 'Kabupaten',
    style: {
      fillColor: '#0028B3',
      weight: 3,
      opacity: 1,
      color: '#001178',
      fillOpacity: 0.12,
    }
  },
  kecamatan: {
    url: '/admin_kec.json',
    nameField: 'NKEC',
    label: 'Kecamatan',
    style: {
      fillColor: '#0028B3',
      weight: 1.5,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: 0.3,
    }
  },
  kelurahan: {
    url: '/admin_kel.json',
    nameField: 'NKEL',
    label: 'Kelurahan/Desa',
    style: {
      fillColor: '#0028B3',
      weight: 1,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: 0.4,
    }
  }
};

// Helper: Calculate bounds of feature coordinates
function getFeatureBounds(coordinates: any) {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const processCoords = (coords: any) => {
    coords.forEach((coord: any) => {
      if (Array.isArray(coord[0])) {
        processCoords(coord);
      } else {
        const [lng, lat] = coord;
        if (lng < minLng) minLng = lng;
        if (lat < minLat) minLat = lat;
        if (lng > maxLng) maxLng = lng;
        if (lat > maxLat) maxLat = lat;
      }
    });
  };

  processCoords(coordinates);
  return [[minLng, minLat], [maxLng, maxLat]] as [[number, number], [number, number]];
}

// Helper: Calculate bounds of all features
function getCollectionBounds(features: any[]) {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const processCoords = (coords: any) => {
    coords.forEach((coord: any) => {
      if (Array.isArray(coord[0])) {
        processCoords(coord);
      } else {
        const [lng, lat] = coord;
        if (lng < minLng) minLng = lng;
        if (lat < minLat) minLat = lat;
        if (lng > maxLng) maxLng = lng;
        if (lat > maxLat) maxLat = lat;
      }
    });
  };

  features.forEach(f => {
    if (f.geometry && f.geometry.coordinates) {
      processCoords(f.geometry.coordinates);
    }
  });

  return [[minLng, minLat], [maxLng, maxLat]] as [[number, number], [number, number]];
}

export default function BogorMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const geoJsonCacheRef = useRef<Record<string, any>>({});

  const [activeLayer, setActiveLayer] = useState<LayerType>('kabupaten');
  const [loading, setLoading] = useState(false);
  
  const [dinasPoints, setDinasPoints] = useState<any[]>([]);
  const [showDinas, setShowDinas] = useState(true);
  const [selectedDinas, setSelectedDinas] = useState<any | null>(null);
  
  const [basemap, setBasemap] = useState<'default' | 'streets' | 'satellite'>('default');
  const [is3D, setIs3D] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 1. Initialize Maplibre Map Instance with Static Base Style
  useEffect(() => {
    if (!mapContainerRef.current || mapInstance.current) return;

    // Define style statically to guarantee basemap layer is always at the absolute bottom
    const defaultStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'basemap-source': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap &copy; CARTO'
        }
      },
      layers: [
        {
          id: 'basemap-layer',
          type: 'raster',
          source: 'basemap-source',
          minzoom: 0,
          maxzoom: 20
        }
      ]
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: defaultStyle,
      center: [106.8288, -6.4831], // Longitude, Latitude
      zoom: 9.6,
      pitch: 0,
      bearing: 0
    });

    mapInstance.current = map;

    // Navigation controls
    map.addControl(new maplibregl.NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: true
    }), 'bottom-right');

    // Hover Tooltip Popup
    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'custom-tooltip-popup'
    });

    map.on('load', () => {
      setMapLoaded(true);
    });

    // Load Dinas Points
    fetch('/dinas_points.json')
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat koordinat dinas');
        return res.json();
      })
      .then((data) => {
        setDinasPoints(data);
      })
      .catch((err) => {
        console.error('Error memuat titik dinas:', err);
      });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 2. React to Basemap Switch
  useEffect(() => {
    if (!mapInstance.current || !mapLoaded) return;
    const map = mapInstance.current;

    let tileUrl = '';
    let attribution = '';

    if (basemap === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS';
    } else if (basemap === 'streets') {
      tileUrl = 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      attribution = '&copy; OpenStreetMap &copy; CARTO';
    } else {
      tileUrl = 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; OpenStreetMap &copy; CARTO';
    }

    if (map.getLayer('basemap-layer')) map.removeLayer('basemap-layer');
    if (map.getSource('basemap-source')) map.removeSource('basemap-source');

    map.addSource('basemap-source', {
      type: 'raster',
      tiles: [tileUrl],
      tileSize: 256,
      attribution
    });

    // Find the first non-basemap layer to draw basemap layer behind it
    const layers = map.getStyle().layers;
    let beforeId = undefined;
    if (layers && layers.length > 0) {
      const firstNonBasemap = layers.find(l => l.id !== 'basemap-layer');
      if (firstNonBasemap) {
        beforeId = firstNonBasemap.id;
      }
    }

    map.addLayer({
      id: 'basemap-layer',
      type: 'raster',
      source: 'basemap-source',
      minzoom: 0,
      maxzoom: 20
    }, beforeId);
  }, [basemap, mapLoaded]);

  // 3. React to Dinas Points Markers Drawing
  useEffect(() => {
    if (!mapInstance.current || !mapLoaded) return;
    const map = mapInstance.current;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (showDinas && dinasPoints.length > 0) {
      dinasPoints.forEach((pt) => {
        if (pt.latitude && pt.longitude) {
          const el = document.createElement('div');
          el.className = 'custom-dinas-marker';
          el.innerHTML = `
            <div class="premium-dinas-pin" style="
              width: 42px;
              height: 42px;
              background: #ffffff;
              border: 2.5px solid #e8741c;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.18);
              cursor: pointer;
              transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            ">
              <img src="/image/dinas_icon.png" style="width: 28px; height: 28px; object-fit: contain;" alt="Dinas" />
            </div>
          `;

          const hoverPopup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 22,
            className: 'custom-tooltip-popup'
          }).setHTML(`<div style="font-weight: 700; color: #1e2a3a; font-family: inherit; font-size: 13px;">${pt.nama}</div>`);

          el.addEventListener('mouseenter', () => {
            hoverPopup.setLngLat([pt.longitude, pt.latitude]).addTo(map);
          });
          el.addEventListener('mouseleave', () => {
            hoverPopup.remove();
          });

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            setSelectedDinas(pt);
            map.flyTo({
              center: [pt.longitude, pt.latitude],
              zoom: 14.8,
              pitch: 50,
              bearing: -12,
              duration: 1500,
              essential: true
            });
            setIs3D(true);
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([pt.longitude, pt.latitude])
            .addTo(map);

          markersRef.current.push(marker);
        }
      });
    }
  }, [showDinas, dinasPoints, mapLoaded]);

  // 4. GeoJSON Batas Wilayah Rendering (Kabupaten/Kecamatan/Kelurahan)
  useEffect(() => {
    if (!mapInstance.current || !mapLoaded) return;
    const map = mapInstance.current;

    const config = LAYER_CONFIGS[activeLayer];

    const renderGeoJson = (geoJsonData: any) => {
      // Clean up previous GeoJSON source and layers
      if (map.getLayer('area-fill')) map.removeLayer('area-fill');
      if (map.getLayer('area-fill-hover')) map.removeLayer('area-fill-hover');
      if (map.getLayer('area-line')) map.removeLayer('area-line');
      if (map.getSource('area-source')) map.removeSource('area-source');

      // Assign numeric feature IDs for filtering
      geoJsonData.features = geoJsonData.features.map((f: any, idx: number) => ({
        ...f,
        id: idx
      }));

      map.addSource('area-source', {
        type: 'geojson',
        data: geoJsonData
      });

      // Fill Layer (Base)
      map.addLayer({
        id: 'area-fill',
        type: 'fill',
        source: 'area-source',
        paint: {
          'fill-color': config.style.fillColor,
          'fill-opacity': config.style.fillOpacity
        }
      });

      // Hover Fill Layer (Highlighter - replaces feature-state for maximum WebGL compatibility)
      map.addLayer({
        id: 'area-fill-hover',
        type: 'fill',
        source: 'area-source',
        paint: {
          'fill-color': '#e8741c', // Oranye Bappenda
          'fill-opacity': activeLayer === 'kabupaten' ? 0.35 : 0.75
        },
        filter: ['==', ['id'], -1] // Matches nothing initially
      });

      // Border Layer
      map.addLayer({
        id: 'area-line',
        type: 'line',
        source: 'area-source',
        paint: {
          'line-color': config.style.color,
          'line-width': config.style.weight
        }
      });

      // Hover Event Listeners using simple layer filter highlight
      map.on('mousemove', 'area-fill', (e) => {
        if (e.features && e.features.length > 0) {
          map.getCanvas().style.cursor = 'pointer';
          const feature = e.features[0];
          
          if (feature.id !== undefined) {
            map.setFilter('area-fill-hover', ['==', ['id'], feature.id]);
          }

          const props = feature.properties || {};
          let tooltipText = '';
          if (activeLayer === 'kabupaten') {
            tooltipText = props.NKAB || 'KABUPATEN BOGOR';
          } else if (activeLayer === 'kecamatan') {
            tooltipText = props.NKEC || '';
          } else if (activeLayer === 'kelurahan') {
            tooltipText = props.NKEL ? `${props.NKEL} (Kec. ${props.NKEC || ''})` : '';
          }

          if (popupRef.current) {
            popupRef.current
              .setLngLat(e.lngLat)
              .setHTML(`<div style="font-weight:700; color:#1e2a3a; font-family:inherit; font-size:13px; text-transform: capitalize;">${tooltipText.toLowerCase()}</div>`)
              .addTo(map);
          }
        }
      });

      map.on('mouseleave', 'area-fill', () => {
        map.getCanvas().style.cursor = '';
        map.setFilter('area-fill-hover', ['==', ['id'], -1]);
        if (popupRef.current) popupRef.current.remove();
      });

      // Click Zoom-in Layer Bounds Listener
      map.on('click', 'area-fill', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          if (feature.geometry) {
            const bounds = getFeatureBounds(feature.geometry.coordinates);
            map.fitBounds(bounds, { padding: 40, duration: 1200 });
          }
        }
      });

      // Initially fit collection bounds nicely
      const collectionBounds = getCollectionBounds(geoJsonData.features);
      map.fitBounds(collectionBounds, { padding: 25, duration: 1000 });
    };

    // GeoJSON File caching & Fetch loading flow
    const cached = geoJsonCacheRef.current[activeLayer];
    if (cached) {
      renderGeoJson(cached);
    } else {
      setLoading(true);
      fetch(config.url)
        .then((res) => {
          if (!res.ok) throw new Error('Gagal memuat batas wilayah');
          return res.json();
        })
        .then((data) => {
          geoJsonCacheRef.current[activeLayer] = data;
          renderGeoJson(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(`Gagal memuat batas wilayah ${activeLayer}:`, err);
          setLoading(false);
        });
    }
  }, [activeLayer, mapLoaded]);

  // 3D Angle Camera Toggle
  const toggle3D = () => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;
    if (is3D) {
      map.easeTo({ pitch: 0, bearing: 0, duration: 1200 });
      setIs3D(false);
    } else {
      map.easeTo({ pitch: 55, bearing: -15, duration: 1200 });
      setIs3D(true);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px', background: '#F1F5F9', borderRadius: '14px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
      {/* Floating Basemap Selector */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 999, display: 'flex', alignItems: 'center', background: '#ffffff', padding: '4px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)', gap: '4px' }}>
        {[
          { key: 'default', label: 'Default' },
          { key: 'streets', label: 'Jalan' },
          { key: 'satellite', label: 'Satelit' }
        ].map((item) => {
          const isActive = basemap === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setBasemap(item.key as any)}
              style={{
                border: 'none',
                background: isActive ? '#0028B3' : 'transparent',
                color: isActive ? '#ffffff' : '#475569',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Loading GeoJSON spinner */}
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.75)', zIndex: 1000, transition: 'all 0.3s ease' }}>
          <div style={{ width: '32px', height: '32px', border: '3.5px solid #E2E8F0', borderTopColor: '#0028B3', borderRadius: '50%', animation: 'maplibre-spin 0.8s linear infinite' }} />
          <span style={{ fontSize: '12.5px', color: '#0028B3', fontWeight: 600 }}>Memuat batas wilayah...</span>
          <style>{`
            @keyframes maplibre-spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}

      {/* Floating Layer Selector */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 999, display: 'flex', alignItems: 'center', background: '#ffffff', padding: '4px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)', gap: '4px' }}>
        {(Object.keys(LAYER_CONFIGS) as LayerType[]).map((key) => {
          const isActive = activeLayer === key;
          return (
            <button
              key={key}
              onClick={() => setActiveLayer(key)}
              style={{
                border: 'none',
                background: isActive ? '#0028B3' : 'transparent',
                color: isActive ? '#ffffff' : '#475569',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {LAYER_CONFIGS[key].label}
            </button>
          );
        })}

        <div style={{ width: '1px', height: '20px', background: '#E2E8F0', margin: '0 4px' }} />

        {/* Instansi Marker toggle */}
        <button
          onClick={() => setShowDinas(!showDinas)}
          style={{
            border: 'none',
            background: showDinas ? '#e8741c' : 'transparent',
            color: showDinas ? '#ffffff' : '#475569',
            padding: '7px 14px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '13px', height: '13px' }}>
            <circle cx="12" cy="10" r="3" />
            <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" />
          </svg>
          Kantor Instansi
        </button>
      </div>

      {/* Selected Dinas Floating Detail Card */}
      {selectedDinas && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          right: '50px',
          maxWidth: '340px',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
          border: '1px solid #E2E8F0',
          padding: '12px 14px',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          animation: 'dinas-fade-in 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              background: '#FEF3C7',
              color: '#D97706',
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.3px'
            }}>{selectedDinas.singkatan || 'KANTOR'}</span>
            <button 
              onClick={() => setSelectedDinas(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: 1,
                padding: '0 4px',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </div>
          <h4 style={{ margin: '2px 0 0 0', fontSize: '13.5px', fontWeight: 700, color: '#1e2a3a', lineHeight: 1.4 }}>
            {selectedDinas.nama}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '11px', marginTop: '2px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '12px', height: '12px', flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
            </svg>
            <span>Kompleks Pemda Cibinong</span>
          </div>
          <style>{`
            @keyframes dinas-fade-in {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      {/* Maplibre container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* 3D Mode Camera Toggle Circle Button */}
      <button
        onClick={toggle3D}
        style={{
          position: 'absolute',
          bottom: '76px',
          right: '10px',
          zIndex: 999,
          background: is3D ? '#0028B3' : '#ffffff',
          color: is3D ? '#ffffff' : '#475569',
          border: 'none',
          borderRadius: '50%',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        title="Tingkatkan sudut pandang (3D)"
      >
        <span style={{ fontSize: '11.5px', fontWeight: '800' }}>3D</span>
      </button>

      {/* CSS Overrides for Maplibre components */}
      <style>{`
        /* Maplibre Tooltip design override */
        .custom-tooltip-popup .maplibregl-popup-content {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: #1e2a3a !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          pointer-events: none !important;
          padding: 0 !important;
          text-shadow: 
            -1.5px -1.5px 0 #ffffff,  
             1.5px -1.5px 0 #ffffff,
            -1.5px  1.5px 0 #ffffff,
             1.5px  1.5px 0 #ffffff,
             0px 2px 4px rgba(0,0,0,0.15) !important;
        }
        .custom-tooltip-popup .maplibregl-popup-tip {
          display: none !important;
        }

        /* Hover animation for premium marker pins */
        .custom-dinas-marker:hover .premium-dinas-pin {
          transform: scale(1.18) !important;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25) !important;
        }
      `}</style>
    </div>
  );
}
