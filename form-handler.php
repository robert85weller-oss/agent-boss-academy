<?php
/**
 * Formular-Handler für Hostinger (ersetzt Netlify Forms).
 *
 * Nimmt `readiness-check` (per fetch) und `skool-waitlist` (klassischer POST) entgegen,
 * speichert jeden Lead als CSV-Zeile außerhalb des Webroots und schickt eine E-Mail.
 */

// ── Konfiguration ──
const LEAD_RECIPIENT = 'kontakt@agent-boss-academy.com';
// Absender muss ein existierendes Postfach auf der eigenen Domain sein (sonst verwirft Hostinger die Mail).
const LEAD_SENDER    = 'kontakt@agent-boss-academy.com';

const FORMS = [
    'readiness-check' => ['name', 'email', 'level', 'score'],
    'skool-waitlist'  => ['name', 'email'],
];

function respond(int $status, string $form, bool $ajax): void
{
    if (!$ajax && $form === 'skool-waitlist' && $status === 200) {
        header('Location: /?waitlist=success', true, 303);
        exit;
    }
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => $status === 200]);
    exit;
}

// Leads liegen außerhalb von public_html; nur wenn das nicht beschreibbar ist, im gesperrten _data/.
function leadDir(): string
{
    $outside = dirname(__DIR__) . '/ab-leads';
    if (is_dir($outside) || @mkdir($outside, 0750, true)) {
        return $outside;
    }
    return __DIR__ . '/_data';
}

// Verhindert Formel-Injection beim Öffnen der CSV in Excel/Sheets.
function csvSafe(string $v): string
{
    return preg_match('/^[=+\-@\t\r]/', $v) ? "'" . $v : $v;
}

$ajax = !empty($_SERVER['HTTP_X_REQUESTED_WITH'])
    || str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');
$form = (string)($_POST['form-name'] ?? '');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset(FORMS[$form])) {
    respond(400, $form, $ajax);
}

// Honeypot: Bots füllen das versteckte Feld aus → so tun, als hätte es geklappt.
if (trim((string)($_POST['bot-field'] ?? '')) !== '') {
    respond(200, $form, $ajax);
}

$data = [];
foreach (FORMS[$form] as $field) {
    $value = trim(str_replace(["\r", "\n"], ' ', (string)($_POST[$field] ?? '')));
    $data[$field] = mb_substr($value, 0, 200);
}

if ($data['name'] === '' || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    respond(422, $form, $ajax);
}

// ── Speichern ──
$dir = leadDir();
$file = $dir . '/' . $form . '.csv';
$isNew = !file_exists($file);
$fh = @fopen($file, 'a');
if ($fh) {
    flock($fh, LOCK_EX);
    if ($isNew) {
        fputcsv($fh, array_merge(['timestamp'], FORMS[$form]));
    }
    fputcsv($fh, array_merge([date('c')], array_map('csvSafe', array_values($data))));
    flock($fh, LOCK_UN);
    fclose($fh);
}

// ── Benachrichtigung ──
$subject = '=?UTF-8?B?' . base64_encode("Neuer Lead: $form – {$data['name']}") . '?=';
$body = "Neuer Eintrag im Formular \"$form\":\n\n";
foreach ($data as $k => $v) {
    $body .= str_pad($k . ':', 8) . " $v\n";
}
$body .= "\nZeitpunkt: " . date('d.m.Y H:i') . "\n";
$headers = implode("\r\n", [
    'From: Agent Boss Academy <' . LEAD_SENDER . '>',
    'Reply-To: ' . $data['email'],
    'Content-Type: text/plain; charset=UTF-8',
]);
$mailed = @mail(LEAD_RECIPIENT, $subject, $body, $headers);

respond(($fh || $mailed) ? 200 : 500, $form, $ajax);
