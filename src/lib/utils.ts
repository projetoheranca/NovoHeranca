import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  const limited = cleaned.slice(0, 11);
  if (limited.length <= 3) return limited;
  if (limited.length <= 6) return limited.replace(/(\d{3})(\d)/, '$1.$2');
  if (limited.length <= 9) return limited.replace(/(\d{3})(\d{3})(\d)/, '$1.$2.$3');
  return limited.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
}

export function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, '');

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cpf.substring(9, 10))) {
    return false;
  }

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cpf.substring(10, 11))) {
    return false;
  }

  return true;
}


export function formatPhoneNumber(value: string): string {
  if (!value) return "";
  
  // Remove todos os caracteres não numéricos
  const cleaned = value.replace(/\D/g, '');
  
  // Limita o tamanho para o formato completo: 55 (país) + 2 (ddd) + 9 (celular)
  const maxLength = 13; 
  const truncated = cleaned.slice(0, maxLength);
  
  let formatted = '+';
  if (truncated.length > 0) {
    formatted += truncated.slice(0, 2);
  }
  if (truncated.length > 2) {
    formatted += ` (${truncated.slice(2, 4)}`;
  }
  if (truncated.length > 4) {
    formatted += `) ${truncated.slice(4, 9)}`;
  }
  if (truncated.length > 9) {
    formatted += `-${truncated.slice(9, 13)}`;
  }
  
  return formatted;
}


export function getCheckInStatus(lastCheckIn?: string, frequency?: number, gracePeriod?: number): { status: 'ok' | 'risco' | 'inativo', daysRemaining: number | null, nextCheckInDate: Date | null } {
    if (!lastCheckIn || !frequency) {
        return { status: 'ok', daysRemaining: null, nextCheckInDate: null };
    }

    const lastCheckInDate = new Date(lastCheckIn);
    const nextCheckInDate = new Date(lastCheckInDate);
    nextCheckInDate.setDate(lastCheckInDate.getDate() + frequency);

    const now = new Date();
    
    const timeDiff = nextCheckInDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    // Se a data de check-in ainda está no futuro, está tudo OK.
    if (daysRemaining > 0) {
        return { status: 'ok', daysRemaining, nextCheckInDate };
    }
    
    // Se a data de check-in passou, estamos em risco ou inativo.
    const gracePeriodDays = gracePeriod || 7;
    const daysSinceCheckinDue = Math.abs(daysRemaining);

    if (daysSinceCheckinDue >= gracePeriodDays) {
       return { status: 'inativo', daysRemaining, nextCheckInDate };
    }
    
    // Se a data de check-in passou, mas ainda estamos dentro do período de carência.
    return { status: 'risco', daysRemaining, nextCheckInDate };
}


/**
 * Calculates the new subscription start date after applying a reward.
 * @param {string} subscriptionStartDate - The current start date of the subscription.
 * @param {string} createdAt - The creation date of the account.
 * @param {string} subscriptionStatus - The status of the subscription ('Mensal' or 'Anual').
 * @param {number} daysToAdd - The number of days to add as a reward.
 * @returns {string} The new ISO string for the subscription start date.
 */
export function calculateNewSubscriptionStartDate({
    subscriptionStartDate,
    createdAt,
    subscriptionStatus,
    daysToAdd
}: {
    subscriptionStartDate?: string;
    createdAt: string;
    subscriptionStatus: 'Mensal' | 'Anual' | 'trialing' | 'Teste' | 'Pendente';
    daysToAdd: number;
}): { newSubscriptionStartDate: string, newExpirationDate: Date } {

    const currentStartDate = new Date(subscriptionStartDate || createdAt);
    const planDurationInDays = subscriptionStatus === 'Anual' ? 365 : 30;

    // 1. Calculate the current expiration date
    const currentExpirationDate = new Date(currentStartDate);
    currentExpirationDate.setDate(currentStartDate.getDate() + planDurationInDays);

    // 2. Add the reward days to the expiration date
    const newExpirationDate = new Date(currentExpirationDate);
    newExpirationDate.setDate(currentExpirationDate.getDate() + daysToAdd);

    // 3. Calculate the new start date by subtracting the plan duration from the new expiration date
    const newStartDate = new Date(newExpirationDate);
    newStartDate.setDate(newExpirationDate.getDate() - planDurationInDays);

    return { 
        newSubscriptionStartDate: newStartDate.toISOString(),
        newExpirationDate: newExpirationDate
    };
}
