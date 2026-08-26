import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

export function initMotion() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  initFlowField(reduced);
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
    .from('.signal-composition>span', { xPercent: 70, opacity: 0, stagger: .08, duration: .8, ease: 'expo.out' }, '-=.7')
    .from('.signal-composition i', { scaleX: 0, stagger: .06, transformOrigin: 'left', ease: 'power3.out' }, '-=.55');

  gsap.utils.toArray<HTMLElement>('.section-head,.profile-grid,.stack>div,.process li').forEach(element => {
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
}

function initFlowField(reduced: boolean) {
  const canvas = document.querySelector<HTMLCanvasElement>('#flow-field');
  if (!canvas || innerWidth < 760 || !window.WebGLRenderingContext) return;
  try {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 30);
    camera.position.set(0, 0, 9);
    const field = new THREE.Group();
    scene.add(field);
    const ribbons: THREE.Line[] = [];

    for (let row = 0; row < 9; row++) {
      const points: THREE.Vector3[] = [];
      for (let index = 0; index < 120; index++) {
        const x = -5.5 + index / 119 * 11;
        const y = (row - 4) * .42 + Math.sin(x * 1.1 + row * .72) * .22;
        const z = Math.cos(x * .72 + row) * .4 - row * .045;
        points.push(new THREE.Vector3(x, y, z));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: row % 3 === 0 ? 0xffffff : 0xff1738, transparent: true, opacity: row % 3 === 0 ? .22 : .46 }));
      field.add(line); ribbons.push(line);
    }

    const nodePositions = new Float32Array(90 * 3);
    for (let index = 0; index < 90; index++) {
      nodePositions[index * 3] = -5.2 + Math.random() * 10.4;
      nodePositions[index * 3 + 1] = -2.2 + Math.random() * 4.4;
      nodePositions[index * 3 + 2] = -1 + Math.random() * 2;
    }
    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    field.add(new THREE.Points(nodeGeometry, new THREE.PointsMaterial({ color: 0xff1738, size: .045, transparent: true, opacity: .72 })));

    let pointerX = 0, pointerY = 0, visible = true;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1), false);
      camera.aspect = Math.max(rect.width, 1) / Math.max(rect.height, 1);
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(canvas); resize();
    canvas.closest('.signal-composition')?.addEventListener('pointermove', event => {
      const rect = canvas.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / rect.width - .5;
      pointerY = (event.clientY - rect.top) / rect.height - .5;
    });
    document.addEventListener('visibilitychange', () => visible = !document.hidden);
    const clock = new THREE.Clock();
    const render = () => {
      if (visible) {
        const time = clock.getElapsedTime();
        ribbons.forEach((line, index) => line.position.x = Math.sin(time * .22 + index) * .08);
        field.rotation.y += (pointerX * .12 - field.rotation.y) * .035;
        field.rotation.x += (-pointerY * .08 - field.rotation.x) * .035;
        renderer.render(scene, camera);
      }
      if (!reduced) requestAnimationFrame(render);
    };
    render();
  } catch (error) {
    console.warn('Flow field fallback active', error);
    canvas.remove();
  }
}
