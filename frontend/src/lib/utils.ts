import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names safely with tailwind-merge and clsx.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format timestamp or ISO string to HH:mm:ss mission clock time.
 */
export function formatTime(dateOrIso?: string | number | Date | null): string {
  if (!dateOrIso) return "--:--:--";
  try {
    const d = typeof dateOrIso === "string" || typeof dateOrIso === "number"
      ? new Date(dateOrIso)
      : dateOrIso;
    if (isNaN(d.getTime())) {
      // Handle SQLite format "YYYY-MM-DD HH:MM:SS" without T
      if (typeof dateOrIso === "string") {
        const parsed = new Date(dateOrIso.replace(" ", "T"));
        if (!isNaN(parsed.getTime())) {
          return parsed.toLocaleTimeString("en-GB", { hour12: false });
        }
      }
      return "--:--:--";
    }
    return d.toLocaleTimeString("en-GB", { hour12: false });
  } catch {
    return "--:--:--";
  }
}

/**
 * Format timestamp or ISO string to readable mission date and time string.
 */
export function formatDate(dateOrIso?: string | number | Date | null): string {
  if (!dateOrIso) return "--";
  try {
    const d = typeof dateOrIso === "string" || typeof dateOrIso === "number"
      ? new Date(dateOrIso)
      : dateOrIso;
    if (isNaN(d.getTime())) {
      if (typeof dateOrIso === "string") {
        const parsed = new Date(dateOrIso.replace(" ", "T"));
        if (!isNaN(parsed.getTime())) {
          return parsed.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          });
        }
      }
      return String(dateOrIso);
    }
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return String(dateOrIso ?? "--");
  }
}

export interface BatteryEstimate {
  hours: number;
  minutes: number;
  formatted: string;
  isLow: boolean;
  isCritical: boolean;
}

/**
 * Calculates estimated battery operating hours based on 3S Li-ion capacity,
 * current voltage/percentage, and motor state.
 *
 * Rover hardware: 3S 5000mAh LiPo/Li-ion pack.
 * Standby draw (Pi4 + ESP32 + MLX90640 + BME280 + INMP441 + Wi-Fi): ~1.2A
 * Active motor drive draw (4x TT / planetary geared motors): ~3.8A
 */
export function calculateBatteryHours(
  batteryVoltage: number,
  batteryPercent: number,
  isMotorsActive: boolean = false
): BatteryEstimate {
  const percent = Math.max(0, Math.min(100, batteryPercent || 0));
  const capacityAh = 5.0 * (percent / 100);
  const currentDrawA = isMotorsActive ? 3.8 : 1.2;

  const rawHours = capacityAh / currentDrawA;
  const hours = Math.floor(rawHours);
  const minutes = Math.round((rawHours - hours) * 60);

  const isLow = percent <= 25 || (batteryVoltage > 0 && batteryVoltage <= 10.5);
  const isCritical = percent <= 10 || (batteryVoltage > 0 && batteryVoltage <= 9.9);

  let formatted = `${hours}h ${minutes}m`;
  if (percent <= 0) {
    formatted = "0h 0m";
  }

  return {
    hours,
    minutes,
    formatted,
    isLow,
    isCritical,
  };
}

export interface PPMStatusResult {
  level: "SAFE" | "WARNING" | "DANGER";
  label: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  description: string;
}

/**
 * DGMS Coal Mines Regulations 2017 compliant PPM status classifier.
 * - MQ-7 (Carbon Monoxide / Afterdamp):
 *     Safe: < 25 ppm | Warning: 25 - 50 ppm | Danger: > 50 ppm (Statutory limit)
 * - MQ-135 (Air Quality / Smoke / CO2 / Inundation gases):
 *     Safe: < 400 ppm | Warning: 400 - 800 ppm | Danger: > 800 ppm
 */
export function getPPMStatus(gasType: "mq7" | "mq135", ppm: number): PPMStatusResult {
  const val = Math.max(0, ppm || 0);

  if (gasType === "mq7") {
    if (val > 50.0) {
      return {
        level: "DANGER",
        label: "DGMS Hazard",
        color: "#EF4444",
        badgeBg: "bg-red-500/15",
        badgeText: "text-red-400",
        borderClass: "border-red-500/40",
        description: "Exceeds DGMS Statutory Limit (50 ppm). Fatal without BA set.",
      };
    }
    if (val >= 25.0) {
      return {
        level: "WARNING",
        label: "DGMS Alert",
        color: "#F59E0B",
        badgeBg: "bg-amber-500/15",
        badgeText: "text-amber-400",
        borderClass: "border-amber-500/40",
        description: "Elevated CO levels (>=25 ppm). Approaching threshold.",
      };
    }
    return {
      level: "SAFE",
      label: "Permissible",
      color: "#10B981",
      badgeBg: "bg-emerald-500/15",
      badgeText: "text-emerald-400",
      borderClass: "border-emerald-500/40",
      description: "Safe atmospheric envelope (<25 ppm).",
    };
  }

  // MQ-135 (Air / Toxic gases / Smoke)
  if (val > 800.0) {
    return {
      level: "DANGER",
      label: "Toxic Dense",
      color: "#EF4444",
      badgeBg: "bg-red-500/15",
      badgeText: "text-red-400",
      borderClass: "border-red-500/40",
      description: "Severe toxic fumes / smoke concentration (>800 ppm).",
    };
  }
  if (val >= 400.0) {
    return {
      level: "WARNING",
      label: "Caution",
      color: "#F59E0B",
      badgeBg: "bg-amber-500/15",
      badgeText: "text-amber-400",
      borderClass: "border-amber-500/40",
      description: "High particulate or combustive byproduct contamination (400-800 ppm).",
    };
  }
  return {
    level: "SAFE",
    label: "Normal",
    color: "#10B981",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-400",
    borderClass: "border-emerald-500/40",
    description: "Good ventilation & clean air column (<400 ppm).",
  };
}

/**
 * Formats distance with unit and safety color indication.
 */
export function formatDistance(distanceCm: number): {
  formatted: string;
  isObstacle: boolean;
  colorClass: string;
} {
  const d = Math.max(0, Math.round(distanceCm || 0));
  const isObstacle = d < 25;
  return {
    formatted: `${d} cm`,
    isObstacle,
    colorClass: isObstacle ? "text-red-400" : d < 50 ? "text-amber-400" : "text-emerald-400",
  };
}
