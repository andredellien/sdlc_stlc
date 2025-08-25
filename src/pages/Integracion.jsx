import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, addEdge, useEdgesState, useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { useApp } from '../store/AppContext';
import StageNode from '../components/StageNode';

const NODE_TYPE = 'stage';
const nodeTypes = { [NODE_TYPE]: StageNode };

const initialNodes = [
  { id:'s-analisis', position:{x:50,y:60},  data:{ label:'SDLC: Análisis',       desc:'Definición del problema y usuarios' },        type:NODE_TYPE },
  { id:'s-diseno',   position:{x:50,y:150}, data:{ label:'SDLC: Diseño',         desc:'Arquitectura, UI/UX, datos' },               type:NODE_TYPE },
  { id:'s-impl',     position:{x:50,y:240}, data:{ label:'SDLC: Implementación', desc:'Codificación e integración' },               type:NODE_TYPE },
  { id:'s-pruebas',  position:{x:50,y:330}, data:{ label:'SDLC: Pruebas',        desc:'Validación interna del producto' },          type:NODE_TYPE },
  { id:'s-despl',    position:{x:50,y:420}, data:{ label:'SDLC: Despliegue',     desc:'Release y monitoreo' },                      type:NODE_TYPE },
  { id:'s-mant',     position:{x:50,y:510}, data:{ label:'SDLC: Mantenimiento',  desc:'Regresión y mejoras' },                      type:NODE_TYPE },
  { id:'t-req',      position:{x:520,y:60},  data:{ label:'STLC: Requisitos',    desc:'Derivados de análisis/negocio' },            type:NODE_TYPE },
  { id:'t-plan',     position:{x:520,y:150}, data:{ label:'STLC: Planificación', desc:'Estrategia de pruebas' },                    type:NODE_TYPE },
  { id:'t-diseno',   position:{x:520,y:240}, data:{ label:'STLC: Diseño Casos',  desc:'Casos y datos de prueba' },                  type:NODE_TYPE },
  { id:'t-env',      position:{x:520,y:330}, data:{ label:'STLC: Entorno',       desc:'Ambiente y cuentas listo' },                 type:NODE_TYPE },
  { id:'t-exec',     position:{x:520,y:420}, data:{ label:'STLC: Ejecución',     desc:'Correr casos y registrar defectos' },        type:NODE_TYPE },
  { id:'t-cierre',   position:{x:520,y:510}, data:{ label:'STLC: Cierre',        desc:'Reporte final y criterios de salida' },      type:NODE_TYPE },
];

const reglas = [
  { id:'r1', label:'Requisitos desde Análisis', anyOf: [['s-analisis','t-req']] },
  { id:'r2', label:'Casos diseñados desde Diseño', anyOf: [['s-diseno','t-diseno'], ['s-diseno','t-plan']] },
  { id:'r3', label:'Entorno/Ejecución preparado para lo implementado', anyOf: [['s-impl','t-env'], ['s-impl','t-exec'], ['s-impl','t-diseno']] },
  { id:'r4', label:'Ejecución valida Pruebas', anyOf: [['s-pruebas','t-exec'], ['s-pruebas','t-env']] },
  { id:'r5', label:'Validación post-release', anyOf: [['s-despl','t-cierre'], ['s-despl','t-exec']] },
  { id:'r6', label:'Regresión documentada', anyOf: [['s-mant','t-cierre']] },
];

export default function Integracion(){
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback((p) => setEdges((eds) => addEdge({ ...p, animated:true }, eds)), []);
  const { setEdgesIntegracion, completed } = useApp();

  useEffect(()=>{
    setNodes(ns => ns.map(n => {
      const core = n.id.startsWith('s-') ? n.id.replace('s-','') : n.id.startsWith('t-') ? n.id.replace('t-','') : n.id;
      const done = n.id.startsWith('s-') ? completed.sdlc.includes(core) : n.id.startsWith('t-') ? completed.stlc.includes(core) : false;
      return ({ ...n, data: { ...n.data, done, onSelect: ()=>{} } });
    }));
  }, [completed, setNodes]);

  const checks = useMemo(()=>{
    const has = (a,b)=> edges.some(e => (e.source===a && e.target===b) || (e.source===b && e.target===a));
    return reglas.map(r=>{
      const ok = r.anyOf.some(([from,to]) => has(from, to));
      return { ...r, ok };
    });
  }, [edges]);

  const score = Math.round(100 * (checks.filter(c=>c.ok).length / checks.length));
  const faltaClave = !checks.find(c=>c.id==='r1')?.ok;

  const decoratedEdges = useMemo(()=>{
    const doneMap = new Map(nodes.map(n=>[n.id, !!n.data?.done]));
    return edges.map(e=>{
      const ok = doneMap.get(e.source) && doneMap.get(e.target);
      return { ...e, style: ok ? { stroke:'#10b981', strokeWidth:2 } : e.style, label: ok ? 'OK' : e.label };
    });
  }, [edges, nodes]);

  useEffect(()=>{ setEdgesIntegracion(edges); }, [edges, setEdgesIntegracion]);

  const exportNotaTxt = ()=>{
    const fecha = new Date().toLocaleString();
    const ok = checks.filter(c=>c.ok);
    const miss = checks.filter(c=>!c.ok);
    const lines = [];
    lines.push('Acta de Integración SDLC × STLC – Sistema de Reservas');
    lines.push('');
    lines.push(`Fecha: ${fecha}`);
    lines.push(`Cobertura de integración: ${score}%`);
    lines.push('');
    lines.push('Resumen');
    lines.push('Se establecieron conexiones entre etapas del SDLC y actividades del STLC para evidenciar trazabilidad y control de calidad. A continuación se detalla el mapeo logrado y los pendientes.');
    lines.push('');
    lines.push(`Conexiones logradas (${ok.length})`);
    ok.forEach(c=>{
      const pares = c.anyOf.map(([a,b])=>`(${a} ↔ ${b})`).join(' | ');
      lines.push(`- OK ${c.label} — pares válidos: ${pares}`);
    });
    if(ok.length===0) lines.push('- (No hay conexiones válidas aún)');
    lines.push('');
    lines.push(`Conexiones pendientes (${miss.length})`);
    miss.forEach(c=>{
      const pares = c.anyOf.map(([a,b])=>`(${a} ↔ ${b})`).join(' | ');
      lines.push(`- PENDIENTE ${c.label} — intenta alguno de: ${pares}`);
    });
    if(miss.length===0) lines.push('- (Sin pendientes)');
    lines.push('');
    lines.push('Detalle de todas las líneas dibujadas');
    if(edges.length===0){
      lines.push('- (No hay líneas dibujadas)');
    } else {
      edges.forEach((e,i)=> lines.push(`${i+1}. ${e.source} → ${e.target}`));
    }
    lines.push('');
    lines.push('Notas');
    lines.push('• Las reglas aceptan alternativas (p. ej., Implementación → Entorno o Implementación → Ejecución o Implementación → Diseño).');
    lines.push('• La cobertura se calcula con base en reglas cumplidas (al menos una alternativa por regla).');
    lines.push('');
    const blob = new Blob([lines.join('\n')], { type:'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'acta-integracion-sdlc-stlc.txt'; a.click(); URL.revokeObjectURL(url);
  };

  return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Integración — SDLC + STLC</h1>
          <p className="text-slate-600">Hover para ver descripciones; click para detalle; conecta en orden y valida relaciones.</p>
          {faltaClave && (
              <div className="mt-3 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm">
                ⚠️ Falta la conexión clave: <strong>SDLC: Análisis ↔ STLC: Requisitos</strong>.
              </div>
          )}
          <div className={`mt-3 p-3 rounded-xl text-sm ${score===100?'bg-emerald-50 border border-emerald-200 text-emerald-700':'bg-amber-50 border border-amber-200 text-amber-700'}`}>
            Estado de integración: <strong>{score}%</strong>
            <button onClick={exportNotaTxt} className="ml-3 px-3 py-1.5 rounded-xl border">Descargar nota (.txt)</button>
          </div>
        </div>

        <div style={{ height: 620 }} className="rounded-2xl border bg-white">
          <ReactFlow
              nodes={nodes}
              edges={decoratedEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              nodeTypes={nodeTypes}
          >
            <MiniMap /><Controls /><Background gap={16} />
          </ReactFlow>
        </div>

        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="p-3 border rounded-xl bg-white">
            <div className="font-semibold mb-2">Checklist de reglas</div>
            {checks.map(c=>(
                <div key={c.id} className={`p-2 rounded mb-1 ${c.ok?'bg-emerald-50 border border-emerald-200':'bg-amber-50 border border-amber-200'}`}>
                  {c.ok ? '✅' : '⛔️'} {c.label}
                </div>
            ))}
          </div>
          <div className="p-3 border rounded-xl bg-white">
            <div className="font-semibold mb-2">Conexiones detectadas</div>
            {edges.length === 0 && <div className="text-slate-500">No hay conexiones aún.</div>}
            <ul className="space-y-1">
              {edges.map((e,i)=>(
                  <li key={i} className="text-slate-700">• <code>{e.source}</code> → <code>{e.target}</code></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
  );
}
