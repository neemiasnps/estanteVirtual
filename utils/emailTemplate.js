function gerarTemplateEmail({ titulo, conteudo }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Biblioteca Nichele</title>
  </head>

  <body style="margin:0; padding:0; background-color:#f2f4f7; font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:20px; background-color:#f2f4f7;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background:#ffffff; border-radius:8px; overflow:hidden;">

          <!-- Cabeçalho -->
          <tr>
            <td align="center" style="background-color:#17436a; padding:25px;">
              <img src="https://biblioteca-nichele.onrender.com/images/logo.png"
                   alt="Biblioteca Nichele"
                   style="max-width:200px; width:100%; height:auto; display:block;">
              <p style="color:#ffffff; font-size:18px; margin:15px 0 0 0;">
                ${titulo}
              </p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding:25px; color:#333333; font-size:14px; line-height:1.6;">
              ${conteudo}
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td align="center" style="background-color:#17436a; padding:15px; color:#ffffff; font-size:12px;">
              Biblioteca Nichele<br>
              Comunicação automática do sistema
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