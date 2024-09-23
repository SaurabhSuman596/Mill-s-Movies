'use strict';

const searchInputElem = document.querySelector('#movieInput');
const movieNameSpan = document.querySelector('#sapnMovieName');
const movieCard = document.querySelector('#movieCardsingle');
const loaderElem = document.querySelector('.loaderCont');
const params = new URLSearchParams();

searchInputElem?.addEventListener('keyup', (event) => {
  if (event.target.value.length > 0) {
    movieNameSpan.textContent = event.target.value;
  } else {
    movieNameSpan.textContent = 'Movie Name';
  }
});

//Search Movie
const handleMovieSearchButtonClick = () => {
  loaderElem.classList.add('loaderContActive');
  const movieName = document.getElementById('movieInput').value;
  const urlEnd = movieName.replace('/ /g', '+');
  fetch(`/${urlEnd}`, {
    body: JSON.stringify({
      movie: movieName,
    }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => {
      loaderElem.classList.remove('loaderContActive');
      movieNameSpan.textContent = 'Movie Name';
      window.location.href = res.url;
    })
    .catch((err) => {
      console.log(err);
    });
};

//Get Movie
const handleGetSingleMovie = (event) => {
  loaderElem.classList.add('loaderContActive');
  const dataLink = document
    .querySelector(`#${event.target?.parentElement?.id} > a`)
    .getAttribute('href');
  fetch(`/movie/selected`, {
    body: JSON.stringify({
      link: dataLink,
    }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => {
      loaderElem.classList.remove('loaderContActive');
      window.location.href = res.url;
    })
    .catch((err) => {
      loaderElem.classList.remove('loaderContActive');
      console.log(err);
    });
};

//Get Movie
const handlegetDownloadlink = (event) => {
  loaderElem.classList.add('loaderContActive');
  const dataLink = document
    .querySelector(`#${event.target?.parentElement?.id} > a`)
    .getAttribute('href');
  fetch(`/movie/selected/link`, {
    body: JSON.stringify({
      link: dataLink,
    }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => {
      loaderElem.classList.remove('loaderContActive');
      const data = res.json();
      data
        .then((value) => {
          const singleMovieDownloadSec = document.querySelector(
            '#singleMovieDownloadSec'
          );

          singleMovieDownloadSec.innerHTML = value.map(
            (single) =>
              `<button>
              <a href="${single.value}" class="singleDownloadLinka" target="_blank">
              ${single.name}
               </a>
            </button>`
          );
        })
        .catch((err) => {
          loaderElem.classList.remove('loaderContActive');
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
