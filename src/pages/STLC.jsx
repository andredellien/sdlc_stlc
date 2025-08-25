// src/pages/STLC.jsx
import React, { useCallback, useMemo, useState, useEffect } from "react";
import ReactFlow, {
	Background,
	Controls,
	MiniMap,
	addEdge,
	useEdgesState,
	useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { useApp } from "../store/AppContext";
import StageNode from "../components/StageNode";

const NODE_TYPE = "stage";
const nodeTypes = { [NODE_TYPE]: StageNode };

const BASE = [
	{
		id: "req",
		position: { x: 50, y: 60 },
		data: {
			label: "Análisis de Requisitos",
			desc: "Identificación y documentación de los requisitos de prueba derivados del análisis del negocio y del sistema. Se definen los criterios de aceptación y los objetivos de las pruebas.",
		},
		type: NODE_TYPE,
	},
	{
		id: "plan",
		position: { x: 300, y: 20 },
		data: {
			label: "Planificación de Pruebas",
			desc: "Desarrollo de la estrategia de pruebas, planificación de recursos, estimación de tiempos y definición de roles. Se establecen los tipos de pruebas a realizar y los entregables esperados.",
		},
		type: NODE_TYPE,
	},
	{
		id: "diseno",
		position: { x: 300, y: 120 },
		data: {
			label: "Diseño de Casos",
			desc: "Creación y documentación de casos de prueba, definición de datos de prueba, y establecimiento de procedimientos para la ejecución. Se asegura la cobertura de los requisitos y escenarios críticos.",
		},
		type: NODE_TYPE,
	},
	{
		id: "env",
		position: { x: 550, y: 60 },
		data: {
			label: "Configuración de Entorno",
			desc: "Preparación del ambiente de pruebas, configuración de herramientas, creación de cuentas y datos necesarios. Se valida que el entorno sea representativo y funcional para las pruebas.",
		},
		type: NODE_TYPE,
	},
	{
		id: "exec",
		position: { x: 800, y: 20 },
		data: {
			label: "Ejecución de Pruebas",
			desc: "Ejecución de los casos de prueba, registro de resultados y defectos encontrados, seguimiento de incidencias y comunicación con el equipo de desarrollo para su resolución.",
		},
		type: NODE_TYPE,
	},
	{
		id: "cierre",
		position: { x: 800, y: 120 },
		data: {
			label: "Cierre de Pruebas",
			desc: "Elaboración del reporte final de pruebas, análisis de métricas y cumplimiento de criterios de salida. Se realiza la retroalimentación y se documentan lecciones aprendidas para futuros proyectos.",
		},
		type: NODE_TYPE,
	},
];

const COMPLETE_ALL_STLC = ["req", "plan", "diseno", "env", "exec", "cierre"];
const SUGGEST_SDLC_ON_LOGIN = [
	"analisis",
	"diseno",
	"implementacion",
	"pruebas",
];

export default function STLC() {
	const [nodes, setNodes, onNodesChange] = useNodesState(BASE);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const onConnect = useCallback(
		(p) => setEdges((eds) => addEdge({ ...p, animated: true }, eds)),
		[]
	);

	const { users, sessionUserId, login, logout, completed, markCompleted } =
		useApp();

	const [selected, setSelected] = useState(null);
	const decoratedNodes = useMemo(
		() =>
			nodes.map((n) => ({
				...n,
				data: {
					...n.data,
					onSelect: setSelected,
					done: completed.stlc.includes(n.id),
				},
			})),
		[nodes, completed.stlc]
	);

	const [pick, setPick] = useState("");
	const [pass, setPass] = useState("");
	const [msg, setMsg] = useState("");

	const doLogin = (e) => {
		e.preventDefault();
		if (!pick) return;
		const res = login(pick, pass);
		if (!res.ok) {
			setMsg(res.error);
			return;
		}
		setMsg("✅ Login exitoso. Flujo de pruebas completado.");
		markCompleted("stlc", COMPLETE_ALL_STLC);
		markCompleted("sdlc", SUGGEST_SDLC_ON_LOGIN);
		setPass("");
	};

	const currentUser = users.find((u) => u.id === sessionUserId);

	return (
		<div className="space-y-5">
			<div>
				<h1 className="text-2xl font-bold mb-1">STLC — Ciclo de Pruebas</h1>
				<p className="text-slate-600">
					Hover: tooltip • Click: detalle • Flechitas: conecta el orden.
				</p>
				{msg && (
					<div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
						{msg}
					</div>
				)}
			</div>

			<div className="grid xl:grid-cols-3 gap-4">
				<div
					className="xl:col-span-2 rounded-2xl border bg-white"
					style={{ height: 480 }}
				>
					<ReactFlow
						nodes={decoratedNodes}
						edges={edges}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={onConnect}
						fitView
						nodeTypes={nodeTypes}
					>
						<MiniMap />
						<Controls />
						<Background gap={16} />
					</ReactFlow>
				</div>

				<aside className="rounded-2xl border bg-white p-4">
					<h2 className="font-semibold mb-2">Detalle de etapa</h2>
					{selected ? (
						<div className="space-y-2 text-sm">
							<div className="font-medium">{selected.label}</div>
							<p className="text-slate-700">{selected.desc}</p>
							<p className="text-slate-500">
								ID: <code>{selected.id}</code>
							</p>
						</div>
					) : (
						<p className="text-sm text-slate-500">
							Haz click en un recuadro para ver su explicación.
						</p>
					)}
				</aside>
			</div>

			<div className="rounded-2xl border bg-white p-4">
				<h2 className="font-semibold mb-2">Prototipo: Login</h2>
				{!currentUser ? (
					<form
						onSubmit={doLogin}
						className="grid grid-cols-1 md:grid-cols-3 gap-2"
					>
						<select
							className="border rounded-xl px-3 py-2"
							value={pick}
							onChange={(e) => setPick(e.target.value)}
						>
							<option value="">Selecciona un usuario…</option>
							{users.map((u) => (
								<option key={u.id} value={u.id}>
									{u.nombre} — {u.rol}
								</option>
							))}
						</select>
						<input
							className="border rounded-xl px-3 py-2"
							placeholder="Contraseña (definida en SDLC)"
							value={pass}
							onChange={(e) => setPass(e.target.value)}
							type="password"
						/>
						<button className="px-3 py-2 rounded-xl bg-black text-white">
							Ingresar
						</button>
						{users.length === 0 && (
							<p className="md:col-span-3 text-sm text-slate-500">
								Crea usuarios en SDLC primero.
							</p>
						)}
					</form>
				) : (
					<div className="space-y-3">
						<div className="p-3 rounded-xl bg-emerald-50 border text-sm">
							Sesión activa: <strong>{currentUser.nombre}</strong>{" "}
							<span className="ml-2 text-xs px-2 py-1 rounded-full border">
								{currentUser.rol}
							</span>
						</div>
						<p className="text-sm text-slate-700">
							Estado: ✅ Todas las etapas STLC marcadas como completadas.
						</p>
						<button onClick={logout} className="px-3 py-2 rounded-xl border">
							Salir
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
