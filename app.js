const PLACES = {
  eiffel: {
    name: "Tour Eiffel",
    short: "Tour Eiffel",
    location: "Champ-de-Mars · 7e arrondissement",
    coords: [2.294481, 48.85837],
    height: 330,
    year: "1889",
    architect: "Gustave Eiffel",
    description: "Achevée pour l'Exposition universelle de 1889, la tour de fer puddlé de Gustave Eiffel domine le Champ-de-Mars. Avec ses 330 m, elle reste le monument le plus haut de Paris.",
    wiki: "https://fr.wikipedia.org/wiki/Tour_Eiffel",
    view: { zoom: 16.05, pitch: 61, bearing: -22 }
  },
  arc: {
    name: "Arc de Triomphe",
    short: "Arc de Triomphe",
    location: "Place Charles-de-Gaulle · 8e arrondissement",
    coords: [2.295027, 48.873792],
    height: 50,
    year: "1836",
    architect: "Jean-François Chalgrin",
    description: "Voulu par Napoléon Ier en 1806 et achevé en 1836, l'arc célèbre la Grande Armée. Sa voûte culmine à 50 m au-dessus de la place de l'Étoile.",
    wiki: "https://fr.wikipedia.org/wiki/Arc_de_triomphe_de_l%27%C3%89toile",
    view: { zoom: 16.3, pitch: 57, bearing: 22 }
  },
  "notre-dame": {
    name: "Notre-Dame",
    short: "Notre-Dame",
    location: "Île de la Cité · 4e arrondissement",
    coords: [2.349902, 48.852968],
    height: 96,
    year: "1345",
    architect: "Chantier anonyme",
    description: "Rouverte en décembre 2024 après l'incendie de 2019, la cathédrale gothique retrouve sa flèche à 96 m. Sa silhouette reste un point de repère du cœur de Paris.",
    wiki: "https://fr.wikipedia.org/wiki/Cath%C3%A9drale_Notre-Dame_de_Paris",
    view: { zoom: 16.15, pitch: 58, bearing: -7 }
  },
  montparnasse: {
    name: "Tour Montparnasse",
    short: "Montparnasse",
    location: "Quartier Montparnasse · 15e arrondissement",
    coords: [2.321902, 48.842112],
    height: 210,
    year: "1973",
    architect: "Beaudouin, Cassan, de Marien, Saubot",
    description: "Achevé en 1973, ce gratte-ciel de 210 m reste le plus haut bâtiment de Paris intra-muros. Sa silhouette sombre a marqué durablement le paysage du sud parisien.",
    wiki: "https://fr.wikipedia.org/wiki/Tour_Montparnasse",
    view: { zoom: 16.0, pitch: 60, bearing: -32 }
  },
  "sacre-coeur": {
    name: "Sacré-Cœur",
    short: "Sacré-Cœur",
    location: "Butte Montmartre · 18e arrondissement",
    coords: [2.343116, 48.886725],
    height: 83,
    year: "1914",
    architect: "Paul Abadie",
    description: "Édifiée au sommet de la butte Montmartre et achevée en 1914, la basilique de Paul Abadie dresse sa coupole blanche à 83 m au-dessus de la ville.",
    wiki: "https://fr.wikipedia.org/wiki/Basilique_du_Sacr%C3%A9-C%C5%93ur_de_Montmartre",
    view: { zoom: 15.95, pitch: 56, bearing: 7 }
  }
};

const HOME_VIEW = { center: [2.322, 48.865], zoom: 13.5, pitch: 48, bearing: 0 };
const START_VIEW = { center: [2.323, 48.8672], zoom: 12.95, pitch: 24, bearing: -3 };
const MAX_REFERENCE = 330;
const EIFFEL_ORIGIN = [2.294481, 48.85837];
const EIFFEL_OSM_IDS = [
  14625977622,
  3080213892,
  3086877450,
  41148423,
  3086877440,
  3081452390,
  41148393,
  3086891640
];
const RULER_TICKS = [
  { at: 0, label: "0", title: "Sol" },
  { at: 50, label: "50", title: "Arc de Triomphe" },
  { at: 210, label: "210", title: "Tour Montparnasse" },
  { at: 330, label: "330", title: "Tour Eiffel" }
];

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const nfInt = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ui = {
  loader: qs("#loader"),
  loaderStatus: qs("#loader-status"),
  loaderPercent: qs("#loader-percent"),
  loaderBar: qs("#loader-bar"),
  loaderError: qs("#loader-error"),
  loaderRetry: qs("#loader-retry"),
  coord: qs("#coord-readout"),
  clock: qs("#clock-readout"),
  altitude: qs("#altitude-readout"),
  detailPanel: qs("#detail-panel"),
  detailContent: qs("#detail-content"),
  detailKind: qs("#detail-kind"),
  detailClose: qs("#detail-close"),
  heightKey: qs("#height-key"),
  coachmark: qs("#coachmark"),
  coachmarkClose: qs("#coachmark-close"),
  buildingTip: qs("#building-tip"),
  buildingTipHeight: qs("#building-tip-height"),
  zoomIn: qs("#zoom-in"),
  zoomOut: qs("#zoom-out"),
  compassReset: qs("#compass-reset"),
  compassDial: qs("#compass-dial"),
  viewToggle: qs("#view-toggle"),
  fullscreenToggle: qs("#fullscreen-toggle"),
  fullscreenIcon: qs("#fullscreen-icon"),
  placeNav: qs("#place-nav"),
  scaleBar: qs("#scale-bar"),
  scaleValue: qs("#scale-value"),
  scaleRatio: qs("#scale-ratio"),
  toast: qs("#toast")
};

const state = {
  map: null,
  ready: false,
  finished: false,
  booted: false,
  mode: "aerial",
  lastAerialPitch: HOME_VIEW.pitch,
  lastAerialBearing: HOME_VIEW.bearing,
  selectedPlace: null,
  selectedBuilding: null,
  selectionToken: 0,
  selectedPin: null,
  markers: new Map(),
  hoverKey: null,
  hoverFrame: 0,
  hoverAt: 0,
  reverseController: null,
  reverseCache: new Map(),
  toastTimer: 0,
  coachTimer: 0,
  idleTimer: 0,
  bootTimer: 0,
  progressTimer: 0,
  pointerCoords: null,
  homePaddingKey: "",
  scaleKey: "",
  telemetryFrame: 0
};

const BUILDING_LAYER = "paris-buildings-3d";
const EMPTY_FC = { type: "FeatureCollection", features: [] };

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function setLoader(progress, status) {
  if (!ui.loaderBar) return;
  const safe = Math.max(0, Math.min(100, Math.round(progress)));
  ui.loaderBar.style.width = `${safe}%`;
  ui.loaderPercent.textContent = String(safe).padStart(2, "0");
  if (status) ui.loaderStatus.textContent = status;
}

function bootProgress() {
  let progress = 6;
  const messages = [
    [18, "Connexion au plan-relief…"],
    [34, "Lecture des rues et des quais…"],
    [52, "Modelage des bâtiments…"],
    [68, "Pose des ombres et des hauteurs…"]
  ];
  setLoader(progress, messages[0][1]);
  return window.setInterval(() => {
    if (state.finished) {
      window.clearInterval(state.progressTimer);
      return;
    }
    progress = Math.min(90, progress + 3 + Math.random() * 3);
    let message = messages[0][1];
    for (const [threshold, text] of messages) {
      if (progress >= threshold - 10) message = text;
    }
    setLoader(progress, message);
  }, 620);
}

function showLoaderError() {
  if (state.finished) return;
  if (state.progressTimer) window.clearInterval(state.progressTimer);
  setLoader(0, "Le plan-relief est indisponible.");
  ui.loaderError.hidden = false;
  ui.loader.classList.add("is-error");
}

function finishLoading() {
  if (state.finished) return;
  state.finished = true;
  state.ready = true;
  window.clearTimeout(state.idleTimer);
  window.clearTimeout(state.bootTimer);
  window.clearInterval(state.progressTimer);
  setLoader(100, "Plan-relief prêt.");
  document.body.classList.add("is-ready");
  window.setTimeout(() => {
    ui.loader.classList.add("is-done");
    ui.loader.setAttribute("aria-hidden", "true");
  }, 360);
  if (state.booted) {
    window.setTimeout(startCameraIntro, 720);
  }
}

function startCameraIntro() {
  if (!state.map) return;
  if (reducedMotion) {
    state.map.jumpTo(HOME_VIEW);
    window.setTimeout(showCoachmark, 900);
    return;
  }
  state.map.easeTo({
    ...HOME_VIEW,
    duration: 4200,
    easing: (t) => 1 - Math.pow(1 - t, 3)
  });
  window.setTimeout(showCoachmark, 3250);
  window.setTimeout(() => updateTelemetry(true), 4300);
}

function showCoachmark() {
  if (!ui.coachmark || state.selectedBuilding || state.selectedPlace) return;
  ui.coachmark.classList.add("is-visible");
  window.clearTimeout(state.coachTimer);
  state.coachTimer = window.setTimeout(() => hideCoachmark(true), 13500);
}

function hideCoachmark(permanent = false) {
  if (!ui.coachmark) return;
  ui.coachmark.classList.remove("is-visible");
  if (permanent) {
    window.clearTimeout(state.coachTimer);
    ui.coachmark.hidden = true;
  }
}

function showToast(message, duration = 3600) {
  if (!ui.toast) return;
  ui.toast.textContent = message;
  ui.toast.classList.add("is-visible");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => ui.toast.classList.remove("is-visible"), duration);
}

function updateClock() {
  if (!ui.clock) return;
  try {
    ui.clock.textContent = new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(new Date());
  } catch (error) {
    const now = new Date();
    ui.clock.textContent = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  }
}

function dms(value, isLatitude) {
  const hemisphere = isLatitude ? (value >= 0 ? "N" : "S") : (value >= 0 ? "E" : "O");
  const absolute = Math.abs(value);
  let degrees = Math.floor(absolute);
  let minutesFloat = (absolute - degrees) * 60;
  let minutes = Math.floor(minutesFloat);
  let seconds = Math.round((minutesFloat - minutes) * 60);
  if (seconds === 60) {
    seconds = 0;
    minutes += 1;
  }
  if (minutes === 60) {
    minutes = 0;
    degrees += 1;
  }
  return `${degrees}° ${String(minutes).padStart(2, "0")}′ ${String(seconds).padStart(2, "0")}″ ${hemisphere}`;
}

function dmsPair(lng, lat) {
  return `${dms(lat, true)} · ${dms(lng, false)}`;
}

function decimalPair(lng, lat) {
  const lon = `${Math.abs(lng).toFixed(5)}° ${lng >= 0 ? "E" : "O"}`;
  const la = `${Math.abs(lat).toFixed(5)}° ${lat >= 0 ? "N" : "S"}`;
  return `${la} · ${lon}`;
}

function formatHeight(value) {
  if (!Number.isFinite(value)) return "—";
  return nf.format(value);
}

function getHeight(properties) {
  const height = Number(properties && properties.render_height);
  if (Number.isFinite(height) && height > 0) return height;
  return null;
}

function getBase(properties) {
  const base = Number(properties && properties.render_min_height);
  return Number.isFinite(base) && base > 0 ? base : 0;
}

function getCameraAltitude() {
  if (!state.map) return null;
  try {
    const zoom = state.map.getZoom();
    const lat = state.map.getCenter().lat;
    const resolution = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
    const height = state.map.getCanvas().height;
    const fovDegrees = state.map.getVerticalFieldOfView ? state.map.getVerticalFieldOfView() : 36.87;
    const fov = (fovDegrees * Math.PI) / 180;
    const pitch = (Math.max(0, state.map.getPitch()) * Math.PI) / 180;
    return ((resolution * (height / 2)) / Math.tan(fov / 2)) * Math.cos(pitch);
  } catch (error) {
    return null;
  }
}

function distanceMeters(a, b) {
  const radius = 6378137;
  const lat1 = (a[1] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;
  const dLat = lat2 - lat1;
  const dLng = ((b[0] - a[0]) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * radius * Math.asin(Math.sqrt(h));
}

function niceScale(meters) {
  const steps = [10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000];
  let best = steps[0];
  let bestDistance = Infinity;
  for (const step of steps) {
    const distance = Math.abs(Math.log(step / meters));
    if (distance < bestDistance) {
      best = step;
      bestDistance = distance;
    }
  }
  return best;
}

function updateScale() {
  if (!state.map || !ui.scaleBar) return;
  try {
    const center = state.map.getCenter();
    const point = state.map.project(center);
    const east = state.map.project([center.lng + 0.001, center.lat]);
    const pixels = Math.abs(east.x - point.x);
    if (!pixels) return;
    const metersPerPixel = distanceMeters([center.lng, center.lat], [center.lng + 0.001, center.lat]) / pixels;
    const target = 84;
    const step = niceScale(metersPerPixel * target);
    const width = Math.max(42, Math.min(128, step / metersPerPixel));
    const label = step >= 1000 ? `${nf.format(step / 1000)} km` : `${nf.format(step)} m`;
    const ratioRaw = metersPerPixel * 3779.527559;
    const ratioRound = ratioRaw < 10000 ? Math.round(ratioRaw / 100) * 100 : Math.round(ratioRaw / 500) * 500;
    const key = `${Math.round(width)}-${label}-${ratioRound}`;
    if (key === state.scaleKey) return;
    state.scaleKey = key;
    ui.scaleBar.style.width = `${width.toFixed(1)}px`;
    ui.scaleValue.textContent = label;
    ui.scaleRatio.textContent = `1 : ${nfInt.format(ratioRound)}`;
  } catch (error) {}
}

function updateCompass() {
  if (!state.map || !ui.compassDial) return;
  ui.compassDial.style.transform = `rotate(${-state.map.getBearing()}deg)`;
}

function updateTelemetry(force = false) {
  if (!state.map) return;
  updateCompass();
  updateScale();
  const center = state.map.getCenter();
  if (!state.pointerCoords || force) {
    ui.coord.textContent = dmsPair(center.lng, center.lat);
  }
  const altitude = getCameraAltitude();
  ui.altitude.textContent = Number.isFinite(altitude) ? `${nfInt.format(Math.round(altitude))} m` : "—";
}

function scheduleTelemetry(force = false) {
  if (state.telemetryFrame) return;
  state.telemetryFrame = window.requestAnimationFrame(() => {
    state.telemetryFrame = 0;
    updateTelemetry(force);
  });
}

function updateMapPadding() {
  if (!state.map) return;
  const styles = getComputedStyle(document.documentElement);
  const top = parseFloat(styles.getPropertyValue("--topbar-h")) || 80;
  const bottom = parseFloat(styles.getPropertyValue("--bottombar-h")) || 82;
  const key = `${top}-${bottom}`;
  if (key === state.homePaddingKey) return;
  state.homePaddingKey = key;
  try {
    state.map.setPadding({ top, bottom, left: 0, right: 0 });
  } catch (error) {}
}

function createMap() {
  if (!window.maplibregl) {
    showLoaderError();
    return;
  }
  const styles = getComputedStyle(document.documentElement);
  const top = parseFloat(styles.getPropertyValue("--topbar-h")) || 80;
  const bottom = parseFloat(styles.getPropertyValue("--bottombar-h")) || 82;

  state.map = new maplibregl.Map({
    container: "map",
    style: "style.json",
    center: reducedMotion ? HOME_VIEW.center : START_VIEW.center,
    zoom: reducedMotion ? HOME_VIEW.zoom : START_VIEW.zoom,
    pitch: reducedMotion ? HOME_VIEW.pitch : START_VIEW.pitch,
    bearing: reducedMotion ? HOME_VIEW.bearing : START_VIEW.bearing,
    maxBounds: [[2.14, 48.73], [2.52, 48.96]],
    minZoom: 12.8,
    maxZoom: 18.2,
    maxPitch: 72,
    attributionControl: false,
    dragRotate: true,
    pitchWithRotate: true,
    touchPitch: true,
    renderWorldCopies: false,
    fadeDuration: 180,
    padding: { top, bottom, left: 0, right: 0 }
  });

  state.progressTimer = bootProgress();

  state.map.on("style.load", () => {
    addVolumeLayers();
    addEiffelTower();
  });
  state.map.on("load", onMapLoad);
  state.map.on("idle", () => {
    if (!state.finished) finishLoading();
  });
  state.map.on("move", () => {
    scheduleTelemetry();
    hideBuildingTip();
  });
  state.map.on("resize", () => {
    updateMapPadding();
    scheduleTelemetry(true);
  });
  state.map.on("mousemove", onPointerMove);
  state.map.on("mouseout", () => {
    state.pointerCoords = null;
    clearHover();
    hideBuildingTip();
    if (state.map) state.map.getCanvas().style.cursor = "";
  });
  state.map.on("dragstart", () => {
    hideCoachmark();
    clearHover();
    hideBuildingTip();
    if (state.map) state.map.getCanvas().style.cursor = "grabbing";
  });
  state.map.on("dragend", () => {
    if (state.map) state.map.getCanvas().style.cursor = "";
  });
  state.map.on("click", onMapClick);
  state.map.on("zoomend", syncMarkerVisibility);
  state.map.on("error", (event) => {
    if (event && event.error) console.warn("MapLibre:", event.error.message || event.error);
  });

  state.bootTimer = window.setTimeout(() => {
    if (!state.ready) showLoaderError();
  }, 16000);
}

function addVolumeLayers() {
  const map = state.map;
  if (!map || map.getSource("hover-volume")) return;
  if (map.getLayer(BUILDING_LAYER)) {
    const baseFilter = map.getFilter(BUILDING_LAYER) || true;
    map.setFilter(BUILDING_LAYER, [
      "all",
      baseFilter,
      ["!", ["in", ["id"], ["literal", EIFFEL_OSM_IDS]]]
    ]);
  }
  map.addSource("hover-volume", { type: "geojson", data: EMPTY_FC });
  map.addLayer({
    id: "hover-volume",
    type: "fill-extrusion",
    source: "hover-volume",
    paint: {
      "fill-extrusion-color": "#c37948",
      "fill-extrusion-height": ["+", ["get", "height"], 0.35],
      "fill-extrusion-base": ["get", "base"],
      "fill-extrusion-opacity": 0.96
    }
  });
  map.addSource("selected-volume", { type: "geojson", data: EMPTY_FC });
  map.addLayer({
    id: "selected-volume",
    type: "fill-extrusion",
    source: "selected-volume",
    paint: {
      "fill-extrusion-color": "#123e31",
      "fill-extrusion-height": ["+", ["get", "height"], 0.65],
      "fill-extrusion-base": ["get", "base"],
      "fill-extrusion-opacity": 1,
      "fill-extrusion-vertical-gradient": true
    }
  });
}

function sampleProfile(points, y) {
  if (y <= points[0].y) return points[0].half;
  for (let i = 1; i < points.length; i += 1) {
    if (y <= points[i].y) {
      const a = points[i - 1];
      const b = points[i];
      const t = (y - a.y) / (b.y - a.y);
      return a.half + (b.half - a.half) * t;
    }
  }
  return points[points.length - 1].half;
}

function createEiffelGeometry(THREE) {
  const group = new THREE.Group();
  const bodyProfile = [
    { y: 0, half: 64 },
    { y: 20, half: 53 },
    { y: 40, half: 41 },
    { y: 57, half: 34 },
    { y: 78, half: 28.5 },
    { y: 100, half: 23.5 },
    { y: 115, half: 21 },
    { y: 140, half: 17 },
    { y: 170, half: 13.3 },
    { y: 200, half: 10.6 },
    { y: 230, half: 8.4 },
    { y: 255, half: 6.7 },
    { y: 276, half: 5.5 }
  ];
  const legProfile = [
    { y: 0, half: 13 },
    { y: 14, half: 11.4 },
    { y: 30, half: 8.8 },
    { y: 44, half: 6.2 },
    { y: 57, half: 4.4 }
  ];
  const members = [];
  const v = (x, y, z) => new THREE.Vector3(x, y, z);
  const beam = (ax, ay, az, bx, by, bz, thickness) => {
    members.push({ a: v(ax, ay, az), b: v(bx, by, bz), t: thickness || 1 });
  };
  const corners = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
  const cornerPoint = (corner, y, extra) => {
    const half = sampleProfile(bodyProfile, y) + (extra || 0);
    return [corner[0] * half, y, corner[1] * half];
  };

  const legLevels = [0, 14, 30, 44, 57];
  for (const corner of corners) {
    const samples = legLevels.map((y) => {
      const outer = sampleProfile(bodyProfile, y);
      const legHalf = sampleProfile(legProfile, y);
      const center = outer - legHalf;
      return {
        y,
        legHalf,
        rails: [
          [corner[0] * (center + legHalf), y, corner[1] * (center + legHalf)],
          [corner[0] * (center - legHalf), y, corner[1] * (center + legHalf)],
          [corner[0] * (center - legHalf), y, corner[1] * (center - legHalf)],
          [corner[0] * (center + legHalf), y, corner[1] * (center - legHalf)]
        ]
      };
    });
    for (let i = 0; i < samples.length - 1; i += 1) {
      const lower = samples[i];
      const upper = samples[i + 1];
      for (let r = 0; r < 4; r += 1) {
        const nr = (r + 1) % 4;
        beam(...lower.rails[r], ...upper.rails[r], 1.7);
        beam(...lower.rails[r], ...upper.rails[nr], 0.8);
        beam(...lower.rails[nr], ...upper.rails[r], 0.8);
      }
      for (let r = 0; r < 4; r += 1) {
        const nr = (r + 1) % 4;
        beam(...lower.rails[r], ...lower.rails[nr], 0.9);
      }
    }
    const top = samples[samples.length - 1];
    for (let r = 0; r < 4; r += 1) {
      const nr = (r + 1) % 4;
      beam(...top.rails[r], ...top.rails[nr], 0.9);
    }
  }

  const facePairs = [[0, 1], [1, 2], [2, 3], [3, 0]];
  const bodyLevels = [57, 78, 100, 115, 140, 170, 200, 230, 255, 276];
  for (const y of bodyLevels) {
    for (const [a, b] of facePairs) {
      const pa = cornerPoint(corners[a], y);
      const pb = cornerPoint(corners[b], y);
      beam(...pa, ...pb, 1.35);
    }
  }
  for (let i = 0; i < bodyLevels.length - 1; i += 1) {
    const lower = bodyLevels[i];
    const upper = bodyLevels[i + 1];
    for (const [a, b] of facePairs) {
      const la = cornerPoint(corners[a], lower);
      const lb = cornerPoint(corners[b], lower);
      const ua = cornerPoint(corners[a], upper);
      const ub = cornerPoint(corners[b], upper);
      beam(...la, ...lb, 0.85);
      beam(...la, ...ua, 1.65);
      beam(...la, ...ub, 0.75);
      beam(...lb, ...ua, 0.75);
      beam(...la, ...ub, 0.9);
    }
  }

  for (const corner of corners) {
    for (let i = 0; i < bodyLevels.length - 1; i += 1) {
      const a = cornerPoint(corner, bodyLevels[i]);
      const b = cornerPoint(corner, bodyLevels[i + 1]);
      beam(...a, ...b, 1.65);
    }
  }

  const decks = [
    { y: 57, half: 35.6, thickness: 1.3 },
    { y: 115, half: 22.2, thickness: 1.1 },
    { y: 276, half: 7.2, thickness: 0.9 }
  ];
  for (const deck of decks) {
    const one = deck.half;
    const two = deck.thickness;
    for (const [a, b] of facePairs) {
      const ca = corners[a];
      const cb = corners[b];
      beam(ca[0] * one, deck.y - two / 2, ca[1] * one, cb[0] * one, deck.y - two / 2, cb[1] * one, 2.2);
      beam(ca[0] * one, deck.y + two / 2, ca[1] * one, cb[0] * one, deck.y + two / 2, cb[1] * one, 1.2);
    }
  }

  for (const face of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const plane = face[0] !== 0 ? "x" : "z";
    const sign = face[0] !== 0 ? face[0] : face[1];
    const zPlane = sign * (sampleProfile(bodyProfile, 9) - 0.8);
    const start = plane === "z" ? [sign * 49, 8, zPlane] : [zPlane, 8, sign * 49];
    const end = plane === "z" ? [-sign * 49, 8, zPlane] : [zPlane, 8, -sign * 49];
    const control = plane === "z" ? [0, 64, zPlane * 0.94] : [zPlane * 0.94, 64, 0];
    const steps = 18;
    let previous = start;
    for (let i = 1; i <= steps; i += 1) {
      const t = i / steps;
      const mt = 1 - t;
      const point = [
        mt * mt * start[0] + 2 * mt * t * control[0] + t * t * end[0],
        mt * mt * start[1] + 2 * mt * t * control[1] + t * t * end[1],
        mt * mt * start[2] + 2 * mt * t * control[2] + t * t * end[2]
      ];
      beam(...previous, ...point, 1.25);
      previous = point;
    }
  }

  const spireLevels = [276, 286, 296, 306, 315, 323, 330];
  for (const y of spireLevels) {
    const half = sampleProfile(bodyProfile, Math.min(y, 276)) * (1 - (y - 276) / 115);
    const points = [
      [-half, y, -half],
      [half, y, -half],
      [half, y, half],
      [-half, y, half]
    ];
    for (let i = 0; i < 4; i += 1) {
      beam(...points[i], ...points[(i + 1) % 4], 0.6);
    }
    if (y > 276) {
      const previousHalf = sampleProfile(bodyProfile, 276) * (1 - (spireLevels[spireLevels.indexOf(y) - 1] - 276) / 115);
      const previousY = spireLevels[spireLevels.indexOf(y) - 1];
      const previousPoints = [
        [-previousHalf, previousY, -previousHalf],
        [previousHalf, previousY, -previousHalf],
        [previousHalf, previousY, previousHalf],
        [-previousHalf, previousY, previousHalf]
      ];
      for (let i = 0; i < 4; i += 1) {
        beam(...previousPoints[i], ...points[i], 0.7);
      }
    }
  }
  beam(0, 276, 0, 0, 330, 0, 1.2);

  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: 0x5b3624,
    roughness: 0.62,
    metalness: 0.32
  });
  const deckMaterial = new THREE.MeshStandardMaterial({
    color: 0x392118,
    roughness: 0.72,
    metalness: 0.22
  });
  const beamGeometry = new THREE.BoxGeometry(1, 1, 1);
  const railMesh = new THREE.InstancedMesh(beamGeometry, edgeMaterial, members.length);
  const up = new THREE.Vector3(0, 1, 0);
  const midpoint = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const matrix = new THREE.Matrix4();
  const scale = new THREE.Vector3();
  members.forEach((member, index) => {
    direction.subVectors(member.b, member.a);
    const length = direction.length();
    midpoint.addVectors(member.a, member.b).multiplyScalar(0.5);
    quaternion.setFromUnitVectors(up, direction.normalize());
    scale.set(member.t, Math.max(0.1, length), member.t);
    matrix.compose(midpoint, quaternion, scale);
    railMesh.setMatrixAt(index, matrix);
  });
  railMesh.instanceMatrix.needsUpdate = true;
  railMesh.frustumCulled = false;
  railMesh.renderOrder = 2;
  group.add(railMesh);

  for (const deck of decks) {
    const deckMesh = new THREE.Mesh(
      new THREE.BoxGeometry(deck.half * 2, deck.thickness, deck.half * 2),
      deckMaterial
    );
    deckMesh.position.y = deck.y;
    deckMesh.frustumCulled = false;
    group.add(deckMesh);
  }

  return group;
}

function addEiffelTower() {
  if (!window.THREE || !state.map || state.map.getLayer("eiffel-tower-3d")) return;
  const THREE = window.THREE;
  const origin = maplibregl.MercatorCoordinate.fromLngLat(EIFFEL_ORIGIN, 0);
  const meter = origin.meterInMercatorCoordinateUnits();
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  scene.add(createEiffelGeometry(THREE));
  scene.add(new THREE.HemisphereLight(0xfff5e3, 0x2b1a11, 1.15));
  const sun = new THREE.DirectionalLight(0xffe4bd, 1.55);
  sun.position.set(-1.25, 2.1, 1.5);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xc9d9d1, 0.55);
  fill.position.set(1.4, 0.7, -1.1);
  scene.add(fill);

  const layer = {
    id: "eiffel-tower-3d",
    type: "custom",
    renderingMode: "3d",
    onAdd(map, gl) {
      this.map = map;
      this.scene = scene;
      this.camera = camera;
      this.renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true
      });
      this.renderer.autoClear = false;
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.resetState();
    },
    render(gl, matrixArray) {
      const fused = new THREE.Matrix4().fromArray(matrixArray);
      const rotation = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
      const transform = new THREE.Matrix4()
        .makeTranslation(origin.x, origin.y, origin.z)
        .multiply(rotation)
        .multiply(new THREE.Matrix4().makeScale(meter, meter, meter));
      this.camera.projectionMatrix.copy(fused).multiply(transform);
      this.renderer.resetState();
      this.renderer.render(this.scene, this.camera);
    }
  };
  state.map.addLayer(layer);
}

function onMapLoad() {
  state.booted = true;
  updateMapPadding();
  updateClock();
  updateTelemetry(true);
  createPlaceMarkers();
  syncMarkerVisibility();
  if (!state.finished) {
    window.clearTimeout(state.idleTimer);
    state.idleTimer = window.setTimeout(finishLoading, 500);
  }
}

function createPlaceMarkers() {
  if (!state.map) return;
  for (const [id, place] of Object.entries(PLACES)) {
    if (state.markers.has(id)) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "place-marker";
    button.dataset.place = id;
    button.setAttribute("aria-label", `${place.name}, ${place.height} mètres`);
    button.innerHTML = `<span class="place-marker__label">${escapeHtml(place.short)} <em>${place.height} m</em></span><span class="place-marker__line" aria-hidden="true"></span><span class="place-marker__point" aria-hidden="true"></span>`;
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      focusPlace(id);
    });
    button.addEventListener("pointerdown", (event) => event.stopPropagation());
    button.addEventListener("mousedown", (event) => event.stopPropagation());
    const marker = new maplibregl.Marker({ element: button, anchor: "bottom", offset: [0, 0] })
      .setLngLat(place.coords)
      .addTo(state.map);
    state.markers.set(id, { marker, button });
  }
}

function syncMarkerVisibility() {
  if (!state.map) return;
  const visible = state.map.getZoom() >= 13.5;
  for (const { button } of state.markers.values()) {
    button.hidden = !visible;
  }
}

function updateActiveMarkers() {
  for (const [id, { button }] of state.markers) {
    button.classList.toggle("is-active", state.selectedPlace === id);
  }
  qsa(".place-button", ui.placeNav).forEach((button) => {
    const active = button.dataset.place === state.selectedPlace;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function onPointerMove(event) {
  if (!state.map || !state.finished) return;
  if (event && event.lngLat) {
    state.pointerCoords = event.lngLat;
    ui.coord.textContent = dmsPair(event.lngLat.lng, event.lngLat.lat);
  }
  const now = performance.now();
  if (now - state.hoverAt < 52) return;
  state.hoverAt = now;
  if (state.hoverFrame) window.cancelAnimationFrame(state.hoverFrame);
  state.hoverFrame = window.requestAnimationFrame(() => {
    state.hoverFrame = 0;
    updateHover(event.point, event.originalEvent);
  });
}

function updateHover(point, originalEvent) {
  if (!state.map || !state.map.getLayer(BUILDING_LAYER)) return;
  if (state.map.isMoving && state.map.isMoving()) {
    clearHover();
    hideBuildingTip();
    return;
  }
  const features = state.map.queryRenderedFeatures(point, { layers: [BUILDING_LAYER] });
  const feature = features[0];
  if (!feature) {
    clearHover();
    hideBuildingTip();
    state.map.getCanvas().style.cursor = "";
    return;
  }

  const height = getHeight(feature.properties);
  const base = getBase(feature.properties);
  const key = buildingKey(feature);
  state.map.getCanvas().style.cursor = "pointer";

  if (key !== state.hoverKey) {
    state.hoverKey = key;
    const hoverSource = state.map.getSource("hover-volume");
    if (hoverSource) {
      hoverSource.setData({
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          geometry: feature.geometry,
          properties: { height: height === null ? 8 : height, base }
        }]
      });
    }
  }

  if (originalEvent) {
    const x = Math.min(window.innerWidth - 74, Math.max(74, originalEvent.clientX));
    const y = Math.min(window.innerHeight - 80, Math.max(100, originalEvent.clientY - 4));
    ui.buildingTip.style.left = `${x}px`;
    ui.buildingTip.style.top = `${y}px`;
    ui.buildingTipHeight.textContent = height === null ? "—" : `${formatHeight(height)} m`;
    ui.buildingTip.classList.add("is-visible");
    ui.buildingTip.setAttribute("aria-hidden", "false");
  }
}

function buildingKey(feature) {
  if (feature.id != null) return `id-${feature.id}-${getHeight(feature.properties)}`;
  try {
    const coordinates = feature.geometry && feature.geometry.coordinates;
    const text = JSON.stringify(coordinates);
    let hash = 0;
    for (let i = 0; i < text.length; i += 6) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    return `${feature.geometry.type}-${text.length}-${hash}-${getHeight(feature.properties)}`;
  } catch (error) {
    return "building";
  }
}

function clearHover() {
  state.hoverKey = null;
  if (!state.map) return;
  const source = state.map.getSource("hover-volume");
  if (source) source.setData(EMPTY_FC);
}

function hideBuildingTip() {
  ui.buildingTip.classList.remove("is-visible");
  ui.buildingTip.setAttribute("aria-hidden", "true");
}

function onMapClick(event) {
  if (!state.map || !state.finished) return;
  const target = event.originalEvent && event.originalEvent.target;
  if (target && target.closest && target.closest(".place-marker")) return;
  if (!state.map.getLayer(BUILDING_LAYER)) return;
  const features = state.map.queryRenderedFeatures(event.point, { layers: [BUILDING_LAYER] });
  const feature = features[0];
  if (!feature) {
    clearSelection();
    return;
  }
  hideCoachmark();
  selectBuilding(feature, event.lngLat);
}

function footprintArea(geometry) {
  if (!geometry || !geometry.coordinates) return null;
  const latitude = geometry.coordinates[0]?.[0]?.[0]?.[1] ?? 48.8566;
  const metersPerDegree = 111319.49079327358;
  const cosLat = Math.cos((latitude * Math.PI) / 180);

  const ringArea = (ring) => {
    if (!Array.isArray(ring) || ring.length < 3) return 0;
    let sum = 0;
    for (let i = 0; i < ring.length - 1; i += 1) {
      const a = ring[i];
      const b = ring[i + 1];
      const ax = a[0] * metersPerDegree * cosLat;
      const ay = a[1] * metersPerDegree;
      const bx = b[0] * metersPerDegree * cosLat;
      const by = b[1] * metersPerDegree;
      sum += ax * by - bx * ay;
    }
    return Math.abs(sum / 2);
  };

  const polygonArea = (polygon) => {
    if (!Array.isArray(polygon) || !polygon.length) return 0;
    let area = ringArea(polygon[0]);
    for (let i = 1; i < polygon.length; i += 1) area -= ringArea(polygon[i]);
    return Math.max(0, area);
  };

  try {
    if (geometry.type === "Polygon") return polygonArea(geometry.coordinates);
    if (geometry.type === "MultiPolygon") {
      return geometry.coordinates.reduce((total, polygon) => total + polygonArea(polygon), 0);
    }
  } catch (error) {
    return null;
  }
  return null;
}

function geometryCenter(geometry) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const visit = (coordinates) => {
    if (!Array.isArray(coordinates)) return;
    if (typeof coordinates[0] === "number" && typeof coordinates[1] === "number") {
      minX = Math.min(minX, coordinates[0]);
      minY = Math.min(minY, coordinates[1]);
      maxX = Math.max(maxX, coordinates[0]);
      maxY = Math.max(maxY, coordinates[1]);
      return;
    }
    for (const child of coordinates) visit(child);
  };
  visit(geometry && geometry.coordinates);
  if (!Number.isFinite(minX)) return null;
  return [(minX + maxX) / 2, (minY + maxY) / 2];
}

function selectBuilding(feature, lngLat) {
  if (!state.map) return;
  hideCoachmark();
  state.selectionToken += 1;
  const token = state.selectionToken;
  state.selectedPlace = null;
  state.selectedBuilding = feature;
  updateActiveMarkers();

  const height = getHeight(feature.properties);
  const base = getBase(feature.properties);
  const area = footprintArea(feature.geometry);
  const center = geometryCenter(feature.geometry) || [lngLat.lng, lngLat.lat];
  const coords = { lng: center[0], lat: center[1] };
  const selectedSource = state.map.getSource("selected-volume");
  if (selectedSource) {
    selectedSource.setData({
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: feature.geometry,
        properties: { height: height === null ? 8 : height, base }
      }]
    });
  }
  setSelectionPin(coords, height);
  renderBuildingPanel({ height, base, area, coords, token });
  openDetailPanel();
  const location = ui.detailContent.querySelector("#building-location");
  if (location) {
    location.textContent = "Paris · localisation en cours…";
    reverseGeocode(coords.lat, coords.lng, token);
  }
}

function setSelectionPin(coords, height) {
  if (!state.map) return;
  if (!state.selectedPin) {
    const element = document.createElement("div");
    element.className = "selected-pin";
    element.setAttribute("aria-hidden", "true");
    element.innerHTML = `<span class="selected-pin__tag"><span>Hauteur</span><strong></strong></span><span class="selected-pin__stem"></span><span class="selected-pin__foot"></span>`;
    state.selectedPin = new maplibregl.Marker({ element, anchor: "bottom" }).addTo(state.map);
  }
  const strong = state.selectedPin.getElement().querySelector("strong");
  if (strong) strong.textContent = height === null ? "—" : `${formatHeight(height)} m`;
  state.selectedPin.setLngLat([coords.lng, coords.lat]);
}

function renderRuler(height, referenceLabel) {
  const numeric = Number.isFinite(height) ? height : 0;
  const marker = Math.max(0, Math.min(100, (numeric / MAX_REFERENCE) * 100));
  const ticks = RULER_TICKS.map((tick) => {
    const left = (tick.at / MAX_REFERENCE) * 100;
    return `<span class="detail-ruler__tick" style="left:${left}%" title="${escapeHtml(tick.title)}">${tick.label}</span>`;
  }).join("");
  const reference = referenceLabel || (numeric > 0 ? `≈ ${Math.max(1, Math.round((numeric / 330) * 100))} % de la hauteur de la Tour Eiffel` : "Hauteur non renseignée");
  return `<div class="detail-ruler" style="--marker:${marker.toFixed(2)}%"><div class="detail-ruler__track" aria-hidden="true"><span class="detail-ruler__fill"></span><span class="detail-ruler__marker"></span></div><div class="detail-ruler__ticks" aria-hidden="true">${ticks}</div><p class="detail-compare">${escapeHtml(reference)}</p></div>`;
}

function renderBuildingPanel(data) {
  const height = data.height;
  const areaText = data.area && data.area > 1 ? `≈ ${nfInt.format(data.area)} m²` : "—";
  const coordsText = decimalPair(data.coords.lng, data.coords.lat);
  const baseFact = data.base > 0
    ? `<div class="detail-fact"><dt>Base</dt><dd>${formatHeight(data.base)} m</dd></div>`
    : "";
  ui.detailKind.textContent = "Fiche volume";
  ui.detailContent.innerHTML = `<h2>Bâtiment<br>parisien</h2><span class="detail-location" id="building-location">Paris · localisation en cours…</span><div class="detail-height"><span class="detail-height__number">${height === null ? "—" : formatHeight(height)}</span><span class="detail-height__unit">m</span><span class="detail-height__caption">hauteur<br>extrudée</span></div>${renderRuler(height)}<dl class="detail-facts"><div class="detail-fact"><dt>Emprise au sol</dt><dd>${areaText}</dd></div><div class="detail-fact"><dt>Coordonnées</dt><dd>${coordsText}</dd></div>${baseFact}</dl><div class="detail-actions"><button class="detail-action" type="button" data-detail-action="recenter"><svg><use href="#icon-target"></use></svg>Recentrer</button><a class="detail-action detail-action--muted" href="https://www.openstreetmap.org/?mlat=${data.coords.lat}&mlon=${data.coords.lng}#map=19/${data.coords.lat}/${data.coords.lng}" target="_blank" rel="noopener noreferrer">Source OSM<svg><use href="#icon-arrow-up-right"></use></svg></a></div><p class="detail-note">Hauteur issue de l'extrusion OpenStreetMap, exprimée en mètres. Cette valeur peut être estimée ou incomplète.</p>`;
  ui.detailContent.querySelector('[data-detail-action="recenter"]')?.addEventListener("click", () => {
    state.map.easeTo({
      center: [data.coords.lng, data.coords.lat],
      zoom: Math.max(state.map.getZoom(), 16.1),
      pitch: Math.max(state.map.getPitch(), 55),
      duration: reducedMotion ? 0 : 950
    });
  });
}

function renderPlacePanel(place) {
  ui.detailKind.textContent = "Repère parisien";
  ui.detailContent.innerHTML = `<h2>${escapeHtml(place.name)}</h2><span class="detail-location">${escapeHtml(place.location)}</span><div class="detail-height"><span class="detail-height__number">${formatHeight(place.height)}</span><span class="detail-height__unit">m</span><span class="detail-height__caption">hauteur<br>du monument</span></div>${renderRuler(place.height, `Repère à ${place.height} m · ${place.name}`)}<p class="detail-description">${escapeHtml(place.description)}</p><dl class="detail-facts"><div class="detail-fact"><dt>Inauguration</dt><dd>${escapeHtml(place.year)}</dd></div><div class="detail-fact"><dt>Architecte</dt><dd>${escapeHtml(place.architect)}</dd></div><div class="detail-fact"><dt>Hauteur</dt><dd>${place.height} m</dd></div><div class="detail-fact"><dt>Position</dt><dd>${decimalPair(place.coords[0], place.coords[1])}</dd></div></dl><div class="detail-actions"><button class="detail-action" type="button" data-detail-action="recenter"><svg><use href="#icon-target"></use></svg>Recentrer</button><a class="detail-action detail-action--muted" href="${place.wiki}" target="_blank" rel="noopener noreferrer">En savoir plus<svg><use href="#icon-arrow-up-right"></use></svg></a></div><p class="detail-note">Hauteur du monument issue des données de référence. Le volume affiché dans la carte dépend de la modélisation OpenStreetMap.</p>`;
  ui.detailContent.querySelector('[data-detail-action="recenter"]')?.addEventListener("click", () => {
    state.map.easeTo({
      center: place.coords,
      zoom: place.view.zoom,
      pitch: place.view.pitch,
      bearing: place.view.bearing,
      duration: reducedMotion ? 0 : 950
    });
  });
}

function openDetailPanel() {
  state.map?.stop();
  ui.detailPanel.classList.add("is-open");
  ui.detailPanel.setAttribute("aria-hidden", "false");
  document.body.classList.add("detail-open");
  hideCoachmark();
}

function closeDetailPanel() {
  ui.detailPanel.classList.remove("is-open");
  ui.detailPanel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("detail-open");
}

function clearBuildingVisuals() {
  state.selectionToken += 1;
  state.selectedBuilding = null;
  if (state.map) {
    const source = state.map.getSource("selected-volume");
    if (source) source.setData(EMPTY_FC);
  }
  if (state.selectedPin) {
    state.selectedPin.remove();
    state.selectedPin = null;
  }
  if (state.reverseController) {
    state.reverseController.abort();
    state.reverseController = null;
  }
}

function clearSelection() {
  clearBuildingVisuals();
  state.selectedPlace = null;
  updateActiveMarkers();
  closeDetailPanel();
  hideBuildingTip();
}

async function reverseGeocode(lat, lng, token) {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (state.reverseCache.has(key)) {
    applyLocation(state.reverseCache.get(key), token);
    return;
  }
  if (state.reverseController) state.reverseController.abort();
  const controller = new AbortController();
  state.reverseController = controller;
  const timeout = window.setTimeout(() => controller.abort(), 5200);
  try {
    const response = await fetch(`https://photon.komoot.io/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&lang=fr`, {
      signal: controller.signal,
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error("reverse");
    const data = await response.json();
    const properties = data && data.features && data.features[0] && data.features[0].properties;
    if (!properties) throw new Error("empty");
    const postcode = String(properties.postcode || "");
    let arrondissement = "";
    if (/^750\d{2}$/.test(postcode)) {
      const number = Number(postcode.slice(-2));
      if (number >= 1 && number <= 20) arrondissement = `${number}e arrondissement`;
    }
    const pieces = [];
    if (arrondissement) pieces.push(arrondissement);
    if (properties.street) pieces.push(properties.street);
    else if (properties.locality) pieces.push(properties.locality);
    if (!pieces.length && properties.district) pieces.push(properties.district);
    const text = pieces.join(" · ") || "Paris";
    state.reverseCache.set(key, text);
    applyLocation(text, token);
  } catch (error) {
    if (!controller.signal.aborted) state.reverseController = null;
  } finally {
    window.clearTimeout(timeout);
    if (state.reverseController === controller) state.reverseController = null;
  }
}

function applyLocation(text, token) {
  if (token !== state.selectionToken) return;
  const location = ui.detailContent.querySelector("#building-location");
  if (location) location.textContent = text;
}

function focusPlace(id) {
  const place = PLACES[id];
  if (!place || !state.map) return;
  hideCoachmark();
  clearBuildingVisuals();
  state.selectedPlace = id;
  updateActiveMarkers();
  renderPlacePanel(place);
  openDetailPanel();
  const isPhone = window.matchMedia("(max-width: 760px)").matches;
  const offset = isPhone
    ? [0, -Math.round(window.innerHeight * 0.17)]
    : [Math.round(Math.min(150, Math.max(72, window.innerWidth * 0.095))), 24];
  state.map.flyTo({
    center: place.coords,
    zoom: place.view.zoom,
    pitch: place.view.pitch,
    bearing: place.view.bearing,
    offset,
    duration: reducedMotion ? 0 : 2050,
    essential: true
  });
}

function resetHome(animate = true) {
  if (!state.map) return;
  hideCoachmark();
  clearSelection();
  if (state.mode !== "aerial") setViewMode("aerial", false);
  state.map.easeTo({
    ...HOME_VIEW,
    duration: animate && !reducedMotion ? 1600 : 0,
    easing: (t) => 1 - Math.pow(1 - t, 3)
  });
}

function setViewMode(mode, animate = true) {
  if (!state.map || mode === state.mode) return;
  if (state.mode === "aerial") {
    state.lastAerialPitch = state.map.getPitch();
    state.lastAerialBearing = state.map.getBearing();
  }
  state.mode = mode;
  if (mode === "plan") {
    state.map.easeTo({ pitch: 0, bearing: 0, duration: animate && !reducedMotion ? 950 : 0 });
    ui.viewToggle.setAttribute("aria-pressed", "false");
    ui.viewToggle.setAttribute("aria-label", "Passer en vue aérienne");
    ui.viewToggle.dataset.tooltip = "Vue aérienne";
    document.body.classList.add("is-plan");
  } else {
    state.map.easeTo({
      pitch: state.lastAerialPitch || HOME_VIEW.pitch,
      bearing: state.lastAerialBearing || HOME_VIEW.bearing,
      duration: animate && !reducedMotion ? 1100 : 0
    });
    ui.viewToggle.setAttribute("aria-pressed", "true");
    ui.viewToggle.setAttribute("aria-label", "Passer en vue plan");
    ui.viewToggle.dataset.tooltip = "Vue plan";
    document.body.classList.remove("is-plan");
  }
}

function toggleFullscreen() {
  const root = document.documentElement;
  if (!document.fullscreenElement) {
    root.requestFullscreen?.().catch(() => showToast("Le plein écran n'est pas disponible dans ce navigateur."));
  } else {
    document.exitFullscreen?.().catch(() => {});
  }
}

function updateFullscreenUI() {
  const active = Boolean(document.fullscreenElement);
  ui.fullscreenIcon.setAttribute("href", active ? "#icon-collapse" : "#icon-expand");
  ui.fullscreenToggle.setAttribute("aria-label", active ? "Quitter le plein écran" : "Passer en plein écran");
  ui.fullscreenToggle.dataset.tooltip = active ? "Quitter le plein écran" : "Plein écran";
}

function bindUI() {
  qsa(".place-button", ui.placeNav).forEach((button) => {
    button.addEventListener("click", () => focusPlace(button.dataset.place));
  });

  ui.detailClose.addEventListener("click", clearSelection);
  ui.zoomIn.addEventListener("click", () => {
    hideCoachmark();
    state.map?.zoomIn({ duration: reducedMotion ? 0 : 420 });
  });
  ui.zoomOut.addEventListener("click", () => {
    hideCoachmark();
    state.map?.zoomOut({ duration: reducedMotion ? 0 : 420 });
  });
  ui.compassReset.addEventListener("click", () => {
    hideCoachmark();
    state.map?.easeTo({ bearing: 0, duration: reducedMotion ? 0 : 700 });
  });
  ui.viewToggle.addEventListener("click", () => {
    hideCoachmark();
    setViewMode(state.mode === "aerial" ? "plan" : "aerial");
  });
  ui.fullscreenToggle.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", updateFullscreenUI);
  ui.coachmarkClose.addEventListener("click", () => hideCoachmark(true));
  ui.loaderRetry.addEventListener("click", () => window.location.reload());
  qs(".brand").addEventListener("click", (event) => {
    event.preventDefault();
    resetHome();
  });

  window.addEventListener("resize", () => {
    updateMapPadding();
    updateTelemetry(true);
    syncMarkerVisibility();
  }, { passive: true });

  window.addEventListener("keydown", (event) => {
    const tag = event.target && event.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.key === "Escape") {
      if (ui.detailPanel.classList.contains("is-open")) clearSelection();
      else hideCoachmark();
      return;
    }
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      state.map?.zoomIn({ duration: reducedMotion ? 0 : 350 });
      return;
    }
    if (event.key === "-") {
      event.preventDefault();
      state.map?.zoomOut({ duration: reducedMotion ? 0 : 350 });
      return;
    }
    if (event.key.toLowerCase() === "r" && !event.ctrlKey && !event.metaKey && !event.altKey) {
      resetHome();
    }
  });

  window.setInterval(updateClock, 30000);
}

function init() {
  qsa(".place-button", ui.placeNav).forEach((button) => {
    button.setAttribute("aria-pressed", "false");
  });
  bindUI();
  updateClock();
  if (reducedMotion) ui.loader.classList.add("reduce-motion");
  createMap();
  window.setTimeout(() => {
    if (state.finished && !state.selectedBuilding && !state.selectedPlace) hideCoachmark(true);
  }, 26000);
}

init();
window.__paris = state;
