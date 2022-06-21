const minimist = require('minimist');
const path = require('path');
const fs = require('fs/promises');
const sharp = require('sharp');

const { pathExists, createPathIfnotExists } = require('./helpers');
const { exit } = require('process');

const args = minimist(process.argv.splice(2));

//Función para procesar
async function processImages({ inputDir, outputDir, watermark, resize }) {
  try {
    const inputPath = path.resolve(__dirname, inputDir);
    const outputPath = path.resolve(__dirname, outputDir);
    let watermarkPath;
    if (watermark) {
      watermarkPath = path.resolve(__dirname, watermark);
    }

    //Comprobar que inputDir existe
    await pathExists(inputPath);

    //Crear si no existe outputDir
    await createPathIfnotExists(outputPath);
    //Si existe watermark colocar y comprobar el archivo watermark
    if (watermarkPath) {
      await pathExists(watermarkPath);
    }
    //Leer los archivos de inputDir

    const inputFiles = await fs.readdir(inputPath);

    //Quedarnos solo con los archivos que sean imágenes

    const imageFiles = inputFiles.filter((file) => {
      const validExtensions = ['.jpg', '.jpeg', '.gif', '.png', '.webp'];

      return validExtensions.includes(path.extname(file).toLowerCase());
    });

    //Recorrer toda la lista de archivos :
    for (const imageFile of imageFiles) {
      console.log(`Procesando imagen ${imageFile}`);
      //Creamos la ruta completa de la imagen
      const imagePath = path.resolve(inputPath, imageFile);

      //Cargamos la imagen en sharp
      const image = sharp(imagePath);

      //si existe resize hacemos el resize
      if (resize) {
        image.resize(resize);
      }

      //Guardamos la imagen con otro nombre en outputPath
      await image.toFile(path.resolve(outputPath, `processed_${imageFile}`));
    }

    //Si existe "watermark" colocar la marka en la imágenes

    if (resize) {
      image.composite([
        {
          input: watermarkPath,
          top: 20,
          left: 20,
        },
      ]);
    }
    //Guardar la imágen en outputDir
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

//Proceso los argumentos
const { inputDir, outputDir, watermark, resize } = args;

//si no existe inputDir  o OutputDir muestro un error y sale del programa
if (!inputDir || !outputDir) {
  console.error('Los argumentos --inputDir y --outputDir son obligatorios');
  process.exit(1);
}

//Si no existe watermark o resize muestra un error y sale el proceso
if (!watermark && !resize) {
  console.error('Es necesario que exista un argumento --watermark o --resize');
  process.exit(1);
}

//Todos los argumentos estan correctos, segumos

console.log('Procesando imágenes ...');
console.log();

processImages({ inputDir, outputDir, watermark, resize });
