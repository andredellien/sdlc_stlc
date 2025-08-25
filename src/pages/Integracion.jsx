import React, { useCallback, useEffect, useMemo } from "react";
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

const initialNodes = [
	// SDLC izquierda
	{
		id: "s-analisis",
		position: { x: 50, y: 60 },
		data: {
			label: "SDLC: Análisis",
			desc: "Definición detallada del problema, identificación de los usuarios finales, recopilación de requisitos funcionales y no funcionales, y establecimiento de los objetivos del proyecto. Se documentan las necesidades del negocio y se analizan los riesgos iniciales.",
		},
		type: NODE_TYPE,
	},
	{
		id: "s-diseno",
		position: { x: 50, y: 150 },
		data: {
			label: "SDLC: Diseño",
			desc: "Elaboración de la arquitectura del sistema, diseño de la interfaz de usuario (UI/UX), modelado de datos, definición de componentes y módulos, y selección de tecnologías. Se crean diagramas y especificaciones técnicas para guiar la implementación.",
		},
		type: NODE_TYPE,
	},
	{
		id: "s-impl",
		position: { x: 50, y: 240 },
		data: {
			label: "SDLC: Implementación",
			desc: "Codificación de los módulos y componentes definidos, integración de sistemas y funcionalidades, realización de pruebas unitarias y revisión de código. Se asegura que el desarrollo cumpla con los estándares y requisitos establecidos.",
		},
		type: NODE_TYPE,
	},
	{
		id: "s-pruebas",
		position: { x: 50, y: 330 },
		data: {
			label: "SDLC: Pruebas",
			desc: "Ejecución de pruebas funcionales, de integración y de sistema para validar que el producto cumple con los requisitos. Se identifican y corrigen defectos, y se documentan los resultados de las pruebas.",
		},
		type: NODE_TYPE,
	},
	{
		id: "s-despl",
		position: { x: 50, y: 420 },
		data: {
			label: "SDLC: Despliegue",
			desc: "Liberación del producto al entorno de producción, configuración de servidores y servicios, monitoreo inicial del funcionamiento, y capacitación a usuarios finales. Se realiza el seguimiento de la puesta en marcha.",
		},
		type: NODE_TYPE,
	},
	{
		id: "s-mant",
		position: { x: 50, y: 510 },
		data: {
			label: "SDLC: Mantenimiento",
			desc: "Corrección de errores post-despliegue, aplicación de mejoras y actualizaciones, gestión de incidencias y soporte continuo. Se evalúa el rendimiento y se planifican futuras optimizaciones.",
		},
		type: NODE_TYPE,
	},
	// STLC derecha
	{
		id: "t-req",
		position: { x: 520, y: 60 },
		data: {
			label: "STLC: Requisitos",
			desc: "Identificación y documentación de los requisitos de prueba derivados del análisis del negocio y del sistema. Se definen los criterios de aceptación y los objetivos de las pruebas.",
		},
		type: NODE_TYPE,
	},
	{
		id: "t-plan",
		position: { x: 520, y: 150 },
		data: {
			label: "STLC: Planificación",
			desc: "Desarrollo de la estrategia de pruebas, planificación de recursos, estimación de tiempos y definición de roles. Se establecen los tipos de pruebas a realizar y los entregables esperados.",
		},
		type: NODE_TYPE,
	},
	{
		id: "t-diseno",
		position: { x: 520, y: 240 },
		data: {
			label: "STLC: Diseño Casos",
			desc: "Creación y documentación de casos de prueba, definición de datos de prueba, y establecimiento de procedimientos para la ejecución. Se asegura la cobertura de los requisitos y escenarios críticos.",
		},
		type: NODE_TYPE,
	},
	{
		id: "t-env",
		position: { x: 520, y: 330 },
		data: {
			label: "STLC: Entorno",
			desc: "Preparación del ambiente de pruebas, configuración de herramientas, creación de cuentas y datos necesarios. Se valida que el entorno sea representativo y funcional para las pruebas.",
		},
		type: NODE_TYPE,
	},
	{
		id: "t-exec",
		position: { x: 520, y: 420 },
		data: {
			label: "STLC: Ejecución",
			desc: "Ejecución de los casos de prueba, registro de resultados y defectos encontrados, seguimiento de incidencias y comunicación con el equipo de desarrollo para su resolución.",
		},
		type: NODE_TYPE,
	},
	{
		id: "t-cierre",
		position: { x: 520, y: 510 },
		data: {
			label: "STLC: Cierre",
			desc: "Elaboración del reporte final de pruebas, análisis de métricas y cumplimiento de criterios de salida. Se realiza la retroalimentación y se documentan lecciones aprendidas para futuros proyectos.",
		},
		type: NODE_TYPE,
	},
];

const reglas = [
	{
		id: "r1",
		from: "s-analisis",
		to: "t-req",
		label: "Requisitos desde Análisis",
	},
	{
		id: "r2",
		from: "s-diseno",
		to: "t-diseno",
		label: "Casos diseñados desde Diseño",
	},
	{
		id: "r3",
		from: "s-impl",
		to: "t-env",
		label: "Entorno preparado para lo implementado",
	},
	{
		id: "r4",
		from: "s-pruebas",
		to: "t-exec",
		label: "Ejecución valida pruebas",
	},
	{
		id: "r5",
		from: "s-despl",
		to: "t-cierre",
		label: "Validación post-release",
	},
	{ id: "r6", from: "s-mant", to: "t-cierre", label: "Regresión documentada" },
];

export default function Integracion() {
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const onConnect = useCallback(
		(p) => setEdges((eds) => addEdge({ ...p, animated: true }, eds)),
		[]
	);
	const { setEdgesIntegracion, completed } = useApp();

	// pintar nodos como "done" si están en completed
	useEffect(() => {
		setNodes((ns) =>
			ns.map((n) => {
				const id = n.id.startsWith("s-")
					? n.id.replace("s-", "")
					: n.id.startsWith("t-")
					? n.id.replace("t-", "")
					: n.id;
				const done = n.id.startsWith("s-")
					? completed.sdlc.includes(id)
					: n.id.startsWith("t-")
					? completed.stlc.includes(id)
					: false;
				return { ...n, data: { ...n.data, done } };
			})
		);
	}, [completed, setNodes]);

	// checks de reglas + score
	const checks = useMemo(() => {
		const has = (a, b) =>
			edges.some(
				(e) =>
					(e.source === a && e.target === b) ||
					(e.source === b && e.target === a)
			);
		return reglas.map((r) => ({ ...r, ok: has(r.from, r.to) }));
	}, [edges]);

	const score = Math.round(
		100 * (checks.filter((c) => c.ok).length / checks.length)
	);
	const faltaClave = !checks.find((c) => c.id === "r1")?.ok;

	// colorear edges de verde si ambos extremos están "done"
	const decoratedEdges = useMemo(() => {
		const doneMap = new Map(nodes.map((n) => [n.id, !!n.data?.done]));
		return edges.map((e) => {
			const ok = doneMap.get(e.source) && doneMap.get(e.target);
			return {
				...e,
				style: ok ? { stroke: "#10b981", strokeWidth: 2 } : e.style,
				label: ok ? "OK" : e.label,
			};
		});
	}, [edges, nodes]);

	useEffect(() => {
		setEdgesIntegracion(edges);
	}, [edges, setEdgesIntegracion]);

	const exportRTM = () => {
		const rtm = checks.map((c) => ({
			from: c.from,
			to: c.to,
			label: c.label,
			status: c.ok ? "OK" : "FALTA",
		}));
		const blob = new Blob([JSON.stringify({ rtm, score, edges }, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "rtm-integracion.json";
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-2xl font-bold mb-1">Integración — SDLC + STLC</h1>
				<p className="text-slate-600">
					Hover para ver descripciones; los nodos/edges “hechos” se pintan en
					verde.
				</p>
				{faltaClave && (
					<div className="mt-3 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm">
						⚠️ Falta la conexión clave:{" "}
						<strong>SDLC: Análisis ↔ STLC: Requisitos</strong>.
					</div>
				)}
				<div
					className={`mt-3 p-3 rounded-xl text-sm ${
						score === 100
							? "bg-emerald-50 border border-emerald-200 text-emerald-700"
							: "bg-amber-50 border border-amber-200 text-amber-700"
					}`}
				>
					Estado de integración: <strong>{score}%</strong>
					<button
						onClick={exportRTM}
						className="ml-3 px-3 py-1.5 rounded-xl border"
					>
						Exportar RTM
					</button>
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
					<MiniMap />
					<Controls />
					<Background gap={16} />
				</ReactFlow>
			</div>
		</div>
	);
}
