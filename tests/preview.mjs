import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const baseURL = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const outDir = path.resolve("artifacts");
fs.mkdirSync(outDir, { recursive: true });

const firebaseMocks = {
  "firebase-app.js": "export function initializeApp(config) { return { name: 'KantorAI-CI', options: config }; }",
  "firebase-auth.js": "export function getAuth() { return { currentUser: null }; } export async function signInAnonymously(auth) { auth.currentUser = { uid: 'qa-preview-user' }; return { user: auth.currentUser }; }",
  "firebase-database.js": [
    "export function getDatabase() { return { __mock: true }; }",
    "export function ref(db, path = '') { return { db, path }; }",
    "export function query(reference) { return reference; }",
    "export function limitToLast() { return null; }",
    "export function onValue(reference, callback) { queueMicrotask(() => callback({ val: () => null })); return () => {}; }",
    "export function push() { return Promise.resolve({ key: 'qa-message' }); }",
    "export async function set() { return undefined; }",
    "export async function runTransaction(reference, updater) { const next = updater(null); return { committed: next !== undefined, snapshot: { val: () => next } }; }"
  ].join("\n")
};

const browser = await chromium.launch({ headless: true });
const report = {
  baseURL: baseURL,
  startedAt: new Date().toISOString(),
  checks: [],
  consoleErrors: [],
  pageErrors: [],
  failedAssetRequests: [],
  viewports: {}
};

function check(condition, message) {
  if (!condition) throw new Error(message);
  report.checks.push({ name: message, passed: true });
  console.log("PASS:", message);
}

async function routeFirebase(page) {
  await page.route("https://www.gstatic.com/firebasejs/**", async route => {
    const url = route.request().url();
    const entry = Object.entries(firebaseMocks).find(([name]) => url.includes(name));
    if (!entry) return route.continue();
    return route.fulfill({
      status: 200,
      contentType: "application/javascript; charset=utf-8",
      body: entry[1]
    });
  });
}

async function openPreview(viewport, label) {
  const context = await browser.newContext({ viewport: viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();

  page.on("console", msg => {
    if (msg.type() === "error") report.consoleErrors.push({ viewport: label, text: msg.text() });
  });
  page.on("pageerror", error => report.pageErrors.push({ viewport: label, text: error.message }));
  page.on("requestfailed", request => {
    if (request.url().includes("/assets/")) {
      report.failedAssetRequests.push({
        viewport: label,
        url: request.url(),
        error: request.failure()?.errorText
      });
    }
  });

  await routeFirebase(page);
  await page.goto(baseURL, { waitUntil: "domcontentloaded", timeout: 60000 });
  check((await page.title()).includes("Kantor AI 3D"), label + ": document title");
  check(await page.locator("#login").isVisible(), label + ": login screen visible");

  await page.locator("#code").fill("AI2026");
  await page.locator("#go").click();
  await page.locator("#map canvas").waitFor({ state: "visible", timeout: 60000 });
  await page.waitForTimeout(2500);

  check(await page.locator("#login").evaluate(el => el.classList.contains("hidden")), label + ": login transitions to office");
  check(await page.locator("#ui").isVisible(), label + ": office UI visible");
  check(await page.locator("#living-clock").count() === 1 || label === "mobile", label + ": Jakarta office clock mounted for desktop");
  const livingOffice = await page.evaluate(() => window.__livingOfficeQA ? ({
    monitors: window.__livingOfficeQA.monitorCount,
    period: window.__livingOfficeQA.currentPeriod,
    meetingReady: typeof window.__livingOfficeQA.runMeeting === "function"
  }) : null);
  check(!!livingOffice && livingOffice.monitors >= 10 && ["dawn","day","golden","night"].includes(livingOffice.period) && livingOffice.meetingReady, label + ": Living Office telemetry, monitors and time ambience initialize");
  const socialLife = await page.evaluate(() => window.__characterSocialQA);
  check(!!socialLife && socialLife.characterCount >= 10 && socialLife.bubbleCount >= 10, label + ": character social cues initialize");
  const polish = await page.evaluate(() => window.__premiumPolishQA);
  check(!!polish && polish.characterCount >= 10, label + ": premium character polish initializes");
  const integration = await page.evaluate(() => window.__integrationHealthQA);
  check(!!integration && integration.readOnly === true && integration.agentCount >= 10 && ["ready","partially-configured","not-configured"].includes(integration.status), label + ": read-only integration diagnostics initialize");
  const mockupOffice = await page.evaluate(() => window.__mockupOfficeQA);
  check(!!mockupOffice && mockupOffice.theme === "approved-isometric-open-office" &&
    mockupOffice.workstationCount >= 15 && mockupOffice.glassDivisionCount === 5 &&
    mockupOffice.meetingRoomReady && mockupOffice.receptionReady && mockupOffice.pantryReady &&
    mockupOffice.collaborationTableCount === 4,
    label + ": approved isometric office, 5 glass divisions, workstations and shared rooms initialize");




  const canvasBox = await page.locator("#map canvas").boundingBox();
  check(!!canvasBox && canvasBox.width >= viewport.width * 0.7 && canvasBox.height > viewport.height * 0.45, label + ": 3D canvas has usable dimensions");
  const cameraDock = page.locator("#camera-dock");
  check(await cameraDock.isVisible(), label + ": premium camera dock is visible");
  await cameraDock.locator('[data-preset="cinematic"]').click();
  check(await cameraDock.locator('[data-preset="cinematic"]').getAttribute("aria-pressed") === "true", label + ": cinematic camera preset activates");
  await cameraDock.locator('[data-preset="social"]').click();
  check(await cameraDock.locator('[data-preset="social"]').getAttribute("aria-pressed") === "true", label + ": Social Hub camera preset activates");
  await cameraDock.locator('[data-preset="overview"]').click();
  check(await cameraDock.locator('[data-preset="overview"]').getAttribute("aria-pressed") === "true", label + ": overview camera preset restores");
  report.viewports[label] = {
    viewport: viewport,
    canvas: canvasBox,
    documentWidth: await page.evaluate(() => document.documentElement.scrollWidth),
    windowWidth: viewport.width
  };

  if (label === "desktop") {
    await page.screenshot({ path: path.join(outDir, "kantor-ai-desktop-office.png"), fullPage: true });
    const firstAgent = page.locator('#legend [data-id="1"]');
    await firstAgent.scrollIntoViewIfNeeded();
    await firstAgent.click({ position: { x: 18, y: 15 }, timeout: 15000 });
    check(await page.locator("#chat").evaluate(el => el.classList.contains("open")), "desktop: clicking an agent opens chat panel");
    await page.screenshot({ path: path.join(outDir, "kantor-ai-desktop-agent.png"), fullPage: true });
    await page.locator("#cx").click();
    await page.locator("#cmdb").click();
    check(!await page.locator("#cmdm").evaluate(el => el.classList.contains("hidden")), "desktop: Command Center opens");
    await page.locator("#cmdx").click();
    check(await page.locator("#cmdm").evaluate(el => el.classList.contains("hidden")), "desktop: Command Center closes");
    await page.locator("#dashb").click();
    check(!await page.locator("#dash").evaluate(el => el.classList.contains("hidden")), "desktop: dashboard modal opens");
    await page.screenshot({ path: path.join(outDir, "kantor-ai-desktop-dashboard.png"), fullPage: true });
    await page.locator("#dx").click();
  } else {
    check(report.viewports[label].documentWidth <= viewport.width + 4, "mobile: document does not overflow viewport width");
    await page.locator("#reset").click();
    await page.locator("#iso").click();
    check(true, "mobile: camera reset and isometric controls are clickable");
    await page.locator("#reset").click();
    check(await page.locator('[data-preset="overview"]').getAttribute("aria-pressed") === "true", "mobile: overview restored for final screenshot");
    await page.screenshot({ path: path.join(outDir, "kantor-ai-mobile.png"), fullPage: true });
  }

  await context.close();
}

try {
  await openPreview({ width: 1440, height: 900 }, "desktop");
  await openPreview({ width: 390, height: 844 }, "mobile");

  check(report.pageErrors.length === 0, "no uncaught browser JavaScript errors");
  check(report.consoleErrors.length === 0, "no browser console errors");
  check(report.failedAssetRequests.length === 0, "all referenced GLB assets load over HTTP");

  report.finishedAt = new Date().toISOString();
  report.status = "passed";
  fs.writeFileSync(path.join(outDir, "browser-preview-report.json"), JSON.stringify(report, null, 2));
  console.log("Kantor AI browser preview passed.");
} catch (error) {
  report.finishedAt = new Date().toISOString();
  report.status = "failed";
  report.failure = error.stack || String(error);
  fs.writeFileSync(path.join(outDir, "browser-preview-report.json"), JSON.stringify(report, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
