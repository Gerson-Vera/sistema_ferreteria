import { type NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { ok, badRequest, serverError } from '@/lib/api/response';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'productos');
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;

    if (!file) return badRequest('No se recibió ningún archivo');
    if (!ALLOWED_TYPES.has(file.type)) {
      return badRequest('Tipo de archivo no permitido. Use JPG, PNG o WEBP');
    }
    if (file.size > MAX_SIZE_BYTES) {
      return badRequest('El archivo supera el límite de 5 MB');
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const filename = `${randomUUID()}.${ext}`;

    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(join(UPLOAD_DIR, filename), Buffer.from(await file.arrayBuffer()));

    return ok({ url: `/uploads/productos/${filename}` });
  } catch (error) {
    return serverError(error);
  }
}
