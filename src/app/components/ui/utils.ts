import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateBiometriaDateRange(
  biometriaDate: string,
  cicloStartDate: string,
  cicloEndDate: string | null,
  entityType: string = 'biometría'
): { valid: boolean; error: string } {
  const fecha = new Date(biometriaDate);
  const fechaInicio = new Date(cicloStartDate);
  const fechaFin = cicloEndDate ? new Date(cicloEndDate) : null;

  if (fecha < fechaInicio) {
    return {
      valid: false,
      error: `La fecha de ${entityType} no puede ser anterior a la fecha de inicio del ciclo.`,
    };
  }

  if (fechaFin && fecha > fechaFin) {
    return {
      valid: false,
      error: `La fecha de ${entityType} no puede ser posterior a la fecha de fin del ciclo.`,
    };
  }

  return { valid: true, error: '' };
}
