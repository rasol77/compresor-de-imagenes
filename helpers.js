const fs = require('fs/promises');

//función que un path existe en HD
async function pathExists(path) {
  try {
    await fs.access(path);
  } catch {
    throw new Error(`La ruta ${path} no existe`);
  }
}

//función que crea un path en HD si no existe
async function createPathIfnotExists(path) {
  try {
    await fs.access(path);
  } catch {
    await fs.mkdir(path);
  }
}

module.exports = {
  pathExists,
  createPathIfnotExists,
};
