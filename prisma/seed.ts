import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

// ── Barcode helper ────────────────────────────────────────────────────
function ean13(base: string): string {
  const raw = base.padStart(12, '0').slice(0, 12);
  const check = raw
    .split('')
    .reduce((sum, d, i) => sum + parseInt(d) * (i % 2 === 0 ? 1 : 3), 0);
  return raw + String((10 - (check % 10)) % 10);
}

// Menús que puede ver cada rol
const menusPorRol: Record<string, string[]> = {
  ADMIN: [
    'DASHBOARD', 'INV', 'PRODUCTOS', 'CATEGORIAS', 'MARCAS', 'UNID_MED', 'ALMACENES',
    'MOVIMIENTOS', 'AJUSTES_INV', 'PROVEEDORES', 'COMPRAS',
    'CLIENTES', 'VENTAS', 'CAJAS', 'REPORTES',
  ],
  VENDEDOR: [
    'DASHBOARD', 'PRODUCTOS', 'CLIENTES', 'VENTAS', 'CAJAS', 'REPORTES',
  ],
  ALMACEN: [
    'DASHBOARD', 'INV', 'PRODUCTOS', 'CATEGORIAS', 'MARCAS', 'UNID_MED', 'ALMACENES',
    'MOVIMIENTOS', 'AJUSTES_INV', 'PROVEEDORES', 'COMPRAS',
  ],
};

async function main() {
  // ── Limpieza previa (orden inverso a las FK) ────────────────────
  await db.ajusteInventarioItem.deleteMany();
  await db.ajusteInventario.deleteMany();
  await db.movimientoInventario.deleteMany();
  await db.ventaItem.deleteMany();
  await db.compraItem.deleteMany();
  await db.venta.deleteMany();
  await db.compra.deleteMany();
  await db.producto.deleteMany();
  await db.categoriaConfig.deleteMany();
  await db.categoriaMarca.deleteMany();
  await db.categoriaProveedor.deleteMany();
  await db.menuUsuario.deleteMany();
  await db.menuRol.deleteMany();
  await db.rolUsuario.deleteMany();
  await db.usuario.deleteMany();
  await db.menu.deleteMany();
  await db.rol.deleteMany();
  await db.cliente.deleteMany();
  await db.proveedor.deleteMany();
  await db.categoria.deleteMany();
  await db.unidadMedida.deleteMany();
  await db.tipoPago.deleteMany();
  await db.marca.deleteMany();
  await db.almacen.deleteMany();
  await db.caja.deleteMany();
  console.log('✔ Base de datos limpiada');

  // ── Unidades de medida ──────────────────────────────────────────
  const unidades = [
    { codigo: 'UND',  descripcion: 'Unidad' },
    { codigo: 'KG',   descripcion: 'Kilogramo' },
    { codigo: 'GR',   descripcion: 'Gramo' },
    { codigo: 'MT',   descripcion: 'Metro' },
    { codigo: 'CM',   descripcion: 'Centímetro' },
    { codigo: 'LT',   descripcion: 'Litro' },
    { codigo: 'ML',   descripcion: 'Mililitro' },
    { codigo: 'GL',   descripcion: 'Galón' },
    { codigo: 'CJA',  descripcion: 'Caja' },
    { codigo: 'PAQ',  descripcion: 'Paquete' },
    { codigo: 'RLL',  descripcion: 'Rollo' },
    { codigo: 'PAR',  descripcion: 'Par' },
  ];

  for (const u of unidades) {
    await db.unidadMedida.upsert({ where: { codigo: u.codigo }, update: {}, create: u });
  }
  console.log('✔ Unidades de medida creadas');

  // ── Categorías ──────────────────────────────────────────────────
  const categorias = [
    { codigo: 'HERR',  descripcion: 'Herramientas' },
    { codigo: 'ELEC',  descripcion: 'Eléctrico' },
    { codigo: 'PLOM',  descripcion: 'Plomería' },
    { codigo: 'PINT',  descripcion: 'Pinturas y Acabados' },
    { codigo: 'CONS',  descripcion: 'Construcción' },
    { codigo: 'FIJA',  descripcion: 'Fijación y Tornillería' },
    { codigo: 'JARD',  descripcion: 'Jardinería' },
    { codigo: 'SEG',   descripcion: 'Seguridad' },
  ];

  for (const c of categorias) {
    await db.categoria.upsert({ where: { codigo: c.codigo }, update: {}, create: c });
  }
  console.log('✔ Categorías creadas');

  // ── Roles ───────────────────────────────────────────────────────
  const roles = [
    { codigo: 'ADMIN',    descripcion: 'Administrador' },
    { codigo: 'VENDEDOR', descripcion: 'Vendedor' },
    { codigo: 'ALMACEN',  descripcion: 'Almacenero' },
  ];

  for (const r of roles) {
    await db.rol.upsert({ where: { codigo: r.codigo }, update: {}, create: r });
  }
  console.log('✔ Roles creados');

  // ── Menús ───────────────────────────────────────────────────────
  const menus = [
    { codigo: 'DASHBOARD',   descripcion: 'Dashboard',           url: '/dashboard',                     icono: 'Dashboard',     orden: 1  },
    { codigo: 'INV',         descripcion: 'Inventario',          url: null,                             icono: 'Inventory',     orden: 2  },
    { codigo: 'PRODUCTOS',   descripcion: 'Productos',           url: '/dashboard/productos',           icono: 'Inventory2',    orden: 3  },
    { codigo: 'CATEGORIAS',  descripcion: 'Categorías',          url: '/dashboard/categorias',          icono: 'Category',      orden: 4  },
    { codigo: 'MARCAS',      descripcion: 'Marcas',              url: '/dashboard/marcas',              icono: 'Label',         orden: 5  },
    { codigo: 'UNID_MED',    descripcion: 'Unidades de Medida',  url: '/dashboard/unidades-medida',     icono: 'Straighten',    orden: 6  },
    { codigo: 'ALMACENES',   descripcion: 'Almacenes',           url: '/dashboard/almacenes',           icono: 'Warehouse',     orden: 7  },
    { codigo: 'MOVIMIENTOS', descripcion: 'Movimientos',         url: '/dashboard/movimientos',         icono: 'SwapHoriz',     orden: 8  },
    { codigo: 'AJUSTES_INV', descripcion: 'Ajustes Inventario',  url: '/dashboard/ajustes-inventario',  icono: 'Tune',          orden: 9  },
    { codigo: 'PROVEEDORES', descripcion: 'Proveedores',         url: '/dashboard/proveedores',         icono: 'LocalShipping', orden: 10 },
    { codigo: 'COMPRAS',     descripcion: 'Compras',             url: '/dashboard/compras',             icono: 'ShoppingCart',  orden: 11 },
    { codigo: 'CLIENTES',    descripcion: 'Clientes',            url: '/dashboard/clientes',            icono: 'People',        orden: 12 },
    { codigo: 'VENTAS',      descripcion: 'Ventas',              url: '/dashboard/ventas',              icono: 'PointOfSale',   orden: 13 },
    { codigo: 'CAJAS',       descripcion: 'Cajas',               url: '/dashboard/cajas',               icono: 'Payments',      orden: 14 },
    { codigo: 'REPORTES',    descripcion: 'Reportes',            url: '/dashboard/reportes',            icono: 'BarChart',      orden: 15 },
  ];

  for (const m of menus) {
    await db.menu.upsert({ where: { codigo: m.codigo }, update: {}, create: { ...m, menuPadreId: null } });
  }
  console.log('✔ Menús creados');

  for (const [codigoRol, codigosMenu] of Object.entries(menusPorRol)) {
    const rol = await db.rol.findUnique({ where: { codigo: codigoRol } });
    if (!rol) continue;
    for (const codigoMenu of codigosMenu) {
      const menu = await db.menu.findUnique({ where: { codigo: codigoMenu } });
      if (!menu) continue;
      await db.menuRol.upsert({
        where:  { menuId_rolId: { menuId: menu.id, rolId: rol.id } },
        update: {},
        create: { menuId: menu.id, rolId: rol.id },
      });
    }
    console.log(`✔ Menús asignados al rol ${codigoRol}`);
  }

  // ── Usuarios ────────────────────────────────────────────────────
  const usuarios = [
    { username: 'admin',    email: 'admin@ferreteria.com',    password: 'admin123',    nombre: 'Administrador',  rol: 'ADMIN'    },
    { username: 'vendedor', email: 'vendedor@ferreteria.com', password: 'vendedor123', nombre: 'Juan Pérez',     rol: 'VENDEDOR' },
    { username: 'almacen',  email: 'almacen@ferreteria.com',  password: 'almacen123',  nombre: 'Carlos Quispe',  rol: 'ALMACEN'  },
  ];

  for (const u of usuarios) {
    const hash = await bcrypt.hash(u.password, 10);
    const usuario = await db.usuario.upsert({
      where:  { username: u.username },
      update: {},
      create: { username: u.username, email: u.email, password: hash, nombre: u.nombre },
    });
    const rol = await db.rol.findUnique({ where: { codigo: u.rol } });
    if (!rol) continue;
    await db.rolUsuario.upsert({
      where:  { usuarioId_rolId: { usuarioId: usuario.id, rolId: rol.id } },
      update: {},
      create: { usuarioId: usuario.id, rolId: rol.id },
    });
    console.log(`✔ Usuario → ${u.username} | ${u.password} | ${u.rol}`);
  }

  // ── Marcas ──────────────────────────────────────────────────────
  const marcas = [
    'Bosch', 'Makita', 'Stanley', 'Black & Decker', 'Dewalt',
    'Truper', '3M', 'Sika', 'Eternit', 'Vinilit',
    'Tekno', 'CPP', 'Sin Marca',
  ];

  for (const nombre of marcas) {
    await db.marca.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }
  console.log('✔ Marcas creadas');

  // ── Tipos de pago ────────────────────────────────────────────────
  const tiposPago = [
    'Efectivo', 'Tarjeta de Crédito', 'Tarjeta de Débito',
    'Transferencia Bancaria', 'Yape', 'Plin', 'Crédito (Cuenta Corriente)',
  ];

  for (const nombre of tiposPago) {
    await db.tipoPago.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }
  console.log('✔ Tipos de pago creados');

  // ── Almacenes ────────────────────────────────────────────────────
  const almacenesData = [
    { nombre: 'Almacén Principal',   descripcion: 'Depósito central de mercadería',           direccion: 'Jr. Los Herreros 120, Lima' },
    { nombre: 'Piso de Venta',       descripcion: 'Productos en exhibición y venta directa',  direccion: 'Jr. Los Herreros 120, Lima' },
    { nombre: 'Depósito Secundario', descripcion: 'Stock de seguridad y excedentes',          direccion: 'Av. Industrial 450, Lima'  },
  ];

  for (const a of almacenesData) {
    await db.almacen.upsert({ where: { nombre: a.nombre }, update: {}, create: a });
  }
  const [almPrincipal, almVenta, almDeposito] = await Promise.all([
    db.almacen.findUnique({ where: { nombre: 'Almacén Principal' } }),
    db.almacen.findUnique({ where: { nombre: 'Piso de Venta' } }),
    db.almacen.findUnique({ where: { nombre: 'Depósito Secundario' } }),
  ]);
  console.log('✔ Almacenes creados');

  // ── Cajas ────────────────────────────────────────────────────────
  const cajas = [
    { nombre: 'Caja Principal', descripcion: 'Caja de atención general' },
    { nombre: 'Caja 2',         descripcion: 'Caja de apoyo en horas pico' },
  ];

  for (const c of cajas) {
    await db.caja.upsert({ where: { nombre: c.nombre }, update: {}, create: c });
  }
  console.log('✔ Cajas creadas');

  // ── Proveedores ──────────────────────────────────────────────────
  const proveedoresData = [
    {
      codigo: 'PROV-001', descripcion: 'Distribuidora El Maestro SAC',
      ruc: '20123456789', contacto: 'Luis Ramírez', email: 'ventas@elmaestro.com.pe',
      telefono: '01-4521000', direccion: 'Av. Argentina 1200, Lima',
    },
    {
      codigo: 'PROV-002', descripcion: 'Ferretería Lima SA',
      ruc: '20234567890', contacto: 'Ana Torres', email: 'pedidos@ferrlima.com.pe',
      telefono: '01-3364500', direccion: 'Jr. Prolongación Huanta 220, Lima',
    },
    {
      codigo: 'PROV-003', descripcion: 'Importaciones Técnicas SAC',
      ruc: '20345678901', contacto: 'Roberto Silva', email: 'compras@imptecnicas.pe',
      telefono: '01-5120800', direccion: 'Av. Venezuela 3040, Lima',
    },
    {
      codigo: 'PROV-004', descripcion: 'Materiales del Sur EIRL',
      ruc: '20456789012', contacto: 'Carmen Huanca', email: 'materialesur@gmail.com',
      telefono: '054-281500', direccion: 'Av. Ejército 320, Arequipa',
    },
    {
      codigo: 'PROV-005', descripcion: 'Herramientas Pro SA',
      ruc: '20567890123', contacto: 'Jorge Mendoza', email: 'ventas@herramientaspro.pe',
      telefono: '01-6340200', direccion: 'Calle Los Industriales 45, Lima',
    },
    {
      codigo: 'PROV-006', descripcion: 'Electro Sistemas SAC',
      ruc: '20678901234', contacto: 'Patricia Quispe', email: 'electrosist@outlook.com',
      telefono: '01-7880100', direccion: 'Av. Grau 890, Lima',
    },
    {
      codigo: 'PROV-007', descripcion: 'Pinturas Andinas SRL',
      ruc: '20789012345', contacto: 'Manuel Ccama', email: 'pinturas.andinas@hotmail.com',
      telefono: '054-330600', direccion: 'Jr. Comercio 450, Arequipa',
    },
    {
      codigo: 'PROV-008', descripcion: 'Tubería Nacional SA',
      ruc: '20890123456', contacto: 'Sandra López', email: 'tuberias@nacional.com.pe',
      telefono: '01-5623100', direccion: 'Av. Universitaria 1800, Lima',
    },
    {
      codigo: 'PROV-009', descripcion: 'Construcciones Unidas SAC',
      ruc: '20901234567', contacto: 'Pedro Mamani', email: 'const.unidas@gmail.com',
      telefono: '01-4890200', direccion: 'Av. Benavides 2100, Surco',
    },
    {
      codigo: 'PROV-010', descripcion: 'Seguridad Total SAC',
      ruc: '20012345678', contacto: 'Rosa Flores', email: 'seguridad.total@pe.net',
      telefono: '01-2670450', direccion: 'Jr. Callao 120, Lima',
    },
  ];

  for (const p of proveedoresData) {
    await db.proveedor.upsert({ where: { codigo: p.codigo }, update: {}, create: p });
  }
  console.log('✔ Proveedores creados');

  // ── Clientes ─────────────────────────────────────────────────────
  const clientesData = [
    { codigo: 'CLI-001', descripcion: 'Carlos García López',        tipo: 'natural'   as const, tipoDocumento: 'DNI' as const, numeroDocumento: '12345678', email: 'c.garcia@gmail.com',    telefono: '987654321', direccion: 'Jr. Lima 420, Miraflores'       },
    { codigo: 'CLI-002', descripcion: 'María Fernández Torres',     tipo: 'natural'   as const, tipoDocumento: 'DNI' as const, numeroDocumento: '23456789', email: 'mfernandez@gmail.com',  telefono: '976543210', direccion: 'Av. Parra 110, San Isidro'       },
    { codigo: 'CLI-003', descripcion: 'Roberto Silva Mendoza',      tipo: 'natural'   as const, tipoDocumento: 'DNI' as const, numeroDocumento: '34567890', email: 'robsilva@hotmail.com',  telefono: '965432109', direccion: 'Calle Real 88, Barranco'         },
    { codigo: 'CLI-004', descripcion: 'Constructora Los Andes SRL', tipo: 'juridica'  as const, tipoDocumento: 'RUC' as const, numeroDocumento: '20111222333', email: 'losandes@empresa.pe',    telefono: '01-4450000', direccion: 'Av. El Sol 200, Surquillo'     },
    { codigo: 'CLI-005', descripcion: 'Ana Morales Huanca',         tipo: 'natural'   as const, tipoDocumento: 'DNI' as const, numeroDocumento: '45678901', email: 'ana.morales@gmail.com', telefono: '954321098', direccion: 'Jr. Tacna 330, San Juan'         },
    { codigo: 'CLI-006', descripcion: 'Empresa Constructora Norte', tipo: 'juridica'  as const, tipoDocumento: 'RUC' as const, numeroDocumento: '20222333444', email: 'norte@construct.pe',     telefono: '01-5560000', direccion: 'Calle Grau 780, Los Olivos'    },
    { codigo: 'CLI-007', descripcion: 'Luis Pérez Chávez',          tipo: 'natural'   as const, tipoDocumento: 'DNI' as const, numeroDocumento: '56789012', email: 'luisperez@yahoo.com',   telefono: '943210987', direccion: 'Av. Brasil 970, Breña'           },
    { codigo: 'CLI-008', descripcion: 'Pinturas del Norte SAC',     tipo: 'juridica'  as const, tipoDocumento: 'RUC' as const, numeroDocumento: '20333444555', email: 'pnorte@negocio.pe',     telefono: '01-3340000', direccion: 'Jr. Ucayali 55, Lima Centro'   },
    { codigo: 'CLI-009', descripcion: 'Jorge Mamani Quispe',        tipo: 'natural'   as const, tipoDocumento: 'DNI' as const, numeroDocumento: '67890123', email: 'jmamani@outlook.com',   telefono: '932109876', direccion: 'Av. Pachacutec 150, Villa El S.' },
    { codigo: 'CLI-010', descripcion: 'Sara Condori Flores',        tipo: 'natural'   as const, tipoDocumento: 'DNI' as const, numeroDocumento: '78901234', email: 'saracondori@gmail.com', telefono: '921098765', direccion: 'Jr. Las Flores 42, Comas'       },
    { codigo: 'CLI-011', descripcion: 'Taller Los Amigos EIRL',     tipo: 'juridica'  as const, tipoDocumento: 'RUC' as const, numeroDocumento: '20444555666', email: 'talleramigos@pe.com',   telefono: '01-6120000', direccion: 'Av. Túpac Amaru 890, Comas'   },
    { codigo: 'CLI-012', descripcion: 'Pedro Huanca Torres',        tipo: 'natural'   as const, tipoDocumento: 'DNI' as const, numeroDocumento: '89012345', email: 'pedrohuanca@pe.com',    telefono: '910987654', direccion: 'Calle Arequipa 77, Surco'       },
    { codigo: 'CLI-013', descripcion: 'Municipalidad San Borja',    tipo: 'juridica'  as const, tipoDocumento: 'RUC' as const, numeroDocumento: '20555666777', email: 'municipalidad@sanborja.gob.pe', telefono: '01-2250000', direccion: 'Av. De La Aviación 2190, SB' },
    { codigo: 'CLI-014', descripcion: 'Elena Vargas Soto',          tipo: 'natural'   as const, tipoDocumento: 'DNI' as const, numeroDocumento: '90123456', email: 'elenavs@gmail.com',     telefono: '909876543', direccion: 'Jr. Loreto 204, Cercado'        },
    { codigo: 'CLI-015', descripcion: 'Constructor Indep. SAC',     tipo: 'juridica'  as const, tipoDocumento: 'RUC' as const, numeroDocumento: '20666777888', email: 'cindependiente@pe.com', telefono: '01-7890000', direccion: 'Av. Primavera 1100, Surco'   },
  ];

  for (const c of clientesData) {
    await db.cliente.upsert({ where: { codigo: c.codigo }, update: {}, create: c });
  }
  console.log('✔ Clientes creados');

  // ── Carga de IDs para relaciones ────────────────────────────────
  const [
    catHerr, catElec, catPlom, catPint, catCons, catFija, catJard, catSeg,
  ] = await Promise.all([
    db.categoria.findUnique({ where: { codigo: 'HERR' } }),
    db.categoria.findUnique({ where: { codigo: 'ELEC' } }),
    db.categoria.findUnique({ where: { codigo: 'PLOM' } }),
    db.categoria.findUnique({ where: { codigo: 'PINT' } }),
    db.categoria.findUnique({ where: { codigo: 'CONS' } }),
    db.categoria.findUnique({ where: { codigo: 'FIJA' } }),
    db.categoria.findUnique({ where: { codigo: 'JARD' } }),
    db.categoria.findUnique({ where: { codigo: 'SEG'  } }),
  ]);

  const [
    marcaBosch, marcaMakita, marcaStanley, marcaTruper, marcaDeWalt,
    marca3M, marcaSika, marcaTekno, marcaCPP, marcaSinMarca,
  ] = await Promise.all([
    db.marca.findUnique({ where: { nombre: 'Bosch'           } }),
    db.marca.findUnique({ where: { nombre: 'Makita'          } }),
    db.marca.findUnique({ where: { nombre: 'Stanley'         } }),
    db.marca.findUnique({ where: { nombre: 'Truper'          } }),
    db.marca.findUnique({ where: { nombre: 'Dewalt'          } }),
    db.marca.findUnique({ where: { nombre: '3M'              } }),
    db.marca.findUnique({ where: { nombre: 'Sika'            } }),
    db.marca.findUnique({ where: { nombre: 'Tekno'           } }),
    db.marca.findUnique({ where: { nombre: 'CPP'             } }),
    db.marca.findUnique({ where: { nombre: 'Sin Marca'       } }),
  ]);

  const [undUnd, undKg, undMt, undLt, undGl, undPaq, undRll] = await Promise.all([
    db.unidadMedida.findUnique({ where: { codigo: 'UND' } }),
    db.unidadMedida.findUnique({ where: { codigo: 'KG'  } }),
    db.unidadMedida.findUnique({ where: { codigo: 'MT'  } }),
    db.unidadMedida.findUnique({ where: { codigo: 'LT'  } }),
    db.unidadMedida.findUnique({ where: { codigo: 'GL'  } }),
    db.unidadMedida.findUnique({ where: { codigo: 'PAQ' } }),
    db.unidadMedida.findUnique({ where: { codigo: 'RLL' } }),
  ]);

  const [prov1, prov2, prov3, prov4, prov5, prov6, prov7, prov8, prov9, prov10] = await Promise.all([
    db.proveedor.findUnique({ where: { codigo: 'PROV-001' } }),
    db.proveedor.findUnique({ where: { codigo: 'PROV-002' } }),
    db.proveedor.findUnique({ where: { codigo: 'PROV-003' } }),
    db.proveedor.findUnique({ where: { codigo: 'PROV-004' } }),
    db.proveedor.findUnique({ where: { codigo: 'PROV-005' } }),
    db.proveedor.findUnique({ where: { codigo: 'PROV-006' } }),
    db.proveedor.findUnique({ where: { codigo: 'PROV-007' } }),
    db.proveedor.findUnique({ where: { codigo: 'PROV-008' } }),
    db.proveedor.findUnique({ where: { codigo: 'PROV-009' } }),
    db.proveedor.findUnique({ where: { codigo: 'PROV-010' } }),
  ]);

  // ── Productos ────────────────────────────────────────────────────
  type ProdSeed = {
    codigo: string; codigoBarras: string; descripcion: string; detalle?: string;
    precioCompra: number; precioVenta: number; stock: number; stockMinimo: number;
    ubicacion?: string; categoriaId: number; marcaId?: number; unidadMedidaId?: number;
    proveedorId?: number; almacenId?: number;
  };

  const productos: ProdSeed[] = [
    // ── Herramientas ──
    {
      codigo: 'HERR-001', codigoBarras: ean13('7890000001'),
      descripcion: 'Martillo de Carpintero 16 oz', detalle: 'Mango de fibra de vidrio anti-vibración',
      precioCompra: 22.50, precioVenta: 35.90, stock: 45, stockMinimo: 10,
      ubicacion: 'Est. A-1', categoriaId: catHerr!.id, marcaId: marcaStanley!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov5!.id, almacenId: almPrincipal!.id,
    },
    {
      codigo: 'HERR-002', codigoBarras: ean13('7890000002'),
      descripcion: 'Taladro Percutor 650W', detalle: 'Velocidad variable 0-2800 rpm, portabrocas 13mm',
      precioCompra: 185.00, precioVenta: 259.90, stock: 12, stockMinimo: 3,
      ubicacion: 'Est. A-2', categoriaId: catHerr!.id, marcaId: marcaBosch!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov3!.id, almacenId: almVenta!.id,
    },
    {
      codigo: 'HERR-003', codigoBarras: ean13('7890000003'),
      descripcion: 'Destornillador Estrella 6"', detalle: 'Punta magnética, mango bimateria',
      precioCompra: 8.50, precioVenta: 14.90, stock: 80, stockMinimo: 20,
      ubicacion: 'Est. A-1', categoriaId: catHerr!.id, marcaId: marcaStanley!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov5!.id, almacenId: almPrincipal!.id,
    },
    {
      codigo: 'HERR-004', codigoBarras: ean13('7890000004'),
      descripcion: 'Llave Inglesa 12"', detalle: 'Acero cromo-vanadio, mandíbula ajustable',
      precioCompra: 18.00, precioVenta: 29.90, stock: 35, stockMinimo: 8,
      ubicacion: 'Est. A-3', categoriaId: catHerr!.id, marcaId: marcaTruper!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov5!.id, almacenId: almPrincipal!.id,
    },
    {
      codigo: 'HERR-005', codigoBarras: ean13('7890000005'),
      descripcion: 'Nivel de Aluminio 60cm', detalle: '3 burbujas, tolerancia ±0.5mm/m',
      precioCompra: 14.00, precioVenta: 24.90, stock: 25, stockMinimo: 6,
      ubicacion: 'Est. A-4', categoriaId: catHerr!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov1!.id, almacenId: almPrincipal!.id,
    },
    {
      codigo: 'HERR-006', codigoBarras: ean13('7890000006'),
      descripcion: 'Cinta Métrica 5m Stanley', detalle: 'Carcasa ABS, blade blade amarillo 25mm',
      precioCompra: 12.00, precioVenta: 19.90, stock: 60, stockMinimo: 15,
      ubicacion: 'Est. A-1', categoriaId: catHerr!.id, marcaId: marcaStanley!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov5!.id, almacenId: almVenta!.id,
    },
    {
      codigo: 'HERR-007', codigoBarras: ean13('7890000007'),
      descripcion: 'Sierra Circular 7 1/4" 1400W', detalle: 'Disco para madera, guía paralela incluida',
      precioCompra: 220.00, precioVenta: 329.90, stock: 6, stockMinimo: 2,
      ubicacion: 'Est. B-1', categoriaId: catHerr!.id, marcaId: marcaMakita!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov3!.id, almacenId: almPrincipal!.id,
    },

    // ── Eléctrico ──
    {
      codigo: 'ELEC-001', codigoBarras: ean13('7890001001'),
      descripcion: 'Cable NYM 2.5mm² Rollo 100m', detalle: 'INDECO 2.5mm², conductor cobre, aislamiento PVC',
      precioCompra: 98.00, precioVenta: 145.00, stock: 20, stockMinimo: 5,
      ubicacion: 'Est. C-1', categoriaId: catElec!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undRll!.id, proveedorId: prov6!.id, almacenId: almPrincipal!.id,
    },
    {
      codigo: 'ELEC-002', codigoBarras: ean13('7890001002'),
      descripcion: 'Interruptor Simple Ticino', detalle: 'Encaje a presión, 10A 250V, color blanco',
      precioCompra: 4.50, precioVenta: 8.90, stock: 150, stockMinimo: 30,
      ubicacion: 'Est. C-2', categoriaId: catElec!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov6!.id, almacenId: almVenta!.id,
    },
    {
      codigo: 'ELEC-003', codigoBarras: ean13('7890001003'),
      descripcion: 'Foco LED 9W E27 Luz Fría', detalle: 'Equivale a 60W, 6500K, vida útil 25,000h',
      precioCompra: 5.80, precioVenta: 9.90, stock: 200, stockMinimo: 50,
      ubicacion: 'Est. C-3', categoriaId: catElec!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov6!.id, almacenId: almVenta!.id,
    },
    {
      codigo: 'ELEC-004', codigoBarras: ean13('7890001004'),
      descripcion: 'Breaker Unipolar 20A', detalle: 'Riel DIN, 20A 220V, corte rápido',
      precioCompra: 12.00, precioVenta: 22.90, stock: 80, stockMinimo: 20,
      ubicacion: 'Est. C-4', categoriaId: catElec!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov6!.id, almacenId: almPrincipal!.id,
    },

    // ── Plomería ──
    {
      codigo: 'PLOM-001', codigoBarras: ean13('7890002001'),
      descripcion: 'Tubo PVC 2" Presión x 5m', detalle: 'PVC agua fría clase 10, PAVCO',
      precioCompra: 16.00, precioVenta: 24.90, stock: 50, stockMinimo: 10,
      ubicacion: 'Est. D-1', categoriaId: catPlom!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov8!.id, almacenId: almPrincipal!.id,
    },
    {
      codigo: 'PLOM-002', codigoBarras: ean13('7890002002'),
      descripcion: 'Codo PVC 2" x 90° Presión', detalle: 'Para unión pegada, agua fría',
      precioCompra: 1.20, precioVenta: 2.50, stock: 200, stockMinimo: 50,
      ubicacion: 'Est. D-2', categoriaId: catPlom!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov8!.id, almacenId: almPrincipal!.id,
    },
    {
      codigo: 'PLOM-003', codigoBarras: ean13('7890002003'),
      descripcion: 'Pegamento PVC 1/4 gl OATEY', detalle: 'Para tubería PVC presión y desagüe',
      precioCompra: 18.00, precioVenta: 28.90, stock: 30, stockMinimo: 8,
      ubicacion: 'Est. D-3', categoriaId: catPlom!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undGl!.id, proveedorId: prov8!.id, almacenId: almPrincipal!.id,
    },
    {
      codigo: 'PLOM-004', codigoBarras: ean13('7890002004'),
      descripcion: 'Llave de Paso 1/2" Cromada', detalle: 'Cuerpo latón, bola PTFE, 200 PSI',
      precioCompra: 8.50, precioVenta: 14.90, stock: 60, stockMinimo: 15,
      ubicacion: 'Est. D-4', categoriaId: catPlom!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov8!.id, almacenId: almVenta!.id,
    },

    // ── Pinturas ──
    {
      codigo: 'PINT-001', codigoBarras: ean13('7890003001'),
      descripcion: 'Pintura Látex Interior Blanco 4 gl', detalle: 'Tekno, lavable, bajo olor, rendimiento 35 m²/gl',
      precioCompra: 78.00, precioVenta: 115.00, stock: 30, stockMinimo: 6,
      ubicacion: 'Est. E-1', categoriaId: catPint!.id, marcaId: marcaTekno!.id,
      unidadMedidaId: undGl!.id, proveedorId: prov7!.id, almacenId: almPrincipal!.id,
    },
    {
      codigo: 'PINT-002', codigoBarras: ean13('7890003002'),
      descripcion: 'Esmalte al Agua Blanco 1 gl', detalle: 'CPP, secado rápido, acabado brillante',
      precioCompra: 32.00, precioVenta: 49.90, stock: 20, stockMinimo: 5,
      ubicacion: 'Est. E-2', categoriaId: catPint!.id, marcaId: marcaCPP!.id,
      unidadMedidaId: undGl!.id, proveedorId: prov7!.id, almacenId: almPrincipal!.id,
    },
    {
      codigo: 'PINT-003', codigoBarras: ean13('7890003003'),
      descripcion: 'Thinner Acrílico 1 lt', detalle: 'Disolvente universal para esmaltes y lacas',
      precioCompra: 6.50, precioVenta: 11.90, stock: 80, stockMinimo: 20,
      ubicacion: 'Est. E-3', categoriaId: catPint!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undLt!.id, proveedorId: prov7!.id, almacenId: almPrincipal!.id,
    },
    {
      codigo: 'PINT-004', codigoBarras: ean13('7890003004'),
      descripcion: 'Rodillo Felpa 9" con Marco', detalle: 'Felpa 3/8", marco galvanizado con mango',
      precioCompra: 7.50, precioVenta: 13.90, stock: 45, stockMinimo: 10,
      ubicacion: 'Est. E-4', categoriaId: catPint!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov1!.id, almacenId: almVenta!.id,
    },

    // ── Construcción ──
    {
      codigo: 'CONS-001', codigoBarras: ean13('7890004001'),
      descripcion: 'Cemento Portland Tipo I 42.5 kg', detalle: 'PACASMAYO, bolsa 42.5 kg',
      precioCompra: 26.50, precioVenta: 34.90, stock: 100, stockMinimo: 20,
      ubicacion: 'Zona F', categoriaId: catCons!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undKg!.id, proveedorId: prov9!.id, almacenId: almDeposito!.id,
    },
    {
      codigo: 'CONS-002', codigoBarras: ean13('7890004002'),
      descripcion: 'Ladrillo King Kong 18 Huecos', detalle: 'Lark, medidas estándar 9×13×24cm',
      precioCompra: 0.80, precioVenta: 1.50, stock: 2000, stockMinimo: 500,
      ubicacion: 'Zona G', categoriaId: catCons!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov9!.id, almacenId: almDeposito!.id,
    },
    {
      codigo: 'CONS-003', codigoBarras: ean13('7890004003'),
      descripcion: 'Alambre Negro N°16 Rollo 5kg', detalle: 'Para amarre de fierro en obras',
      precioCompra: 22.00, precioVenta: 33.90, stock: 40, stockMinimo: 10,
      ubicacion: 'Zona F', categoriaId: catCons!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undKg!.id, proveedorId: prov9!.id, almacenId: almDeposito!.id,
    },

    // ── Fijación ──
    {
      codigo: 'FIJA-001', codigoBarras: ean13('7890005001'),
      descripcion: 'Tornillo Drywall 1" x 6 (Caja 1000 und)', detalle: 'Punta fina, fosfatado negro',
      precioCompra: 8.00, precioVenta: 14.90, stock: 60, stockMinimo: 15,
      ubicacion: 'Est. H-1', categoriaId: catFija!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undPaq!.id, proveedorId: prov1!.id, almacenId: almPrincipal!.id,
    },
    {
      codigo: 'FIJA-002', codigoBarras: ean13('7890005002'),
      descripcion: 'Clavo de Acero 3" (kg)', detalle: 'Para madera, punta diamante',
      precioCompra: 3.50, precioVenta: 5.90, stock: 80, stockMinimo: 20,
      ubicacion: 'Est. H-2', categoriaId: catFija!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undKg!.id, proveedorId: prov1!.id, almacenId: almPrincipal!.id,
    },
    {
      codigo: 'FIJA-003', codigoBarras: ean13('7890005003'),
      descripcion: 'Tarugo Fisher 8mm (Bolsa 100 und)', detalle: 'Polipropileno, uso en concreto y ladrillo',
      precioCompra: 4.00, precioVenta: 7.90, stock: 120, stockMinimo: 30,
      ubicacion: 'Est. H-3', categoriaId: catFija!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undPaq!.id, proveedorId: prov1!.id, almacenId: almPrincipal!.id,
    },

    // ── Jardinería ──
    {
      codigo: 'JARD-001', codigoBarras: ean13('7890006001'),
      descripcion: 'Manguera de Jardín 1/2" x 15m', detalle: 'PVC flexible, con pistola ajustable',
      precioCompra: 22.00, precioVenta: 35.90, stock: 25, stockMinimo: 5,
      ubicacion: 'Est. I-1', categoriaId: catJard!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov4!.id, almacenId: almVenta!.id,
    },
    {
      codigo: 'JARD-002', codigoBarras: ean13('7890006002'),
      descripcion: 'Palana Cuchara con Mango', detalle: 'Mango tornillo 120cm, pala acero galvanizado',
      precioCompra: 18.00, precioVenta: 29.90, stock: 15, stockMinimo: 4,
      ubicacion: 'Est. I-2', categoriaId: catJard!.id, marcaId: marcaTruper!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov4!.id, almacenId: almPrincipal!.id,
    },

    // ── Seguridad ──
    {
      codigo: 'SEG-001', codigoBarras: ean13('7890007001'),
      descripcion: 'Casco de Seguridad Blanco ANSI', detalle: 'Polietileno, suspensión de 4 puntos, clase E',
      precioCompra: 12.00, precioVenta: 22.90, stock: 40, stockMinimo: 10,
      ubicacion: 'Est. J-1', categoriaId: catSeg!.id, marcaId: marca3M!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov10!.id, almacenId: almVenta!.id,
    },
    {
      codigo: 'SEG-002', codigoBarras: ean13('7890007002'),
      descripcion: 'Guantes de Cuero Soldador Par', detalle: 'Cuero flor, puño largo 35cm, resistente calor',
      precioCompra: 8.50, precioVenta: 15.90, stock: 50, stockMinimo: 12,
      ubicacion: 'Est. J-2', categoriaId: catSeg!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov10!.id, almacenId: almVenta!.id,
    },
    {
      codigo: 'SEG-003', codigoBarras: ean13('7890007003'),
      descripcion: 'Lentes de Protección Clara 3M', detalle: 'PC resistente impacto, patillas ajustables, anti-rayaduras',
      precioCompra: 5.50, precioVenta: 10.90, stock: 3, stockMinimo: 10,
      ubicacion: 'Est. J-3', categoriaId: catSeg!.id, marcaId: marca3M!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov10!.id, almacenId: almVenta!.id,
    },
    {
      codigo: 'SEG-004', codigoBarras: ean13('7890007004'),
      descripcion: 'Candado de Seguridad 40mm', detalle: 'Cuerpo latón, arco acero endurecido, 3 llaves',
      precioCompra: 12.00, precioVenta: 22.90, stock: 2, stockMinimo: 8,
      ubicacion: 'Est. J-4', categoriaId: catSeg!.id, marcaId: marcaSinMarca!.id,
      unidadMedidaId: undUnd!.id, proveedorId: prov10!.id, almacenId: almVenta!.id,
    },
  ];

  for (const p of productos) {
    const exists = await db.producto.findFirst({ where: { codigo: p.codigo } });
    if (!exists) {
      await db.producto.create({
        data: {
          codigo:         p.codigo,
          codigoBarras:   p.codigoBarras,
          descripcion:    p.descripcion,
          detalle:        p.detalle ?? null,
          precioCompra:   p.precioCompra,
          precioVenta:    p.precioVenta,
          stock:          p.stock,
          stockMinimo:    p.stockMinimo,
          ubicacion:      p.ubicacion ?? null,
          categoriaId:    p.categoriaId,
          marcaId:        p.marcaId ?? null,
          unidadMedidaId: p.unidadMedidaId ?? null,
          proveedorId:    p.proveedorId ?? null,
          almacenId:      p.almacenId ?? null,
        },
      });
    }
  }
  console.log(`✔ ${productos.length} productos creados`);

  // ── Tablas puente — Reglas de negocio por categoría ─────────────
  //
  // CategoriaConfig: default unidad de medida + almacén por categoría
  const categoriaConfigs = [
    { categoria: catHerr!, unidad: undUnd!, almacen: almPrincipal! },
    { categoria: catElec!, unidad: undUnd!, almacen: almPrincipal! },
    { categoria: catPlom!, unidad: undUnd!, almacen: almPrincipal! },
    { categoria: catPint!, unidad: undGl!,  almacen: almPrincipal! },
    { categoria: catCons!, unidad: undKg!,  almacen: almDeposito!  },
    { categoria: catFija!, unidad: undUnd!, almacen: almPrincipal! },
    { categoria: catJard!, unidad: undUnd!, almacen: almVenta!     },
    { categoria: catSeg!,  unidad: undUnd!, almacen: almVenta!     },
  ];

  for (const cfg of categoriaConfigs) {
    await db.categoriaConfig.upsert({
      where:  { categoriaId: cfg.categoria.id },
      update: { unidadMedidaId: cfg.unidad.id, almacenId: cfg.almacen.id },
      create: { categoriaId: cfg.categoria.id, unidadMedidaId: cfg.unidad.id, almacenId: cfg.almacen.id },
    });
  }
  console.log('✔ CategoriaConfig creados (reglas de unidad y almacén)');

  // CategoriaMarca: marcas habituales por categoría
  type CatMarcaLink = { categoriaId: number; marcaId: number };
  const categoriaMarcaLinks: CatMarcaLink[] = [
    // Herramientas → Bosch, Makita, Stanley, DeWalt, Truper
    { categoriaId: catHerr!.id, marcaId: marcaBosch!.id   },
    { categoriaId: catHerr!.id, marcaId: marcaMakita!.id  },
    { categoriaId: catHerr!.id, marcaId: marcaStanley!.id },
    { categoriaId: catHerr!.id, marcaId: marcaDeWalt!.id  },
    { categoriaId: catHerr!.id, marcaId: marcaTruper!.id  },
    // Pinturas → Tekno, CPP
    { categoriaId: catPint!.id, marcaId: marcaTekno!.id   },
    { categoriaId: catPint!.id, marcaId: marcaCPP!.id     },
    // Jardinería → Truper
    { categoriaId: catJard!.id, marcaId: marcaTruper!.id  },
    // Seguridad → 3M
    { categoriaId: catSeg!.id,  marcaId: marca3M!.id      },
    // Eléctrico → (genérica: Sin Marca)
    { categoriaId: catElec!.id, marcaId: marcaSinMarca!.id },
    // Plomería → (genérica: Sin Marca)
    { categoriaId: catPlom!.id, marcaId: marcaSinMarca!.id },
    // Construcción → (genérica: Sin Marca)
    { categoriaId: catCons!.id, marcaId: marcaSinMarca!.id },
    // Fijación → (genérica: Sin Marca)
    { categoriaId: catFija!.id, marcaId: marcaSinMarca!.id },
  ];

  for (const link of categoriaMarcaLinks) {
    await db.categoriaMarca.upsert({
      where:  { categoriaId_marcaId: { categoriaId: link.categoriaId, marcaId: link.marcaId } },
      update: {},
      create: link,
    });
  }
  console.log('✔ CategoriaMarca creados (marcas por categoría)');

  // CategoriaProveedor: proveedores habituales por categoría
  type CatProvLink = { categoriaId: number; proveedorId: number };
  const categoriaProveedorLinks: CatProvLink[] = [
    // Herramientas → Herramientas Pro (PROV-005) + Importaciones Técnicas (PROV-003)
    { categoriaId: catHerr!.id, proveedorId: prov5!.id  },
    { categoriaId: catHerr!.id, proveedorId: prov3!.id  },
    // Eléctrico → Electro Sistemas (PROV-006)
    { categoriaId: catElec!.id, proveedorId: prov6!.id  },
    // Plomería → Tubería Nacional (PROV-008)
    { categoriaId: catPlom!.id, proveedorId: prov8!.id  },
    // Pinturas → Pinturas Andinas (PROV-007)
    { categoriaId: catPint!.id, proveedorId: prov7!.id  },
    // Construcción → Construcciones Unidas (PROV-009)
    { categoriaId: catCons!.id, proveedorId: prov9!.id  },
    // Fijación → Distribuidora El Maestro (PROV-001) + Ferretería Lima (PROV-002)
    { categoriaId: catFija!.id, proveedorId: prov1!.id  },
    { categoriaId: catFija!.id, proveedorId: prov2!.id  },
    // Jardinería → Materiales del Sur (PROV-004)
    { categoriaId: catJard!.id, proveedorId: prov4!.id  },
    // Seguridad → Seguridad Total (PROV-010)
    { categoriaId: catSeg!.id,  proveedorId: prov10!.id },
  ];

  for (const link of categoriaProveedorLinks) {
    await db.categoriaProveedor.upsert({
      where:  { categoriaId_proveedorId: { categoriaId: link.categoriaId, proveedorId: link.proveedorId } },
      update: {},
      create: link,
    });
  }
  console.log('✔ CategoriaProveedor creados (proveedores por categoría)');

  // ════════════════════════════════════════════════════════════════════
  //  DATOS HISTÓRICOS — Nov 2025 → Abr 2026
  // ════════════════════════════════════════════════════════════════════

  const allProductos = await db.producto.findMany();
  const prodMap      = new Map(allProductos.map(p => [p.codigo, p]));
  const [usuAdmin, usuVend, usuAlm] = await Promise.all([
    db.usuario.findUnique({ where: { username: 'admin'   } }),
    db.usuario.findUnique({ where: { username: 'vendedor'} }),
    db.usuario.findUnique({ where: { username: 'almacen' } }),
  ]);
  const allClientes   = await db.cliente.findMany();
  const allTiposPago  = await db.tipoPago.findMany();

  const tp = (nombre: string) =>
    (allTiposPago.find(t => t.nombre === nombre) ?? allTiposPago[0]).id;

  // Stock simulado alto para que las salidas no lleguen a negativo
  const stkMap = new Map<number, number>(
    allProductos.map(p => [p.id, p.stock + 1500]),
  );

  let cmpSeq = 0;
  let vtaSeq = 0;

  // ── Compras ──────────────────────────────────────────────────────
  type CI = { c: string; q: number };
  const comprasData: { fecha: Date; prov: string; items: CI[] }[] = [
    // Nov 2025
    { fecha:new Date(2025,10, 4), prov:'PROV-005', items:[{c:'HERR-001',q:25},{c:'HERR-003',q:60},{c:'HERR-004',q:20},{c:'HERR-006',q:40}] },
    { fecha:new Date(2025,10,11), prov:'PROV-006', items:[{c:'ELEC-001',q:10},{c:'ELEC-002',q:120},{c:'ELEC-003',q:150}] },
    { fecha:new Date(2025,10,19), prov:'PROV-008', items:[{c:'PLOM-001',q:30},{c:'PLOM-002',q:150},{c:'PLOM-004',q:40}] },
    // Dic 2025
    { fecha:new Date(2025,11, 2), prov:'PROV-003', items:[{c:'HERR-002',q:6},{c:'HERR-007',q:3}] },
    { fecha:new Date(2025,11, 9), prov:'PROV-007', items:[{c:'PINT-001',q:25},{c:'PINT-002',q:15},{c:'PINT-003',q:60},{c:'PINT-004',q:40}] },
    { fecha:new Date(2025,11,16), prov:'PROV-009', items:[{c:'CONS-001',q:80},{c:'CONS-002',q:2000},{c:'CONS-003',q:30}] },
    { fecha:new Date(2025,11,23), prov:'PROV-001', items:[{c:'FIJA-001',q:50},{c:'FIJA-002',q:60},{c:'FIJA-003',q:100}] },
    // Ene 2026
    { fecha:new Date(2026, 0, 7), prov:'PROV-005', items:[{c:'HERR-001',q:20},{c:'HERR-004',q:25},{c:'HERR-005',q:20}] },
    { fecha:new Date(2026, 0,14), prov:'PROV-006', items:[{c:'ELEC-004',q:60},{c:'ELEC-003',q:100},{c:'ELEC-002',q:80}] },
    { fecha:new Date(2026, 0,21), prov:'PROV-010', items:[{c:'SEG-001',q:25},{c:'SEG-002',q:35},{c:'SEG-003',q:20},{c:'SEG-004',q:15}] },
    // Feb 2026
    { fecha:new Date(2026, 1, 4), prov:'PROV-003', items:[{c:'HERR-002',q:4},{c:'HERR-007',q:2}] },
    { fecha:new Date(2026, 1,11), prov:'PROV-008', items:[{c:'PLOM-001',q:25},{c:'PLOM-002',q:100},{c:'PLOM-003',q:20},{c:'PLOM-004',q:30}] },
    { fecha:new Date(2026, 1,20), prov:'PROV-007', items:[{c:'PINT-001',q:20},{c:'PINT-002',q:12},{c:'PINT-004',q:25}] },
    // Mar 2026
    { fecha:new Date(2026, 2, 5), prov:'PROV-001', items:[{c:'FIJA-001',q:60},{c:'FIJA-002',q:70},{c:'FIJA-003',q:120}] },
    { fecha:new Date(2026, 2,13), prov:'PROV-009', items:[{c:'CONS-001',q:60},{c:'CONS-003',q:25}] },
    { fecha:new Date(2026, 2,25), prov:'PROV-006', items:[{c:'ELEC-001',q:12},{c:'ELEC-002',q:100},{c:'ELEC-003',q:120}] },
    // Abr 2026
    { fecha:new Date(2026, 3, 3), prov:'PROV-003', items:[{c:'HERR-002',q:5},{c:'HERR-007',q:2}] },
    { fecha:new Date(2026, 3, 9), prov:'PROV-007', items:[{c:'PINT-001',q:30},{c:'PINT-002',q:15},{c:'PINT-003',q:40}] },
    { fecha:new Date(2026, 3,17), prov:'PROV-008', items:[{c:'PLOM-001',q:20},{c:'PLOM-002',q:80},{c:'PLOM-004',q:25}] },
  ];

  for (const cmp of comprasData) {
    const proveedor = await db.proveedor.findUnique({ where: { codigo: cmp.prov } });
    if (!proveedor) continue;
    const numero = `CMP-${String(++cmpSeq).padStart(5, '0')}`;
    type CIC = { productoId:number; cantidad:number; costoUnitario:number; subtotal:number };
    const its: CIC[] = [];
    let sub = 0;
    for (const it of cmp.items) {
      const p = prodMap.get(it.c); if (!p) continue;
      const cu = Number(p.precioCompra);
      const s  = Math.round(cu * it.q * 100) / 100;
      sub += s;
      its.push({ productoId: p.id, cantidad: it.q, costoUnitario: cu, subtotal: s });
    }
    const igv   = Math.round(sub * 0.18 * 100) / 100;
    const total = Math.round((sub + igv) * 100) / 100;
    const compra = await db.compra.create({
      data: {
        numero, proveedorId: proveedor.id, usuarioId: usuAdmin!.id,
        subtotal: sub, igv, total,
        tipoPagoId: tp('Transferencia Bancaria'),
        estado: 'recibida', creadoEn: cmp.fecha,
        lista: { create: its },
      },
    });
    for (const it of its) {
      const prev = stkMap.get(it.productoId) ?? 0;
      const next = prev + it.cantidad;
      stkMap.set(it.productoId, next);
      await db.movimientoInventario.create({
        data: {
          productoId: it.productoId, tipo: 'entrada_compra',
          cantidad: it.cantidad, stockAnterior: prev, stockNuevo: next,
          referenciaId: compra.id, referenciaTipo: 'COMPRA',
          usuarioId: usuAdmin!.id, creadoEn: cmp.fecha,
        },
      });
    }
  }
  console.log(`✔ ${cmpSeq} compras históricas creadas`);

  // ── Ventas ───────────────────────────────────────────────────────
  type VI = { c: string; q: number };
  const ventasData: { fecha:Date; cli:number; usu:number; tp:string; items:VI[] }[] = [
    // ── Noviembre 2025 ──
    { fecha:new Date(2025,10, 3, 9,30), cli: 0, usu:1, tp:'Efectivo',                 items:[{c:'HERR-001',q:2},{c:'HERR-003',q:3},{c:'FIJA-002',q:5}] },
    { fecha:new Date(2025,10, 5,10, 0), cli: 3, usu:0, tp:'Transferencia Bancaria',    items:[{c:'ELEC-001',q:3},{c:'ELEC-004',q:10}] },
    { fecha:new Date(2025,10, 7,11,30), cli: 1, usu:1, tp:'Yape',                      items:[{c:'PINT-001',q:2},{c:'PINT-003',q:4}] },
    { fecha:new Date(2025,10,10, 9, 0), cli: 5, usu:0, tp:'Transferencia Bancaria',    items:[{c:'CONS-001',q:10},{c:'CONS-002',q:200}] },
    { fecha:new Date(2025,10,12,14, 0), cli: 2, usu:1, tp:'Efectivo',                 items:[{c:'HERR-002',q:1},{c:'HERR-006',q:2}] },
    { fecha:new Date(2025,10,14,10,30), cli: 6, usu:1, tp:'Efectivo',                 items:[{c:'PLOM-001',q:5},{c:'PLOM-002',q:15},{c:'PLOM-004',q:5}] },
    { fecha:new Date(2025,10,17, 9, 0), cli: 4, usu:1, tp:'Tarjeta de Débito',        items:[{c:'SEG-001',q:3},{c:'SEG-002',q:5}] },
    { fecha:new Date(2025,10,19,11, 0), cli: 0, usu:1, tp:'Yape',                      items:[{c:'HERR-003',q:5},{c:'FIJA-001',q:3},{c:'FIJA-003',q:4}] },
    { fecha:new Date(2025,10,21,15,30), cli:10, usu:0, tp:'Crédito (Cuenta Corriente)',items:[{c:'ELEC-002',q:20},{c:'ELEC-003',q:30}] },
    { fecha:new Date(2025,10,25,10, 0), cli: 7, usu:0, tp:'Transferencia Bancaria',    items:[{c:'PINT-001',q:4},{c:'PINT-002',q:2},{c:'PINT-004',q:5}] },
    { fecha:new Date(2025,10,27, 9,30), cli: 1, usu:1, tp:'Efectivo',                 items:[{c:'HERR-004',q:2},{c:'HERR-001',q:1}] },
    { fecha:new Date(2025,10,29,14, 0), cli:12, usu:0, tp:'Transferencia Bancaria',    items:[{c:'CONS-001',q:20},{c:'FIJA-001',q:10},{c:'FIJA-002',q:15}] },
    // ── Diciembre 2025 ──
    { fecha:new Date(2025,11, 1, 9, 0), cli: 3, usu:0, tp:'Transferencia Bancaria',    items:[{c:'HERR-002',q:2},{c:'HERR-007',q:1}] },
    { fecha:new Date(2025,11, 3,10,30), cli: 8, usu:1, tp:'Efectivo',                 items:[{c:'PINT-001',q:3},{c:'PINT-002',q:2},{c:'PINT-003',q:5}] },
    { fecha:new Date(2025,11, 5,11, 0), cli: 0, usu:1, tp:'Yape',                      items:[{c:'FIJA-001',q:5},{c:'FIJA-002',q:10},{c:'FIJA-003',q:8}] },
    { fecha:new Date(2025,11, 8, 9,30), cli: 5, usu:0, tp:'Crédito (Cuenta Corriente)',items:[{c:'CONS-001',q:15},{c:'CONS-002',q:300}] },
    { fecha:new Date(2025,11,10,14, 0), cli: 2, usu:1, tp:'Efectivo',                 items:[{c:'HERR-001',q:3},{c:'HERR-003',q:5}] },
    { fecha:new Date(2025,11,12,10, 0), cli: 9, usu:1, tp:'Tarjeta de Débito',        items:[{c:'ELEC-001',q:2},{c:'ELEC-002',q:30}] },
    { fecha:new Date(2025,11,15, 9, 0), cli: 6, usu:1, tp:'Efectivo',                 items:[{c:'PLOM-001',q:8},{c:'PLOM-002',q:25},{c:'PLOM-004',q:8}] },
    { fecha:new Date(2025,11,17,11,30), cli:13, usu:0, tp:'Transferencia Bancaria',    items:[{c:'SEG-001',q:10},{c:'SEG-002',q:15},{c:'SEG-003',q:8}] },
    { fecha:new Date(2025,11,19,15, 0), cli: 4, usu:1, tp:'Yape',                      items:[{c:'HERR-006',q:3},{c:'HERR-004',q:2}] },
    { fecha:new Date(2025,11,22, 9,30), cli:11, usu:0, tp:'Crédito (Cuenta Corriente)',items:[{c:'PINT-001',q:5},{c:'PINT-002',q:3}] },
    { fecha:new Date(2025,11,24,10, 0), cli: 0, usu:1, tp:'Efectivo',                 items:[{c:'ELEC-003',q:20},{c:'ELEC-004',q:5}] },
    { fecha:new Date(2025,11,26, 9, 0), cli: 7, usu:0, tp:'Transferencia Bancaria',    items:[{c:'CONS-001',q:25},{c:'CONS-003',q:10}] },
    { fecha:new Date(2025,11,29,14, 0), cli: 1, usu:1, tp:'Efectivo',                 items:[{c:'HERR-001',q:4},{c:'HERR-003',q:6},{c:'FIJA-002',q:8}] },
    // ── Enero 2026 ──
    { fecha:new Date(2026, 0, 5, 9, 0), cli: 2, usu:1, tp:'Efectivo',                 items:[{c:'HERR-001',q:2},{c:'HERR-004',q:2}] },
    { fecha:new Date(2026, 0, 7,10,30), cli: 5, usu:0, tp:'Transferencia Bancaria',    items:[{c:'ELEC-001',q:3},{c:'ELEC-004',q:8}] },
    { fecha:new Date(2026, 0, 9,11, 0), cli: 0, usu:1, tp:'Yape',                      items:[{c:'FIJA-001',q:4},{c:'FIJA-003',q:6}] },
    { fecha:new Date(2026, 0,12, 9,30), cli: 3, usu:0, tp:'Crédito (Cuenta Corriente)',items:[{c:'CONS-001',q:10},{c:'CONS-002',q:150}] },
    { fecha:new Date(2026, 0,14,14, 0), cli: 8, usu:1, tp:'Efectivo',                 items:[{c:'PINT-001',q:2},{c:'PINT-003',q:3}] },
    { fecha:new Date(2026, 0,16,10, 0), cli: 1, usu:1, tp:'Efectivo',                 items:[{c:'HERR-003',q:5},{c:'HERR-006',q:3}] },
    { fecha:new Date(2026, 0,19, 9, 0), cli: 6, usu:1, tp:'Tarjeta de Débito',        items:[{c:'PLOM-001',q:4},{c:'PLOM-002',q:10},{c:'PLOM-004',q:4}] },
    { fecha:new Date(2026, 0,21,11,30), cli:10, usu:0, tp:'Transferencia Bancaria',    items:[{c:'SEG-001',q:5},{c:'SEG-002',q:8}] },
    { fecha:new Date(2026, 0,23,15, 0), cli: 4, usu:1, tp:'Yape',                      items:[{c:'ELEC-002',q:15},{c:'ELEC-003',q:20}] },
    { fecha:new Date(2026, 0,27, 9,30), cli:14, usu:0, tp:'Transferencia Bancaria',    items:[{c:'HERR-002',q:1},{c:'HERR-007',q:1}] },
    { fecha:new Date(2026, 0,30,10, 0), cli: 2, usu:1, tp:'Efectivo',                 items:[{c:'PINT-002',q:2},{c:'PINT-004',q:4}] },
    // ── Febrero 2026 ──
    { fecha:new Date(2026, 1, 3, 9, 0), cli: 9, usu:1, tp:'Efectivo',                 items:[{c:'HERR-001',q:3},{c:'HERR-005',q:2}] },
    { fecha:new Date(2026, 1, 5,10,30), cli:12, usu:0, tp:'Crédito (Cuenta Corriente)',items:[{c:'CONS-001',q:15},{c:'CONS-002',q:200},{c:'CONS-003',q:8}] },
    { fecha:new Date(2026, 1, 7,11, 0), cli: 0, usu:1, tp:'Yape',                      items:[{c:'FIJA-001',q:5},{c:'FIJA-002',q:8}] },
    { fecha:new Date(2026, 1,10, 9,30), cli: 5, usu:0, tp:'Transferencia Bancaria',    items:[{c:'ELEC-001',q:4},{c:'ELEC-002',q:25}] },
    { fecha:new Date(2026, 1,12,14, 0), cli: 3, usu:1, tp:'Efectivo',                 items:[{c:'PINT-001',q:3},{c:'PINT-002',q:2},{c:'PINT-003',q:4}] },
    { fecha:new Date(2026, 1,14,10, 0), cli: 7, usu:1, tp:'Tarjeta de Débito',        items:[{c:'HERR-002',q:1},{c:'HERR-006',q:2},{c:'HERR-003',q:4}] },
    { fecha:new Date(2026, 1,18, 9, 0), cli: 1, usu:1, tp:'Efectivo',                 items:[{c:'PLOM-001',q:6},{c:'PLOM-004',q:5}] },
    { fecha:new Date(2026, 1,20,11,30), cli: 6, usu:1, tp:'Yape',                      items:[{c:'SEG-001',q:4},{c:'SEG-002',q:6},{c:'SEG-004',q:3}] },
    { fecha:new Date(2026, 1,24,15, 0), cli:11, usu:0, tp:'Transferencia Bancaria',    items:[{c:'ELEC-003',q:25},{c:'ELEC-004',q:8}] },
    { fecha:new Date(2026, 1,26, 9,30), cli: 4, usu:1, tp:'Efectivo',                 items:[{c:'HERR-004',q:3},{c:'FIJA-003',q:5}] },
    { fecha:new Date(2026, 1,28,10, 0), cli:13, usu:0, tp:'Crédito (Cuenta Corriente)',items:[{c:'CONS-001',q:20},{c:'FIJA-001',q:8}] },
    // ── Marzo 2026 ──
    { fecha:new Date(2026, 2, 3, 9, 0), cli: 0, usu:1, tp:'Efectivo',                 items:[{c:'HERR-001',q:4},{c:'HERR-003',q:6}] },
    { fecha:new Date(2026, 2, 5,10,30), cli: 5, usu:0, tp:'Transferencia Bancaria',    items:[{c:'CONS-001',q:20},{c:'CONS-002',q:400}] },
    { fecha:new Date(2026, 2, 7,11, 0), cli: 8, usu:1, tp:'Yape',                      items:[{c:'PINT-001',q:4},{c:'PINT-002',q:3},{c:'PINT-004',q:5}] },
    { fecha:new Date(2026, 2,10, 9,30), cli: 2, usu:1, tp:'Efectivo',                 items:[{c:'PLOM-001',q:7},{c:'PLOM-002',q:20},{c:'PLOM-004',q:6}] },
    { fecha:new Date(2026, 2,12,14, 0), cli:12, usu:0, tp:'Crédito (Cuenta Corriente)',items:[{c:'ELEC-001',q:5},{c:'ELEC-004',q:15}] },
    { fecha:new Date(2026, 2,14,10, 0), cli: 9, usu:1, tp:'Efectivo',                 items:[{c:'HERR-002',q:2},{c:'HERR-007',q:1}] },
    { fecha:new Date(2026, 2,17, 9, 0), cli: 3, usu:1, tp:'Tarjeta de Débito',        items:[{c:'SEG-001',q:6},{c:'SEG-002',q:10}] },
    { fecha:new Date(2026, 2,19,11,30), cli: 6, usu:1, tp:'Yape',                      items:[{c:'FIJA-001',q:6},{c:'FIJA-002',q:10},{c:'FIJA-003',q:8}] },
    { fecha:new Date(2026, 2,21,15, 0), cli:14, usu:0, tp:'Transferencia Bancaria',    items:[{c:'CONS-001',q:15},{c:'CONS-003',q:12}] },
    { fecha:new Date(2026, 2,24, 9,30), cli: 1, usu:1, tp:'Efectivo',                 items:[{c:'HERR-004',q:4},{c:'HERR-006',q:5}] },
    { fecha:new Date(2026, 2,26,10, 0), cli: 7, usu:0, tp:'Transferencia Bancaria',    items:[{c:'ELEC-002',q:30},{c:'ELEC-003',q:40}] },
    { fecha:new Date(2026, 2,28, 9, 0), cli: 4, usu:1, tp:'Yape',                      items:[{c:'PINT-001',q:5},{c:'PINT-003',q:6}] },
    { fecha:new Date(2026, 2,31,14, 0), cli:10, usu:0, tp:'Crédito (Cuenta Corriente)',items:[{c:'HERR-001',q:5},{c:'HERR-005',q:3}] },
    // ── Abril 2026 ──
    { fecha:new Date(2026, 3, 2, 9, 0), cli:11, usu:1, tp:'Efectivo',                 items:[{c:'HERR-001',q:3},{c:'HERR-003',q:5}] },
    { fecha:new Date(2026, 3, 4,10,30), cli: 5, usu:0, tp:'Transferencia Bancaria',    items:[{c:'CONS-001',q:18},{c:'CONS-002',q:350}] },
    { fecha:new Date(2026, 3, 7,11, 0), cli: 0, usu:1, tp:'Yape',                      items:[{c:'PINT-001',q:3},{c:'PINT-002',q:2}] },
    { fecha:new Date(2026, 3, 9, 9,30), cli: 3, usu:0, tp:'Crédito (Cuenta Corriente)',items:[{c:'ELEC-001',q:4},{c:'ELEC-002',q:20},{c:'ELEC-003',q:25}] },
    { fecha:new Date(2026, 3,11,14, 0), cli: 8, usu:1, tp:'Efectivo',                 items:[{c:'HERR-002',q:1},{c:'HERR-006',q:3}] },
    { fecha:new Date(2026, 3,14,10, 0), cli: 2, usu:1, tp:'Tarjeta de Débito',        items:[{c:'PLOM-001',q:6},{c:'PLOM-002',q:18},{c:'PLOM-004',q:6}] },
    { fecha:new Date(2026, 3,16, 9, 0), cli: 6, usu:1, tp:'Efectivo',                 items:[{c:'SEG-001',q:5},{c:'SEG-002',q:8}] },
    { fecha:new Date(2026, 3,18,11,30), cli: 9, usu:1, tp:'Yape',                      items:[{c:'FIJA-001',q:7},{c:'FIJA-002',q:12}] },
    { fecha:new Date(2026, 3,22,15, 0), cli:14, usu:0, tp:'Transferencia Bancaria',    items:[{c:'CONS-001',q:12},{c:'CONS-003',q:10}] },
    { fecha:new Date(2026, 3,24, 9,30), cli: 4, usu:1, tp:'Efectivo',                 items:[{c:'HERR-004',q:3},{c:'HERR-001',q:4}] },
    { fecha:new Date(2026, 3,26,10, 0), cli:12, usu:0, tp:'Crédito (Cuenta Corriente)',items:[{c:'PINT-001',q:6},{c:'PINT-002',q:4},{c:'PINT-004',q:6}] },
    { fecha:new Date(2026, 3,29, 9, 0), cli: 7, usu:0, tp:'Transferencia Bancaria',    items:[{c:'ELEC-004',q:10},{c:'ELEC-002',q:15}] },
    { fecha:new Date(2026, 3,30,14, 0), cli: 1, usu:1, tp:'Efectivo',                 items:[{c:'HERR-001',q:5},{c:'HERR-003',q:8},{c:'FIJA-003',q:6}] },
  ];

  for (const vta of ventasData) {
    const numero  = `VTA-${String(++vtaSeq).padStart(5, '0')}`;
    const cliente = allClientes[vta.cli % allClientes.length];
    const usuario = vta.usu === 0 ? usuAdmin! : usuVend!;
    type VIC = { productoId:number; cantidad:number; precioUnitario:number; subtotal:number };
    const its: VIC[] = [];
    let sub = 0;
    for (const it of vta.items) {
      const p = prodMap.get(it.c); if (!p) continue;
      const pu = Number(p.precioVenta);
      const s  = Math.round(pu * it.q * 100) / 100;
      sub += s;
      its.push({ productoId: p.id, cantidad: it.q, precioUnitario: pu, subtotal: s });
    }
    if (its.length === 0) continue;
    const igv   = Math.round(sub * 0.18 * 100) / 100;
    const total = Math.round((sub + igv) * 100) / 100;
    const venta = await db.venta.create({
      data: {
        numero, clienteId: cliente.id, usuarioId: usuario.id,
        subtotal: sub, igv, total,
        tipoPagoId: tp(vta.tp),
        estado: 'completada', creadoEn: vta.fecha,
        lista: { create: its },
      },
    });
    for (const it of its) {
      const prev = stkMap.get(it.productoId) ?? 0;
      const next = Math.max(0, prev - it.cantidad);
      stkMap.set(it.productoId, next);
      await db.movimientoInventario.create({
        data: {
          productoId: it.productoId, tipo: 'salida_venta',
          cantidad: it.cantidad, stockAnterior: prev, stockNuevo: next,
          referenciaId: venta.id, referenciaTipo: 'VENTA',
          usuarioId: usuario.id, creadoEn: vta.fecha,
        },
      });
    }
  }
  console.log(`✔ ${vtaSeq} ventas históricas creadas`);

  // ── Ajustes de inventario ────────────────────────────────────────
  const ajustesData = [
    {
      numero: 'AJ-202601-001', fecha: new Date(2026,0,15),
      motivo: 'Inventario físico anual — conteo general',
      observaciones: 'Conteo 15 enero 2026. Diferencias menores en eléctrico y seguridad.',
      items: [{c:'ELEC-003',sf:140},{c:'SEG-003',sf:2},{c:'SEG-004',sf:1},{c:'FIJA-002',sf:72}],
    },
    {
      numero: 'AJ-202603-001', fecha: new Date(2026,2,20),
      motivo: 'Verificación spot — categoría Seguridad',
      observaciones: 'Revisión sorpresa. Lentes y candados con diferencia por deterioro.',
      items: [{c:'SEG-003',sf:3},{c:'SEG-004',sf:2}],
    },
    {
      numero: 'AJ-202604-001', fecha: new Date(2026,3,28),
      motivo: 'Conteo de cierre mensual — Abril 2026',
      observaciones: 'Conteo rutinario de fin de mes. Diferencias en tornillería.',
      items: [{c:'FIJA-001',sf:48},{c:'FIJA-003',sf:92}],
    },
  ];

  for (const aj of ajustesData) {
    const ajuste = await db.ajusteInventario.create({
      data: {
        numero: aj.numero, motivo: aj.motivo, observaciones: aj.observaciones,
        usuarioId: usuAlm!.id, estado: 'aplicado', creadoEn: aj.fecha,
      },
    });
    for (const it of aj.items) {
      const prod = prodMap.get(it.c); if (!prod) continue;
      const ss   = stkMap.get(prod.id) ?? prod.stock;
      const diff = it.sf - ss;
      await db.ajusteInventarioItem.create({
        data: { ajusteId: ajuste.id, productoId: prod.id, stockSistema: ss, stockFisico: it.sf, diferencia: diff },
      });
      if (diff !== 0) {
        const prev = stkMap.get(prod.id) ?? 0;
        stkMap.set(prod.id, it.sf);
        await db.movimientoInventario.create({
          data: {
            productoId: prod.id,
            tipo: diff > 0 ? 'entrada_ajuste' : 'salida_ajuste',
            cantidad: Math.abs(diff), stockAnterior: prev, stockNuevo: it.sf,
            referenciaId: ajuste.id, referenciaTipo: 'AJUSTE',
            usuarioId: usuAlm!.id, creadoEn: aj.fecha,
          },
        });
      }
    }
  }
  console.log(`✔ ${ajustesData.length} ajustes de inventario creados`);

  console.log('\n✅ Seed completado correctamente');
  console.log('   Usuarios de acceso:');
  console.log('   · admin / admin123 (ADMIN)');
  console.log('   · vendedor / vendedor123 (VENDEDOR)');
  console.log('   · almacen / almacen123 (ALMACEN)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); await pool.end(); });
