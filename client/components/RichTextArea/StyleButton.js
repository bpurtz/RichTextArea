import PropTypes from "prop-types";
import React from "react";

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = e => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }
  render() {
    let className = "RichEditor-styleButton";
    if (this.props.active) {
      className += " RichEditor-activeButton";
    }
    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}
StyleButton.propTypes = {
  onToggle: PropTypes.func.isRequired,
  style: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired
};

export default StyleButton;
