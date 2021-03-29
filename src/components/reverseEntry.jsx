import * as React from "react";

export default class ReverseEntry extends React.Component {
  constructor(props){
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.focusLoss = this.focusLoss.bind(this);
    this.state = {
      text: ''
    }
  }

  focusLoss(){
    this.props.trimPath(this.state.text);
  }

  handleChange(event){
    this.setState({
      text: event.target.value
    }, () => {
      this.props.trimPath(this.state.text);
    });
    
  }

  render(){

    return(
      <input 
        value={this.state.text} 
        onChange={this.handleChange}
        //onBlur={this.focusLoss}
      />
    )
  }
}