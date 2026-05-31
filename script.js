const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const revealElements = document.querySelectorAll(".reveal");
const navItems = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("main section[id]");
const interactiveCards = document.querySelectorAll(".hero-panel, .project-card, .skill-card, .expertise-card, .technical-card");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const quiz = document.querySelector("[data-quiz]");
const scrollProgress = document.querySelector("[data-scroll-progress]");

if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("active");
        menuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    navItems.forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            menuBtn.setAttribute("aria-expanded", "false");
        });
    });

    document.addEventListener("click", (event) => {
        const clickInsideMenu = navLinks.contains(event.target);
        const clickOnButton = menuBtn.contains(event.target);

        if (!clickInsideMenu && !clickOnButton) {
            navLinks.classList.remove("active");
            menuBtn.setAttribute("aria-expanded", "false");
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            navLinks.classList.remove("active");
            menuBtn.setAttribute("aria-expanded", "false");
        }
    });
}

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    revealElements.forEach((element) => observer.observe(element));
} else {
    revealElements.forEach((element) => element.classList.add("active"));
}

if ("IntersectionObserver" in window && navItems.length > 0) {
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                navItems.forEach((item) => {
                    item.classList.toggle("active", item.getAttribute("href") === `#${entry.target.id}`);
                });
            });
        },
        {
            rootMargin: "-35% 0px -55% 0px",
            threshold: 0
        }
    );

    sections.forEach((section) => sectionObserver.observe(section));
}

if (scrollProgress) {
    function updateScrollProgress() {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
        scrollProgress.style.width = `${Math.min(progress, 100)}%`;
    }

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);
    updateScrollProgress();
}

if (!reduceMotion.matches && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (event) => {
        document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
        document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
    });

    interactiveCards.forEach((card) => {
        card.addEventListener("pointermove", (event) => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const rotateX = ((y / rect.height) - 0.5) * -4;
            const rotateY = ((x / rect.width) - 0.5) * 4;

            card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener("pointerleave", () => {
            card.style.transform = "";
        });
    });
}

if (quiz) {
    const panels = [...quiz.querySelectorAll(".quiz-panel")];
    const resultPanel = quiz.querySelector("[data-quiz-result]");
    const progress = quiz.querySelector("[data-quiz-progress]");
    const resultTitle = quiz.querySelector("[data-result-title]");
    const resultText = quiz.querySelector("[data-result-text]");
    const resetButton = quiz.querySelector("[data-quiz-reset]");
    const scores = {
        site: 0,
        ecommerce: 0,
        tool: 0,
        mvp: 0,
        automation: 0,
        technical: 0
    };
    const results = {
        site: {
            title: "Priorité : site vitrine clair et crédible",
            text: "Votre besoin semble être de présenter une activité, rassurer rapidement et donner envie de prendre contact. Le bon point de départ serait un site web propre, responsive et centré sur votre offre."
        },
        ecommerce: {
            title: "Priorité : boutique e-commerce",
            text: "Votre besoin se rapproche d'une interface de vente en ligne : présenter les produits, clarifier le parcours d'achat et préparer une base solide avant la mise en service."
        },
        tool: {
            title: "Priorité : outil interne",
            text: "Votre besoin semble être d'organiser des données ou un process. Le bon format serait une mini-application métier simple pour centraliser, suivre et rendre l'information plus lisible."
        },
        mvp: {
            title: "Priorité : prototype ou MVP",
            text: "Votre idée mérite une première version testable. Le plus utile serait de cadrer les fonctions essentielles, construire un prototype et valider rapidement le parcours."
        },
        automation: {
            title: "Priorité : automatisation simple",
            text: "Votre besoin tourne autour du gain de temps. On peut commencer par clarifier le process, structurer les données et créer un tableau de bord ou une logique de suivi plus fluide."
        },
        technical: {
            title: "Priorité : support technique + digital",
            text: "Votre projet semble lié à des contraintes techniques, plans ou supports bureau d'études. L'approche idéale combine lecture technique, CAO/DAO et interface digitale claire."
        }
    };
    let currentStep = 0;

    function showStep(stepIndex) {
        panels.forEach((panel, index) => {
            panel.classList.toggle("active", index === stepIndex);
        });
        resultPanel.classList.remove("active");
        progress.style.width = `${((stepIndex + 1) / panels.length) * 100}%`;
    }

    function showResult() {
        panels.forEach((panel) => panel.classList.remove("active"));
        progress.style.width = "100%";

        const topType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
        const result = results[topType];
        resultTitle.textContent = result.title;
        resultText.textContent = result.text;
        resultPanel.classList.add("active");
    }

    quiz.querySelectorAll("[data-answer]").forEach((button) => {
        button.addEventListener("click", () => {
            button.classList.add("selected");

            window.setTimeout(() => {
                scores[button.dataset.answer] += 1;
                currentStep += 1;
                button.classList.remove("selected");

                if (currentStep >= panels.length) {
                    showResult();
                    return;
                }

                showStep(currentStep);
            }, 170);
        });
    });

    resetButton.addEventListener("click", () => {
        Object.keys(scores).forEach((key) => {
            scores[key] = 0;
        });
        currentStep = 0;
        showStep(currentStep);
    });

    showStep(currentStep);
}
