(function () {
    var targets = document.querySelectorAll(".reveal-underline");
    if (!targets.length || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            entry.target.classList.toggle("in-view", entry.isIntersecting);
        });
    }, { threshold: 0.6 });

    targets.forEach(function (el) { observer.observe(el); });
})();

(function () {
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
        if (event.key === "Escape") closeMenu();
    });
})();

(function () {
    var critter = document.getElementById("critter");
    if (!critter) return;

    var squares = Array.prototype.slice.call(critter.querySelectorAll(".critter-square"));

    squares.forEach(function (square, i) {
        square.addEventListener("mouseenter", function () {
            squares.forEach(function (other, j) {
                var dist = Math.abs(i - j);
                other.classList.toggle("is-jump", dist === 0);
                other.classList.toggle("is-jump-near", dist === 1);
            });
        });

        square.addEventListener("mouseleave", function () {
            squares.forEach(function (other) {
                other.classList.remove("is-jump", "is-jump-near");
            });
        });
    });
})();
