
import type { LucideIcon } from "lucide-react";

export type Memory = {
  id: string;
  title: string;
  description: string;
  type: "video" | "audio" | "texto" | "image";
  fileUrl?: string;
  content?: string;
  createdAt: string; // Should be ISO string
  recipients: string[]; // array of recipient IDs
  image?: {
    src: string;
    hint: string;
  };
  tags?: string[];
  fileSize?: number; // in bytes
  duration?: number; // for video/audio, in seconds
  isDelivered?: boolean;
  deliveredAt?: string; // ISO string
  deliveredTo?: {
    recipientId: string;
    name: string;
    email: string;
    deliveredAt: string;
  }[];
};

export type Recipient = {
  id: string;
  name: string;
  email: string;
  relationship: string;
  phone?: string;
};

export type UserProfile = {
  id: string; // This is the RTDB key
  uid: string; // This will be the Firebase Auth UID
  name: string;
  email: string;
  emailVerified?: boolean; // Adicionado para rastrear status de verificação
  phone?: string;
  photoURL?: string | null; // Adicionado para a foto de perfil
  password?: string; // WARNING: Not secure
  cpfHash?: string | null;
  createdAt: string; // ISO string
  lastCheckIn?: string;
  checkInFrequency?: number; // in days
  deliveryGracePeriod?: number; // in days
  status: 'active' | 'suspended' | 'inactive' | 'archived' | 'trialing' | 'pix_pending' | 'waiting_payment'; // Status geral da conta
  checkInStatus?: 'ok' | 'risco' | 'inativo'; // New status for inactivity
  subscriptionStatus: 'Mensal' | 'Anual' | 'trialing' | 'Teste' | 'Pendente' | 'Trial'; // 'trialing' é um status do Stripe
  subscriptionStartDate?: string; // ISO string for when the subscription started or was last renewed
  lastPaymentStatus?: 'Pago' | 'Inadimplente' | 'Pendente';
  lastPaymentMethod?: 'card' | 'pix';
  lastPaymentFailedAt?: string | null; // ISO string for when the last payment failed
  delinquencyNotifiedAt?: string | null; // ISO string for when the first dunning email was sent
  renewalNotifiedAt?: string | null;
  storageUsed: number; // in bytes
  storageLimit: number; // in GB
  secondaryEmail?: string;
  requireDoubleConfirmation?: boolean;
  role: 'user' | 'admin';
  sessionTimeout?: number; // in minutes
  failedLoginAttempts?: number;
  lockoutUntil?: string | null; // ISO string
  stripeCustomerId?: string; // ID do cliente no Stripe
  referredBy?: string | null; // ID do usuário que indicou
  cancellationRequested?: boolean; // Indica se há um pedido de cancelamento pendente
  trialAbuseDetected?: boolean;
  notes?: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: 'google' | 'facebook' | 'youtube' | 'instagram' | 'tiktok' | 'linkedin' | 'direct' | 'other';
  medium?: string;
  campaign?: string;
  status: 'new' | 'contacted' | 'converted' | 'discarded';
  createdAt: string;
  notes?: string;
};

export type SubscriptionPlan = {
  name: string;
  priceMonthly: string;
  priceYearly: string;
  discount: string;
  storage: string;
  features: string[];
  isCurrent?: boolean;
};

export type CheckIn = {
    id: string;
    timestamp: string; // ISO string
    method: 'manual' | 'automatic';
    userId: string;
};

export type ScheduledMemory = {
  id: string;
  date: string; // "yyyy-MM-dd"
  memoryId: string;
  recipientId: string;
  message?: string;
  status: 'scheduled' | 'sent' | 'failed';
  createdAt: string; // ISO string
  sentAt?: string; // ISO string
  errorMessage?: string;
  templateType?: 
    | 'padrão' 
    | 'aniversário' 
    | 'casamento' 
    | 'natal' 
    | 'ano_novo'
    | 'dia_das_maes'
    | 'dia_dos_pais'
    | 'dia_dos_namorados'
    | 'pascoa';
};

export type BillingStats = {
  totalRevenue: number;
  totalStripeRevenue: number;
  totalMercadoPagoRevenue: number;
  newCustomers: number;
  canceledCustomers: number;
  chartData: { 
    date: string;
    stripe: number;
    mercadoPago: number;
  }[];
}

export type CardFingerprint = {
  fingerprint: string;
  userId: string;
  createdAt: string;
};

export type DownloadToken = {
    id: string;
    userId: string;
    memoryId: string;
    recipientId: string;
    status: 'valid' | 'used' | 'expired';
    createdAt: string;
    expiresAt: string;
};

export type CancellationRequest = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: string;
  requestedAt: string;
  status: 'pending' | 'processed';
};

export type CustomEmailTemplate = {
  id: string;
  name: string;
  subject: string;
  content: string; // HTML content
  createdAt: string;
};
