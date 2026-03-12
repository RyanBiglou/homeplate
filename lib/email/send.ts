import { Resend } from "resend";

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
  }
  return resendInstance;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: "HomePlate <noreply@homeplate.app>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Email send exception:", err);
    return { success: false, error: err };
  }
}

export async function sendAdminComplaintAlert(
  cookId: string,
  complaintCount: number
) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error("ADMIN_EMAIL not configured");
    return;
  }

  await sendEmail({
    to: adminEmail,
    subject: `IFSI Alert: Cook ${cookId} has ${complaintCount} complaints in 14 days`,
    html: `
      <h2>Complaint Threshold Reached</h2>
      <p>Cook ID: <strong>${cookId}</strong> has received <strong>${complaintCount}</strong> complaints in the last 14 days.</p>
      <p>Per IFSI requirements, this cook's complaints must be reviewed and potentially reported to the Local Enforcement Agency (LEA).</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/complaints">Review complaints</a></p>
    `,
  });
}
