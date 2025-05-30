fetch("https://dog.ceo/api/breeds/list/all")
    .then((response) => response.json())
    .then((data) => {
        const breeds = Object.keys(data.message);
        const breedSelect = document.getElementById("breedSelect");

        breeds.forEach((breed) => {
            const option = document.createElement("option");
            option.value = breed;
            option.textContent = breed;
            breedSelect.appendChild(option);
        });
    })
    .catch((error) => {
        console.error("Error fetching breeds:", error);
    });

document.getElementById("fetchBtn").addEventListener("click", function () {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `<div class="loader"></div><p>Fetching random dogs...</p>`;
    
    Promise.all([
        fetch("https://dog.ceo/api/breeds/image/random").then(res => res.json()),
        fetch("https://dog.ceo/api/breeds/image/random").then(res => res.json()),
        fetch("https://dog.ceo/api/breeds/image/random").then(res => res.json())
    ])
    .then((dogs) => {
        const dogImages = dogs.map(dog => `<img src="${dog.message}" class="dog-image">`).join("");
        resultDiv.innerHTML = `
            <div class="dog-grid">${dogImages}</div>
            <p>More dogs? Click again!</p>
        `;
    })
    .catch((error) => {
        resultDiv.innerHTML = `<p> Failed to load dogs. Try again!</p>`;
    });
});

document.getElementById("breedSelect").addEventListener("change", function (e) {
    const breed = e.target.value;
    if (!breed) return;

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `<div class="loader"></div><p>Loading ${breed}s...</p>`;

    fetch(`https://dog.ceo/api/breed/${breed}/images/random/3`)
        .then((response) => response.json())
        .then((data) => {
            if (data.message.length === 0) {
                resultDiv.innerHTML = `<p>No ${breed} pics found </p>`;
                return;
            }
            const dogImages = data.message.map(img => `<img src="${img}" class="dog-image">`).join("");
            resultDiv.innerHTML = `
                <div class="dog-grid">${dogImages}</div>
                <p>More ${breed}s? Select again!</p>
            `;
        })
        .catch((error) => {
            resultDiv.innerHTML = `<p> Couldn't load ${breed} pics. Try another breed!</p>`;
        });
});