import React, {Component} from 'react';
import { Form, FormGroup, Button } from 'reactstrap';
import {Input} from '@material-ui/core';
import io from 'socket.io-client';

class Main extends Component {

    constructor(props){
        super(props);
        this.state = {
            roomName : '',
            password : '',
            valid : false,
            name : "",
            message : '',
            chat : '',
            isTyping : false,
            typeName : ''
        }
    }

    componentDidMount(){
        // make connection
        this.socket = io.connect('localhost:9000')

        // if room already exists
        this.socket.on('matched', (message) => {
            if(message === true){
                // change UI to chat
                this.setState({
                    valid : true
                })
            }
            else{
                alert('The room credentials do not match');
            }
        })

        // new room formed
        this.socket.on('newRoom', message => {
            if(message === true){
                // change UI to chat
                this.setState({
                    valid : true
                })                
            }
        })


        // handle new chat info
        this.socket.on('receiveChat', message => {
            var chatNew = [...this.state.chat]
            chatNew.push(message);
            this.setState({
                chat : chatNew
            })
        })

        // show UI change if a person types
        this.socket.on('isTyping', (name) => {
            this.setState({
                typeName : name
            })
        })

        // stop UI change if a person has stopped typing
        this.socket.on('typeStop', () => {
            this.setState({
                typeName : ''
            })
        })
    }

    handleNameChange = (e) => {
        this.setState({
            [e.target.name] : e.target.value  
        })
    }

    handlePasswordChange = (e) => {
        this.setState({
            [e.target.name] : e.target.value  
        })
    }

    startChat = (event) => {
        event.preventDefault();
        var data = {
            name : this.state.roomName,
            password : this.state.password
        }
        // check creds from DB
        this.socket.emit('checkCreds',data);
    }

    // chat logic
    sendChat = (e) => {
        e.preventDefault();
        
        // create msg object
        var data = {
            name : this.state.name,
            message : this.state.message
        }
        this.setState({
            message : ''
        })
        // send message to server
        this.socket.emit('msg', data, this.state.roomName)
        this.socket.emit('stoppedTyping', this.state.roomName);
    }

    // change name of the user
    handleName = (e) => {
        this.setState({    
            [e.target.name] : e.target.value
        })
    }

    // handle message type
    handleMessage = (e) => {
        if(e.target.value !== ''){
            this.socket.emit('typing', this.state.name, this.state.roomName)
            this.setState({    
                [e.target.name] : e.target.value
            })
        }
        else{
            console.log('stopped typing')
            this.socket.emit('stoppedTyping', this.state.roomName);
            this.setState({    
                [e.target.name] : e.target.value
            })
        }
    }

    // send typing to server with name
    showIsTyping = () => {
        this.socket.emit('typing', this.state.name, this.state.roomName)
    }

    chatSide = (name) => {
        if(this.state.name === name){
            return true
        }
        else{
            return false
        }
    }

    render(){
        var roomCreateUI = (
            <div className='container-fluid'>
                <Form onSubmit = {(e) => this.startChat(e)}>
                    <FormGroup>
                        Room name :
                        <Input type='text' name='roomName' 
                            value={this.state.roomName} 
                            onChange = {(e) => this.handleNameChange(e)}
                            autoComplete='off'
                        >    
                        </Input>
                    </FormGroup>
                    <FormGroup>
                        Password :
                        <Input type='password' name='password' 
                        value={this.state.password} onChange = {(e) => this.handlePasswordChange(e)}></Input>
                    </FormGroup>
                    <FormGroup>
                        <Button type='submit' outline color='success'>Submit</Button>
                    </FormGroup>
                </Form>
            </div>
        );

        var chatUI = (
            <div id="mario-chat">
                <h2>{this.state.roomName} Chat</h2>
                <div id="chat-window">
                    <div id="output">
                    {
                        this.state.chat &&
                        this.state.chat.map((chat, index) => {
                            return(
                                this.chatSide(chat.name) ?
                                    <div className='row ml-3 mb-1' key={index}>
                                        You : {chat.message}
                                    </div>
                                :
                                    <div className='row ml-3 mb-1' key={index}>
                                        {chat.name} : {chat.message}
                                    </div>
                            );
                        })
                    }
                    </div>
                    {
                        this.state.typeName &&
                        <div id="feedback" className = 'ml-3'>
                            <i>{this.state.typeName} is typing a message...</i>
                        </div>
                    }
                </div>
                <form onSubmit={e => this.sendChat(e)}>
                    <input id="handle" type="text" name = 'name' 
                        placeholder="Handle" value={this.state.name} 
                        onChange={(e) => this.handleName(e)} 
                        autoComplete = "off"
                    />
                    <input id="message" type="text" name = 'message' 
                        placeholder="Message" value={this.state.message} 
                        onChange = {e => this.handleMessage(e)}
                        onKeyPress = {this.showIsTyping}
                        autoComplete = "off"
                    />
                    <button id="send" type='submit' >Send</button>
                </form>
            </div>
        );
        
        return(
            this.state.valid ?
            chatUI
            :
            roomCreateUI
        );
    }
}

export default Main;