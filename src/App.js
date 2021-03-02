import './App.css';
import React, {useState, useEffect} from 'react';
import SmartRockets from './components/SmartRockets';
import Nav from './components/Nav';
import PathFinder from './components/PathFinder';
import Sort from './components/Sort';

function App() {
  const [page, setPage] = useState('rockets');

  const pages = {
    'rockets': <SmartRockets page = {page}/>,
    'paths': <PathFinder page = {page}/>,
    'sort':<Sort page = {page}/>,
  }

  const changePage = (newPage) => {
    setPage(newPage)
  }

  let currentPage = pages[page];

  return (
    <div className='main'>
      <Nav pages={pages} changePage={changePage}/>
      <div id='page' className='page'>
        {currentPage}
      </div>
    </div>
  );
}

export default App;
