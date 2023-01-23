import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import LinkSection from "./linkSection.jsx";

const FolderTree = forwardRef((props, ref) => {

  const [showLinkEntry, setShowLinkEntry] = useState(false)
  const [linkText, setLinkText] = useState("")
  const [showAddFolder, setShowAddFolder] = useState(false)
  const [folderText, setFolderText] = useState("")
  const [isHovering, setIsHovering] = useState(false);

  const childRef = useRef()

  useImperativeHandle(ref, () => ({
    hideLinkEntries() {
      setShowLinkEntry(false)
      // console.log("hideLinkEntries called in", props.path)
      if (props.children.length > 0) {
        childRef.current.hideLinkEntries()
      }
    }
  }))

  const passPath = (path) => {
    props.getSubDirs(path)
  }

  const printDirs = (path) => {
    props.printDir(path)
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

  const handleKeyLink = (e) => {
    if (e.key === 'Enter' && e.target.value != '') {
      console.log("Enter pressed")
      handleAddLink(e.target.value, props.path)
      setLinkText("")
    }
  }

  const printDirLinks = () => {
    printDirs(props.path)
  }

  const addLinkBtn = (
    props.links.length !== 0
    ? showLinkEntry
      ? <button onClick={() => setShowLinkEntry(false)}>
          Hide
        </button>
      : <button onClick={() => setShowLinkEntry(true)}>
          Show
        </button>
    : showLinkEntry 
      ? <button onClick={() => setShowLinkEntry(false)}>
          Hide
        </button>
      : isHovering && 
        <button onClick={() => setShowLinkEntry(true)}>
          {props.links.length !== 0 ? "Show" : "Add Links"}
        </button>
  )

  const linkEntry = (
    <input 
      type="textarea"
      className='linkInput'
      value={linkText}
      onKeyDown={handleKeyLink}
      onChange={e => {setLinkText(e.target.value)}}
    />
  )

  const handleDelete = (link, path) => {
    props.handleDelete(link, path)
  }

  const sendNewDir = (dir, path) => {
    props.handleAddDirectory(dir, path)
  }

  const addFolder = (dir) => {
    if ( dir !== undefined && dir != '') {
      sendNewDir(dir, props.path)
    }
    setFolderText("")
    setShowAddFolder(false)
  }

  const handleKeyFolder = (e) => {
    if (e.key === 'Enter') {
      console.log("Enter pressed")
      addFolder(e.target.value)
    }
  }

  const addFolderInput = (
    <div>
      <input 
        className='linkInput'
        value={folderText}
        onKeyDown={handleKeyFolder}
        onChange={e => {setFolderText(e.target.value)}}
      />
      <button onClick={() => addFolder(folderText)}>Add Folder</button>
    </div>
  )

  const LabelSection = ({ handleMouseOver, handleMouseOut }) => {
    return(
      <div onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
        <h4>
          <button onClick={() => handleExpand(props.path, props.expanded)}>
            {props.expanded ? '-' : '+'}
          </button> 
          {props.name} 
          {addLinkBtn}
          {isHovering && <button onClick={() => setShowAddFolder(true)}>Add Directory</button>}
          {isHovering && <button onClick={() => printDirLinks()}>Print</button>}
        </h4>
      </div>
    )
  }

  const handleMouseOver = () => {
    setIsHovering(true);
  };

  const handleMouseOut = () => {
    setIsHovering(false);
  };

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
          handleDelete = {handleDelete}
          ref = {childRef}
          handleAddDirectory = {sendNewDir}
          printDir = {printDirs}
        />
      )
    })
  )

  return (
    <div>
        <LabelSection 
          handleMouseOver={handleMouseOver}
          handleMouseOut={handleMouseOut} 
        />
          
        {/* <div  handleMouseOver={handleMouseOver}
          handleMouseOut={handleMouseOut} >
        <h4>
          <button onClick={() => handleExpand(props.path, props.expanded)}>
            {props.expanded ? '-' : '+'}
          </button> 
          {props.name} 
          {addLinkBtn}
          {isHovering && <button onClick={() => handleAddDirectory(props.path)}>Add Directory</button>}
        </h4>
        </div> */}
        {showAddFolder && addFolderInput}
        {showLinkEntry && linkEntry}
        {props.links.length !== 0 && showLinkEntry && 
          <LinkSection 
            links = {props.links}
            path = {props.path}
            handleDelete = {handleDelete}
          />
        }
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', left: 25, borderLeft: '1px solid', paddingLeft: 10 }}>
        {props.expanded && childPaths}
      </div>
    </div>
    
  )
})

export default FolderTree