var jwt = require('jwt-simple');
var secret = 'Ay8r_B-CWG7-wL61j4IoRl9O';

function authentication() {
}

authentication.prototype.getUserEmailAddress = function (id_token) {
    var decoded = jwt.decode(id_token, secret, true);
    console.log(decoded.email);
    return decoded.email;
}

module.exports = authentication;