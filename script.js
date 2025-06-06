class DogGallery {
    constructor() {
        this.currentBreed = null;
        this.currentPage = 1;
        this.breeds = [];
        this.favorites = JSON.parse(localStorage.getItem('dogFavorites')) || [];
        this.init();
    }

    clearAllFavorites() {
        if (confirm("Delete all favorites?")) {
            this.favorites = [];
            localStorage.removeItem('dogFavorites');
            this.displayFavorites();
        }
    }

    startSlideshow() {
        if (this.favorites.length === 0) {
            alert("No favorites to show! Save some dogs first.");
            return;
        }
    
        let currentIndex = 0;
        const slideshowContainer = document.createElement("div");
        slideshowContainer.className = "slideshow";
        slideshowContainer.innerHTML = `
            <img src="${this.favorites[currentIndex]}" class="slideshow-img">
            <button id="stopSlideshow">⏹ Stop</button>
        `;
    
        document.body.appendChild(slideshowContainer);
    
        const intervalId = setInterval(() => {
            currentIndex = (currentIndex + 1) % this.favorites.length;
            slideshowContainer.querySelector("img").src = this.favorites[currentIndex];
        }, 2000);
    
        document.getElementById("stopSlideshow").addEventListener("click", () => {
            clearInterval(intervalId);
            slideshowContainer.remove();
        });
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

    async fetchBreedDogs(breed, page = 1) {
        this.currentBreed = breed;
        this.currentPage = page;
    
        const resultDiv = document.getElementById("result");
        resultDiv.innerHTML = `<div class="loader"></div><p>Loading ${breed}s...</p>`;
    
        try {
            const response = await fetch(
                `https://dog.ceo/api/breed/${breed}/images/random/${3 * page}` 
            );
            const data = await response.json();
            this.displayDogs(data.message, breed);
            
            if (page < 3) { 
                resultDiv.innerHTML += `
                    <button id="loadMoreBtn" style="margin-top: 20px;">⬇Load More ${breed}s</button>
                `;
                document.getElementById("loadMoreBtn").addEventListener("click", () => 
                    this.fetchBreedDogs(breed, page + 1)
                );
            }
        } catch (error) {
            resultDiv.innerHTML = `<p>Couldn't load ${breed} pics. Try again!</p>`;
        }
    }
    
    displayDogs(dogUrls, title, breedInfo = null) {
        const resultDiv = document.getElementById("result");
        
        const dogImages = dogUrls.map(url => `
            <div class="dog-container">
                <img src="${url}" class="dog-image">
                <button class="favorite-btn" data-url="${url}">❤️ Save</button>
            </div>
        `).join("");
    
        const breedDetails = breedInfo ? `
            <div class="breed-info">
                <h3>${title} Info</h3>
                <p><strong>Temperament:</strong> ${breedInfo.temperament || "Unknown"}</p>
                <p><strong>Lifespan:</strong> ${breedInfo.life_span || "N/A"}</p>
            </div>
        ` : "";
    
        resultDiv.innerHTML = `
            <h2>${title}</h2>
            ${breedDetails}
            <div class="dog-grid">${dogImages}</div>
            <p>More ${title}? Click again!</p>
        `;
    
        resultDiv.addEventListener('click', (e) => {
            if (e.target.classList.contains('favorite-btn')) {
                e.preventDefault();
                this.addToFavorites(e.target.dataset.url);
            }
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
    
        countElement.textContent = `${this.favorites.length} saved`; 

        if (this.favorites.length === 0) {
            section.style.display = 'none';
            return;
        } else {
            section.style.display = 'block';
            container.innerHTML = this.favorites.map(url => `
                <div class="dog-container">
                    <img src="${url}" class="dog-image">
                    <button class="remove-btn" data-url="${url}"> Remove</button>
                </div>
            `).join("");
        }

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
        document.getElementById("premiumBtn").addEventListener("click", () => this.fetchPremiumDogs());
        document.getElementById("slideshowBtn").addEventListener("click", () => this.startSlideshow());
        document.getElementById("clearFavoritesBtn").addEventListener("click", () => this.clearAllFavorites());
        document.getElementById("fetchBtn").addEventListener("click", () => this.fetchRandomDogs());
        document.getElementById("breedSelect").addEventListener("change", (e) => {
            const breed = e.target.value;
            if (breed) this.fetchBreedDogs(breed);
        });
    }
}

class PremiumDogGallery extends DogGallery {
    constructor() {
        super(); 
        this.premiumBreeds = ["shiba", "poodle", "bulldog"]; 
    }

    async fetchPremiumDogs() {
        const randomBreed = this.premiumBreeds[Math.floor(Math.random() * this.premiumBreeds.length)];
        await this.fetchBreedDogs(randomBreed);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.dogApp = new PremiumDogGallery(); 
});