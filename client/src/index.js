import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

export const BASE_URL =
    process.env.NODE_ENV !== 'production'
        ? 'http://localhost:4000'
        : 'https://board.gordondoskas.com';

ReactDOM.render(<App />, document.getElementById('root'));
