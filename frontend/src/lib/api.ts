export const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const TOKEN_KEY = "castro_token";

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function handleUnauthorized(): never {
  localStorage.removeItem(TOKEN_KEY);
  window.location.hash = "#login";
  throw new Error("Sessão expirada");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  if (init?.headers) {
    Object.assign(headers, init.headers);
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status === 401) handleUnauthorized();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---- Clients ----

import type { Client } from "@/types/entities";

export const clientsApi = {
  list: () => request<Client[]>("/clients"),
  create: (data: { name: string; cpf: string; processNumber: string }) =>
    request<Client>("/clients", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: { name: string; cpf: string; processNumber: string }) =>
    request<Client>(`/clients/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<void>(`/clients/${id}`, { method: "DELETE" }),
  removeAll: () => request<void>("/clients", { method: "DELETE" }),
};

// ---- Services ----

import type { Service } from "@/types/entities";

export const servicesApi = {
  list: (categoria?: string) =>
    request<Service[]>(categoria ? `/services?categoria=${encodeURIComponent(categoria)}` : "/services"),
  categorias: () => request<string[]>("/services/categorias"),
  create: (data: { title: string; service: string; total: string; ownerName: string; status: string }) =>
    request<Service>("/services", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: { title: string; service: string; total: string; ownerName: string; status: string }) =>
    request<Service>(`/services/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  removeAll: () => request<void>("/services", { method: "DELETE" }),
};

// ---- Dashboard ----

export interface DashboardStats {
  clients: { total: number; active: number; inactive: number; pending: number };
  services: { total: number; open: number; progress: number; done: number; analise: number };
  processos: Record<string, Record<string, number>>;
  corretores: Record<string, number>;
  servicosPorStatus: Record<string, number>;
  totalRecebido: number;
  totalAReceber: number;
  encerrados: number;
  processosPorMes: { mes: string; total: number }[];
  valorRecebidoPorMes: { mes: string; valor: number }[];
  valorPorCategoria: Record<string, number>;
}

export interface DailyCount {
  dia: number;
  total: number;
}

export interface MonthDetail {
  total: number;
  porStatus: Record<string, number>;
  porDia: DailyCount[];
}

export interface CorretorDetalhe {
  corretor: string;
  totalClientes: number;
  totalProcessos: number;
  valorTotal: number;
  processosPorStatus: Record<string, number>;
  processosPorBeneficio: Record<string, number>;
  clientes: {
    nome: string;
    cpf: string;
    beneficio: string;
    status: string;
    valor: string;
    dataProtocolo: string;
  }[];
}

export const dashboardApi = {
  stats: (mes?: number, ano?: number) => {
    const params = mes != null && ano != null ? `?mes=${mes}&ano=${ano}` : "";
    return request<DashboardStats>(`/dashboard/stats${params}`);
  },
  detalhesMes: (ano: string, mes: number) =>
    request<MonthDetail>(`/dashboard/detalhes-mes?ano=${ano}&mes=${mes}`),
  corretores: () => request<string[]>("/dashboard/corretores"),
  corretorDetalhe: (nome: string) =>
    request<CorretorDetalhe>(`/dashboard/corretores/detalhe?nome=${encodeURIComponent(nome)}`),
};

// ---- Import ----

export interface ImportResult {
  success: boolean;
  categoria?: string;
  total?: number;
  error?: string;
}

async function uploadFile(path: string, file: File): Promise<ImportResult> {
  const form = new FormData();
  form.append("file", file);

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { method: "POST", body: form, headers });

  if (res.status === 401) handleUnauthorized();
  return res.json();
}

export const importApi = {
  upload: (file: File) => uploadFile("/import", file),
  categorias: () => request<string[]>("/import/categorias"),
  remover: (categoria: string) =>
    request<void>(`/import/${encodeURIComponent(categoria)}`, { method: "DELETE" }),
};

// ---- Usuarios ----

export interface UsuarioDTO {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  cargo: string;
  criadoEm: string;
}

export const usuariosApi = {
  list: () => request<UsuarioDTO[]>("/usuarios"),
  create: (data: { nome: string; email: string; senha: string; perfil: string; cargo?: string }) =>
    request<UsuarioDTO>("/usuarios", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: { nome?: string; email?: string; senha?: string; perfil?: string; cargo?: string }) =>
    request<UsuarioDTO>(`/usuarios/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<void>(`/usuarios/${id}`, { method: "DELETE" }),
};
