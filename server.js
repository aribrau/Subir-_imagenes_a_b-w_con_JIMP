//importamos los módulos que usaremos en nuestro proyecto
const express = require('express');
const yargs = require('yargs');
const Jimp = require('jimp');
const fs = require('fs');
//definimos el puerto
const port = 2023;

//captura los argumentos de la línea de comandos para asegurarnos que se ingresó la clave correcta que se necesita para iniciar el servidor
const argv = yargs
    .option('key', {
    describe: 'Clave de acceso al servidor',
    demandOption: true,
    type: 'string'
    }).argv;
//si la clave es para iniciar el servidor es incorrecta, nos devuelve el mensaje de error
if (argv.key !== '123') {
    console.log('No dijiste la palabra mágica, clave incorrecta. No se puede iniciar el servidor sin la palabra mágica.');
    process.exit(1);
}

//definimos const app es igual al módulo express
const app = express();

//middleware express.urlencoder analiza los datos enviados a través del formulario HTML
app.use(express.urlencoded({ extended: true }));
// con esto configuramos express para que sirva archivos estáticos desde el directorio
app.use(express.static(__dirname + '/public'));

//definimos la ruta para leer nuestro html y los archivos que son enviados a través de el (data)
app.get('/', (req, res) => {
    fs.readFile(__dirname + '/views/index.html', 'utf8', (err, data) => {
        if (err) {
            console.log('Error al leer el archivo HTML:', err);
            res.send('Error al leer el archivo HTML.');
        } else {
        res.send(data);
        }
    });
});

//definimos la ruta para procesar la imagen enviada en el formulario
app.post('/process', async (req, res) => {
    //con esto conseguimos la url de la imagen
    const imageUrl = req.body.imageUrl;
    try {
        //usamos Jimp para procesar la imagen
        const image = await Jimp.read(imageUrl);
        image
        .greyscale()
        .quality(60)
        .resize(350, Jimp.AUTO);
        //una vez procesada, generamos un nombre y la guardamos en la ruta dada
        const fileName = `newImg_${Date.now()}.jpg`; // Genera un nombre único para el archivo
        const filePath = `public/assets/img/${fileName}`;
        //guardamos la imagen en nuestra carpeta public/assets/img
        image.write(filePath, () => {
            console.log('Imagen guardada correctamente.');
            res.sendFile(__dirname + '/' + filePath);
        });
        } catch (error) {
            //catcheamos por si hay algun error al procesar la imagen
            console.log('Error al procesar la imagen:', error);
            res.send('Error al procesar la imagen.');
        }
});

app.listen(port, () => {
    console.log(`Server iniciado exitosa y fantásticamente en el puerto ${port}`);
});

