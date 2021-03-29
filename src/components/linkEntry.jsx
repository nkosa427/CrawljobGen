import * as React from "react";

export default class LinkEntry extends React.Component {
  constructor(props){
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleKey = this.handleKey.bind(this);
    this.editLink = this.editLink.bind(this);
    this.state = {
      text: '',
      index: this.props.index
    }
  }

  handleChange(event){
    this.setState({
      text: event.target.value
    })
  }

  handleKey(e){
    let str = e.target.value;
    if (e.key === 'Enter' && str != '') {
      this.setState({
        text: ''
      })
      this.props.onKey(str);
    }
  }

  editLink(){
    this.props.editLink(this.props.link);
  }

  render(){
    let inputForm;
    if (this.props.isDisabled){
      inputForm = <div><input 
        className='linkInput'
        value={this.props.link} 
        onKeyDown={this.props.onKey}
        onChange={this.handleChange}
        disabled={true}
      />
      <button onClick={this.editLink}>Remove</button>
      </div>
    } else {
      inputForm = <div><input 
        className='linkInput'
        value={this.state.text}
        onKeyDown={this.handleKey}
        onChange={e => {this.setState({text: e.target.value})}}
      /></div>
    }

    return(
      <div>
        {inputForm}
      </div>
      
    )
  }
}