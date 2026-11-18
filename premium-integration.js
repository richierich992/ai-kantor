/* Operational Integration Diagnostics — Phase 11
 * Read-only health snapshot for existing Firebase / AI proxy / Apps Script hooks.
 * Never probes external services, writes data, or exposes secrets.
 */
export function createIntegrationDiagnostics({
  firebaseReady = () => false,
  aiProxyConfigured = () => false,
  appsScriptConfigured = () => false,
  agentIds = []
} = {}) {
  const ids = [...new Set(agentIds.map(Number).filter(Number.isFinite))];

  function snapshot() {
    let firebase = "unknown", aiProxy = "unknown", appsScript = "unknown";
    try { firebase = firebaseReady() ? "configured" : "not-configured"; }
    catch { firebase = "check-error"; }
    try { aiProxy = aiProxyConfigured() ? "configured" : "not-configured"; }
    catch { aiProxy = "check-error"; }
    try { appsScript = appsScriptConfigured() ? "configured" : "not-configured"; }
    catch { appsScript = "check-error"; }

    const configured = [firebase, aiProxy, appsScript].filter(value => value === "configured").length;
    return {
      firebase,
      aiProxy,
      appsScript,
      agentCount: ids.length,
      status: configured === 3 ? "ready" : configured > 0 ? "partially-configured" : "not-configured",
      checkedAt: new Date().toISOString(),
      readOnly: true
    };
  }

  return { snapshot };
}
