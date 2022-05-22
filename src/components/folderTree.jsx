import React from "react";

const FolderTree = (props) => {


  const passParents = (path) => {
    // console.log("path:", props.path, "arg:", name)
    console.log("FT path:", path,)
    // arr.push(props.name)
    props.getSubDirs(path)
  }

  const handleExpand = (path) => {
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
        />
      )
    })
  )

  return (
    <div>
        <h4 onClick={() => handleExpand(props.path)}>{props.name}</h4>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', left: 25, borderLeft: '1px solid', paddingLeft: 15 }}>
          {childPaths}
        </div>
    </div>
    
  )
}

export default FolderTree