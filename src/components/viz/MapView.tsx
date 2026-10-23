import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

type LatLngTuple = [number, number];

export interface MapViewProps {
  layers: Array<'plates' | 'land' | string>;
  view?: 'world' | 'indonesia' | { bounds: [LatLngTuple, LatLngTuple] };
  dataset: string[];
  height?: string;
}

const SUMBER_DATA: Record<string, string> = {
  plates: '/data/plates.geojson',
  land: '/data/land.geojson',
};

const LABEL_LAYER: Record<string, string> = {
  plates: 'Lempeng tektonik',
  land: 'Garis besar daratan',
};

const NAMA_LEMPENG: Record<string, string> = {
  Pacific: 'Lempeng Pasifik',
  'North America': 'Lempeng Amerika Utara',
  'South America': 'Lempeng Amerika Selatan',
  Africa: 'Lempeng Afrika',
  Antarctica: 'Lempeng Antartika',
  Eurasia: 'Lempeng Eurasia',
  Australia: 'Lempeng Australia',
  India: 'Lempeng India',
  'Philippine Sea': 'Lempeng Laut Filipina',
  'Banda Sea': 'Lempeng Laut Banda',
  'Molucca Sea': 'Lempeng Laut Maluku',
  'Birds Head': 'Lempeng Kepala Burung',
  "Bird's Head": 'Lempeng Kepala Burung',
  Maoke: 'Lempeng Maoke',
  Sunda: 'Lempeng Sunda',
  Burma: 'Lempeng Burma',
  Yangtze: 'Lempeng Yangtze',
  Okhotsk: 'Lempeng Okhotsk',
  Amur: 'Lempeng Amur',
  Nazca: 'Lempeng Nazca',
  Cocos: 'Lempeng Cocos',
  Caribbean: 'Lempeng Karibia',
  Arabian: 'Lempeng Arab',
  Somali: 'Lempeng Somalia',
  Nubian: 'Lempeng Nubia',
  Scotia: 'Lempeng Scotia',
  Anatolia: 'Lempeng Anatolia',
  'Aegean Sea': 'Lempeng Laut Aegea',
  Timor: 'Lempeng Timor',
  Caroline: 'Lempeng Caroline',
  Mariana: 'Lempeng Mariana',
  Manus: 'Lempeng Manus',
  'North Bismarck': 'Lempeng Bismarck Utara',
  'South Bismarck': 'Lempeng Bismarck Selatan',
  'Solomon Sea': 'Lempeng Laut Solomon',
  Woodlark: 'Lempeng Woodlark',
  Tonga: 'Lempeng Tonga',
  Kermadec: 'Lempeng Kermadec',
  "Niuafo'ou": "Lempeng Niuafo'ou",
  Futuna: 'Lempeng Futuna',
  Easter: 'Lempeng Paskah',
  'Juan Fernandez': 'Lempeng Juan Fernandez',
  Galapagos: 'Lempeng Galapagos',
  Sandwich: 'Lempeng Sandwich',
  Panama: 'Lempeng Panama',
  Rivera: 'Lempeng Rivera',
  'Juan de Fuca': 'Lempeng Juan de Fuca',
  Explorer: 'Lempeng Explorer',
  Gorda: 'Lempeng Gorda',
};

const WARNA = [
  '#3b8fd9',
  '#e0803a',
  '#3aa987',
  '#b45fc4',
  '#d9b53b',
  '#d95a7a',
  '#6b7fd9',
  '#5fae3f',
  '#c9744f',
  '#2fa0b8',
];

const BOUNDS: Record<'world' | 'indonesia', [LatLngTuple, LatLngTuple]> = {
  world: [
    [-58, -172],
    [80, 178],
  ],
  indonesia: [
    [-13, 94],
    [10, 143],
  ],
};

interface DaftarItem {
  nama: string;
  kode: string;
  index: number;
}

function gayaLayer(key: string, fitur: any) {
  if (key === 'land') {
    const gaya = getComputedStyle(document.documentElement);
    return {
      className: 'mv-land',
      color: gaya.getPropertyValue('--coast').trim() || '#7e9ca5',
      weight: 0.8,
      fillColor: gaya.getPropertyValue('--land').trim() || '#f1f4ec',
      fillOpacity: 1,
    };
  }
  const i = fitur?.properties?.__index ?? 0;
  return {
    className: 'mv-plate',
    color: WARNA[i % WARNA.length],
    weight: 1,
    fillColor: WARNA[i % WARNA.length],
    fillOpacity: 0.26,
  };
}

function pakaiReduce() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export default function MapView({
  layers,
  view = 'world',
  dataset,
  height = 'clamp(320px, 52vw, 480px)',
}: MapViewProps) {
  const wadahRef = useRef<HTMLDivElement | null>(null);
  const petaRef = useRef<any>(null);
  const grupRef = useRef<Record<string, any>>({});
  const lapisanRef = useRef<Record<number, any>>({});
  const [status, setStatus] = useState<'memuat' | 'siap' | 'gagal'>('memuat');
  const [aktif, setAktif] = useState<string[]>(layers);
  const [info, setInfo] = useState<{ judul: string; ket: string } | null>(null);
  const [mode, setMode] = useState<'world' | 'indonesia'>(
    typeof view === 'string' ? view : 'world',
  );
  const [geser, setGeser] = useState(false);
  const [daftar, setDaftar] = useState<DaftarItem[]>([]);

  useEffect(() => {
    let dibatalkan = false;
    let pengamat: MutationObserver | undefined;

    async function mulai() {
      if (!wadahRef.current || petaRef.current) return;
      const L = (await import('leaflet')).default;
      if (dibatalkan || !wadahRef.current) return;

      const sentuh = window.matchMedia('(hover: none)').matches;
      const peta = L.map(wadahRef.current, {
        crs: L.CRS.EPSG4326,
        center: [0, 20],
        zoom: 1,
        minZoom: 0,
        maxZoom: 6,
        zoomControl: true,
        scrollWheelZoom: false,
        dragging: !sentuh,
        touchZoom: true,
        doubleClickZoom: true,
        attributionControl: true,
        zoomAnimation: !pakaiReduce(),
        fadeAnimation: !pakaiReduce(),
      });

      peta.attributionControl.setPrefix(false);
      peta.attributionControl.addAttribution(
        'Batas lempeng PB2002 (Bird, 2003) · Daratan: Natural Earth',
      );
      petaRef.current = peta;

      peta.on('click', () => {
        if (!sentuh) peta.scrollWheelZoom.enable();
      });
      const matikanScroll = () => peta.scrollWheelZoom.disable();
      wadahRef.current.addEventListener('mouseleave', matikanScroll);

      let terpasang = 0;
      const itemDaftar: DaftarItem[] = [];

      for (const key of layers) {
        const url = SUMBER_DATA[key];
        if (!url) continue;
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
          const geojson = await res.json();
          if (dibatalkan) return;

          if (key === 'plates' && Array.isArray(geojson.features)) {
            geojson.features.forEach((fitur: any, i: number) => {
              if (fitur.properties) fitur.properties.__index = i;
            });
          }

          const grup = L.layerGroup();

          L.geoJSON(geojson, {
            interactive: key === 'plates',
            style: (fitur: any) => gayaLayer(key, fitur),
            onEachFeature: (fitur: any, lapisan: any) => {
              const nama = fitur?.properties?.name ?? 'Tanpa nama';
              const kode = fitur?.properties?.code ?? '';
              const judul = NAMA_LEMPENG[nama] ?? nama;
              lapisan.bindTooltip(judul, { direction: 'auto', sticky: true });
              const kok = { judul, ket: kode ? `Kode PB2002: ${kode}` : 'Bagian dari model PB2002' };
              lapisan.on('click', (e: any) => {
                L.DomEvent.stopPropagation(e);
                setInfo(kok);
              });
              const index = fitur?.properties?.__index;
              if (typeof index === 'number') lapisanRef.current[index] = lapisan;
            },
          }).eachLayer((lapisan: any) => {
            grup.addLayer(lapisan);
          });

          grupRef.current[key] = grup;
          grup.addTo(peta);
          terpasang += 1;

          if (key === 'plates') {
            grup.eachLayer((lapisan: any) => {
              const index = lapisan.feature?.properties?.__index;
              if (typeof index !== 'number') return;
              const nama = lapisan.feature.properties.name ?? '';
              const judul = NAMA_LEMPENG[nama] ?? nama;
              lapisan.getElement()?.setAttribute('title', judul);
              itemDaftar.push({
                nama: judul,
                kode: lapisan.feature.properties.code ?? '',
                index,
              });
            });
            itemDaftar.sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
            setDaftar(itemDaftar);
          }
        } catch (err) {
          console.error('Gagal memuat layer peta', key, err);
          setStatus('gagal');
        }
      }

      // Keep the map palette in step with the light/dark theme.
      pengamat = new MutationObserver(() => {
        for (const [key, grup] of Object.entries(grupRef.current)) {
          grup.eachLayer((lapisan: any) => {
            if (lapisan.feature && typeof lapisan.setStyle === 'function') {
              lapisan.setStyle(gayaLayer(key, lapisan.feature));
            }
          });
        }
      });
      pengamat.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });

      setStatus(terpasang > 0 ? 'siap' : 'gagal');
      peta.fitBounds(BOUNDS[typeof view === 'string' ? view : 'world'], { animate: false });
      setTimeout(() => peta.invalidateSize(), 80);
    }

    mulai().catch((err) => {
      console.error(err);
      setStatus('gagal');
    });

    return () => {
      dibatalkan = true;
      pengamat?.disconnect();
      if (petaRef.current) {
        petaRef.current.remove();
        petaRef.current = null;
      }
      grupRef.current = {};
      lapisanRef.current = {};
    };
    // Layer set and initial view are fixed for one mounted map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pilihLayer(key: string) {
    const peta = petaRef.current;
    const grup = grupRef.current[key];
    if (!peta || !grup) return;
    if (aktif.includes(key)) {
      peta.removeLayer(grup);
      setAktif((prev) => prev.filter((k) => k !== key));
    } else {
      grup.addTo(peta);
      setAktif((prev) => [...prev, key]);
    }
  }

  function pindah(target: 'world' | 'indonesia') {
    const peta = petaRef.current;
    if (!peta) return;
    setMode(target);
    setInfo(null);
    peta.fitBounds(BOUNDS[target], { animate: !pakaiReduce() });
  }

  function fokusLempeng(item: DaftarItem) {
    const peta = petaRef.current;
    const lapisan = lapisanRef.current[item.index];
    if (!peta || !lapisan) return;
    peta.fitBounds(lapisan.getBounds(), { maxZoom: 4, animate: !pakaiReduce() });
    setInfo({ judul: item.nama, ket: `Kode PB2002: ${item.kode || '—'}` });
    lapisan.openTooltip?.();
  }

  return (
    <div className="mv">
      <div className="mv-toolbar">
        <div className="mv-group" role="group" aria-label="Pilih wilayah">
          <button
            type="button"
            className="btn"
            aria-pressed={mode === 'world'}
            onClick={() => pindah('world')}
          >
            Dunia
          </button>
          <button
            type="button"
            className="btn"
            aria-pressed={mode === 'indonesia'}
            onClick={() => pindah('indonesia')}
          >
            Indonesia
          </button>
        </div>

        <div className="mv-group" role="group" aria-label="Lapisan peta">
          {layers.map((key) => (
            <button
              key={key}
              type="button"
              className="btn"
              aria-pressed={aktif.includes(key)}
              onClick={() => pilihLayer(key)}
            >
              {LABEL_LAYER[key] ?? key}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn mv-drag"
          aria-pressed={geser}
          onClick={() => {
            const peta = petaRef.current;
            if (!peta) return;
            const berikut = !geser;
            setGeser(berikut);
            if (berikut) peta.dragging.enable();
            else peta.dragging.disable();
          }}
        >
          Geser peta
        </button>
      </div>

      <div className="mv-canvas" style={{ height }}>
        <div ref={wadahRef} className="mv-map" aria-label="Peta interaktif lempeng tektonik" />
        {status === 'memuat' && <p className="mv-status">Memuat peta…</p>}
        {status === 'gagal' && (
          <p className="mv-status error">
            Peta tidak bisa dimuat. Daftar lempeng di bawah peta tetap bisa dibaca.
          </p>
        )}
        {info && (
          <div className="mv-info" role="status">
            <p className="mv-info-judul">{info.judul}</p>
            <p className="mv-info-ket">{info.ket}</p>
            <a className="mv-info-sumber" href={`/sumber/#dataset-${dataset[0] ?? ''}`}>
              Lihat sumber data
            </a>
            <button
              type="button"
              className="mv-tutup"
              onClick={() => setInfo(null)}
              aria-label="Tutup panel info"
            >
              Tutup
            </button>
          </div>
        )}
      </div>

      <details className="mv-alt">
        <summary>Daftar lempeng sebagai teks ({daftar.length})</summary>
        <p className="mv-alt-nota">
          Alternatif untuk pembaca layar: tombol di bawah memindahkan peta ke lempeng yang dipilih.
        </p>
        <ul>
          {daftar.map((item) => (
            <li key={item.index}>
              <button type="button" onClick={() => fokusLempeng(item)}>
                {item.nama} <span>{item.kode}</span>
              </button>
            </li>
          ))}
        </ul>
      </details>

      <p className="mv-sumber">
        Data: {dataset.join(', ')}. Peta memakai GeoJSON lokal, tanpa tile pihak ketiga.
      </p>
    </div>
  );
}
