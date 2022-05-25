import React, { useState } from "react";

const FolderTree = (props) => {

  const [showLinkEntry, setShowLinkEntry] = useState(false)
  const [linkText, setLinkText] = useState("")

  const passParents = (path) => {
    props.getSubDirs(path)
  }

  const setCollapsed = (path) => {
    console.log("Setting collapsed:", path)
    props.setCollapsed(path)
  }

  const handleExpand = (path, expanded) => {
    console.log("expanded:", expanded)
    if (expanded) {
      setCollapsed(path)
    } else {
      passParents(path)
    }
  }

  const handleAddLink = () => {
    setShowLinkEntry(true)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && e.target.value != '') {
      console.log("Enter pressed")
      // setLinkText(e.target.value)
      // this.props.onKey(str);
    }
  }

  const addLinkBtn = (
    showLinkEntry 
      ? <button onClick={() => setShowLinkEntry(false)}>Hide Links</button>
      : props.links.length !== 0 
        ? <button onClick={() => setShowLinkEntry(true)}>Show Links</button>
        : <button onClick={() => handleAddLink()}>Add Link</button>
  )

  const linkEntry = (
    <input 
      // className='linkInput'
      value={linkText}
      onKeyDown={handleKey}
      onChange={e => {setLinkText(e.target.value)}}
    />
  )

  // const linkSection = (
  //   // props.links.map((link, index) => {
  //   //   return (
  //   //     <div>
  //   //       <input
  //   //         value={test}
  //   //       />
  //   //       <p>{link}</p>
  //   //     </div>
  //   //   )
  //   // })
    
          
  // )

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
          expanded = {child.expanded}
          setCollapsed = {setCollapsed}
        />
      )
    })
  )

  return (
    <div>
        <div>
          <h4>
            <button onClick={() => handleExpand(props.path, props.expanded)}>
              {props.expanded ? '-' : '+'}
            </button> 
            {props.name} 
            {addLinkBtn}
          </h4>
          {showLinkEntry && linkEntry}
        </div>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', left: 25, borderLeft: '1px solid', paddingLeft: 10 }}>
          {props.expanded && childPaths}
        </div>
    </div>
    
  )
}

export default FolderTree