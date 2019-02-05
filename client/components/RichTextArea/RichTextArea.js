import React, { Component } from "react";
import PropTypes from "prop-types";

import {
  EditorState,
  RichUtils,
  ContentState,
  DefaultDraftBlockRenderMap,
  AtomicBlockUtils,
  CompositeDecorator,
  ContentBlock,
  convertToRaw,
  getDefaultKeyBinding
} from "draft-js";
import Editor from "draft-js-plugins-editor";
import InlineStyleControls from "./InlineStyleControls";
import BlockStyleControls from "./BlockStyleControls";
import MediaControls from "./MediaControls";
import UndoControls from "./UndoControls";
import { Map } from "immutable";

export default class RichTextArea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      editable: true
    };
    this.focus = () => this.refs.editor.focus();
    this.logState = () => {
      const content = this.state.editorState.getCurrentContent();
      console.log(convertToRaw(content));
    };
    this.onChange = editorState => this.setState({ editorState });

    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.mapKeyToEditorCommand = this._mapKeyToEditorCommand.bind(this);
    this.toggleBlockType = this._toggleBlockType.bind(this);
    this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
    this.getMediaEntities = this._getMediaEntities.bind(this);
    this.toggleEditable = this._toggleEditable.bind(this);
  }

  _getMediaEntities(e) {
    let imageBlockArray = getEntities(this.state.editorState, "image");
    let videoBlockArray = getEntities(this.state.editorState, "video");
    console.log(
      getDataArrayFromEntityBlocks(imageBlockArray.concat(videoBlockArray))
    );
  }

  /*    KEY BINDINGS    */
  // Used to add a key command by returning the key command
  _mapKeyToEditorCommand(e) {
    console.log(e.keyCode);
    if (e.keyCode === 9 /* TAB */) {
      const newEditorState = RichUtils.onTab(
        e,
        this.state.editorState,
        4 /* maxDepth */
      );
      if (newEditorState !== this.state.editorState) {
        this.onChange(newEditorState);
      }
      return;
    }
    return getDefaultKeyBinding(e);
  }

  // Used to handle the key commands set in mapKeyToEditorCommand
  _handleKeyCommand(command, editorState) {
    // Handles default key commands
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return "handled";
    }
    return "not-handled";
  }

  /*    Block   */
  _toggleBlockType(blockType) {
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, blockType));
  }

  /*    Inline    */
  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle)
    );
  }

  _toggleEditable() {
    this.setState({ editable: !this.state.editable });
  }

  render() {
    return (
      <div>
        <BlockStyleControls
          editorState={this.state.editorState}
          onToggle={this.toggleBlockType}
        />
        <InlineStyleControls
          editorState={this.state.editorState}
          onToggle={this.toggleInlineStyle}
        />
        <MediaControls
          editorState={this.state.editorState}
          onChange={this.onChange}
        />
        <UndoControls
          editorState={this.state.editorState}
          onChange={this.onChange}
        />
        <div onClick={this.focus}>
          <Editor
            readOnly={!this.state.editable}
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            blockRendererFn={mediaBlockRenderer}
            editorState={this.state.editorState}
            handleKeyCommand={this.handleKeyCommand}
            keyBindingFn={this.mapKeyToEditorCommand}
            onChange={this.onChange}
            onTab={this.mapKeyToEditorCommand}
            placeholder="Enter some text..."
            ref="editor"
            spellCheck={true}
          />
        </div>
        <input onClick={this.logState} type="button" value="Log State" />
        <input
          onClick={this.getMediaEntities}
          type="button"
          value="Alert media entities"
        />
        <input
          onClick={this.toggleEditable}
          type="button"
          value="Toggle editable"
        />
      </div>
    );
  }
}

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2
  }
};

// Adds a class to a certain block-type for styling in css
function getBlockStyle(block) {
  switch (block.getType()) {
    case "blockquote":
      return "RichEditor-blockquote";
    default:
      return null;
  }
}

/* Media */
function mediaBlockRenderer(block) {
  if (block.getType() === "atomic") {
    return {
      component: Media,
      editable: false
    };
  }
  return null;
}

const Image = props => {
  return <img src={props.src} />;
};
const Video = props => {
  const youtubePattern = new RegExp(/youtube/i);
  if (youtubePattern.test(props.src)) {
    return <iframe width="420" height="315" src={props.src} />;
  } else {
    return (
      <video width="400" controls>
        <source src={props.src} type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
    );
  }
};
const Media = props => {
  const entity = props.contentState.getEntity(props.block.getEntityAt(0));
  const { src } = entity.getData();
  const type = entity.getType();
  let media;
  if (type === "image") {
    media = <Image src={src} />;
  } else if (type === "video") {
    media = <Video src={src} />;
  }
  return media;
};

/*  ENTITY HELPERS  */
const getEntities = (editorState, entityType = null) => {
  const content = editorState.getCurrentContent();
  const entities = [];
  content.getBlocksAsArray().forEach(block => {
    let selectedEntity = null;
    block.findEntityRanges(
      character => {
        if (character.getEntity() !== null) {
          const entity = content.getEntity(character.getEntity());
          if (!entityType || (entityType && entity.getType() === entityType)) {
            selectedEntity = {
              entityKey: character.getEntity(),
              blockKey: block.getKey(),
              entity: content.getEntity(character.getEntity())
            };
            return true;
          }
        }
        return false;
      },
      (start, end) => {
        entities.push({ ...selectedEntity, start, end });
      }
    );
  });
  return entities;
};

// Can only pass array of entityBlocks
const getDataArrayFromEntityBlocks = entityBlocks => {
  let dataArray = [];
  for (let i = 0; i < entityBlocks.length; i++) {
    dataArray.push(entityBlocks[i].entity.data);
  }
  return dataArray;
};

/* Used to surround a regex with a component
const regexStratergy = (block, callback) => {
  const text = block.getText();
  let result;
  let regex = /(^|\s)#\w+/g;
  while ((result = regex.exec(text)) != null) {
    console.log(block.getText());
    let start = result.index;
    let end = start + result[0].length;
    callback(start, end);
  }
};

const regexComponent = props => (
  <span style={{ backgroundColor: "lightgreen" }}>{props.children}</span>
);

const compositeDecorator = new CompositeDecorator([
  {
    strategy: regexStratergy,
    component: regexComponent
  }
]);
*/
