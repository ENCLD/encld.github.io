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
   START
   ========================= */

loadLayout();