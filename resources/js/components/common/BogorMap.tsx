import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

type LayerType = 'kabupaten' | 'kecamatan' | 'kelurahan';

const LAYER_CONFIGS = {
  kabupaten: {
    url: '/admin_kab.json',
    nameField: 'NKAB',
    label: 'Kabupaten',
    style: {
      fillColor: '#1e7d3a',
      weight: 3,
      opacity: 1,
      color: '#145c2a',
      fillOpacity: 0.15,
    }
  },
  kecamatan: {
    url: '/admin_kec.json',
    nameField: 'NKEC',
    label: 'Kecamatan',
    style: {
      fillColor: '#1e7d3a',
      weight: 1.5,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: 0.4,
    }
  },
  kelurahan: {
    url: '/admin_kel.json',
    nameField: 'NKEL',
    label: 'Kelurahan/Desa',
    style: {
      fillColor: '#1e7d3a',
      weight: 1,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: 0.5,
    }
  }
};

export default function BogorMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const currentGeoJsonLayer = useRef<L.GeoJSON | null>(null);
  const markersLayerGroup = useRef<L.LayerGroup | null>(null);
  
  const [activeLayer, setActiveLayer] = useState<LayerType>('kabupaten');
  const [loading, setLoading] = useState(false);
  const [cachedData, setCachedData] = useState<Record<string, any>>({});
  
  const [dinasPoints, setDinasPoints] = useState<any[]>([]);
  const [showDinas, setShowDinas] = useState(true);
  const [selectedDinas, setSelectedDinas] = useState<any | null>(null);

  // 1. Inisialisasi Peta & Ambil Data Titik Dinas (Hanya Sekali)
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    leafletMap.current = L.map(mapRef.current, {
      center: [-6.5971, 106.7996],
      zoom: 10,
      zoomControl: false,
    });

    // Tambah Zoom Control di kanan bawah agar tidak tertutup menu layer terapung
    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);

    // Peta Dasar (Tile Layer) - CartoDB Positron (terang/minimalis)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(leafletMap.current);

    // Inisialisasi Layer Group untuk penanda titik dinas
    markersLayerGroup.current = L.layerGroup().addTo(leafletMap.current);

    // Fetch data titik kedinasan
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

    // Cleanup saat unmount
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // 2. Effect untuk me-render Marker Titik Dinas (Setiap kali data/toggle berubah)
  useEffect(() => {
    if (!leafletMap.current || !markersLayerGroup.current) return;

    // Bersihkan marker sebelumnya
    markersLayerGroup.current.clearLayers();

    if (showDinas && dinasPoints.length > 0) {
      // Buat penanda kustom berbentuk lingkaran dengan gambar rumah
      dinasPoints.forEach((pt) => {
        if (pt.latitude && pt.longitude) {
          const dinasIcon = L.divIcon({
            html: `
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
            `,
            className: 'custom-dinas-marker',
            iconSize: [42, 42],
            iconAnchor: [21, 21],
            popupAnchor: [0, -21]
          });

          const marker = L.marker([pt.latitude, pt.longitude], { icon: dinasIcon });
          
          // Tampilkan nama dinas melayang secara transparan saat kursor berada di atas ikon rumah (hover)
          marker.bindTooltip(pt.nama, {
            sticky: true,
            direction: 'top',
            className: 'custom-tooltip'
          });

          // Event klik marker zoom-in ke titik tersebut (Tanpa memicu zoom out wilayah GeoJSON di bawahnya, dan Tanpa popup)
          marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e); // Mencegah event bubbling ke GeoJSON layer
            setSelectedDinas(pt); // Memperbarui state dinas terpilih untuk info panel mengambang
            const currentZoom = leafletMap.current?.getZoom() || 10;
            const targetZoom = Math.max(currentZoom, 15); // Jangan kurangi zoom jika sudah zoom-in lebih dalam
            leafletMap.current?.setView([pt.latitude, pt.longitude], targetZoom);
          });

          markersLayerGroup.current?.addLayer(marker);
        }
      });
    }
  }, [showDinas, dinasPoints]);

  // 3. Effect untuk memuat dan menggambar layer batas wilayah GeoJSON aktif
  useEffect(() => {
    if (!leafletMap.current) return;

    const config = LAYER_CONFIGS[activeLayer];

    // Hapus layer GeoJSON sebelumnya jika ada
    if (currentGeoJsonLayer.current) {
      leafletMap.current.removeLayer(currentGeoJsonLayer.current);
      currentGeoJsonLayer.current = null;
    }

    const renderGeoJson = (geoJsonData: any) => {
      if (!leafletMap.current) return;

      const layer = L.geoJSON(geoJsonData, {
        style: () => ({ ...config.style }),
        onEachFeature: (feature, layerInstance) => {
          // Penentuan teks tooltip (hanya nama polos & info kecamatan untuk kelurahan)
          let tooltipText = '';
          const props = feature.properties || {};
          if (activeLayer === 'kabupaten') {
            tooltipText = props.NKAB || 'KABUPATEN BOGOR';
          } else if (activeLayer === 'kecamatan') {
            tooltipText = props.NKEC || '';
          } else if (activeLayer === 'kelurahan') {
            // Tampilkan nama kelurahan beserta kecamatan induknya
            tooltipText = props.NKEL ? `${props.NKEL} (Kec. ${props.NKEC || ''})` : '';
          }

          layerInstance.bindTooltip(tooltipText, {
            sticky: true,
            direction: 'top',
            className: 'custom-tooltip'
          });

          // Efek Interaktif (Hover & Click)
          layerInstance.on({
            mouseover: (e) => {
              const target = e.target;
              target.setStyle({
                fillColor: '#e8741c', // Oranye/Emas Bappenda saat hover
                fillOpacity: activeLayer === 'kabupaten' ? 0.3 : 0.75,
                weight: activeLayer === 'kabupaten' ? 3.5 : 2,
                color: activeLayer === 'kabupaten' ? '#c75f10' : '#ffffff',
              });
              target.bringToFront();
            },
            mouseout: (e) => {
              layer.resetStyle(e.target);
            },
            click: (e) => {
              // Zoom ke bounds wilayah bersangkutan
              leafletMap.current?.fitBounds(e.target.getBounds(), { padding: [10, 10] });
            }
          });
        }
      }).addTo(leafletMap.current);

      currentGeoJsonLayer.current = layer;

      // Fit peta ke batas wilayah layer yang aktif
      leafletMap.current.fitBounds(layer.getBounds(), { padding: [20, 20] });
    };

    // Gunakan cache jika data sudah pernah diunduh
    if (cachedData[activeLayer]) {
      renderGeoJson(cachedData[activeLayer]);
    } else {
      setLoading(true);
      fetch(config.url)
        .then((res) => {
          if (!res.ok) throw new Error('Gagal memuat file wilayah');
          return res.json();
        })
        .then((data) => {
          setCachedData((prev) => ({ ...prev, [activeLayer]: data }));
          renderGeoJson(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(`Gagal memuat layer ${activeLayer}:`, err);
          setLoading(false);
        });
    }
  }, [activeLayer, cachedData]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px', background: '#F1F5F9', borderRadius: '14px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
      {/* Loading Indicator */}
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.75)', zIndex: 1000, transition: 'all 0.3s ease' }}>
          <div style={{ width: '32px', height: '32px', border: '3.5px solid #E2E8F0', borderTopColor: '#1e7d3a', borderRadius: '50%', animation: 'map-spin 0.8s linear infinite' }} />
          <span style={{ fontSize: '12.5px', color: '#1e7d3a', fontWeight: 600 }}>Memuat batas wilayah...</span>
          <style>{`
            @keyframes map-spin { to { transform: rotate(360deg); } }
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
                background: isActive ? '#1e7d3a' : 'transparent',
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

        {/* Separator line */}
        <div style={{ width: '1px', height: '20px', background: '#E2E8F0', margin: '0 4px' }} />

        {/* Dinas Toggle Button */}
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
          Kantor Dinas
        </button>
      </div>

      {/* Floating Information Card for Selected Dinas (Clean React Component, no Leaflet positioning bugs) */}
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

      {/* Map Container */}
      <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* Override styling Leaflet untuk custom tooltip & premium popup */}
      <style>{`
        /* 1. Hilangkan background putih & pointer segitiga tooltip */
        .custom-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: #1e2a3a !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          pointer-events: none !important;
          /* Outline putih pembatas teks */
          text-shadow: 
            -1.5px -1.5px 0 #ffffff,  
             1.5px -1.5px 0 #ffffff,
            -1.5px  1.5px 0 #ffffff,
             1.5px  1.5px 0 #ffffff,
             0px 2px 4px rgba(0,0,0,0.15) !important;
        }
        .custom-tooltip::before {
          display: none !important;
        }
        
        /* 2. Animasi hover zoom-in untuk marker dinas kustom */
        .custom-dinas-marker:hover .premium-dinas-pin {
          transform: scale(1.18) !important;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25) !important;
        }
      `}</style>
    </div>
  );
}
