import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";


export default function RegisterPage() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Registro</CardTitle>
					<CardDescription>
						Crea una nueva cuenta para acceder al dashboard.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Nombre Completo</Label>
						<Input id="name" placeholder="Tu nombre" />
					</div>
					<div className="space-y-2">
						<Label htmlFor="email">Correo Electrónico</Label>
						<Input id="email" type="email" placeholder="tu@email.com" />
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Contraseña</Label>
						<Input id="password" type="password" />
					</div>
					<div className="space-y-2">
						<Label htmlFor="confirm-password">Confirmar Contraseña</Label>
						<Input id="confirm-password" type="password" />
					</div>
				</CardContent>
				<CardFooter className="flex flex-col space-y-2">
					<Button className="w-full">Registrarse</Button>
					<p className="text-sm text-center text-gray-600">
						¿Ya tienes una cuenta?{" "}
						<Link href="/login" className="text-blue-600 hover:underline">
							Inicia Sesión
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
