const LINE_REPLY_ENDPOINT = "https://api.line.me/v2/bot/message/reply";
const POS_URL = "https://luxerio-support-intake-preview.pages.dev/pos.html";
const SHIFT_URL = "https://luxerio-support-intake-preview.pages.dev/shift.html";
const SUBSIDY_URL = "https://luxerio-support-intake-preview.pages.dev/subsidy.html";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function toBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function timingSafeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function verifySignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  return timingSafeEqual(toBase64(digest), signature);
}

function detectIntent(text) {
  const normalized = text.toLowerCase();
  return {
    pos: normalized.includes("pos") || text.includes("決済") || text.includes("レジ"),
    shift: text.includes("シフト") || text.includes("勤怠"),
    subsidy: text.includes("補助金") || text.includes("助成金") || text.includes("補助")
  };
}

function buildFormGuide(text) {
  const intent = detectIntent(text);
  const matched = [
    intent.pos && `POS・決済\n${POS_URL}`,
    intent.shift && `シフト管理\n${SHIFT_URL}`,
    intent.subsidy && `補助金・助成金\n${SUBSIDY_URL}`
  ].filter(Boolean);

  const formList = matched.length > 0
    ? matched.join("\n\n")
    : [
      `POS・決済\n${POS_URL}`,
      `シフト管理\n${SHIFT_URL}`,
      `補助金・助成金\n${SUBSIDY_URL}`
    ].join("\n\n");

  return [
    "ご連絡ありがとうございます。",
    "会社名・ご担当者様名を確認いたしました。",
    "",
    "お手数ですが、ご相談内容に近いフォームをご入力ください。",
    "分かる範囲で問題ございません。",
    "",
    formList,
    "",
    "ご入力後、内容を確認のうえ担当者よりご案内いたします。"
  ].join("\n");
}

function buildFormReceivedMessage() {
  return [
    "フォームのご入力ありがとうございます。",
    "内容を確認のうえ、担当者より通常1営業日以内にご連絡いたします。",
    "",
    "追加で確認が必要な場合は、こちらのLINEよりご連絡いたします。"
  ].join("\n");
}

async function replyMessage(replyToken, text, accessToken) {
  const response = await fetch(LINE_REPLY_ENDPOINT, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${accessToken}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`LINE reply failed: ${response.status} ${body}`);
  }
}

export async function onRequestPost({ request, env }) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-line-signature");

  if (!await verifySignature(rawBody, signature, env.LINE_CHANNEL_SECRET)) {
    return json({ ok: false, message: "Invalid signature" }, 401);
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json({ ok: false, message: "Invalid JSON" }, 400);
  }

  for (const event of payload.events || []) {
    if (event.type !== "message" || event.message?.type !== "text" || !event.replyToken) continue;

    const text = event.message.text.trim();
    const replyText = text.includes("フォーム送信済み")
      ? buildFormReceivedMessage()
      : buildFormGuide(text);

    await replyMessage(event.replyToken, replyText, env.LINE_CHANNEL_ACCESS_TOKEN);
  }

  return json({ ok: true });
}

export function onRequest() {
  return json({ ok: false, message: "Method Not Allowed" }, 405);
}
