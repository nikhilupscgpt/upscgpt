"use client"
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import NavSlot from '@/components/NavSlot';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

const GS_COLORS = {
  'GS1': '#f59e0b', // Amber
  'GS2': '#3b82f6', // Blue
  'GS3': '#10b981', // Green
  'GS4': '#8b5cf6', // Purple
  'General': '#94a3b8' // Slate
};

export default function AtlasGraphPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);
  
  const fgRef = useRef();

  useEffect(() => {
    fetch('/api/graph/data')
      .then(res => res.json())
      .then(graphData => {
        setData(graphData);
        setIsLoading(false);
      });
  }, []);

  // Handle URL-based highlighting (Search-to-Map Bridge)
  useEffect(() => {
    const focusSlug = searchParams.get('focus');
    if (focusSlug && data.nodes.length > 0) {
      const node = data.nodes.find(n => n.slug === focusSlug);
      if (node) {
        setHighlightNodes(new Set([node.id]));
        fgRef.current?.centerAt(node.x, node.y, 1000);
        fgRef.current?.zoom(4, 1000);
      }
    }
  }, [searchParams, data.nodes]);

  const filteredData = useMemo(() => {
    if (filter === 'ALL') return data;
    return {
      nodes: data.nodes.filter(n => n.group === filter),
      links: data.links.filter(l => {
        const source = typeof l.source === 'object' ? l.source.id : l.source;
        const target = typeof l.target === 'object' ? l.target.id : l.target;
        const sNode = data.nodes.find(n => n.id === source);
        const tNode = data.nodes.find(n => n.id === target);
        return sNode?.group === filter && tNode?.group === filter;
      })
    };
  }, [data, filter]);

  const handleNodeClick = useCallback((node) => {
    router.push(`/issues/${node.slug}`);
  }, [router]);

  return (
    <div className="graph-container">
      <NavSlot />
      
      <div className="graph-overlay">
        <div className="graph-header">
          <h1 className="graph-title">Strategic Atlas Map</h1>
          <p className="graph-subtitle">Visual Intelligence Graph • {data.nodes.length} Syllabus Nodes</p>
        </div>

        <div className="filter-bar">
          {['ALL', 'GS1', 'GS2', 'GS3', 'GS4'].map(p => (
            <button 
              key={p} 
              className={`filter-btn ${filter === p ? 'active' : ''}`}
              onClick={() => setFilter(p)}
              style={{ '--accent': GS_COLORS[p] || '#3b82f6' }}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="graph-legend">
          {Object.entries(GS_COLORS).map(([paper, color]) => (
            <div key={paper} className="legend-item">
              <span className="legend-dot" style={{ background: color }}></span>
              <span className="legend-label">{paper}</span>
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="graph-loader">
          <div className="spinner"></div>
          <p>Syncing Neural Nodes...</p>
        </div>
      ) : (
        <ForceGraph2D
          ref={fgRef}
          graphData={filteredData}
          nodeLabel="name"
          nodeColor={n => GS_COLORS[n.group] || GS_COLORS.General}
          nodeRelSize={6}
          linkColor={() => 'rgba(255, 255, 255, 0.05)'}
          linkWidth={1}
          d3AlphaDecay={0.01}
          d3VelocityDecay={0.3}
          backgroundColor="#020617"
          onNodeClick={handleNodeClick}
          onNodeHover={setHoverNode}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Outfit, sans-serif`;
            
            const radius = node.val === 3 ? 5 : 3;
            
            // Draw Glow
            if (highlightNodes.has(node.id) || hoverNode?.id === node.id) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius * 2.5, 0, 2 * Math.PI, false);
              ctx.fillStyle = (GS_COLORS[node.group] || GS_COLORS.General) + '22';
              ctx.fill();
              
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius * 1.5, 0, 2 * Math.PI, false);
              ctx.fillStyle = (GS_COLORS[node.group] || GS_COLORS.General) + '44';
              ctx.fill();
            }

            // Draw Core
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = GS_COLORS[node.group] || GS_COLORS.General;
            ctx.fill();

            // Label Rendering
            if (globalScale > 2.5 || highlightNodes.has(node.id) || hoverNode?.id === node.id) {
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); 
              
              ctx.fillStyle = 'rgba(2, 6, 23, 0.8)';
              ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + radius + 2, bckgDimensions[0], bckgDimensions[1]);

              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = highlightNodes.has(node.id) ? '#fff' : '#94a3b8';
              ctx.fillText(label, node.x, node.y + radius + 2 + bckgDimensions[1] / 2);
            }
          }}
        />
      )}

      <style jsx>{`
        .graph-container {
          width: 100vw;
          height: 100vh;
          background: #0f172a;
          position: relative;
          overflow: hidden;
        }

        .graph-overlay {
          position: absolute;
          top: 80px;
          left: 32px;
          z-index: 100;
          pointer-events: none;
        }

        .graph-header {
          margin-bottom: 24px;
        }

        .graph-title {
          font-family: 'Outfit', sans-serif;
          font-size: 2.5rem;
          font-weight: 900;
          color: white;
          margin: 0;
          letter-spacing: -1px;
        }

        .graph-subtitle {
          font-size: 0.9rem;
          color: #94a3b8;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .filter-bar {
          display: flex;
          gap: 12px;
          pointer-events: auto;
        }

        .filter-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          padding: 8px 24px;
          border-radius: 100px;
          font-weight: 800;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .filter-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        .filter-btn.active {
          background: var(--accent);
          border-color: var(--accent);
          color: #000;
          box-shadow: 0 0 20px var(--accent);
        }

        .graph-legend {
          margin-top: 32px;
          background: rgba(2, 6, 23, 0.4);
          backdrop-filter: blur(10px);
          padding: 16px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-label {
          font-size: 0.7rem;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .graph-loader {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: 'Outfit', sans-serif;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
