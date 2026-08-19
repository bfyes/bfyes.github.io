/**
 * attractor.js — Aizawa 吸引子 WebGL 背景（仅主页）。
 * Zensical 同源方程 + EffectComposer + UnrealBloom。
 * 透明背景方案：bloom 后加自定义 AlphaPass，alpha = max(r,g,b)，
 * 让辉光只在有线条处可见，其余透明。
 */
(function () {
  "use strict";

  var BASE = "https://unpkg.com/three@0.128.0";
  var SCRIPTS = [
    BASE + "/build/three.min.js",
    BASE + "/examples/js/postprocessing/EffectComposer.js",
    BASE + "/examples/js/postprocessing/RenderPass.js",
    BASE + "/examples/js/postprocessing/ShaderPass.js",
    BASE + "/examples/js/postprocessing/MaskPass.js",
    BASE + "/examples/js/postprocessing/UnrealBloomPass.js",
    BASE + "/examples/js/shaders/CopyShader.js",
    BASE + "/examples/js/shaders/LuminosityHighPassShader.js",
  ];

  // ---- Zensical 同源参数 ----
  var CA = 4;
  var OC = 0.05 / CA;
  var PARAMS = {
    alpha: 0.95, beta: 0.2, gamma: 0.7,
    delta: 3.5, epsilon: 0.25, zeta: 0.1,
  };

  var SEGMENT_COUNT = 100;
  var FLOATS_PER_SEG = 768 * CA;

  // 颜色端点：2 色 lerp
  var DARK_A = 0x3DAAFF, DARK_B = 0x8B6FE8;
  var LIGHT_A = 0x4493F8, LIGHT_B = 0x7B5FE8;

  // ---- 相机运镜关键帧（dur 为帧数）----
  var CAM_KEYS = [
    { dur: 500,  sPos: [-1.60744, 1.47329, -2.62968], sTgt: [0.141248, -0.0999439, 0.850354],
                dPos: [-1.16954, 1.24522, -2.71477], dTgt: [0.147224, -0.0702744, 0.859073] },
    { dur: 1500, sPos: [0.0631833, 1.28423, -0.827955], sTgt: [0.0631833, 0.00244161, -0.827957],
                dPos: [-0.0118442, 0.846686, -1.85947], dTgt: [-0.0118554, 0.00845868, -1.86433] },
    { dur: 1500, sPos: [0, 2.39657, 0], sTgt: [0, 0, 0],
                dPos: [0, 2.37576, 0], dTgt: [0, 0, 0] },
    { dur: 1000, sPos: [-1.57788, 0.0300631, -1.48228], sTgt: [0, 0, 0],
                dPos: [-1.28756, -0.00862695, -1.01241], dTgt: [0, 0, 0] },
    { dur: 1000, sPos: [0, 0, 2.22023], sTgt: [0, 0, 0],
                dPos: [0, 0, 2.04844], dTgt: [0, 0, 0] },
    { dur: 500,  sPos: [0.99935, 1.32445, -2.86713], sTgt: [0.0188739, 0.194861, 0.105587],
                dPos: [1.67574, 0.795462, -2.71725], dTgt: [0.0188739, 0.194861, 0.105587] },
    { dur: 1000, sPos: [0.00434437, 0.171172, -1.56255], sTgt: [-0.0261481, 0, -0.000100017],
                dPos: [-0.0000456078, 0.0521422, -1.15426], dTgt: [-0.0261481, 0, -0.000100017] },
    { dur: 1000, sPos: [-0.838463, 0.602458, -0.156669], sTgt: [-1.45554, -0.346908, -2.54362],
                dPos: [-0.56783, 0.450686, -0.413958], dTgt: [-1.45554, -0.346908, -2.54362] },
  ];

  // AlphaPass shader：把 bloom 输出的 RGB 转为 alpha，黑色区域透明
  var ALPHA_SHADER = {
    uniforms: { tDiffuse: { value: null } },
    vertexShader: [
      "varying vec2 vUv;",
      "void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    ].join("\n"),
    fragmentShader: [
      "uniform sampler2D tDiffuse;",
      "varying vec2 vUv;",
      "void main() {",
      "  vec4 c = texture2D(tDiffuse, vUv);",
      "  float a = max(c.r, max(c.g, c.b));",  // 亮处不透明，暗处透明
      "  gl_FragColor = vec4(c.rgb, a);",
      "}",
    ].join("\n"),
  };

  function loadScripts(urls, done) {
    var i = 0;
    function next() {
      if (i >= urls.length) { done(); return; }
      var s = document.createElement("script");
      s.src = urls[i++];
      s.onload = next;
      s.onerror = function () { done(new Error("load failed: " + s.src)); };
      document.head.appendChild(s);
    }
    next();
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function start(el) {
    var THREE = window.THREE;
    var isDark = document.documentElement.getAttribute("data-md-color-scheme") === "slate";
    var colorA = isDark ? DARK_A : LIGHT_A;
    var colorB = isDark ? DARK_B : LIGHT_B;

    // ---- 场景 ----
    var w = window.innerWidth, h = window.innerHeight;
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(90, w / h, 0.0001, 1000);
    camera.position.set(CAM_KEYS[0].sPos[0], CAM_KEYS[0].sPos[1], CAM_KEYS[0].sPos[2]);

    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);  // 透明
    el.appendChild(renderer.domElement);

    // ---- 创建 100 条线段 ----
    var group = new THREE.Group();
    scene.add(group);
    var splines = [];

    var tmpA = new THREE.Color(colorA);
    var tmpB = new THREE.Color(colorB);

    for (var i = 0; i < SEGMENT_COUNT; i++) {
      var positions = new Float32Array(FLOATS_PER_SEG);
      positions[0] = Math.random() - 0.5;
      positions[1] = Math.random() - 0.5;
      positions[2] = Math.random() - 0.5;

      var geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      var color = tmpA.clone().lerp(tmpB, Math.random());
      var opacity = 0.5 + (Math.random() - 0.5) * 0.4;

      var mat = new THREE.LineBasicMaterial({
        color: color,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: opacity,
      });
      var line = new THREE.Line(geo, mat);
      line.frustumCulled = false;
      group.add(line);

      splines.push({ position: positions, geometry: geo, material: mat });
    }

    // ---- 后处理：EffectComposer + UnrealBloom + AlphaPass ----
    var rtW = w * 2, rtH = h * 2;
    var renderTarget = new THREE.WebGLRenderTarget(rtW, rtH, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      samples: 4,
    });
    var composer = new THREE.EffectComposer(renderer, renderTarget);
    var renderPass = new THREE.RenderPass(scene, camera);
    renderPass.clearAlpha = 0;
    composer.addPass(renderPass);

    var bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(w * window.devicePixelRatio, h * window.devicePixelRatio),
      1,    // strength
      0.25, // radius
      0     // threshold
    );
    composer.addPass(bloomPass);

    // AlphaPass：把 bloom 的 RGB 转为 alpha，让无光区域透明
    var alphaPass = new THREE.ShaderPass(ALPHA_SHADER);
    alphaPass.renderToScreen = true;
    composer.addPass(alphaPass);

    // ---- Aizawa 步进积分 ----
    function stepSegment(pos) {
      var p = PARAMS;
      var epsScaled = p.epsilon / CA;
      var x = pos[0], y = pos[1], z = pos[2];
      var dx = OC * ((z - p.beta) * x - p.delta * y);
      var dy = OC * (p.delta * x + (z - p.beta) * y);
      var dz = OC * (p.gamma + p.alpha * z - (z * z * z) / 3 - (x * x + y * y) * (1 + epsScaled * z) + p.zeta * z * x * x * x);
      pos.copyWithin(3, 0, FLOATS_PER_SEG - 3);
      pos[0] = x + dx;
      pos[1] = y + dy;
      pos[2] = z + dz;
    }

    // ---- 预热 1200 帧 ----
    for (var warm = 0; warm < 1200; warm++) {
      for (var wi = 0; wi < splines.length; wi++) {
        stepSegment(splines[wi].position);
      }
    }

    // ---- 相机运镜 ----
    var camKeyIdx = 0;
    var camProgress = 0;
    var camTarget = new THREE.Vector3();

    function updateCamera() {
      var key = CAM_KEYS[camKeyIdx];
      camProgress += 1 / key.dur;
      if (camProgress >= 1) {
        camProgress = 0;
        camKeyIdx = (camKeyIdx + 1) % CAM_KEYS.length;
        key = CAM_KEYS[camKeyIdx];
      }
      var t = camProgress;
      var eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      camera.position.set(
        lerp(key.sPos[0], key.dPos[0], eased),
        lerp(key.sPos[1], key.dPos[1], eased),
        lerp(key.sPos[2], key.dPos[2], eased)
      );
      camTarget.set(
        lerp(key.sTgt[0], key.dTgt[0], eased),
        lerp(key.sTgt[1], key.dTgt[1], eased),
        lerp(key.sTgt[2], key.dTgt[2], eased)
      );
      camera.lookAt(camTarget);
    }

    // ---- 动画 ----
    function animate() {
      requestAnimationFrame(animate);
      for (var i = 0; i < splines.length; i++) {
        stepSegment(splines[i].position);
        var newAttr = new THREE.BufferAttribute(splines[i].position, 3);
        splines[i].geometry.setAttribute("position", newAttr);
      }
      updateCamera();
      composer.render();
    }
    animate();

    // ---- 响应窗口大小 ----
    window.addEventListener("resize", function () {
      var nw = window.innerWidth, nh = window.innerHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      composer.setSize(nw, nh);
    });

    // ---- 主题切换 ----
    if (window.site && window.site.theme) {
      window.site.theme.subscribe(function (mode) {
        var dark = mode === "dark";
        colorA = dark ? DARK_A : LIGHT_A;
        colorB = dark ? DARK_B : LIGHT_B;
        tmpA.setHex(colorA);
        tmpB.setHex(colorB);
        for (var i = 0; i < splines.length; i++) {
          splines[i].material.color.copy(tmpA).lerp(tmpB, Math.random());
        }
      });
    }
  }

  function run() {
    var el = document.getElementById("hero");
    if (!el) return;
    if (!document.querySelector(".home-page")) { el.style.display = "none"; return; }
    el.style.display = "";
    if (!el.querySelector("canvas") && window.WebGLRenderingContext) {
      loadScripts(SCRIPTS, function (err) {
        if (err || !window.THREE || !window.THREE.EffectComposer) return;
        start(el);
      });
    }
  }

  if (window.site && window.site.onPageReady) {
    window.site.onPageReady(run);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();
