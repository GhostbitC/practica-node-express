//Metodo para validar si el usuario esta logeado o no
//Dependiendo de esto podrá entrar a ciertas vistas
module.exports = {

    isLoggedIn(req, res, next){
        if(req.isAuthenticated()){

            return next();
        }

        return res.redirect('/signin');
    },

    isNotLoggedIn(req, res, next){
        if(!req.isAuthenticated()){

            return next();
        }

        return res.redirect('/profile');
    }

}