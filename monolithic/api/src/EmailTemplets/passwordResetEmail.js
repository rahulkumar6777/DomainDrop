export const passwordResetEmailTemplate = ({ resetUrl }) => {
  return `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
          <tr>
            <td align="center">

              <table width="100%" cellpadding="0" cellspacing="0"
                style="
                  max-width:560px;
                  background:#ffffff;
                  border:1px solid #e4e4e7;
                  border-radius:16px;
                  overflow:hidden;
                "
              >

                <tr>
                  <td style="background:#09090b;padding:28px 36px;">
                    <div style="color:#fff;font-size:22px;font-weight:700;">
                      DOMAINDROP
                    </div>

                    <div style="color:#a1a1aa;font-size:12px;margin-top:5px;">
                      Secure cloud workspace
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:42px 36px;">

                    <div style="
                      display:inline-block;
                      background:#f4f4f5;
                      padding:7px 12px;
                      border-radius:20px;
                      font-size:12px;
                      font-weight:600;
                      color:#52525b;
                    ">
                      PASSWORD RESET
                    </div>

                    <h1 style="
                      margin:22px 0 12px;
                      color:#09090b;
                      font-size:28px;
                    ">
                      Reset your password.
                    </h1>

                    <p style="
                      color:#52525b;
                      font-size:15px;
                      line-height:1.7;
                    ">
                      We received a request to reset your DomainDrop password.
                      Click the button below to create a new password.
                    </p>

                    <a href="${resetUrl}"
                      style="
                        display:inline-block;
                        margin-top:22px;
                        padding:14px 26px;
                        background:#09090b;
                        color:#ffffff;
                        text-decoration:none;
                        border-radius:8px;
                        font-weight:600;
                        font-size:14px;
                      "
                    >
                      Reset Password →
                    </a>

                    <div style="
                      margin-top:30px;
                      padding:16px;
                      background:#fafafa;
                      border:1px solid #eeeeee;
                      border-radius:8px;
                    ">
                      <p style="margin:0;color:#71717a;font-size:13px;">
                        This reset link expires in
                        <strong style="color:#18181b;">15 minutes</strong>.
                      </p>
                    </div>

                    <hr style="
                      border:none;
                      border-top:1px solid #eeeeee;
                      margin:30px 0;
                    " />

                    <p style="
                      color:#a1a1aa;
                      font-size:12px;
                      line-height:1.6;
                    ">
                      If you didn't request a password reset, you can safely
                      ignore this email. Your password will remain unchanged.
                    </p>

                  </td>
                </tr>

                <tr>
                  <td style="
                    background:#fafafa;
                    border-top:1px solid #eeeeee;
                    padding:20px 36px;
                  ">
                    <p style="margin:0;color:#a1a1aa;font-size:11px;">
                      © ${new Date().getFullYear()} DomainDrop
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};