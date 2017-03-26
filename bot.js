'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

class CreditoFacil {
  constructor(options){
    if (!options || (options && (!options.accessToken || !options.verifyToken || !options.appSecret))) {
          throw new Error('You need to specify an accessToken, verifyToken and appSecret');
    }

    this.accessToken = options.accessToken;
    this.verifyToken = options.verifyToken;
    this.appSecret = options.appSecret;
    this.app = express()
    this.app.use(bodyParser.urlencoded({extended: false}))
		this.app.use(bodyParser.json())
    this._hearMap = [];
  }

  start(port) {
    this.app.set('port', (process.env.PORT || 5000))
    this.server = this.app.listen(this.app.get('port'), () => {
      const portNum = this.app.get('port');
      console.log('BootBot running on port', portNum);
      console.log(`Facebook Webhook running on localhost:${portNum}/webhook`);
    });
    this._initWebhook();
  }

  close() {
    this.server.close();
  }


  _initWebhook() {
    this.app.get('/webhook', (req, res) => {
      if (req.query['hub.verify_token'] === "exceptionbot2017") {
        console.log('Validation Succeded.')
        res.status(200).send(req.query['hub.challenge']);
      } else {
        console.error('Failed validation. Make sure the validation tokens match.');
        res.status(403);
      }
    });

    this.app.post('/webhook', (req, res) => {
      var data = req.body;
			  // Make sure this is a page subscription
			  if (data.object === 'page') {

			    // Iterate over each entry - there may be multiple if batched
			    data.entry.forEach((entry) => {
			      var pageID = entry.id;
			      var timeOfEvent = entry.time;

			      entry.messaging.forEach((event) => {
			        if (event.message) {
			          this._receivedMessage(event)
			        }else if(event.postback){
			          var postback = event.postback.payload.toLowerCase();
			          var clientId = event.sender.id;
			          this._processPostBack(postback,clientId)
			        }
			      });
			    });
			    res.status(200).end();
			  }else{
			  	console.log("No entro")
			  }
    });
  }


  _receivedMessage(event) {
	  var senderID = event.sender.id;
  	var recipientID = event.recipient.id;
  	var timeOfMessage = event.timestamp;
  	var message = event.message;

  	console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  	console.log(JSON.stringify(message));

  	var messageId = message.mid;
		var messageText = message.text;
		var messageAttachments = message.attachments;

		//console.log("attachements:",messageAttachments)

		this._sentInitialMessage(senderID)
  }


  _sentInitialMessage(recipientID){
  	var messageData = {
    recipient: {
      id: recipientID
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "What do you want to do next?",
          buttons: [
          	{
          		type: "postback",
          		title: "Undefined",
          		payload: "Show website"
          	},
          	{
          		type: "postback",
            	title: "Start Chatting",
            	payload: "elegir_credito"
          	}
          ]
        }
      }
    }
  };
  this._callSendAPI(messageData);
  }


  


	sendTextMessage(recipientId, messageText) {
	  var messageData = {
	    recipient: {
	      id: recipientId
	    },
	    message: {
	      text: messageText
	    }
	  };

	  this._callSendAPI(messageData);
	}


	_callSendAPI(messageData) {
	  request({
	    uri: 'https://graph.facebook.com/v2.6/me/messages',
	    qs: { access_token: "EAAaZAcPLq1N4BAEWks6BZB0ZAQzFM6M4ep73lIQdxTQWF9cwAj5bZCxPlM7V7HClpM2VhrJV1fIjBvWZCXgZBaImZCXKkLOGrCKTdq2VtQkI2hWFBMKo5fJ3ZBZBh3sL5V0QPOjQPaWWviZBjb8BKMTFodVv1b2Lyyos1Un9ZB2PMGIuQZDZD" },
	    method: 'POST',
	    json: messageData

	  }, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	      var recipientId = body.recipient_id;
	      var messageId = body.message_id;

	      console.log("Successfully sent generic message with id %s to recipient %s",
	        messageId, recipientId);
	    } else {
	      console.error("Unable to send message.");
	      console.error(response);
	      console.error(error);
	    }
	  });
	}
	
	_processPostBack(postBack, clientId){
	  switch (postBack) {
	    case 'elegir_credito':
	      console.log("Eligio la casilla de elegir credito:")
	      break;
	    
	    default:
	      this._sendErrorMessage(clientId)
	  }
	}
	
	
	_sendErrorMessage(clientId){
	  var messageData = {
	    recipient: {
	      id: clientId
	    },
	    message: {
	      text: "Lo sentimos no podemos procesar la informacion"
	    }
	  };

	  this._callSendAPI(messageData);
	}



}//End of the class

module.exports = CreditoFacil;
