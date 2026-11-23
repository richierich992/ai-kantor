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
    const makeProfileAgent = id => ({ r: { id } });
    const financeProfile = life.getConversationProfile(makeProfileAgent(1), makeProfileAgent(2), "lounge");
    const contentProfile = life.getConversationProfile(makeProfileAgent(9), makeProfileAgent(10), "lounge");
    const technologyProfile = life.getConversationProfile(makeProfileAgent(11), makeProfileAgent(15), "lounge");
    const researchProfile = life.getConversationProfile(makeProfileAgent(13), makeProfileAgent(13), "lounge");
    const crossProfile = life.getConversationProfile(makeProfileAgent(1), makeProfileAgent(9), "lounge");
    const chessProfile = life.getConversationProfile(makeProfileAgent(1), makeProfileAgent(2), "chess");
    life.update(0.016, 0);
    const first = {
      active: life.getActiveConversationCount(),
      aSpeaks: a.lifeBubble.userData.currentKind === "text" && !!a.lifeBubble.userData.currentContent,
      bListens: a.lifeBubble.userData.currentKind === "text" && b.lifeBubble.userData.currentContent === "•••"
    };
    await new Promise(resolve => setTimeout(resolve, 4600));
    life.update(0.016, 4.6);
    const second = {
      active: life.getActiveConversationCount(),
      bSpeaks: b.lifeBubble.userData.currentKind === "text" && !!b.lifeBubble.userData.currentContent,
      aListens: a.lifeBubble.userData.currentKind === "icon" && a.lifeBubble.userData.currentContent === "•••"
    };
    return {
      first, second,
      profiles: {
        finance: financeProfile.groupA === "finance" && financeProfile.scriptCount >= 3,
        content: contentProfile.groupA === "content" && contentProfile.scriptCount >= 3,
        technology: technologyProfile.groupA === "technology" && technologyProfile.scriptCount >= 3,
        research: researchProfile.groupA === "research" && researchProfile.scriptCount >= 3,
        crossDivision: crossProfile.groupA !== crossProfile.groupB && crossProfile.scriptCount >= 3,
        chess: chessProfile.stationKind === "chess" && chessProfile.scriptCount >= 3
      }
    };
  });
  check(liveConversation.first.active === 1 && liveConversation.first.aSpeaks &&
    liveConversation.first.bListens && liveConversation.second.active === 1 &&
    liveConversation.second.bSpeaks && liveConversation.second.aListens &&
    Object.values(liveConversation.profiles).every(Boolean),
    label + ": seated agents exchange dialogue and receive role/station-specific script pools; diagnostics=" + JSON.stringify(liveConversation));
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
  await page.waitForFunction(() => window.__agentNavigationQA?.ready === true &&
    window.__agentNavigationQA.colliderCount > 20, null, { timeout: 15000 });
  const worldNavigation = await page.evaluate(() => window.__agentNavigationQA);
  report.navigation = report.navigation || {};
  report.navigation[label] = worldNavigation;
  check(worldNavigation.colliderCount > 20 && worldNavigation.blockedCellCount > 100,
    label + ": real office geometry is registered as navigation obstacles; diagnostics=" + JSON.stringify(worldNavigation));

  const obstacleRoute = await page.evaluate(async () => {
    const { createAgentNavigation } = await import("./premium-navigation.js");
    const THREE = await import("three");
    const testScene = new THREE.Scene();
    const obstacle = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 1),
      new THREE.MeshBasicMaterial({ color: 0x777777 })
    );
    obstacle.position.set(0, 1, 0);
    testScene.add(obstacle);
    const navigation = createAgentNavigation({
      THREE, scene: testScene,
      bounds: { minX: -4, maxX: 4, minZ: -4, maxZ: 4 },
      cellSize: 0.25, clearance: 0.35
    });
    const diagnostics = navigation.rebuild();
    const start = new THREE.Vector3(-2, 0, 0);
    const goal = new THREE.Vector3(2, 0, 0);
    const route = navigation.routePath(start, [goal]);
    const points = [start, ...route];
    const segmentsClear = points.slice(0, -1).every((point, index) =>
      navigation.lineClear(point, points[index + 1]));
    return {
      diagnostics,
      route: route.map(point => [point.x, point.y, point.z]),
      detoursAroundObstacle: route.some(point => Math.abs(point.z) > 0.7),
      segmentsClear,
      reachesDestination: route.length > 0 && Math.hypot(route.at(-1).x - goal.x, route.at(-1).z - goal.z) < 0.4,
      failed: navigation.diagnostics().lastRoute?.failed === true
    };
  });
  check(obstacleRoute.diagnostics.colliderCount === 1 &&
    obstacleRoute.detoursAroundObstacle && obstacleRoute.segmentsClear &&
    obstacleRoute.reachesDestination && !obstacleRoute.failed,
    label + ": avatar path detours around a blocking object without crossing its clearance zone; diagnostics=" +
      JSON.stringify(obstacleRoute));

  const realOfficeRoutes = await page.evaluate(() => {
    const api = window.__agentNavigationTest;
    if (!api) return { error: "real-office navigation QA hook unavailable" };
    const stations = api.stations();
    const cases = [
      { agentId: 1, stationKind: "lounge" },
      { agentId: 9, stationKind: "board" },
      { agentId: 11, stationKind: "pingpong" },
      { agentId: 13, stationKind: "chess" },
      { agentId: 16, stationKind: "cafe", stationIndex: 1 }
    ];
    const routes = cases.map(item => {
      const home = api.agentHome(item.agentId);
      const matches = stations.filter(station => station.kind === item.stationKind);
      const station = matches[item.stationIndex || 0];
      if (!home || !station?.slots?.length) return { ...item, failed: true, reason: "missing home or station" };
      const seat = station.slots[0];
      const approachPlan = api.plan(home, [seat.approach]);
      const reachedApproach = approachPlan.route.at(-1) || seat.approach;
      const seatPlan = api.plan(reachedApproach, [seat.seat], { allowBlockedGoal: true });
      const finalSegment = seatPlan.segments.at(-1);
      const contactDistance = finalSegment
        ? Math.hypot(finalSegment.to[0] - finalSegment.from[0], finalSegment.to[2] - finalSegment.from[2])
        : 0;
      const safeTravelSegments = approachPlan.segments.every(segment => segment.clear) &&
        seatPlan.segments.slice(0, -1).every(segment => segment.clear);
      return {
        ...item,
        home, approach: seat.approach, seat: seat.seat,
        failed: approachPlan.failed || seatPlan.failed,
        safeTravelSegments,
        finalSeatContactClear: !finalSegment || finalSegment.clear,
        finalContactDistance: contactDistance,
        approachPointCount: approachPlan.route.length,
        seatPointCount: seatPlan.route.length
      };
    });
    const researchHome = api.agentHome(13);
    const probes = [[37, 0, -17], [37, 0, -12], [25, 0, -10], [0, 0, -10]];
    const researchExitProbes = probes.map(target => {
      const plan = api.plan(researchHome, [target]);
      return { target, failed: plan.failed, routePointCount: plan.route.length, route: plan.route };
    });
    return { routes, researchExitProbes };
  });
  const routeItems = realOfficeRoutes.routes || [];
  const realOfficeRoutesReady = !realOfficeRoutes.error &&
    routeItems.length >= 5 &&
    routeItems.every(item => !item.failed && item.safeTravelSegments &&
      item.approachPointCount > 0 && item.seatPointCount > 0 &&
      (item.finalSeatContactClear || item.finalContactDistance <= 1.6));
  report.navigationRoutes = report.navigationRoutes || {};
  report.navigationRoutes[label] = realOfficeRoutes;
  check(realOfficeRoutesReady,
    label + ": real routes from five workstations to nearby Social Hub stations avoid obstacles, with only a short final seating contact allowed; diagnostics=" +
      JSON.stringify(realOfficeRoutes));

  const walkingGait = await page.evaluate(() => window.__agentNavigationTest?.walkGait?.(1) || { available: false });
  const walkingGaitReady = walkingGait.available && walkingGait.distance > 0.5 &&
    walkingGait.leftHipRange > 0.9 && walkingGait.rightHipRange > 0.9 &&
    walkingGait.kneeRig && walkingGait.leftKneeRange > 0.35 && walkingGait.rightKneeRange > 0.35;
  report.walkingGait = report.walkingGait || {};
  report.walkingGait[label] = walkingGait;
  check(walkingGaitReady,
    label + ": real avatar walking gait swings both hips and bends both knees; diagnostics=" + JSON.stringify(walkingGait));

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

  const activityPairing = await page.evaluate(async () => {
    const { chooseIdleStation } = await import("./premium-living-office.js");
    const trial = (kind, act) => {
      const station = { kind, slots: [] };
      const peer = {
        act, busy: false, meeting: false, path: [], wait: 4,
        r: { id: 1, lock: false },
        g: { position: { x: -2, z: 0 } }
      };
      const occupied = { st: station, x: -2, z: 0, face: Math.PI / 2, act, occ: peer };
      const free = { st: station, x: 2, z: 0, face: -Math.PI / 2, act, occ: null };
      station.slots = [occupied, free];
      peer.slot = occupied; peer.loc = occupied;
      const selected = chooseIdleStation({ r: { id: 2 } }, [free]);
      return { paired: selected === free, peerReserved: peer.wait >= 90 };
    };
    return {
      pingpong: trial("pingpong", "swing"),
      chess: trial("chess", "chat")
    };
  });
  check(activityPairing.pingpong.paired && activityPairing.pingpong.peerReserved &&
    activityPairing.chess.paired && activityPairing.chess.peerReserved,
    label + ": idle routing sends a second agent to the free side of an active ping-pong/chess table; diagnostics=" +
      JSON.stringify(activityPairing));

  const canvasBox = await page.locator("#map canvas").boundingBox();
  check(!!canvasBox && canvasBox.width >= viewport.width * 0.7 && canvasBox.height > viewport.height * 0.45, label + ": 3D canvas has usable dimensions");
  const cameraDock = page.locator("#camera-dock");
  check(await cameraDock.isVisible(), label + ": premium camera dock is visible");
  await cameraDock.locator('[data-preset="cinematic"]').click();
  check(await cameraDock.locator('[data-preset="cinematic"]').getAttribute("aria-pressed") === "true", label + ": cinematic camera preset activates");
  await cameraDock.locator('[data-preset="social"]').click();
  check(await cameraDock.locator('[data-preset="social"]').getAttribute("aria-pressed") === "true", label + ": Social Hub camera preset activates");
  /* Wait for the actual camera and OrbitControls target to reach the preset,
     not merely for the preset button to become active. */
  await page.waitForFunction(() => {
    const q = window.__socialCameraQA;
    const near = (actual, desired) => Array.isArray(actual) && Array.isArray(desired) &&
      actual.length === 3 && actual.every((value, index) =>
        Number.isFinite(value) && Math.abs(value - desired[index]) < 0.45);
    return q?.preset === "social" &&
      near(q.actualTarget, q.target) && near(q.actualCamera, q.camera);
  }, null, { timeout: 8000 });
  const socialCamera = await page.evaluate(() => ({
    active: document.querySelector('[data-preset="social"]')?.getAttribute("aria-pressed") === "true",
    preset: window.__socialCameraQA?.preset || "",
    target: window.__socialCameraQA?.target || null,
    camera: window.__socialCameraQA?.camera || null,
    actualTarget: window.__socialCameraQA?.actualTarget || null,
    actualCamera: window.__socialCameraQA?.actualCamera || null,
    fov: window.__socialCameraQA?.fov ?? null
  }));
  const cameraReached = (actual, desired) => Array.isArray(actual) && Array.isArray(desired) &&
    actual.length === 3 && actual.every((value, index) => Math.abs(value - desired[index]) < 0.45);
  check(socialCamera.active && socialCamera.preset === "social" &&
    Array.isArray(socialCamera.target) && socialCamera.target[0] === -36.5 &&
    socialCamera.fov === (viewport.width / viewport.height < 0.85 ? 48 : 38) &&
    cameraReached(socialCamera.actualTarget, socialCamera.target) &&
    cameraReached(socialCamera.actualCamera, socialCamera.camera),
    label + ": Social Hub camera reaches the requested position and target; diagnostics=" + JSON.stringify(socialCamera));
  const stagedPair = await page.evaluate(() => window.__characterSocialQA?.stageDemoConversation?.() || { staged: false });
  check(stagedPair.staged === true && stagedPair.station === "lounge" && stagedPair.agentIds?.length === 2,
    label + ": real GLB agents are staged in opposite Social Hub lounge seats; diagnostics=" + JSON.stringify(stagedPair));
  await page.waitForFunction(() => {
    const state = window.__characterSocialQA?.demoConversationState?.();
    const aSpeaks = state?.a?.visible && state.a.kind === "text" && !!state.a.content;
    const bSpeaks = state?.b?.visible && state.b.kind === "text" && !!state.b.content;
    const aListens = state?.a?.visible && state.a.content === "•••";
    const bListens = state?.b?.visible && state.b.content === "•••";
    return state?.activeCount === 1 && ((aSpeaks && bListens) || (bSpeaks && aListens));
  }, null, { timeout: 10000 });
  /* Let the seated transition finish before measuring the final pose. */
  await page.waitForFunction(() => {
    const state = window.__characterSocialQA?.demoConversationState?.();
    return [state?.a, state?.b].every(person =>
      Number.isFinite(person?.legL) && Number.isFinite(person?.legR) &&
      person.legL < -0.72 && person.legR < -0.72);
  }, null, { timeout: 3500 });
  const realFirstTurn = await page.evaluate(() => window.__characterSocialQA.demoConversationState());
  const firstSpeaker = realFirstTurn.a.kind === "text" ? "a" : "b";
  check((realFirstTurn.a.kind === "text" && realFirstTurn.b.content === "•••") ||
    (realFirstTurn.b.kind === "text" && realFirstTurn.a.content === "•••"),
    label + ": one real 3D avatar speaks first while the other listens; diagnostics=" + JSON.stringify(realFirstTurn));
  const loungeSeating = [realFirstTurn.a, realFirstTurn.b];
  const loungeSeatAlignment = loungeSeating.every(person =>
    person.sitting && person.position && person.slot && person.seatRootY != null &&
    Math.abs(person.position[0] - person.slot[0]) < 0.08 &&
    Math.abs(person.position[2] - person.slot[1]) < 0.08 &&
    Math.abs(person.position[1] - person.seatRootY) < 0.06 &&
    person.position[1] > 0.45);
  const loungeFrontApproach = loungeSeating.every(person => {
    if (!person.approach || !person.slot || person.face == null) return false;
    const forward = (person.approach[0] - person.slot[0]) * Math.sin(person.face) +
      (person.approach[1] - person.slot[1]) * Math.cos(person.face);
    return forward > 1.2;
  });
  const loungeSitPose = loungeSeating.every(person =>
    Number.isFinite(person.legL) && Number.isFinite(person.legR) &&
    person.legL < -0.72 && person.legR < -0.72);
  check(loungeSeatAlignment && loungeFrontApproach && loungeSitPose,
    label + ": lounge avatars sit at cushion height, bend their legs and approach from the open front of the sofa; diagnostics=" +
      JSON.stringify(loungeSeating));

  const visibleMinX = viewport.width > 500 ? -0.58 : -0.90;
  const bubblePoints = [realFirstTurn.a.screen, realFirstTurn.b.screen];
  const bothBubblesFramed = bubblePoints.every(point =>
    point && point.x > visibleMinX && point.x < 0.92 &&
    point.y > -0.84 && point.y < 0.80 && point.z > -1 && point.z < 1);
  const bubblesSeparated = bubblePoints.every(Boolean) &&
    Math.abs(bubblePoints[0].x - bubblePoints[1].x) > 0.22;
  check(bothBubblesFramed && bubblesSeparated,
    label + ": both real dialogue bubbles fit in the Social Hub camera frame without overlap or the desktop division panel; diagnostics=" +
    JSON.stringify({ camera: realFirstTurn.camera, bubbles: bubblePoints }));
  await page.screenshot({ path: path.join(outDir, "kantor-ai-" + label + "-social-hub.png"), fullPage: true });
  const secondTurnHandle = await page.waitForFunction((expectedSpeaker) => {
    const state = window.__characterSocialQA?.demoConversationState?.();
    const aSpeaks = state?.a?.visible && state.a.kind === "text" && !!state.a.content;
    const bSpeaks = state?.b?.visible && state.b.kind === "text" && !!state.b.content;
    const aListens = state?.a?.visible && state.a.content === "•••";
    const bListens = state?.b?.visible && state.b.content === "•••";
    const alternated = state?.activeCount === 1 &&
      (expectedSpeaker === "a" ? bSpeaks && aListens : aSpeaks && bListens);
    return alternated ? state : false;
  }, firstSpeaker, { timeout: 12000 });
  /* Keep the exact frame in which the other avatar took the turn. A later
     read can land after the next 4.5s line and falsely report no alternation. */
  const realSecondTurn = await secondTurnHandle.jsonValue();
  await secondTurnHandle.dispose();
  check((firstSpeaker === "a" && realSecondTurn.b.kind === "text" && realSecondTurn.a.content === "•••") ||
    (firstSpeaker === "b" && realSecondTurn.a.kind === "text" && realSecondTurn.b.content === "•••"),
    label + ": real 3D avatars alternate to the other speaker; diagnostics=" + JSON.stringify(realSecondTurn));

  const pingpongStage = await page.evaluate(() => window.__socialActivityQA?.stagePair("pingpong") || { staged: false });
  check(pingpongStage.staged === true, label + ": two real avatars can be seated at opposite ping-pong ends; diagnostics=" + JSON.stringify(pingpongStage));
  await page.waitForTimeout(450);
  const pingpongBefore = await page.evaluate(() => window.__socialActivityQA?.inspect("pingpong"));
  const pingpongArmSamples = [pingpongBefore];
  for (let sample = 0; sample < 7; sample++) {
    await page.waitForTimeout(110);
    pingpongArmSamples.push(await page.evaluate(() => window.__socialActivityQA?.inspect("pingpong")));
  }
  const pingpongAfter = pingpongArmSamples.at(-1);
  const pingpongBallMoved = pingpongBefore?.ball && pingpongAfter?.ball &&
    Math.hypot(pingpongAfter.ball[0] - pingpongBefore.ball[0],
      pingpongAfter.ball[1] - pingpongBefore.ball[1],
      pingpongAfter.ball[2] - pingpongBefore.ball[2]) > 0.025;
  const pingpongArmMoved = pingpongBefore?.seats?.every((seat, index) => {
    const range = pingpongArmSamples.map(sample => sample?.seats?.[index]?.occupant?.armRX).filter(Number.isFinite);
    return range.length >= 6 && Math.max(...range) - Math.min(...range) > 0.18;
  });
  const pingpongPlayersReady = pingpongAfter?.rallying &&
    pingpongAfter.seats.length === 2 &&
    pingpongAfter.seats.every(seat => seat.occupant?.act === "swing" && Math.abs(seat.occupant.y - 0.14) < 0.08);
  const pingpongOnTable = pingpongAfter?.ball && pingpongAfter.ballSurfaceY != null &&
    pingpongAfter.ball[1] >= pingpongAfter.ballSurfaceY + 0.06;
  check(pingpongPlayersReady && pingpongBallMoved && pingpongArmMoved && pingpongOnTable,
    label + ": two players trigger a visible ping-pong rally, paddle arm motion and a ball above the tabletop; diagnostics=" +
      JSON.stringify({ before: pingpongBefore, after: pingpongAfter }));

  const chessIdleBefore = await page.evaluate(() => window.__socialActivityQA?.inspect("chess"));
  await page.waitForTimeout(900);
  const chessIdleAfter = await page.evaluate(() => window.__socialActivityQA?.inspect("chess"));
  const idlePiecesStill = chessIdleBefore?.chessPieces?.ready === false &&
    chessIdleAfter?.chessPieces?.ready === false &&
    Math.abs(chessIdleBefore.chessPieces.whiteZ || 0) < 0.001 &&
    Math.abs(chessIdleBefore.chessPieces.blackZ || 0) < 0.001 &&
    Math.abs(chessIdleAfter.chessPieces.whiteZ || 0) < 0.001 &&
    Math.abs(chessIdleAfter.chessPieces.blackZ || 0) < 0.001;
  check(idlePiecesStill,
    label + ": chess pieces remain still without two seated players; diagnostics=" +
      JSON.stringify({ before: chessIdleBefore?.chessPieces, after: chessIdleAfter?.chessPieces }));
  const chessStage = await page.evaluate(() => window.__socialActivityQA?.stagePair("chess") || { staged: false });
  check(chessStage.staged === true, label + ": two real avatars can take the chess seats; diagnostics=" + JSON.stringify(chessStage));
  await page.waitForFunction(() => {
    const pieces = window.__socialActivityQA?.inspect("chess")?.chessPieces;
    return pieces?.ready === true &&
      (Math.abs(pieces.whiteZ || 0) > 0.06 || Math.abs(pieces.blackZ || 0) > 0.06);
  }, null, { timeout: 6000 });
  const chessAfter = await page.evaluate(() => window.__socialActivityQA?.inspect("chess"));
  const chessSeated = chessAfter?.chessSeatCount === 2 && chessAfter.seats.length === 2 &&
    chessAfter.seats.every(seat => seat.sit && seat.occupant?.act === "chat" &&
      Math.abs(seat.occupant.y - seat.rootY) < 0.06 && Math.abs(seat.rootY - 0.64) < 0.005 &&
      seat.occupant.y > 0.7);
  const chessSideApproach = chessAfter?.seats?.every(seat => {
    const dx = seat.approach[0] - seat.x, dz = seat.approach[1] - seat.z;
    const forward = dx * Math.sin(seat.face) + dz * Math.cos(seat.face);
    const lateral = dx * Math.cos(seat.face) - dz * Math.sin(seat.face);
    return Math.abs(forward) < 0.25 && Math.abs(lateral) > 1.2;
  });
  const chessPiecesMoving = chessAfter?.chessPieces?.ready === true &&
    (Math.abs(chessAfter.chessPieces.whiteZ || 0) > 0.06 ||
      Math.abs(chessAfter.chessPieces.blackZ || 0) > 0.06);
  check(chessSeated && chessSideApproach && chessPiecesMoving,
    label + ": chess station has two real chairs at cushion height, seated players and moving board pieces; diagnostics=" +
      JSON.stringify(chessAfter));
  await page.screenshot({ path: path.join(outDir, "kantor-ai-" + label + "-social-games.png"), fullPage: true });

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
