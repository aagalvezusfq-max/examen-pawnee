import { ApiError } from './apiError';
export function idValido(id: string) {
  if (!/^[a-fA-F0-9]{24}$/.test(id)) throw new ApiError(400, 'Identificador inválido');
  return id;
}
/** Lista blanca: impide operadores y campos internos enviados por el cliente. */
export function cuerpo(body: unknown, campos: readonly string[], obligatorios: readonly string[] = []) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApiError(400, 'Se requiere un objeto JSON');
  const datos = body as Record<string, unknown>;
  if (!Object.keys(datos).length) throw new ApiError(400, 'El cuerpo no puede estar vacío');
  if (Object.keys(datos).some(k => !campos.includes(k))) throw new ApiError(400, 'Campos no permitidos en el cuerpo');
  for (const k of obligatorios) if (!(k in datos) || datos[k] === '' || datos[k] === null) throw new ApiError(400, `Falta el campo ${k}`);
  for (const [k,v] of Object.entries(datos)) {
    if (k === 'habilidades') {
      if (!Array.isArray(v) || !v.every(x => typeof x === 'string')) throw new ApiError(400, 'habilidades debe ser string[]');
    } else if (k === 'nivelPeligro') {
      if (typeof v !== 'number' || !Number.isFinite(v) || v < 1 || v > 10) throw new ApiError(400, 'nivelPeligro debe ser un número entre 1 y 10');
    } else if (typeof v !== 'string') throw new ApiError(400, `${k} debe ser texto`);
  }
  return datos;
}
export function queryTexto(value: unknown) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new ApiError(400, 'Filtro inválido');
  return value || undefined;
}
