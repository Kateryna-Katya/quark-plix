document.addEventListener('DOMContentLoaded', () => {

  // --- 1. CONFIG & UTILS ---
  const CONFIG = {
      scrollOffset: 90, // Высота хедера + отступ
  };

  // Инициализация иконок (Lucide)
  if (typeof lucide !== 'undefined') {
      lucide.createIcons();
  }

  // --- 2. HEADER & MOBILE MENU ---
  const burger = document.querySelector('.header__burger');
  const menu = document.querySelector('.header__menu');
  const header = document.querySelector('.header');

  if (burger && menu) {
      burger.addEventListener('click', () => {
          menu.classList.toggle('is-active');
          const isActive = menu.classList.contains('is-active');
          burger.style.color = isActive ? 'var(--color-primary)' : '#fff';
          document.body.style.overflow = isActive ? 'hidden' : '';
      });

      menu.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', () => {
              menu.classList.remove('is-active');
              burger.style.color = '#fff';
              document.body.style.overflow = '';
          });
      });
  }

  // Фон хедера при скролле
  const handleScroll = () => {
      if (window.scrollY > 50) {
          header.style.background = 'rgba(11, 13, 18, 0.95)';
      } else {
          header.style.background = 'rgba(11, 13, 18, 0.85)';
      }
  };
  window.addEventListener('scroll', handleScroll);

  // --- 3. SMOOTH SCROLL ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const targetId = this.getAttribute('href');
          if (targetId === '#') return;

          const target = document.querySelector(targetId);
          if (target) {
              const elementPosition = target.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - CONFIG.scrollOffset;

              window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth'
              });
          }
      });
  });

  // --- 4. FORM LOGIC & CAPTCHA (ИСПРАВЛЕНО) ---
  const form = document.getElementById('leadForm');

  // Ищем сообщение снаружи формы (более надежный поиск)
  const successMsg = document.querySelector('.success-message');

  if (form) {
      const phoneInput = document.getElementById('phone');
      const captchaLabel = document.getElementById('captchaLabel');
      const captchaInput = document.getElementById('captchaInput');
      const submitBtn = form.querySelector('button[type="submit"]');

      // Генерация капчи
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      const sum = num1 + num2;
      if(captchaLabel) captchaLabel.textContent = `Сколько будет ${num1} + ${num2}?`;

      // Валидация телефона
      if(phoneInput) {
          phoneInput.addEventListener('input', (e) => {
              const val = e.target.value;
              const isValid = /^[0-9\+\-\(\)\s]*$/.test(val);
              if (!isValid) phoneInput.parentElement.classList.add('error');
              else phoneInput.parentElement.classList.remove('error');
          });
      }

      // Обработка отправки
      form.addEventListener('submit', (e) => {
          e.preventDefault();

          // Проверка капчи
          if (parseInt(captchaInput.value) !== sum) {
              alert('Ошибка в математическом примере!');
              captchaInput.focus();
              return;
          }

          // Старт анимации загрузки
          submitBtn.classList.add('is-loading');
          submitBtn.disabled = true;

          // Имитация отправки (1.5 секунды)
          setTimeout(() => {
              submitBtn.classList.remove('is-loading');

              // 1. Скрываем форму
              form.style.display = 'none';

              // 2. Показываем сообщение (Оно теперь снаружи, поэтому не скроется)
              if(successMsg) {
                  successMsg.style.display = 'flex';
                  // Переинициализация иконки внутри сообщения (на всякий случай)
                  if (typeof lucide !== 'undefined') lucide.createIcons();
              }

          }, 1500);
      });
  }

  // --- 5. COOKIE POPUP ---
  const cookiePopup = document.getElementById('cookiePopup');
  const acceptBtn = document.getElementById('acceptCookie');

  if (cookiePopup && !localStorage.getItem('cookiesAccepted')) {
      setTimeout(() => {
          cookiePopup.classList.add('show');
      }, 2000);
  }

  if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
          localStorage.setItem('cookiesAccepted', 'true');
          cookiePopup.classList.remove('show');
      });
  }
});

// --- 6. ANIMATIONS (GSAP) ---
window.addEventListener('load', () => {

  // Функция принудительного показа (fallback)
  const showAllContent = () => {
      document.querySelectorAll('.hero__title, .hero__desc, .hero__actions, .hero__img-wrapper, .section, .mentors-grid').forEach(el => {
          el.style.opacity = 1;
          el.style.visibility = 'visible';
          el.style.transform = 'none';
      });
  };

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not found');
      showAllContent();
      return;
  }

  gsap.registerPlugin(ScrollTrigger);

  try {
      const heroTitle = document.querySelector('.hero__title');

      // === HERO ANIMATION ===
      if (heroTitle) {
          gsap.set(['.hero__desc', '.hero__actions'], { y: 30, opacity: 0 });
          gsap.set('.hero__img-wrapper', { scale: 0.9, opacity: 0 });

          let splitChars = [];
          // Используем SplitType только если он загружен
          if (typeof SplitType !== 'undefined') {
              const typeSplit = new SplitType('.hero__title', {
                  types: 'lines, words',
                  tagName: 'span'
              });
              gsap.set(typeSplit.words, { y: 50, opacity: 0 });
              splitChars = typeSplit.words;
          } else {
              gsap.set('.hero__title', { y: 50, opacity: 0 });
              splitChars = '.hero__title';
          }

          const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

          tl.to(splitChars, {
              y: 0, opacity: 1, rotation: 0, duration: 1, stagger: 0.05
          })
          .to('.hero__desc', { y: 0, opacity: 1, duration: 1 }, '-=0.6')
          .to('.hero__actions', { y: 0, opacity: 1, duration: 1 }, '-=0.8')
          .to('.hero__img-wrapper', { scale: 1, opacity: 1, duration: 1.2, ease: 'back.out(1.7)' }, '-=1');

          gsap.to('.hero__card', { y: -15, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      }

      // === SECTIONS SCROLL ===
      const sections = document.querySelectorAll('.section');
      sections.forEach(sec => {
          const children = sec.querySelectorAll('.section-title, .section-desc, .methodology-grid, .row, .courses-grid, .mentors-grid, .contact-container');
          if (children.length > 0) {
              gsap.fromTo(children,
                  { y: 50, opacity: 0 },
                  {
                      y: 0, opacity: 1, duration: 0.8, stagger: 0.2,
                      scrollTrigger: {
                          trigger: sec,
                          start: 'top 85%',
                          toggleActions: 'play none none reverse'
                      }
                  }
              );
          }
      });

  } catch (e) {
      console.error('Animation Logic Error:', e);
      showAllContent();
  }
});