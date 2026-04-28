// ── 3D ROBOT RENDERER ─────────────────────────────────────
// Draws an animated 3D robot on a given canvas using Three.js

function createRobot(canvasId, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !window.THREE) return null;

  const w = options.width || canvas.clientWidth || 200;
  const h = options.height || canvas.clientHeight || 200;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
  camera.position.set(0, 0.5, 4);

  // Lights
  const amb = new THREE.AmbientLight(0x4488ff, 0.6);
  scene.add(amb);
  const dir = new THREE.DirectionalLight(0x7c8fff, 1.2);
  dir.position.set(2, 3, 3);
  scene.add(dir);
  const pt = new THREE.PointLight(0x4f8ef7, 2, 10);
  pt.position.set(-2, 1, 2);
  scene.add(pt);

  // Materials
  const bodyMat = new THREE.MeshPhongMaterial({ color: 0x1a2a4a, shininess: 120, specular: 0x4f8ef7 });
  const accentMat = new THREE.MeshPhongMaterial({ color: 0x4f8ef7, shininess: 200, emissive: 0x1a3a7a, emissiveIntensity: 0.4 });
  const eyeMat = new THREE.MeshPhongMaterial({ color: 0x00ddff, emissive: 0x00aaff, emissiveIntensity: 1, shininess: 300 });
  const glassMat = new THREE.MeshPhongMaterial({ color: 0x88bbff, transparent: true, opacity: 0.3, shininess: 400 });

  const robot = new THREE.Group();

  // Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.5, 2, 2), bodyMat);
  body.position.y = 0;
  robot.add(body);

  // Chest panel
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.1), glassMat);
  chest.position.set(0, 0.1, 0.26);
  robot.add(chest);

  // Chest lights
  [-0.1, 0.1].forEach((x, i) => {
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyeMat.clone());
    light.position.set(x, 0.15, 0.31);
    robot.add(light);
  });

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.55), bodyMat);
  head.position.y = 0.8;
  robot.add(head);

  // Eyes
  [-0.15, 0.15].forEach(x => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), eyeMat);
    eye.position.set(x, 0.82, 0.3);
    robot.add(eye);

    // Eye glow ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 16), accentMat);
    ring.position.copy(eye.position);
    ring.position.z -= 0.02;
    robot.add(ring);
  });

  // Antenna
  const antBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8), bodyMat);
  antBase.position.set(0, 1.2, 0);
  robot.add(antBase);
  const antTip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), eyeMat.clone());
  antTip.position.set(0, 1.35, 0);
  robot.add(antTip);

  // Shoulders / Arms
  [-0.55, 0.55].forEach((x, i) => {
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), accentMat);
    shoulder.position.set(x, 0.35, 0);
    robot.add(shoulder);

    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.6, 8), bodyMat);
    arm.position.set(x * 1.05, -0.05, 0);
    arm.rotation.z = i === 0 ? 0.2 : -0.2;
    robot.add(arm);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), accentMat);
    hand.position.set(x * 1.15, -0.38, 0);
    robot.add(hand);
  });

  // Legs
  [-0.2, 0.2].forEach(x => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.55, 8), bodyMat);
    leg.position.set(x, -0.72, 0);
    robot.add(leg);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.3), accentMat);
    foot.position.set(x, -1.02, 0.04);
    robot.add(foot);
  });

  // Accent stripes on body
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.06, 0.52), accentMat);
  stripe.position.set(0, 0.35, 0);
  robot.add(stripe);

  scene.add(robot);

  // Floating platform
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.5, 0.06, 32),
    new THREE.MeshPhongMaterial({ color: 0x0d1a3a, transparent: true, opacity: 0.6 })
  );
  platform.position.y = -1.15;
  scene.add(platform);

  // Animate
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;
    robot.rotation.y = Math.sin(t * 0.4) * 0.35;
    robot.position.y = Math.sin(t * 0.8) * 0.06;
    antTip.material.emissiveIntensity = 0.6 + Math.sin(t * 3) * 0.4;
    renderer.render(scene, camera);
  }
  animate();

  return { renderer, scene, camera, robot };
}

// ── SPLASH ROBOT (Smaller, simpler) ───────────────────────
function createSplashRobot() {
  const canvas = document.getElementById('splash-canvas');
  if (!canvas || !window.THREE) return;
  canvas.width = 200; canvas.height = 200;
  createRobot('splash-canvas', { width: 200, height: 200 });
}

// ── BANNER ROBOT (Mini) ────────────────────────────────────
function createBannerRobot() {
  const canvas = document.getElementById('banner-robot');
  if (!canvas || !window.THREE) return;
  createRobot('banner-robot', { width: 80, height: 80 });
}

// ── MAIN ASSISTANT ROBOT ───────────────────────────────────
function createMainRobot() {
  createRobot('main-robot', { width: 200, height: 200 });
}

// ── ROBOT SPEECH ROTATION ─────────────────────────────────


let robotMsgIdx = 0;
function rotateRobotMessage() {
  const el = document.getElementById('rb-msg');
  const sp = document.getElementById('speech-text');
  robotMsgIdx = (robotMsgIdx + 1) % ROBOT_MESSAGES.length;
  const msg = ROBOT_MESSAGES[robotMsgIdx];
  if (el) el.textContent = msg;
  if (sp) sp.textContent = msg;
}
