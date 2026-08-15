const API_URL = process.env.API_URL ?? "http://localhost:8000";

export type Nino = {
  id: string;
  codigo: string;
  sexo: "M" | "F";
  fecha_nacimiento: string;
};

export type RadarFila = {
  nino_id: string;
  codigo: string;
  nivel: "VERDE" | "AMBAR" | "ROJO";
  puntaje: number;
  controles: number;
};

export type Control = {
  fecha: string;
  fuente: string;
  peso_original: [number, string];
  talla_original: [number, string];
  peso_kg: number;
  talla_cm: number;
  edad_meses: number;
  valido: boolean;
  razones_invalidez: string[];
  zscores: Record<string, number>;
  flags_biv: Record<string, boolean>;
  clasificacion: Record<string, string>;
  confianza?: "normal" | "baja";
};

export type Evaluacion = {
  controles: Control[];
  tendencia: {
    delta_z: Record<string, number>;
    velocidad_z_mes: Record<string, number>;
    cruce_canal: Record<string, boolean>;
    descenso_detectado: boolean;
  };
  prioridad: {
    puntaje: number;
    nivel: "VERDE" | "AMBAR" | "ROJO";
    razones: string[];
  };
};

export type VerificacionFila = {
  sexo: string;
  edad_meses: number;
  peso_referencia_kg: number;
  de_esperado: number;
  z_motor: number;
  error_absoluto: number;
};

export type Verificacion = {
  filas: VerificacionFila[];
  error_maximo_absoluto: number;
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`API ${res.status}: ${detail}`);
  }
  return res.json();
}

export const api = {
  ninos: () => apiFetch<Nino[]>("/ninos"),
  radar: () => apiFetch<RadarFila[]>("/radar"),
  evaluacion: (ninoId: string) =>
    apiFetch<Evaluacion>(`/ninos/${ninoId}/evaluacion`),
  verificacion: () => apiFetch<Verificacion>("/verificacion"),
  registrarMedicion: (
    ninoId: string,
    medicion: {
      fecha: string;
      fuente: string;
      peso_valor: number;
      peso_unidad: string;
      talla_valor: number;
      talla_unidad: string;
    },
  ) =>
    apiFetch(`/ninos/${ninoId}/mediciones`, {
      method: "POST",
      body: JSON.stringify(medicion),
    }),
};
