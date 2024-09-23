const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const url = require('url');

let moviesList = [];
let singleMovieQuality = {};
let singleMovieDownloadingLinks = [];

const searchMovieLink = async (movieLink) => {
  //Launching Pupperteer
  const browser = await puppeteer.launch({
    args: ['--disable-features=site-per-process'],
  });
  const page = await browser.newPage();

  await page.goto(movieLink, {
    waitUntil: 'networkidle0',
  });

  const moviefinalLink = await page.evaluate(async () => {
    const movieListRaw = await Array.from(
      document.querySelectorAll('.maxbutton')
    );

    let movieLink = [];

    await movieListRaw.forEach(async (movie) =>
      movieLink.push({
        value: await movie.getAttribute('href'),
        name: await movie.querySelector('.maxbutton>span').textContent.trim(),
      })
    );

    return movieLink;
  });

  await browser.close();
  return moviefinalLink;
};

const searchMovieQuality = async (movieLink) => {
  //Launching Pupperteer
  const browser = await puppeteer.launch({
    args: ['--disable-features=site-per-process'],
  });
  const page = await browser.newPage();

  await page.goto(movieLink, {
    waitUntil: 'networkidle0',
  });

  const movieQualityList = await page.evaluate(async () => {
    const movieListRaw = await Array.from(
      document.querySelectorAll('.maxbutton')
    );
    const movieName = await document
      .querySelector('.imdbwp__title')
      .textContent.trim();
    const moviePoster = await document
      .querySelector('.imdbwp__img')
      .getAttribute('src');
    const movieListFinal = {
      movieName: movieName,
      moviePoster: moviePoster,
      moviequality: [],
    };

    await movieListRaw.forEach(async (movie) =>
      movieListFinal?.moviequality.push({
        value: await movie.getAttribute('href'),
        name: await movie.querySelector('.maxbutton>span').textContent.trim(),
      })
    );

    return movieListFinal;
  });

  await browser.close();
  return movieQualityList;
};

const searchMovies = async (MOVIE_NAME) => {
  //Launching Pupperteer
  const browser = await puppeteer.launch({
    args: ['--disable-features=site-per-process'],
  });
  const page = await browser.newPage();

  await page.goto('http://allmovieshub4u.com/', {
    waitUntil: 'networkidle0',
  });

  //Search Movie
  const inputMovie = await page.waitForSelector('input');

  await inputMovie.type(MOVIE_NAME);

  await page.keyboard.press('Enter');

  await page.waitForNavigation();

  const movieList = await page.evaluate(() => {
    const movieListRaw = Array.from(
      document.querySelectorAll('.inside-article')
    );
    const movieListFinal = [];
    movieListRaw.forEach(async (movie) =>
      movieListFinal.push({
        name: movie
          .querySelector(
            'div:nth-child(1) > header:nth-child(2) > h2:nth-child(1) > a:nth-child(1)'
          )
          .textContent.trim(),
        value: await movie
          .querySelector(
            'div:nth-child(1) > header:nth-child(2) > h2:nth-child(1) > a:nth-child(1)'
          )
          .getAttribute('href'),
        image: await movie
          .querySelector('.attachment-full.size-full.wp-post-image')
          .getAttribute('src'),
      })
    );
    return movieListFinal;
  });
  await browser.close();
  return movieList;
};

//Creating an express app
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

//Setting Template Engines
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '/public')));

//App Route

//Homepage
app.get('/', (req, res) => {
  const movie = req.query.movie;
  res.render('index', {
    title: "Mill's Movies",
    movie: movie,
  });
});

//MoviePage
app.post('/:movie', async (req, res) => {
  const movieName = req.body?.movie;
  if (movieName) {
    moviesList = await searchMovies(movieName);
    if (moviesList) {
      res.setHeader('Content-Type', 'text/html');
      await res.send('Movie Fetched Successfully');
    }
  }
});

app.get('/:movie', (req, res) => {
  if (moviesList.length < 1) {
    res.redirect(
      url.format({
        pathname: '/',
        query: {
          movie: 'Not Found',
        },
      })
    );
  } else {
    res.render('movie', {
      moviesList,
      title: req.params?.movie,
    });
  }
});

//Single Movie Page
app.post('/movie/selected', async (req, res) => {
  const movieLink = req.body?.link;
  if (movieLink) {
    singleMovieQuality = await searchMovieQuality(movieLink);
    if (singleMovieQuality) {
      res.setHeader('Content-Type', 'text/html');
      await res.redirect(`/movie/selected`);
    }
  }
});

app.get('/movie/selected', (req, res) => {
  res.render('singleMovie', {
    singleMovieQuality,
    title: singleMovieQuality.movieName,
    noLink:
      singleMovieQuality.moviequality.length < 1
        ? 'Download Links Not available'
        : '',
  });
});

//Single Movie Page
app.post('/movie/selected/link', async (req, res) => {
  const movieLink = req.body?.link;
  if (movieLink) {
    singleMovieDownloadingLinks = await searchMovieLink(movieLink);
    if (singleMovieDownloadingLinks.length >= 1) {
      res.json(singleMovieDownloadingLinks);
    } else {
      res.json({
        messege: 'Download Links Not available',
      });
    }
  }
});

//Listening to the server
app.listen(3000, () => {
  console.log('Server is listening...');
});
