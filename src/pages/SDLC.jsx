// src/pages/SDLC.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
		id: "analisis",
		position: { x: 50, y: 80 },
		data: {
			label: "Análisis",
			desc: "Definición detallada del problema, identificación de los usuarios finales, recopilación de requisitos funcionales y no funcionales, y establecimiento de los objetivos del proyecto. Se documentan las necesidades del negocio y se analizan los riesgos iniciales.",
		},
		type: NODE_TYPE,
	},
	{
		id: "diseno",
		position: { x: 300, y: 40 },
		data: {
			label: "Diseño",
			desc: "Elaboración de la arquitectura del sistema, diseño de la interfaz de usuario (UI/UX), modelado de datos, definición de componentes y módulos, y selección de tecnologías. Se crean diagramas y especificaciones técnicas para guiar la implementación.",
		},
		type: NODE_TYPE,
	},
	{
		id: "implementacion",
		position: { x: 300, y: 150 },
		data: {
			label: "Implementación",
			desc: "Codificación de los módulos y componentes definidos, integración de sistemas y funcionalidades, realización de pruebas unitarias y revisión de código. Se asegura que el desarrollo cumpla con los estándares y requisitos establecidos.",
		},
		type: NODE_TYPE,
	},
	{
		id: "pruebas",
		position: { x: 550, y: 80 },
		data: {
			label: "Pruebas",
			desc: "Ejecución de pruebas funcionales, de integración y de sistema para validar que el producto cumple con los requisitos. Se identifican y corrigen defectos, y se documentan los resultados de las pruebas.",
		},
		type: NODE_TYPE,
	},
	{
		id: "despliegue",
		position: { x: 800, y: 40 },
		data: {
			label: "Despliegue",
			desc: "Liberación del producto al entorno de producción, configuración de servidores y servicios, monitoreo inicial del funcionamiento, y capacitación a usuarios finales. Se realiza el seguimiento de la puesta en marcha.",
		},
		type: NODE_TYPE,
	},
	{
		id: "mantenimiento",
		position: { x: 800, y: 150 },
		data: {
			label: "Mantenimiento",
			desc: "Corrección de errores post-despliegue, aplicación de mejoras y actualizaciones, gestión de incidencias y soporte continuo. Se evalúa el rendimiento y se planifican futuras optimizaciones.",
		},
		type: NODE_TYPE,
	},
];

export default function SDLC() {
	const [nodes, setNodes, onNodesChange] = useNodesState(BASE);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const onConnect = useCallback(
		(p) => setEdges((eds) => addEdge({ ...p, animated: true }, eds)),
		[]
	);
	const { users, addUser, removeUser, completed } = useApp();

	const [selected, setSelected] = useState(null);

	// inyectar onSelect y pintar "done"
	const decoratedNodes = useMemo(
		() =>
			nodes.map((n) => ({
				...n,
				data: {
					...n.data,
					onSelect: setSelected,
					done: completed.sdlc.includes(n.id),
				},
			})),
		[nodes, completed.sdlc]
	);

	const [form, setForm] = useState({
		nombre: "",
		rol: "cliente",
		password: "",
	});
	const submit = (e) => {
		e.preventDefault();
		if (!form.nombre.trim() || !form.password) return;
		addUser({
			nombre: form.nombre.trim(),
			rol: form.rol,
			password: form.password,
		});
		setForm({ nombre: "", rol: "cliente", password: "" });
	};

	return (
		<div className="space-y-5">
			<div>
				<h1 className="text-2xl font-bold mb-1">
					SDLC — Ciclo de Vida del Desarrollo
				</h1>
				<p className="text-slate-600">
					Hover muestra tooltip; click abre detalle. Conecta en orden con las
					flechitas.
				</p>
			</div>

			<div className="grid xl:grid-cols-3 gap-4">
				{/* Grafo (ocupa 2 columnas en pantallas grandes) */}
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

				{/* Panel lateral de detalle (click) */}
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
				<h2 className="font-semibold mb-2">Análisis → Definir Usuarios</h2>
				<form
					onSubmit={submit}
					className="grid grid-cols-1 md:grid-cols-3 gap-2"
				>
					<input
						className="border rounded-xl px-3 py-2"
						placeholder="Nombre"
						value={form.nombre}
						onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
					/>
					<select
						className="border rounded-xl px-3 py-2"
						value={form.rol}
						onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))}
					>
						<option value="cliente">Cliente</option>
						<option value="admin">Admin</option>
						<option value="recepcionista">Recepcionista</option>
					</select>
					<input
						className="border rounded-xl px-3 py-2"
						placeholder="Contraseña (defínela tú)"
						value={form.password}
						onChange={(e) =>
							setForm((f) => ({ ...f, password: e.target.value }))
						}
						type="password"
					/>
					<button className="px-3 py-2 rounded-xl bg-black text-white md:col-span-3">
						Crear usuario
					</button>
				</form>

				<ul className="mt-3 space-y-2 text-sm">
					{users.map((u) => (
						<li
							key={u.id}
							className="flex items-center justify-between border rounded-xl px-3 py-2"
						>
							<span>
								{u.nombre}{" "}
								<span className="ml-2 text-xs px-2 py-0.5 rounded-full border">
									{u.rol}
								</span>
							</span>
							<button
								onClick={() => removeUser(u.id)}
								className="text-rose-600"
							>
								Eliminar
							</button>
						</li>
					))}
					{users.length === 0 && (
						<li className="text-slate-500">Aún no hay usuarios.</li>
					)}
				</ul>
			</div>
		</div>
	);
}
