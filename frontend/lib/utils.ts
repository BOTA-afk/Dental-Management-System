import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Doctors are always displayed as "Dr. <name>" (without doubling an existing prefix)
export function formatDoctorName(name?: string | null) {
  if (!name) return ""
  const bare = name.trim().replace(/^dr\.?\s+/i, "")
  return `Dr. ${bare}`
}

// Age in whole years from a date of birth (string or Date); null when unknown/invalid
export function calculateAge(dob?: string | Date | null): number | null {
  if (!dob) return null
  const birthDate = new Date(dob)
  if (isNaN(birthDate.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return age >= 0 ? age : null
}
