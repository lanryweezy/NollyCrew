interface InvitationEmailData {
  inviterName: string;
  inviterEmail: string;
  projectName: string;
  role: string;
  message?: string;
  inviteLink: string;
  expiresAt: string;
}

export function generateInvitationEmail(data: InvitationEmailData): string {
  const { inviterName, projectName, role, message, inviteLink, expiresAt } = data;
  const formattedRole = role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const expiryDate = new Date(expiresAt).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Invitation - NollyCrew</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 48px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding-right: 12px; vertical-align: middle;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b, #f97316); border-radius: 10px; text-align: center; line-height: 40px;">
                      <span style="color: white; font-size: 20px; font-weight: bold;">N</span>
                    </div>
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">NollyCrew</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Invitation Badge -->
          <tr>
            <td style="padding: 32px 48px 0; text-align: center;">
              <div style="display: inline-block; background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); padding: 8px 20px; border-radius: 50px; margin-bottom: 24px;">
                <span style="color: #1e40af; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">🎬 PROJECT INVITATION</span>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 48px;">
              <h1 style="margin: 0 0 8px; font-size: 26px; font-weight: 700; color: #0f172a; text-align: center; line-height: 1.3;">
                You've Been Invited!
              </h1>
              <p style="margin: 0 0 32px; font-size: 16px; color: #64748b; text-align: center; line-height: 1.6;">
                ${inviterName} wants you to join their production team
              </p>
            </td>
          </tr>

          <!-- Project Card -->
          <tr>
            <td style="padding: 0 48px 32px;">
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom: 16px;">
                      <span style="color: #94a3b8; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Project</span>
                      <p style="margin: 4px 0 0; font-size: 20px; font-weight: 700; color: #0f172a;">${projectName}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 16px;">
                      <span style="color: #94a3b8; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Your Role</span>
                      <p style="margin: 4px 0 0;">
                        <span style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 4px 14px; border-radius: 6px; font-size: 14px; font-weight: 600;">${formattedRole}</span>
                      </p>
                    </td>
                  </tr>
                  ${message ? `
                  <tr>
                    <td style="padding-bottom: 16px;">
                      <span style="color: #94a3b8; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Personal Message</span>
                      <div style="margin: 8px 0 0; background: white; border-radius: 8px; padding: 16px; border-left: 3px solid #f59e0b;">
                        <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6; font-style: italic;">"${message}"</p>
                      </div>
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td>
                      <span style="color: #94a3b8; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Invited By</span>
                      <p style="margin: 4px 0 0; font-size: 14px; color: #334155;">
                        <strong>${inviterName}</strong> • ${data.inviterEmail}
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 48px 32px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 10px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); box-shadow: 0 4px 14px rgba(15, 23, 42, 0.3);">
                    <a href="${inviteLink}" style="display: inline-block; padding: 16px 48px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; letter-spacing: 0.3px;">
                      Accept Invitation →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 48px;">
              <div style="border-top: 1px solid #e2e8f0;"></div>
            </td>
          </tr>

          <!-- What's Next -->
          <tr>
            <td style="padding: 32px 48px;">
              <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #0f172a;">What happens next?</h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; vertical-align: top; width: 32px;">
                    <div style="width: 24px; height: 24px; background: #dbeafe; border-radius: 50%; text-align: center; line-height: 24px;">
                      <span style="color: #2563eb; font-size: 12px; font-weight: 700;">1</span>
                    </div>
                  </td>
                  <td style="padding: 8px 0 8px 12px;">
                    <p style="margin: 0; font-size: 14px; color: #334155;"><strong>Accept</strong> the invitation using the button above</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; vertical-align: top; width: 32px;">
                    <div style="width: 24px; height: 24px; background: #dbeafe; border-radius: 50%; text-align: center; line-height: 24px;">
                      <span style="color: #2563eb; font-size: 12px; font-weight: 700;">2</span>
                    </div>
                  </td>
                  <td style="padding: 8px 0 8px 12px;">
                    <p style="margin: 0; font-size: 14px; color: #334155;"><strong>Create your profile</strong> if you don't have one yet</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; vertical-align: top; width: 32px;">
                    <div style="width: 24px; height: 24px; background: #dbeafe; border-radius: 50%; text-align: center; line-height: 24px;">
                      <span style="color: #2563eb; font-size: 12px; font-weight: 700;">3</span>
                    </div>
                  </td>
                  <td style="padding: 8px 0 8px 12px;">
                    <p style="margin: 0; font-size: 14px; color: #334155;"><strong>Start collaborating</strong> with your new team!</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Expiry Notice -->
          <tr>
            <td style="padding: 0 48px 32px;">
              <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px 16px; text-align: center;">
                <p style="margin: 0; font-size: 13px; color: #92400e;">
                  ⏰ This invitation expires on <strong>${expiryDate}</strong>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 32px 48px; border-top: 1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 13px; color: #94a3b8;">
                      NollyCrew — The OS for Nollywood Productions
                    </p>
                    <p style="margin: 0 0 16px; font-size: 12px; color: #cbd5e1;">
                      Connecting actors, crew, and producers across Nigeria
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                      You received this because ${inviterName} invited you to a project.<br>
                      If you didn't expect this invitation, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

interface ApplicationUpdateEmailData {
  applicantName: string;
  projectName: string;
  jobTitle: string;
  status: 'accepted' | 'rejected' | 'shortlisted';
  feedback?: string;
  jobLink: string;
}

export function generateApplicationUpdateEmail(data: ApplicationUpdateEmailData): string {
  const { applicantName, projectName, jobTitle, status, feedback, jobLink } = data;
  
  const statusConfig = {
    accepted: { emoji: '🎉', title: 'Application Accepted!', color: '#16a34a', bg: '#dcfce7', message: 'Congratulations! Your application has been accepted.' },
    rejected: { emoji: '📋', title: 'Application Update', color: '#dc2626', bg: '#fee2e2', message: 'Thank you for your interest. Unfortunately, your application was not selected at this time.' },
    shortlisted: { emoji: '⭐', title: 'You\'ve Been Shortlisted!', color: '#2563eb', bg: '#dbeafe', message: 'Great news! You\'ve been shortlisted for the next round.' },
  };

  const config = statusConfig[status];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title} - NollyCrew</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 48px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding-right: 12px; vertical-align: middle;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b, #f97316); border-radius: 10px; text-align: center; line-height: 40px;">
                      <span style="color: white; font-size: 20px; font-weight: bold;">N</span>
                    </div>
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #ffffff; font-size: 24px; font-weight: 700;">NollyCrew</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Badge -->
          <tr>
            <td style="padding: 32px 48px 0; text-align: center;">
              <div style="display: inline-block; background: ${config.bg}; padding: 8px 20px; border-radius: 50px;">
                <span style="color: ${config.color}; font-size: 13px; font-weight: 600;">${config.emoji} ${config.title.toUpperCase()}</span>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 24px 48px; text-align: center;">
              <h1 style="margin: 0 0 8px; font-size: 26px; font-weight: 700; color: #0f172a;">${config.title}</h1>
              <p style="margin: 0 0 24px; font-size: 16px; color: #64748b; line-height: 1.6;">
                Hi ${applicantName},<br><br>
                ${config.message}
              </p>
            </td>
          </tr>

          <!-- Job Details -->
          <tr>
            <td style="padding: 0 48px 32px;">
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Position</p>
                <p style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #0f172a;">${jobTitle}</p>
                <p style="margin: 0 0 4px; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Project</p>
                <p style="margin: 0; font-size: 16px; color: #334155;">${projectName}</p>
              </div>
            </td>
          </tr>

          ${feedback ? `
          <!-- Feedback -->
          <tr>
            <td style="padding: 0 48px 32px;">
              <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; border-left: 3px solid #f59e0b;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Feedback</p>
                <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6;">${feedback}</p>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- CTA -->
          <tr>
            <td style="padding: 0 48px 32px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 10px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
                    <a href="${jobLink}" style="display: inline-block; padding: 14px 36px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none;">
                      View Job Details →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 24px 48px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                NollyCrew — The OS for Nollywood Productions
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

interface PasswordResetEmailData {
  userName: string;
  resetLink: string;
  expiresAt: string;
}

export function generatePasswordResetEmail(data: PasswordResetEmailData): string {
  const { userName, resetLink } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <tr>
          <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 48px; text-align: center;">
            <span style="color: #ffffff; font-size: 24px; font-weight: 700;">NollyCrew</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 48px; text-align: center;">
            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #0f172a;">Reset Your Password</h1>
            <p style="margin: 0 0 24px; font-size: 16px; color: #64748b; line-height: 1.6;">
              Hi ${userName},<br><br>
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 24px;">
              <tr>
                <td style="border-radius: 10px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
                  <a href="${resetLink}" style="display: inline-block; padding: 16px 48px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">
                    Reset Password
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin: 0 0 16px; font-size: 13px; color: #94a3b8;">
              This link expires in 1 hour. If you didn't request this, ignore this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
