"use server";

import { Resend } from "resend";
import { siteConfig } from "@/content/site.config";
import { createContactMessage, isBackendConfigured } from "@/lib/backend";

export interface ContactFormState {
  status: "idle" | "sent" | "error";
  error?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function storeMessage(name: string, email: string, message: string): Promise<boolean> {
  if (!isBackendConfigured()) return false;
  try {
    await createContactMessage({ name, email, message });
    return true;
  } catch (error) {
    console.error("Failed to store contact message:", error);
    return false;
  }
}

async function sendEmail(name: string, email: string, message: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set.");
    return false;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: process.env.CONTACT_TO_EMAIL || siteConfig.contactEmail,
      replyTo: email,
      subject: `Portfolio contact from ${name}`,
      text: `${message}\n\n— ${name} (${email})`,
    });
    if (error) {
      console.error("Resend error:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Resend error:", error);
    return false;
  }
}

export async function submitContact(
  _previous: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = field(formData, "name");
  const email = field(formData, "email");
  const message = field(formData, "message");

  // Honeypot: real users never fill this hidden field. Pretend success so bots don't learn.
  if (field(formData, "company")) {
    return { status: "sent" };
  }

  if (!name || !email || !message) {
    return { status: "error", error: "Name, email, and message are required." };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", error: "Enter a valid email address." };
  }

  if (name.length > 200 || email.length > 200 || message.length > 5000) {
    return { status: "error", error: "One of the fields is too long." };
  }

  // Store first so the message is never lost, then email. Success if either worked.
  const stored = await storeMessage(name, email, message);
  const emailed = await sendEmail(name, email, message);

  if (!stored && !emailed) {
    return { status: "error", error: "Failed to send message." };
  }

  return { status: "sent" };
}
