import React, { Component } from 'react';
import './App.css';
import Main from './Component/MainComponent';
import { BrowserRouter, Switch, Route } from 'react-router-dom';


class App extends Component {

  
  render(){
    return (
      <div className="App">
        <BrowserRouter>
          <Switch>
            <Route path = '/' component = {props => <Main {...props}/>}/>
            {/* <Route path = '/chat' component = {props => <ChatComponent   {...props}/>}/> */}
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
