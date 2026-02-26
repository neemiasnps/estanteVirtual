function gerarTemplateEmail({ titulo, conteudo }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Biblioteca Nichele</title>
  </head>

  <body style="margin:0; padding:0; background-color:#edf2f7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#edf2f7; padding:40px 15px;">
    <tr>
      <td align="center">

        <!-- Container Principal -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:650px; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.08);">

          <!-- Header Premium -->
          <tr>
            <td align="center" style="background:linear-gradient(135deg,#0f2f4d,#17436a); padding:40px 30px;">

              <img src="https://biblioteca-nichele.onrender.com/images/logo.png"
                   alt="Biblioteca Nichele"
                   style="max-width:170px; width:100%; height:auto; display:block; margin-bottom:20px;">

              <h1 style="color:#ffffff; font-size:22px; font-weight:600; margin:0; letter-spacing:0.5px;">
                ${titulo}
              </h1>

            </td>
          </tr>

          <!-- Barra Institucional -->
          <tr>
            <td style="height:5px; background:linear-gradient(to right,#bb1518,#e63946);"></td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding:40px 35px; color:#2d3748; font-size:15px; line-height:1.8;">

              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px;">
                <tr>
                  <td style="padding:25px;">
                    ${conteudo}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:#0f2f4d; padding:25px; color:#ffffff; font-size:12px; line-height:1.6;">
              <strong style="font-size:13px;">Biblioteca Nichele</strong><br>
              Sistema Interno de Gestão de Empréstimos<br>
              © ${new Date().getFullYear()} Nichele Materiais de Construção
            </td>
          </tr>

        </table>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:650px;">
          <tr>
            <td align="center" style="padding:18px; font-size:11px; color:#718096;">
              Esta é uma mensagem automática. Não é necessário respondê-la.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

  </body>
  </html>
  `;
}

module.exports = gerarTemplateEmail;