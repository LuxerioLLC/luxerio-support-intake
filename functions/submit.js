const FORM_ENDPOINT = "https://docs.google.com/forms/d/e/1FAIpQLSeYZZZHmm_BrQRlS8aNmabN07Z-eTbiMbeK4_cDLwPsAI32ZQ/formResponse";
const ENTRY = {
  company: "entry.468456889",
  contact: "entry.36627010",
  storeCount: "entry.1722964837",
  consultation: "entry.2128780103",
  notes: "entry.1373182338",
  storeDetails: "entry.1715261592",
  email: "entry.1076458699"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function requiredString(data, key) {
  const value = String(data[key] || "").trim();
  return value || null;
}

export async function onRequestPost({ request }) {
  let data;

  try {
    data = await request.json();
  } catch {
    return json({ ok: false, message: "送信内容を確認できませんでした。" }, 400);
  }

  const required = ["company", "contact", "email", "storeCount", "consultation", "storeDetails", "notes"];
  const missing = required.filter((key) => !requiredString(data, key));
  if (missing.length > 0) {
    return json({ ok: false, message: "未入力の項目があります。", missing }, 400);
  }

  const body = new URLSearchParams();
  body.append(ENTRY.company, requiredString(data, "company"));
  body.append(ENTRY.contact, requiredString(data, "contact"));
  body.append(ENTRY.email, requiredString(data, "email"));
  body.append(ENTRY.storeCount, requiredString(data, "storeCount"));
  body.append(ENTRY.consultation, requiredString(data, "consultation"));
  body.append(ENTRY.storeDetails, requiredString(data, "storeDetails"));
  body.append(ENTRY.notes, requiredString(data, "notes"));

  const response = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    return json({ ok: false, message: "送信できませんでした。時間をおいて再度お試しください。" }, 502);
  }

  return json({ ok: true, message: "送信しました。担当者よりご連絡します。" });
}

export function onRequest() {
  return json({ ok: false, message: "Method Not Allowed" }, 405);
}
