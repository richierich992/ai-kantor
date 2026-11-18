# Kantor AI Premium Makeover — Release Checklist

## Scope
- [x] Phase 9: character activity cues and passing greetings
- [x] Phase 10: optional face morphs, head micro-animation, selection focus
- [x] Phase 11: read-only integration health diagnostics
- [x] Phase 12: static and desktop/mobile release validation

## Required before merge
- [x] GitHub Actions static QA passes on current PR head (run 44243245782)
- [x] GitHub Actions browser preview passes on desktop and mobile (37/37 checks, run 44243245757)
- [ ] Review latest screenshots after mobile camera framing adjustment
- [ ] Confirm production Firebase login, AI proxy, Apps Script workflows and Telegram notifications with authorized production credentials
- [ ] Confirm no API keys, service account secrets or tokens are committed
- [ ] Product owner approves the preview and authorizes merge

## Preserved application contracts
- Firebase Realtime Database paths and auth flow
- Agent IDs, department mapping and existing room/task UI
- Existing AI proxy request payload and localStorage configuration key
- Existing Apps Script and backend scheduler ownership
- Telegram notification ownership in the backend
- Existing agent movement, Social Hub slots and task queue

## Release decision
The PR is functionally mergeable after the latest screenshot review and owner approval. Browser mocks do not substitute for production end-to-end validation. Do not merge without explicit owner approval.
