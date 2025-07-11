import './css/style.css';
import MainBrain from './js/MainBrain';

console.log('App.js loaded - Starting 3D Brain application');

// Check if WebGL is available
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
console.log('WebGL available:', !!gl);

if (!gl) {
    console.error('WebGL not available!');
    document.body.innerHTML = '<div style="color: red; font-size: 24px; text-align: center; margin-top: 50px;">WebGL not supported on this browser</div>';
} else {
    console.log('WebGL context created successfully');
    
    // Original behavior: no container parameter, uses document.body directly
    // eslint-disable-next-line
    const mainBrain = new MainBrain();
    console.log('MainBrain instance created:', mainBrain);
}
