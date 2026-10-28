/**
 * Genera la versión de producción en la carpeta indicada por BUILD_DIR
 * (por defecto "dist"), copiando únicamente los archivos que necesita
 * la aplicación para funcionar.
 *
 * Uso: npm run build
 *
 * Quedan fuera: tests/, docs/, node_modules/, package*.json,
 * vitest.config.mjs, .env y archivos temporales.
 */

import { cp, mkdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Archivos que sí forman parte de la aplicación publicada
const ARCHIVOS_PRODUCCION = [
  "index.html",
  "css/style.css",
  "css/bootstrap.min.css",
  "js/app.js",
  "js/bootstrap.min.js",
  "js/jquery.js",
  "js/jquery-ui/jquery-ui.js",
  "audio/alert.mp3",
  "audio/click.mp3",
  "audio/error.mp3",
];

/**
 * Lectura mínima del archivo .env (sin dependencias externas).
 * Solo se usa BUILD_DIR; el resto de variables queda disponible
 * para futuros scripts de despliegue.
 */
async function leerEnv() {
  try {
    const texto = await readFile(path.join(RAIZ, ".env"), "utf8");

    return Object.fromEntries(
      texto
        .split(/\r?\n/)
        .map((linea) => linea.trim())
        .filter((linea) => linea && !linea.startsWith("#") && linea.includes("="))
        .map((linea) => {
          const indice = linea.indexOf("=");
          const clave = linea.slice(0, indice).trim();
          const valor = linea
            .slice(indice + 1)
            .trim()
            .replace(/^["']|["']$/g, "");
          return [clave, valor];
        })
    );
  } catch {
    return {};
  }
}

async function main() {
  const env = await leerEnv();
  const carpetaSalida = env.BUILD_DIR || "dist";
  const destino = path.resolve(RAIZ, carpetaSalida);

  if (!destino.startsWith(RAIZ + path.sep)) {
    throw new Error(`BUILD_DIR debe estar dentro del proyecto: ${carpetaSalida}`);
  }

  // Verificar que todos los archivos existen antes de copiar
  const faltantes = [];
  for (const archivo of ARCHIVOS_PRODUCCION) {
    try {
      await stat(path.join(RAIZ, archivo));
    } catch {
      faltantes.push(archivo);
    }
  }

  if (faltantes.length > 0) {
    throw new Error(`Faltan archivos para la build:\n  - ${faltantes.join("\n  - ")}`);
  }

  await rm(destino, { recursive: true, force: true });
  await mkdir(destino, { recursive: true });

  let bytes = 0;

  for (const archivo of ARCHIVOS_PRODUCCION) {
    const origen = path.join(RAIZ, archivo);
    const salida = path.join(destino, archivo);

    await mkdir(path.dirname(salida), { recursive: true });
    await cp(origen, salida);

    bytes += (await stat(salida)).size;
  }

  const kb = (bytes / 1024).toFixed(1);
  console.log(`✔ Producción generada en ${carpetaSalida}/`);
  console.log(`  ${ARCHIVOS_PRODUCCION.length} archivos · ${kb} KB`);
  console.log("  Incluido: index.html, CSS, JS y audios.");
  console.log("  Excluido: tests/, docs/, node_modules/, package*.json, .env");
}

main().catch((error) => {
  console.error(`✖ ${error.message}`);
  process.exit(1);
});
