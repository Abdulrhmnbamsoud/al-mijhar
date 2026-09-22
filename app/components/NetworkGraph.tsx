import React, { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

interface Node {
  id: string;
  name: string;
  group: number;
  val: number;
  riskLevel?: string;
}

interface Link {
  source: string;
  target: string;
  label: string;
}

interface NetworkGraphProps {
  nodesData: any[];
  targetName: string;
}

export default function NetworkGraph({ nodesData, targetName }: NetworkGraphProps) {
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prepare graph data
  const nodes: Node[] = [
    { id: targetName, name: targetName, group: 0, val: 20 }
  ];
  
  const links: Link[] = [];

  nodesData.forEach((node, i) => {
    nodes.push({
      id: node.name,
      name: node.name,
      group: node.riskLevel === 'مرتفع' || node.relationType === 'خصم' ? 1 : 2,
      val: 10,
      riskLevel: node.riskLevel
    });
    
    links.push({
      source: targetName,
      target: node.name,
      label: node.relationType
    });
  });

  const graphData = { nodes, links };

  return (
    <div ref={containerRef} className="w-full h-[500px] rounded-lg overflow-hidden bg-[#0A0D14] border border-[#1E2532] relative shadow-inner">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FF3366]"></span>
          <span className="text-xs text-slate-300 font-mono">خصم / عالي الخطورة</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#D4FF00]"></span>
          <span className="text-xs text-slate-300 font-mono">حليف / منخفض الخطورة</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#00E5FF]"></span>
          <span className="text-xs text-slate-300 font-mono">الهدف الرئيسي</span>
        </div>
      </div>
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={(node: any) => {
          if (node.group === 0) return '#00E5FF'; // Target
          if (node.group === 1) return '#FF3366'; // Enemy/High Risk
          return '#D4FF00'; // Ally/Low Risk
        }}
        linkColor={() => 'rgba(255,255,255,0.2)'}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        onNodeClick={(node: any) => {
          // Center on clicked node
          if (fgRef.current) {
            (fgRef.current as any).centerAt(node.x, node.y, 1000);
            (fgRef.current as any).zoom(2, 2000);
          }
        }}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

          ctx.fillStyle = 'rgba(10, 13, 20, 0.8)';
          ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = node.group === 0 ? '#00E5FF' : node.group === 1 ? '#FF3366' : '#D4FF00';
          ctx.fillText(label, node.x, node.y);

          node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
        }}
        nodePointerAreaPaint={(node: any, color, ctx) => {
          ctx.fillStyle = color;
          const bckgDimensions = node.__bckgDimensions;
          bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
        }}
      />
    </div>
  );
}
