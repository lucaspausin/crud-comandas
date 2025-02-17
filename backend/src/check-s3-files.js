const AWS = require('aws-sdk');

// Configuración de AWS
const s3 = new AWS.S3({
  region: 'us-east-2',
  accessKeyId: 'AKIAY6QVYZZZHNNMEIQT',
  secretAccessKey: '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',
});

// Función para listar archivos
async function listFiles() {
  try {
    // Parámetros para listar objetos en el bucket
    const params = {
      Bucket: 'motorgas-testing',
      Prefix: 'uploads/', // Directorio donde están los archivos
    };

    // Obtener lista de objetos
    const data = await s3.listObjectsV2(params).promise();

    // Filtrar y mostrar archivos que contengan 613 o 615 en su nombre o metadata
    console.log('Buscando archivos para comandas 613 y 615...\n');

    data.Contents.forEach((file) => {
      // Obtener detalles del archivo
      s3.headObject(
        {
          Bucket: 'motorgas-testing',
          Key: file.Key,
        },
        (err, metadata) => {
          if (err) {
            console.log(`Error al obtener metadata para ${file.Key}:`, err);
            return;
          }

          // Si el archivo está relacionado con las comandas 613 o 615
          if (file.Key.includes('613') || file.Key.includes('615')) {
            console.log('Archivo encontrado:');
            console.log('Nombre:', file.Key);
            console.log('Tamaño:', (file.Size / 1024).toFixed(2), 'KB');
            console.log('Última modificación:', file.LastModified);
            console.log(
              'URL:',
              `https://motorgas-testing.s3.us-east-2.amazonaws.com/${file.Key}`,
            );
            console.log('-------------------\n');
          }
        },
      );
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejecutar la función
listFiles();
