import { Canvas } from "@react-three/fiber";
import {
	OrbitControls,
	Html,
	useGLTF,
	PerspectiveCamera,
	ContactShadows,
} from "@react-three/drei";
import { Suspense, useRef, useState, useEffect } from "react";
import { Vector3 } from "three";
import { gsap } from "gsap";
import modeloCoche from "@/public/compressed_1731961304333_2022__peugeot_308.glb";

function Car() {
	const { scene } = useGLTF(modeloCoche.src || modeloCoche, true);

	useEffect(() => {
		if (scene) {
			scene.scale.set(625, 625, 625);
			scene.position.set(0, 0.2, 0);
			scene.rotation.set(0, Math.PI, 0);

			scene.traverse((child) => {
				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;
					if (child.material) {
						child.material.metalness = 0.4;
						child.material.roughness = 0.5;
					}
				}
			});
		}
	}, [scene]);

	return <primitive object={scene} />;
}

useGLTF.preload(modeloCoche.src || modeloCoche, true);

function VehicleModelReadOnly({ onPointSelect, cameraRef, pointsData = {} }) {
	const inspectionPoints = [
		{ id: 1, position: [0, 9, -6.5], label: "Parabrisas" },
		{ id: 2, position: [0, 7.5, -12], label: "Parrilla frontal" },
		{ id: 3, position: [0, 2.5, -15.5], label: "Paragolpes delantero" },
		{ id: 4, position: [6.5, 7, -5], label: "Retrovisor derecho" },
		{ id: 5, position: [-5.5, 7, -5], label: "Retrovisor izquierdo" },
		{ id: 6, position: [0, 8.5, 13], label: "Luneta trasera" },
		{ id: 7, position: [0, 6.5, 14.5], label: "Portón trasero" },
		{ id: 8, position: [0, 4.75, 14.5], label: "Difusor trasero" },
		{ id: 9, position: [0, 3, 14.5], label: "Paragolpes trasero" },
		{ id: 10, position: [4, 7, 13.5], label: "Piloto trasero derecho" },
		{ id: 16, position: [-4.75, 7, 13.5], label: "Piloto trasero izquierdo" },
		{
			id: 11,
			position: [-5.5, 2.5, -11.75],
			label: "Rueda delantera izquierda",
		},
		{
			id: 12,
			position: [-5.5, 4.5, -2.75],
			label: "Puerta delantera izquierda",
		},
		{ id: 13, position: [-5.5, 4.5, 3.5], label: "Puerta trasera izquierda" },
		{ id: 14, position: [-5.5, 6, 8.5], label: "Rueda trasera izquierda" },
		{ id: 15, position: [-5.5, 7.5, 8.5], label: "Antena de techo" },
		{ id: 17, position: [6.75, 6, 8.5], label: "Capó" },
		{ id: 18, position: [6.75, 4.5, 3.5], label: "Puerta delantera derecha" },
		{ id: 19, position: [6.75, 4.5, -2.75], label: "Ventana trasera derecha" },
		{ id: 20, position: [6.75, 5.25, -8.75], label: "Techo" },
		{ id: 21, position: [6.75, 2.5, -6.75], label: "Rueda trasera derecha" },
	];

	const [hoveredPoint, setHoveredPoint] = useState(null);
	const [activePoint, setActivePoint] = useState(null);

	const handlePointClick = (point) => {
		const targetPosition = new Vector3(...point.position);
		gsap.to(cameraRef.current.position, {
			x: targetPosition.x + 0.05,
			y: targetPosition.y + 0.01,
			z: targetPosition.z + 0.05,
			duration: 1,
			ease: "power2.inOut",
			onComplete: () => {
				onPointSelect(point);
				setActivePoint(point.id);
			},
		});
	};

	return (
		<group>
			<Car />
			{inspectionPoints.map((point) => (
				<Html
					key={point.id}
					position={point.position}
					style={{ pointerEvents: "none" }}
				>
					<div
						className={`relative cursor-pointer w-8 h-8 rounded-full flex items-center justify-center
                            ${activePoint === point.id
								? "bg-blue-800 text-white scale-125"
								: pointsData && pointsData[`detalle${point.id}`]
									? "bg-red-600 border-zinc-200 text-zinc-200 font-medium bg-opacity-40"
									: "bg-zinc-800 border-zinc-200 text-zinc-200 font-medium bg-opacity-70"
							} 
                            border-2 border-zinc-200 text-sm transition-all duration-300
                            hover:bg-blue-800 bg-opacity-70 hover:scale-110 `}
						onClick={() => handlePointClick(point)}
						onMouseEnter={() => setHoveredPoint(point.id)}
						onMouseLeave={() => setHoveredPoint(null)}
						style={{ pointerEvents: "auto" }}
					>
						<span className="text-xs">{point.id}</span>
						{(hoveredPoint === point.id || activePoint === point.id) && (
							<div
								className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white 
                                text-xs py-1 px-2 rounded whitespace-nowrap backdrop-blur-sm
                                transform transition-all duration-200 scale-100"
								style={{ zIndex: 1 }}
							>
								{point.label}
							</div>
						)}
					</div>
				</Html>
			))}
		</group>
	);
}

export default function VehicleViewerReadOnly({ onPointSelect, pointsData }) {
	const cameraRef = useRef();

	return (
		<div
			className="w-full h-[600px] bg-gradient-to-b from-zinc-100 to-zinc-300 rounded-tl-lg rounded-bl-lg relative"
			style={{
				zIndex: 0,
				isolation: "isolate",
			}}
		>
			<Canvas shadows>
				<Suspense
					fallback={
						<Html center>
							<div className="text-sm text-gray-400">Cargando modelo 3D...</div>
						</Html>
					}
				>
					<PerspectiveCamera
						ref={cameraRef}
						makeDefault
						position={[24, 12, 24]}
						fov={50}
					/>
					<ambientLight intensity={1.5} />
					<directionalLight position={[0, 5, 0]} intensity={2} castShadow />
					<pointLight position={[0, 4, 15]} intensity={1.2} />
					<pointLight position={[0, 4, -15]} intensity={1.2} />
					<VehicleModelReadOnly
						onPointSelect={onPointSelect}
						cameraRef={cameraRef}
						pointsData={pointsData}
					/>
					<OrbitControls
						minPolarAngle={Math.PI / 5}
						maxPolarAngle={Math.PI / 1.5}
						enableZoom={true}
						enablePan={true}
						dampingFactor={0.05}
						minDistance={20}
						maxDistance={60}
					/>
					<ContactShadows
						position={[0, 0, 0]}
						opacity={1}
						scale={100}
						blur={2}
						far={50}
					/>
				</Suspense>
			</Canvas>
		</div>
	);
}