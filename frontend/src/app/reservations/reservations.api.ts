/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { getSession } from "next-auth/react";
// import { signOut } from "next-auth/react";

declare module "next-auth" {
	interface User {
		exp?: number;
	}
}

export const dynamic = "force-dynamic";
export async function getReservations() {
	const { data } = await axios.get(
		`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/`, // Note los backticks
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	return data;
}

export async function getReservation(id: string) {
	const { data } = await axios.get(
		`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/${id}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	return data;
}

export async function deleteReservation(id: string) {
	const { data } = await axios.delete(
		`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/${id}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	return data;
}

export async function deleteCommand(id: string) {
	const { data } = await axios.delete(
		`${process.env.NEXT_PUBLIC_API_URL}/api/commands/${id}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	return data;
}

export async function getUsers() {
	const { data } = await axios.get(
		`${process.env.NEXT_PUBLIC_API_URL}/api/users/`,
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	return data;
}

export async function getUser(id: string) {
	const { data } = await axios.get(
		`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	return data;
}

export async function getCommands() {
	const { data } = await axios.get(
		`${process.env.NEXT_PUBLIC_API_URL}/api/commands/`,
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	return data;
}

export async function getCommand(id: string) {
	const { data } = await axios.get(
		`${process.env.NEXT_PUBLIC_API_URL}/api/commands/${id}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	return data;
}

export async function getCommandCSV(id: string) {
	const { data } = await axios.get(
		`${process.env.NEXT_PUBLIC_API_URL}/api/commands/csv/${id}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	return data;
}

async function getAuthHeaders() {
	const session = await getSession();
	if (!session?.user?.token) {
		throw new Error("No authentication token available");
	}

	// Verificar si el token está próximo a expirar (por ejemplo, en 1 hora)
	const tokenExp = (session.user as any).exp;
	const now = Math.floor(Date.now() / 1000);

	if (tokenExp && tokenExp - now < 3600) {
		// Si el token está próximo a expirar, intentar renovarlo
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${session.user.token}`,
					},
				}
			);

			if (response.ok) {
				const newToken = await response.json();
				// Actualizar el token en la sesión
				await fetch("/api/auth/session", {
					method: "POST",
					body: JSON.stringify({ token: newToken }),
				});

				return {
					"Content-Type": "application/json",
					Authorization: `Bearer ${newToken.token}`,
				};
			}
		} catch (error) {
			console.error("Error refreshing token:", error);
		}
	}

	return {
		"Content-Type": "application/json",
		Authorization: `Bearer ${session.user.token}`,
	};
}

// Función para refrescar el token si es necesario
async function handleTokenRefresh() {
	const session = await getSession();
	if (!session) {
		throw new Error("No session found");
	}

	// Aquí podrías implementar la lógica para refrescar el token si es necesario
	// Por ejemplo, verificar si el token está próximo a expirar
	return session;
}

export async function getReservationSummary() {
	try {
		await handleTokenRefresh(); // Intentar refrescar el token si es necesario
		const headers = await getAuthHeaders();

		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/summary`,
			{ headers }
		);

		return data;
	} catch (error) {
		console.error("Error fetching reservation summary:", error);
		if (axios.isAxiosError(error) && error.response?.status === 401) {
			// Si el error es de autorización, podríamos intentar renovar la sesión
			// o redirigir al login
			throw new Error("Session expired. Please login again.");
		}
		throw new Error("There was an error fetching the reservation summary.");
	}
}

export async function getCommandsSummary() {
	try {
		await handleTokenRefresh(); // Intentar refrescar el token si es necesario
		const headers = await getAuthHeaders();

		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/commands/summary`,
			{ headers }
		);

		return data;
	} catch (error) {
		console.error("Error fetching commands summary:", error);
		if (axios.isAxiosError(error) && error.response?.status === 401) {
			throw new Error("Session expired. Please login again.");
		}
		throw new Error("There was an error fetching the commands summary.");
	}
}

export async function getEventsCalendar() {
	try {
		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/calendar/`, // URL completa de la API
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
		console.log("API URL:", process.env.NEXT_PUBLIC_API_URL); // Para debug
		return data;
	} catch (error) {
		console.error("Error fetching calendar events:", error);
		throw error;
	}
}

interface CommandData {
	reductor_cod?: string;
	reductor_numero?: number;
	cilindro_1_cod?: string;
	cilindro_1_numero?: number;
	valvula_1_cod?: string;
	valvula_1_numero?: number;
	reforma_escape_texto?: string;
	carga_externa?: boolean;
	precio_carga_externa?: number;
	cilindro_2_cod?: string;
	cilindro_2_numero?: number;
	valvula_2_cod?: string;
	valvula_2_numero?: number;
	cuna?: string;
	materiales?: string;
}

export async function updateCommand(id: string, data: CommandData) {
	return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/commands/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
}

export async function updateCalendar(id: string, data: any) {
	return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
}

export async function deleteArchive(id: string) {
	const { data } = await axios.delete(
		`${process.env.NEXT_PUBLIC_API_URL}/api/files/${id}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	return data;
}

export async function getTechniques() {
	const { data } = await axios.get(
		`${process.env.NEXT_PUBLIC_API_URL}/api/techniques/`,
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	return data;
}

export async function getTechnique(id: string) {
	const { data } = await axios.get(
		`${process.env.NEXT_PUBLIC_API_URL}/api/techniques/${id}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	return data;
}

// Crear una función que agrupe todas las llamadas necesarias
export async function getDashboardData() {
	try {
		const [
			reservationsData,
			commandsData,
			reservationsSummaryData,
			commandsSummaryData,
		] = await Promise.all([
			getReservations(),
			getCommands(),
			getReservationSummary(),
			getCommandsSummary(),
		]);

		return {
			reservations: reservationsData,
			commands: commandsData,
			reservationsSummary: reservationsSummaryData,
			commandsSummary: commandsSummaryData,
		};
	} catch (error) {
		console.error("Error fetching dashboard data:", error);
		throw error;
	}
}
export async function updateFileVerification(id: string) {
	const data = { verificado: true }; // Set verificado to true
	return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
}
