// 저장소 추상화: Firebase가 설정되어 있으면 Firebase, 아니면 localStorage(로컬 테스트용)
const Backend = (() => {
  const cfg = window.FIREBASE_CONFIG || {};
  const useFirebase =
    typeof firebase !== "undefined" && cfg.databaseURL && !cfg.databaseURL.includes("YOUR_");

  if (useFirebase) {
    firebase.initializeApp(cfg);
    const db = firebase.database();
    return {
      mode: "firebase",
      submit: data => db.ref("responses").push({ ...data, ts: firebase.database.ServerValue.TIMESTAMP }),
      onResponses: cb => db.ref("responses").on("value", s => cb(Object.values(s.val() || {}))),
      onRevealed: cb => db.ref("state/revealed").on("value", s => cb(!!s.val())),
      onEpoch: cb => db.ref("state/epoch").on("value", s => cb(s.val() || 0)),
      setRevealed: v => db.ref("state/revealed").set(!!v),
      // 초기화하면 epoch가 바뀌어서, 이전에 제출했던 폰들도 다시 입력할 수 있게 됨
      reset: () => Promise.all([
        db.ref("responses").remove(),
        db.ref("state/revealed").set(false),
        db.ref("state/epoch").set(firebase.database.ServerValue.TIMESTAMP),
      ]),
    };
  }

  // ---- 로컬 테스트 모드 ----
  const RK = "wb_responses", SK = "wb_revealed", EK = "wb_epoch";
  const read = () => JSON.parse(localStorage.getItem(RK) || "[]");
  const respCbs = [], revCbs = [], epochCbs = [];
  const fireResp = () => respCbs.forEach(cb => cb(read()));
  const fireRev = () => revCbs.forEach(cb => cb(localStorage.getItem(SK) === "1"));
  const getEpoch = () => Number(localStorage.getItem(EK) || 0);
  const fireEpoch = () => epochCbs.forEach(cb => cb(getEpoch()));
  window.addEventListener("storage", e => {
    if (e.key === RK) fireResp();
    if (e.key === SK) fireRev();
    if (e.key === EK) fireEpoch();
  });
  return {
    mode: "local",
    submit: data => {
      const list = read(); list.push({ ...data, ts: Date.now() });
      localStorage.setItem(RK, JSON.stringify(list)); fireResp(); return Promise.resolve();
    },
    onResponses: cb => { respCbs.push(cb); cb(read()); },
    onRevealed: cb => { revCbs.push(cb); cb(localStorage.getItem(SK) === "1"); },
    onEpoch: cb => { epochCbs.push(cb); cb(getEpoch()); },
    setRevealed: v => { localStorage.setItem(SK, v ? "1" : "0"); fireRev(); return Promise.resolve(); },
    reset: () => {
      localStorage.removeItem(RK); localStorage.setItem(SK, "0"); localStorage.setItem(EK, String(Date.now()));
      fireResp(); fireRev(); fireEpoch(); return Promise.resolve();
    },
  };
})();
