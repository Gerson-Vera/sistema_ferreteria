import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

// Menús que puede ver cada rol
const menusPorRol: Record<string, string[]> = {
  ADMIN: [
    'DASHBOARD', 'INV', 'PRODUCTOS', 'CATEGORIAS', 'UNID_MED',
    'MOVIMIENTOS', 'AJUSTES_INV', 'PROVEEDORES', 'COMPRAS',
    'CLIENTES', 'VENTAS', 'REPORTES',
  ],
  VENDEDOR: [
    'DASHBOARD', 'PRODUCTOS', 'CLIENTES', 'VENTAS', 'REPORTES',
  ],
  ALMACEN: [
    'DASHBOARD', 'INV', 'PRODUCTOS', 'CATEGORIAS', 'UNID_MED',
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
  await db.venta.deleteMany();      // referencias: cliente, usuario, tipoPago
  await db.compra.deleteMany();     // referencias: proveedor, usuario, tipoPago
  await db.producto.deleteMany();   // referencias: categoria, marca, unidadMedida, proveedor
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
  await db.tipoPago.deleteMany();   // sin dependientes pendientes
  await db.marca.deleteMany();      // sin dependientes pendientes
  await db.almacen.deleteMany();    // standalone
  await db.caja.deleteMany();       // standalone
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
    { codigo: 'DASHBOARD',   descripcion: 'Dashboard',           url: '/dashboard',                    icono: 'Dashboard',     orden: 1,  menuPadreId: null },
    { codigo: 'INV',         descripcion: 'Inventario',          url: null,                            icono: 'Inventory',     orden: 2,  menuPadreId: null },
    { codigo: 'PRODUCTOS',   descripcion: 'Productos',           url: '/dashboard/productos',          icono: 'Inventory',     orden: 3,  menuPadreId: null },
    { codigo: 'CATEGORIAS',  descripcion: 'Categorías',          url: '/dashboard/categorias',         icono: 'Category',      orden: 4,  menuPadreId: null },
    { codigo: 'UNID_MED',    descripcion: 'Unidades de Medida',  url: '/dashboard/unidades-medida',    icono: 'Straighten',    orden: 5,  menuPadreId: null },
    { codigo: 'MOVIMIENTOS', descripcion: 'Movimientos',         url: '/dashboard/movimientos',        icono: 'SwapHoriz',     orden: 6,  menuPadreId: null },
    { codigo: 'AJUSTES_INV', descripcion: 'Ajustes Inventario',  url: '/dashboard/ajustes-inventario', icono: 'Tune',          orden: 7,  menuPadreId: null },
    { codigo: 'PROVEEDORES', descripcion: 'Proveedores',         url: '/dashboard/proveedores',        icono: 'LocalShipping', orden: 8,  menuPadreId: null },
    { codigo: 'COMPRAS',     descripcion: 'Compras',             url: '/dashboard/compras',            icono: 'ShoppingCart',  orden: 9,  menuPadreId: null },
    { codigo: 'CLIENTES',    descripcion: 'Clientes',            url: '/dashboard/clientes',           icono: 'People',        orden: 10, menuPadreId: null },
    { codigo: 'VENTAS',      descripcion: 'Ventas',              url: '/dashboard/ventas',             icono: 'PointOfSale',   orden: 11, menuPadreId: null },
    { codigo: 'REPORTES',    descripcion: 'Reportes',            url: '/dashboard/reportes',           icono: 'BarChart',      orden: 12, menuPadreId: null },
  ];

  for (const m of menus) {
    await db.menu.upsert({ where: { codigo: m.codigo }, update: {}, create: m });
  }
  console.log('✔ Menús creados');

  // ── Asignar menús a cada rol ────────────────────────────────────
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
    {
      username: 'admin',
      email:    'admin@ferreteria.com',
      password: 'admin123',
      nombre:   'Administrador',
      rol:      'ADMIN',
    },
    {
      username: 'vendedor',
      email:    'vendedor@ferreteria.com',
      password: 'vendedor123',
      nombre:   'Juan Pérez',
      rol:      'VENDEDOR',
    },
    {
      username: 'almacen',
      email:    'almacen@ferreteria.com',
      password: 'almacen123',
      nombre:   'Carlos Quispe',
      rol:      'ALMACEN',
    },
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

    console.log(`✔ Usuario creado → username: ${u.username} | password: ${u.password} | rol: ${u.rol}`);
  }

  // ── Marcas ──────────────────────────────────────────────────────
  const marcas = [
    'Bosch', 'Makita', 'Stanley', 'Black & Decker', 'Dewalt',
    'Truper', '3M', 'Sika', 'Eternit', 'Vinilit',
    'Sodimac', 'Tekno', 'CPP', 'Sin Marca',
  ];

  for (const nombre of marcas) {
    await db.marca.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }
  console.log('✔ Marcas creadas');

  // ── Tipos de pago ────────────────────────────────────────────────
  const tiposPago = [
    'Efectivo',
    'Tarjeta de Crédito',
    'Tarjeta de Débito',
    'Transferencia Bancaria',
    'Yape',
    'Plin',
    'Crédito (Cuenta Corriente)',
  ];

  for (const nombre of tiposPago) {
    await db.tipoPago.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }
  console.log('✔ Tipos de pago creados');

  // ── Almacenes ────────────────────────────────────────────────────
  const almacenes = [
    { nombre: 'Almacén Principal',   descripcion: 'Depósito central de mercadería' },
    { nombre: 'Piso de Venta',       descripcion: 'Productos en exhibición y venta directa' },
    { nombre: 'Depósito Secundario', descripcion: 'Almacenamiento de excedentes y stock de seguridad' },
  ];

  for (const a of almacenes) {
    await db.almacen.upsert({ where: { nombre: a.nombre }, update: {}, create: a });
  }
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

  console.log('\n✅ Seed completado correctamente');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); await pool.end(); });
