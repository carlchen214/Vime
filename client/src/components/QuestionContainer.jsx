import React from 'react';
import Record from './Record.jsx';

export default class QuestionContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div> 
        <div className="center-align">
          <h2> Ask the world a question! </h2>
        </div>
        <Record />
      </div>
    );
  }
}
