import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { assetUrl } from '../../utils/url';

type LayerType = 'kabupaten' | 'kecamatan' | 'kelurahan';

const LAYER_OPTIONS: { key: LayerType; label: string }[] = [
  { key: 'kabupaten', label: 'Kabupaten' },
  { key: 'kecamatan', label: 'Kecamatan' },
  { key: 'kelurahan', label: 'Kelurahan/Desa' },
];

const getLayerConfig = (type: LayerType) => {
  switch (type) {
    case 'kabupaten':
      return { url: assetUrl('/admin_kab.json'), label: 'Kabupaten', style: { color: '#001178', weight: 3, fillColor: '#0028B3', fillOpacity: 0.12 } };
    case 'kecamatan':
      return { url: assetUrl('/admin_kec.json'), label: 'Kecamatan', style: { color: '#001178', weight: 1.5, fillColor: '#0028B3', fillOpacity: 0.12 } };
    case 'kelurahan':
      return { url: assetUrl('/admin_kel.json'), label: 'Kelurahan/Desa', style: { color: '#001178', weight: 1, fillColor: '#0028B3', fillOpacity: 0.12 } };
  }
};

const TILES = {
  default: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  streets: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

const PIN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 68" width="36" height="44">
  <path d="M28 2C16.4 2 7 11.4 7 23 7 38.5 28 66 28 66S49 38.5 49 23C49 11.4 39.6 2 28 2Z" fill="#E53935"/>
  <circle cx="28" cy="23" r="12" fill="white"/>
  <circle cx="28" cy="23" r="6" fill="#E53935"/>
</svg>`;

const getGovPointStyle = (name: string) => {
  if (name.includes('Bupati'))    return { color: '#92400E', fillColor: '#F59E0B', label: 'Bupati' };
  if (name.includes('Camat'))     return { color: '#1E3A8A', fillColor: '#3B82F6', label: 'Kecamatan' };
  if (name.includes('Kelurahan')) return { color: '#5B21B6', fillColor: '#8B5CF6', label: 'Kelurahan' };
  return                                 { color: '#065F46', fillColor: '#10B981', label: 'Desa' };
};


export default function BogorMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const tileLayer = useRef<L.TileLayer | null>(null);
  const geoLayer = useRef<L.GeoJSON | null>(null);
  const govMarkerGroup = useRef<L.FeatureGroup | null>(null);
  const cache = useRef<Record<string, any>>({});

  const [activeLayer, setActiveLayer] = useState<LayerType>('kabupaten');
  const [basemap, setBasemap] = useState<keyof typeof TILES>('default');
  const [showGovPoints, setShowGovPoints] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedGovPoint, setSelectedGovPoint] = useState<any>(null);



  // ── EFFECT 1: Init map (runs once on mount) ─────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapInstance) return;

    const m = L.map(containerRef.current, {
      center: [-6.4831, 106.8288],
      zoom: 10,
      zoomControl: false,
      scrollWheelZoom: false,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(m);

    tileLayer.current = L.tileLayer(TILES.default, { subdomains: 'abc', maxZoom: 20, maxNativeZoom: 19 }).addTo(m);
    govMarkerGroup.current = L.featureGroup().addTo(m);
    setMapInstance(m);


    return () => { m.remove(); setMapInstance(null); };
  }, []);


  // ── EFFECT 2: GeoJSON batas wilayah ────────────────────────────────────
  useEffect(() => {
    if (!mapInstance) return;
    const m = mapInstance;
    const cfg = getLayerConfig(activeLayer);

    const render = (data: any) => {
      if (geoLayer.current) { m.removeLayer(geoLayer.current); }

      geoLayer.current = L.geoJSON(data, {
        style: () => cfg.style as L.PathOptions,
        onEachFeature: (feature, layer) => {
          const p = feature.properties || {};
          const name =
            activeLayer === 'kabupaten' ? p.NKAB :
              activeLayer === 'kecamatan' ? p.NKEC :
                p.NKEL ? `${p.NKEL} (Kec. ${p.NKEC || ''})` : '';

          (layer as L.Path).on({
            mouseover(e) {
              (e.target as L.Path).setStyle({ fillColor: '#e8741c', fillOpacity: activeLayer === 'kabupaten' ? 0.35 : 0.75 });
              (e.target as L.Path).bindTooltip(
                `<b style="font-size:12px;color:#1e2a3a;">${String(name).toLowerCase()}</b>`,
                { sticky: true, className: 'bmap-tip' }
              ).openTooltip((e as L.LeafletMouseEvent).latlng);
            },
            mouseout(e) {
              geoLayer.current?.resetStyle(e.target);
              (e.target as L.Path).closeTooltip();
            },
            click() {
              m.fitBounds((layer as L.Polygon).getBounds(), { padding: [40, 40] });
            },
          });
        },
      }).addTo(m);

      if (govMarkerGroup.current) govMarkerGroup.current.bringToFront();

      try { const b = geoLayer.current.getBounds(); if (b.isValid()) m.fitBounds(b, { padding: [20, 20] }); } catch (_) { }
      setLoading(false);
    };

    if (cache.current[activeLayer]) { render(cache.current[activeLayer]); return; }

    setLoading(true);
    fetch(cfg.url)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { cache.current[activeLayer] = d; render(d); })
      .catch(e => { console.error('GeoJSON load error:', e); setLoading(false); });
  }, [mapInstance, activeLayer]);

  // ── EFFECT 3: Basemap switch ────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstance || !tileLayer.current) return;
    mapInstance.removeLayer(tileLayer.current);
    tileLayer.current = L.tileLayer(TILES[basemap], { subdomains: 'abc', maxZoom: 20, maxNativeZoom: 19 }).addTo(mapInstance);
    tileLayer.current.bringToBack();
  }, [mapInstance, basemap]);

  // ── EFFECT 4: Gov points (CSV) ──────────────────────────────────────────

  useEffect(() => {
    if (!mapInstance || !govMarkerGroup.current) return;
    const m = mapInstance;
    const g = govMarkerGroup.current;
    g.clearLayers();
    if (!showGovPoints) return;

    fetch(assetUrl('/app_md_mapgovpoint.csv'))
      .then(r => {

        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(text => {
        const lines = text.split(/\r?\n/);
        const cleanQuotes = (str: string) => str.replace(/^["\s]+|["\s]+$/g, '');
        let count = 0;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const parts = line.split(';');
          if (parts.length < 4) continue;

          const name = cleanQuotes(parts[0]);
          const addr = cleanQuotes(parts[1]);
          const lat = parseFloat(cleanQuotes(parts[2]));
          const long = parseFloat(cleanQuotes(parts[3]));

          if (isNaN(lat) || isNaN(long)) continue;

          const pt = { name, addr, lat, long };
          const style = getGovPointStyle(name);
          const isBupati = name.includes('Bupati');

          L.circleMarker([lat, long], {
            radius: isBupati ? 8 : 6,
            fillColor: style.fillColor,
            color: style.color,
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9,
          })
            .bindTooltip(
              name,
              {
                permanent: false,
                direction: 'top',
                offset: [0, -8],
                className: 'gov-label'
              }
            )
            .on('mouseover', (e) => {
              setSelectedGovPoint(pt);
              (e.target as L.CircleMarker).setStyle({ radius: isBupati ? 11 : 9, weight: 3, fillOpacity: 1 });
            })

            .on('mouseout', (e) => {
              (e.target as L.CircleMarker).setStyle({ radius: isBupati ? 8 : 6, weight: 2, fillOpacity: 0.9 });
            })
            .on('click', () => {
              setSelectedGovPoint(pt);
              m.flyTo([lat, long], 15, { duration: 1.5 });
            })
            .addTo(g);

          count++;
        }
        console.log(`[BogorMap] GovPoints loaded: ${count} markers`);
      })
      .catch(e => {
        console.error('GovPoints CSV load error:', e);
      });
  }, [mapInstance, showGovPoints]);

  // ── JSX ─────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        width: '100%',
        height: '520px',
        borderRadius: '14px',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
      }}
    >

      {/* Basemap buttons */}
      <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 999, display: 'flex', background: '#fff', padding: '4px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', gap: '2px' }}>
        {(['default', 'streets', 'satellite'] as const).map(k => (
          <button key={k} onClick={() => setBasemap(k)} style={{ border: 'none', background: basemap === k ? '#0028B3' : 'transparent', color: basemap === k ? '#fff' : '#475569', padding: '6px 13px', fontSize: '12px', fontWeight: 600, borderRadius: '7px', cursor: 'pointer', transition: 'all .18s' }}>
            {k === 'default' ? 'Default' : k === 'streets' ? 'Jalan' : 'Satelit'}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'rgba(255,255,255,0.8)', zIndex: 1000 }}>
          <div style={{ width: '30px', height: '30px', border: '3px solid #E2E8F0', borderTopColor: '#0028B3', borderRadius: '50%', animation: 'bspin .8s linear infinite' }} />
          <span style={{ fontSize: '12px', color: '#0028B3', fontWeight: 600 }}>Memuat batas wilayah…</span>
          <style>{`@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Layer & gov points buttons */}
      <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 999, display: 'flex', alignItems: 'center', background: '#fff', padding: '4px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', gap: '2px' }}>
        {LAYER_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setActiveLayer(opt.key)}
            style={{
              border: 'none',
              background: activeLayer === opt.key ? '#0028B3' : 'transparent',
              color: activeLayer === opt.key ? '#fff' : '#475569',
              padding: '6px 13px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '7px',
              cursor: 'pointer',
              transition: 'all .18s',
            }}
          >
            {opt.label}
          </button>
        ))}
        <div style={{ width: '1px', height: '18px', background: '#E2E8F0', margin: '0 2px' }} />
        <button onClick={() => setShowGovPoints(v => !v)} style={{ border: 'none', background: showGovPoints ? '#059669' : 'transparent', color: showGovPoints ? '#fff' : '#475569', padding: '6px 13px', fontSize: '12px', fontWeight: 600, borderRadius: '7px', cursor: 'pointer', transition: 'all .18s', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          Titik Pelayanan
        </button>
      </div>




      {/* Selected GovPoint card */}
      {selectedGovPoint && (() => {
        const s = getGovPointStyle(selectedGovPoint.name);
        return (
          <div style={{ position: 'absolute', bottom: '14px', left: '14px', maxWidth: '340px', background: '#fff', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.13)', border: '1px solid #E2E8F0', padding: '14px 16px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ 
                background: selectedGovPoint.name.includes('Bupati') ? '#FEF3C7' : selectedGovPoint.name.includes('Camat') ? '#DBEAFE' : selectedGovPoint.name.includes('Kelurahan') ? '#F3E8FF' : '#D1FAE5', 
                color: s.color, 
                fontSize: '10px', 
                fontWeight: 700, 
                padding: '3px 10px', 
                borderRadius: '4px', 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {s.label}
              </span>
              <button onClick={() => setSelectedGovPoint(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '18px', padding: '0 2px', lineHeight: 1 }}>×</button>
            </div>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1e2a3a', lineHeight: 1.4 }}>{selectedGovPoint.name}</h4>
            <span style={{ fontSize: '11.5px', color: '#64748B', lineHeight: 1.5 }}>{selectedGovPoint.addr}</span>
          </div>
        );
      })()}



      {/* Map container – must NOT have overflow:hidden on parent for Leaflet to size correctly */}
      <div ref={containerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      <style>{`
        .leaflet-tooltip.bmap-tip,
        .bmap-tip {
          background: rgba(255, 255, 255, 0.98) !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12) !important;
          padding: 6px 12px !important;
          font-family: inherit !important;
          pointer-events: none !important;
          white-space: nowrap !important;
          max-width: none !important;
          width: max-content !important;
          display: inline-block !important;
          box-sizing: border-box !important;
          line-height: normal !important;
        }
        .bmap-tip::before, .bmap-tip:before { display: none !important; }

        .leaflet-tooltip.gov-label,
        .gov-label {
          background: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12) !important;
          border-radius: 8px !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          color: #1e293b !important;
          padding: 6px 12px !important;
          pointer-events: none !important;
          white-space: nowrap !important;
          max-width: none !important;
          width: max-content !important;
          display: inline-block !important;
          box-sizing: border-box !important;
          line-height: normal !important;
        }
        .gov-label::before, .gov-label:before { display: none !important; }

        .leaflet-marker-icon, .leaflet-marker-shadow { background: transparent !important; border: none !important; }
      `}</style>
    </div>
  );
}

