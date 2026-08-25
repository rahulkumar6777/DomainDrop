export function welcomeEmailTemplate({ name, appUrl }) {
    const displayName = name?.trim() || "there";
    const dashboardUrl = sanitizeUrl(appUrl);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>Welcome to DomainDrop</title>
  <style>
    @media only screen and (max-width: 620px) {
      .email-shell { padding: 16px 8px !important; }
      .content-pad { padding-left: 22px !important; padding-right: 22px !important; }
      .hero-title { font-size: 32px !important; line-height: 38px !important; }
      .header-label { display: none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#eef3f2;font-family:Arial,Helvetica,sans-serif;color:#14211f;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Your private bucket and default Space are ready. Start uploading with DomainDrop.
  </div>

  <table class="email-shell" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#eef3f2" style="width:100%;background-color:#eef3f2;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:620px;background-color:#ffffff;border:1px solid #d9e3e1;border-radius:16px;overflow:hidden;">
          <tr>
            <td class="content-pad" style="padding:20px 32px;border-bottom:1px solid #d9e3e1;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="38" height="38" align="center" valign="middle" bgcolor="#102925" style="width:38px;height:38px;background-color:#102925;color:#ffffff;border-radius:8px;font-size:13px;font-weight:800;">
                          DD
                        </td>
                        <td style="padding-left:11px;font-size:18px;font-weight:800;color:#14211f;">
                          DomainDrop
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td class="header-label" align="right" valign="middle" style="font-size:10px;color:#64746f;text-transform:uppercase;letter-spacing:1px;font-weight:700;">
                    Object storage
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="content-pad" bgcolor="#102925" style="padding:46px 32px;background-color:#102925;color:#ffffff;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td bgcolor="#d8f369" style="padding:7px 11px;background-color:#d8f369;color:#102925;border-radius:6px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">
                    Account ready
                  </td>
                </tr>
              </table>

              <h1 class="hero-title" style="margin:22px 0 0;font-size:40px;line-height:46px;font-weight:800;color:#ffffff;">
                Your object storage<br />is ready.
              </h1>

              <p style="margin:18px 0 0;max-width:500px;font-size:15px;line-height:24px;color:#b9cbc7;">
                Hi ${escapeHtml(displayName)}, your email is verified. We have provisioned your private bucket and created a default Space, so you can upload your first object right away.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;border-top:1px solid #31504a;">
                <tr>
                  ${statusCell("Bucket", "Provisioned")}
                  ${statusCell("Visibility", "Private")}
                  ${statusCell("Default Space", "Ready", true)}
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="content-pad" style="padding:36px 32px 18px;">
              <p style="margin:0;font-size:11px;font-weight:800;color:#078a7d;text-transform:uppercase;letter-spacing:1px;">
                Built for your workflow
              </p>
              <h2 style="margin:9px 0 8px;font-size:22px;line-height:29px;font-weight:800;color:#14211f;">
                Store, organize and deliver files your way.
              </h2>
              <p style="margin:0 0 24px;font-size:14px;line-height:22px;color:#64746f;">
                DomainDrop gives each account one storage bucket. Spaces and nested object paths keep projects organized inside it.
              </p>

              ${featureRow(
        "01",
        "Organize with Spaces",
        "Use the default Space or create separate Spaces for each project. Nested paths such as images/products/cover.webp keep objects easy to browse.",
        "#e7f7f4",
        "#087f73"
    )}

              ${featureRow(
        "02",
        "Choose how files are delivered",
        "Keep the bucket private for expiring signed URLs, or switch it to public-read to serve every object through your CDN domain.",
        "#fff3cc",
        "#7a5700"
    )}

              ${featureRow(
        "03",
        "Connect your application",
        "Create a scoped API key and use the REST API or Node.js package. Signed uploads send files directly to storage, with multipart support for large objects.",
        "#ecebff",
        "#5548a8"
    )}
            </td>
          </tr>

          <tr>
            <td class="content-pad" style="padding:10px 32px 34px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f2f6f5" style="background-color:#f2f6f5;border:1px solid #d9e3e1;border-radius:10px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0;font-size:16px;font-weight:800;color:#14211f;">
                      Start with your first upload.
                    </p>
                    <p style="margin:7px 0 19px;font-size:13px;line-height:21px;color:#64746f;">
                      Open the dashboard, choose a Space and upload a file. You can create an API key later when you are ready to connect your application.
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td bgcolor="#102925" style="background-color:#102925;border-radius:7px;">
                          <a href="${dashboardUrl}" style="display:inline-block;padding:13px 19px;color:#ffffff;text-decoration:none;font-size:13px;font-weight:800;">
                            Open your dashboard
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="content-pad" style="padding:0 32px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #d9e3e1;">
                <tr>
                  <td style="padding-top:22px;">
                    <p style="margin:0;font-size:12px;line-height:19px;color:#71807c;">
                      <strong style="color:#344540;">A quick privacy note:</strong> visibility applies to your complete bucket. Keep it private when objects should only be opened through signed, expiring URLs.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" bgcolor="#f7f9f8" style="padding:23px 32px;background-color:#f7f9f8;border-top:1px solid #d9e3e1;">
              <p style="margin:0;font-size:12px;font-weight:800;color:#344540;">DomainDrop</p>
              <p style="margin:6px 0 0;font-size:11px;color:#71807c;">Object storage that is simple to use and ready to build on.</p>
              <p style="margin:13px 0 0;font-size:10px;line-height:16px;color:#9aa7a3;">
                You received this email because your DomainDrop account was successfully verified.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function statusCell(label, value, isLast = false) {
    const border = isLast ? "" : "border-right:1px solid #31504a;";

    return `
      <td width="33.33%" valign="top" style="padding:17px 10px 0 0;${border}">
        <p style="margin:0;font-size:9px;line-height:14px;font-weight:700;color:#78958f;text-transform:uppercase;letter-spacing:1px;">${label}</p>
        <p style="margin:4px 0 0;font-size:12px;line-height:18px;font-weight:800;color:#ffffff;">${value}</p>
      </td>`;
}

function featureRow(number, title, description, numberBackground, numberColor) {
    return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;border:1px solid #d9e3e1;border-radius:10px;">
        <tr>
          <td width="54" valign="top" style="padding:17px 0 17px 17px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="34" height="34" align="center" valign="middle" bgcolor="${numberBackground}" style="width:34px;height:34px;background-color:${numberBackground};color:${numberColor};border-radius:7px;font-size:10px;font-weight:800;">
                  ${number}
                </td>
              </tr>
            </table>
          </td>
          <td valign="top" style="padding:16px 17px;">
            <p style="margin:0;font-size:14px;line-height:20px;font-weight:800;color:#14211f;">${title}</p>
            <p style="margin:5px 0 0;font-size:12px;line-height:19px;color:#64746f;">${description}</p>
          </td>
        </tr>
      </table>`;
}

function sanitizeUrl(value) {
    try {
        const url = new URL(value);
        if (!["http:", "https:"].includes(url.protocol)) {
            return "#";
        }

        return escapeHtml(url.toString());
    } catch {
        return "#";
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
