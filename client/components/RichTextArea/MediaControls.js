import React, { Component } from "react";
import PropTypes from "prop-types";
import { AtomicBlockUtils, EditorState } from "draft-js";

class MediaControls extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: props.editorState,
      showURLInput: false,
      url: "",
      urlType: ""
    };

    this.onChange = props.onChange;

    this.onURLChange = e => this.setState({ urlValue: e.target.value });
    this.addImage = this.addImage.bind(this);
    this.addVideo = this.addVideo.bind(this);
    this.confirmMedia = this.confirmMedia.bind(this);
    this.onURLInputKeyDown = this.onURLInputKeyDown.bind(this);
    this.fileUpload = this.fileUpload.bind(this);
  }

  confirmMedia(e) {
    e.preventDefault();
    const { urlValue, urlType } = this.state;
    const editorState = this.props.editorState;
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      urlType,
      "IMMUTABLE",
      { src: urlValue }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity
    });
    // Clear inputs
    this.setState(
      {
        showURLInput: false,
        urlValue: ""
      },
      () => {
        setTimeout(() => this.focus(), 0);
      }
    );
    // Set new editor state
    this.onChange(
      AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, " ")
    );
  }

  onURLInputKeyDown(e) {
    if (e.which === 13) {
      this.confirmMedia(e);
    }
  }
  promptForMedia(type) {
    this.setState(
      {
        showURLInput: true,
        urlValue: "",
        urlType: type
      },
      () => {
        setTimeout(() => document.getElementById("mediaPath").focus(), 0);
      }
    );
  }

  addImage() {
    this.promptForMedia("image");
  }
  addVideo() {
    this.promptForMedia("video");
  }

  fileUpload() {
    let file = document.querySelector("#post-upload").files[0],
      urlType = this.state.urlType;

    let formData = new FormData();
    formData.append("image", file);
    // Post form data
    /*
    in the action, need to set the Content-type:
    axios.post('upload_file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    */
  }

  render() {
    let urlInput;
    if (this.state.showURLInput) {
      urlInput = (
        <div>
          <input
            onChange={this.onURLChange}
            id="mediaPath"
            type="text"
            value={this.state.urlValue}
            onKeyDown={this.onURLInputKeyDown}
          />
          <input
            type="file"
            onChange={this.fileUpload}
            name={this.state.urlType}
            id="post-upload"
          />
          <button onMouseDown={this.confirmMedia}>Confirm</button>
        </div>
      );
    }
    return (
      <div>
        <div style={{ marginBottom: 10 }}>
          Use the buttons to add audio, image, or video.
        </div>
        <div style={{ marginBottom: 10 }}>
          Here are some local examples that can be entered as a URL:
          <ul>
            <li>media.png</li>
            <li>media.mp4</li>
          </ul>
        </div>
        <div>
          <button onMouseDown={this.addImage} style={{ marginRight: 10 }}>
            Add Image
          </button>
          <button onMouseDown={this.addVideo} style={{ marginRight: 10 }}>
            Add Video
          </button>
        </div>
        {urlInput}
      </div>
    );
  }
}

export default MediaControls;
