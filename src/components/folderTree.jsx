import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import LinkSection from "./linkSection.jsx";

const FolderTree = forwardRef((props, ref) => {

  const [showLinkEntry, setShowLinkEntry] = useState(false)
  const [linkText, setLinkText] = useState("")
  const [showAddFolder, setShowAddFolder] = useState(false)
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
      className='linkInput'
      value={linkText}
      onKeyDown={handleKey}
      onChange={e => {setLinkText(e.target.value)}}
    />
  )

  const handleDelete = (link, path) => {
    props.handleDelete(link, path)
  }

  const handleAddDirectory = (path) => {
    console.log("Add dir to", path)
  }

  const LabelSection = ({ handleMouseOver, handleMouseOut }) => {
    return(
      <div onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
        <h4>
          <button onClick={() => handleExpand(props.path, props.expanded)}>
            {props.expanded ? '-' : '+'}
          </button> 
          {props.name} 
          {addLinkBtn}
          {isHovering && <button onClick={() => handleAddDirectory(props.path)}>Add Directory</button>}
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