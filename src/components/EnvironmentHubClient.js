'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import './env-atlas.css';

const MODULES = [
  {
    id: 'species',
    title: 'Species Atlas',
    icon: '🐅',
    href: '/environment/species',
    active: true,
  },
  {
    id: 'protected-areas',
    title: 'Protected Areas',
    icon: '🏞️',
    href: '#',
    active: false,
  },
  {
    id: 'conventions',
    title: 'Conventions & Treaties',
    icon: '🌐',
    href: '#',
    active: false,
  },
  {
    id: 'acts-orgs',
    title: 'Acts & Organisations',
    icon: '⚖️',
    href: '#',
    active: false,
  },
  {
    id: 'schemes',
    title: 'Schemes & Missions',
    icon: '💡',
    href: '#',
    active: false,
  },
  {
    id: 'in-news',
    title: 'In News',
    icon: '📰',
    href: '#',
    active: false,
  },
];

export default function EnvironmentHubClient() {
  return (
    <div className="env-hub-page">
      {/* Consistent Sub-Header Bar */}
      <div className="env-topbar">
        <div className="env-topbar-title">
          <span className="env-brand-pill">PRELIMS 2025–26</span>
          <h1>Environment Atlas</h1>
        </div>
      </div>

      <main className="env-hub-container">
        <div className="env-hub-header">
          <h2 className="env-hub-headline">Environment & Ecology</h2>
          <p className="env-hub-lead">Select a section to begin studying</p>
        </div>

        <div className="env-hub-grid">
          {MODULES.map((m) => {
            const isActive = m.active;

            const cardContent = (
              <>
                <div className="env-hub-card-header">
                  <div className="env-hub-icon-box">
                    <span className="env-hub-emoji">{m.icon}</span>
                  </div>
                  <span className={`env-hub-badge ${isActive ? 'active' : 'upcoming'}`}>
                    {isActive ? 'Available' : 'Coming Soon'}
                  </span>
                </div>

                <div className="env-hub-card-footer">
                  <h3 className="env-hub-card-title">{m.title}</h3>
                  {isActive ? (
                    <div className="env-hub-action-link">
                      <span>Open section</span>
                      <ArrowRight size={16} />
                    </div>
                  ) : (
                    <span className="env-hub-status-text">In design</span>
                  )}
                </div>
              </>
            );

            if (isActive) {
              return (
                <Link key={m.id} href={m.href} className="env-hub-card active">
                  {cardContent}
                </Link>
              );
            }

            return (
              <div key={m.id} className="env-hub-card disabled">
                {cardContent}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
