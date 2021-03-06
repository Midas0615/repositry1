const { User }          = require('../models');
const authService       = require('../services/auth.service');
const { to, ReE, ReS }  = require('../services/util.service');
const db            = require('../models');
const Op = db.sequelize.Op;

const create = async function(req, res){
    const body = req.body;

    if(!body.unique_key && !body.email && !body.phone){
        return ReE(res, 'Please enter an email to register.', 422);
    } else{
        let err, user;

        [err, user] = await to(authService.createUser(body));

        if(err) return ReE(res, err, 422);
        return ReS(res, {message:'Successfully created new user.', user:user.toWeb(), token:user.getJWT()}, 201);
    }
}
module.exports.create = create;

const get = async function(req, res){
    let user = req.user;

    return ReS(res, {user:user.toWeb()});
}
module.exports.get = get;

const getAll = async function(req, res){
    let err, users;  
    [err, users] = await to(User.findAll({where: {role: {[Op.ne]: 1}}}));
    return ReS(res, {data:users});
}
module.exports.getAll = getAll;

const update = async function(req, res){
    let email = req.body.email;
    [err, user] = await to(User.findOne({where: {email: email}}));

    if(!user){
        err = 'The email address doesn\'t exist';
        return ReE(res, err, 422);
    }

    user.set(req.body);
    [err, user] = await to(user.save());
    if(err) return ReE(res, err, 422);
    return ReS(res, {message :'Updated User: '+user.email});
}
module.exports.update = update;

const remove = async function(req, res){
    let email = req.body.email;
    [err, user] = await to(User.findOne({where: {email: email}}));

    if(!user){
        err = 'The email address doesn\'t exist';
        return ReE(res, err, 422);
    }

    [err, user] = await to(user.destroy());
    if(err) return ReE(res, 'error occured trying to delete user', 422);

    return ReS(res, {message:'Deleted User'});
}
module.exports.remove = remove;


const login = async function(req, res){   
    let err, user;

    [err, user] = await to(authService.authUser(req.body));
    if(err) return ReE(res, err, 422);

    return ReS(res, {token:user.getJWT(), user:user.toWeb()});
}
module.exports.login = login;