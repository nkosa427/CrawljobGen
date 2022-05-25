import React, { useState } from "react";

const FolderTree = (props) => {

  const [showLinkEntry, setShowLinkEntry] = useState(false)
  const [linkText, setLinkText] = useState("")

  const passPath = (path) => {
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
      passPath(path)
    }
  }

  const handleAddLink = (link, path) => {
    props.addLink(link, path)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && e.target.value != '') {
      console.log("Enter pressed")
      handleAddLink(e.target.value, props.path)
      setLinkText("")
    }
  }

  const addLinkBtn = (
    showLinkEntry 
      ? <button onClick={() => setShowLinkEntry(false)}>
          Hide Links
        </button>
      : <button onClick={() => setShowLinkEntry(true)}>
          {props.links.length !== 0 ? "Show Links" : "Add"}
        </button>
  )

  const linkEntry = (
    <input 
      // className='linkInput'
      value={linkText}
      onKeyDown={handleKey}
      onChange={e => {setLinkText(e.target.value)}}
    />
  )

  const linkSection = (
    props.links.map((link, index) => {
      return (
        <div>
          <p key={index}>{link}</p>
        </div>
      )
    })
  )

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
          getSubDirs = {passPath}
          expanded = {child.expanded}
          setCollapsed = {setCollapsed}
          addLink = {handleAddLink}
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
        {props.links.length !== 0 && showLinkEntry && linkSection.reverse()}
      </div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', left: 25, borderLeft: '1px solid', paddingLeft: 10 }}>
        {props.expanded && childPaths}
      </div>
    </div>
    
  )
}

export default FolderTree