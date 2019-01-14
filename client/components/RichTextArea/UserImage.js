import React from "react";

export default function UserImage(props) {
  console.log(JSON.stringify(props));
  const entity = props.contentState.getEntity(props.block.getEntityAt(0));
  console.log(JSON.stringify(entity.getData()));

  const { src } = entity.getData();
  const backgroundImageUrl = `url(${src})`;
  return <img src={src} style={{ maxWidth: 200, maxHeight: 200 }} />;
}
