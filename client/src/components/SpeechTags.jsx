'use strict';

export default class SpeechTags extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
      {this.props.tags.length > 0 ? <h4>Select tags</h4> : null}
      {this.props.tags.map((tag, i) => 
        <div key={i}>{tag}
        </div>
      )}
      </div>
    );
  }
}

SpeechTags.propTypes = { tags: React.PropTypes.array.isRequired };
