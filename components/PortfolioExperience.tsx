'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { Project } from '@/data/projects';

const IntelligenceCore = dynamic(() => import('./IntelligenceCore'), { ssr: false });

export default function PortfolioExperience({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let cleanupLenis: (() => void) | undefined;
    let contextCleanup: (() => void) | undefined;
    const interactionCleanup: Array<() => void> = [];

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapModule, triggerModule]) => {
      if (cancelled) return;
      const gsap = gsapModule.default;
      const ScrollTrigger = triggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const coarse = matchMedia('(pointer: coarse)').matches;
      const context = gsap.context(() => {
        if (!reduced) {
          gsap.set('#hero-title', { xPercent: 0, yPercent: 0, scale: 1, opacity: 1 });
          gsap.set('.hero-line', { xPercent: 0 });
          gsap.set('.hero-kicker,.hero-intro,.hero-actions,.scroll-cue', { opacity: 1, y: 0 });
          gsap.set('.core-motion', { x: 0, y: 0, xPercent: 0, yPercent: 0, scale: 1, rotation: 0, opacity: 1 });

          gsap.timeline({
            scrollTrigger: { trigger: '.hero-stage', start: 'top top', end: () => `+=${window.innerHeight * .92}`, scrub: 1.05, pin: true, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true }
          })
            .fromTo('#hero-title', { xPercent: 0, yPercent: 0, scale: 1 }, { xPercent: -9, yPercent: -7, scale: .94, duration: 1, ease: 'none', immediateRender: true }, 0)
            .fromTo('.hero-line:nth-child(odd)', { xPercent: 0 }, { xPercent: -5, duration: 1, ease: 'none', immediateRender: true }, 0)
            .fromTo('.hero-line:nth-child(even)', { xPercent: 0 }, { xPercent: 3, duration: 1, ease: 'none', immediateRender: true }, 0)
            .fromTo('#hero-title', { opacity: 1 }, { opacity: .12, duration: .48, ease: 'power2.in', immediateRender: true }, .52)
            .fromTo('.hero-kicker,.hero-intro,.hero-actions,.scroll-cue', { opacity: 1, y: 0 }, { opacity: 0, y: -18, duration: .88, ease: 'power2.in', immediateRender: true }, .12)
            .fromTo('.core-motion', { x: 0, y: 0, xPercent: 0, yPercent: 0, scale: 1, rotation: 0, opacity: 1 }, { xPercent: 42, yPercent: 12, scale: .56, rotation: 20, opacity: .28, duration: 1, ease: 'power2.inOut', immediateRender: true }, 0);

          gsap.utils.toArray<HTMLElement>('.point-line > span').forEach((line, index) => {
            const depth = [{ yPercent: 38, xPercent: -7, scale: .9 }, { yPercent: 28, xPercent: 8, scale: 1.08 }, { yPercent: 44, xPercent: -3, scale: .94 }][index];
            gsap.from(line, { ...depth, rotate: index === 1 ? 1.2 : -.8, duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: line, start: 'top 92%', end: 'top 48%', scrub: .72 } });
          });

          gsap.utils.toArray<HTMLElement>('.work-head h2,.about-title h2,.cap-intro h2,.process header h2,.contact h2').forEach((el) => {
            gsap.from(el, { yPercent: 16, rotate: 1.2, duration: 1.05, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 87%' } });
          });
        }

        const media = gsap.matchMedia();
        media.add('(min-width: 901px)', () => {
          const pin = document.querySelector<HTMLElement>('.project-pin');
          const rail = document.querySelector<HTMLElement>('.project-rail');
          if (!pin || !rail) return;
          const distance = () => Math.max(0, rail.scrollWidth - innerWidth + innerWidth * .08);
          const tween = gsap.to(rail, {
            x: () => -distance(), ease: 'none',
            scrollTrigger: { trigger: pin, start: 'top top', end: () => `+=${distance() * 1.08}`, scrub: .78, pin: true, invalidateOnRefresh: true }
          });
          const sceneTriggers = gsap.utils.toArray<HTMLElement>('.project-panel').flatMap(panel => {
            const image = panel.querySelector('.project-image');
            const title = panel.querySelector('.project-copy h3');
            const imageTween = image ? gsap.timeline({ scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
              .fromTo(image, { scale: .9, yPercent: 4 }, { scale: 1, yPercent: 0, duration: .5, ease: 'power2.out' })
              .to(image, { scale: .9, yPercent: -5, duration: .5, ease: 'power2.in' }) : null;
            const titleTween = title ? gsap.timeline({ scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
              .fromTo(title, { xPercent: 12, yPercent: 18 }, { xPercent: 0, yPercent: 0, duration: .5, ease: 'power3.out' })
              .to(title, { xPercent: -10, yPercent: -8, duration: .5, ease: 'power3.in' }) : null;
            return [imageTween, titleTween].filter(Boolean);
          });
          return () => { sceneTriggers.forEach(item => item?.kill()); tween.kill(); };
        });

        media.add('(max-width: 900px)', () => {
          if (reduced) return;
          const mobileScenes = gsap.utils.toArray<HTMLElement>('.project-panel').map(panel => {
            const visual = panel.querySelector('.project-visual');
            const image = panel.querySelector('.project-image');
            const title = panel.querySelector('.project-copy h3');
            const timeline = gsap.timeline({ scrollTrigger: { trigger: panel, start: 'top 88%', end: 'bottom 28%', scrub: .7 } });
            if (visual) timeline.fromTo(visual, { scale: .92, yPercent: 6 }, { scale: 1, yPercent: -4, duration: 1, ease: 'power2.out' }, 0);
            if (image) timeline.fromTo(image, { scale: 1.08 }, { scale: 1, duration: 1, ease: 'power2.out' }, 0);
            if (title) timeline.fromTo(title, { yPercent: 30, xPercent: 5 }, { yPercent: -6, xPercent: 0, duration: 1, ease: 'power3.out' }, 0);
            return timeline;
          });
          return () => mobileScenes.forEach(scene => scene.kill());
        });

        document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((element) => {
          const move = (event: PointerEvent) => {
            if (coarse || reduced) return;
            const rect = element.getBoundingClientRect();
            gsap.to(element, { x: (event.clientX - rect.left - rect.width / 2) * .16, y: (event.clientY - rect.top - rect.height / 2) * .16, duration: .25, overwrite: true });
          };
          const leave = () => gsap.to(element, { x: 0, y: 0, duration: .55, ease: 'elastic.out(1,.45)' });
          element.addEventListener('pointermove', move);
          element.addEventListener('pointerleave', leave);
          interactionCleanup.push(() => { element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', leave); });
        });

        document.querySelectorAll<HTMLElement>('.project-panel').forEach((panel) => {
          const image = panel.querySelector<HTMLElement>('.project-image');
          const title = panel.querySelector<HTMLElement>('.project-copy h3');
          const move = (event: PointerEvent) => {
            if (!image || coarse || reduced) return;
            const rect = panel.getBoundingClientRect();
            gsap.to(image, { x: ((event.clientX - rect.left) / rect.width - .5) * 18, y: ((event.clientY - rect.top) / rect.height - .5) * 12, scale: 1.025, duration: .5, overwrite: true });
            if (title) gsap.to(title, { x: ((event.clientX - rect.left) / rect.width - .5) * -10, duration: .55, overwrite: true });
          };
          const leave = () => {
            if (image) gsap.to(image, { x: 0, y: 0, scale: 1, duration: .65, ease: 'power3.out' });
            if (title) gsap.to(title, { x: 0, duration: .65, ease: 'power3.out' });
          };
          panel.addEventListener('pointermove', move);
          panel.addEventListener('pointerleave', leave);
          interactionCleanup.push(() => { panel.removeEventListener('pointermove', move); panel.removeEventListener('pointerleave', leave); });
        });

        const portrait = document.querySelector<HTMLElement>('.portrait');
        const portraitImage = portrait?.querySelector<HTMLElement>('img');
        const movePortrait = (event: PointerEvent) => {
          if (!portrait || !portraitImage || coarse || reduced) return;
          const rect = portrait.getBoundingClientRect();
          gsap.to(portraitImage, { x: ((event.clientX - rect.left) / rect.width - .5) * 22, y: ((event.clientY - rect.top) / rect.height - .5) * 14, rotate: ((event.clientX - rect.left) / rect.width - .5) * 1.2, duration: .65, overwrite: true });
        };
        const leavePortrait = () => portraitImage && gsap.to(portraitImage, { x: 0, y: 0, rotate: 0, duration: .8, ease: 'power3.out' });
        portrait?.addEventListener('pointermove', movePortrait);
        portrait?.addEventListener('pointerleave', leavePortrait);
        if (portrait) interactionCleanup.push(() => { portrait.removeEventListener('pointermove', movePortrait); portrait.removeEventListener('pointerleave', leavePortrait); });
      }, root);

      let refreshTimer = 0;
      const scheduleRefresh = () => {
        clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(() => { if (!cancelled) ScrollTrigger.refresh(); }, 80);
      };
      const hero = root.current?.querySelector<HTMLElement>('.hero-stage');
      const core = root.current?.querySelector<HTMLElement>('.core-shell');
      const resizeObserver = new ResizeObserver(scheduleRefresh);
      if (hero) resizeObserver.observe(hero);
      if (core) resizeObserver.observe(core);
      const canvasObserver = new MutationObserver(scheduleRefresh);
      if (core) canvasObserver.observe(core, { childList: true, subtree: true });
      const pendingImages = Array.from(root.current?.querySelectorAll('img') ?? []).filter(image => !image.complete);
      pendingImages.forEach(image => image.addEventListener('load', scheduleRefresh, { once: true }));
      addEventListener('load', scheduleRefresh, { once: true });
      document.fonts.ready.then(() => { if (!cancelled) scheduleRefresh(); });
      scheduleRefresh();

      contextCleanup = () => {
        clearTimeout(refreshTimer);
        resizeObserver.disconnect();
        canvasObserver.disconnect();
        pendingImages.forEach(image => image.removeEventListener('load', scheduleRefresh));
        removeEventListener('load', scheduleRefresh);
        interactionCleanup.splice(0).forEach(cleanup => cleanup());
        context.revert();
      };

      if (!reduced && !coarse) {
        import('lenis').then(({ default: Lenis }) => {
          if (cancelled) return;
          const lenis = new Lenis({ lerp: .075, smoothWheel: true, anchors: true });
          lenis.on('scroll', ScrollTrigger.update);
          const update = (time: number) => lenis.raf(time * 1000);
          gsap.ticker.add(update); gsap.ticker.lagSmoothing(0);
          cleanupLenis = () => { gsap.ticker.remove(update); lenis.destroy(); };
        });
      }
    });

    const cursor = document.querySelector<HTMLElement>('.cursor');
    const cursorText = cursor?.querySelector<HTMLElement>('span');
    const moveCursor = (event: PointerEvent) => {
      if (!cursor) return;
      cursor.style.setProperty('--x', `${event.clientX}px`);
      cursor.style.setProperty('--y', `${event.clientY}px`);
      cursor.classList.add('visible');
    };
    const enter = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      cursor?.classList.add('active');
      if (cursorText) cursorText.textContent = target.dataset.cursor || '';
      cursor?.classList.toggle('labelled', Boolean(target.dataset.cursor));
    };
    const leave = () => { cursor?.classList.remove('active', 'labelled'); if (cursorText) cursorText.textContent = ''; };
    addEventListener('pointermove', moveCursor);
    document.querySelectorAll<HTMLElement>('a,button,[data-cursor]').forEach(el => { el.addEventListener('pointerenter', enter); el.addEventListener('pointerleave', leave); });
    const onScroll = () => document.querySelector('.site-header')?.classList.toggle('scrolled', scrollY > 40);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    return () => {
      cancelled = true;
      cleanupLenis?.(); contextCleanup?.(); removeEventListener('pointermove', moveCursor); removeEventListener('scroll', onScroll);
      document.querySelectorAll<HTMLElement>('a,button,[data-cursor]').forEach(el => { el.removeEventListener('pointerenter', enter); el.removeEventListener('pointerleave', leave); });
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  return <div ref={root} className="site-root">
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="grain" aria-hidden="true" />
    <div className="cursor" aria-hidden="true"><span /></div>
    <header className="site-header">
      <a className="identity" href="#main" aria-label="Ammar Bin Yasir, home"><b>ABY</b><span>AI AUTOMATION<br />ENGINEER</span></a>
      <nav aria-label="Primary navigation"><a href="#work">Work</a><a href="#about">About</a><a href="#capabilities">Capabilities</a><a href="#contact">Contact</a></nav>
      <a className="availability" href="#contact"><i /> Available for select projects</a>
      <button className="menu-button" aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}><span>{menuOpen ? 'Close' : 'Menu'}</span><i /><i /></button>
    </header>
    <div id="mobile-nav" className="mobile-nav" aria-hidden={!menuOpen}>
      <nav><a href="#work" onClick={() => setMenuOpen(false)}>Work <small>01</small></a><a href="#about" onClick={() => setMenuOpen(false)}>About <small>02</small></a><a href="#capabilities" onClick={() => setMenuOpen(false)}>Capabilities <small>03</small></a><a href="#contact" onClick={() => setMenuOpen(false)}>Contact <small>04</small></a></nav>
    </div>

    <main id="main">
      <section className="hero-story" aria-labelledby="hero-title">
        <div className="hero hero-stage">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-aperture" aria-hidden="true" />
          <div className="hero-copy">
            <p className="hero-kicker"><i /> Ammar Bin Yasir · Pakistan / Remote</p>
            <h1 id="hero-title"><span className="hero-line"><span>I BUILD</span></span><span className="hero-line"><span>SYSTEMS</span></span><span className="hero-line stroke-line"><span>THAT THINK,</span></span><span className="hero-line"><span>FLOW &amp; SHIP.</span></span></h1>
            <p className="hero-intro">AI automation engineer turning operational friction into intelligent agents, connected workflows, and full-stack products people can actually use.</p>
            <div className="hero-actions"><a className="button button-light" data-magnetic href="#work">Explore selected work <b>↓</b></a><a className="text-link" href="https://github.com/AmmarBinYasir489" target="_blank" rel="noreferrer">GitHub / 489 ↗</a></div>
          </div>
          <div className="core-shell"><div className="core-motion"><IntelligenceCore /></div></div>
          <dl className="hero-meta"><div><dt>Focus</dt><dd>Agents · Workflows</dd></div><div><dt>Build</dt><dd>LLM · Full-stack · API</dd></div><div><dt>Status</dt><dd>Open to work</dd></div></dl>
          <div className="scroll-cue" aria-hidden="true"><span>Scroll to enter</span><i /></div>
        </div>
      </section>

      <section className="point section-pad" aria-labelledby="point-title">
        <p className="section-index">01 / Point of view</p>
        <div data-reveal><p className="overline">Less theatre. More leverage.</p><h2 id="point-title"><span className="point-line"><span>INTELLIGENCE</span></span><span className="point-line"><span>IS ONLY USEFUL</span></span><span className="point-line"><span><em>WHEN IT MOVES.</em></span></span></h2></div>
        <p className="point-copy" data-reveal>I connect the model to the workflow, the workflow to a clear interface, and the interface to a production system. The result is less busywork and more momentum.</p>
      </section>

      <section id="work" className="work" aria-labelledby="work-title">
        <header className="work-head section-pad"><p className="section-index">02 / Selected work</p><div data-reveal><p className="overline">Project archive · {String(projects.length).padStart(2, '0')} builds</p><h2 id="work-title">BUILT TO<br /><em>MOVE.</em></h2></div><p data-reveal>Real products and experiments designed around a workflow—not a demo prompt.</p></header>
        <div className="project-pin">
          <div className="project-rail">
            {projects.map((project) => <article className="project-panel" key={project.number} data-cursor="VIEW PROJECT">
              <div className="project-visual"><Image className="project-image" src={project.image} fill sizes="(max-width: 900px) 100vw, 68vw" alt={`${project.name} interface preview`} /></div>
              <div className="project-copy"><div className="project-top"><span>{project.number} / {String(projects.length).padStart(2, '0')}</span><span>{project.kind}</span></div><div><p className="sequence">{project.sequence}</p><h3>{project.name}</h3><p>{project.description}</p><small>{project.stack}</small></div><div className="project-story"><b>System story</b><p>{project.story}</p></div>{project.href ? <a className="project-link" href={project.href} target="_blank" rel="noreferrer" aria-label={`View ${project.name} on GitHub`}>View on GitHub ↗</a> : <span className="project-link muted">Private case study</span>}</div>
            </article>)}
            <div className="project-end"><p>08 / Archive end</p><h3>MORE SYSTEMS<br />IN MOTION.</h3><a href="https://github.com/AmmarBinYasir489" target="_blank" rel="noreferrer">Open GitHub ↗</a></div>
          </div>
        </div>
      </section>

      <section id="about" className="about section-pad" aria-labelledby="about-title">
        <p className="section-index">03 / About</p><div className="about-title" data-reveal><p className="overline">Behind the systems</p><h2 id="about-title">ENGINEER.<br /><em>BUILDER.</em><br />CURIOUS HUMAN.</h2></div>
        <figure className="portrait" data-reveal data-cursor="EXPLORE"><div className="portrait-number" aria-hidden="true">ABY</div><Image src="/ammar-portrait-cutout.png" fill sizes="(max-width: 900px) 90vw, 38vw" alt="Portrait of Ammar Bin Yasir" /><figcaption><span>Ammar Bin Yasir</span><span>Pakistan / Remote</span></figcaption></figure>
        <div className="about-copy" data-reveal><p>I work across the complete product journey—from mapping an operational problem to engineering the AI layer, interface, integrations, and deployment.</p><p>My practice is intentionally broader than one AI pattern: agents, automation, APIs, full-stack products, web development, WordPress, and technical SEO where the product needs them.</p><dl><div><dt>Discipline</dt><dd>AI Engineering</dd></div><div><dt>Mode</dt><dd>Build → Test → Refine</dd></div><div><dt>Location</dt><dd>Pakistan / Remote</dd></div></dl></div>
      </section>

      <section id="capabilities" className="capabilities section-pad" aria-labelledby="cap-title">
        <p className="section-index">04 / Technology</p><div className="cap-intro" data-reveal><p className="overline">A connected practice</p><h2 id="cap-title">TOOLS ARE<br />PART OF THE<br /><em>SYSTEM.</em></h2><p>I choose the stack around the job. The constant is a clean connection between intelligence, automation, interface, and infrastructure.</p></div>
        <div className="cap-list" data-reveal>
          <svg viewBox="0 0 1000 720" preserveAspectRatio="none" aria-hidden="true"><path d="M500 360L175 130M500 360L760 105M500 360L820 390M500 360L650 640M500 360L165 590" /></svg>
          <div className="cap-core" aria-hidden="true"><i /><i /><i /></div>
          {[['01','Intelligence','OpenAI · Gemini · RAG'],['02','Automation','n8n · APIs · Agent workflows'],['03','Engineering','Python · FastAPI · TypeScript'],['04','Product','Next.js · React · Tailwind'],['05','Data','Supabase · PostgreSQL']].map(item => <div className="cap-node" key={item[0]} data-cursor="EXPLORE"><span>{item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p><i aria-hidden="true">↗</i></div>)}
        </div>
      </section>

      <section className="process section-pad" aria-labelledby="process-title"><p className="section-index">05 / Engineering process</p><header data-reveal><p className="overline">From friction to flow</p><h2 id="process-title">MAKE THE<br />COMPLEX<br /><em>OPERABLE.</em></h2></header><ol>{[['01','Discover','Map the real workflow and expose the actual constraint.'],['02','Architect','Design the smallest useful system around the people using it.'],['03','Engineer','Build the intelligence, interface, integrations, and observability.'],['04','Evolve','Measure real behavior, refine the loop, and remove new friction.']].map(step => <li key={step[0]} data-reveal><span>{step[0]}</span><div><small>{step[1]}</small><h3>{step[2]}</h3></div></li>)}</ol></section>

      <section id="contact" className="contact section-pad" aria-labelledby="contact-title"><div className="contact-orbit" aria-hidden="true"><i /><i /></div><p className="section-index">06 / Contact</p><div className="contact-copy" data-reveal><p className="overline"><i /> Available for select projects · Pakistan / Remote</p><h2 id="contact-title">LET&apos;S MAKE<br />IT <em>FLOW.</em></h2><p>If you’re building an AI product, untangling a workflow, or exploring an open-source collaboration, I’d like to hear about it.</p><div className="contact-actions"><a className="button button-light" data-magnetic href="mailto:ammarbinyasir4899@gmail.com">Email Ammar <b>↗</b></a><a className="button button-outline" data-magnetic href="tel:+923404844291">Call +92 340 4844291 <b>↗</b></a></div></div><div className="contact-details"><a href="mailto:ammarbinyasir4899@gmail.com"><small>Email</small><span>ammarbinyasir4899@gmail.com</span></a><a href="tel:+923404844291"><small>Phone</small><span>+92 340 4844291</span></a><a href="https://github.com/AmmarBinYasir489" target="_blank" rel="noreferrer"><small>GitHub</small><span>@AmmarBinYasir489 ↗</span></a></div></section>
    </main>
    <footer><span>© {new Date().getFullYear()} Ammar Bin Yasir</span><span>AI Automation Engineer</span><a href="#main">Return to top ↑</a></footer>
  </div>;
}
