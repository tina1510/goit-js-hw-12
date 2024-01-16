
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import axios from "axios";

const form = document.querySelector("form");
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const loadBtn = document.querySelector('.button-load');

const lightbox = new SimpleLightbox('.gallery a', {});


function showLoader() {
    loader.classList.remove('hidden');
}

function hideLoader() {
    loader.classList.add('hidden');
}

    loadBtn.classList.add("hidden");
    hideLoader()


const fetchImages = async ({ query = "", page = 1, perPage = 40 }) => {

   
    const searchParams = new URLSearchParams({
        key: `41516813-c0516a6d5bb80b940f21213c5`,
        q: query,
        image_type: `photo`,
        orientation: `horizontal`,
        safesearch: true,
        page: page,
        per_page: perPage,
    });

    try {
        const response = await axios.get(`https://pixabay.com/api/?${searchParams}`)
        return response.data;
    } catch (error) {
        iziToast.error({
            message: `Error`,
            position: 'topRight',
        });
    }
}

let isLastPage = false; 

const createImageRequest = (query) => {
    let firstPage = 1;
    const perPage = 40;

    return async () => {
        try {
            const { hits, total } = await fetchImages({ page: firstPage, perPage, query});

            if (firstPage >= Math.ceil(total / perPage)) {
                isLastPage = true;
            }
        
            firstPage += 1;

            return hits;
        } catch (error) {
            iziToast.error({
                message: `Error`,
                position: 'topRight',
            });
        }
    };
}

let doFetch = null;



form.addEventListener("submit", async (event) => {
    event.preventDefault();
  const query = event.currentTarget.elements.query.value;
    gallery.innerHTML = "";
    isLastPage = false;



    if (doFetch !== null) {
        loadBtn.removeEventListener("click", doFetch);
    }

    const fetchHits = createImageRequest(query);
    doFetch = async () => {
        showLoader();
       
        const images = await fetchHits();
        await renderImages(images);
        hideLoader();
    };
    await doFetch();
    

    loadBtn.addEventListener("click", async () =>{

       await doFetch()
         const elem = document.querySelector(".gallery-item");
        const rect = elem.getBoundingClientRect().height;
        await window.scrollBy(0, rect * 2);
    }
     );
});



function generateImageGalleryMarkup(images) {
    const imageHTML = images.reduce((html, { webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
        return html + `
            <div class="gallery-item">
                <a href="${largeImageURL}" data-lightbox="image">
                    <img src="${webformatURL}" data-source="${largeImageURL}" alt="${tags}">
                </a>
                <div class="text-container">
                    <div class="text-item"><p class="text">Likes:</p>
                        <p class="likes"> ${likes}</p></div>
                    <div class="text-item"> <p class="text">Views: </p>
                        <p class="views">${views}</p></div>
                    <div class="text-item"> <p class="text">Comments:</p>
                        <p class="comments"> ${comments}</p></div>
                    <div class="text-item"><p class="text">Downloads:</p>
                        <p class="downloads"> ${downloads}</p></div>
                </div>
            </div>`;
    }, '');
    gallery.insertAdjacentHTML("beforeend", imageHTML); 
}

async function renderImages(images) {
    try {

        if (images.length === 0) {
            iziToast.error({
                message: `Sorry, there are no images matching your search query. Please try again!`,
                position: 'topRight',
            });
        } else {
            generateImageGalleryMarkup(images);

            lightbox.refresh();
            if (isLastPage) {
                loadBtn.classList.add("hidden");
                iziToast.info({
                    message: `We're sorry, but you've reached the end of search results.`,
                    position: 'topRight',
                });
            } else {
                loadBtn.classList.remove("hidden");
            }
        }
    } catch (error) {
        hideLoader();
        iziToast.error({
            message: `Error`,
            position: 'topRight',
        });
        throw new Error(`Error`);
    }
    
}

