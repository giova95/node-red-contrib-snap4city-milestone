module.exports = function(RED){

    function XSendEvent(config){
        RED.nodes.createNode(this, config);
        var node = this;
        var api_gateway;
        var access_token;

        node.on('input', function(msg){
            api_gateway = this.context().flow.get('api_gateway') || null;
            access_token = this.context().flow.get('access_token') || null;
            if(access_token == null){
                node.warn("Login to XProtect first!");
                return;
            }
            const resultMsg = {payload : null};
            let newmsg = {
                payload : msg.payload,
                guid: " " // insert here an actual valid Guid of your device
            };

            //function who send event and return result
            
            node.send(resultMsg); 
            return;
        });
        
        node.on('close', function(){

        });

    }

    RED.nodes.registerType("xsend-event",XSendEvent);
};