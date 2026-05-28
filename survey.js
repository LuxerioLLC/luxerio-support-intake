const surveyType = document.body.dataset.surveyType;
const surveyLabels = {
  pos: {
    consultation: "POSについて",
    summary: "POS・決済事前ヒアリング",
    line: "POS・決済"
  },
  shift: {
    consultation: "シフト管理について",
    summary: "シフト管理事前ヒアリング",
    line: "シフト管理"
  },
  subsidy: {
    consultation: "補助金について",
    summary: "補助金・助成金事前確認",
    line: "補助金・助成金"
  }
};
const surveyLabel = surveyLabels[surveyType] || surveyLabels.pos;
const consultationValue = surveyLabel.consultation;
const isSubsidySurvey = surveyType === "subsidy";
const storeCount = document.querySelector("#storeCount");
const stores = document.querySelector("#stores");
const form = document.querySelector("#intakeForm");
const status = document.querySelector("#status");
const submitButton = document.querySelector("#submitButton");
const lineFollowup = document.querySelector("#lineFollowup");
const lineFollowupLink = document.querySelector("#lineFollowupLink");

if (storeCount) {
  for (let i = 1; i <= 20; i += 1) {
    const option = document.createElement("option");
    option.value = String(i);
    option.textContent = `${i}店舗`;
    storeCount.append(option);
  }
}

function renderStores() {
  if (!storeCount || !stores) return;
  const count = Number(storeCount.value || 1);
  stores.replaceChildren();

  for (let i = 1; i <= count; i += 1) {
    const card = document.createElement("div");
    card.className = "store-card";
    card.innerHTML = `
      <h3>店舗 ${i}</h3>
      <div class="store-grid">
        <div class="field">
          <label class="required" for="store-name-${i}">店舗名</label>
          <input id="store-name-${i}" name="storeName" placeholder="例: 銀座店" required>
        </div>
        <div class="field">
          <label class="required" for="staff-${i}">スタッフ数</label>
          <input id="staff-${i}" name="staff" type="number" inputmode="numeric" min="0" step="1" placeholder="0" required>
        </div>
        <div class="field">
          <label class="required" for="cast-${i}">キャスト数</label>
          <input id="cast-${i}" name="cast" type="number" inputmode="numeric" min="0" step="1" placeholder="0" required>
        </div>
      </div>
    `;
    stores.append(card);
  }
}

function checkedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function buildStoreSummary() {
  if (!stores) {
    if (isSubsidySurvey) return "店舗別情報: 対象外（グループ単位の申請確認）";
    return `ご相談対象の店舗数: ${storeCount?.value || "未入力"}店舗`;
  }

  const names = [...document.querySelectorAll('input[name="storeName"]')];
  const staff = [...document.querySelectorAll('input[name="staff"]')];
  const cast = [...document.querySelectorAll('input[name="cast"]')];

  return names.map((input, index) => {
    return `${index + 1}. 店舗名: ${input.value.trim()} / スタッフ数: ${staff[index].value}名 / キャスト数: ${cast[index].value}名`;
  }).join("\n");
}

function labelFor(input) {
  const id = input.id;
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) return label.textContent.replace("必須", "").trim();
  }

  const fieldset = input.closest("fieldset");
  if (fieldset) return fieldset.querySelector("legend")?.textContent.replace("必須", "").trim();

  return input.name;
}

function valueFor(element) {
  const value = element.value.trim();
  return value || "未入力";
}

function buildSurveySummary() {
  const lines = [];
  lines.push(`アンケート種別: ${surveyLabel.summary}`);

  document.querySelectorAll("[data-summary]").forEach((element) => {
    if (element.matches('input[type="checkbox"]')) return;
    if (element.matches("fieldset")) {
      const values = checkedValues(element.dataset.summary);
      lines.push(`${element.querySelector("legend").textContent.replace("必須", "").trim()}: ${values.join("、") || "未選択"}`);
      return;
    }

    lines.push(`${labelFor(element)}: ${valueFor(element)}`);
  });

  const freeNote = document.querySelector("#notes").value.trim();
  if (freeNote) lines.push(`補足・ご要望: ${freeNote}`);

  return lines.join("\n");
}

function buildLineFollowupUrl(company) {
  const message = `フォーム送信済みです。\n会社名・屋号: ${company}\n相談内容: ${surveyLabel.line}\nご確認をお願いいたします。`;
  return `https://line.me/R/oaMessage/%40478eozzg/?${encodeURIComponent(message)}`;
}

storeCount?.addEventListener("change", renderStores);
renderStores();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  status.textContent = "";
  status.className = "status";
  if (lineFollowup) lineFollowup.hidden = true;

  const requiredGroups = [...document.querySelectorAll("[data-required-group]")];
  const emptyGroup = requiredGroups.find((fieldset) => checkedValues(fieldset.dataset.requiredGroup).length === 0);
  if (emptyGroup) {
    status.textContent = `${emptyGroup.querySelector("legend").textContent.replace("必須", "").trim()}を1つ以上お選びください。`;
    status.classList.add("error");
    return;
  }

  if (!form.reportValidity()) return;

  const company = document.querySelector("#company").value.trim();
  const payload = {
    company,
    contact: document.querySelector("#contact").value.trim(),
    email: document.querySelector("#email").value.trim(),
    storeCount: isSubsidySurvey ? "対象外（グループ単位）" : storeCount?.value || "未入力",
    consultation: consultationValue,
    storeDetails: buildStoreSummary(),
    notes: buildSurveySummary()
  };

  submitButton.disabled = true;
  submitButton.textContent = "送信しています";

  try {
    const response = await fetch("/submit", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.message || "送信できませんでした。");
    }

    status.textContent = "送信ありがとうございます。内容を確認のうえ、通常1営業日以内に担当者よりご連絡いたします。";
    status.classList.add("ok");
    if (lineFollowup && lineFollowupLink) {
      lineFollowupLink.href = buildLineFollowupUrl(company);
      lineFollowup.hidden = false;
    }
    form.reset();
    if (storeCount) storeCount.value = "1";
    renderStores();
  } catch (error) {
    status.textContent = "送信できませんでした。恐れ入りますが、時間をおいて再度お試しください。";
    status.classList.add("error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "この内容で送信する";
  }
});
