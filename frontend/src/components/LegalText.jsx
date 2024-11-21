import { useState } from "react";
import { ChevronDown, ScrollText } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const LegalText = ({
	fecha,
	mes,
	nombre,
	dni,
	vehiculo,
	modelo,
	anio,
	patente,
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const toggleOpen = () => {
		setIsOpen(!isOpen);
	};

	return (
		<Card className="bg-slate-50/80 backdrop-blur-sm border-slate-200 shadow-sm mx-6">
			<CardContent className="px-6 pt-6">
				<div className="flex items-center gap-2 mb-4 text-slate-700">
					<ScrollText className="h-5 w-5 text-slate-500" />
					<h3 className="font-normal">Términos y Condiciones</h3>
				</div>

				<div className="space-y-4 text-slate-600">
					<p className="mb-2 text-sm">
						En el día {fecha} del mes {mes} formulario de ingreso al taller{" "}
						{nombre} y DNI {dni}, en adelante &quot;el cliente&quot; del
						automotor, cuyas características son: marca del vehículo {vehiculo},
						modelo {modelo} y año de fabricación {anio}, patente {patente}, de
						ahora en más conocido como &quot;la unidad&quot;, deja en poder del
						encargado de llevar a cabo los trabajos sobre la unidad, en adelante
						conocido como &quot;el establecimiento&quot;, acuerdan los siguientes
						puntos.
					</p>

					<div className="space-y-4">
						<div>
							<p className="text-sm">
								1. El cliente manifiesta sobre la unidad los siguientes
								desperfectos o detalles no relacionados con los trabajos a
								realizar detallados en el punto anterior. Los cuales se deja
								constancia del estado de la chapa y pintura de la unidad en 4
								fotos, las cuales el cliente observó y aprobó.
							</p>
						</div>

						<div>
							<p className="text-sm">
								2. Todo vicio oculto no declarado exime al establecimiento de
								responsabilidad. A) Si por los mismos la unidad recibiese daño
								durante la instalación, mantenimiento, reparación o diagnóstico.
								B) En caso de que por dicho vicio oculto luego de ejecutados los
								servicios contratados se produjese un daño a la unidad.
							</p>
						</div>

						<motion.div
							initial={{ height: 0 }}
							animate={{ height: isOpen ? "auto" : 0 }}
							transition={{ duration: 0.3 }}
							className="overflow-hidden"
						>
							<div className="space-y-4">
								<div>
									<p className="text-sm">
										3. En caso de diagnóstico, el establecimiento se compromete a
										entregar un presupuesto detallado y en 24 horas por la vía de
										mensajería telefónica.
									</p>
								</div>
								<div>
									<p className="text-sm">
										4. El cliente se obliga a retirar el vehículo en el día y en
										el horario acordado. En caso de demora del cliente y de ser
										esta demora injustificada, pasadas las 48 hs del plazo
										anteriormente acordado, el establecimiento percibirá una suma
										de quinientos pesos ($500) diarios en concepto de
										estacionamiento. El mismo se adiciona a los cargos por los
										servicios realizados.
									</p>
								</div>
								<div>
									<p className="text-sm">
										5. El cliente se obliga a retirar todos sus efectos
										personales, deslindando al establecimiento de toda
										responsabilidad sobre los mismos ante falta, hurto o daño.
									</p>
								</div>
								<div>
									<p className="text-sm">
										6. El cliente al firmar este formulario asevera y da fe que el
										auto tiene toda su documentación en regla y autoriza al
										personal del establecimiento a conducirlo dentro del predio
										del taller y en un radio de cinco kilómetros del mismo. Esta
										autorización solo se utilizará en pos de los servicios
										contratados. Cualquier uso fuera de estos parámetros está
										prohibido.
									</p>
								</div>
								<div>
									<p className="text-sm">
										7. En el caso de las devoluciones de equipos instalados o
										repuestos por el motivo que el dueño de la unidad estime,
										según el derecho vigente, se procederá de la siguiente forma:
										A) Se devolverá el dinero por el medio que el establecimiento
										disponga en el momento, en el tiempo máximo de 48 horas de
										manifestado el pedido de devolución y puesta a disposición del
										equipo o repuesto, descontados los tiempos de desinstalación o
										reapropiación por parte del establecimiento. B) Al importe
										devuelto se le descontarán cargos de mano de obra por
										desinstalación que ascienden a cinco mil pesos ($5.000) en el
										caso de equipos de GNC. En los casos de repuestos, será un 40%
										de la mano de obra cobrada.
									</p>
								</div>
							</div>
						</motion.div>
					</div>

					<div
						onClick={toggleOpen}
						className="flex items-center gap-2 mt-6 text-slate-500 hover:text-slate-800 cursor-pointer select-none transition-colors duration-200"
					>
						<ChevronDown
							className={`h-4 w-4 transition-transform duration-200 ${
								isOpen ? "rotate-180" : ""
							}`}
						/>
						<span className="text-sm font-medium">
							{isOpen ? "Ver menos" : "Ver más"}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default LegalText;
