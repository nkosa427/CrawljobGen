import React, { useState } from "react";

const FolderTree = (props) => {

  const [expanded, setExpanded] = useState(false)

  const passParents = (path) => {
    // console.log("path:", props.path, "arg:", name)
    console.log("FT path:", path,)
    // arr.push(props.name)
    props.getSubDirs(path)
  }

  const handleExpand = (path) => {
    setExpanded(!expanded)
    passParents(path);
  }

  const childPaths = (
    props.children.map((child, index) => {
      return (
        <FolderTree
          key = {index}
          name = {child.name}
          path = {child.path}
          links = {child.links}
          parent = {props.name}
          children = {child.children}
          getSubDirs = {passParents}
          traversed = {false}
        />
      )
    })
  )

  return (
    <div>
        <div>
          <h4>{props.name} <button onClick={() => handleExpand(props.path)}>{expanded ? '-' : '+'}</button> </h4>
        </div>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', left: 25, borderLeft: '1px solid', paddingLeft: 10 }}>
          {expanded && childPaths}
        </div>
    </div>
    
  )
}

export default FolderTree