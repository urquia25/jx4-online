
export interface Product {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  descripcion: string;
  imagenurl: string;
  departamento_id?: string;
  disponible: boolean;
}

export interface Config {
  tasa_cambio: number;
  whatsapp_principal: string;
  app_name?: string;
  admin_user?: string;
  admin_pass?: string;
  [key: string]: any;
}

export interface Category {
  id?: string;
  nombre: string;
  telefono?: string;
}

export interface Cintillo {
  texto: string;
  tipo: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
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
  status?: string;
}
