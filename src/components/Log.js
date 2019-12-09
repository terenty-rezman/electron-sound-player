import React, {useState, useEffect, useRef} from 'react'
import './Log.css'

import { Alert } from 'antd'

class ConsoleInterceptor {
    constructor() {
        this.old_log = console.log;
        this.callback = null;
        console.log = this.onLog.bind(this);
    }

    subscribe(callback) {
        this.callback = callback;
    }

    unsubscribe() {
        this.callback = null;
    }

    onLog () {
        const msg = Array.prototype.join.call(arguments);
        if(this.callback) this.callback(msg);
        this.old_log(...arguments);
    }
}

const console_interceptor = new ConsoleInterceptor();

// auto scroll to bottom taken from https://stackoverflow.com/questions/37620694/how-to-scroll-to-bottom-in-react

const Log = (props) => {
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({behavior: "smooth"});
    }

    useEffect(() => {
        
        const onMessage = (msg) => {
            setMessages(messages => messages.concat(msg));
        }

        console_interceptor.subscribe(onMessage);

        return () => {
            console_interceptor.unsubscribe();
        }
    });

    useEffect(scrollToBottom, [messages]);

    const items = messages.map( (message, index) => {
        if(message.includes('Error')) {
            return ([
                <Alert message={message} type="error" showIcon key={index}/>,
                <br />
            ])
        }
        else {
            return (
                <div key={index}>{message}</div>
            )
        }
    })

    return (
        <div {...props} >
            <div className=''>{items}</div>
            <div ref={messagesEndRef} />
        </div>
    )
}

export default Log;