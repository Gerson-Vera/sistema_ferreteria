import { type NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/api/response';
import db from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const categoriaId = parseInt(id);

    const [config, marcas, proveedores] = await Promise.all([
      db.categoriaConfig.findUnique({ where: { categoriaId } }),
      db.categoriaMarca.findMany({ where: { categoriaId } }),
      db.categoriaProveedor.findMany({ where: { categoriaId } }),
    ]);

    return ok({
      unidadMedidaId: config?.unidadMedidaId ? String(config.unidadMedidaId) : null,
      almacenId: config?.almacenId ? String(config.almacenId) : null,
      marcaIds: marcas.map((m: { marcaId: number }) => String(m.marcaId)),
      proveedorIds: proveedores.map((p: { proveedorId: number }) => String(p.proveedorId)),
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const categoriaId = parseInt(id);
    const body = await req.json() as {
      unidadMedidaId?: string | null;
      almacenId?: string | null;
      marcaIds?: string[];
      proveedorIds?: string[];
    };

    const { unidadMedidaId, almacenId, marcaIds = [], proveedorIds = [] } = body;

    await db.$transaction(async (tx) => {
      await tx.categoriaConfig.upsert({
        where: { categoriaId },
        create: {
          categoriaId,
          unidadMedidaId: unidadMedidaId ? parseInt(unidadMedidaId) : null,
          almacenId: almacenId ? parseInt(almacenId) : null,
        },
        update: {
          unidadMedidaId: unidadMedidaId ? parseInt(unidadMedidaId) : null,
          almacenId: almacenId ? parseInt(almacenId) : null,
        },
      });

      await tx.categoriaMarca.deleteMany({ where: { categoriaId } });
      if (marcaIds.length > 0) {
        await tx.categoriaMarca.createMany({
          data: marcaIds.map((mid) => ({ categoriaId, marcaId: parseInt(mid) })),
        });
      }

      await tx.categoriaProveedor.deleteMany({ where: { categoriaId } });
      if (proveedorIds.length > 0) {
        await tx.categoriaProveedor.createMany({
          data: proveedorIds.map((pid) => ({ categoriaId, proveedorId: parseInt(pid) })),
        });
      }
    });

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
