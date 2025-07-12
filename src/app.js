import './css/style.css';
import MainBrain from './js/MainBrain';

console.log('=== APP.JS LOADED ===');

try {
  console.log('About to create MainBrain instance...');

  // eslint-disable-next-line
  const brain = new MainBrain();
  console.log('MainBrain instance created successfully:', brain);

  // Fallback: start basic render loop after 3 seconds if nothing is rendering
  setTimeout(() => {
    console.log('Starting fallback AbstractApplication render loop...');
    try {
      brain.animate();
    } catch (error) {
      console.error('Error starting animate:', error);
    }
  }, 3000);
} catch (error) {
  console.error('CRITICAL ERROR creating MainBrain:', error);
  console.error('Stack trace:', error.stack);

  // Create minimal working scene
  console.log('Creating emergency fallback...');
  document.body.innerHTML = `<div style="color: white; padding: 20px;">ERROR: ${error.message}<br>Check console for details</div>`;
}
