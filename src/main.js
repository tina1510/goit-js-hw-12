import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

import SimpleLightbox from "simplelightbox";

import "simplelightbox/dist/simple-lightbox.min.css";

const form = document.querySelector("form");
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');

function showLoader() {
    loader.classList.remove('hidden');
  }
  
  function hideLoader() {
    loader.classList.add('hidden');
  }
hideLoader()
  

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = event.currentTarget.elements.query.value;
    if (query.length < 3) {
        iziToast.error({
            message: `Your length is not enough. Min 3 letters`,
            position: 'topRight',
        });


    } else {
        renderImages(query);
    }
});

const fetchImages = (query = "") => {
    const searchParams = new URLSearchParams({
        key: `41516813-c0516a6d5bb80b940f21213c5`,
        q: query,
        image_type: `photo`,
        orientation: `horizontal`,
        safesearch: true,
    });
    
    return fetch(`https://pixabay.com/api/?${searchParams}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`Error`);
            }
        })
}

function generateImageGalleryMarkup(images) {

    const imageHTML = images.reduce((html, { webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
        return html + `
            <div class="gallery-item">
                <a href="${largeImageURL}" data-lightbox="image">
                    <img src="${webformatURL}" data-source="${largeImageURL}" alt="${tags}">
                </a>
                <div class="text">
                <div class="text-item"><p class="likes">Likes:</p>
                <p class="likes"> ${likes}</p></div>
                
               <div  class="text-item"> <p class="views">Views: </p>
                <p class="views">${views}</p></div>
               <div  class="text-item"> <p class="comments">Comments:</p>
                <p class="comments"> ${comments}</p></div>
               <div  class="text-item"><p class="downloads">Downloads:</p>
                <p class="downloads"> ${downloads}</p></div>
                
                </div>
                
            </div>`;
    }, '');
    gallery.insertAdjacentHTML("afterbegin", imageHTML);
    return;
 
}

function renderImages(query) {
    showLoader();
    gallery.innerHTML = "";

    fetchImages(query)
        .then(images => {
            hideLoader();
            if (images.hits.length === 0) {
                iziToast.error({
                    message: `Sorry, there are no images matching your search query. Please try again!`,
                    position: 'topRight',
                });
            } else { 
               
                generateImageGalleryMarkup(images.hits);
            const lightbox = new SimpleLightbox('.gallery a', {});
            lightbox.refresh();
        }   
        })
        .catch(error => {
            hideLoader();
            iziToast.error({
                message: `Error`,
                position: 'topRight',
            });}
            );
}
