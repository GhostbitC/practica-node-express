const express = require('express');
const router = express.Router();

//Conexion a la bd
const pool = require('../database');

//Para borrar las imagenes al momento de borrar objetos en la BD
const fs = require('fs');

//Para validar si el usuario esta logeado
const {isLoggedIn} = require('../lib/auth');
const path = require('path');

router.get('/add', isLoggedIn, (req, res) => {
    res.render('links/add');
});

//Recibe los datos del formulario
router.post('/add', isLoggedIn, async (req, res) => {

    const {title, url, description} = req.body;

    const newLink = {
        title,
        url, 
        description,
        image_name: req.file.filename,
        user_id: req.user.id
    };

    //Se insertan los datos en la BD, await es para procesar esta peticion al tiempo
    //debido a que se hace de manera asincrona
    await pool.query('INSERT INTO links set ?', [newLink]);
    req.flash('success', 'Link guardado exitosamente');
    res.redirect('/links');
});

router.get('/', isLoggedIn, async (req, res) => {

   const links = await pool.query('SELECT * FROM links WHERE user_id = ?', [req.user.id]);

   res.render('links/list', {links});

});

router.get('/delete/:id', isLoggedIn, async (req, res) =>{

    const {id} = req.params;
    const dirImagen = await pool.query('select image_name from links where id = ?', [id]);
    await pool.query('DELETE FROM links WHERE id = ?', [id]);

    try {
        
        fs.unlinkSync(path.join(__dirname, `../public/uploads/${dirImagen[0].image_name}`));
        //Imagen borrada
      } catch(err) {
        console.error(err)
      }

    req.flash('success', 'Enlace removido satisfactoriamente');
    res.redirect('/links'); 

});

router.get('/edit/:id', isLoggedIn, async (req, res) => {

    const {id} = req.params;
    const links = await pool.query('SELECT * FROM links WHERE id = ?', [id]);
    res.render('links/edit', {link: links[0]}); //En donde la posicion 0 es el objeto con los datos

});

router.post('/edit/:id', isLoggedIn, async (req, res) => {

    const {id} = req.params;
    const {title, description, url} = req.body;
    const newLink = {
        title,
        description,
        url
    };

    await pool.query('UPDATE links set ? WHERE id = ?', [newLink, id]);
    req.flash('success', 'Link actualizado satisfactoriamente');
    res.redirect('/links');

});

module.exports = router;