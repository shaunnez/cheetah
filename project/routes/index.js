/*********************************************************************************
                              REQUIREMENTS      
/********************************************************************************/
var fs = require('fs');

module.exports = function (server) {

    server.get("/test", function(req,res) {
        res.send("here");
    });
    fs.readdirSync(__dirname).forEach(function (file) {
        if (file == "index.js" || file.substr(file.lastIndexOf('.') + 1) !== 'js')
            return;
        var name = file.substr(0, file.indexOf('.'));
        require('./' + name)(server);
    });
}
