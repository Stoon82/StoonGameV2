import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
    console.log('Starting Request:', request);
    return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
    response => {
        console.log('Response:', response);
        return response;
    },
    error => {
        console.log('Response Error:', error);
        return Promise.reject(error);
    }
);

export class LandingPage {
    private container: HTMLDivElement;
    private currentForm: 'login' | 'register' = 'login';

    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'auth-container';
        this.setupUI();
    }

    private setupUI() {
        const title = document.createElement('h1');
        title.textContent = 'StoonGameV2';
        this.container.appendChild(title);

        const formContainer = document.createElement('div');
        formContainer.className = 'form-container';
        
        // Toggle button
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Switch to Register';
        toggleButton.onclick = () => this.toggleForm();
        
        formContainer.appendChild(this.createLoginForm());
        this.container.appendChild(formContainer);
        this.container.appendChild(toggleButton);
    }

    private createLoginForm(): HTMLFormElement {
        const form = document.createElement('form');
        form.className = 'auth-form';
        form.innerHTML = `
            <input type="email" placeholder="Email" required>
            <input type="password" placeholder="Password" required>
            <button type="submit">Login</button>
        `;

        form.onsubmit = async (e) => {
            e.preventDefault();
            const [email, password] = Array.from(form.querySelectorAll('input')).map(input => input.value);
            try {
                const response = await api.post('/api/login', { email, password });
                if (response.data && response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    window.location.href = '/game.html';
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. Please check your credentials.');
            }
        };

        return form;
    }

    private createRegisterForm(): HTMLFormElement {
        const form = document.createElement('form');
        form.className = 'auth-form';
        form.innerHTML = `
            <input type="text" placeholder="Username" required>
            <input type="email" placeholder="Email" required>
            <input type="password" placeholder="Password" required>
            <button type="submit">Register</button>
        `;

        form.onsubmit = async (e) => {
            e.preventDefault();
            const [username, email, password] = Array.from(form.querySelectorAll('input')).map(input => input.value);
            try {
                const response = await api.post('/api/register', { username, email, password });
                if (response.data && response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    window.location.href = '/game.html';
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('Registration failed. Please try again.');
            }
        };

        return form;
    }

    private toggleForm() {
        const formContainer = this.container.querySelector('.form-container')!;
        const toggleButton = this.container.querySelector('button')!;
        
        if (this.currentForm === 'login') {
            formContainer.replaceChild(this.createRegisterForm(), formContainer.firstChild!);
            toggleButton.textContent = 'Switch to Login';
            this.currentForm = 'register';
        } else {
            formContainer.replaceChild(this.createLoginForm(), formContainer.firstChild!);
            toggleButton.textContent = 'Switch to Register';
            this.currentForm = 'login';
        }
    }

    public getContainer(): HTMLDivElement {
        return this.container;
    }
}
