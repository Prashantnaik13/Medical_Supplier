import { useState } from 'react';
import { Crosshair, LocateFixed, MapPin, Minus, Plus, Warehouse } from 'lucide-react';

export default function MapVisual({ locations = [], selectedId, onSelect, className = '' }) {
  const [zoom, setZoom] = useState(1);
  return (
    <div className={`map-visual ${className}`}>
      <div className="map-canvas" style={{ '--map-zoom': zoom }}>
        <svg className="map-streets" viewBox="0 0 800 520" preserveAspectRatio="none" aria-hidden="true">
          <path className="road road-major" d="M-30 320 C115 290 190 250 304 249 S488 310 830 96" />
          <path className="road road-major" d="M118 -20 C184 96 310 104 367 197 S408 344 522 550" />
          <path className="road road-major" d="M-20 120 C178 155 322 60 480 113 S673 234 825 264" />
          <path className="road road-secondary" d="M39 493 C181 376 158 224 252 159 S477 90 607 -8" />
          <path className="road road-secondary" d="M240 -10 C230 103 412 133 452 209 S523 381 810 410" />
          <path className="road road-secondary" d="M-8 435 C181 412 247 325 376 322 S610 374 825 330" />
          <path className="road road-secondary" d="M591 -5 C575 146 661 184 664 302 S621 419 685 530" />
          <path className="road road-water" d="M-10 210 C101 185 148 215 235 202 S395 152 493 177 S701 223 821 168" />
          <path className="road road-park" d="M98 64 C150 20 209 28 231 77 S206 151 141 146 S73 101 98 64Z" />
          <path className="road road-park" d="M552 390 C581 351 637 355 655 395 S620 458 577 447 S527 420 552 390Z" />
        </svg>
        <div className="map-label label-a">PIMPRI-CHINCHWAD</div>
        <div className="map-label label-b">PUNE</div>
        <div className="map-label label-c">BANER</div>
        <div className="map-label label-d">AUNDH</div>
        <div className="map-label label-e">KOTHRUD</div>
        <div className="map-green-area area-one" /><div className="map-green-area area-two" />
        <div className="map-route-line route-one" /><div className="map-route-line route-two" />
        {locations.map((location) => {
          const active = selectedId === location.id;
          const isHub = location.kind === 'warehouse';
          return <button key={location.id} type="button" className={`map-marker ${isHub ? 'marker-hub' : `marker-${location.kind}`} ${active ? 'marker-active' : ''}`} style={{ left: `${location.x}%`, top: `${location.y}%` }} onClick={() => onSelect?.(location)} aria-label={location.name}>
            <span className="marker-pulse" />{isHub ? <Warehouse size={17} /> : <MapPin size={17} />}
            {active && <span className="map-marker-label">{location.name}</span>}
          </button>;
        })}
        <div className="map-zoom-controls"><button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(1.35, value + 0.1))}><Plus size={16} /></button><button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(0.8, value - 0.1))}><Minus size={16} /></button><button type="button" aria-label="Locate warehouse" onClick={() => { setZoom(1.08); const hub = locations.find((location) => location.kind === 'warehouse'); if (hub) onSelect?.(hub); }}><LocateFixed size={16} /></button></div>
        <div className="map-scale"><Crosshair size={12} /> Map view · Pune service area</div>
      </div>
    </div>
  );
}
