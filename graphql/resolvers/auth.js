const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./../../models/user');

module.exports = {
    createUser: async (args) => {
        try {
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const result = await user.save();
            return {...result._doc, password: null};
        } catch (err) {
            throw err;
        }
    },
    login: async ({ email, password }) => {
         try {
             const user = await User.findOne({ email });
             if(!user) {
                 throw new Error('User does not exits!');
             }
             const correct = await bcrypt.compare(password, user.password);
             if(!correct) {
                 throw new Error('Password is incorrect!');
             }
             const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_TOKEN, {
                 expiresIn: '1h'
             });
             return { userId: user.id, token: token, tokenExpiration: 1 };
         } catch (err) {
             throw err;
         }
    }
};