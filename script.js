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
}