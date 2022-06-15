const express = require('express');
const morgan = require('morgan');
const {engine} = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session');
const passport = require('passport');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const {database} = require('./keys');

//Para renombrar las imagenes en multer con su nombre original y extension
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads'),
    filename: (req, file, cb) => {
        cb(null, uuidv4()+path.extname(file.originalname).toLowerCase());
    }
});

//inicializaciones
const app = express(); //para ejecutar express
require('./lib/passport');

//settings
app.set('views', path.join(__dirname, 'views'));
app.set('port', process.env.PORT || 4000); //Para que la app use el puerto 4000
app.engine('.hbs', engine({
    defaultLayout : 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

//Middlewares (Peticiones)
app.use(session({

    secret: 'ghostbitsession',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)

}));
app.use(flash());
app.use(morgan('dev')); //muestra las peticiones al servidor por consola
app.use(express.urlencoded({extended: false})); //Para aceptar tipos de datos sencillos
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(multer({ //Para subir imagenes
    storage,
    dest: path.join(__dirname, 'public/uploads'),
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname));
        if(mimetype && extname){
            return cb(null,true);
        }

        cb("Error: el archivo debe ser una imagen valida");
    }
}).single('image')); //Lo configuramos para que solo reciba una imagen del input con el nombre image

//Variables globales
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.success = req.flash('message');
    app.locals.user = req.user; //Con esto obtenemos el usuario logeado
    next();
});

//Rutas del servidor
app.use(require('./routes'));
app.use(require('./routes/authentication'));
app.use('/links', require('./routes/links'));

//Public
app.use(express.static(path.join(__dirname, 'public')));

//Iniciar el servidor
app.listen(app.get('port'), () =>{
    console.log('Server ejecutandose en el puerto', app.get('port'));
});