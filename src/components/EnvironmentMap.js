'use client';

import React, { useEffect, useRef } from 'react';
import * as d3Selection from 'd3-selection';
import * as d3Geo from 'd3-geo';
import geoData from '@/lib/india-geojson.json' with { type: 'json' };

export default function EnvironmentMap({
  places = [],
  highlightedStates = [],
  network = null,
  activePlaceIndex = null,
  hoveredPlaceIndex = null,
  onSelectPlace = null,
  onHoverPlace = null,
}) {
  const svgRef = useRef(null);
  const [isLight, setIsLight] = React.useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsLight(theme === 'light' || theme === 'sepia');
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3Selection.select(svgRef.current);
    svg.selectAll('*').remove();

    const isThemeLight = isLight;
    const stateFillDef = isThemeLight ? '#ffffff' : 'rgba(255, 255, 255, 0.04)';
    const stateStrokeDef = isThemeLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.12)';
    const outlineStrokeDef = isThemeLight ? '#94a3b8' : 'rgba(255, 255, 255, 0.35)';

    const width = 360;
    const height = 400;

    const g = svg.append('g');

    // Filter & order points to match numbered list rows 1:1
    let points = [];
    if (network && Array.isArray(network.slots) && network.reserves) {
      points = network.slots
        .map((slot) => network.reserves[slot.r])
        .filter((r) => r && typeof r.lat === 'number' && typeof r.lon === 'number');
    } else if (network && network.reserves) {
      points = Object.values(network.reserves).filter(
        (r) => typeof r.lat === 'number' && typeof r.lon === 'number'
      );
    } else if (network && Array.isArray(network.stats)) {
      points = network.stats.filter((s) => typeof s.lat === 'number' && typeof s.lon === 'number');
    } else if (Array.isArray(places)) {
      points = places
        .slice(0, 6)
        .filter((p) => typeof p.lat === 'number' && typeof p.lon === 'number');
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
    const networkStates = network?.reserves
      ? Object.values(network.reserves).map((r) => r.st || r.state)
      : [];
    const stateSet = new Set(
      [
        ...highlightedStates,
        ...places.map((p) => p.state),
        ...(network?.stats || []).map((s) => s.state),
        ...networkStates,
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
        return isHi ? 'rgba(37, 99, 235, 0.15)' : stateFillDef;
      })
      .attr('stroke', (d) => {
        const stateName = d.properties?.NAME_1 || d.properties?.name || '';
        const isHi = Array.from(stateSet).some((s) =>
          stateName.toLowerCase().includes(s.toLowerCase())
        );
        return isHi ? '#3b82f6' : stateStrokeDef;
      })
      .attr('stroke-width', 0.8);

    // 2. Draw Outer Boundary
    g.append('path')
      .datum(geoData.outline)
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', outlineStrokeDef)
      .attr('stroke-width', 1.2);

    // 3. Draw Pins
    const projectedPoints = [];
    points.forEach((pt, idx) => {
      const coords = projection([pt.lon, pt.lat]);
      if (!coords) return;
      const [x, y] = coords;
      const isSelected = idx === activePlaceIndex;
      const isHovered = idx === hoveredPlaceIndex;
      const isEmphasized = isSelected || isHovered;
      projectedPoints.push({ pt, idx, x, y, isSelected, isHovered, isEmphasized });

      const pinGroup = g
        .append('g')
        .attr('transform', `translate(${x}, ${y})`)
        .attr('cursor', 'pointer')
        .on('mouseenter', () => {
          if (onHoverPlace) onHoverPlace(idx);
        })
        .on('mouseleave', () => {
          if (onHoverPlace) onHoverPlace(null);
        })
        .on('click', () => {
          if (onSelectPlace) onSelectPlace(idx);
        });

      // Pulse/highlight ring for primary, hovered, or selected
      if (pt.primary || isEmphasized) {
        pinGroup
          .append('circle')
          .attr('r', isEmphasized ? 14 : 11)
          .attr('fill', 'none')
          .attr('stroke', isSelected ? '#10b981' : '#3b82f6')
          .attr('stroke-width', isEmphasized ? 2 : 1.5)
          .attr('opacity', isEmphasized ? 0.9 : 0.65);
      }

      // Main pin circle
      pinGroup
        .append('circle')
        .attr('r', isEmphasized ? 9 : 7.5)
        .attr('fill', isSelected ? '#10b981' : isHovered ? '#1d4ed8' : '#2563eb')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5);

      // Pin number
      pinGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 3.5)
        .attr('font-size', 10)
        .attr('font-weight', 800)
        .attr('fill', '#ffffff')
        .text(idx + 1);
    });

    // 4. Draw hover / selected label pill (>= 11px) on top of all pins
    projectedPoints
      .filter((item) => item.isEmphasized)
      .forEach(({ pt, x, y, isSelected }) => {
        const rawLabel = pt.n || pt.name || '';
        if (!rawLabel) return;
        const labelText = rawLabel.length > 26 ? `${rawLabel.slice(0, 24)}…` : rawLabel;
        const estWidth = Math.max(64, labelText.length * 6.5 + 16);
        const boxHeight = 22;
        const placeLeft = x > width * 0.55;
        const rawBx = placeLeft ? x - estWidth - 12 : x + 12;
        const bx = Math.max(8, Math.min(width - estWidth - 8, rawBx));
        const by = Math.max(8, Math.min(height - boxHeight - 8, y - boxHeight / 2));

        const labelGroup = g.append('g').attr('pointer-events', 'none');
        labelGroup
          .append('rect')
          .attr('x', bx)
          .attr('y', by)
          .attr('width', estWidth)
          .attr('height', boxHeight)
          .attr('rx', 6)
          .attr('fill', isThemeLight ? '#0f172a' : '#f8fafc')
          .attr('stroke', isSelected ? '#10b981' : '#3b82f6')
          .attr('stroke-width', 1.2);

        labelGroup
          .append('text')
          .attr('x', bx + 8)
          .attr('y', by + 14.5)
          .attr('font-size', 11.5)
          .attr('font-weight', 600)
          .attr('fill', isThemeLight ? '#ffffff' : '#0f172a')
          .text(labelText);
      });
  }, [places, highlightedStates, network, activePlaceIndex, hoveredPlaceIndex, onSelectPlace, onHoverPlace, isLight]);

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <svg
        ref={svgRef}
        viewBox="0 0 360 400"
        style={{
          width: '100%',
          maxHeight: 380,
          background: isLight ? '#f8fafc' : '#090d1a',
          borderRadius: 12,
          border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'}`,
        }}
      />
    </div>
  );
}
