'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Binoculars,
  Globe,
  Newspaper,
  Scale,
  Sparkles,
  Trees,
} from 'lucide-react';
import './env-atlas.css';

export default function EnvironmentHubClient({ counts = {} }) {
  const total = counts.total || 20;

  const sections = [
    {
      id: 'species',
      title: 'Species Atlas',
      desc: 'IUCN status, WPA 1972 schedules, CITES appendices, habitat maps, and Prelims traps.',
      href: '/environment/species',
      badge: `${total} species`,
      active: true,
      Icon: Binoculars,
    },
    {
      id: 'protected-areas',
      title: 'Protected Areas',
      desc: 'National Parks, Tiger Reserves, Biosphere Reserves, and Ramsar wetlands by state and river.',
      href: null,
      badge: 'In progress',
      active: false,
      Icon: Trees,
    },
    {
      id: 'conventions',
      title: 'Conventions & Treaties',
      desc: 'CBD, CITES, Ramsar, CMS, Stockholm/Basel/Rotterdam, and UNFCCC COP outcomes.',
      href: null,
      badge: 'In progress',
      active: false,
      Icon: Globe,
    },
    {
      id: 'acts-orgs',
      title: 'Acts & Organisations',
      desc: 'WPA 1972 (2022 Amendment), EPA 1986, Forest Conservation Act, NTCA, NGT & statutory bodies.',
      href: null,
      badge: 'In progress',
      active: false,
      Icon: Scale,
    },
    {
      id: 'schemes',
      title: 'Schemes & Missions',
      desc: 'MISHTI, Amrit Dharohar, Green Credit Programme, CAMPA, and National Green Hydrogen.',
      href: null,
      badge: 'In progress',
      active: false,
      Icon: Sparkles,
    },
    {
      id: 'in-news',
      title: 'In News',
      desc: 'New species discoveries, notification updates, COP decisions, and SC environment rulings.',
      href: null,
      badge: 'In progress',
      active: false,
      Icon: Newspaper,
    },
  ];

  return (
    <div className="env-hub-page">
      <main className="env-hub-container">
        <header className="env-hub-header">
          <div className="env-hub-eyebrow">UPSC CSE Prelims · Environment &amp; Ecology</div>
          <h1 className="env-hub-headline">Environment Atlas</h1>
          <p className="env-hub-lead">
            Six high-yield pillars for Environment &amp; Ecology — legal frameworks, spatial conservation, treaties, and current affairs.
          </p>
        </header>

        <section className="env-hub-grid" aria-label="Environment and Ecology sections">
          {sections.map(({ id, title, desc, href, badge, active, Icon }) => {
            const inner = (
              <>
                <div className="env-hub-card-top">
                  <div className={`env-hub-icon-box ${active ? 'is-live' : ''}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`env-hub-pill ${active ? 'is-live' : ''}`}>
                    {badge}
                  </span>
                </div>

                <div className="env-hub-card-body">
                  <h2 className="env-hub-card-title">{title}</h2>
                  <p className="env-hub-card-desc">{desc}</p>
                </div>

                <div className="env-hub-card-foot">
                  {active ? (
                    <span className="env-hub-open-link">
                      <span>Open section</span>
                      <ArrowRight size={15} />
                    </span>
                  ) : (
                    <span className="env-hub-muted-foot">Scheduled next</span>
                  )}
                </div>
              </>
            );

            if (active && href) {
              return (
                <Link key={id} href={href} className="env-hub-card is-live">
                  {inner}
                </Link>
              );
            }

            return (
              <div key={id} className="env-hub-card" aria-disabled="true">
                {inner}
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
