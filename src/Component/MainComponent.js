import React, { Component } from 'react';
import io from 'socket.io-client';
// import logo from '../../public/logo512.png';

class Main extends Component {

    constructor(props) {
        super(props);
        // this.el = React.createRef();    
        this.state = {
            roomName: '',
            password: '',
            valid: false,
            name: "",
            message: '',
            chat: '',
            isTyping: false,
            typeName: ''
        }
    }

    componentDidMount() {
        // make connection
        this.socket = io.connect(process.env.REACT_APP_API || window.location.hostname);

        // if room already exists
        this.socket.on('matched', (message) => {
            if (message === true) {
                // change UI to chat
                this.setState({
                    valid: true
                })
            }
            else {
                alert('The room credentials do not match');
            }
        })

        // new room formed
        this.socket.on('newRoom', message => {
            if (message === true) {
                // change UI to chat
                this.setState({
                    valid: true
                })
            }
        })


        // handle new chat info
        this.socket.on('receiveChat', message => {
            var chatNew = [...this.state.chat]
            chatNew.push(message);
            this.setState({
                chat: chatNew
            })
            this.scrollToBottom();
        })

        // show UI change if a person types
        this.socket.on('isTyping', (name) => {
            this.setState({
                typeName: name
            })
        })

        // stop UI change if a person has stopped typing
        this.socket.on('typeStop', () => {
            this.setState({
                typeName: ''
            })
        })

        // when a new user joins
        this.socket.on('user joined', (userName) => {
            console.log("user joined");
            console.log(this.state.chat);
            var userJoin = [...this.state.chat];
            console.log(userName);
            var newJoin = {
                name: userName,
                message: 'joined'
            };
            userJoin.push(newJoin);
            this.setState({
                chat: userJoin
            })
        })
    }

    // scroll to bottom
    scrollToBottom = () => {
        this.myRef.scrollIntoView({ behavior: "smooth" });
    }

    handleNameChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handlePasswordChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    // room create area
    startChat = (event) => {
        console.log(this.state);
        event.preventDefault();
        var data = {
            name: this.state.roomName,
            password: this.state.password
        }

        // check creds from DB
        this.socket.emit('checkCreds', data, this.state.name);
    }

    // chat logic
    sendChat = (e) => {
        e.preventDefault();

        // create msg object
        var data = {
            name: this.state.name,
            message: this.state.message
        }
        this.setState({
            message: ''
        })
        // send message to server
        this.socket.emit('msg', data, this.state.roomName)
        this.socket.emit('stoppedTyping', this.state.roomName);
        if (this.state.valid) {
            console.log('scroll to bottom');
            this.scrollToBottom();
        }
    }

    // change name of the user
    handleName = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    // handle message type
    handleMessage = (e) => {
        if (e.target.value !== '') {
            this.socket.emit('typing', this.state.name, this.state.roomName)
            this.setState({
                [e.target.name]: e.target.value
            })
        }
        else {
            console.log('stopped typing')
            this.socket.emit('stoppedTyping', this.state.roomName);
            this.setState({
                [e.target.name]: e.target.value
            })
        }
    }

    // send typing to server with name
    showIsTyping = () => {
        this.socket.emit('typing', this.state.name, this.state.roomName)
    }

    chatSide = (name) => {
        if (this.state.name === name) {
            return true
        }
        else {
            return false
        }
    }
    // room - roomName
    // password - password
    // name - name handleName

    render() {
        var roomCreateUI = (
            <div class="container-login100" >
                <div class="wrap-login100 p-l-55 p-r-55 p-t-80 p-b-30">
                    <form class="login100-form validate-form" onSubmit = {this.startChat}>
                        <span class="login100-form-title p-b-37">
                            Create or Join a Room
                        </span>

                        <div class="wrap-input100 validate-input m-b-20" data-validate="Enter username or email">
                            <input class="input100" type="text" 
                                name="roomName" 
                                placeholder="Enter Room Name" 
                                required 
                                value = {this.state.roomName}
                                onChange = {(e) => this.handleNameChange(e)}
                            />
                            <span class="focus-input100"></span>
                        </div>

                        <div class="wrap-input100 validate-input m-b-25" data-validate="Enter password">
                            <input class="input100" 
                                type="password" 
                                name="password" 
                                placeholder="Password" 
                                required 
                                value = {this.state.password}
                                onChange = {(e) => this.handlePasswordChange(e)}
                            />
                            <span class="focus-input100"></span>
                        </div>

                        <div class="wrap-input100 validate-input m-b-25" data-validate="Enter password">
                            <input class="input100" 
                                type="text" 
                                name="name" 
                                placeholder="Nickname" 
                                required 
                                value = {this.state.name}
                                onChange = {(e) => this.handleName(e)}
                            />
                            <span class="focus-input100"></span>
                        </div>

                        <p class="ml-2 mb-5">
                            You can change it anytime.
					    </p>

                        <div class="container-login100-form-btn">
                            <button class="login100-form-btn" type='submit'>
                                Sign In
						    </button>
                        </div>
                    </form>
                </div>
            </div>
        );

        var chatUI = (
            <div id="mario-chat">
                <h2>{this.state.roomName} Chat</h2>
                <div id="chat-window">
                    <div className="output">
                        {
                            this.state.chat &&
                            this.state.chat.map((chat, index) => {
                                return (
                                    this.chatSide(chat.name) ?
                                        <div className='row ml-3 mb-1' key={index}>
                                            You : {chat.message}
                                        </div>
                                        :
                                        <div className='row ml-3 mb-1' key={index}>
                                            <i>{chat.name}</i> : {chat.message}
                                        </div>
                                );
                            })
                        }
                    </div>
                    {
                        this.state.typeName &&
                        <div id="feedback" className='ml-3'>
                            <i>{this.state.typeName} is typing a message...</i>
                        </div>
                    }
                    <div style={{ float: "left", clear: "both" }}
                        ref={(ref) => this.myRef = ref} id='chat'>
                    </div>
                </div>
                <form onSubmit={e => this.sendChat(e)} className = 'formUI'>
                    <input id="handle" type="text" name='name'
                        className='input100'
                        placeholder="NickName" value={this.state.name}
                        onChange={(e) => this.handleName(e)}
                        autoComplete="off"
                        style = {{background : "#D3D3D3", color : '#F5F5F5'}}
                    />
                    <input id="message" type="text" name='message'
                        className='input100'
                        placeholder="Message" value={this.state.message}
                        onChange={e => this.handleMessage(e)}
                        onKeyPress={this.showIsTyping}
                        autoComplete="off"
                        autoFocus
                        required
                        style = {{background : "#D3D3D3"}}
                    />

                    <button id="send" className='chat-button' type='submit' >Send</button>
                </form>
            </div>
        );

        return (
            this.state.valid ?
                chatUI
                :
                roomCreateUI
            // roomCreateUI
            // chatUI
        );
    }
}

export default Main;