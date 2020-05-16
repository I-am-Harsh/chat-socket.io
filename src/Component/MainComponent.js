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

        }
    }

    componentDidMount(){
        // make connection
        this.socket = io.connect('localhost:9000')

        // check status
        this.socket.on('connected', (message, id) => {
            console.log("Status : ", message, id);
        })

        // if room already exists
        this.socket.on('matched', (message) => {
            if(message === true){
                // alert('you are logged in');
                
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

        this.socket.on('joined', message => {
            console.log(message)
        })

        // handle new chat info

        this.socket.on('receiveChat', message => {
            console.log("Chat",message);
            var chatNew = [...this.state.chat]
            chatNew.push(message);
            this.setState({
                chat : chatNew
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
        // send message to server
        this.socket.emit('msg', data, this.state.roomName)
    }

    handleName = (e) => {
        this.setState({
            [e.target.name] : e.target.value
        })
    }

    handleMessage = (e) => {
        this.setState({
            [e.target.name] : e.target.value
        })
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
                        <Input type='text' name='roomName' value={this.state.roomName} onChange = {(e) => this.handleNameChange(e)}></Input>
                    </FormGroup>
                    <FormGroup>
                        Password :
                        <Input type='text' name='password' value={this.state.password} onChange = {(e) => this.handlePasswordChange(e)}></Input>
                    </FormGroup>
                    <FormGroup>
                        <Button type='submit' outline color='success'>Submit</Button>
                    </FormGroup>
                </Form>
            </div>
        );

        var chatUI = (
            <div className='container-fluid'>
                {
                    this.state.chat &&
                    this.state.chat.map((chat, index) => {
                        return(
                            this.chatSide(chat.name) ?
                            <div className='mb-1' key = {index} style={{textAlign : "right", backgroundColor : "green"}}>
                                {chat.name} : {chat.message}
                            </div>
                            :
                            <div className='mb-1' key = {index} style={{backgroundColor : "lightgreen"}}> 
                                {chat.name} : {chat.message}
                            </div>
                        );
                    })
                }
                <div style={{position = 'sticky'}}>
                    <Form onSubmit = {(e) => this.sendChat(e)}>
                        <FormGroup>
                            Name :
                            <Input type='text' value={this.state.name} 
                                name='name' 
                                onChange = {(e) => this.handleName(e)} >    
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            Message :
                            <Input type='text' value = {this.state.message} 
                            name='message' 
                            onChange = {(e) => this.handleMessage(e)}
                            fullWidth = {true}>
                        </Input>
                        </FormGroup>
                        <FormGroup>
                            <Button type='submit' outline color='success'>Submit</Button>
                        </FormGroup>
                    </Form>
                </div>
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