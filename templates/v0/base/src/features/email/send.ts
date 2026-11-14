export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

export async function sendEmail(message: EmailMessage): Promise<{ id: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: message.from ?? "noreply@example.com",
      to: message.to,
      subject: message.subject,
      html: message.html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend request failed with status ${response.status}.`);
  }

  return (await response.json()) as { id: string };
}
