/* =========================
   LOAD HEADER AND FOOTER
   ========================= */

async function loadComponent(id, file) {
    var target = document.getElementById(id);

    if (!target) return;

    try {
        var response = await fetch(file);

        if (!response.ok) {
            throw new Error("Kunne ikke laste " + file);
        }

        var html = await response.text();
        target.innerHTML = html;

    } catch (error) {
        console.error(error);
    }
}


/* =========================
   NAVIGATION
   ========================= */

function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("navMenu");

    if (!toggle || !menu) return;

    function closeMenu() {
        menu.classList.remove("is-open");
        toggle.classList.remove("is-active");
        toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
        var isOpen = menu.classList.toggle("is-open");

        toggle.classList.toggle("is-active", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
    });

    menu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeMenu();
        }
    });
}


/* =========================
   ACTIVE NAVIGATION LINK
   ========================= */

function setupActiveNavigation() {
    var currentPage =
        window.location.pathname.split("/").pop() || "index.html";

    var navLinks = document.querySelectorAll(".nav-links a");

    navLinks.forEach(function (link) {
        link.classList.remove("active");

        var linkPage = link.getAttribute("href");

        if (linkPage === currentPage) {
            link.classList.add("active");
        }
    });

    /* Profilsidene tilhører Om oss */
    if (currentPage.startsWith("profile-")) {
        var aboutLink =
            document.querySelector('.nav-links a[href="about.html"]');

        if (aboutLink) {
            aboutLink.classList.add("active");
        }
    }
}


/* =========================
   LOAD LAYOUT
   ========================= */

async function loadLayout() {

    await loadComponent("header", "header.html");
    await loadComponent("footer", "footer.html");

    /*
       Navbar finnes først etter at header.html
       er ferdig lastet.
    */
    setupNavigation();
    setupActiveNavigation();
}


/* =========================
   REVEAL UNDERLINE
   ========================= */

(function () {
    var targets = document.querySelectorAll(".reveal-underline");

    if (!targets.length || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            entry.target.classList.toggle(
                "in-view",
                entry.isIntersecting
            );
        });
    }, {
        threshold: 0.6
    });

    targets.forEach(function (el) {
        observer.observe(el);
    });
})();


/* =========================
   CONTACT FORM — WEB3FORMS
   ========================= */

(function () {

    const form = document.getElementById("contactForm");

    if (!form) return;

    const statusEl = document.getElementById("contactStatus");
    const submitBtn = form.querySelector('button[type="submit"]');

    const fields = [
        {
            input: document.getElementById("contactName"),
            check: function (value) {
                return value ? "" : "Skriv inn navnet ditt.";
            }
        },
        {
            input: document.getElementById("contactEmail"),
            check: function (value) {

                if (!value) {
                    return "Skriv inn e-postadressen din.";
                }

                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return "E-postadressen ser ikke riktig ut, f.eks. navn@firma.no.";
                }

                return "";
            }
        },
        {
            input: document.getElementById("contactMessage"),
            check: function (value) {

                return value.length >= 10
                    ? ""
                    : "Skriv en melding på minst 10 tegn.";
            }
        }
    ];


    /* =========================
       STATUSMELDINGER
       ========================= */

    function setStatus(text, type) {

        statusEl.textContent = text;

        statusEl.classList.toggle(
            "is-success",
            type === "success"
        );

        statusEl.classList.toggle(
            "is-error",
            type === "error"
        );
    }


    /* =========================
       VALIDERING
       ========================= */

    function validateField(field) {

        const message = field.check(
            field.input.value.trim()
        );

        const errorEl = document.getElementById(
            field.input.id + "Error"
        );

        errorEl.textContent = message;

        if (message) {

            field.input.setAttribute(
                "aria-invalid",
                "true"
            );

            field.input.setAttribute(
                "aria-describedby",
                errorEl.id
            );

        } else {

            field.input.removeAttribute("aria-invalid");
            field.input.removeAttribute("aria-describedby");

        }

        return !message;
    }


    /* =========================
       VALIDER FELT UNDERVEIS
       ========================= */

    fields.forEach(function (field) {

        field.input.addEventListener("blur", function () {

            if (field.input.value.trim()) {
                validateField(field);
            }

        });

        field.input.addEventListener("input", function () {

            if (
                field.input.getAttribute("aria-invalid")
                === "true"
            ) {
                validateField(field);
            }

        });

    });


    /* =========================
       SEND TIL WEB3FORMS
       ========================= */

    async function sendToWeb3Forms() {

        submitBtn.disabled = true;
        submitBtn.textContent = "Sender...";

        setStatus("Sender meldingen...", "");

        const formData = new FormData(form);

        try {

            const response = await fetch(
                "https://api.web3forms.com/submit",
                {
                    method: "POST",
                    body: formData
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Kunne ikke sende meldingen."
                );
            }

            /* Meldingen ble sendt */

            form.reset();

            fields.forEach(function (field) {

                field.input.removeAttribute("aria-invalid");
                field.input.removeAttribute("aria-describedby");

                const errorEl = document.getElementById(
                    field.input.id + "Error"
                );

                errorEl.textContent = "";

            });

            setStatus(
                "Takk! Meldingen er sendt. Vi svarer så fort vi kan.",
                "success"
            );

        } catch (error) {

            console.error("Web3Forms:", error);

            setStatus(
                "Meldingen ble ikke sendt. Prøv igjen, eller send e-post til kontakt@1000byte.no.",
                "error"
            );

        } finally {

            submitBtn.disabled = false;
            submitBtn.textContent = "Send melding";

        }

    }


    /* =========================
       SKJEMA INNSENDING
       ========================= */

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        let firstInvalid = null;

        /* Valider alle feltene */

        fields.forEach(function (field) {

            if (!validateField(field) && !firstInvalid) {
                firstInvalid = field.input;
            }

        });

        if (firstInvalid) {

            setStatus(
                "Sjekk feltene som er markert.",
                "error"
            );

            firstInvalid.focus();

            return;
        }

        /* Spam-beskyttelse */

        if (form.elements.botcheck?.checked) {
            return;
        }

        /* Send skjemaet */

        sendToWeb3Forms();

    });

})();

/* =========================
   START
   ========================= */

loadLayout();