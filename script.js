class DogGallery {
    constructor() {
        this.breeds = [];
        this.favorites = JSON.parse(localStorage.getItem('dogFavorites')) || [];
        this.init();
    }

    async init() {
        await this.loadBreeds();
        this.setupEventListeners();
        if (this.favorites.length > 0) {
            this.displayFavorites();
        }
    }

    async loadBreeds() {
        try {
            const response = await fetch("https://dog.ceo/api/breeds/list/all");
            const data = await response.json();
            this.breeds = Object.keys(data.message);
            this.populateBreedSelect();
        } catch (error) {
            console.error("Error fetching breeds:", error);
            document.getElementById("breedSelect").innerHTML = 
                '<option value="">Error loading breeds</option>';
        }
    }

    populateBreedSelect() {
        const breedSelect = document.getElementById("breedSelect");
        breedSelect.innerHTML = '<option value="">-- Select a breed --</option>';
        
        this.breeds.forEach((breed) => {
            const option = document.createElement("option");
            option.value = breed;
            option.textContent = breed;
            breedSelect.appendChild(option);
        });
    }

    async fetchRandomDogs(count = 3) {
        const resultDiv = document.getElementById("result");
        resultDiv.innerHTML = `<div class="loader"></div><p>Fetching random dogs...</p>`;
        
        try {
            const requests = Array(count).fill().map(() => 
                fetch("https://dog.ceo/api/breeds/image/random").then(res => res.json())
            );
            
            const dogs = await Promise.all(requests);
            this.displayDogs(dogs.map(dog => dog.message), "random dogs");
        } catch (error) {
            resultDiv.innerHTML = `<p>Failed to load dogs. Try again!</p>`;
        }
    }

    async fetchBreedDogs(breed) {
        const resultDiv = document.getElementById("result");
        resultDiv.innerHTML = `<div class="loader"></div><p>Loading ${breed}s...</p>`;

        try {
            const response = await fetch(`https://dog.ceo/api/breed/${breed}/images/random/3`);
            const data = await response.json();
            this.displayDogs(data.message, breed);
        } catch (error) {
            resultDiv.innerHTML = `<p>Couldn't load ${breed} pics. Try another breed!</p>`;
        }
    }

    displayDogs(dogUrls, title) {
        const resultDiv = document.getElementById("result");
        const dogImages = dogUrls.map(url => `
            <div class="dog-container">
                <img src="${url}" class="dog-image">
                <button class="favorite-btn" data-url="${url}"> Save</button>
            </div>
        `).join("");
        
        resultDiv.innerHTML = `
            <h2>${title}</h2>
            <div class="dog-grid">${dogImages}</div>
            <p>More ${title}? Click again!</p>
        `;

        // Add event listeners to new favorite buttons
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', () => this.addToFavorites(btn.dataset.url));
        });
    }

    addToFavorites(url) {
        if (!this.favorites.includes(url)) {
            this.favorites.push(url);
            localStorage.setItem('dogFavorites', JSON.stringify(this.favorites));
            this.displayFavorites();
            alert('Dog added to favorites!');
        }
    }

    displayFavorites() {
        const container = document.getElementById("favorites-container");
        const section = document.getElementById("favorites-section");
        const countElement = document.getElementById("favorites-count");
    
        countElement.textContent = `${this.favorites.length} saved`; // Update counter
        
        if (this.favorites.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        container.innerHTML = this.favorites.map(url => `
            <div class="dog-container">
                <img src="${url}" class="dog-image">
                <button class="remove-btn" data-url="${url}"> Remove</button>
            </div>
        `).join("");

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', () => this.removeFromFavorites(btn.dataset.url));
        });
    }

    removeFromFavorites(url) {
        this.favorites = this.favorites.filter(fav => fav !== url);
        localStorage.setItem('dogFavorites', JSON.stringify(this.favorites));
        this.displayFavorites();
    }

    setupEventListeners() {
        document.getElementById("fetchBtn").addEventListener("click", () => this.fetchRandomDogs());
        
        document.getElementById("breedSelect").addEventListener("change", (e) => {
            const breed = e.target.value;
            if (breed) this.fetchBreedDogs(breed);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const dogApp = new DogGallery();
});