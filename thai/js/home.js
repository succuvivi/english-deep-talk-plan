import { SCENES } from '../data/scenes.js';
import { learnerState } from './state.js';

const grid = document.querySelector('#scene-grid');

grid.innerHTML = SCENES.map(scene => `
  <a class="scene-card" href="learn.html?scene=${encodeURIComponent(scene.id)}">
    <span class="scene-emoji" aria-hidden="true">${scene.emoji}</span>
    <strong>${scene.title}</strong>
    <small>${scene.description}</small>
  </a>
`).join('');

function syncControls() {
  const showThai = learnerState.getShowThai();
  const speed = learnerState.getSpeechRate();
  document.body.classList.toggle('hide-thai', !showThai);
  document.querySelectorAll('[data-action="toggle-thai"]').forEach(button => {
    button.textContent = `泰文：${showThai ? '显示' : '隐藏'}`;
  });
  document.querySelectorAll('[data-action="toggle-speed"]').forEach(button => {
    button.textContent = `语速：${speed === 'slow' ? '慢速' : '正常'}`;
  });
}

document.querySelectorAll('[data-action="toggle-thai"]').forEach(button => {
  button.addEventListener('click', () => {
    learnerState.setShowThai(!learnerState.getShowThai());
    syncControls();
  });
});

document.querySelectorAll('[data-action="toggle-speed"]').forEach(button => {
  button.addEventListener('click', () => {
    learnerState.setSpeechRate(learnerState.getSpeechRate() === 'slow' ? 'normal' : 'slow');
    syncControls();
  });
});

syncControls();
