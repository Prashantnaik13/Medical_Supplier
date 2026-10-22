import { Activity, Bandage, HeartPulse, Package, ShieldCheck, Stethoscope, Syringe, Thermometer } from 'lucide-react';

const ART = {
  gloves: { Icon: ShieldCheck, tint: 'art-mint', label: 'NITRILE' },
  mask: { Icon: Package, tint: 'art-sky', label: '3-PLY' },
  thermometer: { Icon: Thermometer, tint: 'art-peach', label: 'DIGITAL' },
  monitor: { Icon: HeartPulse, tint: 'art-lavender', label: 'CARDIO' },
  gown: { Icon: ShieldCheck, tint: 'art-sage', label: 'STERILE' },
  respirator: { Icon: Package, tint: 'art-lilac', label: 'N95' },
  oximeter: { Icon: Activity, tint: 'art-blue', label: 'SpO₂' },
  bandage: { Icon: Bandage, tint: 'art-sand', label: 'WOUND CARE' },
  syringe: { Icon: Syringe, tint: 'art-peach', label: 'STERILE' },
  stethoscope: { Icon: Stethoscope, tint: 'art-sage', label: 'CLINICIAN' },
  sanitiser: { Icon: Package, tint: 'art-mint', label: '70% ALC.' },
  infrared: { Icon: Thermometer, tint: 'art-lilac', label: 'CONTACT-FREE' },
};

export default function ProductArt({ type = 'package', className = '' }) {
  const { Icon, tint, label } = ART[type] || { Icon: Package, tint: 'art-mint', label: 'MEDICAL' };
  return (
    <div className={`product-art ${tint} ${className}`} aria-hidden="true">
      <span className="art-orbit art-orbit-one" />
      <span className="art-orbit art-orbit-two" />
      <span className="art-label">{label}</span>
      <Icon className="product-art-icon" size={48} strokeWidth={1.25} />
      <span className="art-cross">+</span>
    </div>
  );
}
