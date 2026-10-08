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
   CRITTER
   ========================= */

(function () {
    var critter = document.getElementById("critter");

    if (!critter) return;

    var squares = Array.prototype.slice.call(
        critter.querySelectorAll(".critter-square")
    );

    squares.forEach(function (square, i) {

        square.addEventListener("mouseenter", function () {

            squares.forEach(function (other, j) {

                var dist = Math.abs(i - j);

                other.classList.toggle(
                    "is-jump",
                    dist === 0
                );

                other.classList.toggle(
                    "is-jump-near",
                    dist === 1
                );
            });
        });

        square.addEventListener("mouseleave", function () {

            squares.forEach(function (other) {
                other.classList.remove(
                    "is-jump",
                    "is-jump-near"
                );
            });
        });
    });
})();


/* =========================
   CONTACT FORM
   ========================= */

(function () {
    var form = document.getElementById("contactForm");

    if (!form) return;

    var statusEl = document.getElementById("contactStatus");
    var submitBtn = form.querySelector('button[type="submit"]');

    var fields = [
        {
            input: document.getElementById("contactName"),
            check: function (value) {
                return value ? "" : "Skriv inn navnet ditt.";
            }
        },
        {
            input: document.getElementById("contactEmail"),
            check: function (value) {
                if (!value) return "Skriv inn e-postadressen din.";
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

    function setStatus(text, type) {
        statusEl.textContent = text;
        statusEl.classList.toggle("is-success", type === "success");
        statusEl.classList.toggle("is-error", type === "error");
    }

    function validateField(field) {
        var message = field.check(field.input.value.trim());
        var errorEl = document.getElementById(field.input.id + "Error");

        errorEl.textContent = message;

        if (message) {
            field.input.setAttribute("aria-invalid", "true");
            field.input.setAttribute("aria-describedby", errorEl.id);
        } else {
            field.input.removeAttribute("aria-invalid");
        }

        return !message;
    }

    /* Valider feltet når brukeren forlater det, og fjern feilen mens de retter */
    fields.forEach(function (field) {
        field.input.addEventListener("blur", function () {
            if (field.input.value.trim()) validateField(field);
        });

        field.input.addEventListener("input", function () {
            if (field.input.getAttribute("aria-invalid") === "true") {
                validateField(field);
            }
        });
    });

    function openMailClient(data) {
        var subject = data.emne + " - fra " + data.navn;
        var body = data.melding + "\n\n" + data.navn + "\n" + data.epost;

        window.location.href =
            "mailto:" + form.dataset.email +
            "?subject=" + encodeURIComponent(subject) +
            "&body=" + encodeURIComponent(body);

        setStatus("E-postprogrammet ditt åpnes med meldingen ferdig utfylt. Trykk send der.", "success");
    }

    async function sendToEndpoint(data) {
        submitBtn.disabled = true;
        setStatus("Sender …", "");

        try {
            var response = await fetch(form.dataset.endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error("Status " + response.status);

            form.reset();
            setStatus("Takk! Meldingen er sendt, vi svarer så fort vi kan.", "success");

        } catch (error) {
            console.error(error);
            setStatus(
                "Meldingen ble ikke sendt. Prøv igjen, eller send e-post til " +
                form.dataset.email + ".",
                "error"
            );
        } finally {
            submitBtn.disabled = false;
        }
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        var firstInvalid = null;

        fields.forEach(function (field) {
            if (!validateField(field) && !firstInvalid) {
                firstInvalid = field.input;
            }
        });

        if (firstInvalid) {
            setStatus("Sjekk feltene som er markert.", "error");
            firstInvalid.focus();
            return;
        }

        /* Spam-roboter fyller ut det skjulte feltet */
        if (form.elements._gotcha.value) return;

        var data = {
            navn: form.elements.navn.value.trim(),
            epost: form.elements.epost.value.trim(),
            emne: form.elements.emne.value,
            melding: form.elements.melding.value.trim()
        };

        if (form.dataset.endpoint) {
            sendToEndpoint(data);
        } else {
            openMailClient(data);
        }
    });
})();


/* =========================
   START
   ========================= */

loadLayout();