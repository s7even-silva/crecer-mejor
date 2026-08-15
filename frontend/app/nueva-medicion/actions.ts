"use server";

import { revalidatePath } from "next/cache";
import { api, type Evaluacion } from "@/lib/api";

export type ResultadoRegistro =
  | { ok: true; evaluacion: Evaluacion }
  | { ok: false; error: string };

export async function registrarMedicionAction(
  _prev: ResultadoRegistro | null,
  formData: FormData,
): Promise<ResultadoRegistro> {
  const ninoId = String(formData.get("nino_id"));
  const fecha = String(formData.get("fecha"));
  const fuente = String(formData.get("fuente"));
  const pesoValor = Number(formData.get("peso_valor"));
  const pesoUnidad = String(formData.get("peso_unidad"));
  const tallaValor = Number(formData.get("talla_valor"));
  const tallaUnidad = String(formData.get("talla_unidad"));

  if (pesoValor <= 0 || tallaValor <= 0) {
    return { ok: false, error: "Peso y talla deben ser mayores a cero." };
  }

  try {
    await api.registrarMedicion(ninoId, {
      fecha,
      fuente,
      peso_valor: pesoValor,
      peso_unidad: pesoUnidad,
      talla_valor: tallaValor,
      talla_unidad: tallaUnidad,
    });
    const evaluacion = await api.evaluacion(ninoId);
    revalidatePath("/");
    revalidatePath(`/ninos/${ninoId}`);
    return { ok: true, evaluacion };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
