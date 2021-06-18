import * as React from 'react';
import * as ReactDOM from 'react-dom';
import img from './github.svg';

const Component = () => (
  <div>
    <div>Hello World!!! Mode={process.env.NODE_ENV}</div>
    <img src={img} />
  </div>
);

ReactDOM.render(<Component />, document.getElementById('root'));
