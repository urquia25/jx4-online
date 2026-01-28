
export interface Product {
  id?: string;
  nombre: string;
  precio: number;
  categoria: string;
  departamento: string;
  descripcion: string;
  imagenurl: string;
  disponible: boolean;
  unidad: string;
  stock?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Config {
  tasa_cambio: number;
  whatsapp_principal: string;
  cintillo?: string;
  [key: string]: any;
}

export interface Category {
  id?: string;
  nombre: string;
  telefono?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id?: string;
  id_pedido?: string;
  telefono: string;
  nombre: string;
  direccion: string;
  productos: CartItem[];
  total: number;
  totalVes: number;
  metodo_pago: 'efectivo' | 'transferencia' | 'pago_movil';
  notas: string;
  fecha?: string;
  estado?: string;
  departamento: string;
}
