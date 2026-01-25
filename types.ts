
export interface Product {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  descripcion: string;
  imagenurl: string;
  imagenurl_publica?: string;
  departamento?: string;
  disponible: boolean;
}

export interface Config {
  tasa_cambio: number;
  whatsapp_principal: string;
  moneda: string;
  cintillo?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Customer {
  telefono: string;
  nombre: string;
  direccion: string;
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

export interface Category {
  id: string;
  nombre: string;
}

export interface AppData {
  productos: Product[];
  config: Config;
  departamentos: Category[];
  cintillo: string;
}
