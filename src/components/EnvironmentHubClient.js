'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Binoculars,
  Globe,
  Scale,
  Sparkles,
  Trees,
} from 'lucide-react';
import './env-atlas.css';

const UPCOMING_SECTIONS = [
  {
    id: 'protected-areas',
    title: 'Protected Areas',
    desc: 'National Parks, Tiger Reserves & Biosphere Reserves by state and river.',
    Icon: Trees,
  },
  {
    id: 'conventions',
    title: 'Conventions & Treaties',
    desc: 'CBD, CITES, Ramsar, CMS, and UNFCCC COP outcomes.',
    Icon: Globe,
  },
  {
    id: 'acts-orgs',
    title: 'Acts & Organisations',
    desc: 'WPA 1972 (2022 Amendment), EPA 1986, NTCA & statutory bodies.',
    Icon: Scale,
  },
  {
    id: 'schemes',
    title: 'Schemes & Missions',
    desc: 'MISHTI, Amrit Dharohar, Green Credit, and CAMPA.',
    Icon: Sparkles,
  },
];

export default function EnvironmentHubClient({ counts = {}, starters = [] }) {
  const total = counts.total || 20;

  return (
    <div className="env-hub-page">
      <main className="env-hub-container">
        <header className="env-hub-header">
          <div className="env-hub-eyebrow">UPSC CSE Prelims · Environment &amp; Ecology</div>
          <h1 className="env-hub-headline">Environment Atlas</h1>
          <p className="env-hub-lead">
            IUCN status, WPA 1972 schedules, reserve maps, and Prelims traps in one structured workspace.
          </p>
        </header>

        {/* Featured Active Module: Species Atlas */}
        <section className="env-hub-featured" aria-label="Species Atlas">
          <div className="env-hub-featured-main">
            <div className="env-hub-featured-top">
              <div className="env-hub-icon-box">
                <Binoculars size={20} />
              </div>
              <span className="env-hub-count-pill">{total} High-Yield Species</span>
            </div>

            <h2 className="env-hub-featured-title">Species Atlas</h2>
            <p className="env-hub-featured-desc">
              Compare IUCN Red List categories, Wildlife (Protection) Act schedules, CITES appendices, interactive habitat maps, and recent current-affairs triggers.
            </p>

            <div className="env-hub-actions">
              <Link href="/environment/species" className="env-hub-primary-btn">
                <span>Open Species Atlas</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="env-hub-filter-links" aria-label="Quick status filters">
              {counts.cr > 0 && (
                <Link href="/environment/species?filter=CR" className="env-hub-filter-link">
                  Critically Endangered ({counts.cr})
                </Link>
              )}
              {counts.en > 0 && (
                <Link href="/environment/species?filter=EN" className="env-hub-filter-link">
                  Endangered ({counts.en})
                </Link>
              )}
              {counts.vu > 0 && (
                <Link href="/environment/species?filter=VU" className="env-hub-filter-link">
                  Vulnerable ({counts.vu})
                </Link>
              )}
              <Link href="/environment/species?filter=In+news" className="env-hub-filter-link">
                In News
              </Link>
            </div>
          </div>

          {starters.length > 0 && (
            <div className="env-hub-starters">
              <div className="env-hub-starters-label">
                Start with these {starters.length}
              </div>
              <div className="env-hub-starter-list">
                {starters.map((sp) => (
                  <Link
                    key={sp.slug}
                    href={`/environment/species#${sp.slug}`}
                    className="env-hub-starter-row"
                  >
                    <span className={`iucn-pill iucn-${sp.iucn.toLowerCase()}`}>
                      {sp.iucn}
                    </span>
                    <span className="env-hub-starter-name">{sp.title}</span>
                    <ArrowRight size={14} className="env-hub-starter-arrow" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Compact Upcoming Sections */}
        <section className="env-hub-upcoming-sec" aria-label="Upcoming sections">
          <div className="env-hub-upcoming-heading">Next in Environment Atlas</div>
          <div className="env-hub-upcoming-grid">
            {UPCOMING_SECTIONS.map(({ id, title, desc, Icon }) => (
              <div key={id} className="env-hub-upcoming-card">
                <div className="env-hub-upcoming-top">
                  <Icon size={16} className="env-hub-upcoming-icon" />
                  <h3 className="env-hub-upcoming-title">{title}</h3>
                </div>
                <p className="env-hub-upcoming-desc">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
