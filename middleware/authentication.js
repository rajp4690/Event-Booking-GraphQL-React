const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if(authHeader) {
        const token = authHeader.split(' ')[1];
        if(token && token !== '') {
            try {
                const decodedToken = jwt.verify(token, process.env.JWT_TOKEN);
                if(decodedToken) {
                    req.isAuth = true;
                    req.userId = decodedToken.userId;
                    return next();
                }
            } catch (err) {
                req.isAuth = false;
                return next();
            }
        }
    }
    req.isAuth = false;
    next();
};