class DogGallery {
    constructor() {
        this.breeds = [];
        this.favorites = JSON.parse(localStorage.getItem('dogFavorites')) || [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const dogApp = new DogGallery();
});