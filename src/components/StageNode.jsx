// src/components/StageNode.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';

export default function StageNode({ data, id }) {
    const { label, desc, done, onSelect } = data || {};

    return (
        <div
            role="button"
            onClick={() => onSelect?.({ id, label, desc })}
            title={desc}
            className={`rounded-xl px-3 py-2 text-sm border cursor-pointer select-none
        ${done ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200'}
        shadow-sm hover:shadow transition`}
            style={{ maxWidth: 240 }}
            aria-label={desc}
        >
            {label} {done && <span className="ml-2 text-xs text-emerald-700">✓</span>}

            <Handle type="target" position={Position.Left}  id="in"  style={{ borderRadius: 8 }} />
            <Handle type="source" position={Position.Right} id="out" style={{ borderRadius: 8 }} />
        </div>
    );
}
