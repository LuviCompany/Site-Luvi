// ===== Luvi Company — scripts compartilhados =====
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 767px)").matches;

  /* ---------- Tracking (Meta Pixel / GA4 / GTM) ----------
   * TODO: inserir IDs reais do Meta Pixel, GA4 e GTM no <head> de cada página
   * antes de publicar. As funções abaixo só disparam eventos se as
   * respectivas libs estiverem carregadas, então funcionam como stubs seguros
   * durante o desenvolvimento.
   */
  function trackEvent(eventName, params) {
    params = params || {};
    try {
      if (typeof window.fbq === "function") {
        window.fbq("trackCustom", eventName, params);
      }
      if (typeof window.gtag === "function") {
        window.gtag("event", eventName, params);
      }
      if (window.dataLayer && typeof window.dataLayer.push === "function") {
        window.dataLayer.push(Object.assign({ event: eventName }, params));
      }
    } catch (e) {
      /* tracking nunca deve quebrar a página */
    }
  }
  window.luviTrack = trackEvent;

  document.addEventListener("DOMContentLoaded", function () {
    /* ---------- Menu mobile (off-canvas) ---------- */
    var menuBtn = document.getElementById("menu-toggle");
    var mobileMenu = document.getElementById("mobile-menu");
    var menuOverlay = document.getElementById("mobile-menu-overlay");
    var menuCloseBtn = document.getElementById("menu-close");

    function openMenu() {
      mobileMenu.classList.add("is-open");
      menuOverlay.classList.remove("hidden");
      menuBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      var firstLink = mobileMenu.querySelector("a, button");
      if (firstLink) firstLink.focus();
    }
    function closeMenu() {
      mobileMenu.classList.remove("is-open");
      menuOverlay.classList.add("hidden");
      menuBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      menuBtn.focus();
    }
    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener("click", function () {
        var isOpen = mobileMenu.classList.contains("is-open");
        isOpen ? closeMenu() : openMenu();
      });
      if (menuCloseBtn) menuCloseBtn.addEventListener("click", closeMenu);
      if (menuOverlay) menuOverlay.addEventListener("click", closeMenu);
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) closeMenu();
      });
      mobileMenu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeMenu);
      });
    }

    /* ---------- Dropdown "Serviços" (navbar desktop) ---------- */
    document.querySelectorAll("[data-dropdown]").forEach(function (dropdown) {
      var trigger = dropdown.querySelector("[data-dropdown-trigger]");
      var panel = dropdown.querySelector(".dropdown-panel");
      if (!trigger || !panel) return;
      var closeTimer = null;

      function openDropdown() {
        clearTimeout(closeTimer);
        panel.hidden = false;
        requestAnimationFrame(function () { panel.classList.add("is-open"); });
        trigger.setAttribute("aria-expanded", "true");
      }
      function closeDropdown() {
        clearTimeout(closeTimer);
        trigger.setAttribute("aria-expanded", "false");
        panel.classList.remove("is-open");
        closeTimer = setTimeout(function () { panel.hidden = true; }, 200);
      }
      function scheduleClose() {
        clearTimeout(closeTimer);
        closeTimer = setTimeout(closeDropdown, 250);
      }

      dropdown.addEventListener("mouseenter", openDropdown);
      dropdown.addEventListener("mouseleave", scheduleClose);
      trigger.addEventListener("click", function () {
        var isOpen = trigger.getAttribute("aria-expanded") === "true";
        isOpen ? closeDropdown() : openDropdown();
      });
      dropdown.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          closeDropdown();
          trigger.focus();
        }
      });
      document.addEventListener("click", function (e) {
        if (!dropdown.contains(e.target)) closeDropdown();
      });
      panel.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeDropdown);
      });
    });

    /* ---------- Carrossel de depoimentos ---------- */
    document.querySelectorAll("[data-testimonial-carousel]").forEach(function (carousel) {
      var slides = carousel.querySelectorAll("[data-testimonial-slide]");
      var dots = carousel.querySelectorAll("[data-testimonial-dot]");
      var prevBtn = carousel.querySelector("[data-testimonial-prev]");
      var nextBtn = carousel.querySelector("[data-testimonial-next]");
      if (!slides.length) return;
      var current = 0;

      function goTo(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          var active = i === current;
          dot.classList.toggle("is-active", active);
          dot.setAttribute("aria-current", active ? "true" : "false");
        });
      }
      if (prevBtn) prevBtn.addEventListener("click", function () { goTo(current - 1); });
      if (nextBtn) nextBtn.addEventListener("click", function () { goTo(current + 1); });
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () { goTo(i); });
      });

      carousel.querySelectorAll(".testimonial-video-card video").forEach(function (video) {
        function tryPlay() { video.play().catch(function () {}); }
        if (video.readyState >= 2) {
          tryPlay();
        } else {
          video.addEventListener("loadeddata", tryPlay, { once: true });
        }
        video.addEventListener("pause", function () {
          if (!video.ended) tryPlay();
        });
      });
    });

    /* ---------- Modal de vídeo do depoimento ---------- */
    var testimonialModal = document.getElementById("testimonial-modal");
    if (testimonialModal) {
      var testimonialModalClose = document.getElementById("testimonial-modal-close");
      var testimonialModalVideo = document.getElementById("testimonial-modal-video");
      var testimonialModalPlaceholder = document.getElementById("testimonial-modal-placeholder");
      function openTestimonialModal(videoSrc) {
        testimonialModal.classList.remove("hidden");
        testimonialModal.classList.add("flex");
        document.body.style.overflow = "hidden";
        if (testimonialModalVideo && videoSrc) {
          testimonialModalVideo.src = videoSrc;
          testimonialModalVideo.classList.remove("hidden");
          if (testimonialModalPlaceholder) testimonialModalPlaceholder.classList.add("hidden");
          testimonialModalVideo.play().catch(function () {});
        } else {
          if (testimonialModalVideo) testimonialModalVideo.classList.add("hidden");
          if (testimonialModalPlaceholder) testimonialModalPlaceholder.classList.remove("hidden");
        }
        if (testimonialModalClose) testimonialModalClose.focus();
      }
      function closeTestimonialModal() {
        testimonialModal.classList.add("hidden");
        testimonialModal.classList.remove("flex");
        document.body.style.overflow = "";
        if (testimonialModalVideo) {
          testimonialModalVideo.pause();
          testimonialModalVideo.removeAttribute("src");
          testimonialModalVideo.load();
        }
      }
      document.querySelectorAll("[data-testimonial-play]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          openTestimonialModal(btn.getAttribute("data-testimonial-video"));
        });
      });
      if (testimonialModalClose) testimonialModalClose.addEventListener("click", closeTestimonialModal);
      testimonialModal.addEventListener("click", function (e) {
        if (e.target === testimonialModal) closeTestimonialModal();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !testimonialModal.classList.contains("hidden")) closeTestimonialModal();
      });
    }

    /* ---------- Reveal on scroll (fade + slide) ---------- */
    var revealEls = document.querySelectorAll(".reveal");
    if (prefersReducedMotion) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else if ("IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }

    /* ---------- Demo "código sendo escrito" + "dashboard sendo montado" ---------- */
    var codeDemo = document.querySelector("[data-code-demo]");
    if (codeDemo) {
      var codeLines = Array.prototype.slice.call(codeDemo.querySelectorAll(".code-type"));
      var assembleItems = Array.prototype.slice.call(codeDemo.querySelectorAll(".assemble-item"));
      var codeEndCursor = codeDemo.querySelector(".code-end-cursor");

      function playCodeAssembleDemo() {
        if (prefersReducedMotion) {
          codeLines.forEach(function (el) { el.style.width = "auto"; });
          assembleItems.forEach(function (el) { el.classList.add("is-in"); });
          if (codeEndCursor) codeEndCursor.classList.add("show");
          return;
        }

        var widths = codeLines.map(function (el) { return el.scrollWidth; });
        var totalTypingTime = 0;

        function typeLine(index) {
          if (index >= codeLines.length) {
            if (codeEndCursor) codeEndCursor.classList.add("show");
            return;
          }
          var el = codeLines[index];
          var w = widths[index];
          var steps = Math.max(1, Math.round(w / 7));
          var duration = Math.max(120, w * 2.2);
          el.classList.add("is-caret");
          el.style.transition = "width " + duration + "ms steps(" + steps + ", end)";
          el.style.width = w + "px";
          setTimeout(function () {
            el.classList.remove("is-caret");
            typeLine(index + 1);
          }, duration + 70);
        }

        codeLines.forEach(function (el, i) {
          totalTypingTime += Math.max(120, widths[i] * 2.2) + 70;
        });

        typeLine(0);

        var assembleStart = totalTypingTime * 0.5;
        assembleItems.forEach(function (el, i) {
          setTimeout(function () { el.classList.add("is-in"); }, assembleStart + i * 150);
        });
      }

      if ("IntersectionObserver" in window) {
        var codeDemoObserver = new IntersectionObserver(
          function (entries, obs) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                playCodeAssembleDemo();
                obs.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.3 }
        );
        codeDemoObserver.observe(codeDemo);
      } else {
        playCodeAssembleDemo();
      }
    }

    /* ---------- Contadores animados ---------- */
    var counters = document.querySelectorAll(".counter");
    function animateCounter(el) {
      var target = parseFloat(el.getAttribute("data-target"));
      var suffix = el.getAttribute("data-suffix") || "";
      var prefix = el.getAttribute("data-prefix") || "";
      var duration = prefersReducedMotion ? 0 : 1800;
      var start = null;

      if (duration === 0) {
        el.textContent = prefix + target + suffix;
        el.setAttribute("data-counted", "true");
        return;
      }

      function step(timestamp) {
        if (!start) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        el.textContent = prefix + current + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = prefix + target + suffix;
          el.setAttribute("data-counted", "true");
        }
      }
      window.requestAnimationFrame(step);
    }
    if (counters.length && "IntersectionObserver" in window) {
      var counterObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && entry.target.getAttribute("data-counted") !== "true") {
              animateCounter(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach(function (el) { counterObserver.observe(el); });
    }

    /* ---------- Tabs de portfólio ---------- */
    var tabGroups = document.querySelectorAll("[data-tab-group]");
    tabGroups.forEach(function (group) {
      var buttons = group.querySelectorAll("[data-tab-btn]");
      var panels = group.querySelectorAll("[data-tab-panel]");
      function swapPanels(target) {
        panels.forEach(function (p) {
          var isTarget = p.getAttribute("data-tab-panel") === target;
          if (isTarget) {
            // reseta o scroll horizontal do carrossel (mobile) antes de exibir
            p.scrollLeft = 0;
            if (!prefersReducedMotion) {
              p.classList.add("tab-panel-fade-out");
              p.classList.remove("hidden");
              void p.offsetWidth; // força reflow pra garantir a transição de fade-in
              p.classList.remove("tab-panel-fade-out");
            } else {
              p.classList.remove("hidden");
            }
          } else {
            p.classList.add("hidden");
            p.classList.remove("tab-panel-fade-out");
          }
        });
      }
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (btn.getAttribute("aria-selected") === "true") return;
          var target = btn.getAttribute("data-tab-btn");
          buttons.forEach(function (b) {
            var active = b === btn;
            b.setAttribute("aria-selected", active ? "true" : "false");
            b.tabIndex = active ? 0 : -1;
          });
          var activePanel = Array.prototype.filter.call(panels, function (p) {
            return !p.classList.contains("hidden");
          })[0];
          if (activePanel && !prefersReducedMotion) {
            activePanel.classList.add("tab-panel-fade-out");
            window.setTimeout(function () { swapPanels(target); }, 180);
          } else {
            swapPanels(target);
          }
          trackEvent("portfolio_tab_view", { tab: target });
        });
        btn.addEventListener("keydown", function (e) {
          var list = Array.prototype.slice.call(buttons);
          var idx = list.indexOf(btn);
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            var nextIdx = e.key === "ArrowRight" ? (idx + 1) % list.length : (idx - 1 + list.length) % list.length;
            list[nextIdx].focus();
            list[nextIdx].click();
          }
        });
      });
    });

    /* ---------- Links do WhatsApp com UTM ---------- */
    document.querySelectorAll("[data-whatsapp]").forEach(function (link) {
      var url = new URL(link.href);
      if (!url.searchParams.has("utm_source")) {
        url.searchParams.set("utm_source", "site");
        url.searchParams.set("utm_medium", "whatsapp_button");
        url.searchParams.set("utm_campaign", "analise_previa");
        link.href = url.toString();
      }
      link.addEventListener("click", function () {
        trackEvent("whatsapp_click", { location: link.getAttribute("data-whatsapp") });
      });
    });

    /* ---------- CTAs principais (tracking) ---------- */
    document.querySelectorAll("[data-cta]").forEach(function (el) {
      el.addEventListener("click", function () {
        trackEvent("cta_click", { cta_id: el.getAttribute("data-cta") });
      });
    });

    /* ---------- Formulário de Análise Prévia ---------- */
    var form = document.getElementById("lead-form");
    if (form) {
      var submitBtn = form.querySelector('button[type="submit"]');
      var submitBtnDefaultText = submitBtn ? submitBtn.textContent : "";
      var formError = document.getElementById("lead-form-error");

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var lgpd = form.querySelector("#lgpd");
        if (lgpd && !lgpd.checked) {
          lgpd.focus();
          return;
        }

        if (formError) formError.classList.add("hidden");
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Enviando...";
        }

        var payload = {
          nome: (form.querySelector("#nome") || {}).value || "",
          email: (form.querySelector("#email") || {}).value || "",
          whatsapp: (form.querySelector("#whatsapp") || {}).value || "",
          nicho: (form.querySelector("#nicho") || {}).value || "",
          faturamento: (form.querySelector("#faturamento") || {}).value || ""
        };

        fetch("/api/send-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
          .then(function (res) {
            if (!res.ok) throw new Error("send-lead failed");
            trackEvent("lead_form_submit", { nicho: payload.nicho });
            window.location.href = "obrigado.html";
          })
          .catch(function () {
            if (formError) formError.classList.remove("hidden");
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = submitBtnDefaultText;
            }
          });
      });
    }

    /* ---------- Ano no footer ---------- */
    var yearEl = document.getElementById("current-year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });
})();
