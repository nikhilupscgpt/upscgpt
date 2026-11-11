'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  ShieldAlert,
  TreePine,
  Globe2,
  Scale,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import './env-atlas.css';

const MODULE_CONTAINERS = [
  {
    id: 'species',
    title: 'Species Atlas',
    hindiTitle: 'वन्यजीव आणि प्रजाती',
    icon: '🐅',
    status: 'ACTIVE',
    badgeText: 'Active & Interactive',
    badgeClass: 'badge-active',
    summary: 'High-yield fauna & flora in news, IUCN Red List categories (CR, EN, VU), WPA 1972 Schedule classification, CITES appendices, geographic habitats, and UPSC Prelims confusion traps.',
    features: [
      '50+ High-Yield Species (Tiger, Asiatic Lion, Rhino, GIB, Dugong)',
      'IUCN Status Meter (LC → NT → VU → EN → CR)',
      'Interactive India Habitat Point Map & Co-occurring Species',
      'Mastery Tracker ("I\'ve learnt this")',
    ],
    ctaText: 'Launch Species Atlas',
    href: '/environment/species',
    gradient: 'from-blue-600/20 to-indigo-600/10',
    borderGlow: 'rgba(59, 130, 246, 0.4)',
    accentColor: '#3b82f6',
  },
  {
    id: 'protected-areas',
    title: 'Protected Areas & Biosphere Reserves',
    hindiTitle: 'राष्ट्रीय उद्याने आणि व्याघ्र प्रकल्प',
    icon: '🏞️',
    status: 'UPCOMING',
    badgeText: 'Designing Next',
    badgeClass: 'badge-upcoming',
    summary: 'Comprehensive spatial atlas of National Parks, Tiger Reserves, Wildlife Sanctuaries, Ramsar Wetlands & Biosphere Reserves with river alignments and core-buffer transitions.',
    features: [
      '106 National Parks & 55+ Tiger Reserves mapped state-wise',
      'Rivers flowing through parks (e.g. Ramganga, Ken, Brahmaputra)',
      'Ramsar Wetland sites (85+ sites) with ecological threats',
      'Core vs. Buffer zone spatial boundaries',
    ],
    ctaText: 'UI Under Design',
    href: '#',
    gradient: 'from-emerald-600/10 to-teal-600/5',
    borderGlow: 'rgba(16, 185, 129, 0.2)',
    accentColor: '#10b981',
  },
  {
    id: 'conventions',
    title: 'International Conventions & Treaties',
    hindiTitle: 'आंतरराष्ट्रीय पर्यावरण करार',
    icon: '🌐',
    status: 'UPCOMING',
    badgeText: 'Designing Next',
    badgeClass: 'badge-upcoming',
    summary: 'Global environmental governance: UNFCCC COPs, CBD Kunming-Montreal targets, CITES, CMS Bonn, Ramsar, Stockholm, Basel, and Minamata conventions with legally binding obligations.',
    features: [
      'UNFCCC COPs & India\'s NDC Panchamrit Commitments',
      'CBD & Kunming-Montreal Global Biodiversity Framework (30x30 target)',
      'Chemical & Waste Conventions (Stockholm POPs, Rotterdam PIC, Basel)',
      'Timeline of Protocols & COP Outcomes for Prelims & Mains',
    ],
    ctaText: 'UI Under Design',
    href: '#',
    gradient: 'from-purple-600/10 to-pink-600/5',
    borderGlow: 'rgba(168, 85, 247, 0.2)',
    accentColor: '#a855f7',
  },
  {
    id: 'acts-orgs',
    title: 'Acts, Policies & Statutory Bodies',
    hindiTitle: 'कायदे, धोरणे आणि वैधानिक संस्था',
    icon: '⚖️',
    status: 'UPCOMING',
    badgeText: 'Designing Next',
    badgeClass: 'badge-upcoming',
    summary: 'Statutory framework and environmental jurisprudence: WPA 1972 (2022 Amendment), EPA 1986, Forest Rights Act 2006, NTCA, NBA, Central Pollution Control Board & NGT.',
    features: [
      'WPA 1972: Rationalised 4 Schedules & CITES provisions',
      'Statutory Bodies: NTCA, NBA, CPCB, Animal Welfare Board of India',
      'Forest Rights Act 2006 & PESA 1996 for tribal rights',
      'Constitutional Provisions: Article 48A & 51A(g)',
    ],
    ctaText: 'UI Under Design',
    href: '#',
    gradient: 'from-amber-600/10 to-orange-600/5',
    borderGlow: 'rgba(245, 158, 11, 0.2)',
    accentColor: '#f59e0b',
  },
  {
    id: 'schemes',
    title: 'Conservation Schemes & Missions',
    hindiTitle: 'संवर्धन योजना आणि मोहीम',
    icon: '💡',
    status: 'UPCOMING',
    badgeText: 'Designing Next',
    badgeClass: 'badge-upcoming',
    summary: 'Central sector and centrally sponsored schemes: Project Tiger (50 years milestone), Project Elephant, Project Cheetah (Kuno translocation), CAMPA, and National Clean Air Programme.',
    features: [
      'Project Tiger & Project Elephant merged administration (PM-CCEP)',
      'Project Cheetah & intercontinental cheetah translocation in Kuno',
      'CAMPA (Compensatory Afforestation Fund Act 2016)',
      'National Action Plan on Climate Change (NAPCC - 8 Missions)',
    ],
    ctaText: 'UI Under Design',
    href: '#',
    gradient: 'from-cyan-600/10 to-blue-600/5',
    borderGlow: 'rgba(6, 182, 212, 0.2)',
    accentColor: '#06b6d4',
  },
  {
    id: 'hotspots-news',
    title: 'Biodiversity Hotspots & Current News',
    hindiTitle: 'जैवविविधता हॉटस्पॉट्स आणि चालू घडामोडी',
    icon: '🔥',
    status: 'UPCOMING',
    badgeText: 'Designing Next',
    badgeClass: 'badge-upcoming',
    summary: 'India\'s 4 Biodiversity Hotspots, Western Ghats ecology (Gadgil vs. Kasturirangan report), coral bleaching events, invasive species alerts, and monthly current affairs mapping.',
    features: [
      '4 Hotspots: Western Ghats, Eastern Himalayas, Indo-Burma, Sundaland',
      'Ecologically Sensitive Areas (ESAs) & coastal regulation zones (CRZ)',
      'Invasive Alien Species (Prosopis juliflora, Lantana camara, Water hyacinth)',
      'Prelims Micro-Theme Traps & previous 12-month news integration',
    ],
    ctaText: 'UI Under Design',
    href: '#',
    gradient: 'from-rose-600/10 to-red-600/5',
    borderGlow: 'rgba(244, 63, 94, 0.2)',
    accentColor: '#f43f5e',
  },
];

export default function EnvironmentHubClient() {
  return (
    <div className="env-hub-wrapper">
      {/* Hero Header */}
      <div className="env-hub-header">
        <div className="env-hub-hero-badge">
          <Sparkles size={14} className="text-blue-400" />
          <span>UPSC CSE PRELIMS & MAINS 2025–26</span>
        </div>

        <h1 className="env-hub-title">
          Environment & Ecology <span className="env-gradient-text">Atlas</span>
        </h1>

        <p className="env-hub-subtitle">
          Specialized interactive visual modules designed strictly per UPSC syllabus. 
          Each domain is partitioned into dedicated interfaces tailored for its unique data structures.
        </p>

        {/* Quick Nav Ticker */}
        <div className="env-hub-ticker">
          <div className="env-ticker-item active">
            <span className="env-ticker-dot dot-live" />
            <span>Species Atlas: <strong>50+ High-Yield Species Ready</strong></span>
          </div>
          <div className="env-ticker-divider">•</div>
          <div className="env-ticker-item">
            <span className="env-ticker-dot dot-dev" />
            <span>Protected Areas, Conventions & Acts: <strong>Custom UI In Pipeline</strong></span>
          </div>
        </div>
      </div>

      {/* Domain Containers Grid */}
      <div className="env-hub-grid">
        {MODULE_CONTAINERS.map((mod) => {
          const isActive = mod.status === 'ACTIVE';

          return (
            <div
              key={mod.id}
              className={`env-hub-card ${isActive ? 'card-active' : 'card-upcoming'}`}
              style={{
                '--card-glow': mod.borderGlow,
                '--accent-color': mod.accentColor,
              }}
            >
              {/* Card Header */}
              <div className="env-card-header">
                <div className="env-card-icon-wrap">
                  <span className="env-card-emoji">{mod.icon}</span>
                </div>
                <div className="env-card-header-meta">
                  <span className={`env-status-badge ${mod.badgeClass}`}>
                    {isActive ? (
                      <>
                        <span className="live-ping" />
                        {mod.badgeText}
                      </>
                    ) : (
                      <>
                        <Clock size={11} className="mr-1 inline" />
                        {mod.badgeText}
                      </>
                    )}
                  </span>
                  <span className="env-hindi-label">{mod.hindiTitle}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="env-card-body">
                <h2 className="env-card-title">{mod.title}</h2>
                <p className="env-card-summary">{mod.summary}</p>

                {/* Features List */}
                <div className="env-card-features">
                  {mod.features.map((feat, i) => (
                    <div key={i} className="env-feature-row">
                      <CheckCircle2 size={13} className="env-feature-check" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer / Action */}
              <div className="env-card-footer">
                {isActive ? (
                  <Link href={mod.href} className="env-card-cta-btn cta-active">
                    <span>{mod.ctaText}</span>
                    <ArrowRight size={15} />
                  </Link>
                ) : (
                  <div className="env-card-cta-btn cta-disabled">
                    <span>{mod.ctaText}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
