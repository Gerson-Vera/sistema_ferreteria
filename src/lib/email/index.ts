import nodemailer from 'nodemailer';

const port = parseInt(process.env.MAIL_PORT ?? '587');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST ?? 'smtp.gmail.com',
  port,
  secure: port === 465,
  auth: {
    user: process.env.MAIL_USER ?? '',
    pass: process.env.MAIL_PASS ?? '',
  },
});

export type EmailOptions = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(opts: EmailOptions): Promise<void> {
  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? `"Ferretería" <${process.env.MAIL_USER}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}

export function buildOrdenCompraEmail(data: {
  numero: string;
  proveedor: string;
  fecha: string;
  items: { descripcion: string; cantidad: number; costoUnitario: number; subtotal: number }[];
  subtotal: number;
  igv: number;
  total: number;
  observaciones?: string | null;
  solicitante: string;
}): string {
  const fmt = (n: number) =>
    `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const rows = data.items
    .map(
      i => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;">${i.descripcion}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;text-align:center;">${i.cantidad}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;text-align:right;">${fmt(i.costoUnitario)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;text-align:right;font-weight:600;">${fmt(i.subtotal)}</td>
      </tr>`,
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Orden de Compra ${data.numero}</title></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Arial,sans-serif;color:#1E293B;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:32px 0;">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:#1565C0;padding:24px 32px;">
            <p style="margin:0;color:#fff;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Orden de Compra</p>
            <h1 style="margin:4px 0 0;color:#fff;font-size:26px;">${data.numero}</h1>
          </td>
        </tr>
        <!-- Info -->
        <tr>
          <td style="padding:24px 32px;border-bottom:1px solid #E2E8F0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:50%;vertical-align:top;">
                  <p style="margin:0 0 4px;font-size:11px;color:#94A3B8;text-transform:uppercase;">Para</p>
                  <p style="margin:0;font-size:15px;font-weight:700;">${data.proveedor}</p>
                </td>
                <td style="width:50%;text-align:right;vertical-align:top;">
                  <p style="margin:0 0 4px;font-size:11px;color:#94A3B8;text-transform:uppercase;">Fecha</p>
                  <p style="margin:0;font-size:14px;">${data.fecha}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Table -->
        <tr>
          <td style="padding:0 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
              <thead>
                <tr style="background:#F8FAFC;">
                  <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#475569;border-bottom:2px solid #E2E8F0;">Descripción</th>
                  <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;color:#475569;border-bottom:2px solid #E2E8F0;">Cant.</th>
                  <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#475569;border-bottom:2px solid #E2E8F0;">Precio Unit.</th>
                  <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#475569;border-bottom:2px solid #E2E8F0;">Subtotal</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <!-- Totals -->
            <table width="260" cellpadding="0" cellspacing="0" style="margin-left:auto;margin-top:16px;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
              <tr style="background:#F8FAFC;">
                <td style="padding:8px 16px;font-size:13px;color:#475569;">Subtotal</td>
                <td style="padding:8px 16px;font-size:13px;text-align:right;">${fmt(data.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:8px 16px;font-size:13px;color:#475569;">IGV (18%)</td>
                <td style="padding:8px 16px;font-size:13px;text-align:right;">${fmt(data.igv)}</td>
              </tr>
              <tr style="background:#1565C0;">
                <td style="padding:10px 16px;font-size:14px;font-weight:700;color:#fff;">Total</td>
                <td style="padding:10px 16px;font-size:14px;font-weight:700;color:#fff;text-align:right;">${fmt(data.total)}</td>
              </tr>
            </table>
          </td>
        </tr>
        ${data.observaciones ? `
        <tr>
          <td style="padding:0 32px 24px;">
            <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:12px 16px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#92400E;text-transform:uppercase;">Observaciones</p>
              <p style="margin:0;font-size:13px;color:#78350F;">${data.observaciones}</p>
            </div>
          </td>
        </tr>` : ''}
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
            <p style="margin:0;font-size:12px;color:#94A3B8;">
              Por favor confirme la recepción de esta orden y comuníquese si tiene alguna consulta.<br>
              Solicitado por: <strong>${data.solicitante}</strong>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
