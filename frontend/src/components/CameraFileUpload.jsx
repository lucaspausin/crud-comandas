import React, { useState, useEffect } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

// Registrar los plugins de FilePond
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

function CameraFileUpload({ comandaId, setComanda }) {
	const [files, setFiles] = useState([]); // Estado para almacenar los archivos seleccionados
	const [uploadedCount, setUploadedCount] = useState(0);

	const handleFileUpload = (response) => {
		const uploadedFile = JSON.parse(response); // Suponiendo que la respuesta contiene el archivo subido

		// Actualizamos el estado con el nuevo archivo subido
		setComanda((prevComanda) => ({
			...prevComanda,
			archivo: [...prevComanda.archivo, uploadedFile], // Añadimos el archivo al array de archivos
		}));

		// Incrementar el contador de archivos subidos
		setUploadedCount((prev) => prev + 1);
	};

	// Nuevo efecto para limpiar los archivos cuando todos se hayan subido
	useEffect(() => {
		if (uploadedCount > 0 && uploadedCount === files.length) {
			setFiles([]);
			setUploadedCount(0);
		}
	}, [uploadedCount, files.length]);

	return (
		<div
			style={{ textAlign: "center" }}
			className="w-full col-span-full text-zinc-500"
		>
			{/* Contenedor con scroll si el contenido es demasiado grande */}
			<div className="w-full h-full overflow-y-auto">
				<FilePond
					files={files}
					onupdatefiles={setFiles}
					allowMultiple={true}
					maxFiles={10}
					className="w-full h-full text-zinc-500"
					server={{
						url: `${process.env.NEXT_PUBLIC_API_URL}/api/files`,
						process: {
							url: `/${comandaId}`,
							method: "POST",
							withCredentials: false,
							onload: handleFileUpload, // Actualizamos la comanda con el archivo subido
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
								setFiles([]); // También limpiamos los archivos al eliminar
							},
							onerror: (response) => {
								console.error("Error al eliminar archivo:", response);
							},
						},
					}}
					name="file" // Nombre del campo en el formulario
					labelIdle='Arrastra tus archivos o <span class="filepond--label-action">Selecciona</span>'
					allowReorder={true}
					instantUpload={true} // Cambiado a true para subida automática
				/>
			</div>
		</div>
	);
}

export default CameraFileUpload;
