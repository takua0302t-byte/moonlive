let moon = 245;
const maxMoon = 500;

const moonCount = document.getElementById("moonCount");
const fill = document.getElementById("fill");

function updateMoonBar() {
  if (moon > maxMoon) {
    moon = maxMoon;
  }

  const percent = (moon / maxMoon) * 100;

  moonCount.textContent = moon;
  fill.style.width = percent + "%";

  if (moon >= maxMoon) {
    document.body.classList.add("fullmoon");
  }
}

function addMoon(amount) {
  moon += amount;
  updateMoonBar();
}

function resetMoon() {
  moon = 0;
  updateMoonBar();
}

updateMoonBar();