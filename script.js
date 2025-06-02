class DogGallery {
    constructor() {
        this.breeds = [];
        this.favorites = JSON.parse(localStorage.getItem('dogFavorites')) || [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const dogApp = new DogGallery();
});

async init() {
    await this.loadBreeds();
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