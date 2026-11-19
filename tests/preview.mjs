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
  page.on("pageerror", error => report.pageErrors.push({ viewport: label, text: error.message, stack: error.stack || "" }));
  page.on("requestfailed", request => {
    const failure = { viewport: label, url: request.url(), error: request.failure()?.errorText };
    if (request.url().includes("/assets/")) report.failedAssetRequests.push(failure);
    if (/\\.js(?:[?#]|$)/i.test(request.url())) (report.failedModuleRequests ||= []).push(failure);
  });
  page.on("response", response => {
    const url = response.url();
    if (/\\.js(?:[?#]|$)/i.test(url) && response.status() >= 400) {
      (report.failedModuleResponses ||= []).push({ viewport: label, url, status: response.status() });
    }
  });

  await routeFirebase(page);
  const previewURL = new URL(baseURL);
  previewURL.searchParams.set("qa", "1");
  await page.goto(previewURL.toString(), { waitUntil: "domcontentloaded", timeout: 60000 });
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
  check(!!socialLife && socialLife.characterCount >= 10 && socialLife.bubbleCount >= 10 &&
    socialLife.conversationEnabled === true && socialLife.conversationLineCount >= 20,
    label + ": character social cues and conversational dialogue initialize");
  const conversationLogic = await page.evaluate(() => {
    const api = window.__characterSocialQA;
    if (!api?.canPairSlots || !api?.chooseIdleStation) return { error: "conversation test hooks unavailable" };
    const station = { slots: [] };
    const seated = { st: station, x: 0, z: -2.1, face: 0, act: "chat", occ: null };
    const opposite = { st: station, x: 0, z: 2.1, face: Math.PI, act: "chat", occ: null };
    const sameDirection = { st: station, x: 0, z: 2.1, face: 0, act: "chat", occ: null };
    station.slots = [seated, opposite, sameDirection];
    const peer = { slot: seated, loc: seated, act: "chat", path: [], wait: 4, busy: false, meeting: false, r: { id: 2 } };
    seated.occ = peer;
    const pairedSeatChosen = api.chooseIdleStation({ r: { id: 1 } }, [sameDirection, opposite]) === opposite;
    return {
      faceToFace: api.canPairSlots(seated, opposite),
      sameDirectionRejected: !api.canPairSlots(seated, sameDirection),
      pairedSeatChosen,
      peerWaitReserved: peer.wait >= 60
    };
  });
  check(!conversationLogic.error && conversationLogic.faceToFace &&
    conversationLogic.sameDirectionRejected && conversationLogic.pairedSeatChosen &&
    conversationLogic.peerWaitReserved,
    label + ": Social Hub selects a face-to-face seat and reserves the first guest while the partner arrives; diagnostics=" + JSON.stringify(conversationLogic));
  const liveConversation = await page.evaluate(async () => {
    const { createCharacterSocialLife } = await import("./premium-social-life.js");
    const THREE = await import("three");
    const makeCharacter = id => ({
      r: { id, name: "QA Agent " + id },
      g: new THREE.Group(),
      act: "chat", path: [], busy: false, meeting: false,
      slot: null, loc: null, work: false
    });
    const a = makeCharacter(101);
    const b = makeCharacter(102);
    const station = { slots: [] };
    const seatA = { st: station, x: 0, z: -2.1, face: 0, act: "chat", occ: a };
    const seatB = { st: station, x: 0, z: 2.1, face: Math.PI, act: "chat", occ: b };
    station.slots = [seatA, seatB];
    a.slot = seatA; a.loc = seatA;
    b.slot = seatB; b.loc = seatB;
    const life = createCharacterSocialLife({ THREE, characters: { 101: a, 102: b } });
    life.update(0.016, 0);
    const first = {
      active: life.getActiveConversationCount(),
      aSpeaks: a.lifeBubble.userData.currentKind === "text" && !!a.lifeBubble.userData.currentContent,
      bListens: a.lifeBubble.userData.currentKind === "text" && b.lifeBubble.userData.currentContent === "•••"
    };
    await new Promise(resolve => setTimeout(resolve, 2750));
    life.update(0.016, 2.75);
    const second = {
      active: life.getActiveConversationCount(),
      bSpeaks: b.lifeBubble.userData.currentKind === "text" && !!b.lifeBubble.userData.currentContent,
      aListens: a.lifeBubble.userData.currentKind === "icon" && a.lifeBubble.userData.currentContent === "•••"
    };
    return { first, second };
  });
  check(liveConversation.first.active === 1 && liveConversation.first.aSpeaks &&
    liveConversation.first.bListens && liveConversation.second.active === 1 &&
    liveConversation.second.bSpeaks && liveConversation.second.aListens,
    label + ": two seated agents exchange visible dialogue turns and switch speaker/listener; diagnostics=" + JSON.stringify(liveConversation));
  const polish = await page.evaluate(() => window.__premiumPolishQA);
  check(!!polish && polish.characterCount >= 10, label + ": premium character polish initializes");
  const integration = await page.evaluate(() => window.__integrationHealthQA);
  check(!!integration && integration.readOnly === true && integration.agentCount >= 10 && ["ready","partially-configured","not-configured"].includes(integration.status), label + ": read-only integration diagnostics initialize");
  const mockupState = await page.evaluate(() => ({
    layout: window.__mockupOfficeQA || null,
    boot: window.__mockupOfficeBootQA || null,
    error: window.__mockupOfficeErrorQA || null
  }));
  const mockupOffice = mockupState.layout;
  report.mockupOffice = report.mockupOffice || {};
  report.mockupOffice[label] = mockupState;
  await page.screenshot({ path: path.join(outDir, "kantor-ai-" + label + "-mockup-diagnostic.png"), fullPage: true });
  const mockupReady = !!mockupOffice && mockupOffice.theme === "approved-isometric-open-office" &&
    mockupOffice.workstationCount >= 15 && mockupOffice.glassDivisionCount === 5 &&
    mockupOffice.meetingRoomReady && mockupOffice.receptionReady && mockupOffice.pantryReady &&
    mockupOffice.collaborationTableCount === 4 && mockupOffice.socialCommunityTableReady;
  check(mockupReady,
    label + ": approved isometric office layout initializes; diagnostics=" + JSON.stringify(mockupState));

  await page.waitForFunction(() => window.__isometricAssetsQA?.socialGlbCount === 5, null, { timeout: 15000 });
  const socialAssets = await page.evaluate(() => window.__isometricAssetsQA);
  const socialAssetsReady = socialAssets &&
    socialAssets.socialGlbCount === 5 &&
    socialAssets.arcadeStations >= 8 &&
    socialAssets.arcadeFrontFacing === 8 &&
    socialAssets.sofaInstances >= 4 &&
    socialAssets.pingPongInstances === 2 &&
    socialAssets.chessInstances === 2 &&
    socialAssets.cafeInstances === 2 &&
    socialAssets.arcadeInstances >= 8;
  check(socialAssetsReady,
    label + ": social GLB furniture is mounted in the office; diagnostics=" + JSON.stringify(socialAssets));

  await page.waitForFunction(() => window.__pingPongAssetQA?.tables === 2, null, { timeout: 15000 });
  const pingPongAssetQA = await page.evaluate(() => window.__pingPongAssetQA);
  check(pingPongAssetQA.centerLineHidden === 2 && pingPongAssetQA.embeddedBallHidden === 2,
    label + ": ping-pong center lines and embedded model balls are hidden; diagnostics=" + JSON.stringify(pingPongAssetQA));

  const pingPongBehavior = await page.evaluate(() => {
    const api = window.__pingPongLogicQA;
    if (!api) return { error: "ping-pong logic hook unavailable" };
    const station = { x: 10, z: 20, yaw: 0, slots: [] };
    const slotA = { st: station, x: 8, z: 20, occ: null };
    const slotB = { st: station, x: 12, z: 20, occ: null };
    station.slots = [slotA, slotB];
    const makePlayer = slot => ({
      act: "swing", busy: false, meeting: false, path: [],
      slot, loc: slot,
      g: { position: { x: slot.x, y: 0, z: slot.z } }
    });
    const noneReady = api.playersAreReady(station);
    const playerA = makePlayer(slotA);
    slotA.occ = playerA;
    const oneReady = api.playersAreReady(station);
    const playerB = makePlayer(slotB);
    slotB.occ = playerB;
    const bothReady = api.playersAreReady(station);
    playerB.g.position.x += 2;
    const separatedReady = api.playersAreReady(station);
    playerB.g.position.x = slotB.x;

    const ball = {
      visible: true,
      position: { x: -1, y: 0, z: -1, set(x, y, z) { this.x = x; this.y = y; this.z = z; } },
      rotation: { x: 0, z: 0 }
    };
    const item = { station, ball, time: 7, wasPlaying: true, isResting: false };
    slotA.occ = null; slotB.occ = null;
    api.updateBall(item, 0.05);
    const restA = [ball.position.x, ball.position.y, ball.position.z];
    api.updateBall(item, 0.05);
    const restB = [ball.position.x, ball.position.y, ball.position.z];
    slotA.occ = playerA; slotB.occ = playerB;
    const rallyStarted = api.updateBall(item, 0.05);
    const rallyMoves = ball.position.y > 0.945;
    playerA.path = [{ x: 0, z: 0 }];
    const rallyStopsWhenPlayerLeaves = api.updateBall(item, 0.05) === false;
    return {
      noneReady, oneReady, bothReady, separatedReady,
      idleStatic: restA.every((v, i) => Math.abs(v - restB[i]) < 0.0001),
      rallyStarted, rallyMoves, rallyStopsWhenPlayerLeaves
    };
  });
  check(!pingPongBehavior.error && !pingPongBehavior.noneReady && !pingPongBehavior.oneReady &&
    pingPongBehavior.bothReady && !pingPongBehavior.separatedReady && pingPongBehavior.idleStatic &&
    pingPongBehavior.rallyStarted && pingPongBehavior.rallyMoves && pingPongBehavior.rallyStopsWhenPlayerLeaves,
    label + ": ping-pong ball stays still without two players and stops when a player leaves; diagnostics=" + JSON.stringify(pingPongBehavior));

  const canvasBox = await page.locator("#map canvas").boundingBox();
  check(!!canvasBox && canvasBox.width >= viewport.width * 0.7 && canvasBox.height > viewport.height * 0.45, label + ": 3D canvas has usable dimensions");
  const cameraDock = page.locator("#camera-dock");
  check(await cameraDock.isVisible(), label + ": premium camera dock is visible");
  await cameraDock.locator('[data-preset="cinematic"]').click();
  check(await cameraDock.locator('[data-preset="cinematic"]').getAttribute("aria-pressed") === "true", label + ": cinematic camera preset activates");
  await cameraDock.locator('[data-preset="social"]').click();
  check(await cameraDock.locator('[data-preset="social"]').getAttribute("aria-pressed") === "true", label + ": Social Hub camera preset activates");
  /* Let the render loop finish its eased camera transition before visual capture. */
  await page.waitForTimeout(1500);
  const stagedPair = await page.evaluate(() => window.__characterSocialQA?.stageDemoConversation?.() || { staged: false });
  check(stagedPair.staged === true && stagedPair.station === "lounge" && stagedPair.agentIds?.length === 2,
    label + ": real GLB agents are staged in opposite Social Hub lounge seats; diagnostics=" + JSON.stringify(stagedPair));
  await page.waitForFunction(() => {
    const state = window.__characterSocialQA?.demoConversationState?.();
    return state?.activeCount === 1 && state.a?.visible && state.a.kind === "text" &&
      !!state.a.content && state.b?.visible && state.b.content === "•••";
  }, null, { timeout: 10000 });
  const realFirstTurn = await page.evaluate(() => window.__characterSocialQA.demoConversationState());
  check(realFirstTurn.a.kind === "text" && realFirstTurn.b.content === "•••",
    label + ": real 3D avatar renders the first dialogue bubble and listening cue; diagnostics=" + JSON.stringify(realFirstTurn));
  await page.screenshot({ path: path.join(outDir, "kantor-ai-" + label + "-social-hub.png"), fullPage: true });
  await page.waitForFunction(() => {
    const state = window.__characterSocialQA?.demoConversationState?.();
    return state?.activeCount === 1 && state.a?.content === "•••" &&
      state.b?.kind === "text" && !!state.b.content;
  }, null, { timeout: 5000 });
  const realSecondTurn = await page.evaluate(() => window.__characterSocialQA.demoConversationState());
  check(realSecondTurn.a.content === "•••" && realSecondTurn.b.kind === "text",
    label + ": real 3D avatar conversation alternates to the second speaker; diagnostics=" + JSON.stringify(realSecondTurn));
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
