import { EditorState } from "draft-js";
import PropTypes from "prop-types";
import React from "react";

class UndoControls extends React.Component {
  constructor(props) {
    super(props);
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);
  }

  undo() {
    this.props.onChange(EditorState.undo(this.props.editorState));
  }

  redo() {
    this.props.onChange(EditorState.redo(this.props.editorState));
  }

  render() {
    return (
      <div>
        <button className="btn" onClick={this.undo}>
          <i className="fas fa-undo" />
        </button>
        <button className="btn" onClick={this.redo}>
          <i className="fas fa-redo" />
        </button>
      </div>
    );
  }
}

UndoControls.propTypes = {
  editorState: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

export default UndoControls;
