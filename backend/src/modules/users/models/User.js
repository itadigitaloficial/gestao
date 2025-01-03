const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  senha: {
    type: String,
    required: true,
    select: false
  },
  cargo: {
    type: String,
    required: true
  },
  permissoes: [{
    type: String,
    enum: ['admin', 'gerente', 'desenvolvedor', 'visualizador']
  }],
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  this.senha = await bcrypt.hash(this.senha, 8);
  next();
});

module.exports = mongoose.model('User', UserSchema); 