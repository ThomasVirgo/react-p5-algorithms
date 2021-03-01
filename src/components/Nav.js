import React, {useState} from 'react';

const Nav = (props) => {

    const handlePageChange = (event) => {
        props.changePage(event.target.name); 
    }

    return (
        <div id = 'nav' className = 'nav'>
            <div id='link-container' className = 'link-container'>
                <button onClick = {handlePageChange} name = 'rockets' className='button2'>Smart Rockets: Gentic Algorithms</button>
                <button onClick = {handlePageChange} name = 'paths' className='button2'>Pathfinding Algorithms</button> 
            </div>
        </div>
    )
}

export default Nav;