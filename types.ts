export interface Product {
  id: string;
  nombre: string;
  categoria: string; // Ahora contiene el ID del departamento (ej: H001)
  descripcion: string;
  precio: number;
  inventario: number;
  imagenurl: string;
  imagenurl_publica?: string;
  whatsapp_vendedor?: string; // Teléfono específico del departamento
}

export interface CartItem extends Product {
  cantidadSeleccionada: number;
}

export interface Cliente {
  nombre: string;
  telefono: string;
  direccion: string;
  notas?: string;
}

export interface OrderRecord {
  idPedido: string;
  fecha: string;
  estado: string;
  cliente: Cliente;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Department {
  id: string;      // ID único (Key)
  nombre: string;  // Nombre visual (Label)
  telefono: string;
}

export interface AppConfig {
  tasaDolar: number;
  whatsappPrincipal: string;
  folderIdImagenes: string;
  appSheetAppName: string;
  appSheetTableName: string;
  departments: Department[];
}