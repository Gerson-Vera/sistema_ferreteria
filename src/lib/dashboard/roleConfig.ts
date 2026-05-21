// ─── Tipos ────────────────────────────────────────────────────────────────────
export type KPIDefinition = {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  mockValue: string;
  mockChange: string;
  mockTrend: 'up' | 'down' | 'neutral';
};

export type ReporteKey = 'ventas' | 'compras' | 'inventario' | 'clientes' | 'movimientos';

export type ReporteDefinition = {
  id: string;
  nombre: string;
  descripcion: string;
  icon: string;
  href: string;
  key: ReporteKey;
  formatos: ('PDF' | 'Excel')[];
};

export type ChartPoint = { label: string; valor: number };

export type ChartDefinition = {
  tipo: 'bar';
  titulo: string;
  subtitulo: string;
  data: ChartPoint[];
  color: string;
};

export type ModuloInfo = {
  nombre: string;
  descripcion: string;
  icon: string;
  color: string;
  href: string;
};

// ─── KPIs por rol ─────────────────────────────────────────────────────────────
export const KPI_BY_ROL: Record<string, KPIDefinition[]> = {
  ADMIN: [
    { id: 'ventas_dia',      label: 'Ventas del día',        icon: 'currency-dollar',   color: '#F5A623', bgColor: 'rgba(245,166,35,0.15)',  mockValue: 'S/ 4,280',  mockChange: '+12% vs ayer',   mockTrend: 'up'      },
    { id: 'ventas_mes',      label: 'Ventas del mes',        icon: 'chart-bar',         color: '#3498DB', bgColor: 'rgba(52,152,219,0.15)', mockValue: 'S/ 42,890', mockChange: '+8.3% vs mes ant.', mockTrend: 'up'    },
    { id: 'stock_critico',   label: 'Stock crítico',         icon: 'cube',              color: '#E74C3C', bgColor: 'rgba(231,76,60,0.15)',  mockValue: '14 prods',  mockChange: '+3 hoy',         mockTrend: 'down'    },
    { id: 'clientes_nuevos', label: 'Clientes nuevos',       icon: 'users',             color: '#2ECC71', bgColor: 'rgba(46,204,113,0.15)', mockValue: '8',         mockChange: '+2 hoy',         mockTrend: 'up'      },
    { id: 'caja_actual',     label: 'Caja actual',           icon: 'banknotes',         color: '#9B59B6', bgColor: 'rgba(155,89,182,0.15)', mockValue: 'S/ 12,340', mockChange: '+5.1%',          mockTrend: 'up'      },
    { id: 'utilidad',        label: 'Utilidad bruta',        icon: 'arrow-trending-up', color: '#1ABC9C', bgColor: 'rgba(26,188,156,0.15)', mockValue: 'S/ 18,650', mockChange: '+14.2% mes',     mockTrend: 'up'      },
  ],
  VENDEDOR: [
    { id: 'mis_ventas_dia',  label: 'Mis ventas hoy',        icon: 'currency-dollar',   color: '#F5A623', bgColor: 'rgba(245,166,35,0.15)',  mockValue: 'S/ 1,240',  mockChange: '+6% vs ayer',    mockTrend: 'up'      },
    { id: 'mis_ventas_mes',  label: 'Mis ventas del mes',    icon: 'chart-bar',         color: '#3498DB', bgColor: 'rgba(52,152,219,0.15)', mockValue: 'S/ 8,480',  mockChange: '-2% vs mes ant.',mockTrend: 'down'    },
    { id: 'clientes_hoy',    label: 'Clientes atendidos',    icon: 'users',             color: '#2ECC71', bgColor: 'rgba(46,204,113,0.15)', mockValue: '12',        mockChange: '+4 vs ayer',     mockTrend: 'up'      },
    { id: 'productos_disp',  label: 'Prods. disponibles',    icon: 'cube',              color: '#9B59B6', bgColor: 'rgba(155,89,182,0.15)', mockValue: '1,284',     mockChange: 'en stock',       mockTrend: 'neutral' },
  ],
  ALMACEN: [
    { id: 'criticos',        label: 'Stock crítico (<5)',     icon: 'cube',              color: '#E74C3C', bgColor: 'rgba(231,76,60,0.15)',  mockValue: '23 prods',  mockChange: '+5 nuevos',      mockTrend: 'down'    },
    { id: 'ingresos_hoy',    label: 'Ingresos mercadería',   icon: 'truck',             color: '#2ECC71', bgColor: 'rgba(46,204,113,0.15)', mockValue: '4 guías',   mockChange: '+1 vs ayer',     mockTrend: 'up'      },
    { id: 'sin_stock',       label: 'Sin stock',             icon: 'archive-box',       color: '#E67E22', bgColor: 'rgba(230,126,34,0.15)', mockValue: '7 prods',   mockChange: '-2 vs ayer',     mockTrend: 'up'      },
    { id: 'movimientos',     label: 'Movimientos hoy',       icon: 'arrow-trending-up', color: '#3498DB', bgColor: 'rgba(52,152,219,0.15)', mockValue: '38',        mockChange: '+12 vs ayer',    mockTrend: 'up'      },
  ],
  CAJERO: [
    { id: 'estado_caja',     label: 'Estado de caja',        icon: 'banknotes',         color: '#2ECC71', bgColor: 'rgba(46,204,113,0.15)', mockValue: 'Abierta',   mockChange: 'desde 08:00',    mockTrend: 'neutral' },
    { id: 'cobrado_hoy',     label: 'Total cobrado',         icon: 'currency-dollar',   color: '#F5A623', bgColor: 'rgba(245,166,35,0.15)',  mockValue: 'S/ 3,820',  mockChange: '+9% vs ayer',    mockTrend: 'up'      },
    { id: 'transacciones',   label: 'Transacciones hoy',     icon: 'document-text',     color: '#3498DB', bgColor: 'rgba(52,152,219,0.15)', mockValue: '47',        mockChange: '+3 vs ayer',     mockTrend: 'up'      },
    { id: 'ultimo_cierre',   label: 'Último cierre',         icon: 'clock',             color: '#95A5A6', bgColor: 'rgba(149,165,166,0.15)',mockValue: 'S/ 6,240',  mockChange: 'ayer 18:30',     mockTrend: 'neutral' },
  ],
  CONTADOR: [
    { id: 'ingresos_mes',    label: 'Ingresos del mes',      icon: 'arrow-trending-up', color: '#2ECC71', bgColor: 'rgba(46,204,113,0.15)', mockValue: 'S/ 42,890', mockChange: '+8.3%',          mockTrend: 'up'      },
    { id: 'egresos_mes',     label: 'Egresos del mes',       icon: 'chart-bar',         color: '#E74C3C', bgColor: 'rgba(231,76,60,0.15)',  mockValue: 'S/ 24,230', mockChange: '+3.1%',          mockTrend: 'down'    },
    { id: 'utilidad_bruta',  label: 'Utilidad bruta',        icon: 'currency-dollar',   color: '#F5A623', bgColor: 'rgba(245,166,35,0.15)',  mockValue: 'S/ 18,660', mockChange: '+14.2%',         mockTrend: 'up'      },
    { id: 'cuentas_cobrar',  label: 'Cuentas por cobrar',    icon: 'document-text',     color: '#9B59B6', bgColor: 'rgba(155,89,182,0.15)', mockValue: 'S/ 7,840',  mockChange: '-5% pagado',     mockTrend: 'up'      },
  ],
};

// ─── Gráficos por rol ─────────────────────────────────────────────────────────
export const CHART_BY_ROL: Record<string, ChartDefinition | null> = {
  ADMIN: {
    tipo:      'bar',
    titulo:    'Ventas — últimos 7 días',
    subtitulo: 'En soles (S/)',
    color:     '#F5A623',
    data: [
      { label: 'Lun',  valor: 3200 },
      { label: 'Mar',  valor: 4100 },
      { label: 'Mié',  valor: 2800 },
      { label: 'Jue',  valor: 5200 },
      { label: 'Vie',  valor: 6800 },
      { label: 'Sáb',  valor: 8400 },
      { label: 'Hoy',  valor: 4280 },
    ],
  },
  VENDEDOR: null,
  ALMACEN: {
    tipo:      'bar',
    titulo:    'Productos con stock bajo',
    subtitulo: 'Por categoría',
    color:     '#E74C3C',
    data: [
      { label: 'Herramientas', valor: 8 },
      { label: 'Pinturas',     valor: 5 },
      { label: 'Tornillos',    valor: 4 },
      { label: 'Tuberías',     valor: 3 },
      { label: 'Eléctricos',   valor: 3 },
    ],
  },
  CAJERO: {
    tipo:      'bar',
    titulo:    'Transacciones por hora',
    subtitulo: 'Hoy',
    color:     '#3498DB',
    data: [
      { label: '08h', valor: 3 },
      { label: '09h', valor: 6 },
      { label: '10h', valor: 8 },
      { label: '11h', valor: 9 },
      { label: '12h', valor: 5 },
      { label: '13h', valor: 4 },
      { label: '14h', valor: 6 },
      { label: '15h', valor: 6 },
    ],
  },
  CONTADOR: null,
};

// ─── Reportes por rol ─────────────────────────────────────────────────────────
export const REPORTES_BY_ROL: Record<string, ReporteDefinition[]> = {
  ADMIN: [
    { id: 'ventas_diario',  nombre: 'Reporte de Ventas',    descripcion: 'Historial completo de ventas con filtros por fecha, cliente y estado', icon: 'chart-bar',         href: '/dashboard/reportes', key: 'ventas',      formatos: ['PDF', 'Excel'] },
    { id: 'compras',        nombre: 'Reporte de Compras',   descripcion: 'Historial de compras a proveedores con desglose y estado',             icon: 'truck',             href: '/dashboard/reportes', key: 'compras',     formatos: ['PDF', 'Excel'] },
    { id: 'inventario',     nombre: 'Inventario General',   descripcion: 'Stock actual de todos los productos con precios y valorización',        icon: 'cube',              href: '/dashboard/reportes', key: 'inventario',  formatos: ['PDF', 'Excel'] },
    { id: 'clientes',       nombre: 'Reporte de Clientes',  descripcion: 'Base de datos de clientes, documentos y datos de contacto',           icon: 'users',             href: '/dashboard/reportes', key: 'clientes',    formatos: ['PDF', 'Excel'] },
    { id: 'movimientos',    nombre: 'Movimientos de Stock', descripcion: 'Kardex completo: entradas, salidas y ajustes de inventario',           icon: 'arrow-trending-up', href: '/dashboard/reportes', key: 'movimientos', formatos: ['PDF', 'Excel'] },
  ],
  VENDEDOR: [
    { id: 'mis_ventas',  nombre: 'Mis Ventas',          descripcion: 'Historial de ventas realizadas con filtros de fecha y cliente',    icon: 'shopping-cart', href: '/dashboard/reportes', key: 'ventas',   formatos: ['PDF', 'Excel'] },
    { id: 'clientes_v',  nombre: 'Clientes Registrados',descripcion: 'Directorio de clientes con información de contacto',              icon: 'users',         href: '/dashboard/reportes', key: 'clientes', formatos: ['PDF', 'Excel'] },
  ],
  ALMACEN: [
    { id: 'stock_actual', nombre: 'Stock Actual',           descripcion: 'Inventario completo con cantidades, ubicaciones y alertas',     icon: 'cube',        href: '/dashboard/reportes', key: 'inventario',  formatos: ['PDF', 'Excel'] },
    { id: 'movimientos',  nombre: 'Movimientos de Almacén', descripcion: 'Historial de entradas, salidas y ajustes de inventario',        icon: 'truck',       href: '/dashboard/reportes', key: 'movimientos', formatos: ['PDF', 'Excel'] },
    { id: 'compras_a',    nombre: 'Compras Recibidas',      descripcion: 'Ingresos de mercadería con estado de recepción por proveedor',  icon: 'archive-box', href: '/dashboard/reportes', key: 'compras',     formatos: ['PDF', 'Excel'] },
  ],
  CAJERO: [
    { id: 'transacciones', nombre: 'Historial de Ventas',  descripcion: 'Todas las transacciones procesadas con filtros de fecha',     icon: 'document-text', href: '/dashboard/reportes', key: 'ventas',  formatos: ['PDF', 'Excel'] },
    { id: 'clientes_c',    nombre: 'Clientes',             descripcion: 'Directorio de clientes atendidos con datos de contacto',      icon: 'users',         href: '/dashboard/reportes', key: 'clientes',formatos: ['PDF', 'Excel'] },
  ],
  CONTADOR: [
    { id: 'ventas_mes',    nombre: 'Ventas del Período',    descripcion: 'Ingresos por ventas en el período seleccionado',              icon: 'chart-bar',         href: '/dashboard/reportes', key: 'ventas',      formatos: ['PDF', 'Excel'] },
    { id: 'compras_mes',   nombre: 'Compras del Período',   descripcion: 'Egresos por compras a proveedores en el período',             icon: 'banknotes',         href: '/dashboard/reportes', key: 'compras',     formatos: ['PDF', 'Excel'] },
    { id: 'mov_contable',  nombre: 'Movimientos Contables', descripcion: 'Kardex completo de movimientos de inventario para contabilidad', icon: 'document-text',  href: '/dashboard/reportes', key: 'movimientos', formatos: ['PDF', 'Excel'] },
    { id: 'inventario_c',  nombre: 'Valorización de Stock', descripcion: 'Inventario con precios de compra y venta para valorización',  icon: 'currency-dollar',   href: '/dashboard/reportes', key: 'inventario',  formatos: ['PDF', 'Excel'] },
  ],
};

// ─── Módulos del sistema (tab Inicio) ─────────────────────────────────────────
export const MODULOS: ModuloInfo[] = [
  { nombre: 'Inicio',        descripcion: 'Bienvenida y acceso rápido al sistema',           icon: 'home',              color: '#F5A623', href: '/dashboard'              },
  { nombre: 'Inventario',    descripcion: 'Control de stock, productos y almacenes',          icon: 'cube',              color: '#3498DB', href: '/dashboard/productos'    },
  { nombre: 'Ventas',        descripcion: 'Registro y gestión de ventas al cliente',          icon: 'shopping-cart',     color: '#2ECC71', href: '/dashboard/ventas'       },
  { nombre: 'Clientes',      descripcion: 'Base de datos y gestión de clientes',              icon: 'users',             color: '#9B59B6', href: '/dashboard/clientes'     },
  { nombre: 'Proveedores',   descripcion: 'Gestión de proveedores y órdenes de compra',       icon: 'truck',             color: '#1ABC9C', href: '/dashboard/proveedores'  },
  { nombre: 'Caja',          descripcion: 'Apertura, cierre y movimientos de caja',           icon: 'banknotes',         color: '#E67E22', href: '/dashboard/cajas'        },
  { nombre: 'Reportes',      descripcion: 'Reportes por área y rol con exportación PDF/Excel',icon: 'chart-bar',         color: '#E74C3C', href: '/dashboard/reportes'     },
  { nombre: 'Configuración', descripcion: 'Usuarios, roles, permisos y ajustes del sistema',  icon: 'cog-6-tooth',       color: '#95A5A6', href: '/dashboard'              },
];

// Fallback para roles no reconocidos
export function getKPIsForRol(rol: string): KPIDefinition[] {
  return KPI_BY_ROL[rol] ?? KPI_BY_ROL.ADMIN ?? [];
}
export function getReportesForRol(rol: string): ReporteDefinition[] {
  return REPORTES_BY_ROL[rol] ?? REPORTES_BY_ROL.ADMIN ?? [];
}
export function getChartForRol(rol: string): ChartDefinition | null {
  return CHART_BY_ROL[rol] ?? CHART_BY_ROL.ADMIN ?? null;
}
