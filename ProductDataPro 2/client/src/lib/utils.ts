import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function generateFileName(prefix: string, extension: string): string {
  const date = new Date();
  const dateStr = [
    date.getFullYear(),
    ('0' + (date.getMonth() + 1)).slice(-2),
    ('0' + date.getDate()).slice(-2),
  ].join('');
  const timeStr = [
    ('0' + date.getHours()).slice(-2),
    ('0' + date.getMinutes()).slice(-2),
  ].join('');
  
  return `${prefix}_${dateStr}_${timeStr}.${extension}`;
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to safely parse json when fetching data
export function safeJsonParse<T>(data: string, fallback: T): T {
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    console.error('Error parsing JSON', e);
    return fallback;
  }
}

// Helper to generate a random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Safe number conversion
export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}
