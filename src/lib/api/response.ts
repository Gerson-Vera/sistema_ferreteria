import { NextResponse } from 'next/server';

export type ApiSuccess<T> = { data: T; message?: string };
export type ApiError = { error: string; details?: unknown };

export function ok<T>(data: T, message?: string) {
  return NextResponse.json<ApiSuccess<T>>({ data, message }, { status: 200 });
}

export function created<T>(data: T) {
  return NextResponse.json<ApiSuccess<T>>({ data }, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(error: string, details?: unknown) {
  return NextResponse.json<ApiError>({ error, details }, { status: 400 });
}

export function notFound(resource = 'Recurso') {
  return NextResponse.json<ApiError>({ error: `${resource} no encontrado` }, { status: 404 });
}

export function conflict(error: string) {
  return NextResponse.json<ApiError>({ error }, { status: 409 });
}

export function serverError(error: unknown) {
  console.error('[API Error]', error);
  return NextResponse.json<ApiError>({ error: 'Error interno del servidor' }, { status: 500 });
}
