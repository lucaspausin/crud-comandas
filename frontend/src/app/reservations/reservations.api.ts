import axios from "axios";
import { getSession } from "next-auth/react";
import { signOut } from "next-auth/react";

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
	const session = await getSession();
	if (!session) {
		signOut();
		throw new Error(
			"No se encontró la sesión. Asegúrate de estar autenticado."
		);
	}

	try {
		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/summary`,
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.user.token}`,
				},
			}
		);
		return data;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		// Declarar 'error' como 'any'
		if (error.response?.status === 401) {
			signOut(); // Cierra sesión en NextAuth para sincronizar el estado
		}
		throw error;
	}
}

export async function getCommandsSummary() {
	const session = await getSession();
	if (!session) {
		throw new Error(
			"No se encontró la sesión. Asegúrate de estar autenticado."
		);
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
	return data;
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