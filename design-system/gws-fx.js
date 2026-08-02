/*!
 * GWS · Paisaje auditivo de la interfaz — gws-fx.js
 * ==================================================
 * Sonido 100% sintetizado en el navegador (Web Audio API). No hay archivos
 * de audio: cada efecto se genera con osciladores + ruido + filtros. Esto
 * mantiene el frontend autocontenido (funciona igual desde file://) y sin
 * assets que cachear.
 *
 * Correspondencia con el frente sonoro de la Orden de Operaciones (§3):
 *   click()  — cortavidrios profesional marcando la pieza ("zzzip").
 *   access() — corte perfecto de hoja de diamante sobre vidrio grueso
 *              (elevación TOTP, suscripción, acceso desbloqueado).
 *   error()  — tensión estructural previa a la ruptura (subtle, baja).
 *   whoosh() — transición entre secciones/Galaxias.
 *   tick()   — micro-tick de los contadores fundacionales.
 *
 * Reglas:
 *   · El AudioContext se crea/resume con la PRIMERA interacción del usuario
 *     (autoplay policy). Llamadas sin gesto quedan en silencio, sin ruido.
 *   · Volumen bajo por defecto y compresor suave: el sonido acompaña, no
 *     compite con el contenido (Tecnología Invisible, CLAUDE.md §2).
 *   · GWSEffects.enabled(false) lo silencia por completo.
 */
(function (global) {
  'use strict';

  var ctx = null;
  var master = null;
  var enabled = true;
  var lastTickAt = 0;

  function ensureCtx() {
    if (ctx) {
      if (ctx.state === 'suspended' && ctx.resume) {
        ctx.resume().catch(function () {});
      }
      return ctx;
    }
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.45;
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 22;
    comp.ratio.value = 6;
    comp.attack.value = 0.003;
    comp.release.value = 0.22;
    master.connect(comp);
    comp.connect(ctx.destination);
    return ctx;
  }

  function noiseBuffer(seconds) {
    var c = ctx;
    var buffer = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * seconds)), c.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  function gate(gain, t0, attack, peak, release) {
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + release);
  }

  /* ---- click(): cortavidrios marcando la pieza. Ruido blanco pasado por
   * un bandpass que barre hacia abajo ("zzzip") + un ping de cristal. */
  function click() {
    if (!enabled) return;
    var c = ensureCtx();
    if (!c) return;
    var t = c.currentTime;
    var dur = 0.085;

    var src = c.createBufferSource();
    src.buffer = noiseBuffer(dur);
    var bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 7;
    bp.frequency.setValueAtTime(5400, t);
    bp.frequency.exponentialRampToValueAtTime(2400, t + dur);
    var g = c.createGain();
    gate(g, t, 0.01, 0.16, dur);
    src.connect(bp);
    bp.connect(g);
    g.connect(master);
    src.start(t);
    src.stop(t + dur + 0.05);

    var ping = c.createOscillator();
    ping.type = 'sine';
    ping.frequency.setValueAtTime(6300, t);
    var pg = c.createGain();
    gate(pg, t, 0.003, 0.045, 0.05);
    ping.connect(pg);
    pg.connect(master);
    ping.start(t);
    ping.stop(t + 0.07);
  }

  /* ---- access(): corte de hoja de diamante. Gliss de aire hacia arriba
   * + un "ting" de vidrio grueso (dos parciales desafinados) + golpe sordo
   * de asiento. Confirma elevación/suscripción con contundencia. */
  function access() {
    if (!enabled) return;
    var c = ensureCtx();
    if (!c) return;
    var t = c.currentTime;

    var src = c.createBufferSource();
    src.buffer = noiseBuffer(0.4);
    var bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 3;
    bp.frequency.setValueAtTime(500, t);
    bp.frequency.exponentialRampToValueAtTime(3600, t + 0.3);
    var g = c.createGain();
    gate(g, t, 0.02, 0.12, 0.32);
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start(t); src.stop(t + 0.4);

    var gliss = c.createOscillator();
    gliss.type = 'sine';
    gliss.frequency.setValueAtTime(240, t);
    gliss.frequency.exponentialRampToValueAtTime(880, t + 0.28);
    var gg = c.createGain();
    gate(gg, t, 0.015, 0.09, 0.3);
    gliss.connect(gg); gg.connect(master);
    gliss.start(t); gliss.stop(t + 0.36);

    var ting1 = c.createOscillator();
    ting1.type = 'sine';
    ting1.frequency.value = 1180;
    var ting2 = c.createOscillator();
    ting2.type = 'sine';
    ting2.frequency.value = 1193;
    var tg = c.createGain();
    gate(tg, t + 0.05, 0.002, 0.05, 0.4);
    ting1.connect(tg); ting2.connect(tg); tg.connect(master);
    ting1.start(t + 0.05); ting1.stop(t + 0.5);
    ting2.start(t + 0.05); ting2.stop(t + 0.5);

    var thock = c.createOscillator();
    thock.type = 'sine';
    thock.frequency.setValueAtTime(190, t + 0.02);
    thock.frequency.exponentialRampToValueAtTime(120, t + 0.12);
    var thg = c.createGain();
    gate(thg, t + 0.02, 0.005, 0.1, 0.12);
    thock.connect(thg); thg.connect(master);
    thock.start(t + 0.02); thock.stop(t + 0.2);
  }

  /* ---- error(): tensión estructural. Triángulo grave con wobble de
   * frecuencia (la vibración previa a la ruptura) + crujido cristalino
   * tenue. Volumen bajo: es advertencia, no alarma. */
  function error() {
    if (!enabled) return;
    var c = ensureCtx();
    if (!c) return;
    var t = c.currentTime;

    var osc = c.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(62, t);
    osc.frequency.setValueAtTime(58, t + 0.12);
    osc.frequency.setValueAtTime(66, t + 0.24);
    osc.frequency.setValueAtTime(60, t + 0.36);
    var lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 240;
    var g = c.createGain();
    gate(g, t, 0.05, 0.06, 0.42);
    osc.connect(lp); lp.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + 0.55);

    var crackle = c.createBufferSource();
    crackle.buffer = noiseBuffer(0.18);
    var hp = c.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 3000;
    var cg = c.createGain();
    gate(cg, t + 0.08, 0.004, 0.02, 0.1);
    crackle.connect(hp); hp.connect(cg); cg.connect(master);
    crackle.start(t + 0.08); crackle.stop(t + 0.3);
  }

  /* ---- whoosh(): transición entre secciones/Galaxias. Barrido de aire
   * filtrando ruido de 400→2000Hz. Ligero y breve. */
  function whoosh() {
    if (!enabled) return;
    var c = ensureCtx();
    if (!c) return;
    var t = c.currentTime;

    var src = c.createBufferSource();
    src.buffer = noiseBuffer(0.35);
    var bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(400, t);
    bp.frequency.exponentialRampToValueAtTime(2200, t + 0.28);
    var g = c.createGain();
    gate(g, t, 0.06, 0.07, 0.3);
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start(t); src.stop(t + 0.38);
  }

  /* ---- tick(): micro-tick de contador. Blip sinusoidal corto y agudo.
   * Se auto-limita a 1 por 90ms para no saturar al actualizar varios. */
  function tick() {
    if (!enabled) return;
    var nowMs = Date.now();
    if (nowMs - lastTickAt < 90) return;
    lastTickAt = nowMs;
    var c = ensureCtx();
    if (!c) return;
    var t = c.currentTime;
    var osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1250, t);
    osc.frequency.exponentialRampToValueAtTime(1750, t + 0.02);
    var g = c.createGain();
    gate(g, t, 0.002, 0.03, 0.025);
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + 0.04);
  }

  var GWSEffects = {
    click: click,
    access: access,
    error: error,
    whoosh: whoosh,
    tick: tick,
    enabled: function (value) {
      if (value === undefined) return enabled;
      enabled = !!value;
    }
  };

  global.GWSEffects = GWSEffects;
})(typeof window !== 'undefined' ? window : this);
