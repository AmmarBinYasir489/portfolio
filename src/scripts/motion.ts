import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

export function initMotion() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  initFlowField(reduced);
  initAmbientWorld(reduced);
  initSpatialInteractions(reduced);
  const boot = document.querySelector<HTMLElement>('#boot');
  const bar = boot?.querySelector<HTMLElement>('div i');
  const count = document.querySelector<HTMLElement>('#count');
  let progress = 0;

  const loading = window.setInterval(() => {
    progress = Math.min(progress + 11 + Math.random() * 17, 100);
    if (bar) bar.style.width = `${progress}%`;
    if (count) count.textContent = String(Math.floor(progress)).padStart(3, '0');
    if (progress >= 100) {
      window.clearInterval(loading);
      window.setTimeout(() => boot?.classList.add('done'), 180);
    }
  }, 38);

  if (!reduced) {
    const lenis = new Lenis({ duration: 1.02, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const intro = gsap.timeline({ delay: .22 });
  intro.from('.hero .eyebrow', { y: 22, opacity: 0 })
    .from('.hero h1 span', { yPercent: 110, opacity: 0, stagger: .08, duration: .9, ease: 'power4.out' }, '<')
    .from('.intro,.actions,.hero aside', { y: 24, opacity: 0, stagger: .08 }, '-=.45')
    .from('#flow-field,.core-reticle', { opacity: 0, scale: .86, duration: 1.1, ease: 'expo.out' }, '-=.7')
    .from('.core-hud,.depth-word', { y: 18, opacity: 0, stagger: .08, duration: .65, ease: 'power3.out' }, '-=.65');

  gsap.utils.toArray<HTMLElement>('.section-head,.profile-grid,.stack>div:first-child').forEach(element => {
    gsap.from(element, { scrollTrigger: { trigger: element, start: 'top 88%' }, y: 55, opacity: 0, duration: .85, ease: 'power3.out' });
  });
  gsap.utils.toArray<HTMLElement>('.manifesto h2').forEach((element, index) => {
    gsap.fromTo(element, { x: index ? -160 : 160 }, { x: 0, scrollTrigger: { trigger: element, start: 'top 90%', end: 'top 42%', scrub: 1 } });
  });

  const projectCursor = document.querySelector<HTMLElement>('#project-cursor');
  const projects = gsap.utils.toArray<HTMLElement>('.project');
  projects.forEach((card, index) => {
    const image = card.querySelector<HTMLImageElement>('.visual img');
    gsap.fromTo(card, { clipPath: 'inset(0 0 18% 0)' }, {
      clipPath: 'inset(0 0 0% 0)',
      scrollTrigger: { trigger: card, start: 'top 92%', end: 'top 58%', scrub: .7 }
    });
    if (image) gsap.fromTo(image, { scale: 1.13 }, { scale: 1, scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
    gsap.to(card, {
      scale: .955,
      opacity: .62,
      scrollTrigger: { trigger: card, start: 'bottom 24%', end: 'bottom top', scrub: true }
    });
    ScrollTrigger.create({
      trigger: card,
      start: 'top 48%',
      end: 'bottom 48%',
      onToggle: self => {
        card.classList.toggle('is-active', self.isActive);
        document.querySelectorAll('.project-dock a').forEach((link, linkIndex) => link.classList.toggle('active', self.isActive && linkIndex === index));
      }
    });
    card.addEventListener('pointerenter', () => projectCursor?.classList.add('show'));
    card.addEventListener('pointerleave', () => {
      projectCursor?.classList.remove('show');
      if (image) gsap.to(image, { x: 0, y: 0, duration: .6, ease: 'power3.out' });
    });
    card.addEventListener('pointermove', event => {
      if (projectCursor) gsap.to(projectCursor, { x: event.clientX, y: event.clientY, duration: .16, overwrite: true });
      if (image) {
        const rect = card.getBoundingClientRect();
        gsap.to(image, { x: ((event.clientX - rect.left) / rect.width - .5) * 18, y: ((event.clientY - rect.top) / rect.height - .5) * 12, duration: .5, ease: 'power2.out' });
      }
    });
  });

  const cursor = document.querySelector<HTMLElement>('#cursor');
  addEventListener('pointermove', event => {
    if (cursor) {
      cursor.style.opacity = '1';
      gsap.to(cursor, { x: event.clientX, y: event.clientY, duration: .18 });
    }
  });

  document.querySelectorAll<HTMLButtonElement>('.detail-trigger').forEach(button => button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.dialog || '') as HTMLDialogElement | null;
    if (dialog && !dialog.open) dialog.showModal();
  }));
  document.querySelectorAll<HTMLDialogElement>('.project-dialog').forEach(dialog => {
    dialog.querySelector<HTMLButtonElement>('.dialog-close')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  });

  initMobileMenu();
}

function initMobileMenu() {
  const button = document.querySelector<HTMLButtonElement>('.menu-toggle');
  const menu = document.querySelector<HTMLElement>('#mobile-menu');
  if (!button || !menu) return;

  const setOpen = (open: boolean) => {
    button.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
  };

  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      button.focus();
    }
  });
  matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) setOpen(false); });
}

function initSpatialInteractions(reduced: boolean) {
  const scenes = Array.from(document.querySelectorAll<HTMLElement>('.scene'));
  const index = document.querySelector<HTMLElement>('#scene-index');
  const progress = document.querySelector<HTMLElement>('#scene-progress');
  const header = document.querySelector<HTMLElement>('header');

  const updateScrollUI = () => {
    const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
    const ratio = Math.min(scrollY / max, 1);
    if (progress) progress.style.height = `${ratio * 100}%`;
    header?.classList.toggle('compact', scrollY > 80);
  };
  addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();

  const sceneObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      scenes.forEach(scene => scene.classList.remove('is-current'));
      const scene = entry.target as HTMLElement;
      scene.classList.add('is-current');
      const sceneNumber = scenes.indexOf(scene) + 1;
      const sceneName = scene.dataset.scene || String(sceneNumber);
      if (index) index.textContent = String(sceneNumber).padStart(2, '0');
      document.body.dataset.scene = sceneName;
      document.querySelectorAll<HTMLAnchorElement>('.desktop-nav a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${scene.id}`);
      });
    });
  }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });
  scenes.forEach(scene => sceneObserver.observe(scene));

  if (reduced || matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach(surface => {
    surface.addEventListener('pointermove', event => {
      const rect = surface.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      surface.style.setProperty('--rx', `${-y * 7}deg`);
      surface.style.setProperty('--ry', `${x * 9}deg`);
      surface.style.setProperty('--tz', '8px');
    });
    surface.addEventListener('pointerleave', () => {
      surface.style.setProperty('--rx', '0deg');
      surface.style.setProperty('--ry', '0deg');
      surface.style.setProperty('--tz', '0px');
    });
  });

  document.querySelectorAll<HTMLElement>('.magnetic,.actions .cta,header nav a').forEach(element => {
    element.addEventListener('pointermove', event => {
      const rect = element.getBoundingClientRect();
      gsap.to(element, {
        x: (event.clientX - rect.left - rect.width / 2) * .18,
        y: (event.clientY - rect.top - rect.height / 2) * .18,
        duration: .3,
        ease: 'power2.out',
        overwrite: true,
      });
    });
    element.addEventListener('pointerleave', () => gsap.to(element, { x: 0, y: 0, duration: .55, ease: 'elastic.out(1,.4)' }));
  });

  gsap.to('.hero-copy', { yPercent: 18, opacity: .35, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
  gsap.fromTo('.profile figure img', { y: 100, scale: .9 }, { y: -35, scale: 1.06, scrollTrigger: { trigger: '.profile', start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
  gsap.fromTo('.bio', { y: 150 }, { y: -40, scrollTrigger: { trigger: '.profile', start: 'top bottom', end: 'bottom top', scrub: 1.15 } });
  gsap.fromTo('.constellation', { opacity: .2, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0px)', scrollTrigger: { trigger: '.stack', start: 'top 88%', end: 'center 55%', scrub: 1 } });
  gsap.utils.toArray<HTMLElement>('.process-corridor li').forEach(card => {
    gsap.from(card, {
      opacity: 0,
      clipPath: 'polygon(0 45%,92% 45%,100% 50%,100% 55%,0 55%)',
      scrollTrigger: { trigger: '.process-corridor', start: 'top 96%', end: 'top 72%', scrub: .65 },
    });
  });
  gsap.fromTo('.contact-copy', { y: 70, scale: .94, opacity: .58 }, { y: 0, scale: 1, opacity: 1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.contact-copy', start: 'top 82%', toggleActions: 'play none none reverse' } });
}

function initAmbientWorld(reduced: boolean) {
  const canvas = document.querySelector<HTMLCanvasElement>('#ambient-world');
  if (!canvas || !window.WebGLRenderingContext) return;

  try {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
    renderer.setClearColor(0x030303, 0);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030303, .09);
    const camera = new THREE.PerspectiveCamera(52, 1, .1, 60);
    camera.position.z = 9;

    const world = new THREE.Group();
    scene.add(world);
    const count = innerWidth < 760 ? 260 : 720;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const red = new THREE.Color(0x68e1d3);
    const white = new THREE.Color(0xf4f2ef);
    for (let i = 0; i < count; i++) {
      const radius = 2.5 + Math.random() * 11;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - .5) * 14;
      positions[i * 3 + 2] = Math.sin(angle) * radius - Math.random() * 8;
      const color = Math.random() > .86 ? white : red;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const particles = new THREE.Points(geometry, new THREE.PointsMaterial({ size: .028, transparent: true, opacity: .48, vertexColors: true, depthWrite: false }));
    world.add(particles);

    const structures = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(.5 + i * .13, 0),
        new THREE.MeshBasicMaterial({ color: i % 3 ? 0x68e1d3 : 0x2587ff, wireframe: true, transparent: true, opacity: .055 })
      );
      mesh.position.set((i % 2 ? 1 : -1) * (2.8 + i * .75), (i - 2.5) * 1.55, -2 - i * 1.8);
      mesh.rotation.set(i * .3, i * .5, i * .16);
      structures.add(mesh);
    }
    world.add(structures);

    const tunnel = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(3.2 + i * .24, .008, 3, 100),
        new THREE.MeshBasicMaterial({ color: 0x68e1d3, transparent: true, opacity: .06 })
      );
      ring.position.z = -i * 2.2;
      ring.rotation.x = .15 + i * .035;
      tunnel.add(ring);
    }
    world.add(tunnel);

    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let scrollTarget = 0;
    let scrollCurrent = 0;
    let frame = 0;
    let visible = true;

    const onPointer = (event: PointerEvent) => {
      targetX = event.clientX / innerWidth - .5;
      targetY = event.clientY / innerHeight - .5;
    };
    const onScroll = () => {
      const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
      scrollTarget = scrollY / max;
    };
    const resize = () => {
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    };
    addEventListener('pointermove', onPointer, { passive: true });
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => { visible = !document.hidden; });
    resize();
    onScroll();

    const clock = new THREE.Clock();
    const render = () => {
      const time = clock.getElapsedTime();
      if (!reduced) {
        pointerX += (targetX - pointerX) * .025;
        pointerY += (targetY - pointerY) * .025;
        scrollCurrent += (scrollTarget - scrollCurrent) * .035;
        world.rotation.y = time * .018 + pointerX * .14 + scrollCurrent * Math.PI * 1.35;
        world.rotation.x = pointerY * .08 + Math.sin(scrollCurrent * Math.PI * 2) * .08;
        particles.rotation.y = -time * .012;
        particles.position.y = Math.sin(time * .16) * .16;
        structures.children.forEach((object, i) => {
          object.rotation.x = time * (.025 + i * .002);
          object.rotation.y = time * (.018 + i * .003);
        });
        tunnel.position.z = (scrollCurrent * 8) % 2.2;
      }
      if (visible) renderer.render(scene, camera);
      if (!reduced) frame = requestAnimationFrame(render);
    };
    render();

    document.addEventListener('astro:before-swap', () => {
      cancelAnimationFrame(frame);
      removeEventListener('pointermove', onPointer);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', resize);
      renderer.dispose();
    }, { once: true });
  } catch (error) {
    console.warn('Ambient WebGL fallback active', error);
    canvas.remove();
  }
}

function initFlowField(reduced: boolean) {
  const canvas = document.querySelector<HTMLCanvasElement>('#flow-field');
  const host = canvas?.closest<HTMLElement>('.signal-composition');
  if (!canvas || !host || !window.WebGLRenderingContext) return;

  try {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030303, .075);
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 50);
    camera.position.set(0, .1, 9.6);

    const core = new THREE.Group();
    core.rotation.z = -.12;
    scene.add(core);

    // Layered geometry makes the core read as a physical system rather than a flat screensaver.
    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.62, 2),
      new THREE.MeshBasicMaterial({ color: 0xff2b2b, wireframe: true, transparent: true, opacity: .52 })
    );
    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.08, 1),
      new THREE.MeshBasicMaterial({ color: 0xff5a5a, wireframe: true, transparent: true, opacity: .28 })
    );
    core.add(shell, inner);

    const haloMaterial = new THREE.MeshBasicMaterial({ color: 0xff2b2b, wireframe: true, transparent: true, opacity: .3, side: THREE.DoubleSide });
    const halos = [
      new THREE.Mesh(new THREE.TorusGeometry(2.18, .012, 4, 150), haloMaterial.clone()),
      new THREE.Mesh(new THREE.TorusGeometry(2.72, .009, 4, 170), haloMaterial.clone()),
      new THREE.Mesh(new THREE.TorusGeometry(3.22, .007, 4, 190), haloMaterial.clone()),
    ];
    halos[0].rotation.set(1.16, .18, .25);
    halos[1].rotation.set(.35, 1.1, -.28);
    halos[2].rotation.set(1.48, .4, -.52);
    core.add(...halos);

    const nodeCount = innerWidth < 760 ? 80 : 150;
    const positions = new Float32Array(nodeCount * 3);
    const orbitData: Array<{ radius: number; phi: number; speed: number; tilt: number }> = [];
    for (let i = 0; i < nodeCount; i++) {
      const radius = 1.9 + Math.random() * 2.2;
      const phi = Math.random() * Math.PI * 2;
      const tilt = (Math.random() - .5) * 1.7;
      orbitData.push({ radius, phi, speed: .035 + Math.random() * .08, tilt });
      positions[i * 3] = Math.cos(phi) * radius;
      positions[i * 3 + 1] = Math.sin(phi) * radius * .52 + tilt;
      positions[i * 3 + 2] = Math.sin(phi * 1.7) * 1.1;
    }
    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const nodes = new THREE.Points(nodeGeometry, new THREE.PointsMaterial({ color: 0xff2020, size: innerWidth < 760 ? .045 : .055, transparent: true, opacity: .9, sizeAttenuation: true }));
    core.add(nodes);

    // Sparse neural links provide depth cues without obscuring the headline.
    const links: THREE.Line[] = [];
    for (let i = 0; i < 18; i++) {
      const a = i * 3;
      const b = ((i * 7) + 13) % nodeCount * 3;
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(positions[a], positions[a + 1], positions[a + 2]),
        new THREE.Vector3(positions[b], positions[b + 1], positions[b + 2]),
      ]);
      const link = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: i % 4 ? 0xff2b2b : 0x8f0000, transparent: true, opacity: .16 }));
      core.add(link);
      links.push(link);
    }

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: createGlowTexture(), color: 0xff0000, transparent: true, opacity: .5,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    glow.scale.set(5.3, 5.3, 1);
    core.add(glow);

    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let visible = true;
    let frame = 0;
    let baseX = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1), false);
      camera.aspect = Math.max(rect.width, 1) / Math.max(rect.height, 1);
      camera.position.z = rect.width < 760 ? 11.5 : 9.6;
      baseX = rect.width > 900 ? 2.45 : 0;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    host.addEventListener('pointermove', event => {
      const rect = host.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - .5) * 2;
      targetY = ((event.clientY - rect.top) / rect.height - .5) * 2;
    });
    host.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
    document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

    const clock = new THREE.Clock();
    const render = () => {
      const time = clock.getElapsedTime();
      if (!reduced) {
        pointerX += (targetX - pointerX) * .035;
        pointerY += (targetY - pointerY) * .035;

        shell.rotation.y = time * .12;
        shell.rotation.x = time * .07;
        inner.rotation.y = -time * .17;
        inner.rotation.z = time * .09;
        halos[0].rotation.z = time * .08;
        halos[1].rotation.z = -time * .055;
        halos[2].rotation.y = time * .04;
        core.rotation.y += (pointerX * .28 - core.rotation.y) * .045;
        core.rotation.x += (-pointerY * .18 - core.rotation.x) * .045;
        core.position.x += (baseX + pointerX * .32 - core.position.x) * .035;
        core.position.y += (-pointerY * .2 - core.position.y) * .035;

        const attr = nodeGeometry.getAttribute('position') as THREE.BufferAttribute;
        orbitData.forEach((node, i) => {
          const angle = node.phi + time * node.speed;
          attr.setXYZ(i, Math.cos(angle) * node.radius, Math.sin(angle) * node.radius * .52 + node.tilt, Math.sin(angle * 1.7) * 1.1);
        });
        attr.needsUpdate = true;
      }

      if (visible) renderer.render(scene, camera);
      if (!reduced) frame = requestAnimationFrame(render);
    };
    render();

    // Astro page transitions can replace the canvas; release the WebGL context when that happens.
    document.addEventListener('astro:before-swap', () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.dispose();
    }, { once: true });
  } catch (error) {
    console.warn('Spatial hero fallback active', error);
    canvas.remove();
  }
}

function createGlowTexture() {
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = 128;
  textureCanvas.height = 128;
  const context = textureCanvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,32,32,.95)');
    gradient.addColorStop(.2, 'rgba(255,43,43,.4)');
    gradient.addColorStop(1, 'rgba(143,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }
  return new THREE.CanvasTexture(textureCanvas);
}
