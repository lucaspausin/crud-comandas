import axios from "axios";
import { getSession } from "next-auth/react";
// import { signOut } from "next-auth/react";

export async function getReservations() {
	const { data } = await axios.get(
		`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/`,
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

export async function getReservationSummary() {
	try {
		const session = await getSession();
		if (!session) {
			throw new Error("No session found. Please log in.");
		}

		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/summary`,
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.user.token}`,
				},
			}
		);

		return data; // Devuelve los datos obtenidos
	} catch (error) {
		console.error("Error fetching reservation summary:", error);
		throw new Error("There was an error fetching the reservation summary.");
	}
}

// Función para obtener el resumen de comandos
export async function getCommandsSummary() {
	try {
		const session = await getSession();
		if (!session) {
			throw new Error("No session found. Please log in.");
		}

		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/commands/summary`,
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.user.token}`,
				},
			}
		);

		return data; // Devuelve los datos obtenidos
	} catch (error) {
		console.error("Error fetching commands summary:", error);
		throw new Error("There was an error fetching the commands summary.");
	}
}

export async function getEventsCalendar() {
	const { data } = await axios.get(
		`${process.env.NEXT_PUBLIC_API_URL}/api/calendar/`,
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	return data;
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
