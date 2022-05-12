import React from "react";

const FolderTree = (props) => {
  return (
    <span onClick={() => props.getSubDirs(props.topDir)}>
      <h4>{props.topDir}</h4>
    </span>
    
  )
}

export default FolderTree