'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
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
    <div className="env-hub-wrapper">
      <div className="env-hub-header">
        <h1 className="env-hub-title">Environment & Ecology</h1>
      </div>

      <div className="env-hub-compact-grid">
        {MODULES.map((m) => {
          if (m.active) {
            return (
              <Link key={m.id} href={m.href} className="env-compact-card active">
                <span className="env-compact-icon">{m.icon}</span>
                <span className="env-compact-title">{m.title}</span>
                <ArrowUpRight size={18} className="env-compact-arrow" />
              </Link>
            );
          }
          return (
            <div key={m.id} className="env-compact-card disabled">
              <span className="env-compact-icon">{m.icon}</span>
              <span className="env-compact-title">{m.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
