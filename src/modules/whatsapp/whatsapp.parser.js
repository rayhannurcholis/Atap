export function parseIncomingMessage(body) {
  const entry = body?.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const message = value?.messages?.[0];

  if (!message) return null;

  return {
    phone: message.from,
    text: message.text?.body || "",
    rawMessage: message,
    rawValue: value,
  };
}

export function normalizeText(text) {
  return (text || "").trim().toUpperCase();
}

export function parseOtpCommand(text) {
  return text.trim().split(/\s+/)[1] || "";
}

export function parseUpdateProfileCommand(text) {
  const parts = text.trim().split(" ");
  const field = parts[1];
  const value = parts.slice(2).join(" ").trim();

  return { field, value };
}

export function parseIndexedUpdateCommand(text) {
  const parts = text.trim().split(/\s+/);

  return {
    listingNumber: Number(parts[2]),
    roomNumber: Number(parts[3]),
    value: Number(parts[4]),
  };
}