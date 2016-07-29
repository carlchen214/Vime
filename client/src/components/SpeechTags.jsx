'use strict';

export default class SpeechTags extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
      {tags.map((tag) => {
        <div key={tag.id}>tag.value</div>
        <br />
      })}
      </div>
    )
  }
}

SpeechTags.propTypes = { tags: React.PropTypes.array.isRequired };
