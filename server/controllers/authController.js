const jwt = require('jsonwebtoken');
const { MongoUser, MySQLUser } = require('../models/JWT');

exports.login = async (req, res) => {
  try {
    const { name, password } = req.body;
    
    // Buscar usuario en MongoDB
    const mongoUser = await MongoUser.findOne({ name: name });
    if (!mongoUser) {
      return res.status(404).send({ message: "Usuario no encontrado." });
    }

    const passwordIsValid = await mongoUser.comparePassword(password)
    if (!passwordIsValid) {
      return res.status(401).send({ message: "Contraseña inválida!" });
    }

    // Si la autenticación es exitosa, buscar el usuario correspondiente en MySQL
    const mySQLUser = await MySQLUser.findOne({ where: { mongo_id: mongoUser._id.toString() } });

    const token = jwt.sign({ id: mongoUser._id}, process.env.PASSPORD_SECRET, { expiresIn: process.env.TIME_EXPIRATION });
    const time = parseInt(process.env.TIME_EXPIRATION, 10) * 1000
    res.cookie('Token', token, { maxAge: time });

    res.status(200).send({
      id: mongoUser._id,
      sqlId: mySQLUser ? mySQLUser.cc : null,
      name: mongoUser.name,
      accessToken: token
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, password } = req.body;

    // Verifica si el nombre o la contraseña están vacíos
    if (!name || !password) {
      return res.status(400).json({ message: 'Nombre y contraseña son requeridos.' });
    }

    // Crear usuario en MongoDB con campos opcionales
    const mongoUser = new MongoUser({
      name,
      password,
    });

    await mongoUser.save();

    // Crear usuario en MySQL
    const mySQLUser = await MySQLUser.create({
      mongo_id: mongoUser._id.toString(),
      name,
      password // Será hasheado por el hook beforeCreate
    });

    res.status(201).json({ message: 'Usuario creado con éxito en MongoDB y MySQL', mongoUser, mySQLUser });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ message: 'Error al crear el usuario' });
  }
};    