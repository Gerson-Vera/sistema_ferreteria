import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { authConfig } from './config';
import db from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Usuario' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const usuario = await db.usuario.findUnique({
          where: { username: credentials.username as string },
          include: {
            roles: {
              where: { estado: true },
              include: { rol: true },
            },
          },
        });

        if (!usuario || !usuario.estado) return null;

        const passwordValida = await bcrypt.compare(
          credentials.password as string,
          usuario.password,
        );
        if (!passwordValida) return null;

        return {
          id:       String(usuario.id),
          username: usuario.username,
          email:    usuario.email,
          nombre:   usuario.nombre,
          roles:    usuario.roles.map((r) => r.rol.codigo),
        };
      },
    }),
  ],
});
