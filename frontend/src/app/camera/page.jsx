"use client"; // Marca este componente como uno que se ejecuta en el cliente

import React, { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

// Registrar los plugins de FilePond
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

export default function CameraFileUpload() {
	const [files, setFiles] = useState([]); // Estado para almacenar los archivos seleccionados
	const comandaId = 44; // ID de comanda dinámico que puedes ajustar según sea necesario

	return (
		<div style={{ textAlign: "center" }} className="w-96 mx-auto">
			<FilePond
				files={files}
				onupdatefiles={setFiles}
				allowMultiple={true}
				maxFiles={5}
				className="w-80 h-80"
				server={{
					url: `${process.env.NEXT_PUBLIC_API_URL}/api/files`,
					process: {
						url: `/${comandaId}`,
						method: "POST",
						withCredentials: false,
						onload: (response) => {
							// Maneja la respuesta de subida
							return JSON.parse(response).id; // Devuelve el ID del archivo
						},
						onerror: (response) => {
							console.error("Error al subir archivo:", response);
						},
					},
					revert: {
						url: `/${comandaId}`,
						method: "DELETE",
						withCredentials: false,
						onload: (response) => {
							console.log("Archivo eliminado correctamente:", response);
						},
						onerror: (response) => {
							console.error("Error al eliminar archivo:", response);
						},
					},
				}}
				name="file" // Nombre del campo en el formulario
				labelIdle='Arrastra tus archivos o <span class="filepond--label-action">Selecciona</span>'
				allowReorder={true}
				instantUpload={false} // Subida manual
			/>
		</div>
	);
}
