import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Footer from './Footer';
import Header from './Header';
import Home from './Home';
import './static/home.css';
import './static/search.css';
import Head from './Head';

ReactDOM.render(
  <React.StrictMode>
    <Head />
    <Header />
    <Home />
    <Footer />
  </React.StrictMode>,
  document.getElementById('root')
);
