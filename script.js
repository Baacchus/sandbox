// Banque de messages aléatoires avec catégories
const messages = [
  { text: "La seule façon de faire du bon travail est d'aimer ce que vous faites.", category: "🔮 Citation" },
  { text: "Hello ! Chaque grand développeur a commencé par un simple 'Hello World'.", category: "🚀 Motivation" },
  { text: "Le code est comme l'humour. Quand vous devez l'expliquer, c'est qu'il est mauvais.", category: "💡 Dev Fact" },
  { text: "N'aie pas peur de progresser lentement, aie seulement peur de t'arrêter.", category: "🌟 Inspiration" },
  { text: "Les ordinateurs sont rapides, mais les humains sont créatifs !", category: "⚡ Fun" },
  { text: "Simplicité est la sophistication suprême. — Léonard de Vinci", category: "🔮 Citation" },
  { text: "Un bug n'est jamais qu'une fonctionnalité qui s'exprime différemment !", category: "💡 Dev Fact" },
  { text: "Fais aujourd'hui ce que ton futur toi te remerciera d'avoir fait.", category: "🚀 Motivation" },
  { text: "Le meilleur moyen de prédire l'avenir, c'est de le créer.", category: "🌟 Inspiration" },
  { text: "Hello World ! Passe une excellente journée pleine de réussite.", category: "✨ Salutation" }
];

document.addEventListener('DOMContentLoaded', () => {
  const randomTextEl = document.getElementById('random-text');
  const categoryTagEl = document.getElementById('text-category');
  const generateBtn = document.getElementById('generate-btn');
  const counterEl = document.getElementById('counter');
  const copyBtn = document.getElementById('copy-btn');
  
  let count = 0;
  let currentIndex = -1;

  // Fonction pour afficher un message aléatoire
  function displayRandomMessage() {
    let randomIndex;
    // S'assurer qu'on ne tire pas le même message deux fois d'affilée
    do {
      randomIndex = Math.floor(Math.random() * messages.length);
    } while (randomIndex === currentIndex && messages.length > 1);

    currentIndex = randomIndex;
    const selected = messages[randomIndex];

    // Animation de transition fluide
    randomTextEl.classList.add('animate-swap');

    setTimeout(() => {
      randomTextEl.textContent = selected.text;
      categoryTagEl.textContent = selected.category;
      randomTextEl.classList.remove('animate-swap');
    }, 200);

    // Incrémenter le compteur
    count++;
    counterEl.textContent = count;
  }

  // Événement Clic sur le bouton de génération
  generateBtn.addEventListener('click', (e) => {
    displayRandomMessage();
    createParticles(e.clientX, e.clientY);
  });

  // Copier le texte dans le presse-papier
  copyBtn.addEventListener('click', () => {
    const textToCopy = randomTextEl.textContent.trim();
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast("Texte copié dans le presse-papier ! 📋");
    }).catch(() => {
      showToast("Impossible de copier le texte.");
    });
  });

  // Notification Toast
  function showToast(message) {
    let toast = document.querySelector('.toast-notif');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notif';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  // Effet d'étincelles lumineuses
  function createParticles(x, y) {
    const particles = ['✨', '🎲', '⚡', '🟣', '⭐'];
    for (let i = 0; i < 4; i++) {
      const particle = document.createElement('span');
      particle.textContent = particles[Math.floor(Math.random() * particles.length)];
      particle.style.position = 'fixed';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.fontSize = '1.2rem';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '999';
      particle.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';

      document.body.appendChild(particle);

      const destX = (Math.random() - 0.5) * 120;
      const destY = -60 - Math.random() * 60;

      requestAnimationFrame(() => {
        particle.style.transform = `translate(${destX}px, ${destY}px) scale(0.5)`;
        particle.style.opacity = '0';
      });

      setTimeout(() => particle.remove(), 600);
    }
  }

  // Afficher un premier message dès le chargement
  displayRandomMessage();
});
