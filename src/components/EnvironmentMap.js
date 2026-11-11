'use client';

import React, { useEffect, useRef } from 'react';
import * as d3Selection from 'd3-selection';
import * as d3Geo from 'd3-geo';
import geoData from '@/lib/india-geojson.json' with { type: 'json' };

export default function EnvironmentMap({
  places = [],
  highlightedStates = [],
  network = null,
  activePlaceIndex = 0,
  onSelectPlace,
}) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3Selection.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 360;
    const height = 400;

    const g = svg.append('g');

    // Filter points to map
    let points = [];
    if (network && Array.isArray(network.stats)) {
      points = network.stats.filter((s) => typeof s.lat === 'number' && typeof s.lon === 'number');
    } else if (Array.isArray(places)) {
      points = places.filter((p) => typeof p.lat === 'number' && typeof p.lon === 'number');
    }

    // Default projection for whole India
    const projection = d3Geo.geoMercator();

    if (points.length > 0) {
      // Fit to points bounding box with padding
      const lats = points.map((p) => p.lat);
      const lons = points.map((p) => p.lon);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLon = Math.min(...lons);
      const maxLon = Math.max(...lons);

      const dLat = Math.max(maxLat - minLat, 3.5);
      const dLon = Math.max(maxLon - minLon, 3.5);

      const center = [(minLon + maxLon) / 2, (minLat + maxLat) / 2];
      const boundsGeo = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'MultiPoint',
              coordinates: [
                [center[0] - dLon * 0.75, center[1] - dLat * 0.75],
                [center[0] + dLon * 0.75, center[1] + dLat * 0.75],
              ],
            },
          },
        ],
      };

      projection.fitExtent(
        [
          [20, 20],
          [width - 20, height - 20],
        ],
        boundsGeo
      );
    } else {
      projection.fitExtent(
        [
          [10, 10],
          [width - 10, height - 10],
        ],
        geoData.outline
      );
    }

    const path = d3Geo.geoPath().projection(projection);

    // 1. Draw States
    const stateSet = new Set(
      [
        ...highlightedStates,
        ...places.map((p) => p.state),
        ...(network?.stats || []).map((s) => s.state),
      ].filter(Boolean)
    );

    g.append('g')
      .selectAll('path')
      .data(geoData.india.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', (d) => {
        const stateName = d.properties?.NAME_1 || d.properties?.name || '';
        const isHi = Array.from(stateSet).some((s) =>
          stateName.toLowerCase().includes(s.toLowerCase())
        );
        return isHi ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255, 255, 255, 0.04)';
      })
      .attr('stroke', (d) => {
        const stateName = d.properties?.NAME_1 || d.properties?.name || '';
        const isHi = Array.from(stateSet).some((s) =>
          stateName.toLowerCase().includes(s.toLowerCase())
        );
        return isHi ? '#3b82f6' : 'rgba(255, 255, 255, 0.12)';
      })
      .attr('stroke-width', 0.8);

    // 2. Draw Outer Boundary
    g.append('path')
      .datum(geoData.outline)
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255, 255, 255, 0.35)')
      .attr('stroke-width', 1.2);

    // 3. Draw Pins
    points.forEach((pt, idx) => {
      const coords = projection([pt.lon, pt.lat]);
      if (!coords) return;
      const [x, y] = coords;
      const isSelected = idx === activePlaceIndex;

      const pinGroup = g
        .append('g')
        .attr('transform', `translate(${x}, ${y})`)
        .attr('cursor', 'pointer')
        .on('click', () => {
          if (onSelectPlace) onSelectPlace(idx);
        });

      // Pulse ring for primary or selected
      if (pt.primary || isSelected) {
        pinGroup
          .append('circle')
          .attr('r', isSelected ? 14 : 10)
          .attr('fill', 'none')
          .attr('stroke', isSelected ? '#10b981' : '#3b82f6')
          .attr('stroke-width', 1.5)
          .attr('opacity', 0.7);
      }

      // Main pin circle
      pinGroup
        .append('circle')
        .attr('r', isSelected ? 8 : 6)
        .attr('fill', isSelected ? '#10b981' : '#2563eb')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5);

      // Pin number
      pinGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 3.5)
        .attr('font-size', 9)
        .attr('font-weight', 800)
        .attr('fill', '#ffffff')
        .text(idx + 1);
    });
  }, [places, highlightedStates, network, activePlaceIndex, onSelectPlace]);

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <svg
        ref={svgRef}
        viewBox="0 0 360 400"
        style={{
          width: '100%',
          maxHeight: 380,
          background: '#090d1a',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      />
    </div>
  );
}
