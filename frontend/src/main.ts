import './styles.css';
import { LandingPage } from './landing';
import { InitManager } from './managers/InitManager';

// Check if user is authenticated
const token = localStorage.getItem('token');
const isGamePage = window.location.pathname.includes('game.html');

if (!token && isGamePage) {
    // Redirect to landing page if not authenticated
    window.location.href = '/';
} else if (token && !isGamePage) {
    // Redirect to game if already authenticated
    window.location.href = '/game.html';
} else if (!token) {
    // Show landing page
    const landing = new LandingPage();
    document.body.appendChild(landing.getContainer());
} else {
    // Initialize game with manager system
    const initManager = InitManager.getInstance();
    initManager.init();

    // Cleanup on page unload
    window.addEventListener('unload', () => {
        initManager.dispose();
    });
}
