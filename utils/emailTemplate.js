function gerarTemplateEmail({ titulo, conteudo }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Biblioteca Nichele</title>
  </head>

  <body style="margin:0; padding:0; background-color:#edf2f7; font-family:Arial, Helvetica, sans-serif;">

  <span style="display:none; max-height:0; overflow:hidden;">
    Atualização do seu empréstimo na Biblioteca Nichele
  </span>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#edf2f7; padding:30px 10px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:650px; background:#ffffff; border-radius:14px;">

          <!-- Header -->
          <tr>
            <td align="center" style="background:#17436a; padding:30px 20px;">

              <img src="https://bibliotecanichele.com.br/images/logo.png"
                   alt="Biblioteca Nichele"
                   width="170"
                   style="display:block; margin-bottom:15px; border:0;">

              <h1 style="color:#ffffff; font-size:20px; margin:0;">
                ${titulo}
              </h1>

            </td>
          </tr>

          <!-- Barra -->
          <tr>
            <td style="height:4px; background:#bb1518;"></td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding:30px 20px; color:#2d3748; font-size:14px; line-height:1.6;">

              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
                <tr>
                  <td style="padding:20px;">
                    ${conteudo}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:#0f2f4d; padding:20px; color:#ffffff; font-size:12px;">
              <strong>Biblioteca Nichele</strong><br>
              Gestão de Empréstimos<br>
              © ${new Date().getFullYear()} Grupo Nichele
            </td>
          </tr>

        </table>

        <table width="100%" style="max-width:650px;">
          <tr>
            <td align="center" style="padding:15px; font-size:11px; color:#718096;">
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