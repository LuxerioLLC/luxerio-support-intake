# Luxerio Support LINE運用メモ

## アカウントの役割

POS・決済、シフト管理、補助金・助成金に関する事前ヒアリングと個別案内の窓口。
「導入受付」ではなく、正式案内前の状況把握と相談受付として運用する。

## プロフィール設定

アカウント名:
`Luxerio Support`

ステータスメッセージ:
`POS/シフト/補助金窓口`

プロフィール背景:
`line-profile-cover-luxerio.png`

プロフィール表示:
投稿運用を開始するまでは「最近の投稿」を非表示にする。
空のセクションが見えると初回接点の信頼感が下がるため。

ステータスメッセージ公開時の注意:
LINE管理画面上で「今後1時間はステータスメッセージを変更できなくなります」と表示されるため、公開前に文言を確認する。

説明文:

```
Luxerio Supportは、POS・決済、シフト管理、補助金・助成金に関するご案内窓口です。
現在の運用状況を確認のうえ、担当者より個別にご案内します。
```

リンク:

| 表示名 | URL |
| --- | --- |
| POS・決済フォーム | `https://luxerio-support-intake-preview.pages.dev/pos.html` |
| シフト管理フォーム | `https://luxerio-support-intake-preview.pages.dev/shift.html` |
| 補助金・助成金フォーム | `https://luxerio-support-intake-preview.pages.dev/subsidy.html` |

HP / Instagram:

- 公式HPは、正しいURLが確定している場合のみプロフィールへ追加する。信頼補完になるため、確定URLがあるなら追加推奨。
- Instagramは、投稿品質と更新頻度が担保できる場合のみ追加する。空、低頻度、世界観が違う場合は入れない。
- URL未確認の状態で外部リンクを増やさない。同名・類似名サイトへの誤誘導は初回接点の信用を落とす。

## 推奨あいさつメッセージ

初回追加時点では、フォーム回答より先に会社名・担当者名をLINE上で取得する。
LINEの友だち一覧だけでは企業名が分からず、フォーム未回答のユーザーを追えないため。
Webhook設定後は、会社名・担当者名のメッセージを受信した時点でフォーム案内を自動返信する。

現在のあいさつメッセージに「導入相談」「POS相談」「シフト管理相談」「入力目安1〜2分」「下のメニューから該当フォームを選択してください」が残っている場合は、下記へ差し替える。

```
友だち追加ありがとうございます。
Luxerio Supportです。

お問い合わせありがとうございます。
内容を確認のうえ、担当者よりご案内いたします。

恐れ入りますが、まず下記2点をこのトークへお送りください。

・会社名 / 屋号
・ご担当者様名

メッセージを確認後、POS・決済、シフト管理、補助金・助成金のフォームをご案内します。

通常1営業日以内に担当者よりご連絡いたします。
```

## 自動返信設定

Cloudflare Pages FunctionsにLINE Messaging API用のWebhookを追加済み。
会社名・担当者名のメッセージを受信するとフォーム案内を自動返信し、フォーム送信後のLINEメッセージには受付確認を自動返信する。

Webhook URL:
`https://luxerio-support-intake-preview.pages.dev/line-webhook`

Cloudflareに設定する環境変数:

| 変数名 | 内容 |
| --- | --- |
| `LINE_CHANNEL_SECRET` | LINE DevelopersのMessaging APIチャネルシークレット |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE DevelopersのMessaging APIチャネルアクセストークン |

LINE Developers側の作業:

1. Messaging APIチャネルでWebhook URLを設定する。
2. Webhookの利用をオンにする。
3. チャネルアクセストークンを発行し、Cloudflare Pagesの環境変数へ登録する。
4. LINE Official Account Managerの応答設定で、Webhookが有効に動作する状態にする。

## リッチメニュー設定

画像:
`line-rich-menu-luxerio.png`

サイズ:
2500 x 843 px

チャットバー文言:
`メニューを開く`

タップ領域:

| 領域 | アクション |
| --- | --- |
| POS・決済 | `https://luxerio-support-intake-preview.pages.dev/pos.html` |
| シフト管理 | `https://luxerio-support-intake-preview.pages.dev/shift.html` |
| 補助金相談 | `https://luxerio-support-intake-preview.pages.dev/subsidy.html` |

座標は `line-rich-menu-areas.json` を参照。

## 営業・担当者の一次対応

友だち追加後に会社名・担当者名が届いたら、相談内容を確認して該当フォームを案内する。
フォーム送信後は、スプレッドシートの会社名とLINE上の会社名を照合する。

推奨タグ:

- `POS`
- `Shift`
- `補助金`
- `未回答`
- `フォーム送付済`
- `回答済`
- `要返信`
- `返信済`

無料プランでチャットタグ数に制限がある場合は、優先して `要返信` を付ける。

## 初回返信テンプレート

会社名・担当者名が届いた直後:

```
ご連絡ありがとうございます。
会社名・ご担当者様名を確認いたしました。

お手数ですが、ご相談内容に近いフォームをご入力ください。
分かる範囲で問題ございません。

POS・決済:
https://luxerio-support-intake-preview.pages.dev/pos.html

シフト管理:
https://luxerio-support-intake-preview.pages.dev/shift.html

補助金・助成金:
https://luxerio-support-intake-preview.pages.dev/subsidy.html

該当するものが複数ある場合は、必要なフォームのみご回答ください。
```

フォーム回答後:

```
フォームのご入力ありがとうございます。
内容を確認のうえ、担当者より通常1営業日以内にご連絡いたします。

追加で確認が必要な場合は、こちらのLINEよりご連絡いたします。
```

## 未回答フォロー

友だち追加から24時間以内にフォーム回答がない場合は、1回だけリマインドする。
初回から長文を重ねると離脱しやすいため、再送は短くする。

```
先ほどご案内したフォームについて、未回答の場合はこちらからご入力ください。
分かる範囲で問題ございません。

POS・決済 / シフト管理 / 補助金・助成金:
https://luxerio-support-intake-preview.pages.dev/
```

## 追加確認が必要な場合

追加質問は最大2点までに絞る。

POS・決済:

- 現在の決済手数料が不明な場合、分かる範囲で明細・契約画面を確認できるか
- 複数店舗の場合、POSや決済会社が店舗ごとに異なるか

シフト管理:

- シフト希望の回収方法
- 勤怠・給与連携の必要有無
