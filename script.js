/* script.js - modern portfolio interactions (vanilla ES6+)

  Features:
  - Typewriter effect in hero
  - Smooth scrolling for navigation
  - Active section highlighting with IntersectionObserver
  - Project filtering by category
  - Skill filtering & simple interactive pills
  - Contact form validation with toast feedback
  - Theme & accent toggling saved to localStorage
  - Back-to-top button

  Customize: edit the arrays of "titles" for the typewriter, and update links in index.html.
*/

// ---------- Helpers
const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

// ---------- DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  // set current year in footer
  qs('#year').textContent = new Date().getFullYear();

  // Initialize UI pieces
  initTypewriter();
  initSmoothScroll();
  initActiveNavObserver();
  initProjectFilters();
  initSkillFilters();
  initContactForm();
  initThemeSwitcher();
  initMobileMenu();
  initBackToTop();
});

// ---------- Typewriter
function initTypewriter(){
  const el = qs('#typewriter');
  const titles = ['Computer Science Student', 'Web Developer', 'Problem Solver']; // customize here
  const typingSpeed = 80; // ms per char
  const pause = 1500; // pause after each title
  let idx = 0, pos = 0, deleting = false;

  function step(){
    const current = titles[idx];
    if(!deleting){
      pos++;
      el.textContent = current.slice(0,pos);
      if(pos === current.length){
        deleting = true;
        setTimeout(step, pause);
        return;
      }
    } else {
      pos--;
      el.textContent = current.slice(0,pos);
      if(pos === 0){
        deleting = false;
        idx = (idx+1) % titles.length;
      }
    }
    setTimeout(step, deleting ? typingSpeed / 2 : typingSpeed);
  }
  step();
}

// ---------- Smooth scrolling
function initSmoothScroll(){
  // Attach to header nav and mobile nav
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    const href = a.getAttribute('href');
    if(href === '#' || href === '#!') return;
    a.addEventListener('click', e => {
      // allow normal link for external targets
      if(a.host !== window.location.host) return;
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({behavior:'smooth', block:'start'});
      // close mobile nav if open
      const mobileNav = qs('#mobile-nav');
      const menuToggle = qs('#menu-toggle');
      if(mobileNav && mobileNav.classList.contains('open')){
        mobileNav.classList.remove('open');
        mobileNav.setAttribute('aria-hidden', 'true');
        menuToggle?.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

// ---------- Active nav using IntersectionObserver
function initActiveNavObserver(){
  const sections = qsa('main section[id]');
  const navLinks = qsa('.nav-links a');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const navLink = navLinks.find(l => l.getAttribute('href') === `#${id}`);
      if(entry.isIntersecting){
        navLinks.forEach(n => n.classList.remove('active'));
        navLink?.classList.add('active');
      }
    });
  }, {threshold: 0.45});

  sections.forEach(s => observer.observe(s));
}

// ---------- Project Filtering
function initProjectFilters(){
  const filters = qsa('.proj-filter');
  const projectsGrid = qs('#projects-grid');
  const projects = qsa('.project');

  function applyFilter(cat){
    projects.forEach(p => {
      const pc = p.dataset.category;
      if(cat === 'all' || pc === cat){
        p.style.display = '';
        // small micro-interaction
        p.animate([{opacity:0, transform:'translateY(8px)'},{opacity:1, transform:'none'}], {duration:300, easing:'ease'});
      } else {
        p.style.display = 'none';
      }
    });
  }

  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  }));
}

// ---------- Skill Filtering & Interactivity
function initSkillFilters(){
  const filters = qsa('.skill-filters .filter');
  const skills = qsa('.skill');

  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    skills.forEach(s => {
      const cat = s.dataset.category;
      if(filter === 'all' || filter === cat) s.style.display = '';
      else s.style.display = 'none';
    });
  }));

  // show proficiency on hover (simple tooltip behaviour)
  skills.forEach(s => {
    s.addEventListener('mouseenter', () => {
      const lvl = s.dataset.level || 0;
      s.title = `Proficiency: ${lvl}%`;
    });
  });
}

// ---------- Contact form
function initContactForm(){
  const form = qs('#contact-form');
  const toast = qs('#toast');

  form.addEventListener('submit', e => {
    e.preventDefault();
    // Basic validation
    const name = qs('#name').value.trim();
    const email = qs('#email').value.trim();
    const message = qs('#message').value.trim();
    if(!name || !email || !message){
      showToast('Please fill out all fields.');
      return;
    }
    // Simple email pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailPattern.test(email)){
      showToast('Please provide a valid email address.');
      return;
    }

    const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:NiranjanVignesh6363@gmail.com?subject=${subject}&body=${body}`;
    showToast('Opening your email app...');
  });

  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'), 3500);
  }
}

// ---------- Theme & Accent toggler
function initThemeSwitcher(){
  const btn = qs('#theme-toggle');
  const root = document.documentElement;
  const body = document.body;

  // Load from localStorage
  const saved = JSON.parse(localStorage.getItem('site:theme')) || {mode: 'dark', accent: 'cyan'};
  applyTheme(saved);

  btn.addEventListener('click', () => {
    const current = JSON.parse(localStorage.getItem('site:theme')) || {mode:'dark', accent:'cyan'};
    // toggle mode and accent for a bit of flair
    const next = {
      mode: current.mode === 'dark' ? 'light' : 'dark',
      accent: current.accent === 'cyan' ? 'violet' : 'cyan'
    };
    applyTheme(next);
    localStorage.setItem('site:theme', JSON.stringify(next));
    showAccentPulse(next.accent);
  });

  function applyTheme({mode, accent}){
    if(mode === 'light') body.classList.add('light'); else body.classList.remove('light');
    if(accent === 'cyan'){
      root.style.setProperty('--accent','#37d6d0');
      root.style.setProperty('--accent-2','#ff8066');
      root.style.setProperty('--accent-3','#d8f36b');
    } else {
      root.style.setProperty('--accent','#ff8066');
      root.style.setProperty('--accent-2','#d8f36b');
      root.style.setProperty('--accent-3','#37d6d0');
    }
  }

  function showAccentPulse(accent){
    // small visual feedback on the button
    btn.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:420,easing:'cubic-bezier(.2,.9,.2,1)'});
  }
}

// ---------- Mobile menu
function initMobileMenu(){
  const toggle = qs('#menu-toggle');
  const mobileNav = qs('#mobile-nav');
  toggle?.addEventListener('click', ()=> {
    const isOpen = mobileNav?.classList.toggle('open') ?? false;
    toggle.setAttribute('aria-expanded', String(isOpen));
    mobileNav?.setAttribute('aria-hidden', String(!isOpen));
  });
}

// ---------- Back to top
function initBackToTop(){
  const btn = qs('#back-to-top');
  btn.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));

  // show/hide button based on scroll
  window.addEventListener('scroll', ()=>{
    if(window.scrollY > 400) btn.style.opacity = 1; else btn.style.opacity = 0.3;
  });
}

/* End of script.js */