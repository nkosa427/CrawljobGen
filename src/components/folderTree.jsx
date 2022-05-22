import React from "react";

const FolderTree = (props) => {

  const handleExpand = (path) => {
    console.log(props.children)
    props.getSubDirs(path)
  }

  const childPaths = (
    props.children.map((child, index) => {
      return (
        <FolderTree
          key = {index}
          name = {child.name}
          path = {child.path}
          links = {child.links}
          children = {child.children}
          getSubDirs = {props.getSubDirs}
        />
      )
    })
  )

  return (
    <div>
        <h4 onClick={() => handleExpand(props.path)}>{props.name}</h4>
        <div>
          {childPaths}
        </div>
    </div>
    
  )
}

export default FolderTree